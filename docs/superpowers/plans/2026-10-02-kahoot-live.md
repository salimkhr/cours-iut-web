# Quiz live par module — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec :** `docs/superpowers/specs/2026-10-02-kahoot-live-design.md` (branche `kahoot`).

**Goal :** Un quiz unique par module, édité depuis l'admin ou le MCP, joué en live (QR code → téléphone, projection, chronomètre, podium) avec relevé durable des réponses et des notes.

**Architecture :** La logique métier sort dans des modules purs testables (`quizScoring`, `quizPodium`, `quizMachine`, `quizPublicState`) ; MongoDB porte la vérité (instantané de quiz, sessions, participants, réponses) ; un `LiveQuizRegistry` (calqué sur `LiveSessionRegistry`) diffuse l'état par SSE avec une vue différente selon le destinataire. Les routes, le MCP et l'admin n'appellent que `QuizService` / `LiveQuizService`.

**Tech Stack :** Next.js 16.3 (App Router, Route Handlers, SSE), React 19.2, TypeScript 6.0.3 strict, Zod 4.4, MongoDB driver 7.5 (`bson` 7.2.0 épinglé), better-auth, `bun test`, `mongodb-memory-server`, Playwright.

## Global Constraints

- **Indentation 4 espaces.** Imports via `@/*`. Function components uniquement. Pas d'`any`, pas de `@ts-ignore` sans `// reason: ...`.
- **Commentaires et libellés en français**, apostrophes typographiques dans les libellés UI.
- **Lire `node_modules/next/dist/docs/` avant d'écrire une route ou un composant serveur** (Next 16 : `params` est une `Promise`, le fichier s'appelle `proxy.ts`).
- **Tests** : `bun test`, colocalisés `*.test.ts`. Pas de `@testing-library` : composants testés par `renderToStaticMarkup`. Les tests DB utilisent `mongodb-memory-server`.
- **`ObjectId` → `string`** avant tout renvoi client. Jamais de `_id` brut.
- **Aucun appel DB au chargement d'un module** (casserait `next build`, cf. CLAUDE.md §6). Les collections sont obtenues dans les fonctions.
- **Nouveaux index uniquement dans `src/lib/db/indexes.ts`**, appliqués par `bun run create-indexes`.
- **Ne pas toucher `src/components/ui/` ni `src/components/Cards/`** ; les réutiliser. Vérifier leur existence avant d'inventer un composant.
- **Skill `ui-ux-pro-max` obligatoire avant** les tâches 11, 12, 13 (UI) ; lire `PRODUCT.md` et `DESIGN.md`, tokens uniquement, pas de palette Kahoot.
- **Avant toute modification d'un symbole existant** : `impact` GitNexus (upstream) ; avant commit : `detect_changes`.
- **Pas de `--no-verify`.** Après modification de `package.json` : `bunx next build`.
- **Écarts à la spec à trancher/acter** :
  1. Seul le rôle `admin` existe aujourd'hui (`withAdmin`). « Enseignant autorisé » = `admin` pour ce premier incrément ; l'accès passe par un unique helper `canManageQuiz(session)` pour pouvoir l'élargir sans toucher aux routes.
  2. Aucune lib QR n'est installée : ajout de `qrcode` (rendu SVG côté serveur/`toString`), à valider par `bunx next build`.
  3. Instance unique : le registre SSE vit en mémoire ; la restauration après redémarrage se fait depuis MongoDB (spec §6.1, §12).

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `src/lib/quiz/quizTypes.ts` *(créer)* | Types `Quiz`, `QuizQuestion`, `QuizSession`, `QuizParticipant`, `QuizAnswer`, états publics. |
| `src/lib/schemas/quiz.schema.ts` *(+ `.test.ts`)* | Schémas Zod : question, quiz, filtrage des blocs autorisés. |
| `src/lib/quiz/quizScoring.ts` *(+ test)* | Barème pur (§5). |
| `src/lib/quiz/quizPodium.ts` *(+ test)* | Tri podium, format `Prénom N.`. |
| `src/lib/quiz/quizMachine.ts` *(+ test)* | Transitions `lobby → question_open → reveal → … → finished`, échéances. |
| `src/lib/quiz/quizPublicState.ts` *(+ test)* | Projection de l'état selon le destinataire (étudiant / projection). |
| `src/lib/quiz/permissions.ts` | `canManageQuiz`, helpers de session. |
| `src/lib/quiz/QuizRepository.ts` / `QuizService.ts` *(+ tests)* | CRUD du quiz unique par module. |
| `src/lib/quiz/QuizResultsRepository.ts` *(+ test)* | Participants, réponses, agrégats du tableau. |
| `src/lib/quiz/LiveQuizRegistry.ts` *(+ test)* | Canaux SSE par session, diffusion par rôle. |
| `src/lib/quiz/LiveQuizService.ts` *(+ test)* | Création de session, transitions, réponses, restauration. |
| `src/lib/db/indexes.ts` *(modifier)* | Index des 4 collections. |
| `src/app/api/admin/modules/[moduleSlug]/quiz/…` | Routes admin du quiz. |
| `src/app/api/quiz/…` | Routes session : création, pilotage, rejoindre, répondre, flux SSE, résultats. |
| `src/app/api/mcp/route.ts` *(modifier)* | 7 outils quiz. |
| `src/components/quiz/admin/*` | Éditeur de quiz, tableau de résultats. |
| `src/components/quiz/projection/*` | Écran projeté. |
| `src/components/quiz/play/*` | Interface téléphone. |
| `src/app/quiz/[code]/page.tsx` | Page de participation (étudiant). |
| `src/app/quiz/live/[sessionId]/page.tsx` | Page de projection (enseignant). |

**Jalons livrables :**
- **J1 — Quiz éditable** (tâches 1 à 6, 9 : modèle, barème, service, admin, MCP).
- **J2 — Jouable** (tâches 7, 8, 10 à 13 : session live complète).
- **J3 — Relevé et finition** (tâches 14 à 16).

---

### Task 1: Types et schémas Zod du quiz

**Files:**
- Create: `src/lib/quiz/quizTypes.ts`, `src/lib/schemas/quiz.schema.ts`
- Test: `src/lib/schemas/quiz.schema.test.ts`

**Interfaces:**
- Produces: `quizSchema`, `quizQuestionSchema`, `QUIZ_ALLOWED_BLOCK_TYPES`, `validateQuestionBlocks(blocks)`.

Règles (spec §3.2) : ≥ 2 propositions texte non vides et distinctes ; ≥ 1 correcte et ≥ 1 incorrecte ; `weight > 0` (défaut 1) ; `durationSeconds` entier 5–300 (défaut 30) ; blocs limités à `text`, `heading`, `list`, `list-item`, `table`, `code`, `image-card`, `diagram-card`, `callout` (vérifier les types réels dans `blockDefs.ts`) ; blocs interactifs, `section`, `columns` et tout bloc quiz refusés, récursivement via `children`. Erreurs localisées (chemin `questions.2.options`).

- [ ] **Step 1:** Écrire les tests : question valide, <2 propositions, aucune correcte, aucune incorrecte, doublons, poids 0/négatif, durée 4 et 301, bloc interdit imbriqué, quiz sans question accepté (brouillon) mais `negativeMarking` booléen requis.
- [ ] **Step 2:** `bun test src/lib/schemas/quiz.schema.test.ts` → échec attendu.
- [ ] **Step 3:** Implémenter types + schémas (réutiliser le schéma `Block[]` existant de `blockSchemas.ts`, ne pas le dupliquer).
- [ ] **Step 4:** Test vert, `bunx tsc --noEmit`.
- [ ] **Step 5:** Commit `feat(quiz): schémas du quiz de module`.

---

### Task 2: Barème (`quizScoring`)

**Files:** Create `src/lib/quiz/quizScoring.ts` + `.test.ts`.

**Interfaces:** `scoreQuestion({weight, correctIds, incorrectIds, selectedIds, negativeMarking}): number`.

```ts
// G = bonnes sélectionnées, B = mauvaises sélectionnées, C/I = totaux
// sans négatif : W × G / C ; avec : max(0, W × (G/C − B/I))
```

Ignorer silencieusement les ids inconnus **dans le calcul** mais ils sont refusés en amont (Task 8). Arrondir à 4 décimales pour éviter le bruit flottant.

- [ ] **Step 1:** Tests : tout juste = W ; 2/3 = 2W/3 ; aucune sélection = 0 ; négatif actif, 1 bonne + 1 mauvaise sur C=2, I=2 → 0 ; toutes les propositions = 0 avec négatif, = W sans ; plancher à 0 ; poids 2.5.
- [ ] **Step 2:** Échec → implémentation → vert.
- [ ] **Step 3:** Commit `feat(quiz): barème avec crédit partiel et points négatifs`.

---

### Task 3: Podium (`quizPodium`)

**Files:** Create `src/lib/quiz/quizPodium.ts` + `.test.ts`.

**Interfaces:** `rankParticipants(participants): Ranked[]` ; `formatPublicName(firstName, lastName): string` (`Prénom N.`, gère nom vide, accents, majuscule) ; `topOfPodium(ranked, n = 3)`.

Tri : note ↓, temps cumulé ↑ (seulement en cas d'égalité de note), puis ordre alphabétique `localeCompare('fr')` puis `userId` pour le déterminisme. Rangs ex æquo : même note **et** même temps → même rang.

- [ ] **Step 1:** Tests : note prime sur la vitesse (plus lent mais meilleure note passe devant) ; égalité de note → plus rapide devant ; égalité totale → alphabétique ; format du nom ; podium jamais plus de n entrées.
- [ ] **Step 2:** Échec → implémentation → vert.
- [ ] **Step 3:** Commit.

---

### Task 4: Machine à états et échéances (`quizMachine`)

**Files:** Create `src/lib/quiz/quizMachine.ts` + `.test.ts`.

**Interfaces:** `startQuiz(session, now)`, `openQuestion(session, now)`, `closeQuestion(session)`, `nextQuestion(session, now)`, `isOpenAt(session, now)`. Fonctions pures prenant l'horloge en paramètre. Transitions interdites → erreur typée `InvalidTransitionError`.

Règles : `lobby → question_open` (question 0) ; `question_open → reveal` automatique à `deadline` ou manuel ; `reveal → question_open` (index+1) ; `reveal` à la dernière question → `finished` ; `finished` terminal. `deadline = startedAt + durationSeconds × 1000` calculé serveur.

- [ ] **Step 1:** Tests de chaque transition valide/invalide, dépassement d'index, `isOpenAt` aux bornes (`deadline` exclu).
- [ ] **Step 2:** Échec → implémentation → vert.
- [ ] **Step 3:** Commit.

---

### Task 5: Persistance du quiz, index, `QuizService`

**Files:**
- Create: `src/lib/quiz/QuizRepository.ts`, `QuizService.ts`, `permissions.ts` + tests
- Modify: `src/lib/db/indexes.ts`

- [ ] **Step 1:** Index : `module_quizzes.moduleId` unique ; `quiz_sessions.joinCode` unique + TTL sur `expiresAt` ; `quiz_participants.{sessionId,userId}` unique ; `quiz_answers.{sessionId,questionId,userId}` unique ; `quiz_answers.sessionId`. Compléter le test d'`ensureIndexes` s'il existe.
- [ ] **Step 2:** Tests d'intégration (`mongodb-memory-server`) : création, second quiz du même module refusé (`QuizAlreadyExistsError`), édition de config, ajout/modification/suppression/réordonnancement de question (ids stables, `position` recalculée), validation Zod à chaque écriture, `updatedAt` mis à jour.
- [ ] **Step 3:** Implémenter. `QuizService` est **le seul** point d'écriture ; il valide, appelle le repository, convertit les `ObjectId` en `string`. Gestion de concurrence : `findOneAndUpdate` avec `updatedAt` attendu ou opérations ciblées par `questions.id`.
- [ ] **Step 4:** `canManageQuiz(session)` (admin) + test.
- [ ] **Step 5:** `bun run create-indexes` en local, commit.

---

### Task 6: Routes admin du quiz

**Files:** Create `src/app/api/admin/modules/[moduleSlug]/quiz/route.ts` (GET, POST, PATCH config) et `.../quiz/questions/route.ts`, `.../questions/[questionId]/route.ts`, `.../questions/reorder/route.ts`.

- [ ] **Step 1:** Lire les routes admin existantes (`src/app/api/admin/modules`) et `withAdmin` pour le style. Ajouter `withAdmin` à tous les handlers.
- [ ] **Step 2:** Tests de routes dans le style de `2026-05-24-api-tests` : 403 sans admin, 404 module inconnu, 409 quiz existant, 422 avec erreurs Zod localisées (`{path, message}`).
- [ ] **Step 3:** Implémenter en déléguant à `QuizService`. Le `moduleSlug` est résolu en `moduleId` via le module existant.
- [ ] **Step 4:** Commit.

---

### Task 7: `LiveQuizRegistry` et état public par destinataire

**Files:** Create `src/lib/quiz/quizPublicState.ts`, `LiveQuizRegistry.ts` + tests.

- [ ] **Step 1:** `quizPublicState` : `toStudentState(session, participant, answer?)` et `toProjectionState(session, ranking, answersCount)`. Invariants testés : **aucun** `isCorrect` / `correctIds` avant `reveal` dans l'état étudiant ni projection ; la projection ne contient jamais d'identité de réponse, seulement compteurs et podium (3 max, `Prénom N.`) ; `reveal` étudiant = correction + points question + score cumulé + rang personnel.
- [ ] **Step 2:** `LiveQuizRegistry` : `subscribe(sessionId, audience, onState, onEnd)` avec `audience: 'projection' | { userId }`, `publish(sessionId, buildState)`, heartbeats. Calquer `LiveSessionRegistry` (émetteur par session, `setMaxListeners(0)`), mais la diffusion calcule l'état **par abonné**. Test : deux abonnés d'audience différente reçoivent des payloads différents ; désabonnement propre.
- [ ] **Step 3:** Commit.

---

### Task 8: `LiveQuizService` et `QuizResultsRepository`

**Files:** Create `src/lib/quiz/LiveQuizService.ts`, `QuizResultsRepository.ts` + tests d'intégration.

- [ ] **Step 1:** Tests :
  - `createSession(moduleId, teacher)` copie le quiz en **instantané** ; modifier le quiz après n'altère pas la session ; code `crypto.randomBytes` (QR : jeton long ; code court de secours dérivé distinct, unique) ; `expiresAt`.
  - `join(code, user)` : idempotent, enregistre nom, groupe (`user.group`) et date ; refus si session `finished`/expirée.
  - `submitAnswer` : refuse ids inconnus (422), refuse après `deadline` (horloge serveur injectée), idempotent sur double envoi (renvoie la réponse existante, ne réécrit pas), calcule `scoreObtained`/`scoreMax`/`timeMs` côté serveur, met à jour le total du participant de façon atomique (`$inc`).
  - `closeQuestion` (appelé par le timer **et** par l'enseignant) : attribue le temps plein et score 0 aux absents, passe en `reveal`, idempotent.
  - `next()`, `finish`.
  - `restore(sessionId)` après redémarrage : recharge l'état persistant, reprogramme le timer de fermeture depuis `deadline` (ou ferme immédiatement si dépassée).
- [ ] **Step 2:** Implémenter. Un `setTimeout` par question ouverte ; il appelle `closeQuestion`. Toute transition passe par `quizMachine` puis persiste **avant** de diffuser.
- [ ] **Step 3:** Agrégats `QuizResultsRepository.list({sessionId?, group?, search?})` : points / total possible / pourcentage par participant, détail par question ; participants sans réponse inclus.
- [ ] **Step 4:** Commit.

---

### Task 9: Outils MCP du quiz

**Files:** Modify `src/app/api/mcp/route.ts` (+ test dans le style des tests MCP existants).

- [ ] **Step 1:** Ajouter via `server.tool(...)` : `get_quiz`, `create_quiz`, `edit_quiz_config`, `add_quiz_question`, `edit_quiz_question`, `delete_quiz_question`, `reorder_quiz_questions`. Réutiliser le contrôle d'accès des outils d'écriture existants (`isAdmin`). Schémas d'entrée dérivés de `quiz.schema.ts`.
- [ ] **Step 2:** Les outils n'appellent que `QuizService`. **Aucun** outil de session, de réponse ou de lecture de notes (test explicite : la liste d'outils ne contient aucun nom `session|result|note|score`).
- [ ] **Step 3:** Mettre à jour `docs/local-mcp.md` (ou la doc MCP existante) avec les 7 outils.
- [ ] **Step 4:** Commit.

---

### Task 10: Routes de session live

**Files:** Create sous `src/app/api/quiz/` :

| Route | Rôle | Accès |
|---|---|---|
| `POST sessions` | créer (`moduleSlug`) | `canManageQuiz` |
| `POST sessions/[id]/start`, `/next`, `/reveal`, `/finish` | pilotage | `canManageQuiz`, propriétaire de la session |
| `GET sessions/[id]/stream?audience=…` | SSE | projection : enseignant ; étudiant : participant connecté |
| `POST join` | rejoindre par code | session better-auth requise |
| `POST sessions/[id]/answer` | répondre | participant |
| `GET sessions/[id]/state` | état persistant (reconnexion) | selon audience |
| `GET results` | tableau | `canManageQuiz` |

- [ ] **Step 1:** Calquer le SSE sur `src/app/api/live/[moduleSlug]/[sectionSlug]/stream/route.ts` (`force-dynamic`, heartbeat 20 s, nettoyage sur `abort`), avec envoi de l'état initial depuis MongoDB.
- [ ] **Step 2:** Vérifier `src/proxy.ts` : routes `/quiz/*` et `/api/quiz/*` exigent une session ; `/quiz/[code]` non connecté → redirection vers `/login` avec `callbackUrl` de retour (vérifier le mécanisme existant de retour après login ; l'ajouter s'il manque). Contrôler CSRF pour les POST.
- [ ] **Step 3:** Tests : 401/403, état étudiant sans correction avant `reveal`, réponse tardive 409 « Temps écoulé », double envoi 200 idempotent, reconnexion renvoie la réponse verrouillée.
- [ ] **Step 4:** Commit.

---

### Task 11: Éditeur de quiz dans l'admin du module

**Prérequis :** invoquer `ui-ux-pro-max`, lire `PRODUCT.md`/`DESIGN.md`.

**Files:** Create `src/components/quiz/admin/QuizEditor.tsx`, `QuestionEditor.tsx`, `OptionsEditor.tsx` ; Modify `ModuleWorkflow.tsx` / `StepStrip` ou ajouter un onglet « Quiz » sur la page `admin/(dashboard)/modules/[slug]`.

- [ ] **Step 1:** Placer l'onglet « Quiz » (décider : étape du workflow ou `Tabs` à côté de `ModuleWorkflow` ; privilégier `Tabs` pour ne pas toucher `moduleSteps`).
- [ ] **Step 2:** `QuizEditor` : créer le quiz, interrupteur « Points négatifs », liste ordonnée avec réordonnancement clavier + boutons, ajout/suppression avec confirmation.
- [ ] **Step 3:** `QuestionEditor` : énoncé via l'éditeur de blocs existant (limiter la palette à `QUIZ_ALLOWED_BLOCK_TYPES`), propositions (ajout/suppression/case « correcte »), poids, durée (5–300), `react-hook-form` + `zodResolver(quizQuestionSchema)`, erreurs liées aux champs (`aria-describedby`).
- [ ] **Step 4:** Test de rendu statique des états : vide, erreur, quiz rempli. Vérification navigateur (`preview_start`) : création, édition, réordonnancement, erreurs.
- [ ] **Step 5:** Commit.

---

### Task 12: Projection et lobby

**Prérequis :** `ui-ux-pro-max`. Cible 16:9.

**Files:** Create `src/app/quiz/live/[sessionId]/page.tsx`, `src/components/quiz/projection/{ProjectionScreen,Lobby,QuestionView,RevealView,Podium,Countdown,QrCode}.tsx`, `src/components/quiz/useQuizStream.ts`, bouton « Lancer le quiz » sur le front du module (visible `canManageQuiz` si un quiz existe).

- [ ] **Step 1:** `useQuizStream` : EventSource, reconnexion progressive, rechargement `GET state` avant reprise, état `connected | reconnecting | offline` (réutiliser les conventions de `useLiveSession`/`liveTypes`).
- [ ] **Step 2:** `Countdown` : calcule le temps restant depuis `deadline` serveur, correction de dérive (réutiliser `drift.ts`), chiffres tabulaires, `aria-live` poli seulement aux seuils (10 s, 5 s) ; `prefers-reduced-motion` respecté.
- [ ] **Step 3:** `Lobby` : nom du module, QR code (lib `qrcode`, zone calme, contraste fort), code court, compteur de participants, bouton Démarrer.
- [ ] **Step 4:** `QuestionView` : rendu du contenu riche avec le moteur existant (`blockRegistry`/renderer) ; nombre de bonnes réponses attendues ; compteur de réponses reçues.
- [ ] **Step 5:** `RevealView` + `Podium` : bonnes réponses (icône + libellé + couleur), podium ≤ 3 `Prénom N.`. Navigation : bouton « Suivant » + raccourcis clavier (→ / espace, ← sans effet), mêmes principes que `useKeyboardNav` des slides.
- [ ] **Step 6:** Ajouter `qrcode` (+ types), `bunx next build`.
- [ ] **Step 7:** Vérification visuelle : 16:9, clair/sombre, mouvement réduit. Commit.

---

### Task 13: Interface téléphone

**Prérequis :** `ui-ux-pro-max`. Largeur 375 px.

**Files:** Create `src/app/quiz/[code]/page.tsx`, `src/components/quiz/play/{PlayScreen,WaitingLobby,AnswerForm,LockedAnswer,RevealCard,FinalScore}.tsx`.

- [ ] **Step 1:** Page serveur : valide le code (invalide/expiré → message + lien vers les modules), session better-auth sinon redirection login avec retour, puis `join`.
- [ ] **Step 2:** `AnswerForm` : propositions en `checkbox` natifs (cibles ≥ 44 px), texte « Choisissez N réponse(s) », compte à rebours, bouton « Valider » explicite, message de statut `role="status"`. Sélection modifiable jusqu'à l'envoi, puis `LockedAnswer`.
- [ ] **Step 3:** Gestion d'erreur : échec d'enregistrement → message + « Réessayer » tant que non échu ; « Temps écoulé » à 409 ; reconnexion restaure l'état verrouillé.
- [ ] **Step 4:** `RevealCard` : toutes propositions, correct/incorrect/sélectionné par icône + libellé + couleur, points de la question + score cumulé. `FinalScore` à `finished`.
- [ ] **Step 5:** Tests de rendu statique (verrouillé, reveal, erreurs) ; vérification navigateur à 375 px. Commit.

---

### Task 14: Tableau des résultats enseignant

**Files:** Create `src/components/quiz/admin/QuizResultsTable.tsx` ; route `GET results` (Task 10) ; intégration dans l'onglet « Quiz ».

- [ ] **Step 1:** Colonnes `AdminColumn<TData>` via `AdminDataTable` : nom complet, groupe, session, points/total, %, détail (dépliable par question avec propositions choisies, correct/incorrect, temps).
- [ ] **Step 2:** Filtres : recherche nom/prénom, groupe, session ; état vide explicite. Les filtres s'appliquent côté serveur (`QuizResultsRepository.list`).
- [ ] **Step 3:** Test de rendu (vide, rempli) + vérification navigateur. Commit.

---

### Task 15: Parcours Playwright

**Files:** Create `e2e/quiz-live.spec.ts` (suivre l'emplacement/config Playwright existants et `src/lib/e2eBypass.ts`).

- [ ] **Step 1:** Seed : module, quiz de 2 questions (une multi-réponses), un admin et deux étudiants de test (valeurs générées/seed, jamais en dur dans le dépôt hors fixtures).
- [ ] **Step 2:** Scénario : admin lance → lobby affiche le QR → étudiant A et B rejoignent via l'URL du code → question ouverte → A répond, B laisse expirer → reveal (correction, points, podium `Prénom N.`) → question suivante → `finished` → tableau admin contient A et B avec les bonnes notes ; reconnexion de A (reload) conserve la réponse verrouillée.
- [ ] **Step 3:** Commit.

---

### Task 16: Vérification finale et documentation

- [ ] **Step 1:** `bun test`, `bun run lint`, `bunx tsc --noEmit`, `bunx next build`.
- [ ] **Step 2:** Checklist visuelle de la spec §13 : 375 px, 16:9, clair/sombre, zoom texte, clavier, mouvement réduit, contraste QR/états/textes.
- [ ] **Step 3:** Mettre à jour `CLAUDE.md` : collections (`module_quizzes`, `quiz_sessions`, `quiz_participants`, `quiz_answers`), index, `src/lib/quiz/`, routes `/api/quiz/*`, dépendance `qrcode`, outils MCP.
- [ ] **Step 4:** Parcourir les 9 critères d'acceptation (§14) un par un ; `detect_changes({scope: "compare", base_ref: "main"})` ; commit final.

---

## Couverture de la spec

| Spec | Tâche(s) |
|---|---|
| §3 modèle quiz/question | 1, 5 |
| §4.1 préparation | 6, 11 |
| §4.2–4.4 lobby, question, correction | 7, 8, 10, 12, 13 |
| §5 barème et podium | 2, 3 |
| §6 architecture, machine, instantané | 4, 7, 8 |
| §7 persistance et index | 5, 8 |
| §8 API et SSE | 10 |
| §9 MCP | 9 |
| §10 UI/DA | 11, 12, 13, 14 |
| §11 sécurité et confidentialité | 5, 7, 9, 10 |
| §12 erreurs | 8, 10, 13 |
| §13 tests | chaque tâche, 15, 16 |
| §14 acceptation | 16 |
