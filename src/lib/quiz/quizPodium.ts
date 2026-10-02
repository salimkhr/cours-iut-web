export interface RankableParticipant {
    userId: string;
    firstName: string;
    lastName: string;
    score: number;
    timeMs: number;
}

export type Ranked<T extends RankableParticipant> = T & {rank: number};

/** `Prénom N.` — seule forme d'identité projetée (spec §11). */
export function formatPublicName(firstName: string, lastName: string): string {
    const first = firstName.trim();
    const initial = lastName.trim().charAt(0).toUpperCase();
    if (!initial) return first;
    return `${first} ${initial}.`;
}

/**
 * Tri : note ↓, puis temps cumulé ↑ (départage uniquement), puis ordre
 * alphabétique, puis userId pour un résultat déterministe.
 */
export function rankParticipants<T extends RankableParticipant>(participants: T[]): Ranked<T>[] {
    const sorted = [...participants].sort((a, b) =>
        b.score - a.score
        || a.timeMs - b.timeMs
        || a.lastName.localeCompare(b.lastName, "fr")
        || a.firstName.localeCompare(b.firstName, "fr")
        || a.userId.localeCompare(b.userId));

    const ranked: Ranked<T>[] = [];
    sorted.forEach((p, index) => {
        const prev = ranked[index - 1];
        const rank = prev && prev.score === p.score && prev.timeMs === p.timeMs ? prev.rank : index + 1;
        ranked.push({...p, rank});
    });
    return ranked;
}

export function topOfPodium<T extends RankableParticipant>(ranked: Ranked<T>[], n = 3): Ranked<T>[] {
    return ranked.slice(0, n);
}
