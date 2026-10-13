// src/scripts/fix-php2-content.ts
//
// Deux corrections ponctuelles sur le module PHP :
//
//  1. TP « Fonction, Tableaux » (2-fonction-tableaux) : ajoute un rappel
//     public_html / localhost en tête de TP (déjà expliqué en TP1, absent ici).
//  2. Slides « Symfony » (9-symfony) : plusieurs blocs `slide-code` ont un
//     prop `highlight` incohérent avec le code réel (numéros de ligne hors
//     limites ou lignes de code orphelines entre deux étapes).
//
//   bun src/scripts/fix-php2-content.ts --dry-run   → n'écrit rien
//   bun src/scripts/fix-php2-content.ts             → applique
//
// Idempotent : relancé après application, la partie TP ne retrouve plus le
// bloc de rappel (recherché par id) et les highlights ne bougent plus
// (déjà à la valeur cible).
// Écrit une sauvegarde JSON des documents touchés avant toute modification.

import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import type { Block } from "@/types/CourseContent";

const DRY_RUN = process.argv.includes("--dry-run");
const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const DB_NAME = "cours-iut-web";

interface ContentDoc {
    _id: unknown;
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
    blocks: Block[];
    version?: number;
}

const REMINDER_BLOCK_ID = "reminder-public-html-localhost-tp2";

const reminderBlock: Block = {
    id: REMINDER_BLOCK_ID,
    type: "callout",
    props: {
        variant: "reminder",
        title: "Rappel : public_html et localhost",
    },
    children: [
        {
            id: `${REMINDER_BLOCK_ID}-text`,
            type: "text",
            props: {
                content:
                    "Comme en TP1, vos fichiers PHP vont dans `~/public_html/TP2/` sur le serveur " +
                    "**woody**. Vous les consultez ensuite à l'adresse " +
                    "`http://woody.iut.univ-lehavre.fr/~loginLDAP/TP2/nomDuFichier.php` ou, en local, " +
                    "`http://localhost/~loginLDAP/TP2/nomDuFichier.php`.",
            },
            children: [],
        },
    ],
};

// Corrections des `highlight` incohérents (numéros hors limites ou lignes
// orphelines entre deux étapes), identifiées par un audit ligne à ligne.
const highlightFixes: Record<string, string> = {
    // ArticleController : import(1-8) | méthode list()(9-16) | méthode show()+fin de classe(18-24)
    "2de041ca-b6df-4693-9b89-6ed5ad4e425d": "1-8 | 9-16 | 18-24",
    // Entity Article : dernière étape visait la ligne 27, inexistante (26 lignes réelles)
    "93933985-03c5-4136-b567-955096f7a7c5": "1-8 | 10-20 | 22-26",
    // Repository::findRecent : dernière étape visait la ligne 14, inexistante (13 lignes réelles)
    "5fa3bcde-35d2-4f23-949a-ce0062c59e25": "1-4 | 5-13",
    // persist()/flush() : setContent() (ligne 9) orpheline entre les deux étapes
    "8cb847ed-5ef9-4921-b62b-4d5262f9c243": "1-9 | 10-16",
    // SlugService : accolade fermante de la classe (ligne 11) orpheline
    "ab2b10cf-e2f2-43ea-b27e-5ff303a50e62": "1-11 | 12-20",
    // Formulaire ArticleType : signature (ligne 6) et persist() (ligne 15) orphelines
    "f40608f0-0237-41d7-8141-edc08246f504": "1-7 | 8-19 | 21-24",
};

function walk(blocks: Block[], cb: (b: Block) => void) {
    for (const b of blocks) {
        cb(b);
        if (b.children) walk(b.children, cb);
    }
}

async function backup(docs: ContentDoc[]) {
    if (docs.length === 0) return;
    const dir = path.join(process.cwd(), "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `php2-content-avant-fix-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf8");
    console.log(`Sauvegarde : ${file}`);
}

async function main() {
    const client = new MongoClient(URI);
    await client.connect();
    const col = client.db(DB_NAME).collection<ContentDoc>("course_content");

    const tpDoc = await col.findOne({ moduleSlug: "php", sectionSlug: "2-fonction-tableaux", contentType: "TP" });
    const slideDoc = await col.findOne({ moduleSlug: "php", sectionSlug: "9-symfony", contentType: "slide" });

    if (!tpDoc) throw new Error("TP php/2-fonction-tableaux introuvable en base.");
    if (!slideDoc) throw new Error("Slide php/9-symfony introuvable en base.");

    // --- 1. TP : rappel public_html / localhost ---
    let alreadyHasReminder = false;
    walk(tpDoc.blocks, (b) => { if (b.id === REMINDER_BLOCK_ID) alreadyHasReminder = true; });

    const nextTpBlocks = alreadyHasReminder ? tpDoc.blocks : [reminderBlock, ...tpDoc.blocks];

    console.log(
        alreadyHasReminder
            ? "TP 2-fonction-tableaux : rappel déjà présent, rien à faire."
            : "TP 2-fonction-tableaux : ajout du rappel public_html/localhost en tête."
    );

    // --- 2. Slides symfony : highlight incohérents ---
    const slideChanges: Array<{ id: string; before: unknown; after: string }> = [];
    walk(slideDoc.blocks, (b) => {
        const fix = highlightFixes[b.id];
        if (fix !== undefined && b.props.highlight !== fix) {
            slideChanges.push({ id: b.id, before: b.props.highlight, after: fix });
            b.props.highlight = fix;
        }
    });

    if (slideChanges.length === 0) {
        console.log("Slides 9-symfony : highlights déjà corrects, rien à faire.");
    } else {
        console.log(`Slides 9-symfony : ${slideChanges.length} bloc(s) à corriger :`);
        for (const c of slideChanges) {
            console.log(`  ${c.id} : "${c.before}" → "${c.after}"`);
        }
    }

    const touchedDocs: ContentDoc[] = [];
    if (!alreadyHasReminder) touchedDocs.push(tpDoc);
    if (slideChanges.length > 0) touchedDocs.push(slideDoc);

    if (touchedDocs.length === 0) {
        console.log("\nRien à écrire.");
        await client.close();
        return;
    }

    if (!DRY_RUN) {
        await backup(touchedDocs);

        if (!alreadyHasReminder) {
            await col.updateOne(
                { _id: tpDoc._id },
                { $set: { blocks: nextTpBlocks, updatedAt: new Date() }, $inc: { version: 1 } }
            );
        }
        if (slideChanges.length > 0) {
            await col.updateOne(
                { _id: slideDoc._id },
                { $set: { blocks: slideDoc.blocks, updatedAt: new Date() }, $inc: { version: 1 } }
            );
        }
    }

    console.log(DRY_RUN ? "\n--dry-run : aucune écriture." : "\nCorrections appliquées.");
    await client.close();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
