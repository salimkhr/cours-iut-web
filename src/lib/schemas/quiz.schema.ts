import {z} from "zod";

const answerSchema = z.union([z.number(), z.array(z.number()), z.boolean()]);

export const quizCheckSchema = z.object({
    questionId: z.string().min(1),
    answer: answerSchema,
});

export const quizCompleteSchema = z.object({
    answers: z.array(z.object({
        questionId: z.string().min(1),
        answer: answerSchema,
    })).min(1),
});

export const quizQuestionsSchema = z.array(z.object({
    id: z.string().min(1),
    type: z.enum(["mcq", "multi", "truefalse"]),
    text: z.string().min(1),
    choices: z.array(z.string()).optional(),
    correct: answerSchema,
    explanation: z.string().min(1),
}));
