import {z} from "zod";

export const loginSchema = z.object({
    identifier: z.string().min(3, "Identifiant trop court"),
    password: z.string().min(7, "Mot de passe trop court"),
    rememberMe: z.boolean().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;