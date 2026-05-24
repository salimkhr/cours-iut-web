import {z} from "zod";

import {GROUPS, STUDENT_EMAIL_DOMAIN} from "@/lib/schemas/register.schema";

export const profileSchema = z.object({
    firstName: z.string().min(2, "Prénom trop court"),
    lastName: z.string().min(2, "Nom trop court"),
    group: z.enum(GROUPS).optional(),
    picture: z.instanceof(File).optional(),
});

export function createProfileSchema(email: string) {
    return z.object({
        firstName: z.string().min(2, "Prénom trop court"),
        lastName: z.string().min(2, "Nom trop court"),
        group: z.enum(GROUPS).optional(),
        picture: z.instanceof(File).optional(),
    }).superRefine((data, ctx) => {
        if (email.endsWith(STUDENT_EMAIL_DOMAIN) && !data.group) {
            ctx.addIssue({code: z.ZodIssueCode.custom, message: "Sélectionnez un groupe", path: ["group"]});
        }
    });
}

export type ProfileValues = z.infer<typeof profileSchema>;
