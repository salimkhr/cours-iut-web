# MCP Server — cours-iut-web

Serveur MCP stdio pour éditer les blocs de cours depuis Claude Desktop.

## Prérequis

- Node.js ≥ 20
- MongoDB accessible (ex: `mongodb://localhost:27017`)

## Build

```bash
cd mcp-server
bun install
bun run build
```

## Configuration Claude Desktop

Ajouter dans `claude_desktop_config.json` :
- macOS : `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows : `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cours-iut": {
      "command": "node",
      "args": ["/chemin/absolu/vers/mcp-server/dist/index.js"],
      "env": {
        "MONGODB_URI": "mongodb://localhost:27017"
      }
    }
  }
}
```

## Outils disponibles

| Outil | Description |
|-------|-------------|
| `list_modules` | Liste tous les modules disponibles |
| `list_sections(moduleSlug)` | Sections d'un module + types présents en DB |
| `get_content(module, section, type)` | Arbre de blocs complet |
| `insert_block(...)` | Insérer un nouveau bloc |
| `update_block(...)` | Mettre à jour les props d'un bloc (merge partiel) |
| `delete_block(...)` | Supprimer un bloc et ses enfants |
| `reorder_blocks(...)` | Réordonner les enfants d'un parent |

## Types de contenu

`contentType` accepte : `"cours"`, `"TP"`, `"examen"`.
