import {NextRequest, NextResponse} from "next/server";
import {getSessionCookie} from "better-auth/cookies";

const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/api/health",
    "/api/auth", // tous les endpoints better-auth
];

function isPublic(pathname: string): boolean {
    return PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
    );
}

export default function proxy(req: NextRequest) {
    const {pathname} = req.nextUrl;

    if (isPublic(pathname)) return NextResponse.next();

    // Check cookie-only : rapide, pas d'appel DB. On vérifie que l'utilisateur
    // a une session valide (cookie signé). Le rôle admin est vérifié dans la
    // page/route handler concernée via auth.api.getSession(), pour éviter un
    // appel DB sur toutes les requêtes.
    const sessionCookie = getSessionCookie(req);
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
