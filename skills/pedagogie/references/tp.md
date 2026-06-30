# Règles pédagogiques — Type : TP

## Schéma obligatoire : Définir → Utiliser

Chaque exercice suit **toujours** ce schéma en deux temps :

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

## Niveau de guidage progressif

### Exercices 1–2 : guidage fort

- Fichier cible précisé explicitement
- Méthode ou API à utiliser imposée
- Résultat attendu décrit avec précision
- Critère de validation explicite ("Vous devriez voir X dans la console / dans le navigateur")
- Chaque action formulée à l'**impératif vouvoyé** :
  `Créez`, `Ajoutez`, `Modifiez`, `Vérifiez`, `Ouvrez`, `Utilisez`, `Affichez`
- **Jamais d'infinitif** ("Créer le fichier...") ni de futur ("Vous créerez...")

### Exercices 3 et suivants : guidage léger

- Objectif fonctionnel uniquement ("Faites en sorte que...")
- Contraintes techniques listées (ex: "sans utiliser de boucle `for`", "en utilisant la méthode `reduce`")
- L'étudiant détermine lui-même les étapes
- Pas de numérotation des étapes — juste l'objectif et les contraintes

## Règles absolues

- **Jamais de code solution** dans le TP, même partiel
- **Chaque exercice testable de manière autonome** — pas de dépendance exercice N → N+1
- Chaque exercice guidé (1–2) doit toujours avoir : fichier cible + méthode/API + résultat attendu + critère de validation

## Projet cumulatif PHP — Netflex

Pour tout TP PHP appartenant au projet fil rouge Netflex :

1. **Avant d'écrire ou de réviser**, lire les fichiers TP des sessions précédentes dans
   `src/cours/php/` pour établir l'état courant du projet :
   - Fichiers existants dans le projet étudiant
   - Classes et fonctions déjà définies
   - Structure de base de données en place
   - Fonctionnalités déjà implémentées

2. **En tête du TP**, inclure un bloc récapitulatif :
   ```
   À ce stade, votre projet Netflex contient :
   - `index.php` — point d'entrée principal
   - `Movie.php` — classe Movie avec les propriétés id, title, year
   - `database.php` — connexion PDO à la base de données
   ```

3. Les exercices s'appuient sur cet état **sans répéter** ce qui existe déjà ni le **contredire**

4. **En mode révision** :
   - Sous-agent pédagogue : vérifie la cohérence avec les TPs précédents (rien ne suppose du code
     non encore introduit)
   - Sous-agent étudiant : signale si un exercice suppose du code qu'il n'a jamais écrit
