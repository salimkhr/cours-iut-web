export const SLIDE_W = 960;
export const SLIDE_H = 540;
export const THUMBNAIL_SCALE = 0.22;

export type ZoomMode = "thumbnail" | "canvas-edit";

/**
 * Coefficient de mise à l'échelle d'une slide (960×540 naturels).
 * - "thumbnail" : valeur fixe.
 * - "canvas-edit" : Math.min(W/960, H/540), pour tenir sans rogner le 16:9.
 */
export function computeSlideScale(panelW: number, panelH: number, mode: ZoomMode): number {
    if (mode === "thumbnail") return THUMBNAIL_SCALE;
    if (panelW <= 0 || panelH <= 0) return 0;
    return Math.min(panelW / SLIDE_W, panelH / SLIDE_H);
}
