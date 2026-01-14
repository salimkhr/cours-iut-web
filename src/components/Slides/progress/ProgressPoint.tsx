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
            "relative w-1.5 h-1.5 rounded-full",
            isActive
                ? cn(
                    "scale-125",
                    isDark ? "bg-gray-100" : "bg-gray-900"
                )
                : isPast
                    ? "bg-primary/50"
                    : "bg-muted-foreground/25"
        )}
    />
));
ProgressPoint.displayName = "ProgressPoint";