---
name: pedagogy-module
description: Brainstorm du curriculum d'un nouveau module (sections ordonnées + objectifs + types de contenu) pour le site de cours IUT BUT Informatique, puis création du squelette via les outils MCP.
---

# Skill — Brainstorm & création d'un module pédagogique

## Invocation

| Commande                   | Comportement                                  |
|----------------------------|-----------------------------------------------|
| `/pedagogy:module`         | Demande le sujet du module                    |
| `/pedagogy:module rust`    | Sujet « Rust » directement                    |

## Rôle

Concevoir le **curriculum** d'un nouveau module, puis créer son **squelette** (module + sections +
cours/TP/examen vides) via les outils MCP. Le **contenu** des cours/TP se rédige ensuite avec
`/pedagogy:write`. Ce skill ne rédige PAS le contenu : il structure et crée le squelette.

## Principes (hérités de pedagogy)

- Public : étudiants BUT Informatique, débutants à intermédiaires. Vouvoiement strict côté étudiant.
- Progression : chaque section s'appuie sur les précédentes ; expliciter les prérequis.
- Objectifs d'apprentissage formulés par capacité (« À la fin, vous saurez… »).
- Types de contenu créables : **cours**, **TP**, **examen** (slide/projet hors périmètre du builder).

## Flux

1. **Cadrage** — poser ces questions **une à la fois** (attendre la réponse avant la suivante) :
   - Sujet et intitulé du module (si non fourni).
   - Public visé (année BUT) et prérequis supposés.
   - Ampleur : nombre de séances/sections visé, et grande progression souhaitée.
2. **Brainstorm du curriculum** — proposer une **liste ordonnée de sections**, chacune avec :
   - un `title` clair,
   - 2-4 **objectifs d'apprentissage**,
   - les **types de contenu** (`cours` / `TP` / `examen`).
   Proposer, ajuster avec l'utilisateur, **faire valider le plan complet**.
3. **Création du squelette** (après validation) — via les outils MCP, dans l'ordre :
   - `create_module` avec `title` (et `description` si pertinent ; `iconName` optionnel).
   - pour chaque section, dans l'ordre : `create_section` avec `module`, `title`, `contentTypes`,
     `order`, `objectives`, `totalDuration`.
   Annoncer la progression (« Section 3/6 créée »).
4. **Conclusion** — indiquer le path du module et inviter à remplir le contenu :
   « Squelette créé. Lancez `/pedagogy:write cours` pour rédiger la première section. »

## Si le MCP n'est pas connecté

Ne pas bloquer : présenter le **plan de curriculum en markdown** (tableau sections / objectifs /
types) pour création manuelle ultérieure dans l'admin, et le signaler clairement.

## Garde-fous

- Ne jamais créer le squelette **avant** validation explicite du plan par l'utilisateur.
- Ne pas inventer de métadonnées admin (coefficients, SAE, intervenants) : laissées vides,
  `isExtra:true` par défaut côté MCP.
- Une seule `create_module` par module ; si le path existe déjà, le signaler et proposer un autre.
