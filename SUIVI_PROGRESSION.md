# Suivi de progression des étudiants — Réflexion

> Document de travail — aucun code modifié à ce stade.
> Date de rédaction : 2026-05-15

---

## Objectif

Permettre à l'admin (enseignant) de savoir où en sont les étudiants, notamment pour savoir
si la promo est prête à passer au TP suivant.

---

## Approche retenue : mixte passif + actif

### Tracking passif (automatique, transparent)

- Enregistrement des visites par page/TP avec timestamp
- Durée approximative passée sur chaque contenu (temps de session)
- Détection de première ouverture vs. relectures

**Ce que ça apporte :** contexte objectif, sans dépendre de l'étudiant.

### Tracking actif (déclaratif, volontaire)

- Un bouton **"J'ai terminé ce TP"** par TP
- Action consciente de l'étudiant, signal fiable de complétion

**Ce que ça apporte :** signal de complétion fort + rituel de clôture pour l'étudiant.

### Pourquoi le mixte est meilleur que l'un ou l'autre seul

| Scénario | Passif seul | Actif seul | Mixte |
|---|---|---|---|
| Étudiant ouvre le TP 30 sec et part | Vu mais non qualifié | Rien | Vu, durée courte, non terminé |
| Étudiant termine sans cliquer | Vu longtemps | Rien | Vu longtemps → probablement terminé |
| Étudiant termine et clique | Vu | Terminé | Vu + terminé → signal fort |
| Étudiant n'ouvre pas du tout | Absent | Absent | Absent → contactable |

---

## Vue admin envisagée

### Dashboard global

- Tableau : ligne = étudiant, colonne = TP, cellule = statut
  - Pas commencé / Ouvert / Terminé (+ durée approximative)
- Alerte si un étudiant n'a pas ouvert un TP X jours après publication

### Vue par étudiant

- Timeline de progression
- Dernier TP consulté, date, durée

### Vue par TP

- % de la promo ayant cliqué "Terminé"
- Durée médiane
- Étudiants bloqués (ouvert depuis longtemps, pas terminé)

---

## Considérations RGPD

### Base légale

**Intérêt légitime** de l'établissement à suivre la progression pédagogique dans le cadre
de la formation. Relation contractuelle claire (étudiant inscrit à l'IUT).

### Ce qui est requis

| Obligation | Action à prévoir |
|---|---|
| Information des étudiants | Compléter `politique-confidentialite` et `mentions-legales` (pages déjà existantes) |
| Durée de conservation | Définir une limite : fin d'année scolaire ou fin de formation |
| Droit d'accès | Un étudiant peut demander à voir ses données |
| Droit à l'effacement | À encadrer selon le règlement intérieur |
| Minimisation des données | Ne collecter que ce qui est utile — pas d'IP, pas de user-agent |

### Ce qu'il ne faut PAS faire

- Tracker sans avoir informé les étudiants au préalable
- Conserver les données après la fin de formation sans justification
- Exposer les données d'un étudiant à un autre étudiant

### Ce qui est déjà en place

Les pages `politique-confidentialite` et `mentions-legales` existent. Il suffira de les
compléter pour mentionner explicitement le suivi pédagogique.

### Conclusion RGPD

Démarche défendable sans difficulté dans un cadre IUT, sans DPO ni procédure lourde,
à condition d'informer les étudiants.

---

## Implémentation — À définir

### Données à stocker en MongoDB

```
Collection : student_progress
{
  userId       : ObjectId  // référence à l'utilisateur better-auth
  moduleSlug   : string    // ex: "javascript"
  contentSlug  : string    // ex: "1-le-dom"
  contentType  : "cours" | "tp" | "slide" | "examen"
  firstOpenAt  : Date
  lastOpenAt   : Date
  totalDuration: number    // secondes (approximatif)
  completedAt  : Date | null  // null = pas encore terminé
}
```

### Composants à créer

- `ProgressTracker` — client component, enregistre les visites/durée silencieusement
- Bouton "J'ai terminé ce TP" — dans les pages TP uniquement
- `/admin/progression` — dashboard de suivi

### Routes API à créer

- `POST /api/progress/visit` — enregistre une visite
- `POST /api/progress/complete` — marque comme terminé
- `GET  /api/progress` — données pour le dashboard admin (admin only)

---

## Prochaines étapes (quand on décide de démarrer)

1. Compléter `politique-confidentialite` avec la mention du suivi
2. Créer la collection MongoDB + schéma
3. Implémenter le tracking passif (visite + durée)
4. Ajouter le bouton "Terminé" sur les pages TP
5. Créer le dashboard `/admin/progression`
