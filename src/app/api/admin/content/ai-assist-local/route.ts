import { revalidateTag } from "next/cache";
import { randomUUID } from "crypto";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { Block, CourseContent } from "@/types/CourseContent";
import { blockPropsSchemas } from "@/lib/blockSchemas";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

const enc = new TextEncoder();

function sseEvent(data: unknown): Uint8Array {
    return enc.encode(`data: ${JSON.stringify(data)}\n\n`);
}

type ChatMessage = { role: string; content: string };

type AssistLocalBody = {
    message: string;
    model: string;
    history: Pick<ChatMessage, "role" | "content">[];
    currentBlocks: Block[];
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
};

type ToolCall = {
    function: { name: string; arguments: Record<string, unknown> };
};

type OllamaMessage = {
    role: string;
    content: string;
    tool_calls?: ToolCall[];
};

type OllamaStreamChunk = {
    message?: { content: string };
    done: boolean;
};

type RawBlock = { id: string; type: string; props: Record<string, unknown>; colSpan?: "full" | "half" };

const BLOCK_TYPES = Object.keys(blockPropsSchemas).join(", ");

const TOOLS = [
    {
        type: "function",
        function: {
            name: "insert_block",
            description: "Insère un nouveau bloc dans le contenu du cours. Sans afterBlockId → ajoute à la fin.",
            parameters: {
                type: "object",
                properties: {
                    type: { type: "string", description: `Type de bloc parmi : ${BLOCK_TYPES}` },
                    props: { type: "object", description: "Propriétés du bloc selon son type" },
                    colSpan: { type: "string", enum: ["full", "half"], description: "Largeur du bloc (défaut : full)" },
                    afterBlockId: { type: "string", description: "ID du bloc après lequel insérer (optionnel)" },
                },
                required: ["type", "props"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "edit_block",
            description: "Remplace entièrement les props d'un bloc existant.",
            parameters: {
                type: "object",
                properties: {
                    blockId: { type: "string", description: "ID du bloc à modifier" },
                    props: { type: "object", description: "Nouvelles props complètes" },
                    colSpan: { type: "string", enum: ["full", "half"] },
                },
                required: ["blockId", "props"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "delete_block",
            description: "Supprime un bloc par son ID.",
            parameters: {
                type: "object",
                properties: {
                    blockId: { type: "string", description: "ID du bloc à supprimer" },
                },
                required: ["blockId"],
            },
        },
    },
];

function extractThinking(text: string): { thinking: string; content: string } {
    const thinkParts: string[] = [];
    const cleaned = text.replace(/<think>([\s\S]*?)<\/think>/gi, (_, inner: string) => {
        thinkParts.push(inner.trim());
        return "";
    });
    return { thinking: thinkParts.join("\n\n"), content: cleaned.trim() };
}

function blocksSummary(blocks: Block[]): string {
    if (!blocks.length) return "Aucun bloc (contenu vide).";
    return blocks
        .map((b) => {
            const p = b.props as Record<string, unknown>;
            const label = String(p?.text ?? p?.content ?? p?.title ?? "");
            return `- [${b.id}] ${b.type}${label ? ` : "${label.slice(0, 80)}"` : ""}`;
        })
        .join("\n");
}

async function runTool(
    toolCall: ToolCall,
    currentBlocks: Block[],
    moduleSlug: string,
    sectionSlug: string,
    contentType: string,
): Promise<{ result: string; updatedBlocks: Block[] }> {
    const { name, arguments: args } = toolCall.function;
    const db = await connectToDB();

    const existing = await db.collection<CourseContent>("course_content").findOne({
        moduleSlug,
        sectionSlug,
        contentType: contentType as CourseContent["contentType"],
    });

    let blocks: RawBlock[] = ((existing?.blocks ?? currentBlocks) as RawBlock[]);

    if (name === "insert_block") {
        const newBlock: RawBlock = {
            id: randomUUID(),
            type: String(args.type),
            props: (args.props as Record<string, unknown>) ?? {},
            colSpan: (args.colSpan as "full" | "half") ?? "full",
        };
        let at = blocks.length;
        if (args.afterBlockId) {
            const idx = blocks.findIndex((b) => b.id === args.afterBlockId);
            if (idx !== -1) at = idx + 1;
        }
        blocks.splice(at, 0, newBlock);

    } else if (name === "edit_block") {
        const idx = blocks.findIndex((b) => b.id === args.blockId);
        if (idx === -1) {
            return { result: `Bloc ${String(args.blockId)} introuvable.`, updatedBlocks: blocks as Block[] };
        }
        blocks[idx] = {
            ...blocks[idx],
            props: (args.props as Record<string, unknown>) ?? {},
            ...(args.colSpan ? { colSpan: args.colSpan as "full" | "half" } : {}),
        };

    } else if (name === "delete_block") {
        blocks = blocks.filter((b) => b.id !== args.blockId);

    } else {
        return { result: `Outil inconnu : ${name}`, updatedBlocks: blocks as Block[] };
    }

    const now = new Date();
    const upsert = await db.collection<CourseContent>("course_content").updateOne(
        { moduleSlug, sectionSlug, contentType: contentType as CourseContent["contentType"] },
        { $set: { blocks: blocks as Block[], updatedAt: now }, $inc: { version: 1 } },
        { upsert: true },
    );

    if (upsert.upsertedId) {
        const contentId = upsert.upsertedId.toString();
        await db.collection("modules").updateOne(
            { path: moduleSlug },
            {
                $set: {
                    "sections.$[s].contents.$[c].source": "db",
                    "sections.$[s].contents.$[c].contentId": contentId,
                },
            },
            { arrayFilters: [{ "s.path": sectionSlug }, { "c.type": contentType }] },
        );
    }

    revalidateTag(`content:${moduleSlug}:${sectionSlug}:${contentType}`, { expire: 0 });
    return { result: `OK — ${name} exécuté.`, updatedBlocks: blocks as Block[] };
}

async function streamOllamaText(
    ollamaBody: ReadableStream<Uint8Array>,
    controller: ReadableStreamDefaultController<Uint8Array>,
): Promise<void> {
    const reader = ollamaBody.getReader();
    const decoder = new TextDecoder();
    let lineBuffer = "";

    let inThinking = false;
    let thinkBuf = "";
    let tagBuf = "";
    let outBuf = "";

    function flushOut() {
        if (outBuf) {
            controller.enqueue(sseEvent({ type: "chunk", content: outBuf }));
            outBuf = "";
        }
    }

    function processToken(token: string) {
        for (let ci = 0; ci < token.length; ci++) {
            const ch = token[ci];
            const targetTag = inThinking ? "</think>" : "<think>";
            const candidate = tagBuf + ch;
            if (targetTag.startsWith(candidate)) {
                tagBuf = candidate;
                if (candidate === targetTag) {
                    if (inThinking) {
                        controller.enqueue(sseEvent({ type: "thinking", content: thinkBuf }));
                        thinkBuf = "";
                        inThinking = false;
                    } else {
                        flushOut();
                        inThinking = true;
                    }
                    tagBuf = "";
                }
            } else {
                if (tagBuf) {
                    if (inThinking) thinkBuf += tagBuf; else outBuf += tagBuf;
                    tagBuf = "";
                }
                const freshTag = inThinking ? "</think>" : "<think>";
                if (freshTag.startsWith(ch)) {
                    tagBuf = ch;
                } else {
                    if (inThinking) thinkBuf += ch; else outBuf += ch;
                }
            }
        }
        flushOut();
    }

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            lineBuffer += decoder.decode(value, { stream: true });
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() ?? "";
            for (const line of lines) {
                if (!line.trim()) continue;
                let chunk: OllamaStreamChunk;
                try { chunk = JSON.parse(line) as OllamaStreamChunk; } catch { continue; }
                const token = chunk.message?.content ?? "";
                if (token) processToken(token);
            }
        }
        if (tagBuf) { if (inThinking) thinkBuf += tagBuf; else outBuf += tagBuf; }
        flushOut();
        if (thinkBuf) controller.enqueue(sseEvent({ type: "thinking", content: thinkBuf }));
    } finally {
        reader.releaseLock();
    }
}

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json() as AssistLocalBody;

    if (!body.model) {
        return new Response(
            JSON.stringify({ error: "Aucun modèle sélectionné." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    const systemPrompt = `Tu es un assistant pédagogique pour un système de cours universitaires.
Tu peux modifier le contenu du cours en appelant les outils disponibles (insert_block, edit_block, delete_block).

Types de blocs disponibles : ${BLOCK_TYPES}.

Blocs actuels du cours :
${blocksSummary(body.currentBlocks)}

RÈGLES :
- N'appelle un outil QUE si l'utilisateur demande EXPLICITEMENT d'ajouter, modifier ou supprimer du contenu.
- Pour les salutations, questions générales ou messages courts sans intention claire, réponds en texte sans outil.
- Réponds toujours en français.`;

    const messages: ChatMessage[] = [
        ...body.history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: body.message },
    ];

    const stream = new ReadableStream({
        async start(controller) {
            // Ping initial : garde la connexion ouverte côté Cloudflare/proxy pendant que Ollama réfléchit
            controller.enqueue(enc.encode(": ping\n\n"));

            // ── Appel 1 : non-streaming avec tools pour détecter les tool_calls ──
            let firstRes: Response;
            try {
                firstRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: body.model,
                        stream: false,
                        messages: [{ role: "system", content: systemPrompt }, ...messages],
                        tools: TOOLS,
                    }),
                });
            } catch {
                controller.enqueue(sseEvent({ type: "error", message: "Impossible de joindre Ollama." }));
                controller.close();
                return;
            }

            if (!firstRes.ok) {
                const err = await firstRes.text();
                controller.enqueue(sseEvent({ type: "error", message: `Ollama : ${err}` }));
                controller.close();
                return;
            }

            const firstData = await firstRes.json() as { message: OllamaMessage };
            const assistantMsg = firstData.message;
            let finalBlocks: Block[] | null = null;

            // Extraire et émettre le thinking avant tout contenu
            const { thinking: firstThinking, content: firstContent } = extractThinking(assistantMsg.content ?? "");
            if (firstThinking) controller.enqueue(sseEvent({ type: "thinking", content: firstThinking }));

            if (assistantMsg.tool_calls?.length) {
                // ── Exécuter les tool_calls ──────────────────────────────────────
                const followUpMessages: ChatMessage[] = [
                    ...messages,
                    { role: "assistant", content: firstContent || (assistantMsg.content ?? "") },
                ];

                for (const toolCall of assistantMsg.tool_calls) {
                    const { result, updatedBlocks } = await runTool(
                        toolCall,
                        body.currentBlocks,
                        body.moduleSlug,
                        body.sectionSlug,
                        body.contentType,
                    );
                    finalBlocks = updatedBlocks;
                    followUpMessages.push({ role: "tool", content: result });
                }

                // ── Appel 2 : streaming pour le texte de confirmation ────────────
                let secondRes: Response;
                try {
                    secondRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            model: body.model,
                            stream: true,
                            messages: [{ role: "system", content: systemPrompt }, ...followUpMessages],
                        }),
                    });
                } catch {
                    controller.enqueue(sseEvent({ type: "done", blocks: finalBlocks }));
                    controller.close();
                    return;
                }

                if (secondRes.ok && secondRes.body) {
                    await streamOllamaText(secondRes.body, controller);
                }

            } else {
                // ── Pas de tool_calls : émettre le texte directement ────────────
                if (firstContent) controller.enqueue(sseEvent({ type: "chunk", content: firstContent }));
            }

            controller.enqueue(sseEvent({ type: "done", blocks: finalBlocks }));
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
});
