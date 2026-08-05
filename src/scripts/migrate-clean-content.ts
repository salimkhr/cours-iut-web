// src/scripts/migrate-clean-content.ts
//
// Nettoyages hérités de la migration .tsx → DB :
//   --entities  entités HTML non décodées (&#xe9;, &quot;…)
//   --titles    préfixes de partie dans les titres (« A- », « 1. »)
//   --spacers   espaces JSX littéraux ({" "}) dans le texte rédactionnel
// Sans option : les trois.
//
//   bun src/scripts/migrate-clean-content.ts --dry-run
//   bun src/scripts/migrate-clean-content.ts --spacers
//
// ATTENTION — le décodage d'entités n'est PAS idempotent, et c'est voulu :
// `&amp;copy;` devient `&copy;` au premier passage, et un second passage le
// transformerait en « © », détruisant l'entité que le cours HTML montre
// volontairement. Ne relancer `--entities` que sur des contenus fraîchement
// migrés. Les deux autres passes sont sûres à répéter.
//
// Sauvegarde JSON des documents touchés avant écriture.

import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import { decodeHtmlEntities, stripHeadingPrefix, stripJsxSpacers } from "@/lib/contentCleanup";
import type { Block } from "@/types/CourseContent";

const DRY_RUN = process.argv.includes("--dry-run");
const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";

const passes = process.argv.filter((a) => ["--entities", "--titles", "--spacers"].includes(a));
const DO_ENTITIES = passes.length === 0 || passes.includes("--entities");
const DO_TITLES = passes.length === 0 || passes.includes("--titles");
const DO_SPACERS = passes.length === 0 || passes.includes("--spacers");

interface Doc {
    _id: import("mongodb").ObjectId;
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks?: Block[];
}

interface Stats { entites: number; titres: number; espaces: number }

/** Types dont la prop `title` porte une numérotation ajoutée par le renderer. */
const TITLED = new Set(["section", "slide"]);

/** Props qui contiennent du code : on n'y touche pas aux `{" "}`, qui peuvent
 *  être du JSX que le cours montre volontairement. */
const CODE_PROPS = new Set(["code", "chart"]);

function cleanBlocks(blocks: Block[], stats: Stats): Block[] {
    return blocks.map((block) => {
        const props: Record<string, unknown> = { ...block.props };

        for (const [key, value] of Object.entries(props)) {
            if (typeof value !== "string") continue;
            let next = value;

            if (DO_ENTITIES) {
                const decoded = decodeHtmlEntities(next);
                if (decoded !== next) { stats.entites++; next = decoded; }
            }

            if (DO_SPACERS && !CODE_PROPS.has(key)) {
                const sansEspaces = stripJsxSpacers(next);
                if (sansEspaces !== next) { stats.espaces++; next = sansEspaces; }
            }

            if (DO_TITLES && key === "title" && TITLED.has(block.type)) {
                const stripped = stripHeadingPrefix(next);
                if (stripped !== next) { stats.titres++; next = stripped; }
            }
            props[key] = next;
        }

        const children = block.children ? cleanBlocks(block.children, stats) : undefined;
        return children ? { ...block, props, children } : { ...block, props };
    });
}

async function main() {
    const client = new MongoClient(URI);
    await client.connect();
    const col = client.db("cours-iut-web").collection<Doc>("course_content");
    const docs = await col.find({}).toArray();

    const aEcrire: { doc: Doc; blocks: Block[]; stats: Stats }[] = [];
    for (const doc of docs) {
        const stats: Stats = { entites: 0, titres: 0, espaces: 0 };
        const blocks = cleanBlocks(doc.blocks ?? [], stats);
        if (stats.entites || stats.titres || stats.espaces) aEcrire.push({ doc, blocks, stats });
    }

    const totalE = aEcrire.reduce((n, x) => n + x.stats.entites, 0);
    const totalT = aEcrire.reduce((n, x) => n + x.stats.titres, 0);
    const totalS = aEcrire.reduce((n, x) => n + x.stats.espaces, 0);
    console.log(`${docs.length} contenus — ${aEcrire.length} à nettoyer : ${totalE} props décodées, ${totalT} titres dépréfixés, ${totalS} props d'espaces JSX.`);

    if (aEcrire.length === 0) { await client.close(); return; }

    if (!DRY_RUN) {
        const dir = path.join(process.cwd(), "backups");
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `contenus-avant-nettoyage-${Date.now()}.json`);
        fs.writeFileSync(file, JSON.stringify(aEcrire.map((x) => x.doc), null, 2), "utf8");
        console.log(`Sauvegarde : ${file}`);
    }

    for (const { doc, blocks, stats } of aEcrire) {
        console.log(`  ${doc.moduleSlug}/${doc.sectionSlug}/${doc.contentType} : ${stats.entites} props, ${stats.titres} titres, ${stats.espaces} espaces`);
        if (!DRY_RUN) {
            await col.updateOne(
                { _id: doc._id },
                { $set: { blocks, updatedAt: new Date() }, $inc: { version: 1 } }
            );
        }
    }

    console.log(DRY_RUN ? "\n--dry-run : aucune écriture." : "\nNettoyage appliqué.");
    await client.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
