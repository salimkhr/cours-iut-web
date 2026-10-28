# Correction et clôture (mode `redaction`, spec § 2 étapes 8 et 9)

À lire une fois le TP validé, écrit en prod et relu au navigateur. Chaque écriture en
prod ci-dessous est la vôtre, annoncée en une phrase et faite après la confirmation
explicite de l'utilisateur, une confirmation par écriture.

## 1. Correction (TP uniquement, jamais pour un examen sans demande explicite)

1. **Bac à sable** (`bac-a-sable.md`) : run-id `<module>-<section>-corr-<horodatage>`,
   sous-dossiers `correction`, `fournis`, `depart`, `supports`. Dépôt des supports :
   `bun src/scripts/brouillon.ts deposer "<dir>" <cours.json> <tp.json> --titre "<…>"`.
   État initial du fil rouge dans `depart\` s'il est reconstituable. Vérifiez les
   extensions exigées (`php -m`) ; il en manque une : dites-le, proposez le rebuild.
2. **Agent `correction`** : prompt avec le module, la section, le conteneur, les
   chemins `/work/supports/tp.md` et `cours.md`, la liste de `fournis/` et `depart/`, la
   **liste des contrats** rendue par `redacteur-tp` (recopiée telle quelle), l'adresse du
   TP pour le README. Ports 8030–8039.
3. **Contrôle** : définition de terminé complète ; un dossier par exercice et bonus, plus
   `fil-rouge/` et `README.md` ; noms identiques aux contrats ; chaque vérification avec
   sa sortie et sa conformité. Lisez vous-même les fichiers dans `<dir>\correction\`.
   « Contrats à revoir » : un écart entre le contrat et le code qui marche est un défaut
   du TP, présenté à l'utilisateur (amendement du plan puis correction du TP, comme
   `redaction.md` § 7). « Non exécuté » : rapport incomplet, dites pourquoi (limite
   d'environnement) et demandez s'il faut pousser quand même.
4. **Push** (`push_correction`, prod) : il publie sur le projet GitLab **public**
   `correction/<module>/<section>`, remplace toute son arborescence et passe
   `hasCorrection` à `true`. Annoncez-le (nombre de fichiers, liste des dossiers),
   attendez la confirmation, puis appelez-le avec tous les fichiers de
   `<dir>\correction\` (chemins relatifs, contenu texte). Rappelez ensuite que
   `correctionIsAvailable` reste à activer dans l'admin : vous ne le faites pas.
5. Nettoyage du bac à sable, preuve collée. Statut (phase « correction »), commit.

GitLab injoignable : le push échoue ; gardez les fichiers (copiez `<dir>\correction\`
dans le scratchpad avant le nettoyage), notez-le dans le statut et passez à la clôture.

## 2. Clôture

Dans cet ordre, chaque écriture prod avec sa confirmation :

1. **Écarts réalisés** : relisez les rubriques « Rédaction » et « Relectures du plan ».
   Mettez à jour le plan : rubrique « Écarts réalisés » (repère, ce qui a changé, date),
   sans réécrire le plan validé.
2. **`curriculum`** de la section (`edit_section`, prod) : les notions effectivement
   enseignées et les API vues, tirées des blocs écrits en prod (exports `cours.md` et
   `tp.md`), jamais du brief. Montrez la liste avant d'écrire.
3. **`courseIntroMinutes`** (`edit_section`, prod) : la valeur fixée au cadrage (Q0), si
   elle n'est pas déjà en prod.
4. **Écarts au brief** : signalez-les et proposez la mise à jour des briefs des sections
   suivantes (sans l'écrire : c'est une décision de l'utilisateur, puis une écriture
   confirmée).
5. **Verdicts** : chaque critique de l'utilisateur pendant la section qui vaut pour la
   suite est proposée en verdict (format, texte verbatim) ; `add_verdict` après accord.
   Un verdict existant à corriger (le verdict `6ac67a63` et sa phrase sur l'indice
   replié, par exemple) se propose de même.
6. **Exemplaire** : si l'utilisateur dit d'un support « c'est exactement ça »,
   proposez `promote_exemplar` avec des annotations qu'il valide.
7. **Matériau quiz** : remplissez la rubrique « Matériau quiz » du plan (`suivi.md`) :
   - gestes clés du TP : pour chaque exercice, le code écrit (extrait court), l'API
     imposée, le résultat observé (sortie de `correction` quand elle existe) ;
   - blocages relevés par l'étudiant fragile (exercice, ce qu'il a dû deviner) ;
   - erreurs fréquentes du cours (notion, code fautif, message réel).
8. **Statut** : phase « clôture », « Validé : … ; clôture le <date> », prochaine action ;
   **état du module** : ligne de la section ; commit des fichiers de suivi.

`isAvailable` n'est jamais modifié par ce skill : la publication aux étudiants est une
décision de l'utilisateur, faite dans l'admin ou sur sa demande explicite.

## 3. Définition de terminé

- ✔/✘ correction : rapport complet, push confirmé (réponse citée) et fait, ou échec
  noté avec les fichiers gardés ; rappel `correctionIsAvailable` fait ;
- ✔/✘ bac à sable supprimé (sorties collées) ;
- ✔/✘ `curriculum` et `courseIntroMinutes` écrits en prod après confirmation (réponses
  citées), ou refus noté ;
- ✔/✘ verdicts et exemplaire proposés (ou « rien à proposer ») ;
- ✔/✘ « Écarts réalisés » et « Matériau quiz » remplis ;
- ✔/✘ statut, état du module et commit (hash).
