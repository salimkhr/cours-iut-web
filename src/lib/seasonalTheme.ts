/**
 * Thème saisonnier du site. Le thème de Noël s'active seul du 15 novembre au
 * 26 décembre inclus. La variable serveur `SEASONAL_THEME` force le choix :
 * `noel` l'active toute l'année (pour le tester), `off` le coupe.
 * Lue au rendu côté serveur : pas de préfixe NEXT_PUBLIC_, pas de rebuild.
 */
export type SeasonalTheme = "noel" | null;

export function isNoelSeason(date: Date): boolean {
    const month = date.getMonth(); // 0 = janvier, 10 = novembre, 11 = décembre
    const day = date.getDate();
    return (month === 10 && day >= 15) || (month === 11 && day <= 26);
}

export function getSeasonalTheme(
    date: Date = new Date(),
    override: string | undefined = process.env.SEASONAL_THEME,
): SeasonalTheme {
    const forced = override?.trim().toLowerCase();
    if (forced === "noel") return "noel";
    if (forced === "off") return null;
    return isNoelSeason(date) ? "noel" : null;
}
