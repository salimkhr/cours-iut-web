import type { Block } from "@/types/CourseContent";

function groupCount(value: unknown): number {
    if (typeof value !== "string" || value.length === 0) return 0;
    return value.split("|").length;
}

// Même calcul que `SlideCode`/`SlideCodeWithPreview` (highlight.split('|').length - 1),
// rejoué ici sur les props plutôt qu'à l'exécution d'un effet.
function blockStepCount(block: Block): number {
    switch (block.type) {
        case "slide-code":
            return Math.max(0, groupCount(block.props.highlight) - 1);
        case "slide-code-with-preview":
            return Math.max(
                0,
                Math.max(groupCount(block.props.highlight), groupCount(block.props.secondaryHighlight)) - 1
            );
        default:
            return 0;
    }
}

function maxStepCount(blocks: Block[]): number {
    let max = 0;
    for (const block of blocks) {
        max = Math.max(max, blockStepCount(block));
        if (block.children?.length) {
            max = Math.max(max, maxStepCount(block.children));
        }
    }
    return max;
}

/**
 * Nombre d'étapes de chaque slide, dérivé des props `highlight`/
 * `secondaryHighlight` de ses blocs code — le même calcul que celui que
 * `SlideCode`/`SlideCodeWithPreview` font au montage via `registerSteps`.
 *
 * Sert à préremplir le rail de progression dès le premier rendu : sans ce
 * précalcul, `slideSteps` reste vide tant qu'une slide n'a pas été visitée
 * (seule la slide courante est montée), et le rail semble se charger au fur
 * et à mesure qu'on avance dans le diaporama plutôt que d'afficher d'emblée
 * le bon nombre de points pour chaque slide.
 */
export function computeSlideStepCounts(slides: Block[]): number[] {
    return slides.map((slide) => maxStepCount(slide.children ?? []));
}
