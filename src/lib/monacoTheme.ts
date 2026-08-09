import type {editor} from "monaco-editor";
import {CODE_PALETTE_LIGHT, CODE_PALETTE_DARK} from "@/lib/codeTheme";

/**
 * Thème Monaco dérivé de `codeTheme.ts`.
 *
 * Les thèmes livrés avec Monaco reproduisent le défaut qui avait fait
 * abandonner One Light / One Dark côté Prism : contrastes sous 4.5:1 et bleu
 * froid proscrit par DESIGN.md. On dérive donc du thème maison pour que le
 * passage lecture → édition ne change pas les couleurs sous l'œil du lecteur.
 */
export const MONACO_THEME_LIGHT = "cours-iut-light";
export const MONACO_THEME_DARK = "cours-iut-dark";

/** Monaco attend des couleurs sans `#`. */
const hex = (color: string) => color.replace("#", "");

function buildTheme(
    palette: typeof CODE_PALETTE_LIGHT | typeof CODE_PALETTE_DARK,
    base: "vs" | "vs-dark",
    background: string,
): editor.IStandaloneThemeData {
    return {
        base,
        inherit: true,
        rules: [
            {token: "", foreground: hex(palette.base)},
            {token: "comment", foreground: hex(palette.muted), fontStyle: "italic"},
            {token: "delimiter", foreground: hex(palette.punctuation)},
            {token: "keyword", foreground: hex(palette.keyword)},
            {token: "tag", foreground: hex(palette.keyword)},
            {token: "attribute.name", foreground: hex(palette.property)},
            {token: "attribute.value", foreground: hex(palette.string)},
            {token: "string", foreground: hex(palette.string)},
            {token: "number", foreground: hex(palette.number)},
            {token: "type", foreground: hex(palette.fn)},
        ],
        colors: {
            "editor.background": background,
            "editor.foreground": palette.base,
            "editorLineNumber.foreground": palette.lineNumber,
        },
    };
}

export const courseMonacoLight = buildTheme(CODE_PALETTE_LIGHT, "vs", "#f7ebd9");
export const courseMonacoDark = buildTheme(CODE_PALETTE_DARK, "vs-dark", "#352418");
