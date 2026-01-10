import {forwardRef} from "react";
import {cn} from "@/lib/utils";

interface ProgressPointProps {
    isActive: boolean;
    isPast: boolean;
    isDark: boolean;
}

export const ProgressPoint = forwardRef<HTMLDivElement, ProgressPointProps>(({ isActive, isPast, isDark }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative w-2 h-2 rounded-full transition-all duration-300",
            isActive
                ? cn(
                    "scale-150 shadow-[0_0_8px_rgba(var(--primary),0.8)] z-10",
                    isDark ? "bg-gray-100" : "bg-gray-900"
                )
                : isPast
                    ? "bg-primary/60"
                    : "bg-muted-foreground/30"
        )}
    >
        {isActive && (
            <span className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-75",
                isDark ? "bg-gray-100" : "bg-gray-900"
            )} />
        )}
    </div>
));
ProgressPoint.displayName = "ProgressPoint";
