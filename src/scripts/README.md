# Scripts de maintenance

## migrate-contents-refs.ts

Convertit les `Section.contents` de `string[]` en `ContentRef[]` dans MongoDB.

**À exécuter une seule fois** avant de déployer le builder (Plan 1).
Le script est idempotent : relancer sur une DB déjà migrée ne change rien.

### Prérequis

- L'application doit avoir un fichier `.env` à la racine avec `MONGODB_URI`.

### Commande

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
