"use client";

import {useCountdown} from "@/components/quiz/useCountdown";
import {cn} from "@/lib/utils";

interface Props {
    deadline: number | null;
    serverNow: number;
    /** Durée totale en secondes, pour la barre de progression. */
    total: number;
    size?: "xl" | "md";
}

/** Chronomètre : chiffres tabulaires (largeur stable) et annonces vocales aux seuils seulement. */
export default function Countdown({deadline, serverNow, total, size = "xl"}: Props) {
    const remaining = useCountdown(deadline, serverNow);
    if (remaining === null) return null;
    const urgent = remaining <= 5;
    const announce = remaining === 10 || remaining === 5 || remaining === 0;

    return (
        <div className="flex w-full flex-col gap-2">
            <div className={cn(
                "font-extrabold tabular-nums leading-none",
                size === "xl" ? "text-8xl" : "text-4xl",
                urgent ? "text-destructive" : "text-brand-dark dark:text-brand-light",
            )}>
                {remaining}<span className={cn("ml-2 font-semibold text-brand-gray-700 dark:text-brand-gray-300", size === "xl" ? "text-3xl" : "text-lg")}>s</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-bridge-500/20" aria-hidden="true">
                <div
                    className={cn("h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300", urgent ? "bg-destructive" : "bg-brand-primary")}
                    style={{width: `${Math.min(100, (remaining / total) * 100)}%`}}
                />
            </div>
            <span className="sr-only" role="status" aria-live="polite">
                {announce ? `${remaining} secondes restantes` : ""}
            </span>
        </div>
    );
}
