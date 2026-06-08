# Scripts de maintenance

## migrate-contents-refs.ts

Convertit les `Section.contents` de `string[]` en `ContentRef[]` dans MongoDB.

**À exécuter une seule fois** avant de déployer le builder (Plan 1).
Le script est idempotent : relancer sur une DB déjà migrée ne change rien.

### Prérequis

- L'application doit avoir un fichier `.env` à la racine avec `MONGODB_URI`.

### Commande

**Depuis la racine du projet** (bun charge `.env.local` depuis le répertoire courant) :

```bash
# Windows (PowerShell) — charge le .env et lance le script
$envContent = Get-Content .env | Where-Object { $_ -match '^[A-Z]' -and $_ -match '=' }
foreach ($line in $envContent) {
    $parts = $line -split '=', 2
    [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
}
bunx tsx src/scripts/migrate-contents-refs.ts
```

```bash
# Linux / macOS — une seule ligne
export $(grep -v '^#' .env | xargs) && bunx tsx src/scripts/migrate-contents-refs.ts
```

### Résultat attendu

```
Migration terminée — N modules mis à jour.
```

### Ce que ça fait

Pour chaque module dans la collection `modules`, chaque section passe de :

```json
{ "contents": ["cours", "TP"] }
```

à :

```json
{
  "contents": [
    { "type": "cours", "source": "file" },
    { "type": "TP",    "source": "file" }
  ]
}
```

`source: "file"` signifie que le contenu est toujours dans un fichier `.tsx`.
Quand un contenu sera migré vers MongoDB via le builder, la ref devient
`{ "type": "cours", "source": "db", "contentId": "<ObjectId>" }`.

---

## create-content-index.ts

Crée l'index unique MongoDB sur la collection `course_content`.

**À exécuter une seule fois** après le déploiement initial (ou sur une nouvelle DB).
Idempotent — relancer ne casse rien si l'index existe déjà.

### Prérequis

- `MONGODB_URI` dans `.env.local`

### Commande

**Depuis la racine du projet** :

```bash
bunx tsx src/scripts/create-content-index.ts
```

### Ce que ça fait

```javascript
db.course_content.createIndex(
  { moduleSlug: 1, sectionSlug: 1, contentType: 1 },
  { unique: true, name: "unique_content_ref" }
)
```

---

## seed-oauth-client.ts  *(fichier : `scripts/seed-oauth-client.ts`)*

Enregistre le client OAuth de Claude.ai dans la collection `oauthClient` de MongoDB.
Nécessaire pour le **mode MCP HTTP** (connexion Claude.ai web via OAuth 2.0).

**À exécuter une seule fois** par environnement (dev, prod).
Idempotent — si le client existe déjà, le script s'arrête sans rien modifier.

### Prérequis

Trois variables dans `.env.local` :

```bash
MONGODB_URI=<uri>
MCP_CLIENT_ID=<uuid — générer une fois et conserver>
MCP_CLIENT_SECRET=<uuid — générer une fois et conserver>
```

### Commande

**Depuis la racine du projet** (bun charge `.env.local` depuis le répertoire courant) :

```bash
bun run seed-oauth-client
```

### Ce que ça insère

```json
{
  "clientId":                 "<MCP_CLIENT_ID>",
  "clientSecret":             "<SHA-256 base64url de MCP_CLIENT_SECRET>",
  "name":                     "Claude.ai",
  "redirectUris":             ["https://claude.ai/oauth/callback"],
  "skipConsent":              true,
  "grantTypes":               ["authorization_code", "refresh_token"],
  "requirePKCE":              true,
  "scopes":                   ["openid", "profile", "email", "offline_access"]
}
```

Le secret est haché avec SHA-256 base64url (même algorithme que `@better-auth/oauth-provider`)
avant d'être stocké — la valeur brute de `MCP_CLIENT_SECRET` n'est jamais persistée en DB.

### Ordre d'exécution recommandé (premier déploiement)

1. `migrate-contents-refs.ts` — migrer les refs de sections
2. `create-content-index.ts` — créer l'index `course_content`
3. `seed-oauth-client.ts` — enregistrer le client Claude.ai
