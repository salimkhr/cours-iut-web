import {forwardRef} from "react";
import {cn} from "@/lib/utils";

interface ProgressPointProps {
    isActive: boolean;
    isPast: boolean;
    /** Slide de transition : un trait horizontal au lieu d'un point. Dans un
     *  rail vertical, le trait se lit comme une séparation de parties — ce
     *  qu'est une transition — et non comme une slide de contenu de plus. */
    isTransition?: boolean;
    /** Étapes intermédiaires d'une slide à plusieurs étapes, fondues en une
     *  seule pastille : même forme ronde que les points, juste étirée en
     *  hauteur. Voir `ProgressGroup`. */
    stretched?: boolean;
}

export const ProgressPoint = forwardRef<HTMLDivElement, ProgressPointProps>(({isActive, isPast, isTransition = false, stretched = false}, ref) => (
    <div
        ref={ref}
        className={cn(
            // 6px était illisible, a fortiori projeté au fond d'une salle :
            // le rail est le seul repère de position pendant une présentation.
            "relative rounded-full transition-transform",
            // Le trait garde l'empreinte horizontale d'un point : un marqueur
            // plus large élargirait le rail entier et déplacerait tous les
            // autres points. Seule la hauteur change, et elle suffit à le lire
            // comme une séparation. `scale` sur l'actif ne compte pas : une
            // transformation ne pousse pas la mise en page.
            isTransition ? "h-1 w-2.5" : stretched ? "w-2.5 h-4" : "w-2.5 h-2.5",
            isActive
                ? "scale-140 bg-(--module-color) dark:bg-(--module-color-dark)"
                : isPast
                    ? "bg-(--module-color)/45 dark:bg-(--module-color-dark)/45"
                    : "bg-bridge-500/30 dark:bg-bridge-300/25"
        )}
    />
));
ProgressPoint.displayName = "ProgressPoint";
