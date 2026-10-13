import { MongoClient } from "mongodb";
import { contentImports } from "@/lib/contentImports";
import { normalizeContentKey } from "@/lib/contentTypes";
import { ensureIndexes } from "@/lib/db/indexes";
import { getAdminConfig, seedAdmin } from "@/lib/db/seed-admin";

const metadata: Record<string, { title: string; iconName: string; colorLight: string }> = {
    "html-css": { title: "HTML / CSS", iconName: "Code", colorLight: "#C13B1A" },
    php: { title: "PHP", iconName: "Server", colorLight: "#3B3F7A" },
    javascript: { title: "JavaScript", iconName: "Braces", colorLight: "#7A6200" },
    brainfuck: { title: "Brainfuck", iconName: "Brain", colorLight: "#6B21A8" },
};

async function main() {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI est requis.");
    const adminConfig = getAdminConfig(process.env);
    const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        const db = client.db("cours-iut-web");
        const existing = new Set((await db.listCollections().toArray()).map(c => c.name));
        for (const name of ["modules", "course_content", "user", "session", "account", "verification", "jwks", "oauthClient", "oauthRefreshToken", "oauthAccessToken", "oauthConsent", "pedagogy_exemplars", "pedagogy_verdicts"]) {
            if (!existing.has(name)) await db.createCollection(name);
        }
        await ensureIndexes(db);
        for (const [path, entries] of Object.entries(contentImports)) {
            const sections = Object.entries(entries)
                .sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true }))
                .map(([sectionPath, contents], index) => {
                    const label = sectionPath.replace(/^\d+-/, "").replaceAll("-", " ");
                    return {
                        title: label.charAt(0).toUpperCase() + label.slice(1),
                        path: sectionPath,
                        contents: Object.keys(contents).map(key => {
                            const type = normalizeContentKey(key);
                            if (!type) throw new Error(`Type de contenu inconnu : ${key}`);
                            return { type, source: "file" as const };
                        }),
                        tags: [], objectives: [], totalDuration: 1,
                        hasCorrection: false, correctionIsAvailable: false,
                        isAvailable: true, examenIsLock: true, order: index + 1,
                    };
                });
            const result = await db.collection("modules").updateOne({ path }, { $setOnInsert: {
                ...metadata[path], title: metadata[path]?.title ?? path,
                path, sections, associatedSae: [], instructors: [], coefficients: [],
                isExtra: path === "brainfuck", isVisible: true, updatedAt: new Date(),
            } }, { upsert: true });
            console.log(`${path} : ${result.upsertedCount ? "créé" : "déjà présent"} (${sections.length} sections locales)`);
        }
        if (adminConfig) await seedAdmin(db, adminConfig);
        else console.log("Compte admin ignoré : définir ADMIN_EMAIL et ADMIN_PASSWORD pour le créer.");
        console.log("Initialisation terminée. Les contenus restent servis depuis les fichiers TSX.");
    } finally {
        await client.close();
    }
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : "Initialisation impossible");
    process.exitCode = 1;
});
