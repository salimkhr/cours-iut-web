/// <reference types="bun-types" />
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {expect, test} from "bun:test";
import {slidesContainerClassName, slidesContainerStyle, slideViewportClassName} from "@/components/Slides/SlidesScreen";

test("supprime le padding du viewport de slide en plein ecran", () => {
    expect(slideViewportClassName(false)).toContain("p-6");
    expect(slideViewportClassName(true)).toContain("p-0");
    expect(slideViewportClassName(true)).not.toContain("p-6");
});

test("supprime les bordures et arrondis du conteneur en plein ecran", () => {
    expect(slidesContainerClassName(true)).toContain("!border-0");
    expect(slidesContainerClassName(true)).toContain("!rounded-none");
    expect(slidesContainerClassName(true)).toContain("!shadow-none");
    expect(slidesContainerStyle(true)).toEqual({
        border: 0,
        borderRadius: 0,
        boxShadow: "none",
    });
    expect(slidesContainerStyle(false)).toBeUndefined();
    expect(slidesContainerClassName(false)).toContain("rounded-2xl");
});

test("donne au deck une hauteur fixe au lieu de suivre le contenu", () => {
    // Sinon le cadre et la barre d'actions sautent d'une slide a l'autre, et
    // les slides denses debordent la page.
    expect(slidesContainerClassName(false)).toContain("h-[calc(100dvh-var(--navbar-h)-1.5rem)]");
    expect(slidesContainerClassName(false)).not.toContain("min-h-[600px]");
    expect(slidesContainerClassName(true)).toContain("h-full");
    expect(slidesContainerClassName(true)).toContain("inset-0");
    expect(slidesContainerClassName(false)).toContain("overflow-hidden");
    expect(slideViewportClassName(false)).toContain("min-h-0");
    expect(slideViewportClassName(true)).toContain("min-h-0");
});

test("ne rend pas de barre de progression basse invisible", () => {
    const source = readFileSync(join(process.cwd(), "src/components/Slides/SlidesScreen.tsx"), "utf8");

    expect(source).not.toContain("Progress bar bas");
    expect(source).not.toContain("absolute bottom-0 left-0 h-1 w-full");
});
