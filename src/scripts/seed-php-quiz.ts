// src/scripts/seed-php-quiz.ts
//
// Crée le quiz du module PHP (sections 1 à 4) à partir de src/scripts/php-quiz-data.ts,
// via QuizService : mêmes validations que l'admin et le MCP.
//
//   bun src/scripts/seed-php-quiz.ts --dry-run   → valide les questions, n'écrit rien
//   bun src/scripts/seed-php-quiz.ts             → crée le quiz ; refuse s'il existe déjà
//   bun src/scripts/seed-php-quiz.ts --replace   → sauvegarde le quiz existant dans backups/,
//                                                  puis le remplace (les sessions passées gardent
//                                                  leur instantané)

import {mkdirSync, writeFileSync} from "node:fs";
import {MongoClient} from "mongodb";
import {QuizService} from "@/lib/quiz/QuizService";
import {quizQuestionSchema} from "@/lib/schemas/quiz.schema";
import {PHP_QUIZ_NEGATIVE_MARKING, phpQuizQuestions} from "@/scripts/php-quiz-data";

const DRY_RUN = process.argv.includes("--dry-run");
const REPLACE = process.argv.includes("--replace");
const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const DB_NAME = "cours-iut-web";
const MODULE_PATH = "php";

async function main() {
    const questions = phpQuizQuestions();

    // Validation à blanc : mêmes schémas que QuizService.
    const issues = questions.flatMap((q, i) => {
        const parsed = quizQuestionSchema.safeParse({
            ...q,
            id: `q${i}`,
            position: i,
            options: q.options.map((o, j) => ({...o, id: `q${i}o${j}`})),
        });
        return parsed.success ? [] : parsed.error.issues.map((x) => `question ${i + 1} : ${x.path.join(".")} ${x.message}`);
    });
    if (issues.length > 0) {
        console.error(issues.join("\n"));
        process.exit(1);
    }
    const total = questions.reduce((sum, q) => sum + q.weight, 0);
    const seconds = questions.reduce((sum, q) => sum + q.durationSeconds, 0);
    console.log(`${questions.length} questions valides, ${total} points, ${Math.round(seconds / 60)} min de chronomètre.`);
    if (DRY_RUN) return;

    const client = await MongoClient.connect(URI);
    try {
        const db = client.db(DB_NAME);
        const phpModule = await db.collection("modules").findOne({path: MODULE_PATH});
        if (!phpModule) throw new Error(`Module « ${MODULE_PATH} » introuvable dans ${DB_NAME}`);
        const moduleId = phpModule._id.toString();

        const existing = await db.collection("module_quizzes").findOne({moduleId});
        if (existing && !REPLACE) {
            console.error("Le module PHP possède déjà un quiz : relancez avec --replace pour le remplacer.");
            process.exit(1);
        }
        if (existing) {
            mkdirSync("backups", {recursive: true});
            const file = `backups/php-quiz-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
            writeFileSync(file, JSON.stringify(existing, null, 2));
            await db.collection("module_quizzes").deleteOne({moduleId});
            console.log(`Quiz existant sauvegardé dans ${file}`);
        }

        const service = new QuizService(db);
        await service.create(moduleId, {negativeMarking: PHP_QUIZ_NEGATIVE_MARKING});
        for (const q of questions) await service.addQuestion(moduleId, q);
        console.log(`Quiz créé pour le module « ${MODULE_PATH} » (${moduleId}).`);
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
