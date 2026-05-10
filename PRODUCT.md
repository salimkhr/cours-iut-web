# Product

## Register

product

## Users

Étudiants en BUT Informatique à l'IUT, niveau débutant à intermédiaire. Usage en
contextes alternés : en TP encadré sur PC fixe (lecture du cours pendant qu'ils
codent), et à domicile sur laptop pour révision, examen, rattrapage. Public
francophone, charge cognitive élevée pendant l'apprentissage de nouvelles
syntaxes (HTML/CSS, JS, PHP, Brainfuck).

## Product Purpose

Plateforme pédagogique pour consulter et travailler les contenus de cours web
(cours, TP guidés, slides, examens). Le site doit aider à comprendre et retenir,
pas juste à abattre une checklist d'exercices. La clarté de hiérarchie et la
confiance ressentie face au contenu priment sur le volume traité.

## Brand Personality

Pédagogue chaleureux. Ton humain, accueillant, bienveillant. Rigueur technique
sans froideur corporate. Impression de prof sympa qui explique, pas d'une
plateforme institutionnelle anonyme.

3 mots : chaleureux, lisible, fiable.

## Anti-references

- **W3Schools / docs anciennes** : jaune criard, pubs, mise en page désuète,
  navigation labyrinthique, exemples de code mal mis en valeur, écrans où
  l'œil ne sait pas où poser.
- Par extension : doc HTML4 brute, pages monobloc sans hiérarchie, layouts
  années 2000.

## Design Principles

1. **La lecture d'abord** — Le contenu pédagogique est le héros. Tout chrome
   (nav, switcher, hero compact) sert la lecture, pas la concurrence.
2. **Hiérarchie évidente** — L'étudiant scanne et comprend la structure d'un
   cours/TP au premier regard. Titres marqués, blocs de code distincts,
   consignes TP repérables.
3. **Tons chauds, pas froids** — Palette bridge (tan/brun) en chrome, couleurs
   par module (rouge/jaune/indigo/violet) en accents identitaires. Jamais de
   bleu corporate par défaut.
4. **Encourager, pas intimider** — Boutons d'action explicites, états
   désactivés clairs (sections verrouillées), feedback hover qui rassure.
5. **Confort sur sessions longues** — Largeur de lecture 65-75ch sur le corps,
   contrastes WCAG AA, dark mode soigné pour révision tardive.

## Accessibility & Inclusion

- WCAG AA : contrastes texte ≥4.5:1, UI ≥3:1, navigation clavier complète,
  focus visibles (déjà fournis par shadcn/Radix).
- Couleurs par module : ratios blanc/couleur ≥5.2:1 sur tous les modules
  (cf. globals.css), donc utilisables en surface remplie avec texte blanc.
- Respecter `prefers-reduced-motion` sur les animations Framer Motion.
- Alt text systématique sur images de hero et diagrams pédagogiques.
