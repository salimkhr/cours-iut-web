import React from "react";
import Code from "@/components/ui/Code";

const SAFE_URL_PREFIXES = ["http://", "https://", "/", "#", "mailto:"];

function isSafeUrl(url: string): boolean {
    const trimmed = url.trim();
    return SAFE_URL_PREFIXES.some((p) => trimmed.startsWith(p));
}

const WORD = /[\p{L}\p{N}]/u;

function isWord(ch: string | undefined): boolean {
    return ch !== undefined && WORD.test(ch);
}

function isSpace(ch: string | undefined): boolean {
    return ch === undefined || /\s/.test(ch);
}

/**
 * Marque les positions couvertes par un span de code (backticks inclus).
 *
 * CommonMark donne au code inline la priorité sur l'emphase : un délimiteur
 * situé dans un span de code ne peut ni ouvrir ni fermer un `**`/`_`. Sans ce
 * masque, « deux underscores (__) … `__construct` » ouvrait un gras sur `(__)`
 * qui allait le refermer au milieu du code, avalant la phrase et faisant
 * disparaître les underscores dont parlait justement le cours.
 */
function maskCodeSpans(text: string): Uint8Array {
    const mask = new Uint8Array(text.length);
    let i = 0;
    while (i < text.length) {
        if (text[i] === "`") {
            const end = text.indexOf("`", i + 1);
            if (end !== -1) {
                mask.fill(1, i, end + 1);
                i = end + 1;
                continue;
            }
        }
        i++;
    }
    return mask;
}

/**
 * Le marqueur en `i` peut-il ouvrir une emphase ?
 * Règle « left-flanking » : suivi d'un caractère non blanc. Pour `_`, on refuse
 * en plus l'intérieur d'un mot, sinon `snake_case` ou `__construct` passent en
 * italique/gras — courant dans un cours de programmation.
 */
function canOpen(text: string, i: number, len: number, underscore: boolean): boolean {
    if (isSpace(text[i + len])) return false;
    return !(underscore && isWord(text[i - 1]));
}

/** Symétrique de `canOpen` : « right-flanking ». */
function canClose(text: string, end: number, len: number, underscore: boolean): boolean {
    if (isSpace(text[end - 1])) return false;
    return !(underscore && isWord(text[end + len]));
}

/**
 * Cherche le délimiteur fermant correspondant, en sautant les spans de code et
 * les positions qui ne peuvent pas fermer. Renvoie -1 si l'emphase n'est pas
 * fermée : le marqueur est alors rendu tel quel.
 */
function findClosing(
    text: string,
    mask: Uint8Array,
    marker: string,
    from: number,
    underscore: boolean,
): number {
    let end = text.indexOf(marker, from);
    while (end !== -1) {
        if (!mask[end] && canClose(text, end, marker.length, underscore)) return end;
        end = text.indexOf(marker, end + 1);
    }
    return -1;
}

/**
 * Rend une chaîne avec markdown inline en ReactNode.
 * Syntaxe supportée :
 *  - **gras** / __gras__
 *  - _italique_ / *italique*
 *  - `code`
 *  - [label](url)
 *  - saut de ligne → <br/>
 *
 * Scope strict inline : pas de heading, liste, blockquote. Les marqueurs non
 * fermés sont rendus tels quels. Les schémas d'URL non sûrs (javascript:, etc.)
 * font tomber le lien en texte brut.
 */
export function renderInline(text: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    const mask = maskCodeSpans(text);
    let buf = "";
    let i = 0;
    let key = 0;

    // Les retours ligne saisis dans un bloc (une consigne de TP qui énumère
    // plusieurs variables, par exemple) étaient écrasés par le HTML et
    // fusionnaient en un pavé illisible.
    const flush = () => {
        if (!buf) return;
        const lines = buf.split("\n");
        lines.forEach((line, n) => {
            if (n > 0) out.push(<br key={key++} />);
            if (line) out.push(line);
        });
        buf = "";
    };

    while (i < text.length) {
        const ch = text[i];

        if (ch === "`") {
            const end = text.indexOf("`", i + 1);
            if (end !== -1) {
                flush();
                out.push(<Code key={key++}>{text.slice(i + 1, end)}</Code>);
                i = end + 1;
                continue;
            }
        }

        if (ch === "[") {
            const labelEnd = text.indexOf("]", i + 1);
            if (labelEnd !== -1 && text[labelEnd + 1] === "(") {
                const urlEnd = text.indexOf(")", labelEnd + 2);
                if (urlEnd !== -1) {
                    const label = text.slice(i + 1, labelEnd);
                    const url = text.slice(labelEnd + 2, urlEnd);
                    if (isSafeUrl(url)) {
                        flush();
                        out.push(
                            <a key={key++} href={url}>
                                {renderInline(label)}
                            </a>
                        );
                        i = urlEnd + 1;
                        continue;
                    }
                }
            }
        }

        const marker = (ch === "*" || ch === "_")
            ? (text[i + 1] === ch ? ch + ch : ch)
            : null;

        if (marker) {
            const underscore = ch === "_";
            const len = marker.length;
            if (canOpen(text, i, len, underscore)) {
                const end = findClosing(text, mask, marker, i + len, underscore);
                if (end !== -1) {
                    flush();
                    const inner = renderInline(text.slice(i + len, end));
                    out.push(
                        len === 2
                            ? <strong key={key++}>{inner}</strong>
                            : <em key={key++}>{inner}</em>
                    );
                    i = end + len;
                    continue;
                }
            }
        }

        buf += ch;
        i++;
    }

    flush();
    return out;
}
