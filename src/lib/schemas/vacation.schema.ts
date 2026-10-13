import {z} from "zod";
import {FICHE_MAX_ROWS} from "@/lib/vacation/fiche";

export const vacationMonthSchema = z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mois attendu au format AAAA-MM");

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date attendue au format AAAA-MM-JJ");
const hours = z.number().min(0, "Pas d'heures négatives").max(24, "Plus de 24 h sur une journée");

export const ficheRowSchema = z.object({
    date: isoDate,
    code: z.string().trim().max(12),
    label: z.string().default(""),
    annee: z.number().int().min(1).max(3).nullable(),
    cours: hours,
    td: hours,
    tp: hours,
});

export const ficheRequestSchema = z.object({
    month: vacationMonthSchema,
    signedAt: isoDate,
    rows: z
        .array(ficheRowSchema)
        .min(1, "Aucune ligne à exporter")
        .max(FICHE_MAX_ROWS, `Le modèle ne contient que ${FICHE_MAX_ROWS} lignes`),
});
export type FicheRequest = z.infer<typeof ficheRequestSchema>;

export const draftRequestSchema = ficheRequestSchema.extend({
    to: z.string().trim().max(254).pipe(z.email("Adresse e-mail du destinataire invalide")),
});
export type DraftRequest = z.infer<typeof draftRequestSchema>;
