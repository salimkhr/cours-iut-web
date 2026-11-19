import type {Block} from "@/types/CourseContent";

/**
 * Découpe l'énoncé pour l'écran étudiant en deux colonnes : le contexte et le code à gauche,
 * la question posée (textes après le dernier bloc de code) à droite, au-dessus des réponses.
 * Sans code, tout l'énoncé est la question : l'écran reste sur une colonne.
 */
export function splitStatement(blocks: Block[]): {context: Block[]; prompt: Block[]} {
    const lastCode = blocks.findLastIndex((block) => block.type === "code");
    if (lastCode === -1) return {context: [], prompt: blocks};
    return {context: blocks.slice(0, lastCode + 1), prompt: blocks.slice(lastCode + 1)};
}
