import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { connectToDB } from "../db.js";

export function registerListModules(server: McpServer): void {
    server.tool(
        "list_modules",
        "Retourne la liste de tous les modules disponibles dans la base.",
        {},
        async () => {
            const db = await connectToDB();
            const modules = await db
                .collection<{ path: string; title: string }>("modules")
                .find({}, { projection: { path: 1, title: 1, _id: 0 } })
                .toArray();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            modules.map((m) => ({ slug: m.path, title: m.title ?? m.path })),
                            null,
                            2
                        ),
                    },
                ],
            };
        }
    );
}
