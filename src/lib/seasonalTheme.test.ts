import {describe, expect, test} from "bun:test";
import {getSeasonalTheme, isNoelSeason} from "@/lib/seasonalTheme";

describe("isNoelSeason", () => {
    test("actif du 15 novembre au 26 décembre inclus", () => {
        expect(isNoelSeason(new Date(2026, 10, 15))).toBe(true);
        expect(isNoelSeason(new Date(2026, 10, 30))).toBe(true);
        expect(isNoelSeason(new Date(2026, 11, 1))).toBe(true);
        expect(isNoelSeason(new Date(2026, 11, 26))).toBe(true);
    });

    test("inactif hors de la période", () => {
        expect(isNoelSeason(new Date(2026, 10, 14))).toBe(false);
        expect(isNoelSeason(new Date(2026, 11, 27))).toBe(false);
        expect(isNoelSeason(new Date(2027, 0, 2))).toBe(false);
        expect(isNoelSeason(new Date(2027, 6, 14))).toBe(false);
    });
});

describe("getSeasonalTheme", () => {
    const avant = new Date(2026, 10, 14);
    const noel = new Date(2026, 11, 24);

    test("suit la date sans forçage", () => {
        expect(getSeasonalTheme(avant, undefined)).toBeNull();
        expect(getSeasonalTheme(noel, undefined)).toBe("noel");
        expect(getSeasonalTheme(noel, "")).toBe("noel");
    });

    test("SEASONAL_THEME=noel force le thème hors saison", () => {
        expect(getSeasonalTheme(avant, "noel")).toBe("noel");
        expect(getSeasonalTheme(avant, " NOEL ")).toBe("noel");
    });

    test("SEASONAL_THEME=off coupe le thème en saison", () => {
        expect(getSeasonalTheme(noel, "off")).toBeNull();
    });
});
