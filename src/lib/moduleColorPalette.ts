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
    { colorLight: "#C13B1A", colorDark: "#DD977D" }, // rouge
    { colorLight: "#3B3F7A", colorDark: "#9D98AB" }, // indigo
    { colorLight: "#7A6200", colorDark: "#BBA971" }, // or
    { colorLight: "#6B21A8", colorDark: "#B48AC1" }, // violet
    { colorLight: "#1338A0", colorDark: "#8A95BE" }, // bleu
    { colorLight: "#0F6E6E", colorDark: "#88AFA6" }, // teal
    { colorLight: "#2F6B2F", colorDark: "#97AE87" }, // vert
    { colorLight: "#9D1D5A", colorDark: "#CC889C" }, // magenta
];
