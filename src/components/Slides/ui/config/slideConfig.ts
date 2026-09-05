// Échelle typographique des slides, réduite à 80 % pour la lecture à zoom 100 %.
//
// Les tailles restent propres aux slides : DESIGN.md calibre `body` à 1rem pour
// une lecture à 50 cm, ce qui serait illisible projeté au fond d'une salle.
// Ce qui est aligné sur DESIGN.md, ce sont les ATTRIBUTS : famille (IBM Plex
// Sans, héritée), graisses et letter-spacing des rôles correspondants
// (display 800 / -0.025em, headline 700 / -0.015em, label 600 / 0.2em).

export const slideTextSizes = {
    // Titres internes à une slide
    heading: {
        1: "text-[1.5rem] md:text-[1.8rem] lg:text-[2.4rem] font-extrabold tracking-[-0.025em] mb-0",
        2: "text-[1.2rem] md:text-[1.5rem] lg:text-[1.8rem] font-bold tracking-[-0.015em] mb-4",
        3: "text-[1rem] md:text-[1.2rem] lg:text-[1.5rem] font-semibold mb-3",
    },

    // Contenu courant (également utilisé par les items de liste)
    text: {
        default: "text-[1.2rem] md:text-[1.4rem] lg:text-[1.6rem]",
        large: "text-[1rem] md:text-[1.5rem] lg:text-[1.8rem]",
        xl: "text-[1.2rem] md:text-[1.8rem] lg:text-[2.4rem]",
    },

    // Tableaux : paliers du thème, avec davantage de place en plein écran.
    table: {
        default: "text-lg md:text-xl lg:text-2xl [:fullscreen_&]:text-3xl",
        large: "text-xl md:text-2xl lg:text-3xl [:fullscreen_&]:text-4xl",
        xl: "text-2xl md:text-3xl lg:text-4xl [:fullscreen_&]:text-5xl",
    },

    // Slide de titre
    title: {
        module: "text-[0.6875rem] font-semibold tracking-[0.2em] uppercase",
        section: "text-[1.8rem] md:text-[2.4rem] lg:text-[3rem] font-extrabold tracking-[-0.025em]",
        description: "text-[0.9rem] md:text-[1rem] lg:text-[1.2rem] font-light",
    },
} as const;

// Helper type for type safety
export type HeadingLevel = keyof typeof slideTextSizes.heading;
export type TextSize = keyof typeof slideTextSizes.text;
