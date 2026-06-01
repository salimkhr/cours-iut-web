import {z} from "zod";

export const userEditSchema = z.object({
    name: z.string().min(1, "Requis"),
    email: z.string().email("Email invalide"),
    username: z.string().min(3, "3 caractères min.").max(32, "32 caractères max."),
    group: z.string().optional(),
    role: z.enum(["user", "admin"]),
});

export type UserEditValues = z.infer<typeof userEditSchema>;
