import React from "react";
import Code from "@/components/ui/Code";

const SAFE_URL_PREFIXES = ["http://", "https://", "/", "#", "mailto:"];

function isSafeUrl(url: string): boolean {
    const trimmed = url.trim();
    return SAFE_URL_PREFIXES.some((p) => trimmed.startsWith(p));
}

/**
 * Rend une chaîne avec markdown inline en ReactNode.
 * Syntaxe supportée :
 *  - **gras**
 *  - _italique_
 *  - `code`
 *  - [label](url)
 *
 * Scope strict inline : pas de heading, liste, blockquote. Les marqueurs non
 * fermés sont rendus tels quels. Les schémas d'URL non sûrs (javascript:, etc.)
 * font tomber le lien en texte brut.
 */
export function renderInline(text: string): React.ReactNode[] {
    const out: React.ReactNode[] = [];
    let buf = "";
    let i = 0;
    let key = 0;

    const flush = () => {
        if (buf) {
            out.push(buf);
            buf = "";
        }
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

        if (ch === "*" && text[i + 1] === "*") {
            const end = text.indexOf("**", i + 2);
            if (end !== -1) {
                flush();
                out.push(<strong key={key++}>{renderInline(text.slice(i + 2, end))}</strong>);
                i = end + 2;
                continue;
            }
        }

        if (ch === "_" && text[i + 1] === "_") {
            const end = text.indexOf("__", i + 2);
            if (end !== -1) {
                flush();
                out.push(<strong key={key++}>{renderInline(text.slice(i + 2, end))}</strong>);
                i = end + 2;
                continue;
            }
        }

        if (ch === "_") {
            const end = text.indexOf("_", i + 1);
            if (end !== -1) {
                flush();
                out.push(<em key={key++}>{renderInline(text.slice(i + 1, end))}</em>);
                i = end + 1;
                continue;
            }
        }

        if (ch === "*") {
            const end = text.indexOf("*", i + 1);
            if (end !== -1) {
                flush();
                out.push(<em key={key++}>{renderInline(text.slice(i + 1, end))}</em>);
                i = end + 1;
                continue;
            }
        }

        buf += ch;
        i++;
    }

    flush();
    return out;
}
