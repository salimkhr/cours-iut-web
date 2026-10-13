import { expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseFileTree } from "@/lib/fileTree";
import { getBlockDef, createBlockInstance } from "@/lib/blockDefs";
import { canDrop, isTypeAllowedInContent } from "@/lib/blockSchemas";
import { validateBlockTree } from "@/lib/validateBlockTree";
import { findUnrenderableTypes, toSlideBlocks } from "@/lib/slideBlockMigration";
import FileTreeCard from "@/components/Cards/FileTreeCard";
import { SlideBlockItem } from "@/components/Slides/SlideBlockItem";

test("regroupe les parents, déduplique les chemins et conserve les dossiers vides", () => {
    const nodes = parseFileTree("projet/src/index.ts\nprojet/images/\nprojet/src/index.ts\nprojet/.env");
    expect(nodes).toHaveLength(1);
    expect(nodes[0].directory).toBe(true);
    expect(nodes[0].children.map((node) => node.name)).toEqual(["src", "images", ".env"]);
    expect(nodes[0].children[0].children).toHaveLength(1);
    expect(nodes[0].children[1]).toMatchObject({ directory: true, children: [] });
    expect(nodes[0].children[2].directory).toBe(false);
});

test("accepte les séparateurs Windows, CRLF, espaces et chemins relatifs", () => {
    expect(parseFileTree(" ./mon projet\\src\\index.ts\r\n\n")[0].children[0].children[0].path)
        .toBe("mon projet/src/index.ts");
    expect(parseFileTree("\n  \n")).toEqual([]);
    expect(parseFileTree("src\nsrc/index.ts")[0].directory).toBe(true);
});

test("le bloc s'insère et se sauvegarde dans un cours ou une slide, y compris en colonne", () => {
    const def = getBlockDef("file-tree")!;
    const block = createBlockInstance(def);
    expect(def.schema.safeParse(block.props).success).toBe(true);
    expect(def.schema.safeParse({ paths: 42 }).success).toBe(false);
    for (const parent of ["section", "slide", "column", "list-item"]) {
        expect(canDrop(block.type, parent)).toBe(true);
    }
    for (const content of ["cours", "slide"]) expect(isTypeAllowedInContent(block.type, content)).toBe(true);
    const slides = [{ id: "slide", type: "slide", props: { title: "Projet" }, children: [block] }];
    expect(validateBlockTree([block])).toEqual({ valid: true, errors: [] });
    expect(validateBlockTree(slides)).toEqual({ valid: true, errors: [] });
    expect(toSlideBlocks(slides)).toEqual(slides);
    expect(findUnrenderableTypes(slides)).toEqual([]);
});

test("rend les noms comme du texte, avec une hiérarchie accessible dans les cours et slides", () => {
    const props = { title: "Projet", paths: "src/<script>.ts\nassets/" };
    const course = renderToStaticMarkup(<FileTreeCard {...props} />);
    const slide = renderToStaticMarkup(<SlideBlockItem block={{ id: "tree", type: "file-tree", props }} />);
    for (const html of [course, slide]) {
        expect(html).toContain("&lt;script&gt;.ts");
        expect(html).toContain("Dossier : ");
        expect(html).toContain("Fichier : ");
        expect(html.match(/<ul/g)).toHaveLength(2);
    }
    expect(slide).toContain("lg:text-2xl");
});
