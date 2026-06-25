export type InlineMarker = "bold" | "italic" | "code" | "link";

interface MarkerResult {
    text: string;
    selStart: number;
    selEnd: number;
}

const WRAP: Record<Exclude<InlineMarker, "link">, string> = {
    bold: "**",
    italic: "_",
    code: "`",
};

/**
 * Applique un marqueur markdown inline autour d'une sélection.
 * Retourne le nouveau texte + la sélection ajustée.
 */
export function applyInlineMarker(
    text: string,
    selStart: number,
    selEnd: number,
    marker: InlineMarker,
): MarkerResult {
    const before = text.slice(0, selStart);
    const sel = text.slice(selStart, selEnd);
    const after = text.slice(selEnd);

    if (marker === "link") {
        const label = sel || "texte";
        const next = `${before}[${label}](url)`;
        return { text: `${next}${after}`, selStart: next.length, selEnd: next.length };
    }

    const w = WRAP[marker];
    const next = `${before}${w}${sel}${w}${after}`;
    return {
        text: next,
        selStart: selStart + w.length,
        selEnd: selStart + w.length + sel.length,
    };
}
