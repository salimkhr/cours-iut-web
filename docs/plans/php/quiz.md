# Quiz du module `php`

## Cadrage (test de l'étape 5, 2026-11-02)
| # | Question | Défaut proposé | Réponse de l'utilisateur | Date |
|---|---|---|---|---|
| Q1 | Sections couvertes | la liste demandée | 1 à 4, version prod | 2026-11-02 |
| Q2 | Nombre et répartition | 21 : S1 3, S2 4, S3 3, S4 6, transversal 5 | défaut accepté | 2026-11-02 |
| Q3 | Part transversale | 24 % (5 sur 21) | acceptée avec Q2 | 2026-11-02 |
| Q4 | Usage | évaluation notée | défaut accepté | 2026-11-02 |
| Q5 | Points négatifs | les garder (`true` en prod) | retirés : `edit_quiz_config` à faire à l'écriture, avec confirmation | 2026-11-02 |
| Q6 | Durée totale | 25 min | défaut accepté | 2026-11-02 |
| Q7 | Notions à cibler ou à exclure | aucune ; gestes vus seulement en TP gardés | aucune | 2026-11-02 |
| Q8 | Domaine du quiz | cinéma, randonnée ou jeux de société ; cinéma recommandé | cinéma | 2026-11-02 |

## Passage du 2026-11-02 : sections 1, 2, 3, 4
- **Étape en cours** : terminé, 20 questions écrites en prod le 2026-11-03 (« Oui, écris-les »)
- **Contexte** : quiz prod `92466c6f-0119-457e-b6db-0214fe00649d`, 0 question, `negativeMarking: true` ; aucune de ces sections n'a de « Matériau quiz » ni de `curriculum` en base.
- **Génération** : 44 candidates (S1 9, S2 8, S3 8, S4 11, transversal 8), présélection 32, sélection 21, 1 400 s (23 min 20).
- **Répartition Bloom** : comprendre 4, appliquer 5, analyser 7, evaluer 5
- **Tests** : fragile et rapide relancés une fois (ils n'avaient pas lu les supports) ; aucun BLOQUANT ; PHP 8.3 exécuté sur 12 comportements, tous conformes.

| Candidate | Sections | Geste | Bloom | Clé | F | R | Lecture | Bloc cité (fragile) | Bloc cité (rapide) | Pourquoi retenue |
|---|---|---|---|---|---|---|---|---|---|---|
| 1-q2 | 1 | Interpolation | appliquer | A | A | A | facile | B/cours:cc69ba21-35ae-4ef7-ba5f-c8e7c8591377 | même bloc | ouverture accessible, geste E3 |
| 1-q3 | 1 | `match` et type de la valeur (réécrite à la demande de l'utilisateur, non testée) | appliquer | à retester | — | — | à retester | B/cours:ctrl-match-txt | — | comparaison stricte du `match`, enseignée au cours |
| 2-q2 | 2 | `isset` et `??` (réécrite à la demande de l'utilisateur, non testée) | appliquer | à retester | — | — | à retester | O/cours:52073bb7-f82d-47a3-9891-a6d73e180b0f | — | clé présente à 0, clé absente |
| 2-q4 | 2 | `private` hors classe | comprendre | C | C | C | facile | O/cours:enc-private-res | même bloc | encapsulation, notion à garder |
| 4-q7 | 4 | Liste blanche serveur | comprendre | A | A | A | facile | F/cours:form-errors-choice-text | F/cours:form-errors-choices-def-text | la raison de sécurité, pas la syntaxe |
| 1-q7 | 1 | Argument manquant | comprendre | A | A | A | facile | B/cours:8592120e-ea85-4ed0-aad2-97a89fdde71e | B/cours:2e2dc2aa-ba67-4b5f-a705-b1cae9f14b53 | erreur provoquée au TP |
| 4-q2 | 4 | `REQUEST_METHOD` à l'ouverture par un lien (remplace le 2026-11-03 « Pourquoi préférer la version A ? », non testée) | appliquer | A | — | — | à retester | F/cours:form-simple-flow-text | — | `'GET'` à l'ouverture, résultat seul |
| 4-q3 | 4 | Toutes les cases cochées (remplace 4-q4, retirée par l'utilisateur) | comprendre | à retester | — | — | à retester | F/cours:form-complex-checkbox-text | — | `name="x[]"` donne un tableau |
| 2-q9 | 2 | `foreach` clé et valeur (remplace 2-q3, non testée) | comprendre | à retester | — | — | à retester | à confirmer au test | — | geste direct des tableaux associatifs |
| 3-q1 | 3 | Passage de paramètres page → vue (réécrite à la demande de l'utilisateur, non testée) | appliquer | à retester | — | — | à retester | S/cours:29d1f832-84c5-46a0-8092-547e028c6421 | — | geste central de `render()` |
| 2-q8 | 2 | `usort` et `<=>` (réécrite à la demande de l'utilisateur, non testée) | appliquer | à retester | — | — | à retester | O/cours:tri-usort-txt | — | garde le geste du tri |
| t-q1 | 3, 1 | Portée dans `render` | analyser | B | B | B | facile | S/cours:3e326d3e-d65d-479d-a7cb-10ceee15752d | même bloc | relie portée et vue |
| t-q9 | 1, 4 | `$_GET` et `===` (remplace t-q5, retirée par l'utilisateur, non testée) | analyser | à retester | — | — | à retester | F/cours:form-simple-conversion-warning-text | — | relie type et données d'URL |
| t-q11 | 3, 4 | `htmlspecialchars` dans la vue (remplace t-q4, non testée) | evaluer | à retester | — | — | à retester | F/tp:tp4-ex5-warn-txt | — | relie vue et XSS, sans piège |
| 4-q5 | 4 | `(int)` contre `filter_var` | analyser | B | B | B | facile | F/cours:form-simple-conversion-warning-text | même bloc | justifie l'API imposée |
| 3-q8 | 3 | `const` et portée | evaluer | C | C | C | facile | S/tp:tp3-entities-3 | B/cours:be5cd8ac-fa7e-4f30-b2f1-16ad967d6262 | justifie une constante |
| 4-q8 | 4 | `array_diff` | appliquer | C | C | C | facile | F/cours:form-errors-choice-text | même bloc | résultat exact, clé conservée |
| 4-q11 | 4 | GET ou POST selon le formulaire (réécrite à la demande de l'utilisateur, non testée) | evaluer | à retester | — | — | à retester | F/cours (à confirmer au test) | — | choix de la méthode, geste du TP |
| t-q6 | 1, 2 | `array_filter` et `fn` (réécrite à la demande de l'utilisateur, non testée) | appliquer | à retester | — | — | à retester | O/cours:tri-filter-callout-txt | — | usage direct du filtre |
| t-q10 | 2, 3 | Getter dans une vue (remplace t-q8, non testée) | comprendre | à retester | — | — | à retester | à confirmer au test | — | relie objet et vue |

### Écriture en prod (2026-11-03)
- `edit_quiz_config` : `negativeMarking` passé de `true` à `false`.
- 20 `add_quiz_question`, positions 0 à 19, relues dans la réponse du serveur : énoncés, propositions et bonnes réponses identiques à `selection.json`.
- Plus tard le 2026-11-03, à la demande de l'utilisateur : `edit_quiz_question` sur la position 6 (4-q2, même id). « Pourquoi préférer la version A ? » devient « On ouvre cette page en cliquant sur un lien du menu. Qu'affiche-t-elle ? » (3 propositions, 30 s), relue dans la réponse du serveur.

| Position | Candidate | Id en prod |
|---|---|---|
| 0 | 1-q2 | `f06c4a1e-01ca-45c8-884a-8f819a45c32e` |
| 1 | 1-q3 | `91b5916e-5ce7-4b43-9538-6fdb1019076c` |
| 2 | 2-q2 | `1af6ef84-e7c7-4679-8340-80c071bef650` |
| 3 | 2-q4 | `ae6e0029-196a-411c-bc99-9fe79e4d94dd` |
| 4 | 4-q7 | `60ce5604-48f9-4289-9fbf-7074aeecd5ea` |
| 5 | 1-q7 | `2da0e072-5411-424d-8ea0-2bcc638e5cc3` |
| 6 | 4-q2 | `faaddc58-7b37-496a-bf95-36bde478ccca` |
| 7 | 4-q3 | `5b3cbdfb-7fef-4cdf-9679-a1914fc9060d` |
| 8 | 2-q9 | `f54a0327-d93b-4758-913f-a293ffbc16fa` |
| 9 | 3-q1 | `7a7dc593-16af-481c-91d4-6e9723c667d4` |
| 10 | 2-q8 | `69ef3001-e651-4b4d-a754-2f49ac780bec` |
| 11 | t-q1 | `07252b29-7bcb-4c02-92b8-98abb917a59a` |
| 12 | t-q9 | `5c17443d-ffeb-499f-995e-ccf380411329` |
| 13 | t-q11 | `43b4514d-cf2d-49ee-98cc-ec1b761f2999` |
| 14 | 4-q5 | `6490587a-d083-4844-afbc-a14e4f6248af` |
| 15 | 3-q8 | `9380b026-ca17-4899-bd79-a09c60645881` |
| 16 | 4-q8 | `53ec0488-f415-4642-9278-539f42aefb6d` |
| 17 | 4-q11 | `f43f755e-319e-452e-9d17-fc85ce7eac3b` |
| 18 | t-q6 | `4929f147-2f06-454e-83e8-32365468f17f` |
| 19 | t-q10 | `4c1e5e63-1d94-43f1-b629-f1ecad49eb17` |

### Second test (2026-11-03), version finale : 20 questions, 1 065 s (17 min 45)
- **Bloom** : comprendre 7, appliquer 7, évaluer 4, analyser 2.
- **Lecture croisée** : fragile 20/20, rapide 20/20, aucun BLOQUANT, aucune question discriminante. Les deux étudiants ont lu les supports par extraits ; plusieurs blocs sont cités par numéro de ligne.
- **Points sans source explicite relevés par les étudiants** : 4-q8 (clé `1 =>` conservée), 3-q8 (portée de la constante), t-q1 (message exact de l'avertissement), t-q9 (texte pour un nombre).
- **Test sans énoncé** : t-q11 et 3-q8 trouvables par la forme ; 3-q8 corrigée (distracteurs allongés), t-q11 gardée (reconnaître `htmlspecialchars` est la compétence visée).
- **Retouches de l'utilisateur** : domaine cinéma ; propositions et énoncés réduits ; 4-q4, 3-q5, t-q5 retirées ; 1-q3, 2-q2, 2-q8, 3-q1, 4-q11, t-q1, t-q6 réécrites ; 2-q3, t-q4, t-q8 remplacées par 2-q9, t-q11, t-q10 ; t-q9 et 4-q5 simplifiées ; plus de question piège.
- **Rien n'est écrit en prod.**

- **Réécriture du 2026-11-02** : les 21 questions sont transposées dans le cinéma (ni le TP ni le cours), propositions réduites au résultat, énoncés raccourcis. La lecture croisée ci-dessus porte sur la version d'avant : à refaire.
- **Écartées à la présélection (12)** : 1-q1 et 1-q9 (niveau `analyser` plein ou récitation), 1-q4, 1-q5, 2-q1, 2-q5, 3-q2, 3-q3, 3-q7, 4-q1, 4-q3, t-q3 (proche de t-q2).
- **Écartées après les tests (11)** : 1-q6, 1-q8, 2-q6 (notion non enseignée) ; 2-q7, 4-q10, t-q7 (point central sans source) ; 3-q4 et t-q2 (`===` entre entier et chaîne non expliqué) ; 4-q9 (doublon de t-q4) ; 3-q6 et 4-q6 (niveau `analyser` plein).
