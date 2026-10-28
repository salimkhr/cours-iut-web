# Sessions et authentification (`php/7-sessions-et-authentification`)

## Statut
- **Mode** : conception
- **Phase** : plan
- **Étape en cours** : plan : rédaction
- **Mis à jour le** : 2026-10-28
- **Validé** : fiche de conception le 2026-10-28
- **Désaccords en attente** : aucun
- **Prochaine action** : rédaction du plan, puis relecture par cohérence et contrat.

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
