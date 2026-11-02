# Skill content-writer — Renvoi vers le pipeline Claude Code

La rédaction ne se fait plus depuis ce serveur. Cours, slides, TP et examens passent par
le pipeline `/content-writer-v3`, dans Claude Code, depuis le dépôt du site : il a besoin
d'agents, d'un bac à sable Docker et de brouillons locaux, qu'une conversation de l'app
Claude n'a pas.

## Que faire

Ne rédigez aucun support et n'écrivez rien sur le serveur. Répondez en une phrase, avec la
commande qui correspond à la demande, puis arrêtez-vous :

| Demande | Réponse |
|---|---|
| Préparer une section pas encore rédigée | `/content-writer-v3 conception <module> <section>` |
| Préparer une section simple, sans cadrage | `/content-writer-v3 conception-rapide <module> <section>` |
| Rédiger une section dont le plan est validé | `/content-writer-v3 redaction <module> <section>` |
| Relire des supports déjà en ligne | `/content-writer-v3 relecture <module> <section>` |
| Écrire l'examen de fin de module | `/content-writer-v3 examen <module>` |

## Autres demandes

- Une petite correction sur un support en ligne : chargez le document `retouche`
  (`get_pedagogical_skill_document` avec `id="retouche"`).
- La conception d'un module entier : chargez le document `module-design`.
