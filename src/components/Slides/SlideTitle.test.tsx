/// <reference types="bun-types" />
import React from "react";
import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import {SlideTitle} from "@/components/Slides/ui/SlideTitle";
import type Module from "@/types/Module";
import type Section from "@/types/Section";

const moduleFixture: Module = {
    _id: "module-php",
    title: "PHP",
    path: "php",
    iconName: "code",
    sections: [],
    associatedSae: [],
};

const sectionFixture: Section = {
    _id: "section-twig",
    title: "Twig",
    path: "twig",
    description: "Templates cote serveur.",
    objectives: [
        "Composer des vues Twig",
        "Passer des donnees au template",
    ],
    contents: [
        {type: "cours", source: "file"},
        {type: "TP", source: "file"},
        {type: "slide", source: "file"},
    ],
    tags: ["twig", "template"],
    totalDuration: 2,
    hasCorrection: false,
    order: 11,
};

test("rend le hero pont de la slide titre sans attendre l hydratation", () => {
    const html = renderToStaticMarkup(
        <SlideTitle module={moduleFixture} section={sectionFixture}/>
    );

    expect(html).toContain("PHP");
    expect(html).toContain("Twig");
    expect(html).toContain("Pont en bois clair");
    expect(html).toContain("/images/header/pont-light.png");
    expect(html).toContain("/images/header/pont-dark.png");
    expect(html).toContain("lg:text-[4.8rem]");
    expect(html).toContain("xl:text-[6.4rem]");
    expect(html).not.toContain("xl:text-[10rem]");
    expect(html).toContain("lg:text-[0.9rem]");
    expect(html).toContain("lg:pl-32");
    expect(html).not.toContain("lg:pr-32");
    expect(html).toContain("max-w-[860px]");
    expect(html).toContain("Composer des vues Twig");
    expect(html).not.toContain("Durée");
    expect(html).not.toContain("Supports");
    expect(html).not.toContain("Cours + TP + Slides");
    expect(html).toContain("bg-bridge-50");
    expect(html).toContain("dark:bg-bridge-900");
    expect(html).not.toContain("slide-surface");
    expect(html).not.toContain("w-[36%]");
    expect(html).not.toContain("absolute right-5 top-5");
    expect(html).not.toContain("select-none font-mono");
});
