import {NextRequest, NextResponse} from "next/server";
import {getSessionCookie} from "better-auth/cookies";

const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/api/health",
    "/api/auth", // tous les endpoints better-auth
    "/mentions-legales",
    "/politique-confidentialite",
    "/conditions-utilisation",
    "/api/upload-avatar",
    "/email-verifie",
];

function isPublic(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
}

export default function proxy(req: NextRequest) {
    const {pathname} = req.nextUrl;
    const sessionCookie = getSessionCookie(req);

    // La redirection des utilisateurs connectés hors de /login et /register
    // est gérée dans les pages elles-mêmes via getServerSession() (validation DB).
    // Ici on ne vérifie que la présence du cookie, ce qui ne suffit pas pour
    // distinguer une session valide d'un cookie périmé.

    if (isPublic(pathname)) return NextResponse.next();

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
