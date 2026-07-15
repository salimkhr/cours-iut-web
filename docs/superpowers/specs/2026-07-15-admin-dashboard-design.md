# Refonte du tableau de bord admin

## Objectif

Recentrer `/admin` sur la gestion pedagogique du site. La page actuelle met les
utilisateurs au premier plan et expose des actions secondaires en vrac. La
nouvelle version doit faire de `/admin` le point unique pour administrer les
modules, les sections, les utilisateurs et les outils utiles.

## Decisions validees

- `/admin` devient un tableau de bord a onglets.
- L'onglet par defaut est `Modules & sections`.
- Il n'y a plus de FAB admin sur la home.
- Toutes les actions admin sont deplacees dans `/admin`.
- L'action `Synchroniser les cours` est retiree. Avec la DB comme source de
  gestion, elle n'est plus utile.
- Les utilisateurs restent gerables, mais dans un onglet dedie.
- Les outils secondaires sont regroupes dans `Outils`.

## Structure cible

### Onglet `Modules & sections`

Cet onglet pilote les modules et leurs sections.

Fonctions attendues :

- Creer un module depuis l'en-tete de l'onglet.
- Afficher les modules sous forme de cartes ou accordions lisibles.
- Voir rapidement le titre, le statut de visibilite, le nombre de sections et
  les actions principales de chaque module.
- Masquer ou afficher un module directement sur sa carte.
- Editer un module depuis sa carte.
- Supprimer un module depuis sa carte si le comportement existe deja ou reste
  compatible avec les APIs actuelles.
- Ajouter une section depuis le module ouvert.
- Afficher les sections du module sous forme de cartes compactes.
- Verrouiller ou deverrouiller une section directement sur sa carte.
- Activer ou masquer la correction depuis la carte de section.
- Editer ou supprimer une section depuis sa carte.
- Acceder a l'edition des contenus disponibles d'une section : cours, TP,
  slides, projet, examen.

Le verrouillage d'une section utilise `section.isAvailable`. Le masquage d'un
module utilise `module.isVisible`. Les controles deja presents sur les cards
publiques doivent etre repris ou harmonises dans cette interface admin.

### Onglet `Utilisateurs`

Cet onglet conserve la gestion des comptes.

Fonctions attendues :

- Lister les utilisateurs.
- Modifier les informations utiles.
- Bannir/debannir.
- Supprimer un utilisateur si l'action existe deja.

Aucune action de contenu ou d'outil technique ne doit etre placee dans cet
onglet.

### Onglet `Outils`

Cet onglet regroupe les actions techniques et pedagogiques qui ne sont pas des
actions directes de module, section ou utilisateur.

Actions attendues :

- Migration.
- Export/import.
- Acces au calibrage pedagogique.
- Acces a la page pedagogie.

Action explicitement retiree :

- Synchronisation des cours.

Les outils doivent etre presentes en lignes ou cartes d'action avec un libelle
clair, une courte description et un bouton. Ils ne doivent pas apparaitre comme
des actions aleatoires dans l'en-tete principal.

## Composants et architecture

La page `/admin` reste un Server Component pour charger la session, les
utilisateurs et les modules. Un composant client d'onglets gere l'affichage et
les interactions.

Composants existants a reutiliser en priorite :

- `AdminTabs`, a renforcer ou remplacer par une version plus complete.
- `ModulesList`, `AdminModule`, `AdminSection` pour la structure module/section.
- `UsersTable` pour les utilisateurs.
- `MigrateButton`, `ExportImportSheet`, `CalibrageList` et les liens existants
  pour les outils.
- Les controles de verrouillage existants dans `ModuleCard` et `SectionCard`
  comme reference UX.

Le composant `AdminHomeFab` doit etre retire de la home et ne doit plus porter
les actions admin.

## UX et design

L'admin doit rester dense, lisible et operationnelle. Elle ne doit pas devenir
une landing page.

Regles UI :

- Onglets visibles en haut de `/admin`, avec `Modules & sections` actif par
  defaut.
- Cibles interactives d'au moins 44px quand possible.
- Boutons icon + texte pour les actions structurantes.
- Icon-only uniquement pour les actions repetitives, avec `aria-label`.
- Etats pending sur les actions async : boutons desactives, `aria-busy` ou
  libelle temporaire.
- Feedback toast pour succes/echec des toggles et mutations.
- Couleurs conformes au systeme bridge et aux couleurs modules.
- Pas de bleu admin generique.
- Pas de FAB.
- Pas de section hero marketing.

## Donnees et flux

Chargement serveur :

- Verifier que la session est admin.
- Charger les utilisateurs via `auth.api.listUsers`.
- Charger les modules via `getModules`.

Mutations client :

- Modules : APIs existantes de `useAdminApi`.
- Sections : APIs existantes de `useAdminApi` et `updateSectionState`.
- Utilisateurs : APIs existantes sous `/api/admin/users`.
- Outils : endpoints deja existants sauf synchronisation, qui n'est plus exposee.

Apres creation, modification ou suppression structurante, l'interface peut soit
mettre a jour son state local, soit appeler `router.refresh()` selon le pattern
existant du composant concerne.

## Gestion des erreurs

- Une erreur de chargement utilisateurs ne doit pas empecher la page admin de
  rendre les modules.
- Les mutations optimistes doivent rollback en cas d'echec.
- Les erreurs doivent etre visibles via toast ou message inline contextualise.
- Les actions destructives conservent une confirmation.

## Verification

Commandes a lancer apres implementation :

- `bun run lint`
- `bun run build`

Verification manuelle minimale :

- `/admin` affiche les onglets.
- `Modules & sections` est l'onglet par defaut.
- Le FAB admin n'apparait plus sur la home.
- Le verrouillage/deverrouillage d'une section fonctionne depuis `/admin`.
- Le masquage/affichage d'un module fonctionne depuis `/admin`.
- L'onglet `Outils` ne contient pas de synchronisation.
- Les utilisateurs restent gerables depuis l'onglet `Utilisateurs`.
