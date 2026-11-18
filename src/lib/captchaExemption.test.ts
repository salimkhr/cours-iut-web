import {describe, expect, test} from "bun:test";
import {captcha} from "better-auth/plugins";
import type {AuthContext} from "@better-auth/core";
import {relaxedSignInRateRule, withCaptchaExemption} from "@/lib/captchaExemption";

// Contexte minimal : le plugin ne lit que `options` (basePath, ipAddress) et `logger`.
const ctx = {
    options: {basePath: "/api/auth"},
    logger: {error: () => {}, warn: () => {}},
} as unknown as AuthContext;

const signIn = (method = "POST") =>
    new Request("https://cours.test/api/auth/sign-in/email", {method});

const turnstile = () => captcha({provider: "cloudflare-turnstile", secretKey: "test-secret"});

describe("withCaptchaExemption", () => {
    test("garde l'identité du plugin captcha", () => {
        expect(withCaptchaExemption(turnstile(), async () => true).id).toBe("captcha");
    });

    test("requête exemptée, sans jeton : laisse passer", async () => {
        const plugin = withCaptchaExemption(turnstile(), async () => true);
        expect(await plugin.onRequest(signIn(), ctx)).toBeUndefined();
    });

    test("requête non exemptée, sans jeton : refuse avant tout appel à Cloudflare", async () => {
        const plugin = withCaptchaExemption(turnstile(), async () => false);
        const result = await plugin.onRequest(signIn(), ctx);
        expect(result?.response.status).toBe(400);
        expect((await result?.response.json()).code).toBe("MISSING_RESPONSE");
    });

    test("ne consulte l'exemption que pour les POST (pas à chaque get-session)", async () => {
        let calls = 0;
        const plugin = withCaptchaExemption(turnstile(), async () => { calls++; return true; });
        await plugin.onRequest(new Request("https://cours.test/api/auth/get-session"), ctx);
        expect(calls).toBe(0);
        await plugin.onRequest(signIn(), ctx);
        expect(calls).toBe(1);
    });
});

describe("relaxedSignInRateRule", () => {
    const current = {window: 10, max: 3};

    test("requête exemptée : plafond relevé pour une salle entière", async () => {
        const resolved = await relaxedSignInRateRule(async () => true)(signIn(), current);
        expect(resolved.max).toBeGreaterThanOrEqual(60);
    });

    test("sinon : règle par défaut", async () => {
        expect(await relaxedSignInRateRule(async () => false)(signIn(), current)).toEqual(current);
    });
});
