---
name: pedagogy-write
description: Rédaction de nouveaux contenus pédagogiques (Cours, TP, Slide, Examen) pour le site de cours IUT BUT Informatique.
---

# Skill — Rédaction de contenus pédagogiques IUT

## Invocation

| Commande                  | Comportement                                              |
|---------------------------|-----------------------------------------------------------|
| `/pedagogy:write`         | Demande le type (Cours / TP / Slide / Examen)             |
| `/pedagogy:write cours`   | Type Cours directement                                    |
| `/pedagogy:write tp`      | Type TP directement                                       |
| `/pedagogy:write slide`   | Type Slide directement                                    |
| `/pedagogy:write examen`  | Type Examen directement                                   |

---

## Principes communs

- **Public cible** : étudiants BUT Informatique 1ère/2ème/3eme année, débutants à intermédiaires en développement web
- **Langue** : français, **vouvoyé strict** dans toutes les instructions destinées aux étudiants
- **Ton** : précis, bienveillant, sans condescendance — expliquer le POURQUOI avant le COMMENT
- **Exemples** : toujours concrets et ancrés dans un cas réel. Jamais de `foo`, `bar`, `test1`, `exemple`
- **Composants JSX imposés** : `Text`, `Heading`, `List`/`ListItem`, `Code`, `CodeCard`, `CodeWithPreviewCard`, `ImageCard`, `DiagramCard`, `SectionCard`. **Jamais** de `<p>`, `<ul>`, `<li>`, `<h2>`, `<code>` bruts.
- **Apostrophes en JSX** : toujours échappées (`&apos;` ou `&rsquo;`). Guillemets : `&quot;`.
- **Structure de page** : `<article><section>` avec préfixes `A-`, `B-`, `C-` sur `<Heading level={2}>` et `1.`, `2.`, `3.` sur `<Heading level={3}>`

---

## Flux

1. Si le type de contenu n'est pas précisé, demander : **Cours / TP / Slide / Examen ?**
2. Lire le fichier de référence correspondant avec l'outil Read :
   - Cours  → `.claude/skills/pedagogy/reference/cours.md`
   - TP     → `.claude/skills/pedagogy/reference/tp.md`
   - Slide  → `.claude/skills/pedagogy/reference/slide.md`
   - Examen → `.claude/skills/pedagogy/reference/examen.md`
3. Poser **1–2 questions de contexte** avant de générer (sujet traité, cours précédent si type Cours, prérequis supposés)
4. Générer le contenu directement dans la structure JSX du projet en suivant scrupuleusement les règles du fichier de référence
