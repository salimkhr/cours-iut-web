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
