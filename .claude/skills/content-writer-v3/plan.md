# Plan d'une section (modes `conception` et `conception-rapide`, spec § 2 étape 3)

Le plan est écrit par vous (session principale), à partir de la fiche de conception
validée et de la fiche du collecteur. Il doit être assez détaillé pour que les
rédacteurs n'aient plus aucune décision à prendre : chaque exemple avec ses données,
chaque message d'erreur exécuté, chaque contrat de consigne rempli, chaque durée.
Rien n'est rédigé en base pendant cette phase.

## 1. Repères

Chaque élément du plan porte un repère stable, utilisé par les relecteurs à la place
d'un `id` de bloc (qui n'existe pas encore) :

| Repère | Élément |
|---|---|
| `N1`, `N2`… | notion du cours, dans l'ordre de la progression |
| `S1`, `S2`… | slide |
| `E1`, `E2`… | exercice du tronc commun |
| `B1`, `B2`… | bonus |

Un repère ne change pas une fois relu : un élément supprimé garde son numéro, barré,
avec la raison ; un élément ajouté prend le numéro suivant.

## 2. Contenu du plan

Écrivez-le dans la rubrique « Plan » du fichier de section, sous le statut et la fiche
de conception (`suivi.md`). Format :

```markdown
## Plan (version <n>, <date>)

### Cours — budget cours + slides : <n> min
#### N1 — <notion> (brief : « <notion verbatim> ») — <n> min
- **Exemple minimal** : <ce qu'il montre>. Code exact :
  ```php
  <code complet, données comprises>
  ```
  Sortie : `<sortie exacte>`
- **Variante réaliste** : <ce qui change et pourquoi>. Code exact (ou diff sur l'exemple) ; sortie.
- **Erreur fréquente** (`callout warning`) : <l'erreur, en une phrase>. Code fautif ; message réel :
  ```
  <message verbatim>
  ```
  Vérifié le <date> : `<outil et version>` dans `cours-iut-bac:1` (§ 3).
- **Blocs prévus** : <types du registre, dans l'ordre>

### Slides — <n> slides, <n> min
| Repère | Titre | Idée unique | Bloc principal | Notion source | Durée |
|---|---|---|---|---|---|
| S1 | … | … | `slide-code` | N1 | 2 min |

### TP — budget <calcul> ; plage <a>–<b> min
#### E1 — <titre> — guidé | fil rouge (`projectRef: true`) — <n> min
1. **Fichier(s) cible(s)** : <chemin exact>
2. **Noms exacts** : <fichiers, fonctions, classes, variables, routes, `name` des champs>
3. **Données d'entrée** : <valeurs, fichier fourni (download-file), saisie> | sans objet (<raison>)
4. **Méthode ou API imposée** : <ce qui empêche de contourner la notion visée>
5. **Résultat observable** : <sortie verbatim ou rendu précis>
6. **Critère de validation** : <comment l'étudiant sait qu'il a fini, sous une forme compatible avec les verdicts>
- **Notions pratiquées** : <N2, N3 ; ou notions déjà enseignées, avec leur section>
- **Source du résultat** : <dépôt de référence : chemin | TP précédent : section | non vérifiable : raison>

#### B1 — <titre> — bonus — <n> min
<mêmes 6 champs>

**Total tronc commun** : <n1 + n2 + …> = <n> min, soit <p> % du budget (plage 80–100 %).
**Bonus** (hors budget) : <n> min.

## Matériau quiz
Rempli à la clôture (étape ultérieure du pipeline).
```

Règles :

- **Durées obligatoires** pour chaque notion, slide, exercice et bonus, avec les
  totaux. Elles restent dans le plan : le rédacteur ne les reporte jamais dans le rendu
  étudiant (verdict TP sur les durées).
- **Pas d'indice ni de solution** dans le plan d'un TP : ni ligne de code de solution
  dans une consigne, ni corrigé ou indice en `collapsible`. La consigne impose la
  méthode (champ 4). Cette règle prime sur la phrase « un indice replié qui donne le
  principe et le piège » du verdict `6ac67a63137711fbe6236783` (décision de
  l'utilisateur du 2026-10-27) : dites-le aux relecteurs dans leur prompt.
- Exemples du cours dans l'`exampleDomain`, noms et données de l'`universe`, jamais
  les objets du fil rouge (`projectSpec`, état du fil rouge).
- Notions : uniquement celles du brief et de la fiche de conception, plus celles
  « réellement enseignées » dans les sections précédentes. Un exercice qui exige autre
  chose : ajoutez la notion au cours (avec l'accord de l'utilisateur) ou changez
  l'exercice.
- Slides : 1 à 2 min par slide, une idée par slide, aucune notion absente du plan du
  cours, une `slide-note` prévue sur chacune (oral, erreur fréquente, question à la
  salle).
- TP : partie guidée d'abord, puis fil rouge, selon la répartition Q5 ; contrats des
  résultats observables rattachés au dépôt de référence, ou aux TP précédents à défaut.

## 3. Messages d'erreur réels (bac à sable)

Chaque « erreur fréquente » du plan porte un message exécuté, jamais un message de
mémoire. Une fois les erreurs du cours écrites :

1. Vérifiez les prérequis Docker (`bac-a-sable.md` § 0, sans le test de fumée des
   étudiants : aucun étudiant n'est lancé).
2. Run-id `plan-<module>-<section tronquée>-<AAAAMMJJ-HHMMSS>`, dossier et conteneur
   comme `bac-a-sable.md` § 1 et § 2 (sous-dossier unique `erreurs\`).
3. Écrivez chaque extrait fautif dans `erreurs\` et exécutez-le dans le conteneur
   (`docker exec "cours-iut-bac-$run" sh -c 'cd /work/erreurs && php n1.php'`, ou
   `cargo`, `node`, `rendu-html` selon le module). Pour un message de navigateur,
   `rendu-html` donne la console.
4. Collez la sortie exacte dans le plan, avec l'outil et sa version (`php -v | head -1`).
   Un message qui diffère de ce que vous attendiez : c'est la sortie qui fait foi ;
   adaptez l'explication.
5. Faites de même pour la sortie des exemples minimaux et des variantes, et pour les
   résultats observables du TP quand ils ne dépendent pas d'un fil rouge absent.
6. Nettoyage (`bac-a-sable.md` § 6), preuve collée dans votre définition de terminé.

Docker absent : marquez chaque message « non vérifié (Docker absent) » et dites-le à
l'utilisateur ; le relecteur cohérence le signalera.

## 4. Relecture du plan

Mettez « Étape en cours » à « plan : relecture, cycle 1 ». Lancez en parallèle, dans
un même message :

- `relecteur-coherence`, mode **plan** ;
- `relecteur-contrat`, mode **plan**.

Chaque prompt contient, et seulement cela : le mode (« plan »), module, section, le
**chemin absolu du fichier de section** (ils le lisent avec `Read` ; la garde
`garde-relecteur.mjs` limite `Read` aux fichiers `docs/plans/<module>/*.md`), la
version du plan, la liste des repères à couvrir, les verdicts actifs des formats
concernés (cours, slide, TP, `module-design`, global) recopiés verbatim de la fiche,
la règle « pas d'indice » ci-dessus. En plus, pour la cohérence : la fiche du
collecteur, dont « Notions réellement enseignées » verbatim ; pour le contrat : les
budgets avec leur calcul.

La garde ne tourne qu'en session interactive dans un dossier approuvé (comme celle du
préparateur) : jamais de relecteur en mode plan depuis `claude -p`.

Contrôlez les rapports comme en relecture (`SKILL.md` § 7) : chaque repère couvert,
définition de terminé complète, preuves recomptées. Puis arbitrez (`SKILL.md` § 8,
règles 0, 1, 3, 7, 7 bis, 8, 9) et corrigez vous-même le plan pour les remarques
retenues : version du plan + 1, une ligne par changement dans « Relectures du plan ».

**Limite : deux cycles.** Au second cycle, les relecteurs ne relisent que les repères
modifiés (dites-le dans leur prompt, avec la liste). S'il reste des BLOQUANTS ou des
MAJEURS après le second cycle, arrêtez-vous et présentez chaque désaccord : repère,
remarque du relecteur, votre réponse, votre recommandation. L'utilisateur tranche.
Une remarque déjà écartée qui revient lui est remontée, jamais rejouée.

## 5. Validation par l'utilisateur

Présentez le plan relu : un résumé (notions, slides, exercices et bonus avec durées,
totaux et pourcentage), les remarques retenues et ce qui a changé, les désaccords, puis
le chemin du fichier. Demandez la validation (une question).

Corrections demandées : appliquez-les, version + 1. Une correction qui touche un contrat
de TP, une durée ou une notion relance une relecture de ces seuls repères, dans la
limite des deux cycles.

Une fois validé :

1. statut : « Validé : plan v<n> le <date> », phase `cours`, étape en cours « en
   attente de rédaction », prochaine action « rédaction du cours (étape ultérieure du
   pipeline) » ;
2. `docs/plans/<module>/etat.md` mis à jour ;
3. commit (`SKILL.md`, « Commits ») ;
4. arrêtez-vous. Aucune rédaction, aucune écriture sur staging ni en prod.
