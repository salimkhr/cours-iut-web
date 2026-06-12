import { revalidateTag } from "next/cache";
import { withAdmin } from "@/lib/withAdmin";
import { connectToDB } from "@/lib/mongodb";
import type { Block, CourseContent } from "@/types/CourseContent";
import { containerRules, blockPropsSchemas } from "@/lib/blockSchemas";
import { validateBlockTree } from "@/lib/validateBlockTree";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type AssistLocalBody = {
    message: string;
    model: string;
    history: Pick<ChatMessage, "role" | "content">[];
    currentBlocks: Block[];
    moduleSlug: string;
    sectionSlug: string;
    contentType: string;
};

type OllamaStreamChunk = {
    message?: { role: string; content: string };
    done: boolean;
};

const enc = new TextEncoder();

function sseEvent(data: unknown): Uint8Array {
    return enc.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export const POST = withAdmin(async (req: Request) => {
    const body = await req.json() as AssistLocalBody;

    if (!body.model) {
        return new Response(
            JSON.stringify({ error: "Aucun modèle sélectionné." }),
            { status: 400, headers: { "Content-Type": "application/json" } },
        );
    }

    const nestingDoc = Object.entries(containerRules)
        .map(([type, rule]) => {
            const children = rule.allowedChildren === "any"
                ? "tout type (sauf columns)"
                : rule.allowedChildren.join(", ");
            const parents = rule.allowedParents
                ? rule.allowedParents.map((p) => p ?? "racine").join(", ")
                : "partout";
            return `- ${type} : enfants = ${children} ; parents = ${parents}`;
        })
        .join("\n");

    const systemPrompt = `Tu es un assistant pédagogique expert en création de contenu de cours universitaires.
Tu aides à construire des arbres de blocs pour un système de cours interactif.

Types de blocs disponibles : ${Object.keys(blockPropsSchemas).join(", ")}.
Règles de nesting :
${nestingDoc}

Blocs actuels du cours (JSON) :
${JSON.stringify(body.currentBlocks, null, 2)}

RÈGLES :
- Si l'utilisateur demande une modification des blocs, inclus le nouvel arbre JSON entre balises <blocks> et </blocks>.
- Chaque bloc doit avoir un "id" unique (uuid v4), un "type", des "props" (objet) et optionnellement "children" (tableau).
- Réponds toujours en français.
- En dehors des balises <blocks>, explique ce que tu as fait en une ou deux phrases.`;

    const messages: ChatMessage[] = [
        ...body.history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: body.message },
    ];

    let ollamaRes: Response;
    try {
        ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: body.model,
                stream: true,
                messages: [{ role: "system", content: systemPrompt }, ...messages],
            }),
        });
    } catch {
        return new Response(
            JSON.stringify({ error: "Impossible de joindre Ollama." }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    }

    if (!ollamaRes.ok) {
        const err = await ollamaRes.text();
        return new Response(
            JSON.stringify({ error: `Ollama: ${err}` }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    }

    const ollamaBody = ollamaRes.body;
    if (!ollamaBody) {
        return new Response(
            JSON.stringify({ error: "Pas de stream Ollama." }),
            { status: 502, headers: { "Content-Type": "application/json" } },
        );
    }

    const stream = new ReadableStream({
        async start(controller) {
            const reader = ollamaBody.getReader();
            const decoder = new TextDecoder();
            let fullText = "";
            let lineBuffer = "";

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
                        try {
                            chunk = JSON.parse(line) as OllamaStreamChunk;
                        } catch {
                            continue;
                        }

                        const token = chunk.message?.content ?? "";
                        if (token) {
                            fullText += token;
                            controller.enqueue(sseEvent({ type: "chunk", content: token }));
                        }

                        if (chunk.done) {
                            const blocksMatch = /<blocks>([\s\S]*?)<\/blocks>/.exec(fullText);
                            let newBlocks: Block[] | null = null;

                            if (blocksMatch) {
                                try {
                                    const parsed = JSON.parse(blocksMatch[1].trim()) as Block[];
                                    const validation = validateBlockTree(parsed);
                                    if (validation.valid) {
                                        newBlocks = parsed;

                                        const db = await connectToDB();
                                        const now = new Date();
                                        const existing = await db
                                            .collection<CourseContent>("course_content")
                                            .findOne({
                                                moduleSlug: body.moduleSlug,
                                                sectionSlug: body.sectionSlug,
                                                contentType: body.contentType as CourseContent["contentType"],
                                            });

                                        let contentId: string;
                                        if (existing) {
                                            await db.collection<CourseContent>("course_content").updateOne(
                                                { _id: existing._id },
                                                { $set: { blocks: newBlocks, updatedAt: now }, $inc: { version: 1 } },
                                            );
                                            contentId = existing._id!.toString();
                                        } else {
                                            const insertResult = await db.collection<CourseContent>("course_content").insertOne({
                                                moduleSlug: body.moduleSlug,
                                                sectionSlug: body.sectionSlug,
                                                contentType: body.contentType as "cours" | "TP" | "examen",
                                                blocks: newBlocks,
                                                version: 1,
                                                createdAt: now,
                                                updatedAt: now,
                                            });
                                            contentId = insertResult.insertedId.toString();
                                        }

                                        await db.collection("modules").updateOne(
                                            { path: body.moduleSlug },
                                            {
                                                $set: {
                                                    "sections.$[s].contents.$[c].source": "db",
                                                    "sections.$[s].contents.$[c].contentId": contentId,
                                                },
                                            },
                                            {
                                                arrayFilters: [
                                                    { "s.path": body.sectionSlug },
                                                    { "c.type": body.contentType },
                                                ],
                                            },
                                        );

                                        revalidateTag(
                                            `content:${body.moduleSlug}:${body.sectionSlug}:${body.contentType}`,
                                            { expire: 0 },
                                        );
                                    }
                                } catch { /* blocs mal formés — on ignore */ }
                            }

                            controller.enqueue(sseEvent({ type: "done", blocks: newBlocks }));
                        }
                    }
                }
            } catch {
                controller.enqueue(sseEvent({ type: "error", message: "Erreur de streaming Ollama." }));
            } finally {
                controller.close();
            }
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
