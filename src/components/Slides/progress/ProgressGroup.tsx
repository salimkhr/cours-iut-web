import React from "react";
import {ProgressPoint} from "./ProgressPoint";
import {useMounted} from "@/hook/useMounted";

interface ProgressGroupProps {
    /** Slide de transition : marquée d'un trait, pas d'un point. */
    isTransition?: boolean;
    /** Étapes de highlight au-delà de la première (`slideSteps[sIdx] || 0`) —
     *  étire le point plutôt que d'en empiler plusieurs. */
    extraSteps: number;
    sIdx: number;
    currentSlide: number;
    activeRef?: React.RefObject<HTMLDivElement | null>;
}

// Un point par slide, pas par étape : le rail suit le déplacement entre
// slides, pas la progression interne d'une slide à étapes. La couleur et
// l'échelle du point actif suffisent à le signaler — un halo bordé en plus
// donnait un plafond de rail plus large que le corps, du fait de sa propre
// forme "rounded-full" plus étroite empilée dans celle du rail.
export const ProgressGroup: React.FC<ProgressGroupProps> = ({
                                                                isTransition = false,
                                                                extraSteps,
                                                                sIdx,
                                                                currentSlide,
                                                                activeRef
                                                            }) => {

    const mounted = useMounted();
    if (!mounted) return null;

    const isActive = sIdx === currentSlide;
    const isPast = sIdx < currentSlide;

    return (
        <ProgressPoint
            ref={isActive ? activeRef : null}
            isActive={isActive}
            isPast={isPast}
            isTransition={isTransition}
            extraSteps={extraSteps}
        />
    );
};
