/// <reference types="bun-types" />
import {readFileSync} from "node:fs";
import {join} from "node:path";
import React from "react";
import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlidesContext, type SlidesContextType} from "@/components/Slides/context/SlidesContext";

const contextValue: SlidesContextType = {
    currentSlide: 1,
    currentStep: 0,
    slidesCount: 3,
    slideSteps: {},
    nextSlide: () => {},
    prevSlide: () => {},
    goToSlide: () => {},
    registerSteps: () => {},
    currentNotes: null,
    showNotes: false,
    setShowNotes: () => {},
    isFullscreen: false,
    toggleFullscreen: () => {},
    moduleTitle: "PHP",
    sectionTitle: "Twig",
};

test("rend le pont des cards en bas a droite sur les slides de contenu", () => {
    const html = renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideScreen title="Plan">
                <p>Contenu</p>
            </SlideScreen>
        </SlidesContext.Provider>
    );

    expect(html).toContain("/images/card/pont-light.png");
    expect(html).toContain("/images/card/pont-dark.png");
    expect(html).toContain("bg-right-bottom");
    expect(html).toContain("bottom-[-1px] right-0");
    expect(html).toContain("z-10 h-[34%] w-[30%]");
    expect(html).toContain("opacity-[0.7]");
    expect(html.indexOf("bg-linear-to-br")).toBeLessThan(html.indexOf("/images/card/pont-light.png"));
    expect(html).not.toContain("slide-banner");
});

test("fond le pont dans la surface plutot que d'en montrer le cadre", () => {
    const html = renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideScreen title="Plan">
                <p>Contenu</p>
            </SlideScreen>
        </SlidesContext.Provider>
    );

    // Le PNG a un fond creme opaque : sans masque, son cadre se lit comme un
    // rectangle net dans le coin bas droit de chaque slide.
    expect(html).toContain("radial-gradient");
});

test("garde le fond dark staging des slides de contenu", () => {
    const html = renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideScreen title="Plan">
                <p>Contenu</p>
            </SlideScreen>
        </SlidesContext.Provider>
    );
    const globals = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

    expect(html).toContain("dark:from-bridge-900");
    expect(html).toContain("dark:via-bridge-900/88");
    expect(html).toContain("dark:to-bridge-900/44");
    expect(html).not.toContain("dark:from-bridge-800");
    expect(globals).toMatch(/\.dark \.slide-surface \{\s*background: var\(--color-bridge-900\);\s*\}/);
    expect(globals).not.toMatch(/\.dark \.slide-surface \{\s*background: var\(--color-bridge-800\);/);
});

test("rend une scene a hauteur fixe qui ne scrolle pas", () => {
    const html = renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideScreen title="Plan">
                <p>Contenu</p>
            </SlideScreen>
        </SlidesContext.Provider>
    );

    expect(html).toContain("relative isolate flex h-full w-full self-stretch");
    expect(html).not.toContain("overflow-y-auto");
    // Colonne bornee : les blocs denses se compriment au lieu de deborder.
    expect(html).toContain("flex h-full min-h-0 w-full flex-col");
    expect(html).toContain("flex min-h-0 flex-1 flex-col slide-body");
    // Bande basse reservee a SlidesActions.
    expect(html).toContain("pb-20");
});

test("reprend le bandeau badge + filet des titres de section du cours", () => {
    const html = renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideScreen title="Plan" order={3}>
                <p>Contenu</p>
            </SlideScreen>
        </SlidesContext.Provider>
    );

    // Memes classes que le rendu cours (globals.css §course-section-head) :
    // une seule source de verite pour les deux surfaces.
    expect(html).toContain("course-section-head course-section-head--top");
    expect(html).toContain("course-section-badge");
    expect(html).toContain("course-section-headline");
    // Le badge porte le rang de la slide, comme la lettre de section du cours.
    expect(html).toContain(">03<");
    // La couleur module vit dans le badge, plus dans une regle decorative.
    expect(html).not.toContain("h-1 w-16 rounded-full bg-(--module-color)");
});

test("retombe sur la position du contexte quand l'ordre n'est pas fourni", () => {
    const html = renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideScreen title="Plan">
                <p>Contenu</p>
            </SlideScreen>
        </SlidesContext.Provider>
    );

    // contextValue.currentSlide === 1 → badge "02".
    expect(html).toContain(">02<");
});
