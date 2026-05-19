# Règles pédagogiques — Type : Cours

## Chapeau obligatoire "À savoir pour ce cours"

**Toujours présent en tête de cours, avant tout contenu.**

- Composant : `<CoursePrerequisites>` (`@/components/CoursePrerequisites`), collapsed par défaut — wrapper autour de `Collapsible` (`@/components/ui/collapsible`)
- Titre affiché sur le trigger : "À savoir pour ce cours"
- Style distinct du contenu : fond `bg-bridge-100/60 dark:bg-bridge-800/40`, bordure, icône ChevronDown
- Contenu : **3 à 5 notions** du ou des cours précédents
- Chaque notion = une phrase de rappel + un micro-exemple de code
  - ≤ 2 lignes de code → `<Code language="...">` inline
  - > 2 lignes → `<CodeCard language="..." title="...">` complet
- Maximum 10 lignes de code au total dans ce bloc
- **En mode écriture** : demander quel cours précède avant de générer ce bloc

Exemple de structure JSX du chapeau :
```tsx
import CoursePrerequisites from "@/components/CoursePrerequisites";

<CoursePrerequisites>
    <Text><strong>Les boucles for</strong> répètent un bloc un nombre défini de fois.</Text>
    <CodeCard language="js" title="Boucle for">
        {`for (let i = 0; i < 3; i++) console.log(i);`}
    </CodeCard>
    <Text><strong>Les tableaux</strong> stockent plusieurs valeurs dans une seule variable.</Text>
    <CodeCard language="js" title="Tableau">
        {`const fruits = ['pomme', 'poire'];`}
    </CodeCard>
</CoursePrerequisites>
```

## Structure imposée pour chaque concept

Chaque concept du cours doit suivre cet ordre :

1. **Contexte** — pourquoi ce concept existe, quel problème concret il résout (1 `<Text>`)
2. **Définition** — explication en langage naturel, sans jargon préalable (1 `<Text>`)
3. **Exemple minimal** — le cas le plus simple possible (`<CodeCard>`)
4. **Exemple complet** — cas réaliste et utile (`<CodeCard>` ou `<CodeWithPreviewCard>`)
5. **Pièges courants** — 2 à 3 erreurs fréquentes avec explication (`<List>` non ordonnée)

## Règles supplémentaires

- Chaque terme technique **défini avant sa première utilisation**, jamais l'inverse
- Progression linéaire : chaque section repart de ce que l'étudiant vient d'apprendre
- Jamais de code brut dans le texte — toujours dans `<Code>` (inline) ou `<CodeCard>`
- Les `<CodeCard>` ont toujours un `title` descriptif ("Syntaxe de base", "Exemple complet", etc.)
- Un seul grand thème par `<section>`, préfixé `A-`, `B-`, `C-` sur le `<Heading level={2}>`
