import {NextRequest, NextResponse} from "next/server";
import {getSessionCookie} from "better-auth/cookies";

const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/api/health",
    "/oauth/token",
    "/api/auth", // tous les endpoints better-auth
    "/api/mcp", // auth par Bearer token OAuth, gérée dans route.ts (pas de cookie de session)
    "/.well-known", // OAuth discovery (openid-configuration + oauth-protected-resource → Scalekit)
    "/mentions-legales",
    "/politique-confidentialite",
    "/conditions-utilisation",
    "/email-verifie",
    "/reset-password",
    "/forgot-password",
    "/resend-verification",
];

function isPublic(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
}

export default function proxy(req: NextRequest) {
    const {pathname} = req.nextUrl;
    const sessionCookie = getSessionCookie(req);

    // Bypass e2e/dev — NE JAMAIS ACTIVER EN PRODUCTION.
    // Doublement verrouillé : (1) inactif si NODE_ENV === "production",
    // (2) requiert un cookie "e2e-bypass" égal au secret E2E_BYPASS_SECRET
    // (défini uniquement dans .env.local, git-ignored). Sert à laisser
    // Playwright capturer des pages protégées en local sans passer par le login.
    if (
        process.env.NODE_ENV !== "production" &&
        process.env.E2E_BYPASS_SECRET &&
        req.cookies.get("e2e-bypass")?.value === process.env.E2E_BYPASS_SECRET
    ) {
        return NextResponse.next();
    }

    // La redirection des utilisateurs connectés hors de /login et /register
    // est gérée dans les pages elles-mêmes via getServerSession() (validation DB).
    // Ici on ne vérifie que la présence du cookie, ce qui ne suffit pas pour
    // distinguer une session valide d'un cookie périmé.

    if (isPublic(pathname)) return NextResponse.next();

    // Sync inter-environnements (staging → prod) : auth par secret partagé,
    // validée en timing-safe dans la route. Sans secret valide, la route renvoie 403.
    if (pathname === "/api/admin/import" && req.headers.get("x-sync-secret")) {
        return NextResponse.next();
    }

    // Check cookie-only : rapide, pas d'appel DB. Le rôle admin est vérifié
    // dans la page/route handler concernée via auth.api.getSession().
    if (!sessionCookie) {
        // Routes API => 401 JSON, pages => redirect vers /login
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect_to", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
