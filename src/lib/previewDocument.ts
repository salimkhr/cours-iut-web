import {normalizeLanguage} from "@/lib/syntaxHighlighter";

/**
 * Langages qu'un navigateur exécute tel quel, en **noms canoniques Prism**.
 *
 * Attention : `normalizeLanguage("html")` retourne `"markup"` (alias défini dans
 * syntaxHighlighter.ts). Écrire `"html"` ici rendrait tout bloc HTML non
 * exécutable et désactiverait silencieusement son aperçu.
 *
 * Sont volontairement absents : php, rust, sql, bash, json (aucun interpréteur
 * côté client) ainsi que typescript, jsx et tsx (transpilation requise).
 */
const RUNNABLE_LANGUAGES = new Set(["markup", "css", "javascript"]);

/** Vrai si le langage peut produire un rendu dans l'iframe d'aperçu. */
export function isRunnable(language: string | null | undefined): boolean {
    return RUNNABLE_LANGUAGES.has(normalizeLanguage(language));
}

export interface PreviewSources {
    language?: string | null;
    code?: string | null;
    secondaryLanguage?: string | null;
    secondaryCode?: string | null;
    preview?: string | null;
}

export interface PreviewDocument {
    /** Document complet destiné au `srcDoc` de l'iframe. */
    html: string;
    /** Vrai si un script doit s'exécuter — pilote l'attribut `sandbox`. */
    needsScripts: boolean;
    /** Vrai si l'étudiant peut modifier les panneaux de code. */
    editable: boolean;
}

const PREVIEW_TEXT_STYLE = "body { color: #221e18; background: #ffffff; }";

const CSS_DEMO_BODY = `<main id="contenu-principal" class="conteneur">
                <h1>Développement web</h1>
                <p class="introduction">Découvrez un exemple de contenu stylé avec CSS.</p>
                <section class="grille">
                    <article class="carte"><span class="badge">Nouveau</span><h2>HTML et CSS</h2><p>Structure et présentation d&apos;une page.</p></article>
                    <article class="carte"><h2>JavaScript</h2><p>Interactions dans le navigateur.</p></article>
                </section>
            </main>`;

const CSS_DEMO_HEADER = `<header class="navigation">
                <strong>Catalogue des formations</strong>
                <nav><a href="#">Accueil</a> <a href="#">Formations</a></nav>
            </header>`;

/**
 * Marqueurs d'injection posés dans le gabarit `preview`.
 * Deux syntaxes selon le contexte d'accueil : commentaire de bloc dans
 * `<style>` et `<script>`, commentaire HTML dans le corps du document.
 */
const EDIT_MARKER = /(?:\/\*\s*@edit:([a-z]+)\s*\*\/|<!--\s*@edit:([a-z]+)\s*-->)/gi;

/** Suffixe de marqueur → nom canonique Prism du langage attendu. */
const SUFFIX_TO_CANONICAL: Record<string, string> = {
    css: "css",
    html: "markup",
    js: "javascript",
};

/** Panneaux réellement renseignés, sous forme [langage, code]. */
function filledPanels(sources: PreviewSources): Array<[string | null | undefined, string]> {
    const panels: Array<[string | null | undefined, string | null | undefined]> = [
        [sources.language, sources.code],
        [sources.secondaryLanguage, sources.secondaryCode],
    ];

    return panels
        .filter((panel): panel is [string | null | undefined, string] => Boolean(panel[1]))
        .map(([language, code]) => [language, code]);
}

/** Regroupe les codes du bloc par langage canonique, dans l'ordre des panneaux. */
function groupSourcesByLanguage(sources: PreviewSources): Map<string, string[]> {
    const grouped = new Map<string, string[]>();

    const panels: Array<[string | null | undefined, string | null | undefined]> = [
        [sources.language, sources.code],
        [sources.secondaryLanguage, sources.secondaryCode],
    ];

    for (const [language, code] of panels) {
        if (!code) continue;
        const canonical = normalizeLanguage(language);
        const bucket = grouped.get(canonical) ?? [];
        bucket.push(code);
        grouped.set(canonical, bucket);
    }

    return grouped;
}

/** Vrai si le gabarit porte au moins un marqueur d'injection. */
function hasMarkers(template: string): boolean {
    EDIT_MARKER.lastIndex = 0;
    return EDIT_MARKER.test(template);
}

function injectIntoTemplate(template: string, sources: PreviewSources): string {
    const grouped = groupSourcesByLanguage(sources);

    return template.replace(EDIT_MARKER, (_match, blockSuffix, htmlSuffix) => {
        const suffix = String(blockSuffix ?? htmlSuffix).toLowerCase();
        const canonical = SUFFIX_TO_CANONICAL[suffix];
        if (!canonical) return "";
        return (grouped.get(canonical) ?? []).join("\n");
    });
}

/** Assemblage historique, conservé quand le gabarit ne porte aucun marqueur. */
function buildLegacyDocument(sources: PreviewSources): string {
    const code = String(sources.code ?? "");
    const language = String(sources.language ?? "html");
    const markup = sources.preview?.trim();

    if (language.trim().toLowerCase() === "css") {
        const body = markup || CSS_DEMO_BODY;
        const header = markup ? "" : CSS_DEMO_HEADER;
        return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${code}</style></head><body style="background: #ffffff !important;">
            ${header}
            ${body}
        </body></html>`;
    }

    if (markup) {
        if (/<html(?:\s|>)/i.test(markup)) return markup;
        return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${PREVIEW_TEXT_STYLE}</style></head><body>${markup}</body></html>`;
    }

    if (/<html(?:\s|>)/i.test(code)) {
        return code.replace(/<\/head>/i, `<style>${PREVIEW_TEXT_STYLE}</style></head>`);
    }

    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${PREVIEW_TEXT_STYLE}</style></head><body>${code}</body></html>`;
}

export function buildPreviewDocument(sources: PreviewSources): PreviewDocument {
    const template = sources.preview?.trim() ?? "";
    const html = hasMarkers(template)
        ? injectIntoTemplate(template, sources)
        : buildLegacyDocument(sources);

    const panels = filledPanels(sources);
    const showPreview = template.length > 0 && panels.some(([language]) => isRunnable(language));

    return {
        html,
        needsScripts: panels.some(([language]) => normalizeLanguage(language) === "javascript"),
        // Conjonctif : un seul langage non exécutable rend l'aperçu trompeur,
        // puisque ce langage resterait inerte quoi que l'étudiant modifie.
        editable: showPreview && panels.every(([language]) => isRunnable(language)),
    };
}
