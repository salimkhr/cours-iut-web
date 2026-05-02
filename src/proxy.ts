// proxy.ts
import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/lib/auth';

export default async function proxy(req: NextRequest) {
    // 🧩 Vérification CSRF sur toutes les requêtes non GET vers /api/* (sauf Better Auth)
    if (req.nextUrl.pathname.startsWith('/api') &&
        !req.nextUrl.pathname.startsWith('/api/auth') &&
        req.method !== 'GET') {
        const cookieToken = req.cookies.get('csrfToken')?.value;
        const headerToken = req.headers.get('x-csrf-token');

        if (!cookieToken || !headerToken || cookieToken !== headerToken) {
            return NextResponse.json({error: 'Invalid CSRF token'}, {status: 403});
        }
    }

    // 🔒 Protection de l’espace admin et de l'inscription
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/register')) {
        const sessionRes = await auth.api.getSession({headers: req.headers});

        if (!sessionRes?.session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Vérification du rôle admin
        if (sessionRes.user.role !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // 🔒 Protection des autres pages pour les comptes classiques (connectés)
    // On exclut la page de login, les assets publics et les routes d'auth
    const publicPaths = ['/login', '/register', '/api/auth', '/api/health', '/images', '/icons', '/manifest.json', '/favicon.ico'];
    const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path)) || req.nextUrl.pathname === '/';

    if (!isPublicPath) {
        const sessionRes = await auth.api.getSession({headers: req.headers});
        if (!sessionRes?.session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // 🛡️ Sécurité des headers
    const res = NextResponse.next();
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CSP plus souple pour permettre les styles inline (Lucide icons, etc.) et le fonctionnement de Next.js
    const cspHeader = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://challenges.cloudflare.com " + (process.env.NEXT_PUBLIC_WS_URL || ""),
        "frame-src 'self' https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests"
    ].join('; ');

    res.headers.set('Content-Security-Policy', cspHeader);

    return res;
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json).*)'],
};