import type {Config} from "tailwindcss";
import {PluginAPI} from "tailwindcss/plugin";

const moduleColors = {
    "html-css": "#d64216",
    php: "#676aa8",
    javascript: "#b08e00",
    login: "#1a3a94",
};

export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class', // Activation du dark mode
    theme: {
        extend: {
            colors: {
                ...moduleColors,
            },
        },
    },
    plugins: [
        function ({addUtilities}: PluginAPI) {
            const newUtilities: Record<
                string,
                Record<string, string>
            > = {};

            Object.entries(moduleColors).forEach(([name, color]) => {
                // Classes normales
                newUtilities[`.text-${name}`] = {color};
                newUtilities[`.bg-${name}`] = {backgroundColor: color};
                newUtilities[`.border-${name}`] = {borderColor: color};

                // Classes dark mode avec brightness augmenté
                newUtilities[`.dark .text-${name}`] = {
                    color,
                    filter: 'brightness(1.3)'
                };
                newUtilities[`.dark .bg-${name}`] = {
                    backgroundColor: color,
                    filter: 'brightness(1.2)'
                };
                newUtilities[`.dark .border-${name}`] = {
                    borderColor: color,
                    filter: 'brightness(1.3)'
                };
            });

            console.log(newUtilities);

            addUtilities(newUtilities);
        },
    ],
} satisfies Config;