import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import type {Db} from "mongodb";
import {z} from "zod";
import {readableSectionMap} from "@/lib/mcp/readTools";
import {createMistralClient, embedTexts, EMBED_MODEL} from "@/lib/rag/embed";
import {searchPoints, type PayloadFilter, type QdrantHit} from "@/lib/rag/qdrant";
import {DEFAULT_COLLECTION} from "@/lib/rag/runSync";
import {logUsage} from "@/lib/rag/usage";

// Outil MCP de recherche sémantique dans l'index RAG (Qdrant). Mêmes règles d'accès que
// search_content : un non-admin ne voit que les modules visibles et les sections publiées.
// L'index ne contient que des cours et des TP, jamais d'examen.

/** Vectorise la question et interroge l'index : remplaçable par un faux en test. */
export type SemanticSearch = (query: string, limit: number, filter: PayloadFilter) => Promise<{hits: QdrantHit[]; tokens: number}>;

/** Recherche réelle : Mistral pour la question, Qdrant pour les voisins. */
export const searchIndex: SemanticSearch = async (query, limit, filter) => {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error("MISTRAL_API_KEY manquante");
    const {vectors, tokens} = await embedTexts([query], {client: createMistralClient(apiKey)});
    const qdrant = {url: process.env.QDRANT_URL ?? "http://localhost:6333"};
    const hits = await searchPoints(qdrant, process.env.RAG_COLLECTION ?? DEFAULT_COLLECTION, vectors[0], limit, filter);
    return {hits, tokens};
};

/** Pour un non-admin, on demande plus de passages : certains tomberont dans des sections non publiées. */
const NON_ADMIN_OVERFETCH = 4;

export function registerRagTools(
    server: McpServer,
    deps: {isAdmin: boolean; getDb: () => Promise<Db>; search?: SemanticSearch},
): void {
    const {isAdmin, getDb, search = searchIndex} = deps;

    server.tool(
        "search_semantic",
        [
            "Recherche par le sens dans les cours et TP (index RAG) : trouve les passages qui traitent",
            "d'une notion même s'ils emploient d'autres mots que la question.",
            "Retourne les passages les plus proches avec leur localisation, leur score (1 = même sens) et leur texte.",
            "Utilise search_semantic pour savoir si une notion a déjà été enseignée et où ;",
            "search_content pour retrouver un mot ou une phrase exacts.",
            "L'index est mis à jour par synchro : un contenu modifié depuis peut ne pas y être encore.",
        ].join(" "),
        {
            query: z.string().min(1).describe("Question ou notion en langage naturel, ex. « parcourir un tableau associatif »"),
            module: z.string().optional().describe("Filtrer sur un module (slug, ex: php)"),
            type: z.enum(["cours", "TP"]).optional().describe("Filtrer par type de contenu : cours | TP"),
            limit: z.number().int().min(1).max(20).optional().describe("Nombre de passages (défaut : 5)"),
        },
        async ({query, module: moduleFilter, type: typeFilter, limit = 5}) => {
            const filter: PayloadFilter = {};
            if (moduleFilter) filter.moduleSlug = moduleFilter;
            if (typeFilter) filter.contentType = typeFilter;
            if (!isAdmin) filter.moduleVisible = true;

            const db = await getDb();
            const started = Date.now();
            let found: {hits: QdrantHit[]; tokens: number};
            try {
                found = await search(query, isAdmin ? limit : limit * NON_ADMIN_OVERFETCH, filter);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return {isError: true, content: [{type: "text" as const, text: `Index sémantique indisponible : ${message}`}]};
            }
            await logUsage(db, {
                step: "search", model: EMBED_MODEL, inputs: 1, tokens: found.tokens,
                durationMs: Date.now() - started, collection: process.env.RAG_COLLECTION ?? DEFAULT_COLLECTION, query,
            });

            const allowed = isAdmin ? null : await readableSectionMap(db);
            const results = found.hits
                .filter(h => !allowed || (allowed.get(String(h.payload.moduleSlug))?.has(String(h.payload.sectionSlug)) ?? false))
                .slice(0, limit)
                .map(h => ({
                    score: h.score,
                    moduleSlug: h.payload.moduleSlug,
                    sectionSlug: h.payload.sectionSlug,
                    contentType: h.payload.contentType,
                    title: h.payload.title,
                    blockIds: h.payload.blockIds,
                    text: h.payload.text,
                }));

            const note = "Le score compare les passages entre eux : seul l'ordre compte. " +
                "Pour lire une section entière : export_content_compact.";
            return {content: [{type: "text" as const, text: JSON.stringify({query, total: results.length, note, results}, null, 2)}]};
        },
    );
}
