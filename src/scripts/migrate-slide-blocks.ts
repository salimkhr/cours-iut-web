// src/scripts/migrate-slide-blocks.ts
//
// Convertit les présentations restées au format hérité (`slide-screen` +
// enfants de cours) vers l'univers slide. Ces écrans n'affichaient que leur
// titre côté étudiant : le player ne rend que les types `slide-*`.
//
//   bun src/scripts/migrate-slide-blocks.ts --dry-run   → n'écrit rien
//   bun src/scripts/migrate-slide-blocks.ts             → applique
//
// Idempotent : relancé sur une base déjà migrée, il ne trouve rien à faire.
// Écrit une sauvegarde JSON des documents touchés avant toute modification.

import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import { toSlideBlocks, countConvertible, findUnrenderableTypes } from "@/lib/slideBlockMigration";
import type { Block } from "@/types/CourseContent";

const DRY_RUN = process.argv.includes("--dry-run");
const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const DB_NAME = "cours-iut-web";

interface SlideDoc {
    _id: unknown;
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks?: Block[];
}

async function main() {
    const client = new MongoClient(URI);
    await client.connect();
    const col = client.db(DB_NAME).collection<SlideDoc>("course_content");

    const docs = await col.find({ contentType: "slide" }).toArray();
    const aMigrer = docs.filter((d) => countConvertible(d.blocks ?? []) > 0);

    console.log(`${docs.length} présentations, ${aMigrer.length} à convertir.`);
    if (aMigrer.length === 0) {
        console.log("Rien à faire — les blocs sont déjà dans l'univers slide.");
        await client.close();
        return;
    }

    if (!DRY_RUN) {
        const dir = path.join(process.cwd(), "backups");
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `slides-avant-migration-${Date.now()}.json`);
        fs.writeFileSync(file, JSON.stringify(aMigrer, null, 2), "utf8");
        console.log(`Sauvegarde : ${file}`);
    }

    for (const doc of aMigrer) {
        const avant = doc.blocks ?? [];
        const apres = toSlideBlocks(avant);
        const n = countConvertible(avant);
        const restants = findUnrenderableTypes(apres);

        console.log(
            `  ${doc.moduleSlug}/${doc.sectionSlug} : ${n} blocs convertis` +
            (restants.length ? ` — types non rendus restants : ${restants.join(", ")}` : "")
        );

        if (!DRY_RUN) {
            await col.updateOne(
                { _id: doc._id },
                { $set: { blocks: apres, updatedAt: new Date() }, $inc: { version: 1 } }
            );
        }
    }

    console.log(DRY_RUN ? "\n--dry-run : aucune écriture." : "\nMigration appliquée.");
    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
