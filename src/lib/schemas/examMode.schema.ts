import {z} from "zod";
import {EXAM_MODE_MAX_MINUTES, EXAM_MODE_MIN_MINUTES} from "@/lib/examMode";

/** Activation du mode examen : durée en minutes, bornée pour qu'il ne reste pas ouvert. */
export const enableExamModeSchema = z.object({
    durationMinutes: z.number().int().min(EXAM_MODE_MIN_MINUTES).max(EXAM_MODE_MAX_MINUTES),
});

export type EnableExamModeInput = z.infer<typeof enableExamModeSchema>;
