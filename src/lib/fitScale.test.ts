import {describe, expect, test} from "bun:test";
import {fitScale} from "@/lib/fitScale";

describe("fitScale", () => {
    test("le facteur limitant est la dimension la plus contrainte", () => {
        expect(fitScale(960, 1080, 1920, 1080)).toBe(0.5);
        expect(fitScale(1920, 540, 1920, 1080)).toBe(0.5);
    });
    test("panneau à la taille du cadre : échelle 1", () => {
        expect(fitScale(1920, 1080, 1920, 1080)).toBe(1);
    });
    test("panneau vide ou non mesuré : 0", () => {
        expect(fitScale(0, 500, 1920, 1080)).toBe(0);
        expect(fitScale(500, -1, 1920, 1080)).toBe(0);
    });
});
