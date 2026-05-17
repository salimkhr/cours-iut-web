# Design — Serveur MCP Admin

**Date :** 2026-05-17
**Statut :** Approuvé

---

## Contexte

Le site IUT dispose d'une interface admin web pour gérer modules et sections. L'objectif est d'exposer ces mêmes opérations via MCP (Model Context Protocol) pour que Claude puisse les exécuter en langage naturel — depuis Claude Code (dev local) ou Claude Desktop (prod).

---

## Architecture

### Nouveaux fichiers

| Fichier | Rôle |
|---------|------|
| `src/app/api/mcp/route.ts` | Route Next.js — handler POST MCP avec `StreamableHTTPServerTransport` |
| `src/lib/mcp/tools.ts` | Définition et implémentation des outils MCP |
| `src/lib/mcp/auth.ts` | Validation du header `x-mcp-key` |
| `.mcp.json` | Config Claude Code (localhost) |

### Variables d'environnement

| Variable | Rôle |
|----------|------|
| `MCP_SECRET_KEY` | Clé secrète partagée entre le client MCP et le serveur |

`MCP_SECRET_KEY` est ajouté à `.env.local` (non commité). La même clé est configurée dans Claude Desktop pour la prod.

### Package requis

```bash
npm install @modelcontextprotocol/sdk
```

---

## Authentification

Chaque requête MCP doit inclure le header :
```
x-mcp-key: <MCP_SECRET_KEY>
```

`src/lib/mcp/auth.ts` expose une fonction `validateMcpKey(request: Request): boolean` qui lit `process.env.MCP_SECRET_KEY` et le compare au header. Si absent ou invalide → réponse 401.

Aucune modification des routes admin existantes — le MCP appelle MongoDB directement via `connectToDB()`, en réutilisant les schemas Zod existants.

---

## Route MCP — `src/app/api/mcp/route.ts`

```ts
// POST /api/mcp — point d'entrée unique pour tous les appels MCP
export async function POST(request: Request) {
  if (!validateMcpKey(request)) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Initialise le serveur MCP avec les outils définis dans tools.ts
  // Crée un StreamableHTTPServerTransport
  // Connecte et traite la requête
  // Retourne la réponse streamée
}
```

Le transport `StreamableHTTPServerTransport` est stateless : chaque POST est indépendant, compatible avec Next.js App Router et les déploiements serverless.

---

## Outils MCP — `src/lib/mcp/tools.ts`

### Outils Modules

#### `list_modules`
- **Description :** Lister tous les modules disponibles
- **Paramètres :** aucun
- **Implémentation :** `db.collection('modules').find({}).toArray()`
- **Retour :** tableau de `{ _id, title, path, description, sections[] }`

#### `create_module`
- **Description :** Créer un nouveau module
- **Paramètres :** `title` (string), `path` (string), `iconName` (string), `description?` (string)
- **Validation :** `moduleFormSchema` (Zod, existant dans `src/lib/schemas/module.schema.ts`)
- **Implémentation :** `db.collection('modules').insertOne(data)`
- **Retour :** `{ insertedId }`

#### `update_module`
- **Description :** Modifier un module existant
- **Paramètres :** `moduleId` (string), `title?`, `description?`, `iconName?`
- **Validation :** `moduleFormSchema` partiel
- **Implémentation :** `db.collection('modules').updateOne({ _id: ObjectId(moduleId) }, { $set: data })`
- **Retour :** `{ success: true }`

### Outils Sections

#### `list_sections`
- **Description :** Lister les sections d'un module
- **Paramètres :** `moduleId` (string)
- **Implémentation :** `db.collection('modules').findOne({ _id: ObjectId(moduleId) }, { projection: { sections: 1 } })`
- **Retour :** tableau de sections avec `{ order, title, path, isAvailable, correctionIsAvailable, examenIsLock }`

#### `create_section`
- **Description :** Ajouter une section à un module
- **Paramètres :** `moduleId` (string), `title` (string), `path` (string), `order` (number), `contents` (string[]), `totalDuration` (number), `description?` (string)
- **Validation :** `sectionApiSchema` (Zod, existant dans les routes admin)
- **Implémentation :** `$push` dans `sections[]` du module
- **Retour :** `{ success: true, section }`

#### `update_section`
- **Description :** Modifier une section existante
- **Paramètres :** `moduleId` (string), `sectionPath` (string), et champs optionnels : `title?`, `description?`, `order?`, `contents?`, `totalDuration?`
- **Implémentation :** localise par `path` dans `sections[]`, met à jour les champs fournis
- **Retour :** `{ success: true, section }`

#### `toggle_section`
- **Description :** Verrouiller ou déverrouiller une section
- **Paramètres :** `moduleId` (string), `order` (number), `key` (`isAvailable` | `correctionIsAvailable` | `examenIsLock`), `value` (boolean)
- **Implémentation :** `$set` sur `sections.$.{key}` via positional operator
- **Retour :** `{ success: true, key, value }`

---

## Configuration clients

### Claude Code — `.mcp.json` (racine du projet)

```json
{
  "mcpServers": {
    "cours-iut-admin": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "x-mcp-key": "${MCP_SECRET_KEY}"
      }
    }
  }
}
```

> `.mcp.json` est ajouté au `.gitignore` car il contient la clé.

### Claude Desktop — `claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cours-iut-admin-prod": {
      "url": "https://votre-domaine.com/api/mcp",
      "headers": {
        "x-mcp-key": "votre-cle-secrete"
      }
    }
  }
}
```

---

## Exemples d'utilisation

```
"Liste tous les modules disponibles"
→ list_modules()

"Verrouille la section 2 du module javascript"
→ list_modules() pour trouver l'_id de javascript
→ toggle_section(moduleId, order=2, key="isAvailable", value=false)

"Ajoute une section 'Les tableaux' au module javascript"
→ create_section(moduleId, title="Les tableaux", ...)
```

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| `MCP_SECRET_KEY` absent | 401 avec message explicite |
| `moduleId` invalide (non ObjectId) | 400 avec message Zod |
| Module non trouvé | 404 avec message explicite |
| `toggle_section` avec `key` invalide | 400 — Zod rejette la valeur |
| Serveur Next.js non démarré (local) | Connexion refusée — message clair dans Claude |
