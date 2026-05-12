import {z} from "zod";

export const STUDENT_EMAIL_DOMAIN = "@etu.univ-lehavre.fr";
export const IDENTIFIER_REGEX = /^[a-zA-Z]{2}\d{6}$/;
export const GROUPS = ["F1", "F2", "G1", "G2"] as const;
export type Group = typeof GROUPS[number];

export const registerSchema = z.object({
    firstName: z.string().min(2, "Prénom trop court"),
    lastName: z.string().min(2, "Nom trop court"),
    email: z
        .string()
        .email("Email invalide")
        .endsWith(STUDENT_EMAIL_DOMAIN, `L'email doit être en ${STUDENT_EMAIL_DOMAIN}`),
    identifier: z
        .string()
        .regex(IDENTIFIER_REGEX, "Format attendu : 2 lettres + 6 chiffres (ex. ab123456)"),
    group: z.enum(GROUPS, {message: "Sélectionnez un groupe"}),
    password: z.string().min(7, "Mot de passe trop court (7 caractères min.)"),
    picture: z.instanceof(File).optional(),
});

export type RegisterValues = z.infer<typeof registerSchema>;
