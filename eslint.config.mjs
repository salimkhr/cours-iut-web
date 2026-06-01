import {createRequire} from "module";

const require = createRequire(import.meta.url);

const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

const eslintConfig = [
    {
        ignores: [".pnp.cjs", ".pnp.loader.mjs", ".yarn/**", ".agents/**", ".claude/**", ".next/**"],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
            }],
        },
    },
];

export default eslintConfig;
