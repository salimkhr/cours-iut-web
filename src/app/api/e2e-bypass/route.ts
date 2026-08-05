import {NextResponse} from "next/server";
import {E2E_BYPASS_COOKIE} from "@/lib/e2eBypass";

/**
 * Pose et lève le contournement e2e, côté serveur.
 *
 * Le cookie vaut le secret `E2E_BYPASS_SECRET` : le poser depuis le navigateur
 * obligerait à sortir ce secret de l'environnement. Il est aussi destiné à être
 * `httpOnly` — un cookie qui ouvre le proxy sans session n'a pas à être
 * manipulable en JavaScript — auquel cas le client ne pourrait ni le poser ni
 * le retirer lui-même.
 *
 * Les deux méthodes sont inertes hors développement : elles répondent 404 sans
 * révéler l'existence du mécanisme.
 */

function notFound() {
    return NextResponse.json({error: "Not found"}, {status: 404});
}

const isDev = () => process.env.NODE_ENV !== "production";

/** Active le contournement (usage local : tests de bout en bout, captures). */
export async function POST() {
    const secret = process.env.E2E_BYPASS_SECRET;
    if (!isDev() || !secret) return notFound();

    const res = NextResponse.json({enabled: true});
    res.cookies.set(E2E_BYPASS_COOKIE, secret, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        // Jamais `secure` : le contournement ne sert qu'en HTTP local.
        secure: false,
    });
    return res;
}

/** Lève le contournement. */
export async function DELETE() {
    if (!isDev()) return notFound();

    const res = NextResponse.json({cleared: true});
    res.cookies.set(E2E_BYPASS_COOKIE, "", {path: "/", maxAge: 0});
    return res;
}
