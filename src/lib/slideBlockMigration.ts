// src/lib/slideBlockMigration.ts
// Conversion des blocs de cours vers l'univers slide.
//
// La migration .tsx → DB produisait des conteneurs `slide-screen` dont les
// enfants restaient des blocs de cours (`text`, `code`, `list`). Or le rendu
// d'une présentation ne connaît que les types `slide-*` : 120 écrans sur 131
// n'affichaient que leur titre, corps vide, côté étudiant.
//
// Le mapping est 1:1 et sans perte : chaque type cible accepte exactement les
// mêmes props que sa source (`content`, `code`/`language`/`highlight`,
// `ordered`, `text`).

import type { Block } from "@/types/CourseContent";

/** Équivalent slide de chaque type de bloc de cours. */
const COURSE_TO_SLIDE: Record<string, string> = {
    "slide-screen": "slide",
    "text": "slide-text",
    "code": "slide-code",
    "list": "slide-list",
    "list-item": "slide-list-item",
    "table": "slide-table",
    "image-card": "slide-image",
    "code-with-preview": "slide-code-with-preview",
};

/** Types déjà valides dans une slide : traversés sans être renommés. */
const ALREADY_SLIDE = new Set([
    "slide", "slide-text", "slide-code", "slide-list", "slide-list-item",
    "slide-note", "slide-table", "slide-image", "slide-code-with-preview",
    "slide-transition", "diagram", "columns", "column",
]);

/**
 * Convertit un arbre de blocs vers l'univers slide. Idempotent : un arbre déjà
 * converti en ressort inchangé.
 */
export function toSlideBlocks(blocks: Block[]): Block[] {
    return blocks.map((block) => {
        const target = COURSE_TO_SLIDE[block.type];
        const type = target ?? block.type;
        const children = block.children ? toSlideBlocks(block.children) : undefined;
        return children ? { ...block, type, children } : { ...block, type };
    });
}

/** Nombre de blocs qu'une conversion renommerait — 0 si l'arbre est déjà à jour. */
export function countConvertible(blocks: Block[]): number {
    let n = 0;
    const walk = (list: Block[]) => {
        for (const b of list) {
            if (COURSE_TO_SLIDE[b.type]) n++;
            if (b.children) walk(b.children);
        }
    };
    walk(blocks);
    return n;
}

/** Types rencontrés dans une présentation qu'aucun renderer de slide ne sait afficher. */
export function findUnrenderableTypes(blocks: Block[]): string[] {
    const found = new Set<string>();
    const walk = (list: Block[]) => {
        for (const b of list) {
            if (!ALREADY_SLIDE.has(b.type)) found.add(b.type);
            if (b.children) walk(b.children);
        }
    };
    walk(blocks);
    return [...found];
}
