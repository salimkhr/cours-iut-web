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
- **Étape en cours** : en attente de validation ; propositions et énoncés raccourcis après les tests, à retester (cadrage validé le 2026-11-02)
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
| 4-q2 | 4 | `REQUEST_METHOD` | evaluer | C | C | C | facile | F/cours:form-simple-flow-text | même bloc | justifie un choix imposé |
| 4-q3 | 4 | Toutes les cases cochées (remplace 4-q4, retirée par l'utilisateur) | comprendre | à retester | — | — | à retester | F/cours:form-complex-checkbox-text | — | `name="x[]"` donne un tableau |
| 2-q3 | 2 | `usort` renvoie `true` | analyser | A | A | A | facile | O/cours:tri-usort-callout-txt | même bloc | diagnostic d'une idée fausse enseignée |
| 3-q1 | 3 | `extract` et casse | analyser | B | B | B | facile | S/cours:29d1f832-84c5-46a0-8092-547e028c6421 | même bloc | relie `render` et la casse |
| 2-q8 | 2 | `??` et clé absente | evaluer | B | B | B | facile | O/cours:assoc-modif-callout-txt | même bloc | compare deux codes proches |
| t-q1 | 3, 1 | Portée dans `render` | analyser | B | B | B | facile | S/cours:3e326d3e-d65d-479d-a7cb-10ceee15752d | même bloc | relie portée et vue |
| t-q5 | 3, 4 | `redirect` sans `exit` | analyser | A | A | A | facile | F/cours:form-errors-prg-note-text | même bloc | effet concret sur le fichier |
| t-q4 | 3, 4 | Double échappement | evaluer | A | A | A | facile | F/tp:tp4-ex5-warn-txt | F/tp:tp4-ex5-warn | remplace 4-q9, même notion |
| 4-q5 | 4 | `(int)` contre `filter_var` | analyser | B | B | B | facile | F/cours:form-simple-conversion-warning-text | même bloc | justifie l'API imposée |
| 3-q5 | 3 | `empty` contre lecture | evaluer | B | B | B | facile | S/tp:tp3-extract-2 | même bloc | choix de deux versions, geste du TP |
| 3-q8 | 3 | `const` et portée | evaluer | C | C | C | facile | S/tp:tp3-entities-3 | B/cours:be5cd8ac-fa7e-4f30-b2f1-16ad967d6262 | justifie une constante |
| 4-q8 | 4 | `array_diff` | appliquer | C | C | C | facile | F/cours:form-errors-choice-text | même bloc | résultat exact, clé conservée |
| 4-q11 | 4 | Tableaux parallèles | analyser | C | C | C | facile | O/cours:tri-filter-callout-txt | même bloc | diagnostic le plus exigeant |
| t-q6 | 1, 2, 4 | `array_filter` et `for` | analyser | B | B | B | facile | O/cours:tri-filter-callout-txt | même bloc | relie trois sections |
| t-q8 | 2, 3 | Copie contre objet | comprendre | A | D | A | discriminante, sans source | aucune source | aucune source | seule discriminante restante ; à trancher |

- **Réécriture du 2026-11-02** : les 21 questions sont transposées dans le cinéma (ni le TP ni le cours), propositions réduites au résultat, énoncés raccourcis. La lecture croisée ci-dessus porte sur la version d'avant : à refaire.
- **Écartées à la présélection (12)** : 1-q1 et 1-q9 (niveau `analyser` plein ou récitation), 1-q4, 1-q5, 2-q1, 2-q5, 3-q2, 3-q3, 3-q7, 4-q1, 4-q3, t-q3 (proche de t-q2).
- **Écartées après les tests (11)** : 1-q6, 1-q8, 2-q6 (notion non enseignée) ; 2-q7, 4-q10, t-q7 (point central sans source) ; 3-q4 et t-q2 (`===` entre entier et chaîne non expliqué) ; 4-q9 (doublon de t-q4) ; 3-q6 et 4-q6 (niveau `analyser` plein).
