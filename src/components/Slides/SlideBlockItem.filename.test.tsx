/// <reference types="bun-types" />
import React from "react";
import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {SlideBlockItem} from "@/components/Slides/SlideBlockItem";
import {SlidesContext, type SlidesContextType} from "@/components/Slides/context/SlidesContext";
import type {Block} from "@/types/CourseContent";

const contextValue: SlidesContextType = {
    currentSlide: 0,
    currentStep: 0,
    slidesCount: 1,
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
};

function render(block: Block): string {
    return renderToStaticMarkup(
        <SlidesContext.Provider value={contextValue}>
            <SlideBlockItem block={block}/>
        </SlidesContext.Provider>
    );
}

const code = "<?php\nfinal class RecipeRepository {}\n";

test("slide-code affiche le nom de fichier au-dessus du code", () => {
    const html = render({
        id: "c",
        type: "slide-code",
        props: {language: "php", code, filename: "repositories/RecipeRepository.php", highlight: "1 | 2"},
    });

    expect(html).toContain("repositories/RecipeRepository.php");
    // Taille de projection : l'onglet n'est plus plafonné à 220px.
    expect(html).not.toContain("max-w-[220px]");
});

test("slide-code sans nom de fichier garde le langage dans l'onglet", () => {
    for (const filename of [undefined, "", "   "]) {
        const html = render({id: "c", type: "slide-code", props: {language: "php", code, filename}});

        expect(html).toMatch(/font-mono[^"]*">php<\/span>/);
    }
});

test("slide-code-with-preview affiche le nom de fichier du premier panneau", () => {
    const html = render({
        id: "p",
        type: "slide-code-with-preview",
        props: {language: "html", code: "<p>a</p>", filename: "index.html"},
    });

    expect(html).toContain("index.html");
});

test("slide-code-with-preview : le nom ne glisse pas sur le second panneau quand le premier est vide", () => {
    const html = render({
        id: "p",
        type: "slide-code-with-preview",
        props: {language: "html", code: "", filename: "index.html", secondaryLanguage: "css", secondaryCode: "p {}"},
    });

    expect(html).not.toContain("index.html");
});
