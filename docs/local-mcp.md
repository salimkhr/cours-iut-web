# MCP local cours-iut

Ce serveur MCP est fait pour travailler sur la base Mongo locale du projet, sans passer par la prod ni par le MCP HTTP OAuth.

## Commande

Depuis la racine du repo :

```bash
bun run mcp:local
```

La commande charge `.env` puis `.env.local` et lance `src/scripts/mcp-local.ts` en `stdio`.

## Securite locale

Au demarrage, le serveur refuse toute `MONGODB_URI` qui ne cible pas :

- `localhost`
- `127.0.0.1`
- `::1`

La base utilisee reste `cours-iut-web`, comme `src/lib/mongodb.ts`.

## Outils exposes

- `local_target` : affiche la cible Mongo autorisee sans exposer l'URI complete.
- `get_module` : lit les metadonnees d'un module sans `_id` brut ni sections imbriquees.
- `list_sections` : liste les sections d'un module local.
- `get_section` : lit les metadonnees d'une section.
- `get_content` : lit les blocs DB d'un contenu.
- `save_content` : sauvegarde les blocs d'un contenu local, avec `dryRun`.
- `replace_module_sections` : remplace toutes les sections d'un module local, avec `dryRun` et `force`.

## Exemple de configuration MCP

Utiliser un chemin absolu cote client MCP :

```toml
[mcp_servers.cours-iut-local]
command = "bun"
args = ["run", "mcp:local"]
cwd = "C:\\Users\\Utilisateur\\PhpstormProjects\\cours-iut-web"
```

Le serveur ecrit uniquement dans Mongo local. Pour synchroniser depuis staging, lire le contenu avec le connecteur staging, puis ecrire dans ce MCP local.
