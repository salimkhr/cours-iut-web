import {describe, expect, it} from "bun:test";
import {RESOURCE_KINDS, resourceFormSchema, resourceVisibilitySchema} from "./resource.schema";

const valid = {
    title: "An Alien Mind",
    url: "https://openai.com/fr-FR/index/an-alien-mind/",
    description: "Un texte sur l'évolution des modèles d'IA.",
    kind: "article",
};

describe("resourceFormSchema", () => {
    it("accepte une ressource complète", () => {
        expect(resourceFormSchema.safeParse(valid).success).toBe(true);
    });

    it("expose les quatre types", () => {
        expect(RESOURCE_KINDS).toEqual(["article", "video", "recherche", "outil"]);
    });

    it("refuse un type inconnu", () => {
        expect(resourceFormSchema.safeParse({...valid, kind: "podcast"}).success).toBe(false);
    });

    it("refuse les champs vides", () => {
        expect(resourceFormSchema.safeParse({...valid, title: "  "}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, description: ""}).success).toBe(false);
    });

    it("refuse une URL invalide ou hors http(s)", () => {
        expect(resourceFormSchema.safeParse({...valid, url: "pas-une-url"}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, url: "javascript:alert(1)"}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, url: "data:text/html,<script>1</script>"}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, url: "http://exemple.fr/page"}).success).toBe(true);
    });

    it("rogne les espaces autour des champs texte", () => {
        const parsed = resourceFormSchema.parse({...valid, title: "  Titre  ", url: " https://exemple.fr "});
        expect(parsed.title).toBe("Titre");
        expect(parsed.url).toBe("https://exemple.fr");
    });
});

describe("resourceFormSchema — durée et mot du prof", () => {
    it("accepte une ressource sans durée ni mot du prof", () => {
        const parsed = resourceFormSchema.parse(valid);
        expect(parsed.durationMin).toBeUndefined();
        expect(parsed.note).toBeUndefined();
    });

    it("accepte une durée en minutes entière et positive", () => {
        expect(resourceFormSchema.parse({...valid, durationMin: 43}).durationMin).toBe(43);
        expect(resourceFormSchema.safeParse({...valid, durationMin: 0}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, durationMin: -5}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, durationMin: 12.5}).success).toBe(false);
        expect(resourceFormSchema.safeParse({...valid, durationMin: 601}).success).toBe(false);
    });

    it("rogne le mot du prof et traite le vide comme absent", () => {
        expect(resourceFormSchema.parse({...valid, note: "  À lire en premier.  "}).note).toBe("À lire en premier.");
        expect(resourceFormSchema.parse({...valid, note: "   "}).note).toBeUndefined();
    });

    it("limite le mot du prof à 300 caractères", () => {
        expect(resourceFormSchema.safeParse({...valid, note: "a".repeat(300)}).success).toBe(true);
        expect(resourceFormSchema.safeParse({...valid, note: "a".repeat(301)}).success).toBe(false);
    });
});

describe("resourceVisibilitySchema", () => {
    it("exige un booléen", () => {
        expect(resourceVisibilitySchema.safeParse({isVisible: false}).success).toBe(true);
        expect(resourceVisibilitySchema.safeParse({isVisible: "oui"}).success).toBe(false);
    });
});
