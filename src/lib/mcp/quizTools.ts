import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from "zod";
import type {Db} from "mongodb";
import {QuizService, QuizNotFoundError, QuizValidationError} from "@/lib/quiz/QuizService";
import {QUIZ_ALLOWED_BLOCK_TYPES, type QuizQuestionInput} from "@/lib/schemas/quiz.schema";

/**
 * Outils MCP du quiz : lecture, création et édition uniquement. Aucun outil de
 * session, de réponse ni de lecture des notes (spec §9).
 */
export const QUIZ_TOOL_NAMES = [
    "get_quiz",
    "create_quiz",
    "edit_quiz_config",
    "add_quiz_question",
    "edit_quiz_question",
    "delete_quiz_question",
    "reorder_quiz_questions",
] as const;

const questionShape = {
    blocks: z.array(z.any()).describe(
        `Énoncé : blocs d'affichage uniquement (${QUIZ_ALLOWED_BLOCK_TYPES.join(", ")}). Mêmes blocs que les cours.`,
    ),
    options: z.array(z.object({
        id: z.string().optional().describe("Identifiant stable (généré si absent ; à conserver à l'édition)"),
        text: z.string().describe("Texte court de la proposition"),
        correct: z.boolean(),
    })).describe("≥ 2 propositions, ≥ 1 correcte et ≥ 1 incorrecte"),
    weight: z.number().positive().optional().describe("Poids de la question (défaut 1)"),
    durationSeconds: z.number().int().min(5).max(300).optional().describe("Durée en secondes (défaut 30, de 5 à 300)"),
};

function text(payload: unknown) {
    return {content: [{type: "text" as const, text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)}]};
}

function explain(error: unknown): never {
    if (error instanceof QuizValidationError) {
        throw new Error(`Quiz invalide : ${error.message}`);
    }
    throw error;
}

export function registerQuizTools(
    server: McpServer,
    deps: {isAdmin: boolean; getDb: () => Promise<Db>},
): void {
    /** Résout le slug de module en identifiant stable et prépare le service. */
    async function context(moduleSlug: string) {
        if (!deps.isAdmin) throw new Error("Forbidden");
        const db = await deps.getDb();
        const mod = await db.collection("modules").findOne({path: moduleSlug}, {projection: {_id: 1, title: 1}});
        if (!mod) throw new Error(`Module "${moduleSlug}" introuvable.`);
        return {moduleId: mod._id.toString(), service: new QuizService(db)};
    }

    server.tool(
        "get_quiz",
        "Lit le quiz unique d'un module (questions, propositions, réponses correctes, poids, durées). Réservé aux admins.",
        {module: z.string().describe("Slug du module")},
        async ({module}) => {
            const {moduleId, service} = await context(module);
            const quiz = await service.get(moduleId);
            return text(quiz ?? `Le module "${module}" n'a pas encore de quiz.`);
        },
    );

    server.tool(
        "create_quiz",
        "Crée le quiz unique d'un module (vide). Échoue s'il existe déjà. Réservé aux admins.",
        {
            module: z.string().describe("Slug du module"),
            negativeMarking: z.boolean().optional().describe("Points négatifs (défaut false)"),
        },
        async ({module, negativeMarking}) => {
            const {moduleId, service} = await context(module);
            return text(await service.create(moduleId, {negativeMarking}));
        },
    );

    server.tool(
        "edit_quiz_config",
        "Modifie la configuration globale du quiz (points négatifs). Réservé aux admins.",
        {module: z.string(), negativeMarking: z.boolean()},
        async ({module, negativeMarking}) => {
            const {moduleId, service} = await context(module);
            return text(await service.updateConfig(moduleId, {negativeMarking}));
        },
    );

    server.tool(
        "add_quiz_question",
        "Ajoute une question en fin de quiz. Réservé aux admins.",
        {module: z.string(), ...questionShape},
        async ({module, ...draft}) => {
            const {moduleId, service} = await context(module);
            try {
                return text(await service.addQuestion(moduleId, draft as QuizQuestionInput));
            } catch (error) {
                return explain(error);
            }
        },
    );

    server.tool(
        "edit_quiz_question",
        "Remplace le contenu d'une question existante (l'id de la question est conservé). Réservé aux admins.",
        {module: z.string(), questionId: z.string(), ...questionShape},
        async ({module, questionId, ...draft}) => {
            const {moduleId, service} = await context(module);
            try {
                return text(await service.updateQuestion(moduleId, questionId, draft as QuizQuestionInput));
            } catch (error) {
                return explain(error);
            }
        },
    );

    server.tool(
        "delete_quiz_question",
        "Supprime une question du quiz. Réservé aux admins.",
        {module: z.string(), questionId: z.string()},
        async ({module, questionId}) => {
            const {moduleId, service} = await context(module);
            return text(await service.deleteQuestion(moduleId, questionId));
        },
    );

    server.tool(
        "reorder_quiz_questions",
        "Réordonne les questions : orderedIds doit contenir exactement tous les ids existants. Réservé aux admins.",
        {module: z.string(), orderedIds: z.array(z.string())},
        async ({module, orderedIds}) => {
            const {moduleId, service} = await context(module);
            try {
                return text(await service.reorderQuestions(moduleId, orderedIds));
            } catch (error) {
                if (error instanceof QuizNotFoundError) throw error;
                return explain(error);
            }
        },
    );
}
