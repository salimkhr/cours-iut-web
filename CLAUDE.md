# CLAUDE.md

Les règles du projet sont communes à tous les agents et vivent dans `AGENTS.md` et `NEXUS.md`.
Ce fichier n'ajoute que ce qui est propre à Claude Code.

@AGENTS.md
@NEXUS.md

## Skills

- **`ui-ux-pro-max`** : avant toute tâche de design, d'UI ou d'UX (composant, layout,
  navigation, couleurs, typographie). Lisez aussi `PRODUCT.md` (stratégie) et `DESIGN.md`
  (système visuel).
- **`impeccable`** : `/impeccable teach` met à jour `PRODUCT.md`, `/impeccable document` met à
  jour `DESIGN.md`. Ce sont les seuls moyens de modifier ces deux fichiers.
- **`humanizer-fr`** : avant de livrer un texte en français destiné aux étudiants (cours, TP,
  slides, examen, e-mail), et en relecture de style. Méthode et score anti-IA dans
  `docs/humanizer/humanizer-fr.md` et `docs/humanizer/score.mjs`.
- **`gitnexus-*`** : guides détaillés d'analyse d'impact, de debug et de refactor (voir
  `NEXUS.md`).
- **`content-writer-v3`** : pour rédiger ou relire cours, slides, TP et examens. Le pipeline lit
  lui-même `list_verdicts` et `list_exemplars`.
- **Serveur MCP du référentiel pédagogique** : pour concevoir un module, chargez d'abord le
  skill `module-design` du serveur (`get_pedagogical_skill_manifest`), puis lisez `list_verdicts`
  et `list_exemplars`.
