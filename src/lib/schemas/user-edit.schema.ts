import {z} from "zod";

export const userEditSchema = z.object({
    firstName: z.string().min(2, "2 caractères min."),
    lastName: z.string().optional(),
    email: z.string().email("Email invalide"),
    username: z.string().min(3, "3 caractères min.").max(32, "32 caractères max.").optional(),
    group: z.string().optional(),
    role: z.enum(["user", "admin"]),
});

export type UserEditValues = z.infer<typeof userEditSchema>;
