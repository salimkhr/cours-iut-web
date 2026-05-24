import {z} from "zod";

import {GROUPS, STUDENT_EMAIL_DOMAIN} from "@/lib/schemas/register.schema";

export const profileSchema = z.object({
    firstName: z.string().min(2, "Prénom trop court"),
    lastName: z.string().min(2, "Nom trop court"),
    group: z.enum(GROUPS).optional(),
    picture: z.instanceof(File).optional(),
});

export function createProfileSchema(email: string) {
    const isStudent = email.endsWith(STUDENT_EMAIL_DOMAIN);
    return z.object({
        firstName: z.string().min(2, "Prénom trop court"),
        lastName: z.string().min(2, "Nom trop court"),
        group: isStudent
            ? z.enum(GROUPS, {message: "Sélectionnez un groupe"})
            : z.enum(GROUPS).optional(),
        picture: z.instanceof(File).optional(),
    });
}

export type ProfileValues = z.infer<typeof profileSchema>;
