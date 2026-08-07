# Bootstrap Onzer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer sur l'infrastructure staging une section Bootstrap 5.3.8 composée d'un cours progressif et d'un TP cumulatif autour de l'interface musicale Onzer.

**Architecture:** La section est créée dans `html-css` via le MCP staging, puis chaque contenu est sauvegardé comme un arbre complet de blocs DB. Le cours et le TP sont relus séparément après écriture ; aucun fichier de cours local et aucune donnée de production ne sont modifiés.

**Tech Stack:** MCP `cours-iut-staging`, blocs pédagogiques MongoDB, Bootstrap 5.3.8 via jsDelivr.

## Global Constraints

- Cible unique : infrastructure staging.
- Module : `html-css`.
- Section : `3-bootstrap-onzer`, position 3, durée 2 séances.
- Contenus : `cours` et `TP`.
- Version Bootstrap : 5.3.8.
- CSS CDN : `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css`.
- Intégrité CSS : `sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB`.
- JS CDN : `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js`.
- Intégrité JS : `sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI`.
- Tous les aperçus sont explicites via `props.preview`.
- Toutes les consignes ordonnées du TP utilisent l'impératif vouvoyé.
- Aucun asset, logo ou texte propriétaire de Deezer n'est repris.

---

### Task 1: Créer la section staging

**External data:**
- Read: MCP `list_sections(module: "html-css")`
- Create: MCP `create_section`

**Interfaces:**
- Consumes: module staging `html-css` avec sections 1 et 2 existantes.
- Produces: section `3-bootstrap-onzer` avec squelettes DB `cours` et `TP`.

- [ ] **Step 1: Vérifier l'absence de la section**

Appeler `list_sections({ module: "html-css" })` et vérifier qu'aucun slug ne vaut `3-bootstrap-onzer`.

- [ ] **Step 2: Créer la section**

Appeler `create_section` avec :

```json
{
  "module": "html-css",
  "path": "3-bootstrap-onzer",
  "title": "Bootstrap avec Onzer",
  "order": 3,
  "totalDuration": 2,
  "contentTypes": ["cours", "TP"],
  "tags": ["bootstrap", "responsive", "grille", "composants"],
  "objectives": [
    "Installer Bootstrap 5.3.8 avec les liens CDN officiels.",
    "Construire une grille responsive avec les conteneurs, lignes, colonnes et breakpoints Bootstrap.",
    "Mettre en forme une interface avec les couleurs, espacements et utilitaires Bootstrap.",
    "Assembler des composants Bootstrap et identifier ceux qui nécessitent le bundle JavaScript."
  ]
}
```

- [ ] **Step 3: Vérifier les références DB**

Relire `list_sections` et attendre `contents: { cours: "db", TP: "db" }` pour le nouveau slug.

### Task 2: Écrire le cours Bootstrap

**External data:**
- Write: MCP `save_content(module: "html-css", section: "3-bootstrap-onzer", type: "cours")`
- Read: MCP `get_content`

**Interfaces:**
- Consumes: section créée par Task 1 et registre des blocs staging.
- Produces: arbre de cours complet, adressable par des IDs stables préfixés `bootstrap-`.

- [ ] **Step 1: Construire l'arbre du cours**

Créer cinq sections racines :

1. `bootstrap-intro` — rôle du framework et installation CDN ;
2. `bootstrap-layout` — conteneurs, grille 12 colonnes, gutters et breakpoints ;
3. `bootstrap-utilities` — couleurs, espacements, flex et affichage ;
4. `bootstrap-components` — navbar, cartes, boutons, badges, alertes, formulaire et modal ;
5. `bootstrap-onzer-page` — assemblage progressif de la page Onzer et vérification finale.

Chaque notion suit le triptyque : exemple minimal, variante Onzer, erreur fréquente. Utiliser des blocs `text`, `table`, `callout`, `code`, `code-with-preview`, `list` et `list-item`.

- [ ] **Step 2: Ajouter les aperçus Onzer**

Chaque `code-with-preview` reçoit :

```json
{
  "language": "html",
  "code": "<div class=\"row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3\">\n  <div class=\"col\"><article class=\"card h-100\"><div class=\"card-body\"><h3 class=\"h5\">Nuit chromatique</h3><p class=\"text-body-secondary\">Mina Vale</p></div></article></div>\n</div>",
  "preview": "<!doctype html><html lang=\"fr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css\" rel=\"stylesheet\" integrity=\"sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB\" crossorigin=\"anonymous\"></head><body class=\"p-3\"><div class=\"row row-cols-1 row-cols-md-2 row-cols-lg-4 g-3\"><div class=\"col\"><article class=\"card h-100\"><div class=\"card-body\"><h3 class=\"h5\">Nuit chromatique</h3><p class=\"text-body-secondary\">Mina Vale</p></div></article></div></div></body></html>"
}
```

Les aperçus couvrent au minimum l'installation, une grille responsive, les utilitaires, les cartes, la navbar et la page complète.

- [ ] **Step 3: Sauvegarder puis relire le cours**

Appeler `save_content`, puis `get_content`. Vérifier : cinq sections racines, Bootstrap 5.3.8 dans chaque document complet, aucun bloc d'aperçu vide et aucun lien Bootstrap d'une version antérieure.

### Task 3: Écrire le TP Onzer

**External data:**
- Write: MCP `save_content(module: "html-css", section: "3-bootstrap-onzer", type: "TP")`
- Read: MCP `get_content`

**Interfaces:**
- Consumes: APIs Bootstrap introduites dans le cours de Task 2.
- Produces: TP cumulatif sur `index.html`, avec contrat de consigne complet pour chaque exercice.

- [ ] **Step 1: Ajouter le fichier de départ**

Créer un bloc `download-file` nommé `index.html` contenant le doctype, les métadonnées, les textes Onzer et des commentaires délimitant les zones à compléter. Ne pas inclure les classes solutions des exercices suivants.

- [ ] **Step 2: Construire les six exercices**

Créer six sections racines : installation, navigation, zone En écoute, albums et artistes, composants interactifs, finition responsive. Chaque section précise dans ses blocs texte :

- fichier cible `index.html` ;
- classes ou API Bootstrap imposées ;
- résultat observable ;
- critère de validation ;
- consignes ordonnées à l'impératif vouvoyé.

- [ ] **Step 3: Ajouter les contrôles pédagogiques**

Ajouter une erreur fréquente commentée après chaque notion sensible : bundle JS absent, colonne hors `.row`, rupture mobile-first, couleur sans contraste, modal sans attribut `data-bs-*`.

- [ ] **Step 4: Sauvegarder puis relire le TP**

Appeler `save_content`, puis `get_content`. Vérifier la présence des six exercices, du fichier de départ, des quatre éléments du contrat de consigne et l'absence d'infinitifs dans les étapes ordonnées.

### Task 4: Vérification staging finale

**External data:**
- Read: MCP `list_sections`
- Read: MCP `get_content` pour `cours` et `TP`

**Interfaces:**
- Consumes: contenus sauvegardés dans Tasks 2 et 3.
- Produces: rapport final avec compteurs et URLs de relecture staging.

- [ ] **Step 1: Vérifier les métadonnées**

Confirmer le slug, l'ordre 3, la durée 2 et les deux contenus DB.

- [ ] **Step 2: Compter les blocs critiques**

Compter pour chaque contenu : sections racines, blocs de code, blocs `code-with-preview`, aperçus non vides et listes ordonnées.

- [ ] **Step 3: Fournir les URLs de relecture**

Retourner :

```text
/html-css/3-bootstrap-onzer/cours
/html-css/3-bootstrap-onzer/TP
```

Ne proposer une copie en production qu'après validation explicite de l'utilisateur.
