import {connectToDB} from '@/lib/mongodb';
import nextPkg from 'next/package.json';

export async function GET() {
    const startedAt = Date.now();
    const mem = process.memoryUsage();

    const app = {
        status: 'up' as const,
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
    };

    try {
        const db = await connectToDB();
        await db.command({ping: 1});

        return Response.json({
            status: 'ok',
            app,
            db: {status: 'up', latencyMs: Date.now() - startedAt},
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        return Response.json(
            {
                status: 'error',
                app,
                db: {
                    status: 'down',
                    error: err instanceof Error ? err.message : 'unknown',
                },
                timestamp: new Date().toISOString(),
            },
            {status: 503},
        );
    }
}
