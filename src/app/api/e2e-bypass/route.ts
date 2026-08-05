import {NextResponse} from "next/server";
import {E2E_BYPASS_COOKIE} from "@/lib/e2eBypass";

/**
 * Lève le contournement e2e en supprimant son cookie.
 *
 * Suppression côté serveur, et non via `document.cookie` : le cookie ouvre le
 * proxy sans session, il a vocation à être posé `httpOnly` par le harnais de
 * test — auquel cas le client ne peut pas le retirer lui-même.
 *
 * La requête n'a pas besoin d'être publique : elle porte justement le cookie,
 * donc le proxy la laisse passer par ce même contournement.
 */
export async function DELETE() {
    // En production le contournement n'existe pas : on ne révèle pas la route.
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({error: "Not found"}, {status: 404});
    }

    const res = NextResponse.json({cleared: true});
    res.cookies.set(E2E_BYPASS_COOKIE, "", {path: "/", maxAge: 0});
    return res;
}
