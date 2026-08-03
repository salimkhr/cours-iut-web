/**
 * Rang de section porté par le badge du bandeau de titre d'une slide.
 *
 * Un même titre peut couvrir plusieurs slides consécutives : c'est UNE section
 * développée en plusieurs écrans, pas trois sections. Le badge suit donc le
 * titre, pas la position dans le deck — exactement comme la lettre de section
 * du cours, qui ne s'incrémente pas à chaque paragraphe.
 *
 * @param titles titres des slides, dans l'ordre du deck
 * @returns un rang 1-based par slide, constant sur une suite de titres égaux
 */
export function computeSlideOrders(titles: string[]): number[] {
    let order = 0;
    let previous: string | null = null;

    return titles.map((title) => {
        if (title !== previous) {
            order += 1;
            previous = title;
        }
        return order;
    });
}
