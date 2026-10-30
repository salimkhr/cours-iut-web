# Sessions et authentification (`php/7-sessions-et-authentification`)

## Statut
- **Mode** : redaction
- **Phase** : slides
- **Étape en cours** : cours réécrit en prod (version 2), relecture navigateur ; slides à valider
- **Mis à jour le** : 2026-10-30
- **Validé** : fiche de conception le 2026-10-28 ; plan v5 le 2026-10-30 ; cours le 2026-10-30, relecture navigateur OK le 2026-10-30
- **Désaccords en attente** : aucun
- **Prochaine action** : OK navigateur sur la version 2, validation des slides, écriture des slides, puis TP.

## Cadrage
| # | Question | Défaut proposé | Réponse de l'utilisateur | Date |
|---|---|---|---|---|
| Q0 | courseIntroMinutes | 20 min (comme PHP 1) → TP 160 min, plage 128–160 min | défaut accepté : 20 min | 2026-10-27 |
| Q1 | Ce que les étudiants ratent d'habitude | session_start() oublié ou placé après une sortie ; comparaison du hash avec === ; header('Location') sans exit dans requireAdmin ; $_SESSION encore rempli après session_destroy() dans la même requête | défaut accepté : les quatre | 2026-10-27 |
| Q2 | Erreurs vues réellement en TP | Warning session_start() après sortie (PHP) ; SQLSTATE[42601] sur CREATE TABLE user (PostgreSQL) ; SQLSTATE[22001] hash tronqué par une colonne trop courte (PostgreSQL) ; ERR_TOO_MANY_REDIRECTS si login.php est protégé (navigateur) | défaut accepté : les quatre | 2026-10-27 |
| Q3 | Exemples qui marchent en classe | (a) recettes favorites gardées en session (Recettes) ; (b) espace Auteur : connexion d'un auteur, seul l'auteur d'une recette peut la modifier (contrôle par propriété, pas par rôle) | défaut accepté : (a) + (b) | 2026-10-27 |
| Q4 | À voir absolument / à éviter | à voir : session_regenerate_id à la connexion (fixation de session), jamais le mot de passe ni le hash en session ; à éviter : try/catch (non enseigné), jeton CSRF (cité au cours 4, hors budget : une phrase) ; verdicts 6ac67a63, 6ac3edec, squelette (6a9c32df, 6a9c32e1) ; jamais d'indice | « session_regenerate_id n'est pas utile » : retiré ; reste du défaut accepté (écart au brief, notion 1 et filRougeStep) | 2026-10-27 |
| Q5 | Répartition guidée / fil rouge du TP | E1 guidé hors fil rouge (25 min) puis 4 exercices fil rouge (115 min) = 140 min (88 %) ; bonus : message flash (B1), retour à la page demandée après connexion (B2) | « Tout sur Onzer » : 5 exercices Onzer, flash dans le tronc commun → E1 table users + User + UserRepository (30), E2 create_user password_hash (20), E3 login password_verify + session + logout (35), E4 requireAdmin + header conditionnel (35), E5 message flash (25) = 145 min (91 %) ; B1 retour à la page demandée | 2026-10-28 |
- **Angles proposés** : A « Du faux login au vrai compte », B « La mémoire du serveur d'abord », C « Par la menace » ; recommandé : B
- **Angle choisi** : B « La mémoire du serveur d'abord » (2026-10-28)

## Fiche de conception (validée le 2026-10-28)
- **Angle retenu** : B « La mémoire du serveur d'abord » : HTTP est sans état (cours 1), la session est la mémoire que le serveur garde pour un visiteur ; la connexion n'est qu'une information de plus rangée en session.
- **Progression des notions** : N1 sessions PHP (`session_start`, `$_SESSION`, destruction à la déconnexion ; sans `session_regenerate_id`, décision Q4) → N2 `password_hash` / `password_verify` → N3 entité et repository d'un compte (`findByEmail`, `insert`) → N4 contrôle d'accès → N5 affichage conditionnel selon l'état de connexion → N6 message flash en session.
- **Exemple fil conducteur du cours** : Recettes de cuisine. N1 : recettes favorites en session (ajouter, lister, vider). N2 à N6 : espace Auteur (`Author`, `AuthorRepository::findByEmail`), seul l'auteur d'une recette peut la modifier (`requireAuthor`, contrôle par propriété) ; flash « Recette enregistrée. ».
- **Erreurs fréquentes à montrer** : N1 Warning `session_start()` après une sortie (PHP) ; N2 hash comparé avec `===` (aucun message : `false` silencieux, montré par `var_dump`) et colonne trop courte, SQLSTATE[22001] (PostgreSQL) ; N3 `CREATE TABLE user`, SQLSTATE[42601] (PostgreSQL) ; N4 `header('Location')` sans `exit` (la page s'exécute quand même) et ERR_TOO_MANY_REDIRECTS (navigateur) ; N1/N5 `$_SESSION` encore rempli après `session_destroy()` dans la même requête. Messages exécutés au plan.
- **À voir absolument / à éviter** : jamais le mot de passe ni le hash dans `$_SESSION` (id, nom, rôle seulement) ; pas de `try/catch` (doublon d'e-mail par `findByEmail` avant l'insert) ; CSRF en une phrase ; pas de `session_regenerate_id` ; verdicts 6ac67a63 (seul le premier exercice d'un geste nouveau guidé pas à pas), 6ac3edec, 6a9c32df et 6a9c32e1 (squelette) ; jamais d'indice ni de solution.
- **TP** : 5 exercices, tous sur Onzer (« Tout sur Onzer ») : E1 table `users` + `User` + `UserRepository` (30), E2 `create_user.php` avec `password_hash` (20), E3 `login.php` + session + `logout.php` (35), E4 `requireAdmin()` + header conditionnel (35), E5 message flash (25). Bonus : B1 retour à la page demandée après connexion.
- **Budgets** : cours + slides 20 min ; TP 1 × 180 − 20 = 160 min (plage 128–160 min) ; tronc commun prévu 145 min (91 %).
- **courseIntroMinutes** : 20 (fixé au cadrage, écrit en prod à la clôture).
- **Points laissés au plan** : nom de la table (`users`, dépôt de référence injoignable) ; `schema.sql` (le brief le dit prêt, les TP 5 et 6 ne créent que `artist` et `album` : E1 crée la table et les deux comptes hachés de Admin123! et User123!) ; `redirect()` `: void` (TP3) ou `: never` (cours 6) ; état initial du fil rouge non reconstituable (pas de vérification d'exécution des résultats du TP).
- **Écarts au brief** : `session_regenerate_id` retiré (Q4) ; message flash dans le tronc commun et non en bonus (Q5).

Signalements du collecteur (2026-10-27), à régler au plan :
- dépôt de référence injoignable (`ECONNREFUSED`) : nom de la table des utilisateurs non vérifiable, état initial du fil rouge non reconstituable ;
- le brief dit que `schema.sql` contient déjà la table des utilisateurs et les deux comptes ; les TP 5 et 6 ne créent que `artist` et `album` ;
- `redirect()` : `: void` au TP3, `: never` au cours 6 ;
- `password_hash`, `session_start`, `try/catch` : enseignés nulle part avant la section 7.

## Plan (version 5, 2026-10-30)

v5, décision de l'utilisateur du 2026-10-30 : la variante de N3 est réduite au contrôle d'adresse déjà utilisée (`findByEmail` puis `$errors`), pour ne pas donner la structure de E2 ; `password_hash` et `insert` restent montrés séparément en N2 et N3. La ligne de N3 ci-dessous est lue avec cette réduction.

Arborescence du cours (demande de l'utilisateur du 2026-10-30) : deux parties, « Les sessions » (N1, N6) et « L'authentification » (N2, N3, N4, N5) ; sous-sous-parties : N1 Ouvrir une session, Vider une session ; N2 Hacher puis vérifier, Ranger le hash en base ; N3 L'entité et son repository, Refuser une adresse déjà prise ; N4 Se connecter, c'est ranger l'auteur en session, Confirmer un mot de passe, Réserver une page à son auteur ; N5 Un header selon la connexion, Un bouton réservé à l'auteur ; N6 Écrire, afficher, effacer, Un seul endroit pour l'afficher. Restructuration du brouillon par script, texte inchangé.

Choix de la v4, validés par l'utilisateur le 2026-10-30 : noms `save_recipe.php`, `list_recipes.php`, `edit_recipe.php` gardés ; `findByEmail` gardé, avec une phrase sur l'exception à la convention `findOneBy...` (l'adresse est unique, comme l'identifiant) ; `htmlspecialchars()` à l'affichage en N1 et N6, sorties présentées comme celles de `curl`.

Vérifications d'exécution : `cours-iut-bac:1`, PHP 8.3.6 (cli, `php -S`), PostgreSQL 16.15 (`psql`), Chromium (`rendu-html`), le 2026-10-28. L'image n'a pas l'extension `pdo_pgsql` : les erreurs SQL sont vérifiées avec `psql` ; le préfixe PDO (`SQLSTATE[…]: …`) est reconstitué au format du cours 5 (SQLSTATE[HY093], [42702]), non exécuté.

### Cours — budget cours + slides : 20 min (courseIntroMinutes fixé au cadrage)
Fil conducteur : Recettes de cuisine (exampleDomain). Auteur de démonstration : Lucie Fourneau, `lucie@recettes.local`, mot de passe `Crumble2024!`. Aucun objet Onzer (album, artiste, utilisateur, catalogue).

#### N1 — Sessions PHP (brief : « Sessions PHP ($_SESSION, session_start, session_regenerate_id, destruction à la déconnexion) », sans `session_regenerate_id`, décision Q4) — 6 min
- **Problème d'entrée** : HTTP est sans état (cours 1) ; d'une page à l'autre, le serveur oublie tout. La session est un tableau que PHP garde côté serveur pour un visiteur, retrouvé grâce au cookie `PHPSESSID`.
- **Exemple minimal** (`favoris.php`) :
  ```php
  <?php
  session_start();

  if (!isset($_SESSION['favorites'])) {
      $_SESSION['favorites'] = [];
  }
  if (isset($_GET['add'])) {
      $_SESSION['favorites'][] = $_GET['add'];
  }

  echo count($_SESSION['favorites']) . " favori(s)\n";
  foreach ($_SESSION['favorites'] as $name) {
      echo "- $name\n";
  }
  ```
  Sortie vérifiée : `favoris.php?add=Tarte%20Tatin` → `1 favori(s)` / `- Tarte Tatin` ; puis `?add=Ratatouille` → `2 favori(s)` / `- Tarte Tatin` / `- Ratatouille`.
- **Variante réaliste** (`vider_favoris.php`) : vider la session, comme à une déconnexion.
  ```php
  <?php
  session_start();
  $_SESSION = [];
  session_destroy();
  header('Location: favoris.php');
  exit;
  ```
  Sortie vérifiée : réponse `HTTP/1.1 302 Found`, puis `favoris.php` affiche `0 favori(s)`.
- **Erreur fréquente 1** (`callout warning`) : `session_start()` appelé après une sortie HTML.
  ```php
  <h1>Mes favoris</h1>
  <?php
  session_start();
  ```
  Message réel (avec `display_errors=1`) :
  ```
  Warning: session_start(): Session cannot be started after headers have already been sent in /work/erreurs/n1_sortie_avant.php on line 3
  ```
  Vérifié le 2026-10-28 en ligne de commande (`php -d display_errors=1`). Corrigé en v4 après vérification du 2026-10-30 sous `php -S` (`output_buffering` à 0 et à 4096) : sur une page courte, PHP retient encore la sortie, il n'y a pas de warning et la session démarre ; dès qu'une sortie part vraiment (20 Ko de HTML, ou `flush()`), le warning tombe et `session_status()` vaut 1 (session non démarrée). Avec `display_errors => Off`, la session ne démarre pas, sans message. Le cours dit : l'erreur peut rester invisible sur une petite page de test et surgir quand la page grandit, donc `session_start()` toujours avant toute sortie.
- **Erreur fréquente 2** (`callout warning`) : croire que `session_destroy()` vide `$_SESSION` tout de suite.
  ```php
  <?php
  session_start();
  $_SESSION['author'] = 'Lucie Fourneau';
  session_destroy();
  var_dump($_SESSION);
  ```
  Sortie réelle : `array(1) { ["author"]=> string(14) "Lucie Fourneau" }`. Vérifié le 2026-10-28, PHP 8.3.6. D'où `$_SESSION = [];` avant `session_destroy()`.
- **Blocs prévus** : `text`, `code` (filename `favoris.php`), `code` (sortie), `code` (filename `vider_favoris.php`), `callout warning` ×2, `diagram` (navigateur ↔ cookie PHPSESSID ↔ fichier de session).

#### N2 — `password_hash` / `password_verify` (brief : « password_hash / password_verify ») — 4 min
- **Exemple minimal** :
  ```php
  <?php
  $hash = password_hash('Crumble2024!', PASSWORD_DEFAULT);
  echo $hash . "\n";
  var_dump(password_verify('Crumble2024!', $hash));
  var_dump(password_verify('crumble2024!', $hash));
  ```
  Sortie vérifiée (le hash change à chaque exécution) : `$2y$10$6VcD7AD3ianTnpUrRpGPP.uZcVIwv9tTHKtln84N2o4OdDyE0B0gS` / `bool(true)` / `bool(false)`. Le texte dit que le hash fait 60 caractères (sans `strlen`, non enseigné).
- **Variante réaliste** : on ne stocke que le hash (colonne `password_hash VARCHAR(255)`, 255 car l'algorithme par défaut peut changer) ; la connexion relit le hash et appelle `password_verify`.
- **Erreur fréquente 1** (`callout warning`) : comparer deux hachages avec `===`. `var_dump(password_hash('Crumble2024!', PASSWORD_DEFAULT) === $hash);` → `bool(false)`, aucun message : le sel change à chaque appel. Vérifié le 2026-10-28, PHP 8.3.6.
- **Erreur fréquente 2** (`callout warning`) : colonne trop courte. `password_hash VARCHAR(50)`, insertion d'un hash de 60 caractères. Message PostgreSQL réel : `ERROR:  value too long for type character varying(50)` (psql 16.15, 2026-10-28). Le cours montre ce message tel quel et dit qu'il apparaît, dans la page, derrière le préfixe `SQLSTATE[22001]` de la `PDOException` (format complet de PDO non exécuté : image sans `pdo_pgsql`).
- **Blocs prévus** : `text`, `code`, `code` (sortie), `callout warning` ×2.

#### N3 — Entité et repository d'un compte (brief : « Entité User et UserRepository (findByEmail, insert) », montré sur `Author`) — 3 min
- **Exemple minimal** : `Author` (`?int $id`, `string $name`, `string $email`, `string $passwordHash`) et `AuthorRepository extends Repository` avec `findByEmail(string $email): ?Author` (requête préparée `SELECT … FROM author WHERE email = :email`, `fetch()` → `false` → `null`, comme `findById` au cours 5) et `insert(Author $author): int` (`RETURNING id` + `fetchColumn`, cours 6).
- **Variante réaliste** : inscription d'un auteur : `findByEmail` d'abord (adresse déjà prise → message, pas d'insert), sinon `password_hash` puis `insert`. Pas de `try/catch` (non enseigné).
- **Erreur fréquente** (`callout warning`) : nommer la table `user`. `CREATE TABLE user (id SERIAL PRIMARY KEY, email TEXT NOT NULL);` → message PostgreSQL réel :
  ```
  ERROR:  syntax error at or near "user"
  LINE 1: CREATE TABLE user (id SERIAL PRIMARY KEY, email TEXT NOT NUL...
                       ^
  ```
  (psql 16.15, 2026-10-28). `user` est un mot réservé : on nomme la table `author` (et `users` au TP).
- **Blocs prévus** : `text`, `code` (filename `entities/Author.php`), `code` (filename `repositories/AuthorRepository.php`), `callout warning`.

#### N4 — Contrôle d'accès (brief : « Contrôle d'accès (requireAdmin) », montré par propriété : `requireAuthor`) — 4 min
- **Exemple minimal** : connexion réussie → `$_SESSION['author'] = ['id' => …, 'name' => …];` (jamais le mot de passe ni le hash). Puis :
  ```php
  function requireAuthor(Recipe $recipe): void
  {
      if (!isset($_SESSION['author']) || $_SESSION['author']['id'] !== $recipe->getAuthorId()) {
          redirect('login.php');
      }
  }
  ```
  avec `redirect()` du cours 6 (`header` + `exit`, type `never`).
- **Vérifier un mot de passe (v4)** : pas de page de connexion dans le cours, c'est le travail de E3. Le geste est montré sur une autre situation, `delete_recipe.php` : l'auteur connecté confirme son mot de passe avant de supprimer une recette.
  ```php
  $author = $authorRepository->findById($_SESSION['author']['id']);

  if (!password_verify($_POST['password'] ?? '', $author->getPasswordHash())) {
      $errors['password'] = 'Mot de passe incorrect.';
  }
  ```
  Puis une phrase, sans code : une page de connexion fait ce contrôle après `findByEmail`, qui peut renvoyer `null` ; les deux cas donnent le même message, pour ne pas révéler quelles adresses ont un compte. Déconnexion : une phrase, sans fichier `logout.php` : c'est le geste de `vider_favoris.php` (N1).
- **Variante réaliste** : `edit_recipe.php` appelle `requireAuthor($recipe)` juste après avoir chargé la recette, avant tout traitement du formulaire.
- **Erreur fréquente 1** (`callout warning`) : `header('Location: …')` sans `exit`.
  ```php
  if (!isset($_SESSION['author_id'])) {
      header('Location: login.php');
  }
  echo "Formulaire de modification de la recette\n";
  ```
  Réponse réelle : `HTTP/1.1 302 Found`, `Location: login.php`, et le corps contient quand même `Formulaire de modification de la recette` (curl, PHP 8.3.6, 2026-10-28). Le navigateur suit la redirection, mais le code protégé a tourné.
- **Erreur fréquente 2** (`callout warning`) : protéger la page de connexion elle-même. Message réel du navigateur : `net::ERR_TOO_MANY_REDIRECTS at http://localhost:8000/login.php` (Chromium via `rendu-html`, 2026-10-28) ; le libellé français affiché par Chrome n'est pas vérifié.
- **Blocs prévus** : `text`, `code`, `code` (filename `edit_recipe.php`), `callout warning` ×2. CSRF : une phrase en fin de N4 (la parade annoncée au cours 4 repose sur un jeton gardé en session ; elle n'est pas traitée ici).

#### N5 — Affichage conditionnel selon l'état de connexion (brief : « Affichage conditionnel du header selon l'état de connexion ») — 2 min
- **Exemple minimal** : dans `views/header.php` (syntaxe alternative, cours 3) : `<?php if (isset($_SESSION['author'])): ?>` → « Lucie Fourneau » + lien « Déconnexion » ; `<?php else: ?>` → « Connexion ».
- **Variante réaliste** : bouton « Modifier » affiché sur une recette seulement si l'auteur connecté en est l'auteur (même condition que `requireAuthor`). Masquer un lien ne protège pas la page : `requireAuthor` reste indispensable.
- **Erreur fréquente** (`callout warning`) : masquer le lien sans protéger la page. `recipe.php` n'affiche « Modifier » qu'à l'auteur ; `edit_recipe.php` n'appelle pas `requireAuthor`. Sortie réelle en visiteur (curl, PHP 8.3.6, 2026-10-28) : `recipe.php` → `<h1>Tarte Tatin</h1>` sans lien ; `edit_recipe.php?id=3` → code `200` et `Formulaire de modification de la recette 3`. Aucun message PHP : l'adresse tapée à la main ouvre la page.
- **Blocs prévus** : `text`, `code` (filename `views/header.php`), `code-with-preview` (rendu visiteur / auteur).

#### N6 — Message flash en session (brief : « Message flash en session (remplace le code status dans l'URL des sections 5 et 6) ») — 1 min
- **Exemple minimal** : `save_recipe.php` écrit `$_SESSION['flash'] = 'Recette enregistrée.';` puis redirige vers `list_recipes.php`, qui affiche le message s'il existe puis l'efface avec `unset($_SESSION['flash'])`. `unset` est introduit ici (non enseigné avant : une phrase d'explication).
- **Variante réaliste** : plusieurs pages écrivent un message (« Recette enregistrée. », « Recette supprimée. ») et une seule, le header, l'affiche : le message vit le temps d'une redirection. Pas de fonctions nommées dans le cours (le TP les fait écrire).
- **Erreur fréquente** (`callout warning`) : oublier `unset`. Sortie réelle (curl, PHP 8.3.6, 2026-10-28) : après `save_recipe.php`, `list_recipes.php` affiche `Recette enregistrée.` / `Liste des recettes` ; au rechargement, encore `Recette enregistrée.` / `Liste des recettes`. Aucun message PHP.
- **Blocs prévus** : `text`, `code`.

**Total cours** : 6 + 4 + 3 + 4 + 2 + 1 = 20 min.

### Slides — 10 slides, 20 min (même temps que le cours, présenté en début de séance)
| Repère | Titre | Idée unique | Bloc principal | Notion source | Durée |
|---|---|---|---|---|---|
| S1 | Le serveur oublie tout | HTTP sans état : chaque requête repart de zéro | `slide-transition` | N1 | 1 min |
| S2 | La session, mémoire du serveur | cookie PHPSESSID → tableau `$_SESSION` côté serveur | `slide-code` (favoris, highlight `session_start`) | N1 | 2 min |
| S3 | Vider une session | `$_SESSION = []` puis `session_destroy()` | `slide-code` | N1 | 2 min |
| S4 | Jamais de mot de passe en clair | `password_hash` : 60 caractères, change à chaque appel | `slide-code` | N2 | 2 min |
| S5 | Vérifier, pas comparer | `password_verify` et non `===` | `slide-code` | N2 | 2 min |
| S6 | `user` est un mot réservé | table `author` (ou `users`) | `slide-code` (message psql) | N3 | 2 min |
| S7 | Se connecter, c'est ranger l'id en session | id et nom en session, jamais le hash | `slide-code` | N4 | 2 min |
| S8 | Protéger une page | `requireAuthor` + `exit` | `slide-code` (highlight `exit`) | N4 | 3 min |
| S9 | Montrer selon qui regarde | header conditionnel, masquer ≠ protéger | `slide-code-with-preview` | N5 | 2 min |
| S10 | Le message qui ne sert qu'une fois | flash : écrire, afficher, `unset` | `slide-code` | N6 | 2 min |

Une `slide-note` par slide (oral, erreur fréquente, question à la salle). Total : 20 min. Les slides sont le support oral du cours : les 20 min sont communes au cours et aux slides, pas additionnées.

### TP — budget 1 × 180 − 20 = 160 min ; plage 128–160 min
Tous les exercices sont sur Onzer (`projectRef: true`, décision Q5). Guidage (désaccord 1 tranché le 2026-10-28, lecture stricte du verdict 6ac67a63) : E1 à E5 introduisent chacun un geste nouveau, ils sont donc guidés par des étapes d'action (quel fichier ouvrir, quoi y ajouter, quoi vérifier), sans code ni ordre d'instructions qui donne la solution ; la répétition d'un geste dans le même exercice (protéger les pages suivantes, ajouter `session_start()` aux autres actions) se limite au contrat. Aucune durée affichée, aucun indice ni solution.
Point de départ : le projet à la fin du TP6 (CRUD album/artiste en base, PRG, `statusMessage()`, `core/users.php` du TP4). État non reconstituable dans le bac à sable (dépôt de référence injoignable) : résultats observables tirés des exports des TP 4 à 6.

#### E1 — Table des utilisateurs, entité `User`, `UserRepository` — fil rouge — 30 min
1. **Fichiers cibles** : `schema.sql`, `entities/User.php`, `repositories/UserRepository.php`, `test_users.php` (fichier de vérification, supprimé à la fin).
2. **Noms exacts** : table `users` (pas `user`, mot réservé) : `id SERIAL PRIMARY KEY`, `first_name TEXT NOT NULL`, `last_name TEXT NOT NULL`, `email TEXT NOT NULL UNIQUE`, `password_hash VARCHAR(255) NOT NULL`, `is_admin BOOLEAN NOT NULL DEFAULT FALSE` ; classe `User` (constructeur promu : `?int $id`, `string $firstName`, `string $lastName`, `string $email`, `string $passwordHash`, `bool $isAdmin`) avec `getId()`, `getFirstName()`, `getLastName()`, `getEmail()`, `getPasswordHash()`, `isAdmin()` ; `UserRepository extends Repository` : `findByEmail(string $email): ?User`, `insert(User $user): int`, `hydrate()` privée, `toParams()`.
3. **Données d'entrée** : les deux comptes du TP4 : `admin@onzer.local`, Alain Ministration, `Admin123!`, admin ; `user@onzer.local`, Ulysse Sateur, `User123!`, non admin. Les deux hachages sont produits par `password_hash()` avec `PASSWORD_DEFAULT` en ligne de commande (`php -r`, commande nommée sans son code) et collés dans les `INSERT` de `schema.sql`.
4. **Méthode imposée** : `DROP TABLE IF EXISTS users` puis `CREATE TABLE` en tête de `schema.sql`, comme `artist` et `album` ; requêtes préparées à marqueurs nommés ; `RETURNING id` + `fetchColumn()` dans `insert` ; `fetch()` → `false` → `null` dans `findByEmail`.
5. **Résultat observable** : après `psql -f schema.sql`, `SELECT email, is_admin, length(password_hash) FROM users;` affiche deux lignes : `admin@onzer.local | t | 60` et `user@onzer.local | f | 60`. `test_users.php` affiche `Alain Ministration (admin)` pour `findByEmail('admin@onzer.local')` et `NULL` pour `findByEmail('inconnu@onzer.local')`.
6. **Critère de validation** : les deux sorties ci-dessus à l'identique, puis `test_users.php` supprimé.
- **Étapes d'action** (sans code) : (1) dans `schema.sql`, ajoutez la table `users` à côté de `artist` et `album` ; (2) produisez les deux hachages en ligne de commande, collez-les dans deux `INSERT` ; (3) relancez `schema.sql` et vérifiez la requête du résultat ; (4) créez `entities/User.php` sur le modèle d'`entities/Artist.php` ; (5) créez `repositories/UserRepository.php` sur le modèle d'`ArtistRepository` ; (6) écrivez `test_users.php`, comparez sa sortie, supprimez-le.
- **Notions pratiquées** : N2, N3 ; repository, requêtes préparées (cours 5 et 6).
- **Source du résultat** : brief (`filRougeOutcome`, comptes du TP4) ; dépôt non vérifiable.

#### E2 — Inscription enregistrée en base — fil rouge — 20 min
1. **Fichier cible** : `create_user.php` (sa vue `views/view_create_user.php` et ses six règles du TP4 ne changent pas).
2. **Noms exacts** : `UserRepository::findByEmail`, `UserRepository::insert`, `password_hash`, `PASSWORD_DEFAULT`.
3. **Données d'entrée** : saisie `Camille Dupont`, `camille.dupont@onzer.local`, mot de passe `MotDePasse1` saisi deux fois (valeur valide du TP4, essai « Compte créé pour Camille Dupont. ») ; puis la même adresse une seconde fois.
4. **Méthode imposée** : la règle « adresse déjà utilisée » passe par `findByEmail` (plus par `core/users.php`) ; mot de passe enregistré avec `password_hash(..., PASSWORD_DEFAULT)` ; après succès, `redirect('login.php')` au lieu du message « Compte créé pour Camille Dupont. ».
5. **Résultat observable** : `SELECT first_name, email, is_admin, left(password_hash, 4) FROM users WHERE email = 'camille.dupont@onzer.local';` → `Camille | camille.dupont@onzer.local | f | $2y$` ; seconde inscription : « Cette adresse email est déjà utilisée. » (règle 6 du TP4, verbatim) et aucune ligne ajoutée.
6. **Critère de validation** : une seule ligne pour cette adresse en base, et arrivée sur la page de connexion après la première inscription.
- **Étapes d'action** (sans code) : (1) dans `create_user.php`, repérez la règle 6 et faites-la passer par `UserRepository` ; (2) quand toutes les règles passent, construisez un `User` non enregistré, non admin, avec le mot de passe haché, et insérez-le ; (3) remplacez le message de succès par la redirection vers `login.php` ; (4) déroulez les deux essais et vérifiez la base avec la requête du résultat.
- **Notions pratiquées** : N2, N3.

#### E3 — Connexion par session, déconnexion — fil rouge — 35 min
1. **Fichiers cibles** : `login.php`, `logout.php` (nouveau), chaque fichier d'action à la racine (`index.php`, `list_albums.php`, `play_track.php`, `create_album.php`, `update_album.php`, `delete_album.php`, `create_artist.php`, `create_user.php`, `login.php`, `logout.php`) ; `core/users.php` supprimé ; `core/functions.php` (`redirect`).
2. **Noms exacts** : `session_start()` en première instruction de chaque action ; `$_SESSION['user']` = tableau `['id' => …, 'first_name' => …, 'last_name' => …, 'is_admin' => …]` ; `redirect(string $url): never`.
3. **Données d'entrée** : `admin@onzer.local` / `Admin123!` ; `admin@onzer.local` / `admin123!` (mauvaise casse) ; `user@onzer.local` / `User123!`.
4. **Méthode imposée** : `findByEmail` et `password_verify` ; jamais le mot de passe ni le hash dans `$_SESSION` ; `session_destroy()` pour la déconnexion.
5. **Résultat observable** : bon mot de passe → arrivée sur `list_albums.php` (plus de « Bienvenue, Alain Ministration ! ») ; mauvais → « Identifiants incorrects. » (message du TP4) sur la page de connexion ; `logout.php` → retour au catalogue ; `core/users.php` absent ; plus aucun `require` de `core/users.php` dans le projet.
6. **Critère de validation** : les trois essais donnent ces résultats ; juste après `logout.php`, un `var_dump($_SESSION)` temporaire en tête de `list_albums.php` affiche `array(0) {}` (puis il est retiré).
- **Étapes d'action** (sans code) : (1) dans `login.php`, démarrez la session et remplacez la recherche dans `core/users.php` par `UserRepository` ; (2) vérifiez le mot de passe avec `password_verify` ; (3) en cas de succès, rangez l'utilisateur en session (les quatre clés du champ 2) et envoyez-le au catalogue ; (4) créez `logout.php`, qui vide la session et renvoie au catalogue ; (5) démarrez la session dans les autres actions (contrat seul : même geste) ; (6) supprimez `core/users.php` et ses `require` ; (7) déroulez les trois essais et le critère.
- **Notions pratiquées** : N1, N2, N4 (redirect).

#### E4 — Pages réservées à l'admin, header conditionnel — fil rouge — 35 min
1. **Fichiers cibles** : `core/functions.php`, `create_artist.php`, `create_album.php`, `update_album.php`, `delete_album.php`, `views/header.php`, `views/view_list_albums.php`.
2. **Noms exacts** : `currentUser(): ?array` (renvoie les données de l'utilisateur connecté, ou `null`) ; `requireAdmin(): void` ; liens « Connexion », « Inscription », « Déconnexion », « Ajouter un album », « Ajouter un artiste » ; boutons « Modifier » et « Supprimer » du catalogue.
3. **Données d'entrée** : trois états : visiteur, `user@onzer.local`, `admin@onzer.local`.
4. **Méthode imposée** : `requireAdmin()` en tête des quatre pages, juste après `session_start()`, avec `redirect()` vers `login.php` pour tout visiteur non admin ; les vues lisent l'état par `currentUser()`, jamais `$_SESSION` directement ; `login.php` n'est jamais protégée.
5. **Résultat observable** (tableau des essais) :

   | État | Header | Catalogue | `create_album.php` |
   |---|---|---|---|
   | visiteur | Connexion, Inscription | sans Modifier/Supprimer | redirigé vers `login.php` |
   | user | « Ulysse Sateur », Déconnexion | sans Modifier/Supprimer | redirigé vers `login.php` |
   | admin | « Alain Ministration », Déconnexion, Ajouter un album, Ajouter un artiste | avec Modifier/Supprimer | formulaire affiché |
6. **Critère de validation** : les neuf cases du tableau observées, et `delete_album.php?id=1` ouvert en visiteur redirige sans rien supprimer.
- **Étapes d'action** (sans code) : (1) dans `core/functions.php`, écrivez `currentUser()` puis `requireAdmin()` ; (2) protégez `create_album.php` et vérifiez sa colonne du tableau dans les trois états ; (3) protégez les trois autres pages (contrat seul : même geste) ; (4) dans `views/header.php`, affichez les liens selon l'état ; (5) dans `views/view_list_albums.php`, réservez Modifier et Supprimer à l'admin ; (6) remplissez le tableau des essais.
- **Notions pratiquées** : N4, N5.

#### E5 — Messages flash en session — fil rouge — 25 min
1. **Fichiers cibles** : `core/functions.php`, `views/header.php`, `list_albums.php`, `play_track.php` (qui lisent `status` depuis le TP6), `create_artist.php`, `create_album.php`, `update_album.php`, `delete_album.php`, `create_user.php`.
2. **Noms exacts** : `setFlash(string $message): void`, `takeFlash(): ?string` ; clé `$_SESSION['flash']` ; `statusMessage()` et le paramètre `status` des URL supprimés.
3. **Données d'entrée** : les messages de la liste fixe de `statusMessage()` (TP6, verbatim) : « Artiste ajouté. », « Album ajouté. », « Album modifié. », « Album supprimé. » ; pour l'inscription : « Compte créé pour <prénom> <nom>. » (message du TP4, repris en flash).
4. **Méthode imposée** : `setFlash()` juste avant chaque `redirect()` de succès ; `takeFlash()` appelée une seule fois, dans `header.php` ; `unset` dans `takeFlash()`.
5. **Résultat observable** (pages d'arrivée des redirections du TP6, inchangées) :

   | Action | Page d'arrivée | Message, une seule fois |
   |---|---|---|
   | création de l'artiste `Lune Noire` | `list_albums.php` | Artiste ajouté. |
   | création de l'album `Eclipses` | `play_track.php` (lecteur d'Eclipses) | Album ajouté. |
   | modification de Beta en `Beta 2` | `play_track.php` (lecteur de Beta 2) | Album modifié. |
   | suppression de Beta 2 | `list_albums.php` | Album supprimé. |
   | inscription de Camille Dupont | `login.php` | Compte créé pour Camille Dupont. |

   Aucune URL d'arrivée ne contient `?status=` ; un rechargement de la page d'arrivée fait disparaître le message.
6. **Critère de validation** : aucune occurrence de `status=` ni de `statusMessage` dans le projet, et chaque message n'apparaît qu'une fois.
- **Étapes d'action** (sans code) : (1) dans `core/functions.php`, écrivez `setFlash()` et `takeFlash()` ; (2) dans `views/header.php`, affichez le message de `takeFlash()` à la place de `$flash` ; (3) dans `create_artist.php`, remplacez le `status` de la redirection par un message flash, puis vérifiez la première ligne du tableau ; (4) faites de même dans les autres actions (contrat seul : même geste) ; (5) retirez la lecture de `status` de `list_albums.php` et `play_track.php`, puis `statusMessage()` ; (6) déroulez le tableau.
- **Notions pratiquées** : N6.

#### B1 — Retour à la page demandée après connexion — bonus — 20 min
1. **Fichiers cibles** : `core/functions.php` (`requireAdmin`), `login.php`.
2. **Noms exacts** : `$_SESSION['redirect_after_login']`.
3. **Données d'entrée** : visiteur qui ouvre `update_album.php?id=2`, puis se connecte en admin.
4. **Méthode imposée** : l'adresse demandée (chemin et paramètres) se lit dans `$_SERVER['REQUEST_URI']` (donnée fournie, non enseignée) ; `requireAdmin()` la mémorise dans `$_SESSION['redirect_after_login']` ; après connexion, l'utilisateur arrive sur cette adresse, une seule fois.
5. **Résultat observable** : après connexion, le formulaire de modification de l'album 2 s'affiche ; une connexion directe mène au catalogue.
6. **Critère de validation** : les deux parcours observés.
- **Notions pratiquées** : N1, N4, N6 (`unset`).

**Total tronc commun** : 30 + 20 + 35 + 35 + 25 = 145 min, soit 91 % du budget (plage 80–100 %).
**Bonus** (hors budget) : 20 min.

## Relectures du plan
### Cycle 1, plan v1 (2026-10-28)
- **Rapports** : cohérence ✔ (un ✘ sur le contenu du plan : N5, N6, préfixe PDO de N2) ; contrat ✔

| # | Repère | Gravité | Agent | Problème | Décision | Changement fait (v2) |
|---|---|---|---|---|---|---|
| 1 | N5 | MAJEUR | cohérence | pas d'erreur fréquente montrée | retenue | callout : lien masqué, page ouverte (sortie exécutée) |
| 2 | N6 | MAJEUR | cohérence | erreur sans sortie observée | retenue | callout : message réaffiché au rechargement (sortie exécutée) |
| 3 | N2 | MAJEUR | cohérence | préfixe PDO non exécuté | retenue | seul le message psql exécuté est montré |
| 4 | E1, E3, E4, B1 | MAJEUR | cohérence, contrat (fusion) | méthodes qui donnent la solution (`php -r` littéral, ordre des instructions de déconnexion, « ajoutez exit », corps de `currentUser`, séquence de B1) | retenue (règle « jamais de solution ») | contrats réécrits en comportement attendu |
| 5 | E2, E5 | MAJEUR | contrat | messages verbatim absents (mot de passe valide, adresse déjà utilisée, statusMessage, succès d'album) | retenue | chaînes recopiées des exports prod du TP4 (v295) et du TP6 (v35) ; E5 cible aussi `list_albums.php` et `play_track.php` |
| 6 | E3 | MAJEUR | contrat | critère reporté sur E4 | retenue | critère observable dès E3 |
| 7 | N6, E5 | MINEUR | cohérence | signatures `setFlash`/`takeFlash` du cours identiques à E5 | retenue | N6 sans fonctions nommées |
| 8 | N2 | MINEUR | cohérence | `strlen` non enseigné | retenue | ligne retirée |
| 9 | B1 | MINEUR / MAJEUR | cohérence (nommer `REQUEST_URI`) contre contrat (le retirer) | conflit tranché par l'orchestrateur : donnée fournie, séquence retirée | retenue | B1 réécrit |
| 10 | slides | MINEUR | cohérence | budget lu comme doublé | retenue | phrase ajoutée |
| 11 | N6, B1 | MINEUR | cohérence | `unset` hors brief | notée pour le curriculum de la clôture | — |

### Cycle 2, plan v2 (2026-10-28)
- **Rapports** : cohérence ✔ (un ✘ : E5) ; contrat ✔. Seconde passe, repères modifiés seuls.

| # | Repère | Gravité | Agent | Problème | Décision | Changement fait (v3) |
|---|---|---|---|---|---|---|
| 1 | E5 | MAJEUR | cohérence, contrat (fusion) | deux pages d'affichage pour « Album ajouté. » | retenue | tableau action → page d'arrivée → message (pages du TP6) |
| 2 | E1–E5 | MAJEUR | cohérence ; contrat (note) | guidage annoncé par l'introduction mais absent des exercices | retenue | rubrique « Étapes d'action » sans code dans E1 à E5 |
| 3 | E3, E4 | MINEUR | cohérence | méthode encore proche de la solution | retenue | « Méthode imposée » allégée |
| 4 | B1 | trace | contrat | `$_SERVER['REQUEST_URI']` nommé | déjà arbitré au cycle 1 (donnée fournie) | — |

Limite de deux cycles atteinte : les changements de la v3 n'ont pas été relus par les agents (présentés à l'utilisateur).

#### Désaccords
| # | Repère | Remarque du relecteur | Réponse de l'orchestrateur | Recommandation | Tranché par l'utilisateur |
|---|---|---|---|---|---|
| 1 | E1–E5 | contrat : lecture stricte du verdict 6ac67a63 (premier exercice de chaque geste nouveau guidé) | le v1 ne guidait que E1 | lecture stricte, étapes d'action sans code | lecture stricte (2026-10-28) |

#### Remarques écartées
| # | Repère | Agent | Remarque (une ligne) | Règle ou raison de l'écart |
|---|---|---|---|---|
| 1 | E3 | cohérence | `index.php` n'existerait pas | il existe : état du fil rouge relevé par le collecteur (« index.php, accueil sans menu ») |
| 2 | E1 | cohérence | `schema.sql` contredit le brief | écart déjà tracé dans la fiche ; à reconfirmer quand le dépôt répond |

## Rédaction
### Cours
- **Brouillon** : docs/plans/php/brouillons/7-sessions-et-authentification/cours.json (85 blocs, 23 Ko au premier jet)
- **Rédacteur** : rendu le 2026-10-28 ; correction hors cycle terminée le 2026-10-30 (code aligné sur les cours 5 et 6, `self::getPdo()` ; clé `$_SESSION['author']['id']`). Écarts acceptés : blocs ajoutés en Recettes, pas de code fautif inventé pour n4-erreur-2, n5-erreur, n6-erreur, sorties mises en forme, langage `text`.
- **Écarts tranchés** (plan v4, 2026-10-30) : `findByEmail` et noms de fichiers gardés ; n6-exemple-liste garde `if isset` / `echo` / `unset` (sortie vérifiée).
- **Cycle 1** (2026-10-30) : style ✔ (52 blocs sur 52, 2 MINEURS), cohérence ✔ (85 blocs, 0 BLOQUANT, 0 MAJEUR, 8 MINEURS) ; étudiant fragile en attente de Docker.
| # | id | Gravité | Agent | Problème | Décision |
|---|---|---|---|---|---|
| 1 | n2-erreur, n2-erreur-2, n3-erreur, n4-erreur-2, n5-erreur, n6-erreur | MINEUR | style | majuscule après « Attention : » | en attente |
| 2 | n2-erreur-suite, n5-erreur-suite, n6-erreur-suite | MINEUR | style | trois attaques « Aucun message » | en attente |
| 3 | n6-exemple, n6-exemple-liste, n6-erreur-texte | MINEUR | cohérence | `save_recipe.php`, `list_recipes.php` absents du cours 6 | à trancher |
| 4 | n4-variante, n5-variante, n5-erreur-message | MINEUR | cohérence | `edit_recipe.php`, `recipe.php` hors convention du cours 6 | à trancher |
| 5 | n3-exemple-repository, n3-exemple-texte | MINEUR | cohérence | `findByEmail` et la convention `findOneBy...` | à trancher |
| 6 | n4-exemple-texte | MINEUR | cohérence | renseignement de `author_id` non dit | en attente |
| 7 | n1-probleme | MINEUR | cohérence | « sans état » attribué au cours 1, qui ne le dit pas | en attente |
| 8 | n1-exemple, n6-exemple-liste | MINEUR | cohérence | affichage sans `htmlspecialchars`, `\n` dans un navigateur | en attente |
| 9 | n5-exemple, n5-probleme | MINEUR | cohérence | `session_start()` non rappelé pour le header | en attente |
| 10 | n6-probleme | MINEUR | cohérence | `unset()` hors brief | note pour le curriculum |
- **Fragile** (2026-10-30, 12 exemples exécutés sur 13, 5 variantes sur 5, bilan 6 sur 6, 14 min de lecture ; bac à sable supprimé : `conteneurs : []`, `dossier présent : False`) : 3 MAJEURS, 7 MINEURS.
| # | id | Gravité | Problème | Décision |
|---|---|---|---|---|
| 11 | n1-erreur-* | MAJEUR | « la session ne démarre pas » faux sur une page courte : sous `php -S`, `<h1>` puis `session_start()` donne 200 et un cookie, sans warning. Vérifié par l'orchestrateur : warning et session non démarrée dès qu'une sortie est réellement envoyée (20 Ko de HTML, ou `flush()`), avec `output_buffering` à 0 comme à 4096 ; le message du plan reste exact | retenue : amendement du plan (conditions de l'erreur) |
| 12 | n3-exemple-repository | MAJEUR | `Repository` non rappelé | retenue : rappel d'une ligne vers le cours 5 |
| 13 | n4-connexion | MAJEUR | ni `login.php` ni `logout.php` dans le cours | tranché le 2026-10-30 : pas de pages à recopier (condition de l'utilisateur) ; `password_verify` sur `delete_recipe.php`, plan v4 |
| 14 | n3-variante | MINEUR | fragment non signalé comme tel | retenue |
| 15 | n4-exemple-texte | MINEUR | cast de `author_id` non montré | retenue, avec la remarque 6 |
| 16 | n4-erreur-2 | MINEUR | erreur non reproductible sans code | écartée : `login.php`, s'il est ajouté, suffit à la décrire |
| 17 | n6-exemple | MINEUR | `redirect()` sans `require_once` | retenue |
| 18 | n1-probleme | MINEUR | cours cités par leur numéro | écartée : usage des cours 5 et 6 |
| 19 | n5-exemple | MINEUR | `session_start()` avant le header | fusionnée avec la remarque 9, retenue |

- **Cycle 2** (2026-10-30, 15 ids relus par la cohérence, 12 par le style, 8 blocs exécutés par le fragile ; bac à sable supprimé) : 0 BLOQUANT. Retenues : style n4-verif-suite (nommer les deux cas), n4-exemple-texte (couper en deux, retirer la répétition), n1-erreur-suite (notation) ; fragile : phrase « message produit par ce code en ligne de commande », `findById` à écrire comme `findByEmail` ; cohérence : « un paramètre de plus, après `$photoFile` », `delete_recipe.php` sur le modèle de `delete_ingredient.php` ; titres de callouts réalignés sur les cours 5 et 6 (majuscule après « Attention : », remarque 1 du cycle 1 annulée). Écartées : fragile, `Repository` non fourni (reste du projet de l'étudiant, artefact du bac à sable) ; fragile, squelette de connexion absent (voulu, condition de l'utilisateur du 2026-10-30). n3-variante face à E2 : tranché le 2026-10-30, réduite (plan v5).

- **Après le cycle 2** (2026-10-30, demandé par l'utilisateur) : `humaniseur-fr` passé sur les 6 derniers blocs, 2 MAJEURS levés, 3 MINEURS corrigés (`n1-erreur-suite`, `n4-exemple-texte` en liste, `n4-verif-texte`) ; ces 3 retouches ne sont pas relues.
- **Validé** : 2026-10-30 (« Oui, corrige et valide ») ; 95 blocs.

- **Prod** : `save_content` le 2026-10-30 après confirmation (« Oui, écris en prod »), contentId 6ae4c663e54feb2a7a7efa83, version 1, source `db`, `isAvailable` inchangé à `false`. Comparaison partielle : `get_content` revenu en ligne, version 1 et 6 sections racine conformes, `comparer` non lancé.

- **Prod, version 2** : `save_content` le 2026-10-30 après confirmation (« Oui, réécris en prod »), 110 blocs, deux parties ; version 1 vérifiée avant écriture. Comparaison partielle : arbre recomposé à la main pour l'envoi, `get_content` revenu en ligne et relu, `comparer` non lancé.

- **Prod, version 8** : surlignage retiré de 6 blocs par `edit_block` le 2026-10-30 après confirmation (« Applique en prod ») ; gardé sur `n2-variante`, `n4-verif-code`, `n4-exemple`, `n4-variante`, `n6-exemple`. Version déduite : une par `edit_block`, à confirmer avant la prochaine écriture.

### Slides
- **Brouillon** : docs/plans/php/brouillons/7-sessions-et-authentification/slides.json (36 blocs, 10 slides)
- **Cycle 1** (2026-10-30) : style ✔ (36 blocs, 3 MINEURS), cohérence ✔ (10 slides, 0 BLOQUANT, 0 MAJEUR, 3 MINEURS) ; 5 remarques appliquées, 1 notée pour le curriculum (`unset`). S10 replacée après S3 pour suivre le cours. Pas de cycle 2 prévu : aucune remarque BLOQUANTE ou MAJEURE.

## Matériau quiz
Rempli à la clôture (étape ultérieure du pipeline).
