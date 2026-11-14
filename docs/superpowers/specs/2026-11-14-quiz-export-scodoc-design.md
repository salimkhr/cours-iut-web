# Export des résultats du quiz live vers ScoDoc — design

Date : 2026-11-14 · Taille : petit changement

## Intention

Les notes d'un QCM passé en quiz live doivent aller dans ScoDoc sans ressaisie. ScoDoc fournit
une feuille de saisie `.xlsx` par évaluation (« Saisir par fichier tableur ») et l'accepte en
retour une fois remplie. L'enseignant dépose cette feuille sur la page Résultats du module et
récupère la même feuille, colonne E remplie.

Pour que chaque note retrouve sa ligne sans ambiguïté, un participant doit être un étudiant
identifiable : le compte générique de l'intranet ne peut plus rejoindre un quiz.

## Objectifs

- Bloquer l'accès au quiz (rejoindre une session) pour le compte générique ; l'admin lance et
  pilote comme aujourd'hui.
- Enregistrer l'e-mail du compte dans `quiz_participants` au moment du `join`.
- Sur `/admin/modules/[slug]/resultats`, une session précise étant sélectionnée : déposer la
  feuille ScoDoc, télécharger la feuille remplie.

## Non-objectifs

- Pas d'envoi direct à ScoDoc (pas d'API ScoDoc, pas d'identifiants stockés).
- Pas de rapprochement par nom ; pas de rattrapage des sessions antérieures sans e-mail.
- Pas de modification des colonnes autres que E.

## Contraintes

- Règle « compte générique » existante : e-mail se terminant par `@salimkhraimeche.dev`
  (`src/app/account/page.tsx`). Elle est extraite dans un helper partagé
  (`src/lib/genericAccount.ts`, `isGenericAccount(user)`), réutilisé par `/account` et le quiz.
- Admin seulement pour l'export (`canManageQuiz`), jamais exposé au MCP.
- Validation Zod du formulaire (sessionId, fichier `.xlsx`, taille plafonnée à 2 Mo).
- Nouvelle dépendance : `exceljs` (accord de l'utilisateur, 2026-11-14).

## Format de la feuille ScoDoc (observé sur l'évaluation 50721)

Une feuille, en-tête ligne 8 (`A8 = !<evaluation_id>`), une ligne par étudiant à partir de 9 :
A = `!<etudid>` (masquée), B = Nom, C = Prénom, D = Groupe, E = « Note sur 20 »,
F = Remarque, G = NIP (masquée), H = Email.

## Approches

1. Zip maison avec `zlib` + réécriture du XML : zéro dépendance, ~120 lignes fragiles.
2. `fflate` pour le zip + réécriture du XML de la colonne E : petite dépendance, XML à la main.
3. **`exceljs`** (retenue, choix de l'utilisateur) : lecture/écriture de cellules par API,
   colonnes masquées et styles préservés, aucun XML manipulé à la main.

## Comportement

- `join` : si `isGenericAccount(user)` et non admin → `QuizSessionError` 403 « Connectez-vous
  avec votre compte personnel pour participer ». Sinon le participant est créé avec `email`.
- Route `POST /api/quiz/results/scodoc` (multipart : `sessionId`, `file`) :
  - charge la session (doit appartenir à un module ; 404 sinon) et ses participants ;
  - parcourt les lignes ≥ 9 dont A commence par `!` ; clé = e-mail colonne H, comparé en
    minuscules, sans espaces ;
  - note = `round(score / scoreMax × 20 × 2) / 2` (demi-point) ; inscrit sans participation →
    `ABS` ; `scoreMax = 0` → 0 ;
  - renvoie le `.xlsx` (`Content-Disposition` reprenant le nom déposé) et, en en-tête JSON
    compact, le décompte : notes posées, ABS, participants sans ligne ScoDoc.
  - Fichier sans en-tête `!<id>` en A8 ou sans colonne H → 422 « Ce n'est pas une feuille de
    saisie ScoDoc ».
- UI (`QuizResultsTable`) : bouton « Remplir une feuille ScoDoc » visible quand une session est
  choisie (désactivé sur « Toutes ») ; après dépôt, téléchargement automatique et résumé
  (« 31 notes, 6 ABS, 0 participant non trouvé » + liste des non trouvés).

## Laissé au builder

Découpage du code (fonction pure `fillScodocSheet(buffer, participants)` testable sans route),
libellés exacts, composant shadcn pour le dépôt de fichier.

## Tests

- `fillScodocSheet` : note arrondie, ABS, e-mail en casse différente, participant sans ligne,
  feuille invalide.
- Route : refus non-admin (403), session inconnue (404), succès renvoie un xlsx relisible.
- `join` : compte générique refusé, admin accepté, e-mail enregistré.
- `/account` garde son comportement via le helper.
