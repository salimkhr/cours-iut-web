import { describe, it, expect } from "bun:test";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { SKILL_MANIFEST, SKILL_DOCUMENTS } from "../../src/lib/skills/pedagogy";

describe("Skills pédagogiques — manifeste", () => {
    it("expose les deux skills avec les champs obligatoires", () => {
        expect(SKILL_MANIFEST.id).toBe("pedagogy");
        expect(typeof SKILL_MANIFEST.version).toBe("string");
        expect(typeof SKILL_MANIFEST.content_hash).toBe("string");
        const ids = SKILL_MANIFEST.documents.map((d) => d.id);
        expect(ids).toContain("module-design");
        expect(ids).toContain("content-writer");
        expect(ids.length).toBe(2);
    });

    it("chaque document a un uri et un path sûrs", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            expect(doc.uri).toMatch(/^skill:\/\/pedagogy\//);
            expect(doc.path).not.toContain("..");
        }
    });
});

describe("Skills pédagogiques — documents", () => {
    it("les documents générés correspondent aux sources canoniques", () => {
        const skillRoot = path.join(process.cwd(), "skills");
        for (const doc of SKILL_MANIFEST.documents) {
            const loaded = SKILL_DOCUMENTS[doc.id];
            expect(loaded).toBeDefined();
            const source = fs.readFileSync(path.resolve(skillRoot, doc.path), "utf-8").replace(/\r\n/g, "\n");
            expect(loaded.content).toBe(source);
        }
    });

    it("aucun document orphelin : SKILL_DOCUMENTS = manifeste", () => {
        expect(Object.keys(SKILL_DOCUMENTS).sort()).toEqual(
            SKILL_MANIFEST.documents.map((d) => d.id).sort()
        );
    });

    it("les hashes sont cohérents avec le contenu", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            const computed = crypto.createHash("sha256").update(doc.content).digest("hex").slice(0, 12);
            expect(doc.contentHash).toBe(computed);
        }
    });

    it("module-design contient le workflow et les invariants clés", () => {
        const md = SKILL_DOCUMENTS["module-design"].content;
        for (const kw of ["list_verdicts", "module-design", "filRougeStep", "brief",
            "create_module", "create_section", "staging", "add_verdict", "courseIntroMinutes"]) {
            expect(md).toContain(kw);
        }
    });

    it("content-writer contient le workflow, la grammaire et les invariants", () => {
        const cw = SKILL_DOCUMENTS["content-writer"].content;
        for (const kw of ["list_verdicts", "list_exemplars", "list_block_types",
            "80", "100 %", "contrat de consigne", "fil rouge", "curriculum",
            "promote_exemplar", "distill_verdicts", "get_content", "save_content",
            "code-with-preview", "download-file", "collapsible", "projectRef",
            "slide-note", "Créez", "vouvoyé"]) {
            expect(cw).toContain(kw);
        }
    });

    it("l'examen est décrit comme TP indépendant hors fil rouge", () => {
        const cw = SKILL_DOCUMENTS["content-writer"].content;
        expect(cw).toContain("TP indépendant");
        expect(cw).toContain("HORS fil rouge");
    });

    it("aucun document ne contient de secret ni de chemin absolu", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            for (const p of [/MONGODB_URI/, /SCALEKIT_/, /BETTER_AUTH_SECRET/, /MCP_ADMIN_EMAILS/, /C:\\Users\\/, /\/home\//]) {
                expect(doc.content).not.toMatch(p);
            }
        }
    });
});
