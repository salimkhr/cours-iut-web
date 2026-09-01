/// <reference types="bun-types" />
import React from "react";
import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {SlideBlockItem} from "@/components/Slides/SlideBlockItem";
import type {Block} from "@/types/CourseContent";

test("rend un bloc diagramme dans le contexte slide", () => {
    const block: Block = {
        id: "diagram",
        type: "diagram",
        props: {
            chart: "flowchart LR\n    A --> B",
        },
    };

    const html = renderToStaticMarkup(<SlideBlockItem block={block}/>);

    // Le diagramme prend la place disponible dans la scene ; une hauteur
    // plancher en px le poussait hors du cadre de slide.
    expect(html).toContain("flex min-h-0 flex-1");
    expect(html).not.toContain("min-h-[600px]");
});

test("rend une slide de transition avec son etiquette et son accroche", () => {
    const block: Block = {
        id: "transition",
        type: "slide-transition",
        props: {
            eyebrow: "2",
            title: "Les fonctions",
            subtitle: "Écrire une fois, appeler autant de fois qu'on veut",
        },
    };

    const html = renderToStaticMarkup(<SlideBlockItem block={block}/>);

    expect(html).toContain("Les fonctions");
    expect(html).toContain("2");
    expect(html).toContain("Écrire une fois");
    // Elle porte sa propre direction artistique — le pont de la garde de
    // section — et occupe toute la surface : c'est ce qui la distingue d'un
    // bloc de contenu, qui vit dans le corps de SlideScreen.
    expect(html).toContain("pont-light.png");
    expect(html).toContain("pont-dark.png");
    expect(html).toContain("h-full w-full self-stretch");
});

test("omet l'etiquette et l'accroche d'une transition quand elles sont vides", () => {
    const block: Block = {
        id: "transition-nue",
        type: "slide-transition",
        props: {title: "Les fonctions"},
    };

    const html = renderToStaticMarkup(<SlideBlockItem block={block}/>);

    expect(html).toContain("Les fonctions");
    // Pas de conteneur d'étiquette ni d'accroche : un `&&` sur une chaîne vide
    // rendrait la chaîne, pas rien — d'où la vérification.
    expect(html).not.toContain("uppercase");
    expect(html).not.toContain("font-light");
});
