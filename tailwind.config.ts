import type {Config} from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./cours/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "media",
    theme: {
        extend: {
            colors: {
                javascript: '#F7DF1E', // jaune JS
                php: '#53567d',        // violet PHP
                html: '#E34F26',       // orange HTML
            },
        },
    },
    plugins: [],
};

export default config;
