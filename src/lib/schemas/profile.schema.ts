import {z} from "zod";

import {GROUPS} from "@/lib/schemas/register.schema";

export const profileSchema = z.object({
    firstName: z.string().min(2, "Prénom trop court"),
    lastName: z.string().min(2, "Nom trop court"),
    group: z.enum(GROUPS).optional(),
    picture: z.instanceof(File).optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
