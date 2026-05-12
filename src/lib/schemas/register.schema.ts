import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Nom trop court"),
    identifier: z.string().min(3, "Identifiant trop court"),
    password: z.string().min(7, "Mot de passe trop court"),
    picture: z.instanceof(File, { message: "Image requise" }),
});

export type RegisterValues = z.infer<typeof registerSchema>;