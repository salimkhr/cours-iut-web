/// <reference types="bun-types" />
import { expect, test } from "bun:test";
import { deriveSlug, serializeInline, parseJSXString } from "./migrate-to-db";
import * as cheerio from "cheerio";
import type { Element as DOMElement } from "domhandler";

test("cours tsx", () => {
    expect(deriveSlug("src/cours/javascript/1-le-dom/Cours.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "1-le-dom",
        contentType: "cours",
    });
});

test("TP tsx", () => {
    expect(deriveSlug("src/cours/php/3-le-mvc/TP.tsx")).toEqual({
        moduleSlug: "php",
        sectionSlug: "3-le-mvc",
        contentType: "TP",
    });
});

test("Slide tsx", () => {
    expect(deriveSlug("src/cours/javascript/2-les-evenements/Slide.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "2-les-evenements",
        contentType: "slide",
    });
});

test("Examen tsx", () => {
    expect(deriveSlug("src/cours/javascript/6-examen/Examen.tsx")).toEqual({
        moduleSlug: "javascript",
        sectionSlug: "6-examen",
        contentType: "examen",
    });
});

function loadEl(html: string) {
    const $ = cheerio.load(html, { xmlMode: true });
    const cheerioEl = $.root().children().first();
    const el = cheerioEl[0] as DOMElement; // Cheerio wrapper contains raw DOMElement at index 0
    return { $, el };
}

test("serializeInline - texte brut", () => {
    const { $, el } = loadEl("<Text>Bonjour monde</Text>");
    expect(serializeInline($, el)).toBe("Bonjour monde");
});

test("serializeInline - strong + em", () => {
    const { $, el } = loadEl("<Text><strong>gras</strong> et <em>italique</em></Text>");
    expect(serializeInline($, el)).toBe("**gras** et _italique_");
});

test("serializeInline - Code inline", () => {
    const { $, el } = loadEl("<Text>voir <Code>document.getElementById</Code></Text>");
    expect(serializeInline($, el)).toBe("voir `document.getElementById`");
});

test("serializeInline - lien", () => {
    const { $, el } = loadEl(`<Text><a href="https://mdn.io">MDN</a></Text>`);
    expect(serializeInline($, el)).toBe("[MDN](https://mdn.io)");
});

test("serializeInline - entités HTML", () => {
    const { $, el } = loadEl("<Text>l&apos;élève &amp; le &quot;prof&quot;</Text>");
    expect(serializeInline($, el)).toBe("l'élève & le \"prof\"");
});

test("Text → text block", () => {
    const blocks = parseJSXString(`<article><Text>Hello monde</Text></article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("text");
    expect(blocks[0].props.content).toBe("Hello monde");
    expect(typeof blocks[0].id).toBe("string");
});

test("section + Heading level 2 → section block avec children", () => {
    const blocks = parseJSXString(`
        <article>
            <section>
                <Heading level={2}>A-Introduction</Heading>
                <Text>Premier paragraphe</Text>
            </section>
        </article>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("section");
    expect(blocks[0].props.title).toBe("A-Introduction");
    expect(blocks[0].children).toHaveLength(1);
    expect(blocks[0].children![0].type).toBe("text");
});

test("Heading level 3 imbriqué dans section", () => {
    const blocks = parseJSXString(`
        <article>
            <section>
                <Heading level={2}>A-Titre</Heading>
                <Heading level={3}>1. Sous-titre</Heading>
                <Text>Contenu</Text>
            </section>
        </article>`);
    expect(blocks[0].children).toHaveLength(1);
    expect(blocks[0].children![0].type).toBe("section");
    expect(blocks[0].children![0].props.title).toBe("1. Sous-titre");
});

test("CodeCard → code block", () => {
    const blocks = parseJSXString(`<article><CodeCard language="javascript">{\`const x = 1;\`}</CodeCard></article>`);
    expect(blocks[0].type).toBe("code");
    expect(blocks[0].props.language).toBe("javascript");
    expect(blocks[0].props.code).toBe("const x = 1;");
});

test("List ordered → list + list-item", () => {
    const blocks = parseJSXString(`
        <article>
            <List ordered={true}>
                <ListItem>Premier</ListItem>
                <ListItem>Deuxième</ListItem>
            </List>
        </article>`);
    expect(blocks[0].type).toBe("list");
    expect(blocks[0].props.ordered).toBe(true);
    expect(blocks[0].children).toHaveLength(2);
    expect(blocks[0].children![0].type).toBe("list-item");
    expect(blocks[0].children![0].props.text).toBe("Premier");
});

test("SectionCard → ignoré", () => {
    const blocks = parseJSXString(`<article><SectionCard title="X"/></article>`);
    expect(blocks).toHaveLength(0);
});

test("SlideScreen → slide-screen block avec children", () => {
    const blocks = parseJSXString(`
        <div>
            <SlidesScreen>
                <SlideScreen title="Introduction">
                    <SlideText>Bonjour</SlideText>
                    <SlideList>
                        <SlideListItem>Point 1</SlideListItem>
                    </SlideList>
                </SlideScreen>
            </SlidesScreen>
        </div>`);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("slide-screen");
    expect(blocks[0].props.title).toBe("Introduction");
    expect(blocks[0].children).toHaveLength(2);
    expect(blocks[0].children![0].type).toBe("text");
    expect(blocks[0].children![1].type).toBe("list");
});

test("SlideCode → code block avec highlight optionnel", () => {
    const blocks = parseJSXString(`<article><SlideCode language="javascript" highlight="1-3">{\`const x = 1;\`}</SlideCode></article>`);
    expect(blocks[0].type).toBe("code");
    expect(blocks[0].props.language).toBe("javascript");
    expect(blocks[0].props.highlight).toBe("1-3");
    expect(blocks[0].props.code).toBe("const x = 1;");
});

test("SlideNote → slide-note block", () => {
    const blocks = parseJSXString(`<article><SlideNote>{\`- Note 1\n- Note 2\`}</SlideNote></article>`);
    expect(blocks[0].type).toBe("slide-note");
    expect(typeof blocks[0].props.content).toBe("string");
    expect((blocks[0].props.content as string).includes("Note 1")).toBe(true);
});
