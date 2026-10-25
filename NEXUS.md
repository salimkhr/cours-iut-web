# NEXUS.md — analyse d'impact avec GitNexus

Le dépôt est indexé par GitNexus sous le nom **cours-iut-web** : graphe des symboles, appels,
imports et flux d'exécution. Ce fichier est maintenu à la main. Pour réindexer, utilisez
toujours `--index-only`, sinon GitNexus réinjecte son propre bloc dans `AGENTS.md` et
`CLAUDE.md` :

```bash
node .gitnexus/run.cjs analyze --index-only
```

Sans `.gitnexus/run.cjs` : `bunx gitnexus@latest analyze --index-only`.
L'index date du dernier `analyze` : vérifiez sa fraîcheur (`gitnexus://repo/cours-iut-web/context`)
avant de vous fier à un résultat sur du code récent.

## Quand l'utiliser

- **Avant de modifier une fonction, une classe ou une méthode** : lancez `impact` en amont et
  signalez les appelants, les flux touchés et le niveau de risque.
- **Avant de committer** : lancez `detect_changes` pour vérifier que les changements touchent
  bien ce qui était prévu.
- **Pour comprendre du code** : passez par le graphe avant la recherche texte. Le grep reste
  utile pour les littéraux, ou quand le graphe ne répond pas.
- **Pour renommer un symbole** : utilisez `rename`, qui suit le graphe d'appels, plutôt qu'un
  chercher-remplacer.

## Lire les résultats

- Un risque **HIGH** ou **CRITICAL** se signale à l'utilisateur avant d'éditer.
  `riskSharedAxes` ne suffit pas à l'écarter.
- **`risk: UNKNOWN` n'est pas un feu vert.** Un ensemble d'appelants vide peut vouloir dire que
  l'index ne sait pas les résoudre (accès par propriété d'objet, dispatch dynamique). Confirmez
  par une recherche texte avant de juger un symbole inutilisé ou sans risque.
- Un `detect_changes` qui répond `partial: true` ou `truncated: true` n'est pas propre :
  zéro veut dire « non vu », pas « non affecté ». Relancez-le.

## Commandes

| Besoin | MCP | CLI |
| --- | --- | --- |
| Rayon d'impact d'un symbole | `impact({target, direction: "upstream"})` | `node .gitnexus/run.cjs impact "<symbole>" --direction upstream --repo .` |
| Changements en cours | `detect_changes({scope: "all"})` | `node .gitnexus/run.cjs detect-changes --scope all --repo .` |
| Régression par rapport à `main` | `detect_changes({scope: "compare", base_ref: "main"})` | `node .gitnexus/run.cjs detect-changes --scope compare --base-ref main --repo .` |
| Concept ou flux | `query({search_query})` | — |
| Symbole nommé | `context({name})` | — |
| Flux source → sink (sécurité) | `explain({target})`, nécessite `analyze --pdg` | — |

## Ressources MCP

| Ressource | Contenu |
| --- | --- |
| `gitnexus://repo/cours-iut-web/context` | Vue d'ensemble, fraîcheur de l'index |
| `gitnexus://repo/cours-iut-web/clusters` | Zones fonctionnelles |
| `gitnexus://repo/cours-iut-web/processes` | Flux d'exécution |
| `gitnexus://repo/cours-iut-web/process/{name}` | Trace pas à pas d'un flux |

Guides détaillés par tâche : `.claude/skills/gitnexus/gitnexus-*/SKILL.md` (exploring,
impact-analysis, debugging, refactoring, guide, cli).
