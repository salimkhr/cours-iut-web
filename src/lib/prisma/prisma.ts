import {PrismaClient} from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query'], // optionnel : supprime si tu ne veux pas voir les requêtes
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
