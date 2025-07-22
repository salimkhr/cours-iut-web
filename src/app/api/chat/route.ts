import {cookies} from "next/headers";
import Tokens from "csrf";

const tokens = new Tokens();
const backendUrl = process.env.BACKEND_API_URL;

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
            "Content-Type": "application/json"
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