import {describe, expect, test} from "bun:test";
import {applySecurityHeaders, isCrossSiteWrite} from "@/lib/securityHeaders";

const h = (init: Record<string, string>) => new Headers(init);

describe("isCrossSiteWrite", () => {
    test("les lectures ne sont jamais visées", () => {
        expect(isCrossSiteWrite("GET", h({"sec-fetch-site": "cross-site"}))).toBe(false);
        expect(isCrossSiteWrite("HEAD", h({origin: "https://evil.example"}))).toBe(false);
    });

    test("Sec-Fetch-Site : seule la même origine (ou une saisie directe) passe", () => {
        expect(isCrossSiteWrite("POST", h({"sec-fetch-site": "same-origin"}))).toBe(false);
        expect(isCrossSiteWrite("POST", h({"sec-fetch-site": "none"}))).toBe(false);
        expect(isCrossSiteWrite("POST", h({"sec-fetch-site": "cross-site"}))).toBe(true);
        // Autre sous-domaine du même site (forge, staging) : refusé.
        expect(isCrossSiteWrite("DELETE", h({"sec-fetch-site": "same-site"}))).toBe(true);
    });

    test("à défaut, compare l'hôte de Origin à l'hôte public de la requête", () => {
        expect(isCrossSiteWrite("POST", h({origin: "https://cours.example", host: "cours.example"}))).toBe(false);
        expect(isCrossSiteWrite("POST", h({origin: "https://cours.example", host: "app:3000", "x-forwarded-host": "cours.example"}))).toBe(false);
        expect(isCrossSiteWrite("POST", h({origin: "https://git.cours.example", host: "cours.example"}))).toBe(true);
        expect(isCrossSiteWrite("POST", h({origin: "null", host: "cours.example"}))).toBe(true);
    });

    test("appel serveur à serveur, sans en-tête de navigateur : non visé", () => {
        expect(isCrossSiteWrite("POST", h({"x-sync-secret": "s"}))).toBe(false);
    });
});

describe("applySecurityHeaders", () => {
    test("interdit l'intégration par un site tiers et durcit la réponse", () => {
        const res = applySecurityHeaders(new Response(null));
        expect(res.headers.get("Content-Security-Policy")).toBe("frame-ancestors 'self'");
        expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
        expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    });
});
