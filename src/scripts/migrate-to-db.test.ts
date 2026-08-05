/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { deriveSlug, serializeInline, parseJSXString } from "./migrate-to-db";
import * as cheerio from "cheerio";
import type { Element as DOMElement } from "domhandler";

test("cours tsx", () => {
    expect(deriveSlug("src/cours/javascript/1-le-dom/Cours.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "1-le-dom",
        contentType: "cours",
    });
});

test("TP tsx", () => {
    expect(deriveSlug("src/cours/php/3-le-mvc/TP.tsx")).toEqual({
        moduleSlug: "php",
        sectionSlug: "3-le-mvc",
        contentType: "TP",
    });
});

test("Slide tsx", () => {
    expect(deriveSlug("src/cours/javascript/2-les-evenements/Slide.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "2-les-evenements",
        contentType: "slide",
    });
});

test("Examen tsx", () => {
    expect(deriveSlug("src/cours/javascript/6-examen/Examen.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "6-examen",
        contentType: "examen",
    });
});

function loadEl(html: string) {
    const $ = cheerio.load(html, { xmlMode: true });
    const cheerioEl = $.root().children().first();
    const el = cheerioEl[0] as DOMElement; // Cheerio wrapper contains raw DOMElement at index 0
    return { $, el };
}

test("serializeInline - texte brut", () => {
    const { $, el } = loadEl("<Text>Bonjour monde</Text>");
    expect(serializeInline($, el)).toBe("Bonjour monde");
});

test("serializeInline - strong + em", () => {
    const { $, el } = loadEl("<Text><strong>gras</strong> et <em>italique</em></Text>");
    expect(serializeInline($, el)).toBe("**gras** et _italique_");
});

test("serializeInline - Code inline", () => {
    const { $, el } = loadEl("<Text>voir <Code>document.getElementById</Code></Text>");
    expect(serializeInline($, el)).toBe("voir `document.getElementById`");
});

test("serializeInline - lien", () => {
    const { $, el } = loadEl(`<Text><a href="https://mdn.io">MDN</a></Text>`);
    expect(serializeInline($, el)).toBe("[MDN](https://mdn.io)");
});

test("serializeInline - entités HTML", () => {
    const { $, el } = loadEl("<Text>l&apos;élève &amp; le &quot;prof&quot;</Text>");
    expect(serializeInline($, el)).toBe("l'élève & le \"prof\"");
});

test("Text → text block", () => {
    const blocks = parseJSXString(`<article><Text>Hello monde</Text></article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
    expect(blocks[0].props.content).toBe("Hello monde");
    expect(typeof blocks[0].id).toBe("string");
});

test("section + Heading level 2 → section block avec children", () => {
    const blocks = parseJSXString(`
        <article>
            <section>
                <Heading level={2}>A-Introduction</Heading>
                <Text>Premier paragraphe</Text>
            </section>
        </article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("section");
    expect(blocks[0].props.title).toBe("A-Introduction");
    expect(blocks[0].children).toHaveLength(1);
    expect(blocks[0].children![0].type).toBe("text");
});

test("Heading level 3 imbriqué dans section", () => {
    const blocks = parseJSXString(`
        <article>
            <section>
                <Heading level={2}>A-Titre</Heading>
                <Heading level={3}>1. Sous-titre</Heading>
                <Text>Contenu</Text>
            </section>
        </article>`);
    expect(blocks[0].children).toHaveLength(1);
    expect(blocks[0].children![0].type).toBe("section");
    // Le renderer pose lui-même « A — » puis « 1. » selon la profondeur :
    // conserver le préfixe dans le titre l'affichait en double.
    expect(blocks[0].children![0].props.title).toBe("Sous-titre");
    // « A-Titre » sans espace n'est pas un préfixe : c'est la protection qui
    // épargne « E-commerce » ou « A/B testing ».
    expect(blocks[0].props.title).toBe("A-Titre");
});

test("CodeCard → code block", () => {
    const blocks = parseJSXString(`<article><CodeCard language="javascript">{\`const x = 1;\`}</CodeCard></article>`);
    expect(blocks[0].type).toBe("code");
    expect(blocks[0].props.language).toBe("javascript");
    expect(blocks[0].props.code).toBe("const x = 1;");
});

test("List ordered → list + list-item", () => {
    const blocks = parseJSXString(`
        <article>
            <List ordered={true}>
                <ListItem>Premier</ListItem>
                <ListItem>Deuxième</ListItem>
            </List>
        </article>`);
    expect(blocks[0].type).toBe("list");
    expect(blocks[0].props.ordered).toBe(true);
    expect(blocks[0].children).toHaveLength(2);
    expect(blocks[0].children![0].type).toBe("list-item");
    expect(blocks[0].children![0].props.text).toBe("Premier");
});

test("SectionCard → ignoré", () => {
    const blocks = parseJSXString(`<article><SectionCard title="X"/></article>`);
    expect(blocks).toHaveLength(0);
});

test("SlideScreen → slide, avec des enfants de l'univers slide", () => {
    const blocks = parseJSXString(`
        <div>
            <SlidesScreen>
                <SlideScreen title="Introduction">
                    <SlideText>Bonjour</SlideText>
                    <SlideList>
                        <SlideListItem>Point 1</SlideListItem>
                    </SlideList>
                </SlideScreen>
            </SlidesScreen>
        </div>`);
    expect(blocks).toHaveLength(1);
    // `slide-screen` + enfants de cours donnaient un écran vide au rendu :
    // le player ne connaît que les types `slide-*`.
    expect(blocks[0].type).toBe("slide");
    expect(blocks[0].props.title).toBe("Introduction");
    expect(blocks[0].children).toHaveLength(2);
    expect(blocks[0].children![0].type).toBe("slide-text");
    expect(blocks[0].children![1].type).toBe("slide-list");
    expect(blocks[0].children![1].children![0].type).toBe("slide-list-item");
});

test("SlideCode → code block avec highlight optionnel", () => {
    const blocks = parseJSXString(`<article><SlideCode language="javascript" highlight="1-3">{\`const x = 1;\`}</SlideCode></article>`);
    expect(blocks[0].type).toBe("code");
    expect(blocks[0].props.language).toBe("javascript");
    expect(blocks[0].props.highlight).toBe("1-3");
    expect(blocks[0].props.code).toBe("const x = 1;");
});

test("SlideNote → slide-note block", () => {
    const blocks = parseJSXString(`<article><SlideNote>{\`- Note 1\n- Note 2\`}</SlideNote></article>`);
    expect(blocks[0].type).toBe("slide-note");
    expect(typeof blocks[0].props.content).toBe("string");
    expect((blocks[0].props.content as string).includes("Note 1")).toBe(true);
});

// ── Tableaux ────────────────────────────────────────────────────────────────
// Les 18 tableaux du corpus étaient arrivés vides en base : les lignes sont
// enveloppées dans `<TableHeader>` / `<TableBody>`, que l'ancien
// `children("TableRow")` ne traversait pas, et les types `table-row` /
// `table-cell` produits n'ont ni schéma ni renderer.

test("Table : les lignes sont trouvées à travers TableHeader/TableBody", () => {
    const blocks = parseJSXString(`<article><Table>
        <TableHeader><TableRow><TableHead>Commande</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
        <TableBody>
            <TableRow><TableCell>+</TableCell><TableCell>Incrémente</TableCell></TableRow>
            <TableRow><TableCell>-</TableCell><TableCell>Décrémente</TableCell></TableRow>
        </TableBody>
    </Table></article>`);
    expect(blocks[0].type).toBe("table");
    expect(blocks[0].props.headers).toEqual(["Commande", "Description"]);
    expect(blocks[0].props.rows).toEqual([["+", "Incrémente"], ["-", "Décrémente"]]);
});

test("Table : pas d'enfants table-row/table-cell, aucun renderer ne les connaît", () => {
    const blocks = parseJSXString(`<article><Table><TableBody><TableRow><TableCell>a</TableCell></TableRow></TableBody></Table></article>`);
    expect(blocks[0].children).toEqual([]);
    expect(blocks[0].props.headers).toEqual([]);
    expect(blocks[0].props.rows).toEqual([["a"]]);
});

test("Table sans TableHeader : tout passe en lignes", () => {
    const blocks = parseJSXString(`<article><Table><TableRow><TableCell>seule</TableCell></TableRow></Table></article>`);
    expect(blocks[0].props.headers).toEqual([]);
    expect(blocks[0].props.rows).toEqual([["seule"]]);
});

// ── Liens et encadrés ───────────────────────────────────────────────────────

test("Link garde son URL, comme une balise a", () => {
    const blocks = parseJSXString(`<article><Text>Voir <Link href="https://mdn.io">la doc</Link> pour la suite.</Text></article>`);
    expect(blocks[0].props.content).toBe("Voir [la doc](https://mdn.io) pour la suite.");
});

test("Alert → callout, titre et contenu conservés", () => {
    const blocks = parseJSXString(`<article><Alert><Info/><AlertTitle>Note importante</AlertTitle><AlertDescription><Text>Lisez ceci.</Text></AlertDescription></Alert></article>`);
    expect(blocks[0].type).toBe("callout");
    expect(blocks[0].props.title).toBe("Note importante");
    expect(blocks[0].props.variant).toBe("info");
    expect(blocks[0].children![0].props.content).toBe("Lisez ceci.");
});

test("Alert avec icône d'avertissement → variante warning", () => {
    const blocks = parseJSXString(`<article><Alert><AlertTriangle/><AlertDescription><Text>Attention.</Text></AlertDescription></Alert></article>`);
    expect(blocks[0].props.variant).toBe("warning");
    expect(blocks[0].props.title).toBeUndefined();
});

// ── Composants qui avaient un bloc équivalent mais tombaient dans `default` ──

test("DownloadCodeButton → download-file avec son code", () => {
    const blocks = parseJSXString(`<article><DownloadCodeButton language="html" filename={"game.html"}>{\`<!DOCTYPE html>\`}</DownloadCodeButton></article>`);
    expect(blocks[0].type).toBe("download-file");
    expect(blocks[0].props.filename).toBe("game.html");
    expect(blocks[0].props.language).toBe("html");
    expect(blocks[0].props.code).toBe("<!DOCTYPE html>");
});

test("CourseReminder → callout variante reminder", () => {
    const blocks = parseJSXString(`<article><CourseReminder><Text>Rappel du cours.</Text></CourseReminder></article>`);
    expect(blocks[0].type).toBe("callout");
    expect(blocks[0].props.variant).toBe("reminder");
    expect(blocks[0].children![0].props.content).toBe("Rappel du cours.");
});

test("Image → image-card", () => {
    const blocks = parseJSXString(`<article><Image src="/media/schema.png" alt="Un schéma"/></article>`);
    expect(blocks[0].type).toBe("image-card");
    expect(blocks[0].props.src).toBe("/media/schema.png");
});

test("Image sans src est écartée : next/image lèverait une erreur", () => {
    expect(parseJSXString(`<article><Image alt="rien"/></article>`)).toEqual([]);
});

test("SlideDiagram littéral → diagram ; référence de variable écartée", () => {
    const litteral = parseJSXString(`<article><SlideDiagram>{\`graph TD; A-->B;\`}</SlideDiagram></article>`);
    expect(litteral[0].type).toBe("diagram");
    expect(litteral[0].props.chart).toBe("graph TD; A-->B;");
    // Le graphe vient d'une constante du fichier : mieux vaut un avertissement
    // qu'un bloc `diagram` vide qui casserait le rendu Mermaid.
    expect(parseJSXString(`<article><SlideDiagram chart={propagationDiagram}/></article>`)).toEqual([]);
});

test("le code extrait n'est pas ré-encodé par cheerio", () => {
    const blocks = parseJSXString(`<article><CodeCard language="html">{\`<div class="a">Café &amp; thé</div>\`}</CodeCard></article>`);
    expect(blocks[0].props.code).toBe(`<div class="a">Café & thé</div>`);
});

test("une entité montrée volontairement reste une entité", () => {
    // Le cours HTML enseigne les entités : `&copy;` doit rester lisible tel
    // quel dans l'exemple, sans être résolu en ©.
    const blocks = parseJSXString(`<article><CodeCard language="html">{\`<p>&amp;copy; 2026</p>\`}</CodeCard></article>`);
    expect(blocks[0].props.code).toBe("<p>&copy; 2026</p>");
});

test("SlideNote décode ses entités comme les autres blocs", () => {
    const blocks = parseJSXString(`<article><SlideNote>{\`Rappel : les &#xe9;v&#xe9;nements et l&apos;objet event.\`}</SlideNote></article>`);
    expect(blocks[0].props.content).toBe("Rappel : les événements et l'objet event.");
});

test("le titre d'une slide garde ses apostrophes et perd son préfixe", () => {
    const blocks = parseJSXString(`<article><SlideScreen title="A - Qu'est-ce qu'un événement ?"><SlideText>x</SlideText></SlideScreen></article>`);
    expect(blocks[0].props.title).toBe("Qu'est-ce qu'un événement ?");
});

test("les attributs ne perdent plus leurs apostrophes", () => {
    const blocks = parseJSXString(`<article><ImageCard src="/a.png" alt="L'écran d'accueil"/></article>`);
    expect(blocks[0].props.alt).toBe("L'écran d'accueil");
});

// ── Balises brutes du corpus (proscrites par les conventions, mais présentes) ─

test("p → text, ul/ol → list, li → list-item", () => {
    const blocks = parseJSXString(`<article><p>Un paragraphe.</p><ul><li>a</li><li>b</li></ul><ol><li>un</li></ol></article>`);
    expect(blocks.map(b => b.type)).toEqual(["text", "list", "list"]);
    expect(blocks[0].props.content).toBe("Un paragraphe.");
    expect(blocks[1].props.ordered).toBe(false);
    expect(blocks[1].children!.map(c => c.props.text)).toEqual(["a", "b"]);
    expect(blocks[2].props.ordered).toBe(true);
});

test("h2/h3 bruts ouvrent une partie, comme Heading", () => {
    const blocks = parseJSXString(`<article><h2>Grande partie</h2><p>intro</p><h3>Sous-partie</h3><p>détail</p></article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].props.title).toBe("Grande partie");
    expect(blocks[0].children![0].type).toBe("text");
    expect(blocks[0].children![1].props.title).toBe("Sous-partie");
});

test("un h2 brut dans une section en devient le titre", () => {
    const blocks = parseJSXString(`<article><section><h2>Titre de section</h2><p>corps</p></section></article>`);
    expect(blocks[0].type).toBe("section");
    expect(blocks[0].props.title).toBe("Titre de section");
    expect(blocks[0].children).toHaveLength(1);
});

test("HStack et Grid → columns avec des span équilibrés", () => {
    const blocks = parseJSXString(`<article><HStack><Text>gauche</Text><Text>droite</Text></HStack></article>`);
    expect(blocks[0].type).toBe("columns");
    expect(blocks[0].children!.map(c => c.props.span)).toEqual([6, 6]);
    expect(blocks[0].children![0].children![0].props.content).toBe("gauche");
});

test("Grid vide n'est pas converti en conteneur creux", () => {
    expect(parseJSXString(`<article><Grid/></article>`)).toEqual([]);
});
