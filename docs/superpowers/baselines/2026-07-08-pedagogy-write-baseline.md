# Baseline — /pedagogy:write — 2026-07-08

Scénario : module=javascript, section=4-fetch (staging), consigne = « génère le TP de cette section ».
Sous-agent sans MCP, suivant l'ancien SKILL.md (42 lignes) + la référence tp.md telle qu'il l'aurait lue.

Écarts au protocole, documentés :
- La section a déjà un TP en DB (aucune section JS n'en est dépourvue) — sans effet : rien n'est écrit en DB.
- `sessionDurationMinutes` absent des modules staging ; valeur retenue : 120 min/séance (décision du 2026-07-02).
- La référence tp.md fournie au sous-agent était légèrement abrégée (sections calibrage/guidage condensées).

## Métriques

- Budget de la séance : 2 séances × 120 min − 27 slides × 2 min = **186 min**
- Durée totale estimée du TP produit (estimée a posteriori, le TP n'indique aucune durée) :
  mise en place ~15 + ex1 ~20 + ex2 ~30 + ex3 ~40 + ex4 ~40 + ex5 ~45 ≈ **190 min (~102 % du budget)**
- **Exercices avec durée indicative : 0/5** (règle de la référence non appliquée)
- **Budget calculé/vérifié par le skill : non** (pas de collecte MCP, pas d'audit — le calibrage correct est fortuit, non garanti)
- Exercices sans fichier cible : 0/5
- Exercices sans résultat observable : 0/5
- Exercices sans critère de validation explicite : ex3 et ex4 (critère déductible mais non formulé) — **2/5**
- **Noms exacts manquants : ex5** (fonction de factorisation « nom à votre charge ») — violerait le futur contrat de consigne
- Exemples jouets (`foo`/`bar`) : 0
- Univers : « Résa'IUT » inventé ad hoc pour ce TP — réaliste mais non persisté, donc incohérence inter-TP garantie à terme

## Lecture

La référence tp.md refondue (2026-07-02) élève déjà la qualité du contenu. Les défauts restants
sont exactement ceux que le pipeline doit corriger : aucune vérification du budget (résultat
aléatoire), durées indicatives ignorées, contrat de consigne incomplet en guidage léger,
aucun audit, univers non persisté.

## Lecture RED

La référence tp.md refondue (2026-07-02) élève déjà la qualité du contenu. Les défauts restants
sont exactement ceux que le pipeline doit corriger : aucune vérification du budget (résultat
aléatoire), durées indicatives ignorées, contrat de consigne incomplet en guidage léger,
aucun audit, univers non persisté.

---

# Baseline GREEN — /pedagogy:write après refonte — 2026-07-09

Scénario : même cible (javascript/4-fetch/TP sur staging), nouveau SKILL.md + pipeline 8 phases
exécuté inline (phases 1–8 complètes, audits inline, boucle calibrage validée).

## Métriques GREEN

- **Budget utilisé : 150/186 min = 80,6 %** ✓ (fenêtre cible 80–100 %)
  - Ex1 25 min + Ex2 35 min + Ex3 40 min + Ex4 50 min = 150 min
- **Durées indicatives : 4/4** — présentes dans chaque titre de section ✓
- **Contrat de consigne universel : 5/5 éléments × 4 exercices** ✓
  - Fichier cible : `app.js` dans chaque exercice
  - Noms exacts : `testerPing()`, `afficherSalles(capaciteMin)`, `connecter(email, motDePasse)`, `reserver(salleId, date, creneau)`
  - Données d'entrée : ping → 404 (ex1), salles API (ex2), `etudiant@iut.fr`/`mdp123` (ex3), token + salleId/date/creneau (ex4)
  - Résultat observable : défini pour chaque exercice (DOM IDs, classes CSS, valeurs)
  - Critère de validation : explicite et testable (ex4 : 3 cas 201/401/409 avec procédure)
- **Univers Résa'IUT utilisé** : endpoints `/api/ping`, `/api/salles`, `/api/connexion`, `/api/reservations` ✓
- **Types de blocs** : tous validés via `list_block_types()` avant écriture, 0 type inventé ✓
- **Audit auditeur-apprenant** : verdict `too_long` (102 %) → boucle calibrage → correction inline → 80,6 % ✓
- **Blocs écrits en DB** : 77 blocs, `contentId=6a4c95df0d84cb047bdb2b4b`, `version=2` ✓

## Écarts résiduels GREEN

- Univers non persisté en DB sur staging (champ `universe` pas encore supporté sur la branche staging
  au moment du test) : défini in-session uniquement.
- Contenu en ASCII simplifié (accents retirés) pour contournement d'un problème d'encodage
  du script Python de génération JSON — à corriger en production via écriture directe MCP.

## Comparaison RED → GREEN

| Métrique | RED | GREEN |
|---|---|---|
| Durées indicatives | 0/5 exercices | **4/4** ✓ |
| Budget vérifié | non | **80,6 % (150/186 min)** ✓ |
| Critère de validation | 2/5 incomplets | **5/5 × 4 exercices** ✓ |
| Noms exacts | ex5 manquant | **tous nommés** ✓ |
| Univers persisté | non | *in-session* (staging sans champ universe) |
| Audit calibrage | absent | **boucle 1 itération** (102 % → 80,6 %) ✓ |
| Contenu en DB | non écrit | **77 blocs écrits, version=2** ✓ |
| Types de blocs erronés | n/a | **0** ✓ |

## Découvertes sur le schéma de blocs staging

Prop names réels (différents des noms supposés) :
- `code` et `download-file` : prop `code` (pas `content`)
- `list-item` : prop `text` (pas `content`)
- Ces noms sont à documenter dans `list_block_types()` ou une note de skill

---

## Contenu produit RED (verbatim)

# TP — Fetch : consommer une API depuis le navigateur

**[bloc `text`]**
À la fin de ce TP, vous aurez construit **Résa&rsquo;IUT, une application web de réservation de salles** : une page qui affiche en temps réel les salles disponibles de l&rsquo;IUT, permet de se connecter avec un compte étudiant, puis de réserver un créneau — le tout en dialoguant avec une API Express fournie, uniquement via `fetch`.

---

## Section — Mise en place du projet

**[bloc `download-file`]** `api-resa-iut.zip` — Backend Express/TypeScript fourni (API de réservation, comptes de test inclus)

**[bloc `list` — `ordered: true`]**
1. Téléchargez l&rsquo;archive `api-resa-iut.zip` et décompressez-la dans votre dossier de travail.
2. Ouvrez un terminal dans le dossier `api-resa-iut` et exécutez `npm install`.
3. Lancez le serveur avec `npm run dev`.
4. Vérifiez dans votre navigateur que `http://localhost:3000/api/statut` renvoie un objet JSON contenant `statut`, `version` et `horodatage`.
5. Créez, **à côté** du dossier `api-resa-iut` (pas dedans), un dossier `front` : c&rsquo;est là que vous travaillerez pendant tout le TP.

**[bloc `callout` — variant `warning`, title « CORS : servez votre front, ne l&rsquo;ouvrez pas en file:// »]**
L&rsquo;API autorise uniquement les requêtes provenant de l&rsquo;origine `http://localhost:5500`. Si vous ouvrez vos pages HTML par double-clic (`file://…`), toutes vos requêtes `fetch` seront bloquées par le navigateur avec une erreur CORS. Servez le dossier `front` avec l&rsquo;extension Live Server de VS Code (port 5500) ou `npx serve -l 5500 front`.

**[bloc `code` — language `text`, filename `API.md`]**
```text
Documentation de l'API Résa'IUT — base : http://localhost:3000

GET  /api/statut          public          → { statut, version, horodatage }
GET  /api/salles          public          → [ { id, nom, capacite, equipements: [] } ]
POST /api/login           public          corps : { email, motDePasse } → { jeton }
GET  /api/reservations    Bearer requis   → [ { id, salleId, date, creneau } ] (celles de l'utilisateur)
POST /api/reservations    Bearer requis   corps : { salleId, date, creneau } → réservation créée (201)

Erreurs : 400 (corps invalide), 401 (jeton absent/invalide, identifiants faux),
409 (créneau déjà réservé). Toutes renvoient { erreur: "message en français" }.

Compte de test : lea.moreau@iut.fr / Fetch2026!
```

---

## Section — Exercice 1 — Échauffement : premier appel fetch

**[bloc `text`]**
Avant de commencer l&rsquo;application, vous allez vérifier que vous savez interroger l&rsquo;API et exploiter sa réponse. Cet exercice est indépendant du reste du TP : il se fait dans une page à part.

**[bloc `text`]**
**Étape 1 — Définir.** Dans un fichier `front/js/test-statut.js`, écrivez la fonction suivante. Elle interroge `GET http://localhost:3000/api/statut`, convertit la réponse en JSON et renvoie l&rsquo;objet obtenu.

**[bloc `code` — language `javascript`, filename `front/js/test-statut.js`]**
```javascript
/**
 * Interroge GET http://localhost:3000/api/statut
 * @returns {Promise<{statut: string, version: string, horodatage: string}>}
 */
async function recupererStatut()
```

**[bloc `text`]**
**Étape 2 — Utiliser.**

**[bloc `list` — `ordered: true`]**
1. Créez une page `front/test-statut.html` contenant un titre, un paragraphe vide d&rsquo;id `etat-api`, et incluant le script `js/test-statut.js`.
2. Définissez la fonction `recupererStatut()` avec la signature exacte donnée ci-dessus, en utilisant `fetch` et `await`.
3. Utilisez `recupererStatut()` au chargement de la page pour remplir le paragraphe `etat-api` avec un message du type « API version 1.0.0 — en ligne depuis le 08/07/2026 », construit à partir des champs `version` et `horodatage`.
4. Ouvrez l&rsquo;onglet Réseau des outils de développement et vérifiez que la requête vers `/api/statut` apparaît avec le statut `200` et le type `fetch`.
5. Arrêtez le serveur Express (Ctrl+C), rechargez la page et observez l&rsquo;erreur affichée dans la console — puis relancez le serveur.

**[bloc `text`]**
**Critère de validation :** la page affiche la version et la date renvoyées par l&rsquo;API (pas des valeurs écrites en dur), et vous savez montrer la requête correspondante dans l&rsquo;onglet Réseau.

---

## Section — Exercice 2 — Afficher les salles disponibles

**[bloc `callout` — variant `info`, title « À ce stade, votre projet contient »]**
- Le backend `api-resa-iut` lancé sur le port 3000 ;
- Un dossier `front` servi sur le port 5500, avec la page d&rsquo;échauffement `test-statut.html` (qui ne servira plus).

**[bloc `text`]**
Le fil rouge commence ici : vous construisez la page principale de Résa&rsquo;IUT. Première brique : afficher la liste des salles renvoyée par l&rsquo;API.

**[bloc `text`]**
**Étape 1 — Définir.** Toutes les fonctions qui parlent à l&rsquo;API vivront dans un fichier dédié `front/js/api.js`. Commencez par celle-ci :

**[bloc `code` — language `javascript`, filename `front/js/api.js`]**
```javascript
/**
 * Récupère la liste des salles auprès de GET /api/salles.
 * @returns {Promise<Array<{id: string, nom: string, capacite: number, equipements: string[]}>>}
 */
async function recupererSalles()
```

**[bloc `text`]**
**Étape 2 — Utiliser.**

**[bloc `list` — `ordered: true`]**
1. Créez la page `front/index.html` avec un titre « Résa&rsquo;IUT », une section vide d&rsquo;id `liste-salles`, et incluez `js/api.js` puis `js/app.js` (dans cet ordre).
2. Créez le fichier `front/js/app.js` : c&rsquo;est lui qui manipule le DOM ; `api.js` ne doit contenir aucun accès au DOM.
3. Définissez `recupererSalles()` dans `api.js` avec la signature exacte donnée ci-dessus.
4. Utilisez `recupererSalles()` depuis `app.js` pour afficher, au chargement de la page, une carte par salle dans `liste-salles` : nom, capacité (« 24 places ») et liste des équipements.
5. Affichez le texte « Chargement des salles… » dans `liste-salles` avant l&rsquo;appel, et remplacez-le par les cartes une fois la réponse reçue.
6. Vérifiez dans l&rsquo;onglet Réseau que la page ne déclenche qu&rsquo;une seule requête vers `/api/salles`.

**[bloc `text`]**
**Critère de validation :** les six salles renvoyées par l&rsquo;API s&rsquo;affichent avec leurs équipements ; le message de chargement est visible si vous simulez un réseau lent (onglet Réseau → limitation « 3G lente »).

---

## Section — Exercice 3 — Connexion et jeton

**[bloc `callout` — variant `info`, title « À ce stade, votre projet contient »]**
- Le backend sur le port 3000 ;
- `front/index.html` qui affiche la liste des salles au chargement ;
- `front/js/api.js` (appels réseau) et `front/js/app.js` (DOM), bien séparés.

**[bloc `text`]**
Pour réserver, l&rsquo;API exige un jeton. **Objectif fonctionnel :** un formulaire de connexion (email + mot de passe) en haut de `index.html` ; à la soumission, l&rsquo;application obtient un jeton via `POST /api/login` et bascule l&rsquo;interface en mode connecté (le formulaire laisse place à « Connecté·e en tant que lea.moreau@iut.fr » et à un bouton de déconnexion). Des identifiants faux affichent un message d&rsquo;erreur clair sans recharger la page.

**[bloc `text`]**
**Contraintes :**

**[bloc `list` — `ordered: false`]**
- Dans `api.js`, une fonction `connecter(email, motDePasse)` qui envoie le corps en JSON avec l&rsquo;en-tête `Content-Type: application/json` et renvoie `Promise<string>` (le jeton). C&rsquo;est la partie « Définir » ; l&rsquo;endroit et la manière de l&rsquo;appeler restent à votre charge.
- La soumission du formulaire est interceptée avec `preventDefault()`, comme vu dans le cours sur les événements avancés.
- Le jeton est conservé dans `sessionStorage` (clé de votre choix), jamais dans une variable globale seule : l&rsquo;utilisateur doit rester connecté après un rechargement de la page.
- En cas de réponse `401`, le message affiché provient du champ `erreur` renvoyé par l&rsquo;API, pas d&rsquo;un texte inventé côté client.

**[bloc `callout` — variant `reminder`, title « Rappel du cours »]**
`fetch` ne rejette **pas** sa promesse pour une réponse 401 : la requête a techniquement abouti. C&rsquo;est à vous de tester `response.ok` (ou `response.status`) avant de considérer la connexion réussie.

---

## Section — Exercice 4 — Réserver un créneau

**[bloc `callout` — variant `info`, title « À ce stade, votre projet contient »]**
- La liste des salles affichée au chargement ;
- Un formulaire de connexion fonctionnel qui stocke le jeton dans `sessionStorage` et bascule l&rsquo;interface en mode connecté.

**[bloc `text`]**
**Objectif fonctionnel :** chaque carte de salle propose un bouton « Réserver » qui ouvre un petit formulaire (date + créneau parmi « 8h–10h », « 10h–12h », « 14h–16h », « 16h–18h ») et envoie la réservation à `POST /api/reservations`. Une réservation acceptée (code `201`) affiche une confirmation dans la carte ; un créneau déjà pris (code `409`) affiche le message d&rsquo;erreur de l&rsquo;API sans casser le reste de la page.

**[bloc `text`]**
**Contraintes :**

**[bloc `list` — `ordered: false`]**
- Dans `api.js`, une fonction `creerReservation(salleId, date, creneau, jeton)` qui renvoie `Promise<object>` (la réservation créée) et transmet le jeton dans l&rsquo;en-tête `Authorization: Bearer …`.
- Un seul gestionnaire d&rsquo;événements pour tous les boutons « Réserver », posé sur le conteneur `liste-salles` (délégation d&rsquo;événements, vue au cours précédent) — pas un `addEventListener` par carte.
- Si l&rsquo;utilisateur n&rsquo;est pas connecté, le clic sur « Réserver » n&rsquo;envoie aucune requête et invite à se connecter.
- Testez le cas `409` en réservant deux fois le même créneau sur la même salle.

---

## Section — Exercice 5 — Robustesse : erreurs réseau et jeton expiré

**[bloc `callout` — variant `info`, title « À ce stade, votre projet contient »]**
- L&rsquo;affichage des salles, la connexion avec jeton, la création de réservations ;
- Trois fonctions dans `api.js` : `recupererSalles`, `connecter`, `creerReservation` — qui gèrent chacune leurs erreurs à leur manière.

**[bloc `text`]**
Une application réelle doit survivre à un serveur éteint, à un jeton expiré et à des données invalides. **Objectif fonctionnel :** aucune action de l&rsquo;utilisateur ne doit laisser la page dans un état cassé ou silencieux — chaque échec produit un message en français, visible dans la page (pas seulement en console).

**[bloc `text`]**
**Contraintes :**

**[bloc `list` — `ordered: false`]**
- Factorisez le traitement commun des réponses (vérification de `response.ok`, extraction du champ `erreur`, levée d&rsquo;une exception) dans une fonction unique de `api.js`, utilisée par les trois fonctions existantes. Son nom, ses paramètres et sa valeur de retour sont à votre charge : c&rsquo;est vous qui la concevez.
- Une panne réseau (serveur arrêté) et une erreur HTTP ne sont pas le même cas : distinguez les deux dans le message affiché à l&rsquo;utilisateur.
- Une réponse `401` sur `/api/reservations` signifie que le jeton n&rsquo;est plus valide : l&rsquo;application doit alors repasser en mode déconnecté et vider `sessionStorage`.

**[bloc `text`]**
**Scénarios de recette** — votre application est terminée si les quatre situations suivantes affichent chacune un message adapté sans erreur non gérée en console :

**[bloc `list` — `ordered: true`]**
1. Coupez le serveur Express, rechargez la page, puis relancez-le.
2. Connectez-vous avec un mot de passe faux.
3. Réservez deux fois le même créneau sur la même salle.
4. Supprimez le jeton à la main dans `sessionStorage` (onglet Application des outils de développement), puis tentez une réservation.

**[bloc `callout` — variant `info`, title « Livrable final »]**
Résa&rsquo;IUT est complète : liste des salles en direct, connexion par jeton persistante au rechargement, réservation de créneaux, et messages d&rsquo;erreur propres dans tous les cas d&rsquo;échec. Conservez ce projet : il servira de point de départ à la séance d&rsquo;évaluation.
