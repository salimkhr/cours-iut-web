/**
 * Migre `universe { name, description }` vers `projectSpec`.
 * Les modules migrés sont marqués `validated` : ils tournent déjà, on ne les gèle pas.
 * Aucun `referenceRepo` n'est déclaré, donc la porte 2 les laisse passer.
 *
 * Usage : bun run migrate:project-spec [--dry-run]
 */
import fs from "fs";
import path from "path";
import {connectToDB} from "@/lib/mongodb";
import type {ObjectId} from "mongodb";
import type {ModuleUniverse, ProjectSpec} from "@/lib/schemas/module.schema";

export function buildProjectSpecFromUniverse(universe: ModuleUniverse | undefined): ProjectSpec | undefined {
    if (!universe) return undefined;
    return {
        name: universe.name,
        pitch: universe.description,
        finalDeliverable: "",
        entities: [],
        status: "validated",
    };
}

interface ModuleRow {
    _id: ObjectId;
    path: string;
    universe?: ModuleUniverse;
    projectSpec?: ProjectSpec;
}

async function main(): Promise<void> {
    const dryRun = process.argv.includes("--dry-run");
    const db = await connectToDB();
    const modules = await db.collection<ModuleRow>("modules")
        .find({}, {projection: {path: 1, universe: 1, projectSpec: 1}})
        .toArray();

    const todo = modules.filter((m) => m.universe && !m.projectSpec);
    console.log(`${todo.length} module(s) à migrer sur ${modules.length}.`);

    if (todo.length === 0) return;

    if (dryRun) {
        for (const mod of todo) {
            const spec = buildProjectSpecFromUniverse(mod.universe);
            if (!spec) continue;
            console.log(`[dry-run] ${mod.path} → projectSpec "${spec.name}" (validated)`);
        }
        console.log("Aucune écriture (dry-run) — aucun fichier de sauvegarde produit.");
        return;
    }

    const backupDir = path.join(process.cwd(), "backups");
    fs.mkdirSync(backupDir, {recursive: true});
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `migrate-project-spec-${stamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(todo, null, 4), "utf-8");
    console.log(`Sauvegarde : ${path.relative(process.cwd(), backupFile)}`);

    for (const mod of todo) {
        const spec = buildProjectSpecFromUniverse(mod.universe);
        if (!spec) continue;
        console.log(`${mod.path} → projectSpec "${spec.name}" (validated)`);
        await db.collection("modules").updateOne(
            {_id: mod._id},
            {$set: {projectSpec: spec, plannedNotions: [], updatedAt: new Date().toISOString()}}
        );
    }
    console.log("Migration appliquée.");
}

if (import.meta.main) {
    main().then(() => process.exit(0)).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
