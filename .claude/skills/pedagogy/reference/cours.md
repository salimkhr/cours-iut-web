# Règles pédagogiques — Type : Cours

## Chapeau obligatoire "À savoir pour ce cours"

**Toujours présent en tête de cours, avant tout contenu.**

- Composant : `Collapsible` de shadcn/ui (`@/components/ui/collapsible`), collapsed par défaut
- Titre affiché sur le trigger : "À savoir pour ce cours"
- Style distinct du contenu : fond `bg-bridge-100/60 dark:bg-bridge-800/40`, bordure, icône ChevronDown
- Contenu : **3 à 5 notions** du ou des cours précédents
- Chaque notion = une phrase de rappel + un micro-exemple de code
  - ≤ 2 lignes de code → `<Code language="...">` inline
  - > 2 lignes → `<CodeCard language="..." title="...">` complet
- Maximum 10 lignes de code au total dans ce bloc
- **En mode écriture** : demander quel cours précède avant de générer ce bloc

Exemple de structure JSX du chapeau :
```tsxteste
<Collapsible className="mb-8 rounded-xl border border-bridge-300/50 bg-bridge-100/60 dark:bg-bridge-800/40 dark:border-bridge-600/40">
    <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 font-semibold text-brand-dark dark:text-brand-light">
        À savoir pour ce cours
        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180"/>
    </CollapsibleTrigger>
    <CollapsibleContent className="px-5 pb-5 flex flex-col gap-3">
        <Text><strong>Les boucles for</strong> répètent un bloc un nombre défini de fois.</Text>
        <Code language="js">for (let i = 0; i &lt; 3; i++) console.log(i);</Code>
        <Text><strong>Les tableaux</strong> stockent plusieurs valeurs dans une seule variable.</Text>
        <Code language="js">const fruits = [&apos;pomme&apos;, &apos;poire&apos;];</Code>
    </CollapsibleContent>
</Collapsible>
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
