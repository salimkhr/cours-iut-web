export interface ScoreInput {
    weight: number;
    correctIds: string[];
    incorrectIds: string[];
    selectedIds: string[];
    negativeMarking: boolean;
}

/**
 * Barème d'une question (spec §5). La rapidité n'intervient jamais.
 * Sans négatif : W × G / C. Avec : max(0, W × (G / C − B / I)).
 */
export function scoreQuestion({weight, correctIds, incorrectIds, selectedIds, negativeMarking}: ScoreInput): number {
    const selected = new Set(selectedIds);
    const good = correctIds.filter((id) => selected.has(id)).length;
    const bad = incorrectIds.filter((id) => selected.has(id)).length;
    const ratio = correctIds.length === 0 ? 0 : good / correctIds.length;
    const penalty = negativeMarking && incorrectIds.length > 0 ? bad / incorrectIds.length : 0;
    const raw = weight * (ratio - penalty);
    return Math.round(Math.max(0, raw) * 10_000) / 10_000;
}
