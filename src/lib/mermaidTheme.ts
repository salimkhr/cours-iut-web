// Palette Mermaid alignée sur DESIGN.md.
//
// Mermaid s'initialise via un appel JS impératif : il ne peut pas consommer les
// classes Tailwind ni les `var(--color-*)` du thème. Ses thèmes livrés
// (`default`, `dark`) sortent en lavande/bleu, ce qui viole frontalement « La
// Règle des Couleurs Chaudes » de DESIGN.md et fait détonner tout diagramme sur
// une page de cours comme sur une slide.
//
// On lit donc les tokens réels au moment du rendu et on les repasse à Mermaid en
// `themeVariables` : DESIGN.md reste la source de vérité, et cours et slides
// rendent leurs diagrammes à l'identique.

const FALLBACK_LIGHT = {
    surface: "#ecd4b3",   // bridge-100
    surfaceAlt: "#e2bd8e", // bridge-200
    page: "#f7ebd9",      // bridge-50
    line: "#93613a",      // bridge-500
    text: "#221e18",      // brand-dark
    accent: "#C2410C",    // brand-primary
} as const;

const FALLBACK_DARK = {
    surface: "#5e3b22",   // bridge-700
    surfaceAlt: "#3f2818", // bridge-800
    page: "#2a1d12",      // bridge-900
    line: "#b8835a",      // bridge-400
    text: "#f0d5b7",      // brand-light
    accent: "#FB923C",    // brand-accent
} as const;

function readVar(scope: Element | null, name: string, fallback: string): string {
    if (typeof window === "undefined") return fallback;
    const root = scope ?? document.documentElement;
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
}

/**
 * Variables de thème Mermaid dérivées de la palette du pont.
 *
 * @param isDark   mode sombre actif
 * @param scopeEl  élément portant `--module-color` (scope `header-${path}`) ;
 *                 les bordures de nœuds prennent alors la couleur du module.
 */
export function mermaidThemeVariables(isDark: boolean, scopeEl?: Element | null) {
    const p = isDark ? FALLBACK_DARK : FALLBACK_LIGHT;

    const surface = readVar(scopeEl ?? null, isDark ? "--color-bridge-700" : "--color-bridge-100", p.surface);
    const surfaceAlt = readVar(scopeEl ?? null, isDark ? "--color-bridge-800" : "--color-bridge-200", p.surfaceAlt);
    const page = readVar(scopeEl ?? null, isDark ? "--color-bridge-900" : "--color-bridge-50", p.page);
    const line = readVar(scopeEl ?? null, isDark ? "--color-bridge-400" : "--color-bridge-500", p.line);
    const text = readVar(scopeEl ?? null, isDark ? "--color-brand-light" : "--color-brand-dark", p.text);
    const accent = readVar(scopeEl ?? null, isDark ? "--module-color-dark" : "--module-color", p.accent);

    return {
        background: "transparent",
        // Nœuds
        primaryColor: surface,
        primaryTextColor: text,
        primaryBorderColor: accent,
        secondaryColor: surfaceAlt,
        secondaryTextColor: text,
        secondaryBorderColor: line,
        tertiaryColor: page,
        tertiaryTextColor: text,
        tertiaryBorderColor: line,
        // Traits et libellés
        lineColor: line,
        textColor: text,
        mainBkg: surface,
        nodeBorder: accent,
        nodeTextColor: text,
        edgeLabelBackground: page,
        clusterBkg: page,
        clusterBorder: line,
        titleColor: text,
        // Séquence
        actorBkg: surface,
        actorBorder: accent,
        actorTextColor: text,
        actorLineColor: line,
        signalColor: text,
        signalTextColor: text,
        labelBoxBkgColor: surfaceAlt,
        labelBoxBorderColor: line,
        labelTextColor: text,
        loopTextColor: text,
        noteBkgColor: surfaceAlt,
        noteBorderColor: line,
        noteTextColor: text,
    };
}
