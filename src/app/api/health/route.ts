import {connectToDB} from '@/lib/mongodb';
import nextPkg from 'next/package.json';

const DB_PING_TIMEOUT_MS = 2000;

async function pingDb(): Promise<{status: 'up'; latencyMs: number} | {status: 'down'; error: string}> {
    const startedAt = Date.now();
    try {
        const db = await connectToDB();
        await Promise.race([
            db.command({ping: 1}),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`timeout after ${DB_PING_TIMEOUT_MS}ms`)), DB_PING_TIMEOUT_MS),
            ),
        ]);
        return {status: 'up', latencyMs: Date.now() - startedAt};
    } catch (err) {
        return {status: 'down', error: err instanceof Error ? err.message : 'unknown'};
    }
}

export async function GET() {
    const mem = process.memoryUsage();
    const db = await pingDb();

    return Response.json({
        status: db.status === 'up' ? 'ok' : 'degraded',
        app: {
            status: 'up',
            nextVersion: nextPkg.version,
            nodeVersion: process.version,
            runtime: process.env.NEXT_RUNTIME ?? 'nodejs',
            env: process.env.NODE_ENV,
            uptimeSec: Math.round(process.uptime()),
            memoryMb: {
                rss: Math.round(mem.rss / 1024 / 1024),
                heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
                heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
            },
        },
        db,
        timestamp: new Date().toISOString(),
    });
}
