# Bascule du content-writer v2 vers la v3

Proposée le 2026-11-01, appliquée sur `staging` le 2026-11-02, à l'accord de l'utilisateur. Elle prend effet au prochain déploiement en prod.

## Ce qui change

La rédaction se fait uniquement dans Claude Code, avec `/content-writer-v3`. Le document `content-writer` reste servi par le MCP, mais il ne contient plus qu'un renvoi. L'id `content-writer` et le prompt `content_writer` sont gardés, pour ne casser ni le manifeste ni les clients déjà connectés.

Le skill garde son nom `content-writer-v3` : agents, gardes, tests et `retouche` y renvoient, et le renommer n'apporterait rien.

**Ce qu'on perd** : on ne peut plus rédiger un support depuis l'app Claude, donc depuis le téléphone. Seule la retouche y reste possible. Le texte de la v2 reste dans l'historique git.

## Nouveau `skills/content-writer/main.md`

```markdown
# Skill content-writer — Renvoi vers le pipeline Claude Code

La rédaction ne se fait plus depuis ce serveur. Cours, slides, TP et examens passent par
le pipeline `/content-writer-v3`, dans Claude Code, depuis le dépôt du site : il a besoin
d'agents, d'un bac à sable Docker et de brouillons locaux, qu'une conversation de l'app
Claude n'a pas.

## Que faire

Ne rédigez aucun support et n'écrivez rien sur le serveur. Répondez en une phrase, avec la
commande qui correspond à la demande, puis arrêtez-vous :

| Demande | Réponse |
|---|---|
| Préparer une section pas encore rédigée | `/content-writer-v3 conception <module> <section>` |
| Préparer une section simple, sans cadrage | `/content-writer-v3 conception-rapide <module> <section>` |
| Rédiger une section dont le plan est validé | `/content-writer-v3 redaction <module> <section>` |
| Relire des supports déjà en ligne | `/content-writer-v3 relecture <module> <section>` |
| Écrire l'examen de fin de module | `/content-writer-v3 examen <module>` |

## Autres demandes

- Une petite correction sur un support en ligne : chargez le document `retouche`
  (`get_pedagogical_skill_document` avec `id="retouche"`).
- La conception d'un module entier : chargez le document `module-design`.
```

## Autres fichiers à modifier

| Fichier | Changement |
|---|---|
| `src/lib/skills/pedagogy.ts` | régénéré par `bun run generate-skill` |
| `src/app/api/mcp/route.ts`, `SERVER_INSTRUCTIONS` | `content-writer` décrit comme un renvoi vers Claude Code ; retrait de l'écriture sur staging, désormais fausse pour lui |
| `src/app/api/mcp/route.ts`, prompt `content_writer` | titre et description alignés ; le texte demande de charger le document et d'en appliquer le renvoi |
| `src/lib/mcp/readTools.ts` | descriptions de `get_pedagogical_skill_manifest` et `get_pedagogical_skill_document` |
| `tests/mcp/skill-exposure.test.ts` | les trois tests qui vérifient le contenu de la v2 deviennent un test du renvoi : `/content-writer-v3`, chacun des cinq modes, `retouche` |
| `CLAUDE.md` | la consigne de charger le skill du serveur ne vaut plus que pour `module-design` ; le contenu passe par `/content-writer-v3`, dont le collecteur lit les verdicts et exemplaires |
| `docs/pipeline/spec.md` § 1, ligne sur la v2 | remplacée par la date de bascule |
| `src/app/admin/(dashboard)/calibrage/page.tsx` | « imités par le skill content-writer » devient « par les rédacteurs du pipeline » |

## Déroulé

1. Modifications ci-dessus sur `staging`, puis `bun test tests/mcp`, `bun run lint`, `bunx tsc --noEmit`.
2. Commit, sans push.
3. La bascule n'a d'effet qu'une fois en prod : la v2 reste servie jusque-là. Elle part dans le même déploiement que `ref` de `get_project_reference` et la description d'`edit_block`.

## Points de vigilance

- **Mode `examen`** : implémenté, jamais testé sur un vrai module. La v2 est la seule version éprouvée pour l'examen.
- **`conception` et `redaction`** : testés sur une seule section, PHP 7.
- **Propagation** : `retouche` journalise toujours, mais l'étape 4 qui exploite ce journal n'existe pas encore. Ce n'est pas bloquant, le journal attend.
- **Hors périmètre** : `module-design` décrit encore une écriture sur staging, alors que les cours vivent en prod. À traiter à part.

## Recommandation

Appliquer maintenant sur `staging` et laisser partir au prochain déploiement. Le risque du mode `examen` est faible : il ne concerne que la fin d'un module, et la v2 se récupère dans git si besoin.
