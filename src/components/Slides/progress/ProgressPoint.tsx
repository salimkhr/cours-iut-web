import {forwardRef} from "react";
import {cn} from "@/lib/utils";

interface ProgressPointProps {
    isActive: boolean;
    isPast: boolean;
    /** Slide de transition : un trait horizontal au lieu d'un point. Dans un
     *  rail vertical, le trait se lit comme une séparation de parties — ce
     *  qu'est une transition — et non comme une slide de contenu de plus. */
    isTransition?: boolean;
}

export const ProgressPoint = forwardRef<HTMLDivElement, ProgressPointProps>(({isActive, isPast, isTransition = false}, ref) => (
    <div
        ref={ref}
        className={cn(
            // 6px était illisible, a fortiori projeté au fond d'une salle :
            // le rail est le seul repère de position pendant une présentation.
            "relative rounded-full transition-transform",
            isTransition ? "h-1 w-5" : "w-2.5 h-2.5",
            isActive
                ? "scale-140 bg-(--module-color) dark:bg-(--module-color-dark)"
                : isPast
                    ? "bg-(--module-color)/45 dark:bg-(--module-color-dark)/45"
                    : "bg-bridge-500/30 dark:bg-bridge-300/25"
        )}
    />
));
ProgressPoint.displayName = "ProgressPoint";
