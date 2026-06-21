import { describe, test, expect } from "bun:test";
import { assignModuleColor } from "@/lib/assignModuleColor";
import { MODULE_COLOR_PALETTE } from "@/lib/moduleColorPalette";

describe("assignModuleColor", () => {
    test("retourne une paire de la palette", () => {
        const pair = assignModuleColor([], () => 0);
        expect(pair).toEqual(MODULE_COLOR_PALETTE[0]);
    });

    test("évite une paire déjà utilisée", () => {
        const used = [{ colorLight: MODULE_COLOR_PALETTE[0].colorLight }];
        // rng=0 → premier élément du pool "libre" (donc PAS l'index 0 global)
        const pair = assignModuleColor(used, () => 0);
        expect(pair.colorLight).not.toBe(MODULE_COLOR_PALETTE[0].colorLight);
    });

    test("retombe sur la palette complète si tout est pris", () => {
        const used = MODULE_COLOR_PALETTE.map((p) => ({ colorLight: p.colorLight }));
        const pair = assignModuleColor(used, () => 0);
        expect(pair).toEqual(MODULE_COLOR_PALETTE[0]);
    });
});
