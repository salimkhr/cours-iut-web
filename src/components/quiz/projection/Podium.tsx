import type {PodiumEntry} from "@/lib/quiz/quizPublicState";
import {quizCard, quizEyebrow} from "@/components/quiz/QuizStage";
import {cn} from "@/lib/utils";

const formatScore = (score: number) => (Math.round(score * 100) / 100).toString().replace(".", ",");

interface Props {
    entries: PodiumEntry[];
    /** Écran final : le podium est le sujet. */
    final?: boolean;
    /** Pendant la correction : discret, pour laisser la place aux propositions. */
    compact?: boolean;
}

/** Haut du classement uniquement, sous la forme « Prénom N. ». */
export default function Podium({entries, final = false, compact = false}: Props) {
    if (entries.length === 0) return null;
    return (
        <section aria-labelledby="podium-title" className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
            <h2 id="podium-title" className={quizEyebrow}>
                {final ? "Podium final" : "Podium"}
            </h2>
            <ol className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
                {entries.map((entry) => (
                    <li key={`${entry.rank}-${entry.name}`}
                        className={cn(
                            "flex items-center", quizCard,
                            compact ? "gap-3 px-3 py-2" : "gap-4 px-5 py-4",
                        )}>
                        <span className={cn(
                            "flex shrink-0 items-center justify-center rounded-full bg-brand-primary font-extrabold tabular-nums text-white dark:text-brand-dark",
                            compact ? "size-8 text-base" : "size-12 text-2xl",
                        )}>
                            {entry.rank}
                        </span>
                        <span className={cn("flex-1 truncate font-bold", compact ? "text-lg" : "text-3xl")}>{entry.name}</span>
                        <span className={cn("font-extrabold tabular-nums", compact ? "text-lg" : "text-3xl")}>
                            {formatScore(entry.score)}{" "}
                            <span className={cn("font-semibold text-brand-gray-700 dark:text-brand-gray-300", compact ? "text-sm" : "text-lg")}>pts</span>
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
