import {NextRequest, NextResponse} from 'next/server';
import {verifyToken} from "@/lib/token";
import {cookies} from "next/headers";

export async function middleware(req: NextRequest) {
    // Vérification CSRF sur toutes les requêtes non GET vers /api/*
    if (req.nextUrl.pathname.startsWith('/api') && req.method !== 'GET') {
        const cookieToken = req.cookies.get('csrfToken')?.value;
        const headerToken = req.headers.get('x-csrf-token');

        if (!cookieToken || !headerToken || cookieToken !== headerToken) {
            return NextResponse.json({error: 'Invalid CSRF token'}, {status: 403});
        }
    }

    if (req.nextUrl.pathname.startsWith('/admin')) {

        const cookie = await cookies();

        const session = cookie.get('session')?.value;
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const verif = await verifyToken(session);

        if (!verif) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';"
    );
    return res;
}

export const config = {
    matcher: ['/api/:path*', '/admin/:path*'],
};