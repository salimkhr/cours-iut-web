import {z} from "zod";
import {validateBlockTree} from "@/lib/validateBlockTree";
import type {Block} from "@/types/CourseContent";

/** Blocs d'affichage autorisés dans l'énoncé d'une question (spec §3.2). */
export const QUIZ_ALLOWED_BLOCK_TYPES = [
    "text", "list", "list-item", "table", "code", "image-card", "diagram", "callout", "quote", "file-tree",
] as const;

const allowed = new Set<string>(QUIZ_ALLOWED_BLOCK_TYPES);

function forbiddenTypes(blocks: Block[]): string[] {
    const found: string[] = [];
    const visit = (block: Block) => {
        if (!allowed.has(block.type)) found.push(block.type);
        block.children?.forEach(visit);
    };
    blocks.forEach(visit);
    return found;
}

export const quizBlocksSchema = z.array(z.any()).superRefine((blocks, ctx) => {
    const result = validateBlockTree(blocks);
    for (const error of result.errors) {
        ctx.addIssue({code: "custom", message: `${error.path} : ${error.message}`});
    }
    if (result.valid) {
        for (const type of new Set(forbiddenTypes(blocks as Block[]))) {
            ctx.addIssue({code: "custom", message: `Le bloc « ${type} » n'est pas autorisé dans une question`});
        }
    }
});

export const quizOptionSchema = z.object({
    id: z.string().min(1),
    text: z.string().trim().min(1, "La proposition ne peut pas être vide").max(200),
    correct: z.boolean(),
});

export const quizQuestionSchema = z.object({
    id: z.string().min(1),
    position: z.number().int().min(0).default(0),
    blocks: quizBlocksSchema,
    options: z.array(quizOptionSchema).min(2, "Au moins deux propositions"),
    weight: z.number().positive("Le poids doit être strictement positif").default(1),
    durationSeconds: z.number().int().min(5, "Minimum 5 secondes").max(300, "Maximum 300 secondes").default(30),
}).superRefine((question, ctx) => {
    const correct = question.options.filter((o) => o.correct).length;
    if (correct === 0) {
        ctx.addIssue({code: "custom", path: ["options"], message: "Au moins une proposition correcte"});
    }
    if (correct === question.options.length) {
        ctx.addIssue({code: "custom", path: ["options"], message: "Au moins une proposition incorrecte"});
    }
    const texts = question.options.map((o) => o.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) {
        ctx.addIssue({code: "custom", path: ["options"], message: "Propositions en double"});
    }
    if (new Set(question.options.map((o) => o.id)).size !== question.options.length) {
        ctx.addIssue({code: "custom", path: ["options"], message: "Identifiants de proposition en double"});
    }
});

export const quizConfigSchema = z.object({
    negativeMarking: z.boolean(),
});

export const quizSchema = quizConfigSchema.extend({
    questions: z.array(quizQuestionSchema),
});

export type QuizQuestionInput = z.input<typeof quizQuestionSchema>;
