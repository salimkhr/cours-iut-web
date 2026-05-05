# Product

## Register

product

## Users

Étudiants de l'IUT, BUT Informatique, qui viennent ici dans deux contextes très
différents :

1. **En séance** (TP/TD), sur un PC fixe de salle ou leur laptop perso : ils
   consultent vite, jonglent entre l'écran de cours et leur IDE, doivent
   retrouver une syntaxe ou une consigne en quelques secondes sans casser leur
   concentration sur le code.
2. **Chez eux**, le soir ou la veille d'un partiel : lecture longue, révision
   sérieuse, parfois fatiguée, parfois stressée.

Public secondaire : d'autres enseignants peuvent consulter le site, mais
l'auteur (Salim Khraimeche) est autonome sur les contenus, le site n'est pas
une plateforme collaborative. Pas de "module formateur".

## Product Purpose

Site de cours web pour le BUT Informatique : HTML/CSS, JavaScript, PHP,
Brainfuck. Cours, TPs, slides présentables en amphi, examens, et un chat IA
pour débloquer les étudiants. La réussite ressemble à : un étudiant retrouve
en moins de 10 secondes la consigne d'un exercice pendant un TP, et le même
étudiant peut réviser le même chapitre la veille du partiel sans fatigue
visuelle.

## Brand Personality

**Moderne, expert, ludique.**

- **Moderne** au sens "pratique ce que l'on enseigne" : la stack est
  démonstrative (Next 16 App Router, React 19, Tailwind v4, MongoDB,
  better-auth). L'interface elle-même est un exemple du métier qu'elle
  enseigne.
- **Expert** : on parle à des futurs développeurs, pas à des enfants. Pas de
  mascotte, pas de "Bravo 🎉", pas d'émojis décoratifs, pas de pop-ups
  d'encouragement. Le ton est celui d'un enseignant qui respecte ses
  étudiants.
- **Ludique** par justesse, pas par puérilité : Brainfuck dans le programme,
  effet glitch sur le titre, particules dans le hero. L'humour vient des
  choix, pas d'éléments cosmétiques surajoutés.

## Anti-references

- **W3Schools.** Vieux et moche : densité publicitaire, typographie banale,
  navigation années 2000, pas de hiérarchie visuelle. On veut l'opposé sur
  tous les axes, surtout : aucune publicité, contenu prioritaire à 100% de
  l'écran, typographie soignée, pas d'effet "couper-coller" sur les blocs de
  code.
- Par extension, tout le pédago "scolaire institutionnel" : Moodle / Sakai /
  Canvas-style. Beige, confus, hiérarchie plate, formulaires partout.

## Positive references

- **Tailwind UI.** Pour le "feel" : composants nets, espacements respirés,
  typographie disciplinée, sobriété qui laisse le contenu parler. Ce n'est
  pas une référence pédagogique, c'est une référence de **discipline visuelle
  product-grade**.

## Design Principles

1. **Practice what you preach.** Le site est lui-même un artefact de cours.
   Si une page n'est pas un bon exemple de code Next 16 / Tailwind v4 / a11y,
   elle ne peut pas être livrée. L'inspecteur DevTools fait partie de la
   surface publique.
2. **Densité d'expert, pas surface infantile.** Pas d'aide condescendante,
   pas de tutoriels-pour-débutants enrobés. L'étudiant en BUT Info est traité
   comme un dev en formation. Le ludique vient des choix éditoriaux
   (Brainfuck, glitch), jamais d'éléments cosmétiques pour "rendre fun".
3. **Lisibilité avant décoration.** La cible la plus exigeante est l'étudiant
   fatigué qui révise à 1h du mat la veille du partiel. Typographie,
   contraste, longueurs de ligne et espacements priment sur tout effet
   visuel. Les particules et animations peuvent disparaître sans perte
   d'identité.
4. **Couleur = repère, pas ornement.** Les quatre couleurs par langage
   (HTML/CSS rouille, PHP slate-violet, JS or, Brainfuck violet) sont un
   système de wayfinding : un coup d'œil suffit à savoir quel langage on
   regarde. Elles n'ont pas leur place ailleurs (boutons d'action, états
   d'UI, accents décoratifs).
5. **Vitesse de retrouvaille.** Le scénario "TP en cours, je cherche une
   consigne" doit aboutir en < 10 secondes : navigation prévisible, recherche
   visible, slugs lisibles, pas de modal qui m'enferme.

## Accessibility & Inclusion

Niveau visé : **WCAG 2.2 AA au minimum**, AAA quand c'est faisable sans
sacrifier la personnalité (notamment contraste de texte courant).

Considérations spécifiques au projet :

- **Daltonisme.** Le système de couleurs par langage est sensible (rouille +
  or peuvent se confondre en deutéranopie ; le violet Brainfuck et le
  slate-violet PHP également). La couleur n'est jamais le seul porteur de
  sens : elle est toujours doublée d'un libellé textuel (nom du module) ou
  d'un picto.
- **`prefers-reduced-motion`.** Respecté strictement : particules dans le
  hero, effet glitch sur le titre, fade-in/up et card-hover translate sont
  désactivés ou neutralisés quand l'utilisateur le demande. Le site doit
  rester complètement utilisable sans aucune animation.
- **Lecteurs d'écran.** Les blocs de code et diagrammes Mermaid ont un
  équivalent textuel ou un titre descriptif ; les icônes décoratives sont
  `aria-hidden`.
- **Cibles tactiles.** Bien que le public principal soit sur clavier/souris
  (PC fixe IUT, laptop), les étudiants consultent occasionnellement sur
  mobile : zones cliquables ≥ 44×44 px.
