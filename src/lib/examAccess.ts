import {createHmac, timingSafeEqual} from "node:crypto";

/**
 * Accès aux examens verrouillés (`Section.examenIsLock`), vérifié côté serveur.
 *
 * Le code distribué en salle est un HMAC de la section et du jour : il ne se déduit d'aucune
 * donnée envoyée au navigateur (l'ancien code valait la fin de l'`_id` du module,
 * présent dans la page). Une fois le code accepté, la route pose un cookie httpOnly
 * lié à l'utilisateur, à la section et au jour ; la page ne rend l'énoncé qu'à sa vue.
 *
 * Serveur uniquement : lit `BETTER_AUTH_SECRET`.
 */

// Alphabet sans caractères ambigus (0/O, 1/I) : 32 symboles, 6 caractères ≈ 10⁹ codes.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const EXAM_CODE_LENGTH = 6;

function secret(): string {
    const value = process.env.BETTER_AUTH_SECRET;
    if (!value) throw new Error("Variable d'environnement manquante : BETTER_AUTH_SECRET");
    return value;
}

function mac(...parts: string[]): Buffer {
    return createHmac("sha256", secret()).update(parts.join("\u0000")).digest();
}

function safeEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Jour calendaire à Paris (« 2026-10-24 ») : le code et le déverrouillage basculent à minuit
 * heure locale, pas à 1 h ou 2 h du matin comme avec le jour UTC.
 */
export function examDay(now: Date): string {
    return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Paris"}).format(now);
}

/**
 * Code d'accès de l'examen d'une section : change chaque jour, pour qu'un code transmis
 * par un groupe ne serve pas au groupe qui passe le même examen un autre jour.
 */
export function examCode(moduleSlug: string, sectionSlug: string, now = new Date()): string {
    const bytes = mac("exam-code", examDay(now), moduleSlug, sectionSlug);
    let code = "";
    for (let i = 0; i < EXAM_CODE_LENGTH; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    return code;
}

export function isExamCodeValid(input: string, moduleSlug: string, sectionSlug: string, now = new Date()): boolean {
    return safeEqual(input.trim().toUpperCase(), examCode(moduleSlug, sectionSlug, now));
}

/** Un cookie par section : déverrouiller un examen n'ouvre pas les autres. */
export function examAccessCookieName(moduleSlug: string, sectionSlug: string): string {
    return `exam_access_${moduleSlug}_${sectionSlug}`;
}

export function examAccessToken(userId: string, moduleSlug: string, sectionSlug: string, now = new Date()): string {
    return mac("exam-access", userId, moduleSlug, sectionSlug, examDay(now)).toString("base64url");
}

export function hasExamAccess(
    token: string | undefined, userId: string, moduleSlug: string, sectionSlug: string, now = new Date(),
): boolean {
    return !!token && safeEqual(token, examAccessToken(userId, moduleSlug, sectionSlug, now));
}
