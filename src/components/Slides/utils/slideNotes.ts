import type { Block } from "@/types/CourseContent";

/**
 * Notes de présentateur de chaque slide, dans l'ordre — directement depuis les
 * props des blocs, pas depuis l'arbre React rendu.
 *
 * `extractSlideNotes` (désormais retiré) marchait l'arbre d'éléments React de
 * `SlideScreen` a la recherche d'un enfant direct de type `SlideNote` — mais
 * ses enfants sont tous des `SlideBlockItem` (qui ne deviennent `SlideNote`
 * qu'une fois RENDUS, pas dans l'arbre JSX statique), donc la note n'était
 * jamais trouvée. `slideSteps.ts`/`slideOrder.ts` lisent déjà les slides
 * depuis les props des blocs plutôt que depuis le rendu ; cette fonction fait
 * de même.
 */
export function computeSlideNotes(slides: Block[]): (string | null)[] {
    return slides.map((slide) => {
        const note = (slide.children ?? []).find((child) => child.type === "slide-note");
        const content = typeof note?.props.content === "string" ? note.props.content.trim() : "";
        return content || null;
    });
}
