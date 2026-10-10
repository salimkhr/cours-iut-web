"use client";

import {Check} from "lucide-react";
import {useCountdown} from "@/components/quiz/useCountdown";
import {cn} from "@/lib/utils";

interface Props {
    deadline: number | null;
    serverNow: number;
    /** Durée totale en secondes, pour la barre ou l'anneau de progression. */
    total: number;
    size?: "xl" | "md";
    /** `bar` : chiffre et barre (téléphone). `ring` : anneau compact, chiffre au centre (projection). */
    variant?: "bar" | "ring";
    /** Question close (correction) : même emplacement, plus de décompte. */
    ended?: boolean;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Chronomètre : chiffres tabulaires (largeur stable) et annonces vocales aux seuils seulement. */
export default function Countdown({deadline, serverNow, total, size = "xl", variant = "bar", ended = false}: Props) {
    const live = useCountdown(deadline, serverNow);
    const remaining = ended ? 0 : live;
    if (remaining === null) return null;
    const urgent = !ended && remaining <= 5;
    const announce = !ended && (remaining === 10 || remaining === 5 || remaining === 0);
    const fraction = Math.min(1, remaining / total);
    const announcement = (
        <span className="sr-only" role="status" aria-live="polite">
            {ended ? "Temps écoulé" : announce ? `${remaining} secondes restantes` : ""}
        </span>
    );

    if (variant === "ring") {
        return (
            <div className="relative size-full">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="9" className="stroke-bridge-500/20"/>
                    <circle
                        cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="9" strokeLinecap="round"
                        strokeDasharray={`${CIRCUMFERENCE * fraction} ${CIRCUMFERENCE}`}
                        className={cn("motion-safe:transition-[stroke-dasharray] motion-safe:duration-300", urgent ? "stroke-destructive" : "stroke-brand-primary")}
                        style={{opacity: ended ? 0 : 1}}
                    />
                </svg>
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center font-extrabold tabular-nums leading-none",
                    urgent ? "text-destructive" : "text-brand-dark dark:text-brand-light",
                )}>
                    {ended
                        ? <Check className="size-1/2 text-emerald-700 dark:text-emerald-300" strokeWidth={3} aria-hidden="true"/>
                        : <span className="text-4xl">{remaining}</span>}
                </div>
                {announcement}
            </div>
        );
    }

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
                    style={{width: `${fraction * 100}%`}}
                />
            </div>
            {announcement}
        </div>
    );
}
