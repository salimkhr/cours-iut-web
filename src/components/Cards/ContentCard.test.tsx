/// <reference types="bun-types" />
import React from "react";
import {expect, test} from "bun:test";
import {renderToStaticMarkup} from "react-dom/server";
import ContentCard from "@/components/Cards/ContentCard";
import type Module from "@/types/Module";
import type Section from "@/types/Section";

const moduleFixture: Module = {
    _id: "module-html-css",
    title: "HTML / CSS",
    path: "html-css",
    iconName: "code",
    sections: [],
    associatedSae: [],
};

const lockedSection: Section = {
    _id: "section-formulaires",
    title: "Les formulaires",
    path: "1-les-formulaires",
    contents: [
        {type: "cours", source: "file"},
        {type: "TP", source: "file"},
    ],
    tags: [],
    totalDuration: 1,
    hasCorrection: false,
    isAvailable: false,
    order: 1,
};

test("un admin peut ouvrir le contenu d'une section verrouillee", () => {
    const html = renderToStaticMarkup(
        <ContentCard
            content="cours"
            section={lockedSection}
            currentModule={moduleFixture}
            isAdmin
        />
    );

    expect(html).toContain('href="/html-css/1-les-formulaires/cours"');
    expect(html).toContain("Ouvrir Cours");
    expect(html).toContain("border-(--module-color)");
    expect(html).toContain("hover:bg-(--module-color)");
    expect(html).toContain("uppercase");
    expect(html).not.toContain("group-hover/btn:text-white");
    expect(html).not.toContain("Indisponible");
});

test("un non-admin garde une section verrouillee indisponible", () => {
    const html = renderToStaticMarkup(
        <ContentCard
            content="TP"
            section={lockedSection}
            currentModule={moduleFixture}
        />
    );

    expect(html).toContain("Indisponible");
    expect(html).not.toContain('href="/html-css/1-les-formulaires/TP"');
});
