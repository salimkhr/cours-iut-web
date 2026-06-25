export type DriftDirection = "synced" | "ahead" | "behind";

export interface Drift {
    delta: number;            // valeur absolue de l'écart
    direction: DriftDirection;
}

/** Écart entre la position locale d'un follower et celle du présentateur. */
export function computeDrift(localSlide: number, presenterSlide: number): Drift {
    const diff = localSlide - presenterSlide;
    if (diff === 0) return { delta: 0, direction: "synced" };
    return { delta: Math.abs(diff), direction: diff > 0 ? "ahead" : "behind" };
}
