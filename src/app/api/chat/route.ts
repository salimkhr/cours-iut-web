import {cookies} from "next/headers";
import Tokens from "csrf";

const tokens = new Tokens();
const backendUrl = process.env.BACKEND_IA_API_URL;
const backendKey = process.env.BACKEND_IA_API_KEY;

/**
 * Envoie un message au serveur backend via une requête POST,
 * avec vérification du jeton CSRF. Le serveur répond en streaming.
 *
 * @param {Request} req - Objet `Request` contenant le message utilisateur à transmettre.
 * @returns {Response} - Réponse contenant le flux de contenu retourné par le backend (stream).
 */
export async function POST(req: Request) {
    const cookieStore = await cookies();
    const secret = cookieStore.get('csrfSecret')?.value;
    const token = req.headers.get('csrf-token');

    if (!secret || !token || !tokens.verify(secret, token)) {
        return new Response(JSON.stringify({error: 'Invalid CSRF token'}), {
            status: 403,
        });
    }

    const {message} = await req.json();

    const ollamaRes = await fetch(`${backendUrl}/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'x-api-key': backendKey ?? ""
        },
        body: JSON.stringify({
            message,
        }),
    });

    const stream = ollamaRes.body;
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}