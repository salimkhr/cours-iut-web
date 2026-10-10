import type {PodiumEntry} from "@/lib/quiz/quizPublicState";
import {moduleFill, quizCard} from "@/components/quiz/QuizStage";
import {cn} from "@/lib/utils";

const formatScore = (score: number) => (Math.round(score * 100) / 100).toString().replace(".", ",");

interface Props {
    entries: PodiumEntry[];
    /** `lg` : écran final, le podium est le sujet. `md` : sous la correction, il tient dans le pied de page. */
    size?: "md" | "lg";
}

/** Hauteur des marches par position dans le classement (1er, 2e, 3e), en rem. */
const STEP_HEIGHT = {
    md: [4.5, 3.25, 2.25],
    lg: [10, 7.5, 5.25],
} as const;

/**
 * Podium en marches, 2 – 1 – 3 : le premier au centre sur la marche la plus haute. Seul le haut du
 * classement est montré, sous la forme « Prénom N. ». La hauteur vient de la position dans la liste,
 * le rang affiché de l'entrée : deux ex æquo gardent le même rang sur deux marches voisines.
 *
 * Sans participant, les trois marches restent affichées, vides, avec un message : un écran vide
 * donnerait l'impression que le podium est inaccessible.
 */
export default function Podium({entries, size = "md"}: Props) {
    const lg = size === "lg";
    const empty = entries.length === 0;
    // Positions d'affichage : 2e, 1er, 3e — les places absentes sont ignorées, sauf podium vide.
    const order = [1, 0, 2].filter((position) => empty || position < entries.length);

    return (
        <section aria-labelledby="podium-title" className="w-full">
            <h2 id="podium-title" className="sr-only">{lg ? "Podium final" : "Podium"}</h2>
            <ol className={cn("flex items-end", lg ? "gap-5" : "gap-3", empty && "opacity-60")}>
                {order.map((position) => {
                    const entry: PodiumEntry | undefined = entries[position];
                    const first = position === 0;
                    return (
                        <li key={position} className={cn("flex min-w-0 flex-col items-center text-center", lg ? "w-64" : "w-52")}>
                            <span className={cn("max-w-full truncate font-bold leading-tight", lg ? "text-3xl" : "text-xl")}>{entry?.name ?? "—"}</span>
                            <span className={cn("mb-1.5 font-semibold tabular-nums text-bridge-600 dark:text-bridge-300", lg ? "text-xl" : "text-base")}>
                                {entry ? `${formatScore(entry.score)} pts` : " "}
                            </span>
                            <div
                                className={cn(
                                    "flex w-full items-start justify-center pt-2",
                                    quizCard, "!rounded-b-none",
                                    first && "border-(--module-color) dark:border-(--module-color-dark)",
                                )}
                                style={{height: `${STEP_HEIGHT[size][position]}rem`}}
                            >
                                <span className={cn(
                                    "flex shrink-0 items-center justify-center rounded-full font-extrabold tabular-nums text-white dark:text-brand-dark",
                                    first ? moduleFill : "bg-brand-primary",
                                    lg ? "size-12 text-2xl" : "size-8 text-base",
                                )}>
                                    {entry?.rank ?? position + 1}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ol>
            {empty && (
                <p role="status" className={cn("mt-3 text-bridge-600 dark:text-bridge-300", lg ? "text-xl" : "text-base")}>
                    Aucun participant n&apos;a rejoint cette session : le classement est vide.
                </p>
            )}
        </section>
    );
}
