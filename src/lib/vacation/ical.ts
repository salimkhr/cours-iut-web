/**
 * Parseur iCalendar (RFC 5545) volontairement réduit aux VEVENT et aux propriétés
 * utiles pour la fiche de vacations : SUMMARY, DESCRIPTION, DTSTART, DTEND.
 * Format observé côté HyperPlanning (Université Le Havre) :
 *   SUMMARY: "3.01 Dev web - <IUT 2EME ANNEE INFORMATIQUE> G - TD"
 *   DESCRIPTION: "Matière : 3.01 Dev web\nEnseignant : …\nTD : &lt\;IUT 2EME ANNEE…&gt\; G\nSalle : …\nType : TD\n"
 *   DTSTART/DTEND en UTC (suffixe Z) ; vacances et jours fériés en journées entières (VALUE=DATE).
 * Cours annulé : HyperPlanning n'émet pas STATUS:CANCELLED mais garde l'événement avec un UID
 * « COURSANNULE-… » et un SUMMARY / une DESCRIPTION préfixés par « Annulation : ».
 */

export const ICAL_TIME_ZONE = "Europe/Paris";

export interface IcalEvent {
    uid: string;
    summary: string;
    description: string;
    /** Jour calendaire à Paris, `YYYY-MM-DD`. */
    date: string;
    /** Durée en minutes (0 pour un événement « journée entière »). */
    durationMinutes: number;
    allDay: boolean;
    /** Cours annulé dans HyperPlanning (toujours présent dans le flux, à ne pas compter). */
    cancelled: boolean;
}

interface RawDate {
    /** Horodatage comparable (ms) — UTC réel si `utc`, sinon heure murale encodée en UTC. */
    ms: number;
    utc: boolean;
    allDay: boolean;
}

const parisDateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ICAL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

function unfold(text: string): string[] {
    return text.replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function unescapeText(value: string): string {
    return value
        .replace(/\\[nN]/g, "\n")
        .replace(/\\([,;\\])/g, "$1")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&amp;/g, "&");
}

const CANCELLED_UID = /^COURSANNULE-/i;
const CANCELLED_TEXT = /^Annul(?:ation|é)\b/i;

export function isCancelled(uid: string, summary: string, description: string): boolean {
    return CANCELLED_UID.test(uid) || CANCELLED_TEXT.test(summary) || CANCELLED_TEXT.test(description);
}

function parseDate(params: string, value: string): RawDate | null {
    const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(value.trim());
    if (!m) return null;
    const [, y, mo, d, h, mi, s, z] = m;
    const allDay = h === undefined || /VALUE=DATE(?!-)/i.test(params);
    const ms = Date.UTC(+y, +mo - 1, +d, h ? +h : 0, mi ? +mi : 0, s ? +s : 0);
    return {ms, utc: Boolean(z), allDay};
}

function toCalendarDate(raw: RawDate): string {
    // Heure UTC → jour à Paris ; heure flottante / TZID → la date murale telle quelle.
    if (raw.utc) return parisDateFormatter.format(new Date(raw.ms));
    return new Date(raw.ms).toISOString().slice(0, 10);
}

export function parseIcal(text: string): IcalEvent[] {
    const events: IcalEvent[] = [];
    let current: Record<string, {params: string; value: string}> | null = null;

    for (const line of unfold(text)) {
        if (line === "BEGIN:VEVENT") {
            current = {};
            continue;
        }
        if (line === "END:VEVENT") {
            if (current) {
                const start = current.DTSTART ? parseDate(current.DTSTART.params, current.DTSTART.value) : null;
                const end = current.DTEND ? parseDate(current.DTEND.params, current.DTEND.value) : null;
                if (start) {
                    const allDay = start.allDay;
                    const uid = current.UID?.value ?? "";
                    const summary = unescapeText(current.SUMMARY?.value ?? "").trim();
                    const description = unescapeText(current.DESCRIPTION?.value ?? "").trim();
                    events.push({
                        uid,
                        summary,
                        description,
                        date: toCalendarDate(start),
                        durationMinutes: allDay || !end ? 0 : Math.max(0, Math.round((end.ms - start.ms) / 60000)),
                        allDay,
                        cancelled: isCancelled(uid, summary, description),
                    });
                }
            }
            current = null;
            continue;
        }
        if (!current) continue;

        const colon = line.indexOf(":");
        if (colon < 0) continue;
        const head = line.slice(0, colon);
        const semi = head.indexOf(";");
        const name = (semi < 0 ? head : head.slice(0, semi)).toUpperCase();
        const params = semi < 0 ? "" : head.slice(semi + 1);
        current[name] = {params, value: line.slice(colon + 1)};
    }

    return events;
}
