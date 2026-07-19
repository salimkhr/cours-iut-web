# Correction de TP poussée sur GitLab — design

Date : 2026-07-19
Statut : validé en brainstorming

## Problème

Le site expose déjà un bouton « Correction » par section (`Section.hasCorrection`,
`Section.correctionIsAvailable`, lien `${NEXT_PUBLIC_GIT_URL}/{modulePath}/{sectionPath}`
dans `SectionCard.tsx`), mais rien ne produit ni ne publie ces corrections.
Quand un TP est rédigé via le skill content-writer, sa correction doit être générée
et poussée sur la forge GitLab self-hosted (`git.salimkhraimeche.dev`).

## Décisions actées

- **Forge** : GitLab, groupes imbriqués. Un projet par section : `correction/{module}/{section}`.
- **Accès** : Personal Access Token GitLab (scope `api`) en variable d'environnement serveur.
- **Contenu du repo** : état final, un dossier par exercice + dossier `fil-rouge/`,
  `README.md` à la racine, un seul commit par push.
- **Visibilité** : projets publics. Le gating étudiant se fait côté site via
  `correctionIsAvailable`, jamais côté GitLab.
- **Intégration** : étape du workflow du skill content-writer, après la relecture
  navigateur du TP. Mécanique portée par un outil MCP (utilisable depuis claude.ai
  comme depuis Claude Code).

## Architecture

### Outil MCP `push_correction`

Enregistré dans `src/app/api/mcp/route.ts`, staging uniquement (comme tous les
outils d'écriture). Wrapper API dans `src/lib/gitlab.ts`.

**Paramètres** (zod) :

| Param | Type | Rôle |
|---|---|---|
| `module` | `string` | Slug du module |
| `section` | `string` | Slug de la section |
| `files` | `Array<{ path: string, content: string }>` | Chemins relatifs à la racine du repo, contenu texte UTF-8 |
| `commitMessage` | `string?` | Défaut : `correction: {module}/{section}` |

**Comportement** :

1. Vérifie en Mongo que la section existe dans le module et référence un contenu
   `tp` ou `examen`. Sinon : erreur explicite, aucun appel GitLab. (L'exclusion
   des examens par défaut est une règle du skill, pas de l'outil.)
2. Dérive la base GitLab et le groupe racine depuis `NEXT_PUBLIC_GIT_URL`
   (`https://git.salimkhraimeche.dev/correction` → base = origin, groupe racine =
   pathname). Pas de nouvelle variable d'URL.
3. API GitLab :
   - s'assure que le sous-groupe `correction/{module}` existe (création sinon) ;
   - s'assure que le projet `correction/{module}/{section}` existe (création sinon,
     `visibility: "public"`, branche par défaut `main`) ;
   - `GET /projects/:id/repository/tree?recursive=true` pour lister l'existant,
     puis `POST /projects/:id/repository/commits` avec des `actions`
     create / update / delete : le repo reflète exactement le payload après commit
     (un re-push écrase l'état, pas de fichiers orphelins).
4. Passe `hasCorrection: true` sur la section (document module, tableau `sections`).
   `correctionIsAvailable` n'est jamais modifié par l'outil.
5. Retour : URL web du projet, SHA du commit, nombre de fichiers.

**Configuration** : `GITLAB_CORRECTION_TOKEN` (PAT scope `api`, serveur uniquement,
jamais `NEXT_PUBLIC_`). Token absent → l'outil échoue avec un message explicite.
Erreur API GitLab → remontée telle quelle à l'agent, pas de retry silencieux.

**Limites v1** : fichiers texte uniquement. Un asset binaire nécessaire → l'agent
le signale au lieu de bricoler (cohérent avec la grammaire des blocs).

### `src/lib/gitlab.ts`

Trois fonctions, chacune testable avec `fetch` mocké :

- `ensureGroup(parentPath, name)` — idempotent, renvoie l'id du groupe ;
- `ensureProject(groupPath, name)` — idempotent, crée en public, renvoie id + web_url ;
- `commitFiles(projectId, files, message)` — calcule les actions create/update/delete
  par diff avec l'arbre existant, crée le commit, renvoie le SHA.

## Étape de workflow (skill content-writer)

Nouvelle étape insérée entre « Relecture navigateur » et « Clôture », intitulée
« Correction (TP uniquement) » dans `skills/content-writer/main.md` (recompilé via
`bun run generate-skill`) :

- Déclenchée après le OK de relecture d'un TP.
- L'agent rédige la correction : un dossier par exercice (slug du titre de
  l'exercice), dossier `fil-rouge/` avec l'état final du projet, `README.md` sobre
  (titre de la section, rappel du sujet, lien vers le TP). Les noms de fichiers
  respectent exactement le contrat de consigne du TP.
- Push via `push_correction`, puis rappel en chat : `correctionIsAvailable` reste
  à activer dans l'admin.
- **Examen exclu par défaut** (repo public = fuite avant l'épreuve). Génération
  sur demande explicite de l'utilisateur uniquement.

## Synchronisation prod

Les sections sont embarquées dans les documents module ; `hasCorrection` arrive en
prod via le push-to-prod existant. `NEXT_PUBLIC_GIT_URL` est identique en prod.
Aucun travail supplémentaire.

## Tests

- `src/lib/gitlab.ts` : `fetch` mocké — création idempotente de groupe/projet,
  diff create/update/delete correct, propagation des erreurs API.
- `tests/mcp/` : l'outil est exposé avec le bon schéma ; section inexistante ou
  sans contenu `tp`/`examen` → erreur ; après succès, `hasCorrection` vaut `true`
  et `correctionIsAvailable` est inchangé (GitLab mocké).

## Hors périmètre

- Fichiers binaires dans les corrections.
- Activation automatique de `correctionIsAvailable`.
- Correction des examens en workflow standard.
- Historique pédagogique (un commit par exercice) — écarté au cadrage.
