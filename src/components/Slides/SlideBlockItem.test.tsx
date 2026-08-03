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
