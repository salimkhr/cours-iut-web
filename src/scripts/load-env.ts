import { readFileSync } from "fs";

// Charge .env puis .env.local depuis la racine du projet (CWD).
// Nécessaire car `bun --env-file` ne fonctionne pas de façon fiable sur Windows.
for (const file of [".env", ".env.local"]) {
    try {
        const content = readFileSync(file, "utf-8");
        for (const line of content.split(/\r?\n/)) {
            const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
            if (m) process.env[m[1].trim()] ??= m[2].trim();
        }
    } catch {
        // fichier absent → ignoré
    }
}
