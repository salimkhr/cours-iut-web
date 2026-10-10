/** Échelle qui fait tenir un cadre de taille fixe dans un panneau, sans déformation. */
export function fitScale(panelW: number, panelH: number, frameW: number, frameH: number): number {
    if (panelW <= 0 || panelH <= 0) return 0;
    return Math.min(panelW / frameW, panelH / frameH);
}
