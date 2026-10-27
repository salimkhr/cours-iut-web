import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Db, Filter} from "mongodb";
import {ObjectId} from "bson";
import {z} from "zod";
import {findBlock} from "@/lib/blockTreeUtils";
import {QuizService} from "@/lib/quiz/QuizService";
import {
    listRetouchesSchema,
    logRetoucheSchema,
    markRetouchesProcessedSchema,
    RETOUCHE_CONTENT_TYPES,
    RETOUCHE_OPERATIONS,
    RETOUCHE_STATUSES,
    RETOUCHE_TARGETS,
    type LogRetoucheValues,
} from "@/lib/schemas/retouche.schema";
import type {CourseContent} from "@/types/CourseContent";
import type {PedagogyRetouche} from "@/types/Pedagogy";

/**
 * Outils MCP du journal des retouches (spec § 9). Le skill « retouche » écrit
 * une entrée après chaque retouche qui touche un élément dont d'autres supports
 * dépendent ; le workflow de propagation (spec § 8) lit les entrées en attente
 * puis les marque traitées. Le journal vit sur le serveur où la retouche est
 * faite. Réservés aux admins.
 */
export const RETOUCHE_TOOL_NAMES = [
    "log_retouche",
    "list_retouches",
    "mark_retouches_processed",
] as const;

export const RETOUCHES_COLLECTION = "pedagogy_retouches";

function text(payload: unknown) {
    return {content: [{type: "text" as const, text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)}]};
}

function invalid(label: string, error: z.ZodError): never {
    throw new Error(`${label} invalide : ${JSON.stringify(z.flattenError(error))}`);
}

type After = Pick<PedagogyRetouche, "after" | "blockType">;

/** Lit l'état actuel de l'élément retouché : l'« après » ne vient jamais du modèle. */
async function readAfter(db: Db, v: LogRetoucheValues): Promise<After> {
    if (v.target === "block") {
        const doc = await db.collection<CourseContent>("course_content").findOne(
            {moduleSlug: v.module, sectionSlug: v.section, contentType: v.type} as Filter<CourseContent>,
            {projection: {blocks: 1}},
        );
        const where = `${v.module}/${v.section}/${v.type}`;
        if (!doc) throw new Error(`Contenu ${where} introuvable.`);
        const block = findBlock(doc.blocks ?? [], v.blockId!);
        if (!block) throw new Error(`Bloc ${v.blockId} introuvable dans ${where}.`);
        return {after: {...block.props}, blockType: block.type};
    }

    const mod = await db.collection("modules").findOne({path: v.module}, {projection: {_id: 1}});
    if (!mod) throw new Error(`Module "${v.module}" introuvable.`);
    const quiz = await new QuizService(db).get(mod._id.toString());
    if (!quiz) throw new Error(`Quiz du module "${v.module}" introuvable.`);
    const question = quiz.questions.find((q) => q.id === v.questionId);
    if (!question) throw new Error(`Question ${v.questionId} introuvable dans le quiz de "${v.module}".`);
    return {after: JSON.parse(JSON.stringify(question)) as Record<string, unknown>};
}

function serialize(doc: PedagogyRetouche & {_id: ObjectId}) {
    const {_id, date, processedAt, ...rest} = doc;
    return {
        id: _id.toString(),
        date: new Date(date).toISOString(),
        ...rest,
        ...(processedAt && {processedAt: new Date(processedAt).toISOString()}),
    };
}

export function registerRetoucheTools(
    server: McpServer,
    deps: {isAdmin: boolean; getDb: () => Promise<Db>},
): void {
    function requireAdmin() {
        if (!deps.isAdmin) throw new Error("Forbidden");
    }

    // ── log_retouche ──────────────────────────────────────────────────────────
    server.tool(
        "log_retouche",
        "Journalise une retouche déjà écrite qui touche un élément dont d'autres supports dépendent "
        + "(curriculum, exampleDomain, universe, projectSpec, exemple repris par les slides ou le TP, contrat "
        + "repris par la correction…). Le serveur lit lui-même l'« après » en base et vérifie que le bloc ou la "
        + "question existe. À appeler sur le serveur où la retouche a été faite. Réservé aux admins.",
        {
            target: z.enum(RETOUCHE_TARGETS).describe("block (bloc d'un contenu) | quiz-question (question du quiz du module)"),
            module: z.string().describe("Slug du module"),
            section: z.string().optional().describe("Slug de la section (requis pour target=block)"),
            type: z.enum(RETOUCHE_CONTENT_TYPES).optional().describe("Type de contenu : cours | TP | examen | slide (requis pour target=block)"),
            blockId: z.string().optional().describe("ID du bloc retouché ou inséré (requis pour target=block)"),
            questionId: z.string().optional().describe("ID de la question (requis pour target=quiz-question)"),
            operation: z.enum(RETOUCHE_OPERATIONS).describe("edit (modification) | insert (nouveau bloc)"),
            before: z.union([z.record(z.string(), z.unknown()), z.null(), z.string()])
                .describe("Props d'origine du bloc (ou question d'origine), telles que lues avant la retouche. null pour un insert. Objet ou JSON stringifié, 50 ko max"),
            summary: z.string().describe("Ce qui a changé, en une phrase (300 caractères max)"),
            dependencyNote: z.string().describe("Quels supports dépendent de l'élément retouché et pourquoi (1000 caractères max)"),
        },
        async (args) => {
            requireAdmin();
            const parsed = logRetoucheSchema.safeParse(args);
            if (!parsed.success) invalid("Retouche", parsed.error);
            const v = parsed.data;

            const db = await deps.getDb();
            const {after, blockType} = await readAfter(db, v);
            const entry: Omit<PedagogyRetouche, "_id"> = {
                date: new Date(),
                moduleSlug: v.module,
                ...(v.section && {sectionSlug: v.section}),
                target: v.target,
                ...(v.target === "block"
                    ? {contentType: v.type, blockId: v.blockId, blockType}
                    : {questionId: v.questionId}),
                operation: v.operation,
                before: v.before,
                after,
                summary: v.summary,
                dependencyNote: v.dependencyNote,
                status: "pending",
            };
            const r = await db.collection<Omit<PedagogyRetouche, "_id">>(RETOUCHES_COLLECTION).insertOne(entry);
            return text(`Retouche journalisée. retoucheId=${r.insertedId.toString()}`);
        },
    );

    // ── list_retouches ────────────────────────────────────────────────────────
    server.tool(
        "list_retouches",
        "Liste le journal des retouches, les plus récentes d'abord (avant, après, résumé, dépendances). "
        + "Par défaut, seulement les entrées en attente de propagation. Réservé aux admins.",
        {
            status: z.enum([...RETOUCHE_STATUSES, "all"]).optional().describe("pending (défaut) | processed | all"),
            module: z.string().optional().describe("Filtrer sur un module (slug)"),
            section: z.string().optional().describe("Filtrer sur une section (slug)"),
            limit: z.union([z.number(), z.string()]).optional().describe("Nombre maximum d'entrées (défaut 20, max 100)"),
        },
        async (args) => {
            requireAdmin();
            const parsed = listRetouchesSchema.safeParse(args);
            if (!parsed.success) invalid("Filtre", parsed.error);
            const {status, module, section, limit} = parsed.data;

            const filter: Filter<PedagogyRetouche> = {
                ...(status !== "all" && {status}),
                ...(module && {moduleSlug: module}),
                ...(section && {sectionSlug: section}),
            };
            const db = await deps.getDb();
            const docs = await db.collection<PedagogyRetouche>(RETOUCHES_COLLECTION)
                .find(filter).sort({date: -1}).limit(limit).toArray();
            return text(docs.map((d) => serialize(d as PedagogyRetouche & {_id: ObjectId})));
        },
    );

    // ── mark_retouches_processed ──────────────────────────────────────────────
    server.tool(
        "mark_retouches_processed",
        "Marque des retouches comme traitées par le workflow de propagation. Elles sortent de "
        + "list_retouches par défaut. Une entrée déjà traitée n'est pas modifiée. Réservé aux admins.",
        {
            ids: z.union([z.array(z.string()), z.string()]).describe("IDs des retouches (tableau ou JSON stringifié)"),
            note: z.string().optional().describe("Ce qui a été propagé ou décidé (1000 caractères max)"),
        },
        async (args) => {
            requireAdmin();
            const parsed = markRetouchesProcessedSchema.safeParse(args);
            if (!parsed.success) invalid("Marquage", parsed.error);
            const ids = parsed.data.ids.map((id) => {
                if (!ObjectId.isValid(id)) throw new Error(`ID invalide : ${id}`);
                return new ObjectId(id);
            });
            const db = await deps.getDb();
            const r = await db.collection<PedagogyRetouche>(RETOUCHES_COLLECTION).updateMany(
                {_id: {$in: ids}, status: "pending"},
                {$set: {
                    status: "processed",
                    processedAt: new Date(),
                    ...(parsed.data.note && {processedNote: parsed.data.note}),
                }},
            );
            return text(`${r.modifiedCount} retouche(s) marquée(s) traitée(s).`);
        },
    );
}
