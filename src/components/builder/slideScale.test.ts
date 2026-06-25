/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { computeSlideScale, SLIDE_W, SLIDE_H } from "@/components/builder/slideScale";

test("dimensions naturelles 16:9", () => {
    expect(SLIDE_W).toBe(960);
    expect(SLIDE_H).toBe(540);
});

test("canvas : scale = min(W/960, H/540), borné par la hauteur", () => {
    // panneau large mais court → la hauteur limite
    expect(computeSlideScale(1920, 540, "canvas-edit")).toBeCloseTo(1, 5);
    expect(computeSlideScale(960, 270, "canvas-edit")).toBeCloseTo(0.5, 5);
});

test("thumbnail : scale fixe ~0.22 indépendant du panneau", () => {
    expect(computeSlideScale(9999, 9999, "thumbnail")).toBeCloseTo(0.22, 5);
});

test("jamais négatif ou NaN sur panneau 0", () => {
    expect(computeSlideScale(0, 0, "canvas-edit")).toBe(0);
});
