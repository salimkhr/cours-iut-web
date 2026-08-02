// Échelle typographique des slides.
//
// Les tailles restent propres aux slides : DESIGN.md calibre `body` à 1rem pour
// une lecture à 50 cm, ce qui serait illisible projeté au fond d'une salle.
// Ce qui est aligné sur DESIGN.md, ce sont les ATTRIBUTS : famille (IBM Plex
// Sans, héritée), graisses et letter-spacing des rôles correspondants
// (display 800 / -0.025em, headline 700 / -0.015em, label 600 / 0.2em).

export const slideTextSizes = {
    // Titres internes à une slide
    heading: {
        1: "text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-[-0.025em] mb-0",
        2: "text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.015em] mb-4",
        3: "text-xl md:text-2xl lg:text-3xl font-semibold mb-3",
    },

    // Contenu courant (également utilisé par les items de liste)
    text: {
        default: "text-lg md:text-2xl lg:text-3xl",
        large: "text-xl md:text-3xl lg:text-4xl",
        xl: "text-2xl md:text-4xl lg:text-5xl",
    },

    // Slide de titre
    title: {
        module: "text-[0.6875rem] font-semibold tracking-[0.2em] uppercase",
        section: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.025em]",
        description: "text-lg md:text-xl lg:text-2xl font-light",
    },
} as const;

// Helper type for type safety
export type HeadingLevel = keyof typeof slideTextSizes.heading;
export type TextSize = keyof typeof slideTextSizes.text;
