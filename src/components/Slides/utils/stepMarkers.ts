export type StepMarker =
    | { kind: "dot"; stepIndex: number }
    | { kind: "pill"; from: number; to: number };

/**
 * Marqueurs du rail pour une slide à `steps` points. Jusqu'à deux points,
 * chacun reste affiché individuellement. Au-delà, seuls le premier et le
 * dernier restent des points ; tout ce qu'il y a entre les deux fond en une
 * seule pastille étirée (`ProgressPoint stretched`) — le rail montre toujours
 * "début / milieu / fin" au lieu de suivre le nombre réel d'étapes.
 */
export function computeStepMarkers(steps: number): StepMarker[] {
    if (steps <= 2) {
        return Array.from({length: steps}, (_, stepIndex) => ({kind: "dot", stepIndex }));
    }
    return [
        {kind: "dot", stepIndex: 0},
        {kind: "pill", from: 1, to: steps - 2},
        {kind: "dot", stepIndex: steps - 1},
    ];
}
