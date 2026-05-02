import nextPkg from 'next/package.json';

export async function GET() {
    const mem = process.memoryUsage();

    return Response.json({
        status: 'ok',
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
        timestamp: new Date().toISOString(),
    });
}
