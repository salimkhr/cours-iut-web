import {clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/health",
]);

const isAdminRoute = createRouteMatcher([
    "/admin(.*)",
    "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) return;

    // 1) Tout sauf l'allowlist exige une session
    await auth.protect();

    // 2) Routes admin : on exige role === "admin" via le claim JWT custom
    if (isAdminRoute(req)) {
        const {sessionClaims} = await auth();
        const role = sessionClaims?.metadata?.role;

        if (role !== "admin") {
            return req.nextUrl.pathname.startsWith("/api/")
                ? NextResponse.json({error: "Not found"}, {status: 404})
                : NextResponse.redirect(new URL("/", req.url));
        }
    }
});

export const config = {
    matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
