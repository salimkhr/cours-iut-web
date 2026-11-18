import type {AuthContext} from "@better-auth/core";
import {isIutNetworkRequest} from "@/lib/iutNetwork";
import {isExamModeActive} from "@/lib/examMode";

/**
 * Quand ne pas exiger le captcha Turnstile.
 *
 * En salle d'examen, le réseau ne laisse passer que le site : challenges.cloudflare.com est
 * bloqué et la connexion devient impossible. Deux voies d'exemption :
 * - la requête vient du réseau de l'IUT (`IUT_NETWORK_CIDRS`, voir `@/lib/iutNetwork`) ;
 * - un admin a activé le mode examen (bascule de secours, voir `@/lib/examMode`).
 *
 * Dans les deux cas on relève aussi la limite de tentatives de `/sign-in/*` : une salle
 * entière partage la même IP publique, et la règle par défaut de better-auth (3 connexions
 * par 10 s et par IP) bloquerait la plupart des étudiants à l'ouverture de l'épreuve.
 *
 * Serveur uniquement.
 */

// Derrière le proxy Cloudflare puis Dokploy. `cf-connecting-ip` est posé par Cloudflare ;
// partagé par better-auth (sessions, rate-limit, Turnstile) et par l'exemption.
export const IP_ADDRESS_OPTIONS = {
    advanced: {
        ipAddress: {
            ipAddressHeaders: [
                "cf-connecting-ip",   // Cloudflare (le site est derrière son proxy)
                "x-forwarded-for",    // standard RFC 7239
            ],
        },
    },
};

// Une salle d'une trentaine de postes, plus les fautes de frappe et les rechargements.
const RELAXED_SIGN_IN_RATE = {window: 10, max: 60};

export type ExemptionCheck = (req: Request | Headers) => Promise<boolean>;

/** Exemption par défaut : réseau de l'IUT, ou mode examen actif. */
export const isCaptchaExempt: ExemptionCheck = async (req) =>
    isIutNetworkRequest(req, IP_ADDRESS_OPTIONS) || (await isExamModeActive());

type CaptchaLikePlugin = {
    onRequest: (request: Request, ctx: AuthContext) => Promise<{response: Response} | undefined>;
};

/**
 * Enveloppe le plugin captcha : pas de vérification pour une requête exemptée.
 * Les routes protégées sont toutes en POST ; on ne consulte l'exemption (donc la base, au
 * pire) que pour elles, pas à chaque `get-session`.
 */
export function withCaptchaExemption<P extends CaptchaLikePlugin>(plugin: P, isExempt: ExemptionCheck = isCaptchaExempt): P {
    return {
        ...plugin,
        onRequest: async (request: Request, ctx: AuthContext) => {
            if (request.method === "POST" && await isExempt(request)) return undefined;
            return plugin.onRequest(request, ctx);
        },
    };
}

type RateRule = {window: number; max: number};

/** Règle `rateLimit.customRules` pour `/sign-in/*` : plafond relevé si exempté, inchangé sinon. */
export function relaxedSignInRateRule(isExempt: ExemptionCheck = isCaptchaExempt) {
    return async (request: Request, current: RateRule): Promise<RateRule> =>
        (await isExempt(request)) ? RELAXED_SIGN_IN_RATE : current;
}
