# Admin Redesign — Spec

Date: 2026-05-15

## Contexte

L'admin actuel (`/admin`) est une page unique avec accordéon de modules et sections en cards.
Trois problèmes identifiés :
1. Bug : après édition d'une section, l'affichage revient en position 1 jusqu'au reload
2. UX : accordéon + modales empilées, peu ergonomique
3. Structure : l'admin est une page séparée alors que l'édition devrait être contextuelle

## Périmètre

### V1 (ce spec)
- Édition contextuelle des modules et sections depuis les pages publiques
- Refonte de `/admin` en gestion des utilisateurs
- Fix du bug de re-render

### V2 (hors scope)
- Suivi de progression par étudiant dans le tableau utilisateurs

## Architecture générale

Approche hybride :
- L'édition du contenu pédagogique (modules, sections) se fait **sur les pages existantes** via des FAB admin
- `/admin` devient **exclusivement la gestion des comptes utilisateurs**

---

## 1. Édition contextuelle — Modules

### Déclencheur
Un `EditModuleFab` (bouton flottant bas-droite) apparaît sur `/[moduleSlug]` quand `session.user.role === 'admin'`.

### Formulaire
`EditModuleSheet` : port de `AddModuleButton` migré en `Sheet` (panneau latéral shadcn).
Champs : titre, description, icône, coefficients (6 compétences), responsable, intervenants, SAÉ associées.

### API
Nouvel endpoint `PUT /api/admin/modules/[moduleId]` qui met à jour le module en base.
Après succès : `router.refresh()` (pattern déjà utilisé dans `EditSectionFab`).

---

## 2. Édition contextuelle — Sections

### Déclencheur
Le `EditSectionFab` existant reste en place sur les pages cours/TP/slide/section.

### Formulaire
`SectionForm` migré de `Dialog` vers `Sheet`. Mêmes champs, même validation.

### Fix du bug de re-render
Dans `useAdminApi.ts`, `editSection` retourne la section mise à jour.
Les composants consommateurs doivent remplacer par `_id` et non par index :

```ts
// Remplacer dans AdminModule.tsx ou tout composant gérant la liste
setSections(prev =>
  prev.map(s => s._id === updated._id ? updated : s)
)
```

La page `/admin` accordéon est supprimée. Les modules et sections ne sont plus gérables depuis `/admin`.

---

## 3. Page `/admin` — Gestion des utilisateurs

### Layout
Server Component qui charge la liste des utilisateurs via `auth.api.listUsers({ headers })`.
Rend `<UsersTable users={users} />`.

### Tableau utilisateurs (`UsersTable`)

Colonnes :
| Colonne | Contenu |
|---|---|
| Utilisateur | Avatar (photo profil) + fallback initiales colorées + nom + email |
| Groupe | Champ `user.group` (additionalField better-auth, déjà en base) |
| Rôle | Badge `admin` / `user` |
| Créé le | Date d'inscription formatée |
| Actions | Bouton reset MDP + bouton supprimer |

### Fallback avatar
Initiales sur fond coloré dérivé du nom par hash simple → index dans la palette bridge.
Cohérent avec le design system existant.

### Actions utilisateur

**Supprimer** :
- Bouton icône corbeille dans la ligne
- `DeleteUserDialog` : confirmation avant suppression
- API : `DELETE /api/admin/users/[userId]` → `auth.api.removeUser`
- Après succès : retrait de la ligne dans l'état local

**Réinitialiser le mot de passe** :
- Bouton icône clé dans la ligne
- Pas de confirmation (action non destructive)
- API : `POST /api/admin/users/[userId]/reset-password` → envoie l'email de reset via `better-auth`
- Toast de confirmation côté admin

---

## 4. UI/UX des formulaires admin

### Conteneur : Sheet au lieu de Dialog

Tous les formulaires admin (section, module) migrent de `Dialog` vers `Sheet` (panneau latéral droit, shadcn). Avantages : plus de place pour les champs, pas d'empilement de modales, workflow naturel côte-à-côte avec la page.

### Anatomie des Sheets

**Header** — fond plein `bg-${modulePath}` (ou `bg-bridge-700` pour les sheets sans contexte module) :
- Icône dans un rond `bg-white/20`
- Eyebrow `text-[11px] uppercase tracking-[0.18em]` + titre blanc
- Top-edge highlight `via-white/40`

**Body** — `bg-[#f7ebd9] dark:bg-[#13110d]`
- Sections séparées par `border-t border-bridge-700/20 dark:border-bridge-500/20`
- Chaque groupe de champs précédé d'un eyebrow label
- Inputs : fond `bg-bridge-100/60 dark:bg-bridge-800/60`, bordure `border-bridge-500/45`
- Pas de fond blanc pur, pas de gris neutre

**Footer** — sticky bas de sheet :
- Bouton primaire `bg-brand-primary text-brand-light` (Enregistrer)
- Bouton annuler `variant="ghost"` à gauche

### Tableau utilisateurs

- Fond `bg-[#f7ebd9] dark:bg-[#13110d]`, bordure `border-bridge-500/45`
- En-têtes de colonne : eyebrow style `text-[11px] uppercase tracking-[0.18em]`
- Lignes avec séparateur `border-bridge-700/10 dark:border-bridge-500/10`
- Badges rôle : `admin` en `bg-${modulePath}` blanc, `user` en `bg-bridge-200/60 dark:bg-bridge-700/60`
- Avatar fallback : initiales sur fond dérivé du nom (hash → index palette bridge)

---

## 5. Nouvelles routes API

| Route | Méthode | Auth requise | Rôle |
|---|---|---|---|
| `/api/admin/users` | `GET` | admin | Liste les utilisateurs |
| `/api/admin/users/[userId]` | `DELETE` | admin | Supprime un compte |
| `/api/admin/users/[userId]/reset-password` | `POST` | admin | Envoie email de reset |
| `/api/admin/modules/[moduleId]` | `PUT` | admin | Met à jour un module |

---

## 5. Nouveaux fichiers

```
src/components/admin/
  EditModuleFab.tsx          ← FAB contextuel sur /[moduleSlug]
  EditModuleSheet.tsx        ← Formulaire module en Sheet
  users/
    UsersTable.tsx           ← Tableau client component
    UserRow.tsx              ← Ligne avec avatar + actions
    DeleteUserDialog.tsx     ← Modale confirmation suppression

src/app/api/admin/
  users/route.ts             ← GET liste
  users/[userId]/route.ts    ← DELETE
  users/[userId]/reset-password/route.ts ← POST

src/app/api/admin/
  modules/[moduleId]/route.ts ← PUT update module
```

### Fichiers modifiés

```
src/components/admin/SectionForm.tsx     ← Dialog → Sheet
src/hook/admin/useAdminApi.ts            ← Fix state update par _id
src/app/admin/page.tsx                   ← Remplacé par UsersTable
src/app/[moduleSlug]/page.tsx            ← Ajout EditModuleFab si admin
```

---

## 6. Ce qui ne change pas

- `AdminSection.tsx` et les toggles disponibilité/correction/examen restent tels quels
- `AddModuleButton` et `AddSectionButton` restent fonctionnels
- Aucune modification du schéma MongoDB
- Pas de nouvelle dépendance
