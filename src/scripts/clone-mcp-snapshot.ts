import { readFile, mkdir, writeFile } from "node:fs/promises";
import { MongoClient, ObjectId, BSON } from "mongodb";
import { ensureIndexes } from "@/lib/db/indexes";

// Import local uniquement. Le snapshot contient les champs exposés par le MCP,
// pas un dump intégral de la production (visibilité, couleurs, etc. non exposées).
async function main() {
    const uri = process.env.MONGODB_URI;
    if (!uri || !process.argv[2]) throw new Error("Usage : bun src/scripts/clone-mcp-snapshot.ts snapshot.json (MONGODB_URI local requis)");
    const host = new URL(uri).hostname;
    if (!["localhost", "127.0.0.1", "[::1]"].includes(host)) throw new Error("Destination non locale refusée.");
    const snapshot = JSON.parse(await readFile(process.argv[2], "utf8"));
    if (!snapshot.modules?.length || !Array.isArray(snapshot.contents)) throw new Error("Snapshot invalide");
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
        await client.connect();
        const db = client.db("cours-iut-web");
        const modules = db.collection("modules");
        const contents = db.collection("course_content");
        const oldModules = await modules.find().toArray();
        const oldContents = await contents.find().toArray();
        await mkdir("backups", { recursive: true });
        const backup = `backups/avant-clone-prod-${Date.now()}.json`;
        await writeFile(backup, BSON.EJSON.stringify({ modules: oldModules, contents: oldContents }), { mode: 0o600 });
        console.log(`Sauvegarde : ${backup}`);
        await ensureIndexes(db);
        const now = new Date();
        const contentIds = new Map<string, string>();
        for (const entry of snapshot.contents) {
            const key = { moduleSlug: entry.module, sectionSlug: entry.section, contentType: entry.type };
            if (entry.data.source !== "db" || !Array.isArray(entry.data.blocks)) throw new Error("Contenu manquant");
            const doc = await contents.findOneAndUpdate(key, {
                $set: { ...key, blocks: entry.data.blocks, version: entry.data.version ?? 1, updatedAt: now },
                $setOnInsert: { createdAt: now },
            }, { upsert: true, returnDocument: "after" });
            contentIds.set(`${entry.module}/${entry.section}/${entry.type}`, String(doc!._id));
        }
        for (const mod of snapshot.modules) {
            const { slug, sections, ...fields } = mod;
            const previous = oldModules.find(m => m.path === slug);
            const mapped = sections.map((section: { slug: string; contents: Record<string, string>; [key: string]: unknown }, index: number) => {
                const { slug: path, contents: refs, ...metadata } = section;
                return {
                    tags: [], objectives: [], hasCorrection: false, correctionIsAvailable: false,
                    isAvailable: true, examenIsLock: true, ...metadata, path, order: index + 1,
                    contents: Object.entries(refs).map(([type, source]) => {
                        if (source !== "db") return { type, source };
                        const contentId = contentIds.get(`${slug}/${path}/${type}`);
                        if (!contentId) throw new Error(`Référence manquante : ${slug}/${path}/${type}`);
                        return { type, source, contentId };
                    }),
                };
            });
            await modules.replaceOne({ path: slug }, {
                iconName: "BookOpen", associatedSae: [], instructors: [], coefficients: [],
                ...previous, ...fields, path: slug, sections: mapped, isVisible: true, updatedAt: now,
            }, { upsert: true });
        }
        await modules.deleteMany({ path: { $nin: snapshot.modules.map((m: { slug: string }) => m.slug) } });
        await contents.deleteMany({ _id: { $nin: [...contentIds.values()].map(id => new ObjectId(id)) } });
        console.log(`Copie vérifiée : ${await modules.countDocuments()} modules, ${snapshot.modules.reduce((n: number, m: { sections: unknown[] }) => n + m.sections.length, 0)} sections, ${await contents.countDocuments()} contenus.`);
    } finally {
        await client.close();
    }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
