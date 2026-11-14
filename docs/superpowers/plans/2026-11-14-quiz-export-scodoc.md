# Export quiz live → feuille ScoDoc — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** déposer la feuille de saisie ScoDoc d'une évaluation sur la page Résultats d'un module et la récupérer remplie avec les notes d'une session de quiz live ; le compte générique ne peut plus rejoindre un quiz.

**Architecture :** une fonction pure `fillScodocSheet` (exceljs) remplit la colonne E à partir d'entrées `{email, score, scoreMax}` ; une route admin multipart l'appelle avec les participants de la session ; l'e-mail est enregistré dans `quiz_participants` au `join`. Le blocage du compte générique réutilise la règle de `/account`, extraite dans un helper.

**Tech Stack :** Next.js 16 Route Handlers, MongoDB natif, Zod, `exceljs`, `bun:test` + `mongodb-memory-server`, shadcn/ui.

**Spec :** `docs/superpowers/specs/2026-11-14-quiz-export-scodoc-design.md`

## Global Constraints

- Compte générique = e-mail se terminant par `@salimkhraimeche.dev` (insensible à la casse).
- Rejoindre un quiz : refusé au compte générique sauf `canManageQuiz` (admin). Message : « Connectez-vous avec votre compte personnel pour participer ».
- Note = `Math.round(score / scoreMax * 20 * 2) / 2` ; `scoreMax === 0` → `0` ; inscrit sans participation → chaîne `"ABS"`.
- Lignes étudiants : à partir de la ligne 9, colonne A commençant par `!` ; e-mail en H ; note écrite en E (nombre, pas chaîne) ; aucune autre colonne modifiée.
- Feuille valide seulement si `A8` commence par `!` et `H8 === "Email"` ; sinon erreur 422 « Ce n'est pas une feuille de saisie ScoDoc ».
- Fichier : `.xlsx`, ≤ 2 Mo.
- Export réservé à `canManageQuiz`, jamais exposé au MCP.
- Dépendance ajoutée : `exceljs` (accord utilisateur du 2026-11-14), une seule.
- Indentation 4 espaces, imports `@/*`, pas d'`any`.

## Review Focus

1. Cellule e-mail lue par exceljs comme objet lien `{text, hyperlink}` ou rich text, pas comme chaîne → doit quand même matcher (test dans Task 3).
2. E-mail en casse ou espaces différents entre l'app et ScoDoc → doit matcher (Task 3).
3. Fichier qui n'est pas un xlsx (PDF renommé, csv) → 422 propre, pas 500 (Task 4).
4. Même e-mail présent deux fois parmi les participants (deux sessions fusionnées par erreur) → impossible car l'export filtre une seule `sessionId` ; la route refuse l'absence de `sessionId` (Task 4).
5. Participant d'avant cette évolution (sans `email`) → compté « sans ligne ScoDoc », pas d'erreur (Task 3).

---

### Task 1 : helper compte générique

**Files :**
- Create : `src/lib/genericAccount.ts`
- Create : `src/lib/genericAccount.test.ts`
- Modify : `src/app/account/page.tsx:17`

**Interfaces :**
- Produces : `isGenericAccount(user: {email?: string | null}): boolean`

- [ ] **Step 1 : test qui échoue** — `genericAccount.test.ts` :
  - `isGenericAccount({email: "cours@salimkhraimeche.dev"})` → `true`
  - `isGenericAccount({email: "Cours@SalimKhraimeche.DEV"})` → `true`
  - `isGenericAccount({email: "aa251867@etu.univ-lehavre.fr"})` → `false`
  - `isGenericAccount({email: null})` → `false`
- [ ] **Step 2 :** `bun test src/lib/genericAccount` → FAIL (module absent).
- [ ] **Step 3 :** implémenter (constante `GENERIC_ACCOUNT_DOMAIN = "@salimkhraimeche.dev"`), remplacer le test en dur de `account/page.tsx` par `isGenericAccount(session.user)`.
- [ ] **Step 4 :** `bun test src/lib/genericAccount` → PASS.
- [ ] **Step 5 :** commit `feat(auth): extraire la règle du compte générique`.

### Task 2 : e-mail au join, compte générique refusé

**Files :**
- Modify : `src/lib/quiz/LiveQuizService.ts` (`Identity`, `join`)
- Modify : `src/lib/quiz/quizTypes.ts` (`QuizParticipant`)
- Modify : `src/lib/quiz/liveQuizServer.ts` (`SessionUser`, `identityFromUser`)
- Modify : `src/app/api/quiz/join/route.ts`
- Test : `src/lib/quiz/LiveQuizService.test.ts`, `src/lib/quiz/liveQuizServer.test.ts`, `tests/api/quiz-join.test.ts` (nouveau)

**Interfaces :**
- Consumes : `isGenericAccount` (Task 1), `canManageQuiz`.
- Produces : `Identity.email: string | null` ; `QuizParticipant.email?: string | null` (optionnel : anciens documents) ; `SessionUser.email?: string | null`.

- [ ] **Step 1 : tests qui échouent**
  - `LiveQuizService.test.ts` : après `join(sessionId, {...identity, email: "a@etu.test"})`, le document `quiz_participants` a `email === "a@etu.test"`.
  - `liveQuizServer.test.ts` : `identityFromUser({id: "u", name: "Ana Lopez", email: "ana@etu.test"}).email === "ana@etu.test"`.
  - `tests/api/quiz-join.test.ts` (mocks `@/lib/mongodb` et `@/lib/auth` avant import, cf. AGENTS.md) : session user `{role: "user", email: "cours@salimkhraimeche.dev"}` → `POST` renvoie 403 et `error === "Connectez-vous avec votre compte personnel pour participer"` ; même e-mail avec `role: "admin"` → pas 403 (404 sur code inconnu suffit) ; étudiant normal → pas 403.
- [ ] **Step 2 :** `bun test src/lib/quiz tests/api/quiz-join` → FAIL.
- [ ] **Step 3 :** implémenter. Le refus vit dans la route, après `authenticate()` : `if (isGenericAccount(auth.user) && !auth.manager) return 403 {error, code: "generic_account"}`. `join` recopie `identity.email` dans le participant.
- [ ] **Step 4 :** `bun test src/lib/quiz tests/api/quiz-join` → PASS ; `bunx tsc --noEmit` propre (les appels existants à `join` dans les tests reçoivent `email`).
- [ ] **Step 5 :** commit `feat(quiz): refuser le compte générique et enregistrer l'e-mail des participants`.

### Task 3 : `fillScodocSheet` (exceljs)

**Files :**
- Modify : `package.json`, `bun.lock` (`bun add exceljs`)
- Create : `src/lib/quiz/scodocSheet.ts`
- Create : `src/lib/quiz/scodocSheet.test.ts`

**Interfaces :**
- Produces :
  ```ts
  export interface ScodocEntry {email: string | null; firstName: string; lastName: string; score: number; scoreMax: number}
  export interface ScodocReport {filled: number; absent: number; unmatched: {firstName: string; lastName: string}[]}
  export class ScodocSheetError extends Error {}           // feuille invalide
  export function scodocNote(score: number, scoreMax: number): number
  export async function fillScodocSheet(input: ArrayBuffer, entries: ScodocEntry[]): Promise<{buffer: Buffer; report: ScodocReport}>
  ```

- [ ] **Step 1 : tests qui échouent** — le test construit la feuille avec exceljs (helper local `buildSheet(rows)` qui reproduit l'en-tête : `A8 "!50721"`, `B8..H8 = Nom, Prénom, Groupe, Note sur 20, Remarque, NIP, Email`) :
  - `scodocNote(7, 10) === 14`, `scodocNote(8.3, 12) === 14` (13,83 → 14), `scodocNote(13, 20) === 13`, `scodocNote(1.3, 2) === 13`, `scodocNote(5, 0) === 0`.
  - deux étudiants, un participant → E9 = `14` (type number), E10 = `"ABS"` ; `report = {filled: 1, absent: 1, unmatched: []}`.
  - H9 en objet lien `{text: "AA@Etu.test ", hyperlink: "mailto:aa@etu.test"}`, participant `aa@etu.test` → match.
  - participant sans `email` et participant à e-mail absent de la feuille → `report.unmatched` contient les deux noms.
  - colonnes A, G masquées et valeur de F9 inchangées après relecture du buffer.
  - feuille sans `!` en A8 → rejette `ScodocSheetError` ; buffer non-xlsx (`new TextEncoder().encode("hello")`) → rejette `ScodocSheetError`.
- [ ] **Step 2 :** `bun test src/lib/quiz/scodocSheet` → FAIL.
- [ ] **Step 3 :** implémenter. Première feuille du classeur ; valeur texte d'une cellule = `cell.text` (gère lien et rich text), puis `trim().toLowerCase()` pour l'e-mail ; toute exception de `workbook.xlsx.load` est convertie en `ScodocSheetError`.
- [ ] **Step 4 :** `bun test src/lib/quiz/scodocSheet` → PASS.
- [ ] **Step 5 :** commit `feat(quiz): remplir une feuille de saisie ScoDoc`.

### Task 4 : route `POST /api/quiz/results/scodoc`

**Files :**
- Modify : `src/lib/quiz/QuizResultsRepository.ts`
- Create : `src/app/api/quiz/results/scodoc/route.ts`
- Test : `tests/api/quiz-results-scodoc.test.ts`

**Interfaces :**
- Consumes : `fillScodocSheet`, `ScodocSheetError` (Task 3), `authenticate({manager: true})`, `totalPossible`.
- Produces :
  - `QuizResultsRepository.scodocEntries(sessionId: string): Promise<ScodocEntry[] | null>` (`null` si session inconnue ; `scoreMax = totalPossible(session)`).
  - Réponse 200 : corps xlsx, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="<nom déposé>"`, en-tête `X-Scodoc-Report` = `encodeURIComponent(JSON.stringify(report))`.

- [ ] **Step 1 : tests qui échouent** (base mémoire, session + participants insérés à la main) :
  - non-admin → 403.
  - formulaire sans `sessionId` ou sans fichier → 400.
  - fichier > 2 Mo → 413 ; fichier « hello » nommé `x.xlsx` → 422 « Ce n'est pas une feuille de saisie ScoDoc ».
  - `sessionId` inconnu → 404.
  - succès : 200, le corps relu par exceljs a la note attendue en E9, `X-Scodoc-Report` décodé vaut `{filled: 1, absent: 1, unmatched: []}`.
- [ ] **Step 2 :** `bun test tests/api/quiz-results-scodoc` → FAIL.
- [ ] **Step 3 :** implémenter. `req.formData()`, schéma Zod `{sessionId: z.string().min(1), file: z.instanceof(File)}`, contrôle de taille avant `arrayBuffer()`.
- [ ] **Step 4 :** `bun test tests/api/quiz-results-scodoc src/lib/quiz` → PASS.
- [ ] **Step 5 :** commit `feat(quiz): route d'export des notes vers la feuille ScoDoc`.

### Task 5 : bouton dans la page Résultats

**Files :**
- Create : `src/components/quiz/admin/ScodocExportButton.tsx`
- Modify : `src/components/quiz/admin/QuizResultsTable.tsx` (barre de filtres)
- Test : `src/components/quiz/admin/ScodocExportButton.test.tsx`

**Interfaces :**
- Consumes : la route de Task 4.
- Produces : `ScodocExportButton({sessionId}: {sessionId: string | null})`.

- [ ] **Step 1 : test qui échoue** (`renderToStaticMarkup`) : avec `sessionId={null}` le bouton « Remplir une feuille ScoDoc » est `disabled` et l'aide « Choisissez une session » est présente ; avec un id il est actif.
- [ ] **Step 2 :** `bun test src/components/quiz/admin/ScodocExportButton` → FAIL.
- [ ] **Step 3 :** implémenter avec `Button` shadcn + `<input type="file" accept=".xlsx" hidden>` ; envoi `FormData` par `fetch` (pas `api()`, qui force du JSON) ; succès → téléchargement du blob sous le nom d'origine et résumé « N notes, M ABS » + liste des participants sans ligne ; échec → `role="alert"` avec `error` du JSON. Monté dans `QuizResultsTable` avec `sessionId === ALL ? null : sessionId`.
- [ ] **Step 4 :** `bun test src/components/quiz/admin` → PASS ; `bun run lint` et `bunx tsc --noEmit` propres.
- [ ] **Step 5 : vérification navigateur** — `bun dev`, page `/admin/modules/<slug>/resultats` d'un module avec une session locale (comptes de `tests/fixtures/quiz-test-users.ts`), déposer une feuille construite avec leurs e-mails : le fichier téléchargé a les notes ; compte générique local refusé au `join`.
- [ ] **Step 6 :** commit `feat(quiz): déposer et récupérer la feuille ScoDoc depuis les résultats`.

### Fin

- [ ] `bun test`, `bun run build` (package.json modifié), `detect_changes` GitNexus avant le dernier commit.
