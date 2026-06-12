import { NextResponse } from "next/server";
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

type OllamaChatResponse = {
    message?: { role: string; content: string };
};

export const POST = withAdmin(async (req: Request) => {
    try {
        const body = await req.json() as AssistLocalBody;

        if (!body.model) {
            return NextResponse.json({ error: "Aucun modèle sélectionné." }, { status: 400 });
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

        const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: body.model,
                stream: false,
                messages: [{ role: "system", content: systemPrompt }, ...messages],
            }),
            signal: AbortSignal.timeout(120_000),
        });

        if (!ollamaRes.ok) {
            const err = await ollamaRes.text();
            return NextResponse.json({ error: `Ollama: ${err}` }, { status: 502 });
        }

        const ollamaData = await ollamaRes.json() as OllamaChatResponse;
        const responseText = ollamaData.message?.content ?? "";

        // Extraire les blocs JSON si présents
        const blocksMatch = /<blocks>([\s\S]*?)<\/blocks>/.exec(responseText);
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
                            { $set: { blocks: newBlocks, updatedAt: now }, $inc: { version: 1 } }
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
                        }
                    );

                    revalidateTag(`content:${body.moduleSlug}:${body.sectionSlug}:${body.contentType}`, { expire: 0 });
                }
            } catch { /* blocs mal formés — on ignore */ }
        }

        const displayText = responseText
            .replace(/<blocks>[\s\S]*?<\/blocks>/g, "")
            .trim();

        return NextResponse.json({ text: displayText || responseText, blocks: newBlocks });
    } catch (error) {
        console.error("[ai-assist-local]", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
});
