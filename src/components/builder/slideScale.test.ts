/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import {
    CANVAS_EDIT_SLIDE_H,
    CANVAS_EDIT_SLIDE_W,
    computeSlideScale,
    getSlideFrameSize,
    SLIDE_H,
    SLIDE_W,
} from "@/components/builder/slideScale";

test("dimensions naturelles des thumbnails 16:9", () => {
    expect(SLIDE_W).toBe(960);
    expect(SLIDE_H).toBe(540);
});

test("canvas edit : utilise un cadre projection assez haut pour les blocs de code", () => {
    expect(CANVAS_EDIT_SLIDE_W).toBe(1536);
    expect(CANVAS_EDIT_SLIDE_H).toBe(960);
    expect(getSlideFrameSize("canvas-edit")).toEqual({ width: 1536, height: 960 });
});

test("canvas edit : scale = min(W/1536, H/960), borne par la hauteur", () => {
    // Le canvas d'edition simule une surface de projection 16:10 : a echelle 1,
    // les blocs code xl gardent une vraie hauteur de lecture au lieu de ne
    // montrer qu'environ cinq lignes dans une boite 960x540.
    expect(computeSlideScale(1536, 960, "canvas-edit")).toBeCloseTo(1, 5);
    expect(computeSlideScale(960, 600, "canvas-edit")).toBeCloseTo(0.625, 5);
});

test("thumbnail : scale fixe ~0.22 independant du panneau", () => {
    expect(computeSlideScale(9999, 9999, "thumbnail")).toBeCloseTo(0.22, 5);
});

test("jamais negatif ou NaN sur panneau 0", () => {
    expect(computeSlideScale(0, 0, "canvas-edit")).toBe(0);
});
