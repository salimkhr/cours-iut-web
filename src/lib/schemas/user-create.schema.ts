import {z} from "zod";
import {userEditSchema} from "@/lib/schemas/user-edit.schema";

export const userCreateSchema = userEditSchema.extend({
    // Champ facultatif : le formulaire envoie "" quand il est laissé vide.
    username: z.union([
        z.literal(""),
        z.string().min(3, "3 caractères min.").max(32, "32 caractères max.")
            .regex(/^[a-zA-Z0-9_.]+$/, "Lettres, chiffres, « _ » et « . » uniquement"),
    ]).optional(),
    password: z.string().min(7, "7 caractères min.").max(128, "128 caractères max."),
});

export type UserCreateValues = z.infer<typeof userCreateSchema>;
