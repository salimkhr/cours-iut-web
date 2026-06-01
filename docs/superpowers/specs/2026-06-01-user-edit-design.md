# Design — Édition des utilisateurs (admin)

**Date :** 2026-06-01
**Statut :** Approuvé

---

## Contexte

L'espace admin dispose d'un tableau d'utilisateurs (`UsersTable` / `UserRow`) avec une seule action : supprimer. Ce spec couvre l'ajout d'une action **Modifier** ouvrant un dialog d'édition reprenant la DA de `ModuleInfo` (composant "Plus d'infos").

---

## Périmètre

### Champs éditables
- `name` — nom d'affichage
- `email` — adresse email
- `username` — nom d'utilisateur (plugin `username` de better-auth)
- `group` — groupe TD/TP (champ custom, optionnel)
- `role` — `"user"` | `"admin"`

### Actions supplémentaires
- **Bannir / Débannir** — toggle immédiat (réversible, pas de confirmation), dans une section dédiée du dialog.

---

## Composants

### Nouveau : `EditUserDialog`
- Chemin : `src/components/admin/users/EditUserDialog.tsx`
- Client component (`"use client"`)
- Props :
  ```ts
  interface EditUserDialogProps {
      user: AdminUser;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onUpdated: (updated: AdminUser) => void;
  }
  ```
- DA : même `DialogContent` que `ModuleInfo` —
  `bg-[#f7ebd9] dark:bg-[#13110d]`, `border border-bridge-500/45`, ombre chaude, header `bg-brand-primary` avec badge icône `UserCog`.

### Modifié : `UserRow`
- Ajout d'un bouton `Pencil` dans la colonne Actions (à gauche du bouton Trash).
- Nouvelle prop `onEdit: (user: AdminUser) => void`.

### Modifié : `UsersTable`
- State local : `editingUser: AdminUser | null`
- Passe `onEdit` à chaque `UserRow`.
- Monte `<EditUserDialog>` avec `open={!!editingUser}`.
- Callback `onUpdated` remplace la ligne dans le state sans refetch.

### Modifié : `AdminUser` (interface dans `UsersTable.tsx`)
```diff
+ username?: string | null
+ banned?: boolean | null
```

---

## Formulaire

**Librairie :** react-hook-form + Zod (cohérent avec `EditModuleSheet`)

**Schéma Zod :**
```ts
const userEditSchema = z.object({
    name:     z.string().min(1, "Requis"),
    email:    z.string().email("Email invalide"),
    username: z.string().min(3).max(32),
    group:    z.string().optional(),
    role:     z.enum(["user", "admin"]),
});
type UserEditValues = z.infer<typeof userEditSchema>;
```

**Layout du dialog :**
```
┌─────────────────────────────────────────┐
│ [UserCog]  Utilisateur                  │  header bg-brand-primary
│            Modifier le compte           │
├─────────────────────────────────────────┤
│  PROFIL                                 │  Eyebrow
│  Nom affiché  [________________]        │
│  Email        [________________]        │
│  Nom d'utilis.[________________]        │
│                                         │
│  ────────────────────────────────────── │
│  ADMINISTRATION                         │  Eyebrow
│  Groupe       [________________]        │
│  Rôle         ○ Étudiant  ● Admin       │  RadioGroup
│                                         │
│  ────────────────────────────────────── │
│  ACCÈS                                  │  Eyebrow
│  [Bannir cet utilisateur]               │  bouton ghost rouge (ou "Débannir")
├─────────────────────────────────────────┤
│  [Annuler]              [Enregistrer →] │  footer sticky
└─────────────────────────────────────────┘
```

- Erreurs de validation : `text-red-500 text-xs` sous chaque champ.
- Erreur API globale : message sous le footer.
- `reset()` au réouverture du dialog (`useEffect` sur `open`).

---

## API Routes

### `PATCH /api/admin/users/[userId]`
**Body :** `{ name, email, username, group, role }`

Logique serveur :
1. Vérifier session admin.
2. `auth.api.updateUser({ userId, update: { name, email } })` — champs profil.
3. Si `role` a changé : `auth.api.setRole({ userId, role })`.
4. Mise à jour `group` et `username` directement via le driver MongoDB (better-auth ne les expose pas via `updateUser`).
5. Retourne l'utilisateur mis à jour.

### `POST /api/admin/users/[userId]/ban`
**Body :** `{ banned: boolean }`

- `banned === true` → `auth.api.banUser({ userId })`
- `banned === false` → `auth.api.unbanUser({ userId })`
- Retourne `{ success: true, banned }`.

### `GET /api/admin/users` — champs ajoutés
Ajouter `username` et `banned` dans la projection / mapping du résultat `listUsers`.

---

## Mise à jour optimiste

`onUpdated(updatedUser: AdminUser)` dans `UsersTable` :
```ts
setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
```
Aucun refetch — la ligne est mise à jour instantanément.

---

## Gestion d'erreurs

| Cas | Comportement |
|---|---|
| Email déjà utilisé | Message sous le champ email |
| Username déjà utilisé | Message sous le champ username |
| Erreur réseau / 500 | Message global sous le footer |
| Ban d'un admin | Autorisé (l'admin peut se bannir lui-même — à gérer côté UX si nécessaire) |

---

## Ce qui n'est PAS dans ce spec

- Confirmation avant ban (action réversible, jugée non nécessaire)
- Édition de l'avatar/image
- Historique de sessions ou logs d'activité
- Pagination du tableau (déjà limité à 200 utilisateurs)
