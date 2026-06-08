import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// src/scripts/load-env.ts → remonter 2 niveaux pour atteindre la racine du projet
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

for (const file of [".env", ".env.local"]) {
    try {
        const content = readFileSync(join(projectRoot, file), "utf-8");
        for (const line of content.split(/\r?\n/)) {
            const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
            if (m) process.env[m[1].trim()] ??= m[2].trim();
        }
    } catch {
        // fichier absent → ignoré
    }
}
