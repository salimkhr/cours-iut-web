import { describe, it, expect } from "bun:test";
import crypto from "crypto";
import {
    SKILL_MANIFEST,
    SKILL_DOCUMENTS,
    SKILL_VERSION,
    SKILL_HASH,
} from "../../src/lib/skills/pedagogie";

describe("Skill pédagogique — manifeste", () => {
    it("contient les champs obligatoires", () => {
        expect(SKILL_MANIFEST.id).toBe("pedagogie");
        expect(typeof SKILL_MANIFEST.version).toBe("string");
        expect(SKILL_MANIFEST.supported_content_types).toContain("course");
        expect(SKILL_MANIFEST.supported_content_types).toContain("slides");
        expect(SKILL_MANIFEST.supported_content_types).toContain("practical_work");
        expect(SKILL_MANIFEST.roles).toContain("instructional_designer");
        expect(SKILL_MANIFEST.roles).toContain("struggling_learner_auditor");
        expect(SKILL_MANIFEST.roles).toContain("curriculum_coherence_auditor");
        expect(typeof SKILL_MANIFEST.content_hash).toBe("string");
        expect(SKILL_MANIFEST.content_hash).not.toBe("placeholder");
        expect(Array.isArray(SKILL_MANIFEST.documents)).toBe(true);
        expect(SKILL_MANIFEST.documents.length).toBeGreaterThan(0);
    });

    it("chaque document du manifeste a un id, uri et path valides", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            expect(typeof doc.id).toBe("string");
            expect(doc.uri).toMatch(/^skill:\/\/pedagogie\//);
            expect(typeof doc.path).toBe("string");
            expect(doc.path).not.toContain("..");
        }
    });

    it("SKILL_VERSION et SKILL_HASH correspondent au manifeste", () => {
        expect(SKILL_VERSION).toBe(SKILL_MANIFEST.version);
        expect(SKILL_HASH).toBe(SKILL_MANIFEST.content_hash);
    });
});

describe("Skill pédagogique — documents", () => {
    it("chaque document du manifeste est chargeable", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            const loaded = SKILL_DOCUMENTS[doc.id];
            expect(loaded).toBeDefined();
            expect(loaded.content.length).toBeGreaterThan(10);
            expect(loaded.mimeType).toBe("text/markdown");
        }
    });

    it("le document main contient les sections obligatoires", () => {
        const main = SKILL_DOCUMENTS["main"];
        expect(main).toBeDefined();
        expect(main.content).toContain("Routage");
        expect(main.content).toContain("Workflow principal");
        expect(main.content).toContain("Contrat d'entrée");
        expect(main.content).toContain("Consolidation");
        expect(main.content).toContain("repli");
    });

    it("les trois rôles sont présents et non vides", () => {
        const roles = ["concepteur", "auditeur-apprenant", "garant-coherence"];
        for (const id of roles) {
            const doc = SKILL_DOCUMENTS[id];
            expect(doc).toBeDefined();
            expect(doc.content.length).toBeGreaterThan(100);
            expect(doc.contentHash).not.toBe("");
        }
    });

    it("les quatre références éditoriales sont présentes", () => {
        const refs = ["ref-cours", "ref-tp", "ref-slide", "ref-examen"];
        for (const id of refs) {
            const doc = SKILL_DOCUMENTS[id];
            expect(doc).toBeDefined();
            expect(doc.content.length).toBeGreaterThan(50);
        }
    });

    it("un document inconnu retourne undefined (non une erreur)", () => {
        expect(SKILL_DOCUMENTS["inexistant"]).toBeUndefined();
    });

    it("aucun document ne contient de données sensibles", () => {
        const sensitivePatterns = [
            /MONGODB_URI/,
            /SCALEKIT_/,
            /BETTER_AUTH_SECRET/,
            /MCP_ADMIN_EMAILS/,
        ];
        for (const [_id, doc] of Object.entries(SKILL_DOCUMENTS)) {
            for (const pattern of sensitivePatterns) {
                if (pattern.test(doc.content)) {
                    throw new Error(`Document "${_id}" contient un pattern sensible : ${pattern}`);
                }
            }
        }
    });

    it("les URIs des documents sont stables et sans double slash", () => {
        for (const doc of SKILL_MANIFEST.documents) {
            const parts = doc.uri.replace("skill://", "").split("/");
            for (const part of parts) {
                expect(part.length).toBeGreaterThan(0);
            }
        }
    });

    it("les hashes des documents sont cohérents avec leur contenu", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            const computed = crypto
                .createHash("sha256")
                .update(doc.content)
                .digest("hex")
                .slice(0, 12);
            expect(doc.contentHash).toBe(computed);
        }
    });
});

describe("Skill pédagogique — sécurité", () => {
    it("aucun document n'expose de chemin système absolu", () => {
        for (const [_id, doc] of Object.entries(SKILL_DOCUMENTS)) {
            expect(doc.content).not.toMatch(/C:\\Users\\/);
            expect(doc.content).not.toMatch(/\/home\//);
        }
    });

    it("les IDs de documents ne contiennent pas de séparateurs de chemin", () => {
        for (const doc of Object.values(SKILL_DOCUMENTS)) {
            expect(doc.id).not.toContain("/");
            expect(doc.id).not.toContain("\\");
            expect(doc.id).not.toContain("..");
        }
    });
});
