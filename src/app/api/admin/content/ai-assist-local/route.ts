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
            description: "Supprime un ou plusieurs blocs. Passer un seul ID (string) ou un tableau d'IDs (array).",
            parameters: {
                type: "object",
                properties: {
                    blockId: {
                        description: "ID du bloc à supprimer, ou tableau d'IDs pour en supprimer plusieurs.",
                        oneOf: [
                            { type: "string" },
                            { type: "array", items: { type: "string" } },
                        ],
                    },
                },
                required: ["blockId"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "delete_all_blocks",
            description: "Supprime TOUS les blocs du cours d'un seul coup. À utiliser quand l'utilisateur demande de tout effacer.",
            parameters: { type: "object", properties: {} },
        },
    },
];

// Certains modèles (Mistral) écrivent les tool_calls comme JSON dans content
// au lieu de remplir le champ tool_calls structuré.
// Le contenu peut contenir N fragments séparés, chacun potentiellement malformé
// (accolades fermantes manquantes — ex. liste numérotée générée par Mistral).

function extractJsonBlock(text: string, start: number): { slice: string; end: number } | null {
    // On suit arrayDepth séparément pour clore au premier ] qui ferme le tableau,
    // même si des accolades { sont encore ouvertes (JSON malformé de Mistral).
    let arrayDepth = 0;
    for (let i = start; i < text.length; i++) {
        if (text[i] === "[") arrayDepth++;
        else if (text[i] === "]") {
            arrayDepth--;
            if (arrayDepth === 0) return { slice: text.slice(start, i + 1), end: i + 1 };
        }
    }
    return null;
}

function autoFixJson(json: string): string {
    const opens = (json.match(/\{/g) ?? []).length;
    const closes = (json.match(/\}/g) ?? []).length;
    const missing = opens - closes;
    if (missing > 0 && json.endsWith("]")) {
        return json.slice(0, -1) + "}".repeat(missing) + "]";
    }
    return json;
}

function tryParseJsonCalls(json: string): ToolCall[] | null {
    const parse = (s: string): ToolCall[] | null => {
        try {
            const raw = JSON.parse(s) as unknown;
            const items = Array.isArray(raw) ? raw : [raw];
            const calls: ToolCall[] = [];
            for (const item of items) {
                const obj = item as Record<string, unknown>;
                if (typeof obj.name === "string" && obj.arguments !== undefined) {
                    calls.push({ function: { name: obj.name, arguments: obj.arguments as Record<string, unknown> } });
                } else if (obj.function && typeof (obj.function as Record<string, unknown>).name === "string") {
                    calls.push(obj as unknown as ToolCall);
                } else {
                    return null;
                }
            }
            return calls.length > 0 ? calls : null;
        } catch { return null; }
    };
    return parse(json) ?? parse(autoFixJson(json));
}

function parseTextToolCalls(content: string): { calls: ToolCall[]; prose: string } | null {
    const allCalls: ToolCall[] = [];
    const proseRanges: [number, number][] = [];
    let searchPos = 0;
    let lastEnd = 0;

    while (searchPos < content.length) {
        const jsonStart = content.indexOf("[{", searchPos);
        if (jsonStart === -1) break;
        const block = extractJsonBlock(content, jsonStart);
        if (!block) break;

        proseRanges.push([lastEnd, jsonStart]);
        lastEnd = block.end;
        searchPos = block.end;

        const calls = tryParseJsonCalls(block.slice);
        if (calls) allCalls.push(...calls);
    }

    if (allCalls.length === 0) return null;

    proseRanges.push([lastEnd, content.length]);
    const prose = proseRanges
        .map(([s, e]) => content.slice(s, e).trim())
        .filter(Boolean)
        .join("\n")
        .trim();

    return { calls: allCalls, prose };
}

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
        const toDelete = new Set(
            Array.isArray(args.blockId)
                ? (args.blockId as string[])
                : [String(args.blockId)],
        );
        blocks = blocks.filter((b) => !toDelete.has(b.id));

    } else if (name === "delete_all_blocks") {
        blocks = [];

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


function aiLog(step: string, data: Record<string, unknown>) {
    console.log(`[ai-assist] ${step}`, JSON.stringify(data));
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

    aiLog("request", {
        model: body.model,
        module: `${body.moduleSlug}/${body.sectionSlug}/${body.contentType}`,
        historyLength: body.history.length,
        blocksCount: body.currentBlocks.length,
        userMessage: body.message.slice(0, 200),
    });

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
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                aiLog("error:fetch1", { error: msg });
                controller.enqueue(sseEvent({ type: "error", message: `Impossible de joindre Ollama (${OLLAMA_BASE_URL}) : ${msg}` }));
                controller.close();
                return;
            }

            if (!firstRes.ok) {
                const errText = await firstRes.text();
                aiLog("error:response1", { status: firstRes.status, body: errText });
                controller.enqueue(sseEvent({ type: "error", message: `Ollama HTTP ${firstRes.status} : ${errText}` }));
                controller.close();
                return;
            }

            let firstData: { message: OllamaMessage };
            try {
                firstData = await firstRes.json() as { message: OllamaMessage };
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                aiLog("error:parse1", { error: msg });
                controller.enqueue(sseEvent({ type: "error", message: `Réponse Ollama invalide (JSON) : ${msg}` }));
                controller.close();
                return;
            }

            const assistantMsg = firstData.message;
            let finalBlocks: Block[] | null = null;

            // Extraire et émettre le thinking avant tout contenu
            const { thinking: firstThinking, content: firstContent } = extractThinking(assistantMsg.content ?? "");

            // Certains modèles (Mistral) écrivent les tool_calls en JSON dans content
            // plutôt que dans le champ tool_calls structuré — on les détecte ici.
            // parseTextToolCalls gère aussi le JSON encapsulé dans de la prose.
            const structuredCalls = assistantMsg.tool_calls?.length ? assistantMsg.tool_calls : null;
            const parsedText = !structuredCalls ? parseTextToolCalls(firstContent) : null;
            const effectiveCalls = structuredCalls ?? parsedText?.calls ?? null;

            aiLog("response1", {
                hasThinking: !!firstThinking,
                thinkingLength: firstThinking.length,
                contentPreview: firstContent.slice(0, 150),
                toolCallsSource: structuredCalls ? "structured" : parsedText ? "text" : "none",
                toolCalls: effectiveCalls?.map((t) => t.function.name) ?? [],
            });

            if (firstThinking) controller.enqueue(sseEvent({ type: "thinking", content: firstThinking }));

            if (effectiveCalls?.length) {
                // ── Exécuter les tool_calls ──────────────────────────────────────
                // content vide : certains modèles (Mistral) mettent le JSON des tool_calls
                // dans content — le ré-émettre ferait apparaître ce JSON dans le stream.
                const followUpMessages: OllamaMessage[] = [
                    ...messages,
                    // Pour les text-calls (Mistral), on passe content vide sans tool_calls
                    // pour éviter que le modèle ré-émette le JSON dans la confirmation.
                    { role: "assistant", content: "", ...(structuredCalls ? { tool_calls: structuredCalls } : {}) },
                ];

                for (const toolCall of effectiveCalls) {
                    aiLog("tool:call", { name: toolCall.function.name, args: toolCall.function.arguments });
                    const { result, updatedBlocks } = await runTool(
                        toolCall,
                        body.currentBlocks,
                        body.moduleSlug,
                        body.sectionSlug,
                        body.contentType,
                    );
                    aiLog("tool:result", { name: toolCall.function.name, result, newBlocksCount: updatedBlocks.length });
                    finalBlocks = updatedBlocks;
                    followUpMessages.push({ role: "tool", content: result });
                }

                // ── Appel 2 : non-streaming pour pouvoir filtrer le JSON répété ────
                let secondRes: Response;
                try {
                    secondRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            model: body.model,
                            stream: false,
                            messages: [{ role: "system", content: systemPrompt }, ...followUpMessages],
                        }),
                    });
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    aiLog("error:fetch2", { error: msg });
                    controller.enqueue(sseEvent({ type: "done", blocks: finalBlocks }));
                    controller.close();
                    return;
                }

                if (!secondRes.ok) {
                    const errText = await secondRes.text();
                    aiLog("error:response2", { status: secondRes.status, body: errText });
                } else {
                    const secondData = await secondRes.json() as { message?: OllamaMessage };
                    const rawConfirm = secondData.message?.content ?? "";
                    // Supprimer tout JSON de tool_calls que le modèle répète dans sa confirmation
                    const { content: cleanedConfirm } = extractThinking(rawConfirm);
                    const stripped = parseTextToolCalls(cleanedConfirm)?.prose ?? cleanedConfirm;
                    aiLog("confirm", { raw: rawConfirm.slice(0, 200), stripped: stripped.slice(0, 200) });
                    const confirmation = stripped.trim() || `Opération effectuée (${effectiveCalls.map((t) => t.function.name).join(", ")}).`;
                    controller.enqueue(sseEvent({ type: "chunk", content: confirmation }));
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
