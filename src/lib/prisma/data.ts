// Récupère tous les modules avec leurs sections et contenus
import {prisma} from "@/lib/prisma/prisma";

export async function getModules() {
    return prisma.module.findMany({
        include: {
            sections: {
                include: {
                    contents: true,
                },
            },
        },
    });
}

// Récupère un seul module via son `path` (slug)
export async function getModuleBySlug(slug: string) {
    return prisma.module.findFirst({
        where: {path: slug},
        include: {
            sections: {
                include: {
                    contents: true,
                },
            },
        },
    });
}
