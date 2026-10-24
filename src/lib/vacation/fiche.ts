import type {IcalEvent} from "@/lib/vacation/ical";

/**
 * Regroupement des créneaux d'emploi du temps en lignes de la fiche
 * « Etat individuel des services effectués par un enseignant vacataire ».
 * Module pur (aucun import serveur) : partagé entre la route API et le panneau admin.
 */

/** Lignes disponibles dans le modèle Excel (B23:L38). */
export const FICHE_MAX_ROWS = 16;

export type SessionKind = "cours" | "td" | "tp";

export interface FicheRow {
    /** Jour, `YYYY-MM-DD`. */
    date: string;
    /** Code matière tel qu'attendu par l'onglet `code_matiere` (ex : `R3.01`). */
    code: string;
    /** Libellé lu dans l'emploi du temps — indicatif, la fiche affiche celui du modèle. */
    label: string;
    /** Année d'étude (colonne « 1ère - 2ème / 3ème année »). */
    annee: number | null;
    cours: number;
    td: number;
    tp: number;
}

export interface ParsedSession {
    code: string | null;
    label: string;
    annee: number | null;
    kind: SessionKind | null;
}

export interface FicheBuildResult {
    rows: FicheRow[];
    warnings: string[];
}

function field(description: string, name: string): string | null {
    const m = new RegExp(`^${name}\\s*:\\s*(.+)$`, "im").exec(description);
    return m ? m[1].trim() : null;
}

function toKind(value: string | null): SessionKind | null {
    if (!value) return null;
    const v = value.trim();
    if (/^(CM|cours|amphi|magistral)/i.test(v)) return "cours";
    if (/^TD/i.test(v)) return "td";
    if (/^TP/i.test(v)) return "tp";
    return null;
}

export function parseSession(summary: string, description: string): ParsedSession {
    const parts = summary.split(" - ").map((p) => p.trim());
    const matiere = field(description, "Matière") ?? parts[0] ?? "";

    const codeMatch = /^([A-Z]{1,4})?\s*(\d)\.(\d{1,2})\b\s*(.*)$/i.exec(matiere);
    const code = codeMatch
        ? `${(codeMatch[1] ?? "R").toUpperCase()}${codeMatch[2]}.${codeMatch[3].padStart(2, "0")}`
        : null;
    const label = codeMatch ? codeMatch[4].trim() : matiere;

    const groupe = `${summary}\n${description}`;
    const anneeMatch =
        /(\d)\s*(?:EME|ÈME|E|È|ERE|ÈRE|RE)\s+ANN[EÉ]E/i.exec(groupe) ?? /\bBUT\s*(\d)\b/i.exec(groupe);
    let annee = anneeMatch ? Number(anneeMatch[1]) : null;
    if (annee === null && codeMatch) annee = Math.ceil(Number(codeMatch[2]) / 2);

    const kind = toKind(field(description, "Type")) ?? toKind(parts.length > 1 ? parts[parts.length - 1] : null);

    return {code, label, annee, kind};
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Garde les créneaux horaires du mois demandé et les regroupe par jour + matière + année.
 * Les cours annulés sont écartés et signalés dans `warnings`.
 * `month` au format `YYYY-MM`.
 */
export function buildFicheRows(events: IcalEvent[], month: string): FicheBuildResult {
    const warnings: string[] = [];
    const byKey = new Map<string, FicheRow>();
    /** Heures annulées par jour + matière, pour un seul avertissement par ligne écartée. */
    const cancelled = new Map<string, {date: string; matiere: string; hours: number}>();

    for (const event of events) {
        if (event.allDay || event.durationMinutes <= 0 || !event.date.startsWith(`${month}-`)) continue;

        if (event.cancelled) {
            const s = parseSession(event.summary.replace(/^Annulation\s*:\s*/i, ""), event.description);
            const matiere = s.code ? `${s.code} ${s.label}`.trim() : s.label || event.summary;
            const key = `${event.date}|${matiere}`;
            const entry = cancelled.get(key) ?? {date: event.date, matiere, hours: 0};
            entry.hours = round2(entry.hours + event.durationMinutes / 60);
            cancelled.set(key, entry);
            continue;
        }

        const session = parseSession(event.summary, event.description);
        const hours = event.durationMinutes / 60;
        let kind = session.kind;
        if (!kind) {
            kind = "td";
            warnings.push(`${event.date} — type inconnu pour « ${event.summary} », compté en TD.`);
        }
        if (!session.code) {
            warnings.push(`${event.date} — code matière introuvable dans « ${event.summary} ».`);
        }

        const code = session.code ?? "";
        const key = `${event.date}|${code}|${session.annee ?? ""}`;
        const row = byKey.get(key) ?? {
            date: event.date,
            code,
            label: session.label,
            annee: session.annee,
            cours: 0,
            td: 0,
            tp: 0,
        };
        row[kind] = round2(row[kind] + hours);
        byKey.set(key, row);
    }

    for (const c of cancelled.values()) {
        warnings.push(`${c.date} — ${c.matiere} : ${String(c.hours).replace(".", ",")} h annulée(s) dans HyperPlanning, non comptée(s).`);
    }

    const rows = [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date) || a.code.localeCompare(b.code));
    if (rows.length > FICHE_MAX_ROWS) {
        warnings.push(`${rows.length} lignes pour ${FICHE_MAX_ROWS} places dans le modèle : regroupez ou retirez des lignes.`);
    }
    return {rows, warnings};
}

export interface FicheTotals {
    cours: number;
    td: number;
    tp: number;
    /** Équivalent TD : 1 h cours = 1,5 h ETD, 1 h TP = 2/3 h ETD (formule L40 du modèle). */
    etd: number;
}

export function computeTotals(rows: FicheRow[]): FicheTotals {
    const cours = round2(rows.reduce((s, r) => s + r.cours, 0));
    const td = round2(rows.reduce((s, r) => s + r.td, 0));
    const tp = round2(rows.reduce((s, r) => s + r.tp, 0));
    return {cours, td, tp, etd: cours * 1.5 + td + (tp * 2) / 3};
}

/** Année universitaire du mois (`YYYY-MM`) : septembre → août. */
export function academicYear(month: string): string {
    const [y, m] = month.split("-").map(Number);
    return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}
