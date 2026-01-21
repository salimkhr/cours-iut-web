// lib/slideConfig.ts ou config/slideConfig.ts

export const slideTextSizes = {
    // Headings
    heading: {
        1: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
        2: "text-3xl md:text-4xl lg:text-5xl font-semibold mb-4",
        3: "text-2xl md:text-3xl lg:text-4xl font-medium mb-3",
    },

    // Text content (utilisé aussi pour les items de liste)
    text: {
        default: "text-lg md:text-2xl lg:text-3xl",
        large: "text-xl md:text-2xl lg:text-3xl",
        xl: "text-2xl md:text-3xl lg:text-4xl",
    },

    // Special sizes for SlideTitle component
    title: {
        module: "text-xl md:text-2xl lg:text-3xl font-bold tracking-wide uppercase",
        section: "text-5xl md:text-6xl lg:text-7xl font-semibold",
        description: "text-2xl md:text-3xl lg:text-4xl font-light",
    }
} as const;

// Helper type for type safety
export type HeadingLevel = keyof typeof slideTextSizes.heading;
export type TextSize = keyof typeof slideTextSizes.text;