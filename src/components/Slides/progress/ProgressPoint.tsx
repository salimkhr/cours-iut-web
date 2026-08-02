import {forwardRef} from "react";
import {cn} from "@/lib/utils";

interface ProgressPointProps {
    isActive: boolean;
    isPast: boolean;
}

export const ProgressPoint = forwardRef<HTMLDivElement, ProgressPointProps>(({isActive, isPast}, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative w-1.5 h-1.5 rounded-full transition-transform",
            isActive
                ? "scale-125 bg-(--module-color) dark:bg-(--module-color-dark)"
                : isPast
                    ? "bg-(--module-color)/45 dark:bg-(--module-color-dark)/45"
                    : "bg-bridge-500/30 dark:bg-bridge-300/25"
        )}
    />
));
ProgressPoint.displayName = "ProgressPoint";
