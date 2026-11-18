import {connectToDB} from "@/lib/mongodb";

/**
 * Mode examen : bascule de secours, posée par un admin, qui retire le captcha Turnstile de
 * la connexion pour tout le monde pendant une durée bornée.
 *
 * Elle sert quand l'exemption par plage d'IP (`IUT_NETWORK_CIDRS`) ne suffit pas : plage mal
 * renseignée, sortie réseau de l'IUT qui a changé. Le mode porte une date de fin et s'éteint
 * seul : on ne peut pas l'oublier ouvert après l'épreuve.
 *
 * Document unique `app_settings` / `_id: "exam_mode"` (lu par `_id`, pas d'index à ajouter).
 * Serveur uniquement.
 */

export const EXAM_MODE_MIN_MINUTES = 15;
export const EXAM_MODE_MAX_MINUTES = 8 * 60;

const COLLECTION = "app_settings";
const DOC_ID = "exam_mode";

// Le captcha consulte l'état à chaque connexion : un cache court évite une lecture en base
// par requête. Il est vidé dès qu'un admin bascule le mode sur cette instance.
const CACHE_TTL_MS = 10_000;

type ExamModeDoc = {_id: string; until: Date; enabledBy: string; enabledAt: Date};

export type ExamModeState = {
    active: boolean;
    until: Date | null;
    enabledBy: string | null;
};

const INACTIVE: ExamModeState = {active: false, until: null, enabledBy: null};

let cache: {doc: ExamModeDoc | null; expiresAt: number} | null = null;

/** Vide le cache (après une bascule, et dans les tests). */
export function resetExamModeCache(): void {
    cache = null;
}

async function readDoc(): Promise<ExamModeDoc | null> {
    const now = Date.now();
    if (cache && now < cache.expiresAt) return cache.doc;
    const db = await connectToDB();
    const doc = await db.collection<ExamModeDoc>(COLLECTION).findOne({_id: DOC_ID});
    cache = {doc, expiresAt: now + CACHE_TTL_MS};
    return doc;
}

function stateOf(doc: ExamModeDoc | null, now: Date): ExamModeState {
    if (!doc || doc.until.getTime() <= now.getTime()) return INACTIVE;
    return {active: true, until: doc.until, enabledBy: doc.enabledBy};
}

/** État courant. Lève si la base ne répond pas : l'appelant décide. */
export async function getExamMode(now: Date = new Date()): Promise<ExamModeState> {
    return stateOf(await readDoc(), now);
}

/** `true` si le mode examen est actif. Échoue fermé : base indisponible → `false` (captcha exigé). */
export async function isExamModeActive(now: Date = new Date()): Promise<boolean> {
    try {
        return (await getExamMode(now)).active;
    } catch (error) {
        console.error("[examMode] lecture impossible, captcha maintenu", error);
        return false;
    }
}

export async function enableExamMode(durationMinutes: number, userId: string, now: Date = new Date()): Promise<ExamModeState> {
    const until = new Date(now.getTime() + durationMinutes * 60_000);
    const db = await connectToDB();
    await db.collection<ExamModeDoc>(COLLECTION).updateOne(
        {_id: DOC_ID},
        {$set: {until, enabledBy: userId, enabledAt: now}},
        {upsert: true},
    );
    resetExamModeCache();
    console.warn(`[examMode] activé par ${userId} jusqu'à ${until.toISOString()}`);
    return {active: true, until, enabledBy: userId};
}

export async function disableExamMode(): Promise<void> {
    const db = await connectToDB();
    await db.collection<ExamModeDoc>(COLLECTION).deleteOne({_id: DOC_ID});
    resetExamModeCache();
    console.warn("[examMode] désactivé");
}
