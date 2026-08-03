export const SLIDE_W = 960;
export const SLIDE_H = 540;
export const CANVAS_EDIT_SLIDE_W = 1536;
export const CANVAS_EDIT_SLIDE_H = 960;
export const THUMBNAIL_SCALE = 0.22;

export type ZoomMode = "thumbnail" | "canvas-edit";

export function getSlideFrameSize(mode: ZoomMode): { width: number; height: number } {
    if (mode === "canvas-edit") {
        return { width: CANVAS_EDIT_SLIDE_W, height: CANVAS_EDIT_SLIDE_H };
    }

    return { width: SLIDE_W, height: SLIDE_H };
}

/**
 * Coefficient de mise a l'echelle d'une slide.
 * - "thumbnail" : valeur fixe.
 * - "canvas-edit" : cadre projection, plus haut que la miniature 16:9.
 */
export function computeSlideScale(panelW: number, panelH: number, mode: ZoomMode): number {
    if (mode === "thumbnail") return THUMBNAIL_SCALE;
    if (panelW <= 0 || panelH <= 0) return 0;

    const { width, height } = getSlideFrameSize(mode);
    return Math.min(panelW / width, panelH / height);
}
