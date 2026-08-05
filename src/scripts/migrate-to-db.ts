// src/scripts/migrate-to-db.ts
//
// Convertit les cours `.tsx` de `src/cours/` en documents `course_content`.
//
//   bun run migrate:db --dry-run          → n'écrit rien, liste les blocs
//   bun run migrate:db --module=javascript
//   bun run migrate:db --force            → écrase même le contenu édité depuis
//
// ATTENTION : le contenu vit maintenant dans le builder. Ce script est un
// import initial, pas une synchronisation — les `.tsx` sont figés et ne
// reflètent plus les corrections faites en base. Par défaut il laisse donc
// intact tout document modifié après sa migration, et sauvegarde la
// collection dans `backups/` avant d'écrire.
import { connectToDB as _connectToDB } from "@/lib/mongodb";
import { v4 as _uuidv4 } from "uuid";
import * as _babelParser from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as _cheerio from "cheerio";
import type { Element as DOMElement, AnyNode } from "domhandler";
import * as _fs from "fs";
import * as _path from "path";
import type { Block as _Block } from "@/types/CourseContent";
import { toSlideBlocks } from "@/lib/slideBlockMigration";
import { decodeHtmlEntities, stripHeadingPrefix, stripJsxSpacers } from "@/lib/contentCleanup";
import { pruneEmptyLeafChildren } from "@/lib/blockTreeUtils";
import { normalizeContentKey } from "@/lib/contentTypes";
import type { Db, ObjectId } from "mongodb";

// @babel/traverse et @babel/generator ont un bug ESM connu en Bun
// reason: used in Task 5 for parseFile
const _trav = (_traverse as unknown as { default: typeof _traverse }).default ?? _traverse;
const _gen = (_generate as unknown as { default: typeof _generate }).default ?? _generate;

// ── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const _DRY_RUN   = args.includes("--dry-run");
const _FORCE     = args.includes("--force");
const _MODULE_FILTER = args.find(a => a.startsWith("--module="))?.split("=")[1];
const _FILE_FILTER   = args.find(a => a.startsWith("--file="))?.split("=")[1];

// ── Sérialiseur inline (JSX → markdown) ─────────────────────────────────────

type CheerioAPI = ReturnType<typeof _cheerio.load>;

interface DataNodeWithText {
    type: "text";
    data: string;
}

// Décodeur partagé (src/lib/contentCleanup.ts). L'ancienne table locale ne
// couvrait que neuf entités nommées : les accents (`&#xe9;`), le dollar des
// template literals (`&#x24;`), les traits d'arborescence et les emojis
// restaient bruts jusque dans les blocs de code affichés aux étudiants.
const decodeEntities = decodeHtmlEntities;

export function serializeInline($: CheerioAPI, el: DOMElement): string {
    let result = "";
    const recurse = (node: AnyNode): void => {
        if (node.type === "text") {
            result += decodeEntities((node as DataNodeWithText).data ?? "");
        } else if (node.type === "tag") {
            const tag = (node as DOMElement).tagName;
            const $node = $(node);
            switch (tag) {
                case "strong": case "b":
                    result += "**"; $node.contents().each((_, c) => recurse(c as AnyNode)); result += "**"; break;
                case "em": case "i":
                    result += "_";  $node.contents().each((_, c) => recurse(c as AnyNode)); result += "_";  break;
                case "Code":
                    result += "`" + $node.text().trim() + "`"; break;
                // `Link` (next/link) est le lien réellement utilisé dans les
                // cours ; sans ce cas il tombait dans `default`, qui garde le
                // texte mais jette l'URL.
                case "a": case "Link":
                    result += "["; $node.contents().each((_, c) => recurse(c as AnyNode));
                    result += "](" + ($node.attr("href") ?? "") + ")"; break;
                default:
                    $node.contents().each((_, c) => recurse(c as AnyNode)); break;
            }
        }
    };
    $(el).contents().each((_, c) => recurse(c as AnyNode));
    // `{" "}` est une expression JSX qui *produit* une espace ; cheerio la voit
    // comme du texte brut et la recopiait telle quelle dans le contenu.
    return stripJsxSpacers(result).replace(/\s+/g, " ").trim();
}

export function deriveSlug(filePath: string): {
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
} {
    // normalise les séparateurs Windows
    const normalized = filePath.replace(/\\/g, "/");
    // src/cours/{moduleSlug}/{sectionSlug}/{Type}.tsx
    const match = normalized.match(/src\/cours\/([^/]+)\/([^/]+)\/(\w+)\.tsx$/);
    if (!match) throw new Error(`Chemin inattendu : ${filePath}`);
    const [, moduleSlug, sectionSlug, typeName] = match;
    // `normalizeContentKey` plutôt qu'une table locale : une divergence de
    // casse entre le script et le reste de l'app créerait un document que
    // personne d'autre ne sait retrouver.
    const contentType = normalizeContentKey(typeName);
    if (!contentType) throw new Error(`Type inconnu : ${typeName}`);
    return { moduleSlug, sectionSlug, contentType };
}

// ── Alias locaux pour les imports préfixés _  ──────────────────────────────
const cheerio = _cheerio;
type CheerioElement = DOMElement;
const uuidv4 = _uuidv4;
type Block = _Block;

// ── Éléments à ignorer complètement ────────────────────────────────────────
// `BaseCard` et `DemoBox` sont écartés sur décision explicite : le premier
// passe tout son contenu par des props JSX (`header={<Text/>}`) que cheerio
// voit comme des chaînes d'attribut, le second est une démo interactive sans
// équivalent statique. Les ressaisir au builder est plus sûr que de deviner.
const IGNORED_TAGS = new Set([
    "SectionCard", "CourseLinks", "SlideTitle", "BaseCard", "DemoBox",
]);

/** Diagramme de remplacement pour un `SlideDiagram` dont le graphe est une
 *  constante du fichier, hors de portée du convertisseur. Mermaid valide, donc
 *  la slide se rend — mais le texte dit sans ambiguïté qu'il faut le refaire. */
const DIAGRAMME_A_REFAIRE = [
    "graph LR",
    '    A["Diagramme à reprendre"] --> B["Étape 1"]',
    '    B --> C["Étape 2"]',
    '    C --> D["Résultat"]',
].join("\n");

/**
 * Valeur d'un attribut JSX. Le `replace(/[{}'"`]/g, "")` employé jusqu'ici
 * visait les délimiteurs `{"..."}` mais supprimait *toutes* les apostrophes,
 * y compris au milieu d'un mot : `title="A - Qu'est-ce qu'un événement ?"`
 * arrivait « A - Quest-ce quun événement ? » sur la slide.
 *
 * On ne retire donc que les délimiteurs qui entourent la valeur, puis on
 * décode les entités comme partout ailleurs.
 */
export function attrValue($el: ReturnType<CheerioAPI>, nom: string): string {
    let v = ($el.attr(nom) ?? "").trim();
    if (v.startsWith("{") && v.endsWith("}")) v = v.slice(1, -1).trim();
    const q = v[0];
    if ((q === '"' || q === "'" || q === "`") && v.endsWith(q) && v.length > 1) {
        v = v.slice(1, -1);
    }
    return decodeEntities(v).trim();
}

// ── Extraction du template literal dans un élément cheerio ─────────────────
function extractTemplateLiteral($: CheerioAPI, el: CheerioElement): string {
    const raw = $.html(el);
    const match = raw.match(/\{`([\s\S]*?)`\}/);
    // `$.html()` ré-encode le texte : un `-->` de Mermaid ressort en `--&gt;`,
    // une balise d'exemple en `&lt;div&gt;`. C'est de là que venaient les
    // milliers d'entités affichées telles quelles dans les blocs de code.
    // Le décodage se fait en un seul passage, donc un `&copy;` volontaire du
    // cours HTML (encodé ici en `&amp;copy;`) redevient `&copy;`, pas `©`.
    return match ? decodeEntities(match[1]).trim() : "";
}

/**
 * Balises tombées dans le `default` de `convertElement`, c'est-à-dire du
 * contenu jeté. Le script rapportait « ✓ 42 blocs » sans jamais dire ce qu'il
 * n'avait pas su lire — c'est ainsi que les tableaux vides sont passés
 * inaperçus. `parseFile` vide ce registre à chaque fichier et le remonte en
 * avertissement.
 */
const tagsIgnores = new Map<string, number>();

/** Diagrammes posés en remplacement faute de graphe littéral, remontés en
 *  avertissement pour qu'ils ne se fondent pas dans le contenu migré. */
let diagrammesRemplaces = 0;

// ── Convertit un seul élément cheerio → Block | null ───────────────────────
function convertElement($: CheerioAPI, el: CheerioElement): Block | null {
    if (el.type !== "tag") return null;
    const tag = el.tagName;
    const $el = $(el);

    if (IGNORED_TAGS.has(tag)) return null;

    switch (tag) {
        // Les balises brutes sont proscrites dans les cours (cf. CLAUDE.md §10)
        // mais le corpus en contient encore : les ignorer revenait à perdre le
        // paragraphe entier plutôt qu'à signaler la convention non respectée.
        case "Text": case "p":
            return { id: uuidv4(), type: "text", props: { content: serializeInline($, el) }, children: [] };

        case "CodeCard": {
            const language = attrValue($el, "language");
            const code = extractTemplateLiteral($, el);
            return { id: uuidv4(), type: "code", props: { language, code }, children: [] };
        }

        case "CodeWithPreviewCard": {
            const language = attrValue($el, "language");
            const $panel = $el.find("CodePanel").first();
            const code = extractTemplateLiteral($, $panel[0] as CheerioElement);
            return { id: uuidv4(), type: "code-with-preview", props: { language, code }, children: [] };
        }

        case "List": case "ul": case "ol": {
            const orderedAttr = $el.attr("ordered") ?? "";
            const ordered = tag === "ol" || orderedAttr === "{true}" || orderedAttr === "true";
            const children = $el.children("ListItem, li").toArray()
                .map(li => convertElement($, li as CheerioElement))
                .filter(Boolean) as Block[];
            return { id: uuidv4(), type: "list", props: { ordered }, children };
        }

        case "ListItem": case "li":
            return { id: uuidv4(), type: "list-item", props: { text: serializeInline($, el) }, children: [] };

        // `InputCard` : une carte titrée qui commente un extrait de code, sans
        // aperçu rendu. Douze d'entre elles portent le catalogue des champs de
        // formulaire du cours PHP ; elles disparaissaient entièrement.
        case "InputCard": {
            const code = extractTemplateLiteral($, el) || attrValue($el, "code");
            if (!code) break;
            const props: Record<string, unknown> = {
                title: attrValue($el, "title"),
                description: attrValue($el, "description"),
                language: attrValue($el, "language") || "html",
                code,
            };
            const filename = attrValue($el, "filename");
            if (filename) props.filename = filename;
            return { id: uuidv4(), type: "input-card", props, children: [] };
        }

        case "ImageCard": {
            const src   = attrValue($el, "src");
            const alt   = attrValue($el, "alt");
            const title = attrValue($el, "caption") || attrValue($el, "title");
            return { id: uuidv4(), type: "image-card", props: { src, alt, title }, children: [] };
        }

        case "DiagramCard": {
            const header = attrValue($el, "title") || attrValue($el, "header");
            const chart  = extractTemplateLiteral($, el);
            return { id: uuidv4(), type: "diagram", props: { header, chart }, children: [] };
        }

        // Deux défauts cumulés faisaient que les 18 tableaux du corpus
        // arrivaient vides en base :
        //  - `children("TableRow")` ne descendait pas dans les `<TableHeader>`
        //    et `<TableBody>` qui enveloppent les lignes dans tous les cours ;
        //  - les types `table-row` / `table-cell` produits n'existent nulle
        //    part — ni schéma, ni renderer. Le bloc `table` lit `props.headers`
        //    et `props.rows`.
        case "Table": {
            const rowEls = $el.find("TableRow").toArray() as CheerioElement[];
            let headers: string[] = [];
            const rows: string[][] = [];
            for (const row of rowEls) {
                const $row = $(row);
                const cells = $row.children("TableHead, TableCell").toArray()
                    .map(cell => serializeInline($, cell as CheerioElement));
                if (!cells.length) continue;
                // La ligne d'en-tête est celle faite de `TableHead`, où qu'elle
                // soit : on ne suppose pas qu'elle vient en premier.
                const estEntete = $row.children("TableHead").length > 0;
                if (estEntete && !headers.length) headers = cells;
                else rows.push(cells);
            }
            return { id: uuidv4(), type: "table", props: { headers, rows }, children: [] };
        }

        case "CoursePrerequisites": {
            const children = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            return { id: uuidv4(), type: "callout", props: { variant: "info" }, children };
        }

        // `<Alert>` de shadcn : sans ce cas, l'encadré entier disparaissait.
        // L'icône (`<Info/>`, `<AlertTriangle/>`) donne la variante, faute
        // d'attribut explicite dans les cours.
        case "Alert": {
            const icones = $el.children().toArray()
                .map(c => (c as CheerioElement).tagName ?? "").join(" ");
            const variant = /Triangle|Warning|Alert(?!Title|Description)/.test(icones)
                ? "warning"
                : /Lightbulb|Sparkles|Rocket/.test(icones) ? "tip" : "info";
            const $title = $el.find("AlertTitle").first();
            const title = $title.length ? serializeInline($, $title[0] as CheerioElement) : "";
            const $desc = $el.find("AlertDescription").first();
            const corps = ($desc.length ? $desc.children() : $el.children()).toArray() as CheerioElement[];
            const children = groupByHeadings(
                corps.filter(c => !["AlertTitle", "AlertDescription"].includes(c.tagName ?? "")),
                $,
            );
            const props: Record<string, unknown> = { variant };
            if (title) props.title = title;
            return { id: uuidv4(), type: "callout", props, children };
        }

        // Trois composants qui ont pourtant un bloc équivalent — ils tombaient
        // dans `default`, donc leur contenu disparaissait purement et
        // simplement du cours migré.
        case "DownloadCodeButton": {
            const language = attrValue($el, "language") || "html";
            const filename = attrValue($el, "filename") || "fichier.txt";
            return {
                id: uuidv4(), type: "download-file",
                props: { language, filename, code: extractTemplateLiteral($, el) },
                children: [],
            };
        }

        case "CourseReminder": {
            const children = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            return { id: uuidv4(), type: "callout", props: { variant: "reminder" }, children };
        }

        case "Image": {
            const src = attrValue($el, "src");
            const alt = attrValue($el, "alt");
            // Un `image-card` sans `src` fait lever une erreur à next/image :
            // mieux vaut perdre le bloc que casser la page.
            if (!src) break;
            return { id: uuidv4(), type: "image-card", props: { src, alt }, children: [] };
        }

        // `<SlideDiagram chart={mermaidString}/>` : le graphe est le plus
        // souvent une constante du fichier, hors de portée de cheerio. On pose
        // alors un diagramme de remplacement — la place du schéma reste visible
        // dans la slide, à reprendre au builder.
        case "SlideDiagram": {
            const chart = extractTemplateLiteral($, el);
            if (!chart) diagrammesRemplaces++;
            return {
                id: uuidv4(), type: "diagram",
                props: { header: "", chart: chart || DIAGRAMME_A_REFAIRE },
                children: [],
            };
        }

        case "SlideText":
            return { id: uuidv4(), type: "text", props: { content: serializeInline($, el) }, children: [] };

        case "SlideCode": {
            const language = attrValue($el, "language");
            const highlightRaw = attrValue($el, "highlight");
            const code = extractTemplateLiteral($, el);
            const props: Record<string, unknown> = { language, code };
            if (highlightRaw) props.highlight = highlightRaw;
            return { id: uuidv4(), type: "code", props, children: [] };
        }

        case "SlideList": {
            const children = $el.children("SlideListItem").toArray()
                .map(li => convertElement($, li as CheerioElement))
                .filter(Boolean) as Block[];
            return { id: uuidv4(), type: "list", props: { ordered: false }, children };
        }

        case "SlideListItem":
            return { id: uuidv4(), type: "list-item", props: { text: serializeInline($, el) }, children: [] };

        case "SlideNote": {
            // Passait par `$.html()` sans décoder : les notes du présentateur
            // étaient les dernières à garder des `&#xe9;` et des `&apos;` en
            // pleine lecture. `extractTemplateLiteral` fait les deux.
            const content = extractTemplateLiteral($, el) || serializeInline($, el);
            return { id: uuidv4(), type: "slide-note", props: { content }, children: [] };
        }

        default:
            break;
    }

    // Sortie unique pour le contenu non converti : les `break` ci-dessus
    // (balise reconnue mais inexploitable) y aboutissent aussi.
    tagsIgnores.set(tag, (tagsIgnores.get(tag) ?? 0) + 1);
    return null;
}

/**
 * `<Heading level={n}>` et les `<h2>`…`<h6>` bruts ouvrent tous une partie.
 * Les seconds sont proscrits par les conventions des cours, mais le corpus en
 * contient : les laisser de côté faisait disparaître le titre *et* replier son
 * contenu dans la partie précédente.
 */
const SELECTEUR_TITRE = "Heading, h1, h2, h3, h4, h5, h6";

/** Répartitions d'une rangée sur la grille de 12, limitées aux spans que
 *  `blockPropsSchemas.column` accepte. */
const SPAN_PAR_NOMBRE: Record<number, number> = { 2: 6, 3: 4, 4: 3 };

/**
 * Nombre de colonnes voulu par un `<Grid templateColumns={{md: "repeat(2, 1fr)"}}>`.
 * À défaut d'indication lisible, deux colonnes : c'est la seule valeur employée
 * dans le corpus, et la seule qui laisse un bloc de code respirer.
 */
function colonnesDeGrille($el: ReturnType<CheerioAPI>, nbEnfants: number): number {
    const brut = $el.attr("templateColumns") ?? "";
    const repeat = brut.match(/repeat\(\s*(\d+)/);
    if (repeat) return Math.max(1, parseInt(repeat[1], 10));
    // `HStack` n'a pas d'attribut : c'est une rangée, tous les enfants côte à côte.
    return $el.prop("tagName") === "HStack" ? nbEnfants : 2;
}

/**
 * Découpe des blocs en rangées de `parLigne` colonnes. Une rangée dont la
 * taille n'a pas de span autorisé est laissée à plat : mieux vaut des blocs
 * empilés qu'un `span` refusé par le schéma, qui rendrait le document entier
 * insauvegardable depuis le builder.
 */
function enRangees(blocs: Block[], parLigne: number): Block[] {
    if (parLigne <= 1 || blocs.length <= 1) return blocs;
    const sortie: Block[] = [];
    for (let d = 0; d < blocs.length; d += parLigne) {
        const rangee = blocs.slice(d, d + parLigne);
        const span = SPAN_PAR_NOMBRE[rangee.length];
        if (!span) { sortie.push(...rangee); continue; }
        sortie.push({
            id: uuidv4(), type: "columns", props: {},
            children: rangee.map(bloc => ({
                id: uuidv4(), type: "column", props: { span }, children: [bloc],
            })),
        });
    }
    return sortie;
}

function estTitre(tag: string): boolean {
    return tag === "Heading" || /^h[1-6]$/.test(tag);
}

function niveauTitre($el: ReturnType<CheerioAPI>, tag: string): number {
    if (tag !== "Heading") return parseInt(tag.slice(1), 10);
    return parseInt(($el.attr("level") ?? "2").replace(/[{}]/g, ""), 10);
}

// ── Algorithme de regroupement par heading ──────────────────────────────────
export function groupByHeadings(elements: CheerioElement[], $: CheerioAPI): Block[] {
    const blocks: Block[] = [];
    let i = 0;

    while (i < elements.length) {
        const el = elements[i];
        if (el.type !== "tag") { i++; continue; }
        const tag = el.tagName;
        const $el = $(el);

        if (tag === "section") {
            // La <section> JSX délimite un Heading level 2
            const $heading = $el.children(SELECTEUR_TITRE).first();
            const title = $heading.length ? serializeInline($, $heading[0] as CheerioElement) : "";
            // Tous les autres enfants (hors le premier Heading) → children
            const rest = $el.children().toArray().filter(c => c !== $heading[0]) as CheerioElement[];
            const children = groupByHeadings(rest, $);
            blocks.push({ id: uuidv4(), type: "section", props: { title: stripHeadingPrefix(title) }, children });
            i++;

        } else if (estTitre(tag)) {
            const level = niveauTitre($el, tag);
            const title = serializeInline($, el);
            // Collecte les frères suivants jusqu'au prochain heading de niveau ≤ level
            const childEls: CheerioElement[] = [];
            i++;
            while (i < elements.length) {
                const next = elements[i];
                const tagNext = next.type === "tag" ? (next as CheerioElement).tagName : "";
                if (estTitre(tagNext) && niveauTitre($(next), tagNext) <= level) break;
                childEls.push(elements[i]);
                i++;
            }
            const children = groupByHeadings(childEls, $);
            blocks.push({ id: uuidv4(), type: "section", props: { title: stripHeadingPrefix(title) }, children });

        } else if (tag === "article") {
            // Transparent wrapper
            const inner = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            blocks.push(...inner);
            i++;

        } else if (tag === "div" || tag === "SlidesScreen") {
            // Wrapper transparent — traverser les enfants directement
            const inner = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            blocks.push(...inner);
            i++;

        } else if (tag === "HStack" || tag === "Grid") {
            // Conteneurs de mise en page : le bloc `columns` les couvre, pas
            // besoin d'un type de plus. `columns` ne décrit qu'une rangée, donc
            // un `Grid` de 12 cartes en `repeat(2, 1fr)` donne six rangées de
            // deux — et non une rangée de douze colonnes illisibles.
            const inner = groupByHeadings($el.children().toArray() as CheerioElement[], $);
            blocks.push(...enRangees(inner, colonnesDeGrille($el, inner.length)));
            i++;

        } else if (tag === "InputExample") {
            // Composant local au cours HTML : un titre de niveau 4, une
            // description, puis un code avec aperçu. Trois blocs existants le
            // reproduisent exactement — inutile d'inventer un type.
            const code = extractTemplateLiteral($, el) || attrValue($el, "code");
            const description = attrValue($el, "description");
            const enfants: Block[] = [];
            if (description) enfants.push({ id: uuidv4(), type: "text", props: { content: description }, children: [] });
            if (code) enfants.push({ id: uuidv4(), type: "code-with-preview", props: { language: "html", code }, children: [] });
            if (enfants.length) {
                blocks.push({
                    id: uuidv4(), type: "section",
                    props: { title: stripHeadingPrefix(attrValue($el, "title")) },
                    children: enfants,
                });
            }
            i++;

        } else if (tag === "SlideScreen") {
            // Chaque slide = un bloc `slide` avec titre + enfants convertis dans
            // l'univers slide. La version précédente émettait un `slide-screen`
            // dont les enfants restaient des blocs de cours (`text`, `code`,
            // `list`) : le player ne sait pas les rendre et n'affichait que le
            // titre. Voir src/lib/slideBlockMigration.ts.
            const title = stripHeadingPrefix(attrValue($el, "title"));
            const innerEls = $el.children().toArray() as CheerioElement[];
            const children = toSlideBlocks(groupByHeadings(innerEls, $));
            blocks.push({ id: uuidv4(), type: "slide", props: { title }, children });
            i++;

        } else {
            const block = convertElement($, el);
            if (block) blocks.push(block);
            i++;
        }
    }

    return blocks;
}

// ── Point d'entrée : JSX string → Block[] ──────────────────────────────────
/**
 * Réécrit les attributs `nom={`…`}` en attributs quotés. Cheerio ne connaît
 * pas la syntaxe JSX : sur `code={`<input type="text"/>`}` il s'arrête au
 * premier espace et ne rend que « {`<input ». Tout le code d'une `InputCard`
 * y passait.
 *
 * L'échappement est repris tel quel par `attrValue`, dont le décodage en un
 * seul passage rend exactement la valeur d'origine.
 */
export function inlineTemplateAttributes(jsx: string): string {
    return jsx.replace(/(\w+)=\{`([\s\S]*?)`\}/g, (_whole, nom: string, valeur: string) => {
        const echappe = valeur
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
        return `${nom}="${echappe}"`;
    });
}

export function parseJSXString(jsxCode: string): Block[] {
    const $ = cheerio.load(inlineTemplateAttributes(jsxCode), { xmlMode: true });
    const root = $.root().children().toArray() as CheerioElement[];
    return groupByHeadings(root, $);
}

// ── Pipeline fichier → Babel → Block[] ─────────────────────────────────────
export function parseFile(filePath: string): { blocks: Block[]; warnings: string[] } {
    const warnings: string[] = [];
    tagsIgnores.clear();
    diagrammesRemplaces = 0;
    const source = _fs.readFileSync(filePath, "utf-8");

    let ast: ReturnType<typeof _babelParser.parse>;
    try {
        ast = _babelParser.parse(source, {
            sourceType: "module",
            plugins: ["typescript", "jsx"],
        });
    } catch (err) {
        throw new Error(`Babel parse error: ${(err as Error).message}`);
    }

    // Cherche le premier ReturnStatement avec un argument JSX
    // reason: @babel/traverse et @babel/generator n'ont pas de .d.ts — on caste en unknown
    let jsxNode: unknown = null;
    _trav(ast, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ReturnStatement(p: any) {
            const arg = p.node.argument;
            if (arg && (arg.type === "JSXElement" || arg.type === "JSXFragment")) {
                jsxNode = arg;
                p.stop();
            }
        },
    });

    if (!jsxNode) {
        warnings.push("Aucun JSX trouvé dans le return");
        return { blocks: [], warnings };
    }

    // Resérialise le nœud AST → string JSX
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genResult = _gen(jsxNode as any, { concise: true }) as { code: string };
    const jsxCode = genResult.code;
    const blocks = parseJSXString(jsxCode);

    if (tagsIgnores.size) {
        const liste = [...tagsIgnores.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([t, n]) => (n > 1 ? `${t}×${n}` : t))
            .join(", ");
        warnings.push(`balises non converties : ${liste}`);
    }
    if (diagrammesRemplaces) {
        warnings.push(`${diagrammesRemplaces} diagramme(s) de remplacement à reprendre`);
    }
    return { blocks, warnings };
}

export async function upsertContent(
    db: Db,
    slugs: { moduleSlug: string; sectionSlug: string; contentType: string },
    blocks: Block[],
): Promise<string> {
    const now = new Date();
    const filtre = {
        moduleSlug: slugs.moduleSlug,
        sectionSlug: slugs.sectionSlug,
        contentType: slugs.contentType,
    };
    // `pruneEmptyLeafChildren` : sans lui le script réécrit les `children: []`
    // sur des blocs qui n'acceptent pas d'enfants, ce qui fait échouer la
    // validation au premier enregistrement depuis le builder.
    // `$setOnInsert` sur `createdAt` : `findOneAndReplace` réécrivait la date
    // de création à chaque passage, effaçant l'âge réel du contenu.
    const result = await db.collection("course_content").findOneAndUpdate(
        filtre,
        {
            $set: { ...filtre, blocks: pruneEmptyLeafChildren(blocks), updatedAt: now },
            $setOnInsert: { createdAt: now, version: 1 },
        },
        { upsert: true, returnDocument: "after" },
    );
    return String((result as { _id: ObjectId } | null)?._id ?? "");
}

/**
 * Déclare le contenu dans `modules.sections[].contents[]`. L'`updateOne` avec
 * `arrayFilters` d'origine ne modifiait rien quand la section n'avait pas déjà
 * une entrée du bon type — et Mongo ne signale pas ce cas comme une erreur. Le
 * script affichait « ✓ » sur un contenu qu'aucune page ne pouvait atteindre :
 * trois documents du corpus étaient dans cet état.
 *
 * @returns `false` si la section elle-même est introuvable (le contenu reste
 *          orphelin, l'appelant doit le signaler).
 */
export async function updateContentRef(
    db: Db,
    slugs: { moduleSlug: string; sectionSlug: string; contentType: string },
    contentId: string,
): Promise<boolean> {
    const majDirecte = await db.collection("modules").updateOne(
        { path: slugs.moduleSlug, "sections.path": slugs.sectionSlug },
        {
            $set: {
                "sections.$.contents.$[ref].source": "db",
                "sections.$.contents.$[ref].contentId": contentId,
            },
        },
        { arrayFilters: [{ "ref.type": slugs.contentType }] },
    );
    if (majDirecte.modifiedCount > 0) return true;

    const ajout = await db.collection("modules").updateOne(
        {
            path: slugs.moduleSlug,
            sections: {
                $elemMatch: {
                    path: slugs.sectionSlug,
                    "contents.type": { $ne: slugs.contentType },
                },
            },
        },
        {
            // reason: `PushOperator<Document>` ne sait pas typer un chemin
            // positionnel ; même contournement que la route /api/admin/content.
            $push: {
                "sections.$.contents": {
                    type: slugs.contentType, source: "db", contentId,
                },
            } as never,
        },
    );
    if (ajout.modifiedCount > 0) return true;

    // Ni mise à jour ni ajout : soit la référence était déjà exacte (rien à
    // écrire), soit la section n'existe pas. On tranche en relisant.
    const existe = await db.collection("modules").countDocuments(
        { path: slugs.moduleSlug, "sections.path": slugs.sectionSlug },
        { limit: 1 },
    );
    return existe > 0;
}

export function getAllTSXFiles(dir: string): string[] {
    let results: string[] = [];
    for (const entry of _fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = _path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllTSXFiles(fullPath));
        } else if (entry.isFile() && entry.name.match(/^(Cours|TP|Examen|Slide)\.tsx$/)) {
            results.push(fullPath);
        }
    }
    return results;
}

async function main() {
    let files: string[];

    if (_FILE_FILTER) {
        files = [_FILE_FILTER];
    } else {
        files = getAllTSXFiles("src/cours");
        if (_MODULE_FILTER) {
            files = files.filter(f => f.replace(/\\/g, "/").includes(`/cours/${_MODULE_FILTER}/`));
        }
    }

    if (files.length === 0) {
        console.warn("⚠ Aucun fichier trouvé.");
        return;
    }

    console.log(`${_DRY_RUN ? "[DRY-RUN] " : ""}Migration de ${files.length} fichier(s)...\n`);

    let db: Db | null = null;
    if (!_DRY_RUN) db = await _connectToDB();

    // Le contenu vit désormais dans le builder, plus dans les `.tsx` : relancer
    // ce script écrase des heures d'édition sans rien demander. On sauvegarde
    // ce qu'on s'apprête à remplacer, et on laisse de côté ce qui a été édité
    // après sa migration, sauf `--force`.
    const dejaEdites = new Set<string>();
    if (db) {
        const cle = (d: { moduleSlug: string; sectionSlug: string; contentType: string }) =>
            `${d.moduleSlug}/${d.sectionSlug}/${d.contentType}`;
        const existants = await db.collection("course_content").find().toArray();

        if (existants.length) {
            const dir = _path.join(process.cwd(), "backups");
            _fs.mkdirSync(dir, { recursive: true });
            const fichier = _path.join(dir, `course-content-avant-migrate-to-db-${Date.now()}.json`);
            _fs.writeFileSync(fichier, JSON.stringify(existants, null, 2), "utf8");
            console.log(`Sauvegarde : ${fichier}\n`);
        }

        for (const d of existants) {
            const cree = d.createdAt ? new Date(d.createdAt).getTime() : 0;
            const modifie = d.updatedAt ? new Date(d.updatedAt).getTime() : 0;
            // Une minute de marge : la migration écrit les deux dates d'affilée.
            if (modifie - cree > 60_000) {
                dejaEdites.add(cle(d as unknown as { moduleSlug: string; sectionSlug: string; contentType: string }));
            }
        }
        if (dejaEdites.size && !_FORCE) {
            console.warn(
                `⚠  ${dejaEdites.size} contenu(s) modifié(s) depuis leur migration seront ignorés.\n` +
                `   Relancez avec --force pour les écraser malgré tout.\n`,
            );
        }
    }

    const stats = { ok: 0, warn: 0, error: 0, ignore: 0 };

    for (const filePath of files) {
        const rel = filePath.replace(/\\/g, "/").replace("src/cours/", "");
        let slugs: ReturnType<typeof deriveSlug>;
        try {
            slugs = deriveSlug(filePath);
        } catch {
            console.error(`✗  ${rel} — chemin non reconnu`);
            stats.error++; continue;
        }

        let blocks: Block[];
        let warnings: string[];
        try {
            ({ blocks, warnings } = parseFile(filePath));
        } catch (err) {
            console.error(`✗  ${rel} — ${(err as Error).message}`);
            stats.error++; continue;
        }

        if (_DRY_RUN) {
            const warnStr = warnings.length ? `  ⚠ ${warnings.join(", ")}` : "";
            console.log(`✓  ${rel}  →  ${blocks.length} blocs (dry-run)${warnStr}`);
            stats.ok++;
            continue;
        }

        const cle = `${slugs.moduleSlug}/${slugs.sectionSlug}/${slugs.contentType}`;
        if (dejaEdites.has(cle) && !_FORCE) {
            console.log(`⊘  ${rel} — édité depuis sa migration, laissé intact`);
            stats.ignore++;
            continue;
        }

        try {
            const contentId = await upsertContent(db!, slugs, blocks);
            const declare = await updateContentRef(db!, slugs, contentId);
            if (!declare) warnings.push("section absente de `modules` : contenu orphelin");
            const warnStr = warnings.length ? `  ⚠ ${warnings.join(", ")}` : "";
            console.log(`✓  ${rel}  →  ${blocks.length} blocs${warnStr}`);
            if (warnings.length) stats.warn++;
            else stats.ok++;
        } catch (err) {
            console.error(`✗  ${rel} — DB: ${(err as Error).message}`);
            stats.error++;
        }
    }

    console.log(
        `\nRésultat : ${stats.ok} ok — ${stats.warn} avertissements — ` +
        `${stats.ignore} ignorés — ${stats.error} erreurs`,
    );
    process.exit(stats.error > 0 ? 1 : 0);
}

if (import.meta.main) {
    main().catch(err => { console.error("Fatal:", err); process.exit(1); });
}
