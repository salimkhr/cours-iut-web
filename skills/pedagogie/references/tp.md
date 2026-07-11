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
| Commande à exécuter dans une étape | bloc `code` avec `language: "bash"` en **enfant du `list-item`** (pas de commande inline dans `text`) — `list-item` a `allowedChildren: "any"` |
| Fichier de départ fourni | `download-file` (données réalistes de l'univers) |
| Récapitulatif d'état du projet | `callout` variant `info`, title « À ce stade, votre projet contient » |
| Avertissement / rappel visuel | `callout` variant `warning` — **jamais `reminder`** |

> **`reminder` ≠ callout visuel.** Le variant `reminder` injecte un contexte IA
> (« Tu es un professeur… ») visible par les étudiants dans le rendu. N'utilisez
> `reminder` que si vous souhaitez délibérément afficher ce prompt d'accompagnement.
> Pour tout encadré prérequis ou avertissement destiné aux étudiants, utilisez `warning`.

## Univers du module

Chaque module déclare son univers thématique dans le champ `universe` retourné par
`list_modules()` : `name` (ex : Netflex), `description` (domaine + données types) et
`scope`.

- **Toutes** les données, exemples et livrables du TP puisent dans cet univers.
- `scope: "module"` → **fil rouge annuel** : chaque TP fait avancer le même projet
  d'une séance à l'autre. Avant d'écrire ou de réviser, reconstruire l'état courant du
  projet en lisant les TP des sections précédentes (`list_sections(module)` puis
  `get_content(module, section, "TP")`) : fichiers existants, classes et fonctions déjà
  définies, structure de base de données, fonctionnalités en place. Les exercices
  s'appuient sur cet état sans le répéter ni le contredire.

  **Démarrage du projet commun :** les premiers TP d'un module fil rouge servent à
  construire les bases du langage ou des outils — le projet commun ne démarre pas
  forcément en section 1. Lire l'ensemble des sections (`list_sections(module)`) pour
  repérer le moment opportun : quand l'étudiant dispose des notions suffisantes pour
  faire avancer un vrai livrable. Avant ce seuil, les exercices restent dans l'univers
  mais sont indépendants (type `scope: "tp"`). À partir du seuil, chaque TP s'appuie
  sur le livrable en cours et le fait progresser.
- `scope: "tp"` → **livrable par TP** : chaque TP construit un objet terminé dans
  l'univers commun, sans dépendance entre TP.
- Module sans `universe` : demander à l'utilisateur de le définir et proposer de le
  sauvegarder via `edit_module` avant de rédiger.

## Structure obligatoire du TP

1. **Annonce du livrable** — le TP s'ouvre sur un bloc `text` :
   « À la fin de ce TP, vous aurez construit **X** ». X est un objet concret et
   démontrable de l'univers du module, jamais « des exercices sur les boucles ».
2. **Exercice 1 — échauffement indépendant** — application directe de la notion du
   cours, sans lien avec le fil rouge (mais dans l'univers), démarrable même sans avoir
   tout compris. Guidage fort.
3. **Exercices 2 et suivants — fil rouge séquentiel** — chaque exercice fait avancer
   le livrable en s'appuyant sur le résultat de l'exercice précédent. Les dépendances
   entre exercices du fil rouge sont autorisées et attendues.

## Contrat de consigne universel

**Tout exercice, quel que soit son niveau de guidage**, fournit explicitement :

1. le ou les **fichiers cibles** (créés ou modifiés) ;
2. les **noms exacts** des fonctions, classes ou identifiants à créer ;
3. les **données d'entrée** (fournies via `download-file` ou définies dans l'énoncé) ;
4. le **résultat observable**, décrit précisément : sortie console verbatim,
   description du rendu visuel, valeur retournée ;
5. le **critère de validation** (« Vous devriez voir X dans la console / le
   navigateur »).

Le guidage léger retire uniquement les **étapes intermédiaires** (le « comment ») —
jamais un élément du contrat. Une consigne dont un étudiant ne peut pas déduire quel
fichier ouvrir, quoi nommer et à quoi ressemble le résultat est un constat bloquant.

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

- Contrat de consigne complet + **étapes numérotées** (`list` ordered)
- Méthode ou API à utiliser imposée
- Chaque action formulée à l'**impératif vouvoyé** :
  `Créez`, `Ajoutez`, `Modifiez`, `Vérifiez`, `Ouvrez`, `Utilisez`, `Affichez`
- **Jamais d'infinitif** (« Créer le fichier… ») ni de futur (« Vous créerez… »)

### Exercices 3 et suivants : guidage léger

- Contrat de consigne complet, mais **pas d'étapes numérotées** : l'étudiant détermine
  lui-même le chemin entre l'état courant et le résultat observable
- Contraintes techniques listées (ex : « sans boucle `for` », « avec la méthode
  `reduce` »)

## Anti-abstraction

- Chaque exercice manipule les **données réelles de l'univers** (des films, des scores,
  des produits…) — jamais de `foo`/`bar` ni de fonctions jouets (« une fonction qui
  additionne deux nombres »).
- Si l'exercice a besoin de données, les fournir via un bloc `download-file` avec des
  données réalistes de l'univers.

## Calibrage temporel

Budget TP = `totalDuration` (section, nb de séances) × `sessionDurationMinutes` (module)
− temps de cours en séance.

- Lire les durées via `list_modules()` (`sessionDurationMinutes`, `isExtra`,
  `universe`) et `list_sections(module)` (`totalDuration`).
- Temps de cours en séance : nombre de blocs `slide` dans
  `get_content(module, section, "slide")` × 2 minutes. Si les slides n'existent pas
  encore, déduire un forfait de 30 minutes de la première séance.

**Grille de dimensionnement a priori :**

| Type d'exercice | Durée étudiant estimée |
|-----------------|------------------------|
| Guidé (exercices 1–2) | 20–30 min |
| Léger (exercices 3+) | 40–60 min |

- Déduire le **nombre d'exercices** du budget avec cette grille.
- La somme des durées estimées doit couvrir **80 à 100 % du budget**. Un TP finissable
  en 30 minutes sur une séance de 150 minutes est un constat bloquant, au même titre
  qu'un TP infinissable.
- Chaque exercice indique une **durée indicative** ; vérifier à la rédaction que la
  somme respecte la cible.
- Modules avec `isExtra: true` (bonus à faire chez soi) : aucune contrainte de durée,
  mais le TP doit être **auto-suffisant** (réalisable sans enseignant).

## Règles absolues

- **Jamais de code solution** dans le TP, même partiel
- **Contrat de consigne complet sur tous les exercices**, y compris en guidage léger
- Le récapitulatif d'état de l'exercice N correspond exactement au résultat de N−1
- Somme des durées estimées entre 80 et 100 % du budget (hors `isExtra`)
