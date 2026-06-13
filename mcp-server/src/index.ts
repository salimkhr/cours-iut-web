import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListModules } from "./tools/list-modules.js";
import { registerListSections } from "./tools/list-sections.js";
import { registerGetContent } from "./tools/get-content.js";
import { registerInsertBlock } from "./tools/insert-block.js";
import { registerUpdateBlock } from "./tools/update-block.js";
import { registerDeleteBlock } from "./tools/delete-block.js";
import { registerReorderBlocks } from "./tools/reorder-blocks.js";

const server = new McpServer({
    name: "cours-iut-mcp",
    version: "1.0.0",
});

registerListModules(server);
registerListSections(server);
registerGetContent(server);
registerInsertBlock(server);
registerUpdateBlock(server);
registerDeleteBlock(server);
registerReorderBlocks(server);

const transport = new StdioServerTransport();
await server.connect(transport);
