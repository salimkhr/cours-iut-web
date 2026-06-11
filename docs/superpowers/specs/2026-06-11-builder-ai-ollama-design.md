# Builder — IA locale via Ollama (chat assistant + review pédagogique)

**Date :** 2026-06-11
**Statut :** validé
**Complète :** `2026-06-05-cours-builder-design.md`, `2026-06-11-builder-nested-blocks-design.md`

## Contexte

L'`AiAssistantPanel` du builder est désactivé (« route AI à corriger »). La route
`/api/admin/content/ai-assist` appelle l'API Anthropic avec un unique tool `update_blocks`
qui remplace l'arbre entier : pour « ajoute un bloc de texte », le modèle doit recracher
tout l'arbre sans erreur — source de non-fiabilité (réponse texte sans tool call, blocs
existants mutilés).

Un serveur Ollama tourne en local sur le port 11434 avec le modèle `gemma4:e4b`
(8B, capacités : completion, vision, audio, **tools**, thinking).

## Exigence centrale

> Si l'admin demande « ajoute un bloc de texte avec un lorem ipsum », le bloc doit être
> **réellement ajouté et persisté** — jamais une simple réponse textuelle.

## Décisions

| Sujet | Décision |
|---|---|
| Provider du chat builder | **Ollama local** (`gemma4:e4b`) — `ANTHROPIC_API_KEY` retirée de l'app |
| Génération de contenu lourd (TP/examen complets) | **Claude via MCP** (`/api/mcp`) — rien à construire in-app |
| Review pédagogique | **Les deux** : lint rapide Ollama in-app + `pedagogy-review` via Claude Code/MCP |
| Application des changements | **Directement en DB** (sens fort de « réellement fait ») + resync du canvas |
| Tools exposés au modèle | **Granulaires** : `add_blocks`, `update_block`, `remove_block`, `move_block` |
| Orchestration | **Tool-loop côté serveur**, max 5 itérations, validation à chaque étape |

## 1. Architecture

```
src/lib/ai/
  ollama.ts     — client Ollama : chatWithTools(), chatStructured()
  treeOps.ts    — opérations pures sur l'arbre : add/update/remove/move + rollback

src/app/api/admin/content/
  ai-assist/route.ts   — réécrite : tool-loop Ollama
  review/route.ts      — nouvelle : lint pédagogique structuré
```

- `OLLAMA_URL` (défaut `http://localhost:11434`) et `OLLAMA_MODEL` (défaut `gemma4:e4b`)
  lues via `process.env`, documentées dans `CLAUDE.md` §7.
- `chatStructured()` utilise le paramètre `format` d'Ollama (JSON schema natif) — pas de
  parsing best-effort.
- Le MCP server reste le canal de Claude Code. **Pré-requis découvert pendant le design :**
  `src/app/api/mcp/route.ts` utilise encore l'ancien format plat
  (`RawBlock { colSpan?: "full" | "half" }`, ligne 12) alors que le schéma est arborescent
  depuis le 2026-06-11. À aligner sur le schéma récursif (`children` + `validateBlockTree`),
  sinon Claude écrit du contenu cassé via MCP.

## 2. Chat assistant (ai-assist v2)

### Tools granulaires

| Tool | Entrée | Note fiabilité |
|---|---|---|
| `add_blocks` | `{ blocks[], parentId?, position? }` | les `id` sont générés **côté serveur** (uuid) — le modèle n'en fournit jamais |
| `update_block` | `{ id, props }` | patch partiel des props, ne touche que le bloc visé |
| `remove_block` | `{ id }` | |
| `move_block` | `{ id, parentId?, position }` | |

`parentId` absent = racine ; `position` = index d'insertion, absent = fin.

### Boucle serveur

1. L'arbre de travail part de `currentBlocks` envoyé par le canvas (les modifications non
   sauvegardées sont donc incluses — **une action IA vaut point de sauvegarde**).
2. Appel Ollama `/api/chat` avec `temperature: 0`, system prompt impératif (« si la demande
   implique une modification, tu DOIS appeler un tool »), la doc des règles d'imbrication
   (`containerRules`) et l'arbre courant.
3. Chaque tool call est appliqué via `treeOps` puis validé par `validateBlockTree` :
   - **valide** → arbre mis à jour, résultat « ok » renvoyé au modèle ;
   - **invalide** → rollback de l'opération, l'erreur de validation est renvoyée au modèle
     comme résultat de tool — il se corrige et retente.
4. La boucle s'arrête quand le modèle répond sans tool call, ou après 5 itérations.
5. Si la **première** réponse ne contient aucun tool call, une relance automatique unique
   est envoyée (gratuit en local).
6. Si l'arbre a changé en fin de boucle : écriture DB (upsert `course_content` +
   `modules.sections.contents.source/contentId` + `revalidateTag`), comme la route actuelle.

### Réponse et panel

Réponse : `{ text, blocks, changesCount }`.

- Le panel fait `setBlocks(blocks)` et considère l'état propre (DB = canvas).
- Bilan toujours affiché explicitement : « ✓ 2 blocs ajoutés » ou
  « ⚠ aucune modification effectuée » — jamais d'ambiguïté sur ce qui a été fait.
- FAB réactivé ; historique de conversation conservé pendant la session côté panel et
  renvoyé à chaque POST (contexte multi-tours).

## 3. Review pédagogique in-app

- Bouton « Review » dans la toolbar du builder → `POST /api/admin/content/review`
  avec `{ blocks, contentType }`.
- Ollama en sortie structurée (`format` JSON schema, pas de tools) :
  `{ issues: [{ blockId, rule, severity, message, suggestion }] }`.
- Règles injectées dans le prompt selon `contentType` :
  - **TP** : impératif vouvoyé dans les `list ordered` ; chaque exercice indique fichier
    cible, méthode imposée, résultat attendu, critère de validation ;
  - **tous** : préfixes `A-`/`B-`/`C-` sur les headings level 2, `1.`/`2.`/`3.` sur les
    level 3 ; une `section` par grand thème.
- UI : panneau latéral listant les issues avec badge de sévérité ; clic sur une issue →
  scroll + sélection du bloc concerné dans le canvas.
- **Pas d'auto-fix en v1** : la suggestion s'affiche, l'admin corrige à la main ou la colle
  dans le chat. La critique de fond reste côté Claude Code (`pedagogy-review` + MCP).

## 4. Erreurs

| Cas | Comportement |
|---|---|
| Ollama injoignable / modèle absent | 503, message explicite dans le panel (« Ollama injoignable sur :11434 ») |
| Max 5 itérations atteint, arbre modifié et valide | persisté quand même + avertissement dans la réponse |
| Tool call sur un `id` inexistant | erreur renvoyée au modèle comme résultat de tool |
| Validation finale en échec (défense en profondeur) | 422, rien persisté |

## 5. Tests

`src/lib/ai/treeOps.ts` est un module pur (zéro DB, zéro fetch) : c'est l'endroit retenu
pour introduire les **premiers tests Vitest du repo** — add/update/remove/move, positions
limites, rollback sur arbre invalide.

## Hors scope

- Micro-assists inline dans les éditeurs de props (reformuler, alt-text vision) — écartés.
- Auto-fix des issues de review.
- Streaming SSE des étapes de la boucle (réévaluer si le tool-loop s'avère lent).
- Sélecteur de provider / retour d'Anthropic dans l'app.
- Adaptation du skill `pedagogy-review` au contenu DB (passera par les tools MCP existants).
