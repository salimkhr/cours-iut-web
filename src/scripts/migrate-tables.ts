// src/scripts/migrate-tables.ts
//
// Répare les tableaux migrés vides. Le convertisseur `.tsx` → DB cherchait ses
// lignes avec `children("TableRow")`, qui ne traverse pas les `<TableHeader>`
// et `<TableBody>` des cours, et produisait des types `table-row` /
// `table-cell` qu'aucun renderer ne connaît. Résultat : `headers` et `rows`
// absents, et un tableau vide affiché aux étudiants.
//
//   bun src/scripts/migrate-tables.ts --dry-run   → n'écrit rien
//   bun src/scripts/migrate-tables.ts             → applique
//
// Ne touche que les blocs `table` sans `headers` ni `rows` : le reste du
// document, y compris ce qui a été édité depuis dans le builder, est laissé
// tel quel. Si le nombre de tableaux du `.tsx` ne correspond plus à celui du
// document, le document est signalé et sauté — l'appariement se fait par
// position et ne serait plus fiable.
//
// Idempotent : relancé, il ne trouve plus de tableau vide.

import { MongoClient, type ObjectId } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import { getAllTSXFiles, deriveSlug, parseFile } from "@/scripts/migrate-to-db";
import type { Block } from "@/types/CourseContent";

const DRY_RUN = process.argv.includes("--dry-run");
const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const DB_NAME = "cours-iut-web";

type TableProps = { headers?: string[]; rows?: string[][] };

function estTableVide(b: Block): boolean {
    if (b.type !== "table") return false;
    const p = b.props as TableProps;
    return !p.headers?.length && !p.rows?.length;
}

/** Tous les blocs `table` de l'arbre, dans l'ordre du document. */
function collecteTables(blocks: Block[], acc: Block[] = []): Block[] {
    for (const b of blocks) {
        if (b.type === "table") acc.push(b);
        if (b.children?.length) collecteTables(b.children, acc);
    }
    return acc;
}

/** Réécrit les props des tables vides à partir de `source`, dans l'ordre. */
function remplit(blocks: Block[], source: TableProps[], curseur = { i: 0 }): Block[] {
    return blocks.map((b) => {
        if (b.type === "table") {
            const props = source[curseur.i++];
            if (estTableVide(b) && props) return { ...b, props: { ...b.props, ...props } };
            return b;
        }
        if (b.children?.length) return { ...b, children: remplit(b.children, source, curseur) };
        return b;
    });
}

interface Doc {
    _id: ObjectId;
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks?: Block[];
}

async function main() {
    // Index des tableaux tels que les `.tsx` les décrivent, par contenu.
    const parSource = new Map<string, TableProps[]>();
    for (const fichier of getAllTSXFiles("src/cours")) {
        try {
            const s = deriveSlug(fichier);
            const { blocks } = parseFile(fichier);
            const tables = collecteTables(blocks).map((t) => t.props as TableProps);
            if (tables.length) parSource.set(`${s.moduleSlug}/${s.sectionSlug}/${s.contentType}`, tables);
        } catch {
            // Fichier illisible : signalé par migrate-to-db, pas ici.
        }
    }

    const client = new MongoClient(URI);
    await client.connect();
    const col = client.db(DB_NAME).collection<Doc>("course_content");
    const docs = await col.find().toArray();

    const aReparer: { doc: Doc; source: TableProps[]; vides: number }[] = [];
    const sansSource: string[] = [];
    const desaccords: string[] = [];

    for (const doc of docs) {
        const tables = collecteTables(doc.blocks ?? []);
        const vides = tables.filter(estTableVide).length;
        if (!vides) continue;

        const cle = `${doc.moduleSlug}/${doc.sectionSlug}/${doc.contentType}`;
        const source = parSource.get(cle);
        if (!source) { sansSource.push(cle); continue; }
        if (source.length !== tables.length) {
            desaccords.push(`${cle} (${tables.length} en base, ${source.length} dans le .tsx)`);
            continue;
        }
        aReparer.push({ doc, source, vides });
    }

    const total = aReparer.reduce((s, r) => s + r.vides, 0);
    console.log(`${docs.length} documents — ${total} tableau(x) vide(s) réparable(s) dans ${aReparer.length} document(s).`);
    if (sansSource.length) console.warn(`⚠  sans .tsx source : ${sansSource.join(", ")}`);
    if (desaccords.length) console.warn(`⚠  nombre de tableaux divergent, sautés : ${desaccords.join(", ")}`);

    if (!aReparer.length) {
        console.log("Rien à faire.");
        await client.close();
        return;
    }

    if (!DRY_RUN) {
        const dir = path.join(process.cwd(), "backups");
        fs.mkdirSync(dir, { recursive: true });
        const fichier = path.join(dir, `tables-avant-migration-${Date.now()}.json`);
        fs.writeFileSync(fichier, JSON.stringify(aReparer.map((r) => r.doc), null, 2), "utf8");
        console.log(`Sauvegarde : ${fichier}`);
    }

    for (const { doc, source, vides } of aReparer) {
        const apres = remplit(doc.blocks ?? [], source);
        const lignes = source.reduce((s, t) => s + (t.rows?.length ?? 0), 0);
        console.log(`  ${doc.moduleSlug}/${doc.sectionSlug}/${doc.contentType} : ${vides} tableau(x), ${lignes} ligne(s)`);
        if (!DRY_RUN) {
            await col.updateOne(
                { _id: doc._id },
                { $set: { blocks: apres, updatedAt: new Date() }, $inc: { version: 1 } },
            );
        }
    }

    console.log(DRY_RUN ? "\n--dry-run : aucune écriture." : "\nRéparation appliquée.");
    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
