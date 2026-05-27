# Quiz de fin de TP — Page dédiée

## Contexte

Le quiz de clôture du TP existe déjà sous forme de `Dialog` (`QuizDialog.tsx`). L'affichage est jugé insuffisant. On le remplace par une vraie page dédiée, avec une Direction Artistique cohérente avec le reste du site (même DA que la page login, mais avec l'image "escalier" à la place du "pont").

## Métaphore narrative

- **Pont** (`pont-light.png` / `pont-dark.png`) → login : on entre, on traverse, on accède
- **Escalier** (`escalier-light.png` / `escalier-dark.png`) → quiz : on s'élève, on valide ce qu'on a appris

Les deux images existent déjà dans `public/images/header/`.

## Route

```
src/app/[moduleSlug]/[sectionSlug]/quiz/page.tsx
```

## Architecture

### Server Component — `page.tsx`
- Lit `moduleSlug` et `sectionSlug` depuis les params
- Appelle `getModuleData({ moduleSlug, sectionSlug })` pour obtenir module + section
- Si `section.quiz?.questions` est absent ou vide → `redirect(`/${moduleSlug}/${sectionSlug}/TP`)`
- Vérifie session (`getServerSession()`) → `redirect('/login')` si non connecté
- Rend `QuizPageLayout` + `QuizGame`

### `QuizPageLayout` (Client Component, dans `src/components/quiz/`)
Adaptation d'`AuthLayout` :
- Fond `escalier-dark.png` / `escalier-light.png` selon le thème (`useIsDark()`)
- Même gradient overlay : solide à gauche → transparent à droite (desktop)
- Blobs d'ambiance en `moduleColor` (`var(--color-${modulePath})`) au lieu de `brand-primary`
- Grand titre `"Quiz"` (`font-extrabold tracking-tight`), point accent couleur module
- Sous-titre = nom de la section (`currentSection.title`)
- Lien `← Retour au TP` discret (`/${moduleSlug}/${sectionSlug}/TP`) en haut de la colonne gauche, au-dessus du titre
- Card frosted-glass : `backdrop-blur-md`, `bg-bridge-50/85`, `border-bridge-400/40`, shadow warm (identique à `AuthLayout`)
- Props : `moduleSlug`, `sectionSlug`, `modulePath`, `sectionTitle`, `children`

### `QuizGame` (Client Component, dans `src/components/quiz/`)
Extraction du `QuizDialog` actuel sans le wrapper `Dialog` / `DialogContent` :
- Même machine d'états : `loading | answering | checking | feedback | completing | summary | error`
- Même appels API : `GET /api/quiz/[mod]/[sec]`, `POST /check`, `POST /complete`
- Mêmes composants internes : `QuizQuestion`, progress bar par segment, feedback inline
- Barre de progression : collée en haut de la card (pas de `pt-4`), segments verts/rouges en summary
- En état `summary` : bouton "Réessayer" relance le quiz, bouton "Retour au TP" → `router.push(`/${moduleSlug}/${sectionSlug}/TP`)`
- Props : `moduleSlug`, `sectionSlug`, `moduleColor`

### Entrée depuis la page TP
Dans `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` :
- Remplacer le bouton qui ouvrait `QuizDialog` par un `<Link href="/${moduleSlug}/${sectionSlug}/quiz">` (ou `<Button asChild>`)
- Condition d'affichage inchangée : `contentSlug === 'TP'` + quiz non vide + session

### `QuizDialog` (existant)
Conserver le fichier mais il n'est plus utilisé sur la page TP. Peut être supprimé lors du nettoyage final, ou conservé temporairement.

## Génération des métadonnées

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  // title: `Quiz — ${sectionTitle} | ${moduleTitle}`
}
```

## Accessibilité

- `<h1>` = "Quiz" (dans le layout)
- `<h2>` = question courante (dans `QuizGame`, rôle `DialogTitle` remplacé par un heading normal)
- `role="radiogroup"` / `aria-checked` dans `QuizQuestion` inchangés
- Lien retour avec `aria-label="Retour au TP [sectionTitle]"`

## Fichiers créés / modifiés

| Action | Fichier |
|--------|---------|
| Créer | `src/app/[moduleSlug]/[sectionSlug]/quiz/page.tsx` |
| Créer | `src/components/quiz/QuizPageLayout.tsx` |
| Créer | `src/components/quiz/QuizGame.tsx` (extrait de QuizDialog) |
| Modifier | `src/app/[moduleSlug]/[sectionSlug]/[contentSlug]/page.tsx` (Link au lieu de Dialog) |
| Conserver | `src/components/quiz/QuizDialog.tsx` (inutilisé, suppression optionnelle) |
| Inchangé | `src/components/quiz/QuizQuestion.tsx` |

## Ce qui ne change pas

- Les API routes (`/api/quiz/...`) : aucune modification
- `QuizQuestion.tsx` : aucune modification
- La sécurité : `correct` et `explanation` ne quittent jamais le serveur via GET
- L'admin (`QuizEditorSheet`) : aucune modification
