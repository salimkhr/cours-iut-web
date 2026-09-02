import {forwardRef} from "react";
import {cn} from "@/lib/utils";

// Une slide sans etape supplementaire reste un rond (10px, la largeur du
// point). Chaque etape en plus l'etire un peu : le rail donne alors un
// aperçu du volume de contenu de chaque slide sans avoir a la visiter.
const DOT_SIZE_PX = 10;
const PX_PER_EXTRA_STEP = 4;
const MAX_EXTRA_STEPS = 4;

interface ProgressPointProps {
    isActive: boolean;
    isPast: boolean;
    /** Slide de transition : un trait horizontal au lieu d'un point. Dans un
     *  rail vertical, le trait se lit comme une séparation de parties — ce
     *  qu'est une transition — et non comme une slide de contenu de plus. */
    isTransition?: boolean;
    /** Nombre d'étapes de highlight au-delà de la première (`slideSteps[i]`).
     *  Étire le point verticalement d'autant, plafonné pour qu'une slide très
     *  chargée ne domine pas le rail. */
    extraSteps?: number;
}

export const ProgressPoint = forwardRef<HTMLDivElement, ProgressPointProps>(({isActive, isPast, isTransition = false, extraSteps = 0}, ref) => (
    <div
        ref={ref}
        style={isTransition ? undefined : {height: DOT_SIZE_PX + Math.min(extraSteps, MAX_EXTRA_STEPS) * PX_PER_EXTRA_STEP}}
        className={cn(
            // 6px était illisible, a fortiori projeté au fond d'une salle :
            // le rail est le seul repère de position pendant une présentation.
            "relative w-2.5 rounded-full transition-transform",
            // Le trait garde l'empreinte horizontale d'un point : un marqueur
            // plus large élargirait le rail entier et déplacerait tous les
            // autres points. Seule la hauteur change, et elle suffit à le lire
            // comme une séparation. `scale` sur l'actif ne compte pas : une
            // transformation ne pousse pas la mise en page.
            isTransition && "h-1",
            isActive
                ? "scale-140 bg-(--module-color) dark:bg-(--module-color-dark)"
                : isPast
                    ? "bg-(--module-color)/45 dark:bg-(--module-color-dark)/45"
                    : "bg-bridge-500/30 dark:bg-bridge-300/25"
        )}
    />
));
ProgressPoint.displayName = "ProgressPoint";
