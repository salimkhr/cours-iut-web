import { createRequire } from "module";

const require = createRequire(import.meta.url);

const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

const eslintConfig = [
    {
        ignores: [".pnp.cjs", ".pnp.loader.mjs", ".yarn/**"],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
];

export default eslintConfig;
