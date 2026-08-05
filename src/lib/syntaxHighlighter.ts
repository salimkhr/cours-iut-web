import { PrismLight } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import brainfuck from "react-syntax-highlighter/dist/esm/languages/prism/brainfuck";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import twig from "react-syntax-highlighter/dist/esm/languages/prism/twig";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

/**
 * Point d'entrée unique de la coloration syntaxique.
 *
 * On utilise `PrismLight` (et non `Prism`) : l'export `Prism` embarque refractor
 * avec ses ~290 langages, soit plusieurs centaines de Ko dans le bundle client de
 * chaque page de cours. `PrismLight` n'embarque que les langages enregistrés ici.
 * Idem pour les thèmes : import direct du fichier plutôt que du barrel
 * `styles/prism` qui tire les ~200 thèmes.
 */
const LANGUAGE_MODULES = {
    bash,
    brainfuck,
    css,
    javascript,
    json,
    jsx,
    markup,
    php,
    sql,
    twig,
    typescript,
    yaml,
} as const;

for (const [name, definition] of Object.entries(LANGUAGE_MODULES)) {
    PrismLight.registerLanguage(name, definition);
}

export const REGISTERED_LANGUAGES: readonly string[] = Object.keys(LANGUAGE_MODULES);

/** Alias employés dans les contenus pédagogiques → nom canonique Prism. */
const ALIASES: Record<string, string> = {
    html: "markup",
    xml: "markup",
    js: "javascript",
    ts: "typescript",
    sh: "bash",
    shell: "bash",
    yml: "yaml",
};

/**
 * Ramène un langage saisi dans un cours vers un langage enregistré.
 * `language` peut être `null`/`undefined` : les blocs de contenu viennent de
 * MongoDB et n'ont pas toujours ce champ renseigné.
 * Tout ce qui n'est pas reconnu retombe sur "text" : c'est un sentinel reconnu
 * nativement par `react-syntax-highlighter`, qui court-circuite la coloration
 * au lieu de lever puis rattraper une exception pour un langage non enregistré.
 */
export function normalizeLanguage(language: string | null | undefined): string {
    const key = (language ?? "").trim().toLowerCase();
    if (!key) return "text";
    const canonical = ALIASES[key] ?? key;
    return REGISTERED_LANGUAGES.includes(canonical) ? canonical : "text";
}

/** Vrai si le langage est enregistré ou aliasé — donc réellement coloré. */
export function isKnownLanguage(language: string | null | undefined): boolean {
    const key = (language ?? "").trim().toLowerCase();
    if (!key) return false;
    return REGISTERED_LANGUAGES.includes(ALIASES[key] ?? key);
}

export { PrismLight as SyntaxHighlighter };
// Thèmes maison (src/lib/codeTheme.ts) : les thèmes One Light / One Dark
// importés jusqu'ici tombaient sous 4.5:1 sur cinq familles de tokens en clair
// et introduisaient un bleu froid interdit par DESIGN.md.
export { courseCodeDark, courseCodeLight, lineNumberColor } from "@/lib/codeTheme";
