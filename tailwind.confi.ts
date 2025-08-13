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
                newUtilities[`.text-${name}`] = {color};
                newUtilities[`.bg-${name}`] = {backgroundColor: color};
                newUtilities[`.border-${name}`] = {borderColor: color};
            });

            console.log(newUtilities);

            addUtilities(newUtilities, ["responsive", "hover"]);
        },
    ],
} satisfies Config;
