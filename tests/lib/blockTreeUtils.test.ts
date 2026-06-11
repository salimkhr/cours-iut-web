import { describe, it, expect } from "bun:test";
import type { Block } from "@/types/CourseContent";
import {
    findBlock,
    findParent,
    insertBlock,
    removeBlock,
    updateBlockProps,
    updateBlockChildren,
    moveBlock,
    isDescendant,
} from "@/lib/blockTreeUtils";

function makeTree(): Block[] {
    return [
        { id: "t1", type: "text", props: { content: "hello" } },
        {
            id: "cols", type: "columns", props: {}, children: [
                { id: "colA", type: "column", props: { span: 6 }, children: [
                    { id: "img", type: "image-card", props: { src: "/x.png" } },
                ] },
                { id: "colB", type: "column", props: { span: 6 }, children: [
                    { id: "code1", type: "code", props: { language: "js", code: "1" } },
                ] },
            ],
        },
        {
            id: "lst", type: "list", props: { ordered: false }, children: [
                { id: "li1", type: "list-item", props: { text: "a" }, children: [] },
                { id: "li2", type: "list-item", props: { text: "b" }, children: [
                    { id: "sub", type: "list", props: { ordered: false }, children: [
                        { id: "li3", type: "list-item", props: { text: "c" }, children: [] },
                    ] },
                ] },
            ],
        },
    ];
}

describe("findBlock", () => {
    it("trouve un bloc à toute profondeur", () => {
        const tree = makeTree();
        expect(findBlock(tree, "t1")?.type).toBe("text");
        expect(findBlock(tree, "img")?.type).toBe("image-card");
        expect(findBlock(tree, "li3")?.props.text).toBe("c");
        expect(findBlock(tree, "nope")).toBeUndefined();
    });
});

describe("findParent", () => {
    it("renvoie le parent et l'index", () => {
        const tree = makeTree();
        expect(findParent(tree, "t1")).toEqual({ parent: null, index: 0 });
        const imgLoc = findParent(tree, "img");
        expect(imgLoc?.parent?.id).toBe("colA");
        expect(imgLoc?.index).toBe(0);
        const li2Loc = findParent(tree, "li2");
        expect(li2Loc?.parent?.id).toBe("lst");
        expect(li2Loc?.index).toBe(1);
        expect(findParent(tree, "nope")).toBeNull();
    });
});

describe("insertBlock", () => {
    it("insère à la racine à l'index donné", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "divider", props: {} };
        const next = insertBlock(tree, nb, null, 1);
        expect(next.map((b) => b.id)).toEqual(["t1", "new", "cols", "lst"]);
        expect(tree.length).toBe(3);
    });

    it("insère dans un conteneur profond", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "text", props: { content: "" } };
        const next = insertBlock(tree, nb, "li2", 0);
        const li2 = findBlock(next, "li2");
        expect(li2?.children?.[0].id).toBe("new");
        expect(li2?.children?.[1].id).toBe("sub");
    });

    it("clamp l'index hors bornes", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "text", props: { content: "" } };
        const next = insertBlock(tree, nb, "colA", 99);
        expect(findBlock(next, "colA")?.children?.map((b) => b.id)).toEqual(["img", "new"]);
    });

    it("renvoie l'arbre inchangé si le parent est introuvable", () => {
        const tree = makeTree();
        const nb: Block = { id: "new", type: "text", props: { content: "" } };
        expect(insertBlock(tree, nb, "nope", 0)).toBe(tree);
    });
});

describe("removeBlock", () => {
    it("supprime un bloc et tout son sous-arbre", () => {
        const tree = makeTree();
        const next = removeBlock(tree, "li2");
        expect(findBlock(next, "li2")).toBeUndefined();
        expect(findBlock(next, "sub")).toBeUndefined();
        expect(findBlock(next, "li3")).toBeUndefined();
        expect(findBlock(next, "li1")).toBeDefined();
    });

    it("préserve les références des sous-arbres non touchés", () => {
        const tree = makeTree();
        const next = removeBlock(tree, "li1");
        expect(next[1]).toBe(tree[1]);
    });
});

describe("updateBlockProps", () => {
    it("met à jour les props d'un bloc profond", () => {
        const tree = makeTree();
        const next = updateBlockProps(tree, "li3", { text: "modifié" });
        expect(findBlock(next, "li3")?.props.text).toBe("modifié");
        expect(findBlock(tree, "li3")?.props.text).toBe("c");
    });
});

describe("updateBlockChildren", () => {
    it("remplace les children d'un conteneur", () => {
        const tree = makeTree();
        const next = updateBlockChildren(tree, "colA", []);
        expect(findBlock(next, "colA")?.children).toEqual([]);
        expect(findBlock(next, "img")).toBeUndefined();
    });
});

describe("isDescendant", () => {
    it("détecte la descendance directe et profonde", () => {
        const tree = makeTree();
        expect(isDescendant(tree, "lst", "li3")).toBe(true);
        expect(isDescendant(tree, "li2", "sub")).toBe(true);
        expect(isDescendant(tree, "cols", "li1")).toBe(false);
        expect(isDescendant(tree, "t1", "t1")).toBe(false);
    });
});

describe("moveBlock", () => {
    it("déplace entre conteneurs sans perdre le sous-arbre", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "code1", "colA", 1);
        expect(findBlock(next, "colA")?.children?.map((b) => b.id)).toEqual(["img", "code1"]);
        expect(findBlock(next, "colB")?.children).toEqual([]);
    });

    it("déplace vers la racine", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "sub", null, 0);
        expect(next[0].id).toBe("sub");
        expect(findBlock(next, "li3")).toBeDefined();
        expect(findBlock(next, "li2")?.children).toEqual([]);
    });

    it("réordonne dans le même parent (vers le bas, sémantique arrayMove)", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "t1", null, 2);
        expect(next.map((b) => b.id)).toEqual(["cols", "lst", "t1"]);
    });

    it("réordonne dans le même parent (vers le haut)", () => {
        const tree = makeTree();
        const next = moveBlock(tree, "lst", null, 0);
        expect(next.map((b) => b.id)).toEqual(["lst", "t1", "cols"]);
    });

    it("no-op si la cible est dans la descendance du bloc déplacé", () => {
        const tree = makeTree();
        expect(moveBlock(tree, "lst", "li2", 0)).toBe(tree);
        expect(moveBlock(tree, "lst", "lst", 0)).toBe(tree);
    });

    it("no-op si le bloc ou la cible est introuvable", () => {
        const tree = makeTree();
        expect(moveBlock(tree, "nope", null, 0)).toBe(tree);
        expect(moveBlock(tree, "t1", "nope", 0)).toBe(tree);
    });
});
