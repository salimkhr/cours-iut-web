/**
 * Ordre d'affichage des propositions : mélangé, mais identique pour la projection et pour tous les
 * écrans des étudiants, y compris après une reconnexion ou un redémarrage. Il est donc dérivé d'une graine
 * (session + question) plutôt que tiré au hasard à chaque envoi d'état.
 */
function hash(input: string): number {
    // FNV-1a 32 bits : suffisant pour mélanger quelques propositions, sans dépendance.
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

export function shuffleOptions<T extends {id: string}>(options: T[], seed: string): T[] {
    return [...options].sort((a, b) => hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`) || a.id.localeCompare(b.id));
}

/**
 * Ordre des questions propre à un étudiant (graine : session + compte), stable après une reconnexion.
 * Les questions d'échauffement (poids 0) restent en tête, dans leur ordre d'origine ; les autres sont
 * mélangées. La correction collective, elle, suit l'ordre du quiz.
 */
export function questionsFor<T extends {id: string; weight: number}>(questions: T[], seed: string): T[] {
    const warmup = questions.filter((q) => q.weight === 0);
    const rest = questions.filter((q) => q.weight !== 0);
    return [...warmup, ...shuffleOptions(rest, seed)];
}

/** Graine de l'ordre des questions d'un participant : partagée par le service et l'état public. */
export const participantSeed = (sessionId: string, userId: string) => `${sessionId}:${userId}`;
