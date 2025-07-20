export async function POST(req: Request) {
    const {message} = await req.json();

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "codellama:7b",
            prompt: message,
            stream: true,
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