# Règles pédagogiques — Type : TP

## Format d'écriture : blocs

Le TP est un arbre de blocs écrit via les outils MCP (`save_content`, `insert_block`,
`edit_block`…). Avant de rédiger, appelez `list_block_types()` pour obtenir la liste à
jour des types de blocs, leurs props exactes, les blocs conteneurs et leurs enfants
autorisés. Ne devinez jamais un type ou une prop.

Conventions d'usage pédagogique (non déductibles du schéma) :

| Usage | Bloc |
|-------|------|
| Un exercice | `section` avec `title` : « Exercice N — [objectif] » |
| Consignes pas-à-pas | `list` avec `ordered: true`, une action par `list-item` |
| Code (squelette, signature, exemple) | `code` avec `language` et `filename` — jamais de code dans un bloc `text` |
| Fichier de départ fourni | `download-file` (données réalistes du livrable) |
| Récapitulatif d'état du projet | `callout` variant `info`, title « À ce stade, votre projet contient » |
| Avertissement / rappel | `callout` variant `warning` ou `reminder` |

## Structure obligatoire du TP

1. **Annonce du livrable** — le TP s'ouvre sur un bloc `text` :
   « À la fin de ce TP, vous aurez construit **X** ». X est un objet concret et
   démontrable (un memory game, une galerie filtrée, une page de profil…), jamais
   « des exercices sur les boucles ».
2. **Exercice 1 — échauffement indépendant** — application directe de la notion du
   cours, sans lien avec le fil rouge, démarrable même sans avoir tout compris.
   Guidage fort.
3. **Exercices 2 et suivants — fil rouge séquentiel** — chaque exercice fait avancer
   le livrable en s'appuyant sur le résultat de l'exercice précédent. Les dépendances
   entre exercices du fil rouge sont autorisées et attendues.

## Récapitulatif d'état (filet de sécurité)

Chaque exercice du fil rouge commence par un `callout` info
« À ce stade, votre projet contient : » listant les fichiers, les fonctions ou classes
définies et les fonctionnalités en place.

- Le récapitulatif de l'exercice N décrit **exactement** le résultat attendu de
  l'exercice N−1 — ni plus, ni moins.
- Il permet à un étudiant bloqué de se resynchroniser rapidement avec l'aide de
  l'enseignant, sans maintenir de code de rattrapage.

## Schéma Définir → Utiliser

Chaque exercice suit ce schéma en deux temps :

### Étape 1 — Définir
L'étudiant crée la fonction, la classe ou le module. Imposer :
- Le **nom exact** de la fonction/classe
- Les **paramètres** et leur type attendu (en commentaire ou en description)
- Le **type de retour** attendu
- **Ne jamais donner le corps** de la fonction

### Étape 2 — Utiliser
L'étudiant appelle ce qu'il vient de créer dans un contexte réel. Imposer :
- Le **fichier cible** où l'appel doit se faire
- Le **résultat observable** attendu (affichage console, rendu visuel, valeur retournée)
- **Ne jamais donner l'appel exact**

## Guidage progressif

### Exercices 1–2 : guidage fort

- Fichier cible précisé explicitement
- Méthode ou API à utiliser imposée
- Résultat attendu décrit avec précision
- Critère de validation explicite (« Vous devriez voir X dans la console / le navigateur »)
- Chaque action formulée à l'**impératif vouvoyé** :
  `Créez`, `Ajoutez`, `Modifiez`, `Vérifiez`, `Ouvrez`, `Utilisez`, `Affichez`
- **Jamais d'infinitif** (« Créer le fichier… ») ni de futur (« Vous créerez… »)

### Exercices 3 et suivants : guidage léger

- Objectif fonctionnel uniquement (« Faites en sorte que… »)
- Contraintes techniques listées (ex : « sans boucle `for` », « avec la méthode `reduce` »)
- L'étudiant détermine lui-même les étapes
- Pas de numérotation des étapes — juste l'objectif et les contraintes

## Anti-abstraction

- Au-delà de l'exercice 1, chaque exercice manipule les **données réelles du livrable**
  (des films, des scores, des produits…) — jamais de `foo`/`bar` ni de fonctions jouets
  (« une fonction qui additionne deux nombres »).
- Si l'exercice a besoin de données, les fournir via un bloc `download-file` avec des
  données réalistes.

## Calibrage temporel

Budget TP = `totalDuration` (section, nb de séances) × `sessionDurationMinutes` (module)
− temps de cours en séance.

- Lire les durées via `list_modules()` (`sessionDurationMinutes`, `isExtra`) et
  `list_sections(module)` (`totalDuration`).
- Temps de cours en séance : nombre de blocs `slide` dans
  `get_content(module, section, "slide")` × 2 minutes. Si les slides n'existent pas
  encore, déduire un forfait de 30 minutes de la première séance.
- Le fil rouge doit être finissable dans le budget par un étudiant moyen.
- Chaque exercice indique une **durée indicative** ; vérifier à la rédaction que la
  somme respecte le budget.
- Modules avec `isExtra: true` (bonus à faire chez soi) : aucune contrainte de durée,
  mais le TP doit être **auto-suffisant** (réalisable sans enseignant).

## Deux échelles de fil rouge

- **Projet annuel** (ex : Netflex en PHP) : chaque TP fait avancer le même projet d'une
  séance à l'autre. Avant d'écrire ou de réviser, reconstruire l'état courant du projet
  en lisant les TPs des sections précédentes via `list_sections(module)` puis
  `get_content(module, section, "TP")` : fichiers existants, classes et fonctions déjà
  définies, structure de base de données, fonctionnalités en place. Les exercices
  s'appuient sur cet état sans le répéter ni le contredire.
- **Livrable par TP** (HTML/CSS, JS…) : chaque TP construit un objet terminé,
  sans dépendance entre TPs.

## Règles absolues

- **Jamais de code solution** dans le TP, même partiel
- Chaque exercice guidé (1–2) a toujours : fichier cible + méthode/API + résultat
  attendu + critère de validation
- Le récapitulatif d'état de l'exercice N correspond exactement au résultat de N−1
