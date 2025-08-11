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