---
name: pedagogy-review
description: À utiliser quand un contenu pédagogique existant (Cours, TP, Slide, Examen) doit être critiqué ou audité avant correction.
---

# Skill — Révision de contenus pédagogiques IUT

## Invocation

```
/pedagogy:review [module] [section]    → révision de la section mentionnée ou active
```

## Étape 0 — Collecte MCP (obligatoire avant tout dispatch)

1. Identifier `module` et `section` (slugs DB, via args ou question).
2. `list_modules()` → `MODULE_META` (`sessionDurationMinutes`, `isExtra`, `universe`).
3. `list_sections(module)` → `SECTION_META` (`totalDuration`, objectifs).
4. Pour chaque type (cours, slide, TP, examen) : `get_content(module, section, type)`
   → `CONTENU_COURS`, `CONTENU_SLIDE`, `CONTENU_TP`, `CONTENU_EXAMEN`
   (utiliser `export_content_compact` si le contenu est volumineux).
   Types absents : noter `MANQUANT`.
5. **Aucun contenu en DB pour cette section → STOP** avec message explicite. Jamais de
   repli silencieux sur `src/cours/*.tsx`.
6. Lire `reviews/[module]-curriculum.md` : présent → `CONTENU_CURRICULUM` ;
   absent → `CURRICULUM_ERREUR = "Curriculum introuvable — lancez /pedagogy:sync sur
   les sections précédentes"`.
7. Calculer le budget TP (cf. `skills/pedagogie/references/tp.md`, section Calibrage) :
   il sera transmis aux auditeurs dans le contrat d'entrée.

## Routage

- **Modification locale** (orthographe, reformulation) → agent principal seul.
- **Révision d'un seul support** → Concepteur + Auditeur apprenant + consolidation ;
  ajouter le Garant si curriculum disponible et contenu dépendant du parcours.
- **Modification structurante** (objectif, notion, prérequis, évaluation) → les trois
  sous-agents.
- **Unité complète (cours + slides + TP)** → les trois sous-agents, obligatoires.

## Contrat d'entrée commun

Remplir le contrat YAML du document `main` (`skills/pedagogie/SKILL.md`), avec :
budget chiffré en minutes, `universe` du module, contenus collectés à l'étape 0.
Champs inconnus = « indisponible », jamais inventés.

## Dispatch des sous-agents

Pour chaque rôle à dispatcher, construire le prompt du sous-agent Task ainsi :

1. Lire le document de rôle avec l'outil Read :
   - Concepteur → `skills/pedagogie/agents/concepteur.md`
   - Auditeur apprenant → `skills/pedagogie/agents/auditeur-apprenant.md`
   - Garant de cohérence → `skills/pedagogie/agents/garant-coherence.md`
2. Prompt = contenu du document de rôle + contrat d'entrée + contenus
   (`CONTENU_COURS`, `CONTENU_SLIDE`, `CONTENU_TP`) + curriculum (garant uniquement).
3. Consigne de sortie : items `- [ ] [support / localisation] Problème : … →
   Suggestion : …` en plus des formats YAML propres à chaque rôle (`finding`,
   `time_audit`).

**Ne jamais recopier ou paraphraser les documents de rôle dans ce skill** — ils sont
la source de vérité unique, partagée avec les clients MCP web.

## Consolidation

1. Dédupliquer les constats portant sur le même problème.
2. Arbitrer les recommandations contradictoires (conserver la plus précise, signaler
   l'arbitrage).
3. Prioriser : `blocking` > `important` > `improvement`.
4. Écrire `reviews/[module]-[section]-REVIEW.md` (écraser si existant) :

```
# REVIEW — [module]/[section] — [date]

## Rapport Concepteur
[items `- [ ]`]

## Rapport Auditeur apprenant
[findings YAML + time_audit + items `- [ ]`]

## Rapport Garant de cohérence
[findings YAML + items `- [ ]` — ou CURRICULUM_ERREUR]

## Analyse d'impact multi-supports
[si applicable]
```

5. Invoquer `/pedagogy:sync` sur le module/section.
6. **Ne pas réécrire le contenu.** La correction passe par `/pedagogy:rewrite`.
