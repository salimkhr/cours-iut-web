import { describe, test, expect } from "bun:test";
import { generateModuleThemeCss } from "@/lib/generateModuleThemeCss";

describe("generateModuleThemeCss", () => {
    test("émet :root et .dark pour un module valide", () => {
        const css = generateModuleThemeCss([
            { path: "php", colorLight: "#3B3F7A", colorDark: "#9198E5" },
        ]);
        expect(css).toContain(":root{--color-php:#3B3F7A}");
        expect(css).toContain(".dark{--color-php:#9198E5}");
    });

    test("ignore un path non conforme (anti-injection)", () => {
        const css = generateModuleThemeCss([
            { path: "php}; body{display:none", colorLight: "#3B3F7A" },
        ]);
        expect(css).toBe("");
    });

    test("ignore une couleur non hex", () => {
        const css = generateModuleThemeCss([
            { path: "php", colorLight: "red; }", colorDark: "#9198E5" },
        ]);
        expect(css).not.toContain("red");
        expect(css).toContain(".dark{--color-php:#9198E5}");
        expect(css).not.toContain(":root");
    });

    test("chaîne vide si aucune couleur", () => {
        expect(generateModuleThemeCss([{ path: "php" }])).toBe("");
        expect(generateModuleThemeCss([])).toBe("");
    });
});
