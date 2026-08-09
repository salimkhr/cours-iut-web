// src/lib/codeTheme.ts
// Thème de coloration syntaxique dérivé de la palette du projet.
//
// Les thèmes `oneLight` / `oneDark` de react-syntax-highlighter étaient importés
// tels quels : palette froide (bleu #4078f2 dominant) au milieu d'une interface
// chaude, et cinq familles de tokens sous le seuil WCAG AA en clair — jusqu'à
// 2.19:1 pour les numéros de ligne, sur le contenu le plus lu du site.
//
// Chaque couleur ci-dessous est mesurée contre le fond réellement peint par
// CodeCard : `bridge-50` #f7ebd9 en clair, #352418 en sombre. Le ratio indiqué
// en commentaire est le minimum garanti ; le seuil est 4.5:1 (texte 14 px).
//
// Le vert des chaînes est une addition assumée au système : aucune teinte de
// DESIGN.md ne joue ce rôle, et la convention verte des éditeurs aide un
// étudiant à retrouver ses repères entre le cours et son IDE.

import type { CSSProperties } from "react";

type PrismTheme = Record<string, CSSProperties>;

export const LIGHT = {
    base: "#221e18",       // brand-dark            14.1:1
    muted: "#74492b",      // bridge-600             6.2:1
    punctuation: "#5e3b22",// bridge-700             8.0:1
    keyword: "#8D2F09",    // brand-accent-dark      6.6:1
    property: "#3B3F7A",   // module-php             7.8:1
    string: "#285C27",     // vert (addition)        6.4:1
    fn: "#6B21A8",         // module-brainfuck       7.1:1
    number: "#A32F13",     // rouge assombri         5.7:1
    // Gouttière : repère secondaire, volontairement effacé derrière le code.
    // 0.65 d'opacité sur bridge-700 compose à ~3.2:1 sur bridge-50 — sous le
    // seuil AA du texte courant, choix assumé au même titre que les éditeurs
    // (VS Code, GitHub) qui traitent les numéros comme du chrome. On reste
    // très au-dessus du 2.2:1 illisible du thème d'origine.
    lineNumber: "#5e3b22",
    lineNumberOpacity: 0.65,
} as const;

export const DARK = {
    base: "#ecd4b3",       // bridge-100            10.5:1
    muted: "#c79a72",      //                        5.9:1
    punctuation: "#d9c0a0",//                        8.5:1
    keyword: "#FF8568",    // module-html-css-dark   6.3:1
    property: "#9198E5",   // module-php-dark        5.6:1
    string: "#8FD98A",     // vert (addition)        8.9:1
    fn: "#C07AF8",         // module-brainfuck-dark  5.3:1
    number: "#FFD93D",     // module-javascript-dark 10.9:1
    // ~3.4:1 sur #352418 — même parti pris qu'en clair.
    lineNumber: "#c79a72",
    lineNumberOpacity: 0.65,
} as const;

/** Construit un thème Prism complet à partir d'un jeu de 8 rôles. */
function buildTheme(c: typeof LIGHT | typeof DARK): PrismTheme {
    // `background: transparent` sur les deux conteneurs : le fond appartient à
    // CodeCard, qui le teinte déjà dans la palette. Les thèmes tiers y posaient
    // un #fafafa / #282c34 froid qui n'a rien à faire ici.
    const base: CSSProperties = {
        color: c.base,
        background: "transparent",
        fontFamily: "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
        textShadow: "none",
    };

    return {
        // Le `code` hérite du padding de son `pre` : lui en donner un le
        // décalerait une seconde fois.
        'code[class*="language-"]': { ...base, padding: 0 },
        // `padding` porté par le bloc, comme dans les thèmes Prism standard.
        // Sans lui, le code venait coller aux bords de la CodeCard.
        'pre[class*="language-"]': { ...base, padding: "1rem 1.15rem" },

        comment: { color: c.muted, fontStyle: "italic" },
        prolog: { color: c.muted },
        doctype: { color: c.muted },
        cdata: { color: c.muted },

        punctuation: { color: c.punctuation },
        operator: { color: c.punctuation },
        entity: { color: c.punctuation },
        url: { color: c.punctuation },

        tag: { color: c.keyword },
        keyword: { color: c.keyword },
        "at-rule": { color: c.keyword },
        atrule: { color: c.keyword },
        important: { color: c.keyword, fontWeight: "bold" },
        selector: { color: c.keyword },
        deleted: { color: c.keyword },

        "attr-name": { color: c.property },
        property: { color: c.property },
        variable: { color: c.property },
        symbol: { color: c.property },

        string: { color: c.string },
        char: { color: c.string },
        "attr-value": { color: c.string },
        inserted: { color: c.string },
        regex: { color: c.string },

        function: { color: c.fn },
        "class-name": { color: c.fn },
        builtin: { color: c.fn },

        number: { color: c.number },
        boolean: { color: c.number },
        constant: { color: c.number },

        namespace: { opacity: 0.8 },

        // react-syntax-highlighter lit cette clé pour la gouttière : sans elle,
        // les numéros retombent sur le gris du thème par défaut (2.2:1).
        linenumber: { color: c.lineNumber, opacity: c.lineNumberOpacity },
    };
}

export const CODE_PALETTE_LIGHT = LIGHT;
export const CODE_PALETTE_DARK = DARK;

export const courseCodeLight: PrismTheme = buildTheme(LIGHT);
export const courseCodeDark: PrismTheme = buildTheme(DARK);

/** Couleur des numéros de ligne, à passer en `lineNumberStyle`. Le gris de
 *  react-syntax-highlighter tombait à 2.2:1 en clair et 2.5:1 en sombre. */
export const lineNumberColor = { light: LIGHT.muted, dark: DARK.muted } as const;
