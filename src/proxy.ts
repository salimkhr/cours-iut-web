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

const AUTH_ONLY_PATHS = ["/login", "/register"];

function isPublic(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
}

export default function proxy(req: NextRequest) {
    const {pathname} = req.nextUrl;
    const sessionCookie = getSessionCookie(req);

    // Déjà connecté → /login et /register redirigent vers /
    if (sessionCookie && AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
    }

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
