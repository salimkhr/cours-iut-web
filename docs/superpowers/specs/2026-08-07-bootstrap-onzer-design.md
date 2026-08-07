# Section Bootstrap avec Onzer

## Objectif

Ajouter sur l'infrastructure staging du module `html-css` une troisième section
consacrée à Bootstrap. La section fait passer les étudiants de l'installation par
CDN à la construction d'une interface responsive complète inspirée d'un service de
streaming musical, nommé **Onzer**.

La documentation cible Bootstrap **5.3.8**, version courante affichée par la
documentation officielle au moment de la rédaction :
<https://getbootstrap.com/docs/5.3/getting-started/introduction/>.

## Métadonnées

- Module : `html-css`
- Slug : `3-bootstrap-onzer`
- Titre : `Bootstrap avec Onzer`
- Position : 3
- Durée : 2 séances
- Contenus : `cours` et `TP`
- Tags : `bootstrap`, `responsive`, `grille`, `composants`

Objectifs étudiants :

- installer Bootstrap avec les liens CDN officiels ;
- expliquer le rôle des conteneurs, lignes et colonnes ;
- construire une grille responsive avec les breakpoints Bootstrap ;
- utiliser les couleurs, espacements, flexbox et utilitaires d'affichage ;
- intégrer des composants Bootstrap sans recopier leur CSS ;
- identifier les composants qui nécessitent le bundle JavaScript ;
- assembler une page Onzer responsive et accessible.

## Cours

Le cours est progressif : chaque notion enrichit la même page Onzer. Chaque rendu
visuel utilise un bloc `code-with-preview` avec une prop `preview` explicite.

### A. Installer Bootstrap

- rôle d'un framework CSS ;
- balise `meta viewport` ;
- feuille CSS Bootstrap 5.3.8 dans `head` ;
- bundle JavaScript avant `</body>` ;
- attributs `integrity` et `crossorigin` ;
- différence entre composants CSS seuls et composants interactifs.

### B. Structurer la page

- `.container` et `.container-fluid` ;
- grille sur 12 colonnes ;
- `.row`, `.col`, `.col-*` et gouttières ;
- breakpoints `sm`, `md`, `lg`, `xl`, `xxl` ;
- `.row-cols-*` et composition responsive ;
- erreur fréquente : placer une colonne hors d'une ligne.

### C. Utiliser les classes utilitaires

- couleurs de texte et de fond ;
- espacements `m-*`, `p-*`, `gap-*` ;
- flexbox, alignement et justification ;
- largeur, affichage et responsive ;
- contraste et limites des couleurs sémantiques.

### D. Composer Onzer

- navbar responsive ;
- cartes d'albums et grille de recommandations ;
- boutons, badges et alertes ;
- formulaire de recherche ;
- modal de détails nécessitant le bundle JavaScript ;
- assemblage d'une page complète avec navigation, zone "En écoute" et catalogue.

Le cours se termine par une vérification courte : choix de classes adaptées à
trois situations et diagnostic d'une grille mal structurée.

## TP

Le TP construit `index.html` par étapes cumulatives. Un fichier de départ fournit
le squelette HTML et les données textuelles Onzer ; les étudiants écrivent la
structure et les classes Bootstrap demandées.

### Exercice 1 - Installation

- fichier cible : `index.html` ;
- méthode imposée : CDN officiel Bootstrap 5.3.8 avec CSS et bundle JavaScript ;
- résultat : une page charge Bootstrap sans erreur réseau ;
- validation : les classes `container` et `btn` modifient le rendu.

### Exercice 2 - Navigation et recherche

- API imposée : navbar responsive, formulaire Bootstrap et bouton ;
- résultat : navigation Onzer repliable sur petit écran ;
- validation : le menu s'ouvre grâce au bundle JavaScript.

### Exercice 3 - Zone En écoute

- API imposée : grille Bootstrap, utilitaires flex, espacements et couleurs ;
- résultat : pochette, titre, artiste et commandes alignés ;
- validation : la disposition passe d'une colonne à deux colonnes au breakpoint prévu.

### Exercice 4 - Albums et artistes

- API imposée : `.row`, colonnes responsives, cartes, badges et `.row-cols-*` ;
- résultat : catalogue musical responsive ;
- validation : 1 carte par ligne sur mobile, 2 sur tablette, 4 sur grand écran.

### Exercice 5 - Composants interactifs

- API imposée : alert et modal Bootstrap avec attributs `data-bs-*` ;
- résultat : confirmation d'ajout à une playlist et fiche album en modal ;
- validation : les interactions fonctionnent sans JavaScript personnalisé.

### Exercice 6 - Finition responsive

- API imposée : utilitaires d'affichage, espacements et alignement ;
- résultat : page Onzer cohérente de 375 px à 1440 px ;
- validation : aucun débordement horizontal, navigation utilisable au clavier,
  images dotées d'un texte alternatif et titres hiérarchisés.

## Données et rendu

Les contenus utilisent des noms fictifs d'artistes, albums et playlists. Onzer
reprend les conventions d'une plateforme musicale, sans logo, contenu éditorial ou
asset propriétaire de Deezer. Les aperçus utilisent des images de démonstration
publiques et des textes alternatifs explicites.

## Écriture MCP

1. Créer la section et les squelettes `cours` et `TP` sur staging.
2. Sauvegarder l'arbre complet du cours.
3. Relire et valider le cours.
4. Sauvegarder l'arbre complet du TP.
5. Relire les deux contenus et vérifier la présence des aperçus.
6. Mettre à jour les métadonnées et le curriculum de la section si les outils le permettent.

Aucune écriture n'est effectuée sur la production.

## Vérification

- la section apparaît en position 3 avec `cours` et `TP` en source DB ;
- tous les arbres de blocs sont acceptés par le registre staging ;
- chaque bloc `code-with-preview` contient une prop `preview` non vide ;
- les consignes du TP sont à l'impératif vouvoyé ;
- chaque exercice précise fichier cible, API imposée, résultat et validation ;
- les liens CDN correspondent à Bootstrap 5.3.8 ;
- le rendu est relu sur mobile et desktop avant toute proposition de copie en production.
