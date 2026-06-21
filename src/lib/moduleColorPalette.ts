export interface ModuleColorPair {
    colorLight: string;
    colorDark: string;
}

/**
 * Paires (light/dark) au contraste pré-validé :
 * - light : lisible sur fond crème #f7ebd9 ET avec texte blanc
 * - dark  : lisible sur fond sombre ET en fond avec texte sombre
 * Les 4 premières reprennent les couleurs historiques de globals.css.
 */
export const MODULE_COLOR_PALETTE: ModuleColorPair[] = [
    { colorLight: "#C13B1A", colorDark: "#FF8568" }, // rouge
    { colorLight: "#3B3F7A", colorDark: "#9198E5" }, // indigo
    { colorLight: "#7A6200", colorDark: "#FFD93D" }, // or
    { colorLight: "#6B21A8", colorDark: "#C07AF8" }, // violet
    { colorLight: "#1338A0", colorDark: "#6B9FFF" }, // bleu
    { colorLight: "#0F6E6E", colorDark: "#4FD1C5" }, // teal
    { colorLight: "#2F6B2F", colorDark: "#7BD88F" }, // vert
    { colorLight: "#9D1D5A", colorDark: "#F472B6" }, // magenta
];
