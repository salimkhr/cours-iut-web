/** Mois (0 = janvier) où commence l'année universitaire : septembre. */
const ACADEMIC_YEAR_START_MONTH = 8;

/** Date et mois courants à Paris, indépendamment du fuseau du serveur. */
function parisYearMonth(now: Date): {year: number; month: number} {
    const parts = new Intl.DateTimeFormat("en-US", {timeZone: "Europe/Paris", year: "numeric", month: "numeric"})
        .formatToParts(now);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return {year: get("year"), month: get("month") - 1};
}

/** Début (1er septembre, 00h UTC) de l'année universitaire qui contient `now`, d'après la date à Paris. */
export function academicYearStart(now: Date): Date {
    const {year, month} = parisYearMonth(now);
    return new Date(Date.UTC(month >= ACADEMIC_YEAR_START_MONTH ? year : year - 1, ACADEMIC_YEAR_START_MONTH, 1));
}
