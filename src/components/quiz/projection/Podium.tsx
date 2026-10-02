import type {PodiumEntry} from "@/lib/quiz/quizPublicState";

const formatScore = (score: number) => (Math.round(score * 100) / 100).toString().replace(".", ",");

/** Haut du classement uniquement, sous la forme « Prénom N. ». */
export default function Podium({entries, final = false}: {entries: PodiumEntry[]; final?: boolean}) {
    if (entries.length === 0) return null;
    return (
        <section aria-labelledby="podium-title" className="flex flex-col gap-4">
            <h2 id="podium-title" className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {final ? "Podium final" : "Podium"}
            </h2>
            <ol className="flex flex-col gap-3">
                {entries.map((entry) => (
                    <li key={`${entry.rank}-${entry.name}`}
                        className="flex items-center gap-4 rounded-lg border bg-card px-5 py-4">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-extrabold tabular-nums text-primary-foreground">
                            {entry.rank}
                        </span>
                        <span className="flex-1 truncate text-3xl font-bold">{entry.name}</span>
                        <span className="text-3xl font-extrabold tabular-nums">
                            {formatScore(entry.score)} <span className="text-lg font-semibold text-muted-foreground">pts</span>
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
