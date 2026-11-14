# Humanizer FR : méthode de réécriture des supports de cours

Méthode fusionnée pour retirer les traces d'IA des cours et TP en français.

- **Passes de réécriture** : reprises de `jpeggdev/humanize-writing` (8 passes, structure d'abord).
- **Catalogue de motifs et score 0-100** : repris de `Aboudjem/humanizer-skill` (55 motifs, voix).
- **Motifs français** : adaptés de l'ancien skill `humaniseur-fr` (samber/cc-skills, MIT) et
  complétés à partir des TP du module PHP (préfixe `F`).
- **Manière d'expliquer de l'auteur** (§ 1.1) : tirée de ses supports PHP de 2013 à 2022.
- **Signes relevés par Wikipédia** : page d'aide
  [Aide:Identifier l'usage d'une IA générative](https://fr.wikipedia.org/w/index.php?title=Aide:Identifier_l%27usage_d%27une_IA_g%C3%A9n%C3%A9rative&oldid=240703969)
  (révision du 25/10/2026, CC BY-SA), équivalent français de « Signs of AI writing ». Ses
  signes ont ressorti P4, P16, P17, P36 et P37 de la liste des écartés, créé F22, F23 et F24, et enrichi F1,
  F2, F7, F18, P14 et P39.

Les verdicts actifs (`list_verdicts`) priment sur tout ce qui suit.

## 1. La voix cible

La référence est le TP1 du module PHP (`1-bases-du-php`). Ce qui la fait tenir :

- **Une situation, pas une description.** « Le Z-Event commence ce soir. Vous allez construire,
  en PHP, la page qui affiche le classement des streamers et le total collecté. » Le support
  raconte ce qu'on va faire, il ne décrit pas ce qu'il contient.
- **Le pourquoi, avec du caractère.** « Le typage n'est pas décoratif : il fait planter la page
  tout de suite quand vous passez la mauvaise chose, au lieu de produire un résultat faux en
  silence. » « Écrire cent lignes de tableau à la main n'est pas envisageable : c'est exactement
  ce que les boucles règlent. »
- **Observer avant d'expliquer.** L'étudiant regarde l'heure affichée, cherche le PHP dans le
  code source, retire un `break` pour voir, puis écrit son explication en commentaire.
- **Phrases courtes et variées.** Le « on » et le « vous » alternent. Une remarque de prof de
  temps en temps (le commentaire sur le CSS en ligne dans `classement.php`).
- **Peu de tableaux.** Un tableau seulement quand il est plus clair que du texte.

Registre : courant, vouvoiement, voix d'enseignant. Pas d'argot, pas d'abréviations, pas de
« je » dans les consignes, pas d'ignorance feinte.

**Cours** : l'explication part d'un problème concret du domaine d'exemple du module (Recettes
pour PHP, jamais le fil rouge du TP), le pourquoi vient avant le comment, une analogie ou une
remarque de prof est bienvenue, pas de résumé final qui répète tout.

**TP** : tout ce qui précède, plus la règle de progressivité (verdict TP4) : dans le fil rouge,
seul le premier exercice d'un geste nouveau est guidé pas à pas ; les suivants gardent le contrat
(fichiers, `name` des champs, variables transmises, règles et messages verbatim, tableau des
essais) et une ou deux consignes. Pas de paraphrase des commentaires des fichiers fournis. Pas de
code de solution dans les astuces.

### 1.1 La manière d'expliquer de l'auteur

Tirée des supports PHP de 2013 à 2022 cosignés par l'auteur (`PHP/s1` à `s6`, `PHP/evalTP22`).
On en garde les gestes d'explication, pas les formes d'époque : consignes à l'infinitif,
« NB : », capitales, « question 1.1 » et les mots du lexique (« permet de », « il s'agit de »)
restent écartés, la voix moderne est celle du TP1.

1. **Partir de ce que l'étudiant connaît.** « La syntaxe de PHP est un mélange de celle du C et
   du shell », un tableau associatif est l'équivalent d'une HashMap en Java, PDO celui de JDBC.
2. **Manipuler, puis faire conclure.** On teste un exemple fourni, on le modifie, et une
   question oblige à tirer la leçon : « Qu'en déduisez-vous pour l'usage de for ou de
   foreach ? », « est-ce la date du serveur ou du client ? ».
3. **Une image concrète pour le mécanisme.** `include` est un copier-coller dynamique ;
   sérialiser, c'est faire de l'objet une grande chaîne de caractères.
4. **Trancher, et dire pourquoi.** Poser la question (« HTML ou PHP ? »), donner le critère,
   puis décider pour le module : « C'est la seconde solution qui sera utilisée dans les TP
   suivants. » Une pratique déconseillée l'est franchement, avec sa raison.
5. **Dire pourquoi on montre une chose.** Une syntaxe montrée pour que l'étudiant la reconnaisse
   dans du code trouvé ailleurs, une page volontairement incomplète, une contrainte justifiée par
   la question où elle servira.
6. **Relier les séances.** « la classe vue en TP », « ce code resservira dans les TP suivants » :
   l'étudiant sait que ce qu'il écrit lui resservira (c'est l'exception prévue par F12).
7. **Fermer la porte quand c'est bloquant.** « Tant que ce script ne s'exécute pas
   correctement, il est impossible d'avancer », puis ce qu'il faut vérifier. Une mise en garde
   forte par support au plus.
8. **Des indications qui orientent.** Elles renvoient à un outil ou à une fonction (« afficher le
   code source », « voir `ctype_digit` »), jamais à la solution.
9. **Un cas réel pour justifier la notion.** L'utilisateur s'est trompé dans un champ : plutôt
   que de tout lui faire ressaisir, on réaffiche ce qui était correct.
10. **Un ton sobre qui raisonne.** Phrases déclaratives, aucun adjectif de valeur, aucun
    enthousiasme. Le raisonnement avance par « donc », « par conséquent », « mais » : « Ce
    script est suffisant. Mais il suppose… Il est donc nécessaire… »

## 2. Ce qui ne bouge pas

- Le contenu technique : noms de fichiers, fonctions, variables, attributs `name`, code fourni,
  commandes, URL. Seule exception : un paramètre de suivi laissé par un chatbot
  (`?utm_source=chatgpt.com`, P35) se retire de l'URL, et le compte rendu le signale.
- Le contrat : règles de validation, messages d'erreur verbatim, résultats attendus. Un tableau
  d'essais peut changer de forme, jamais de contenu (mêmes lignes, mêmes valeurs, même ordre).
- La progressivité : ne jamais remettre de guidage là où il a été retiré exprès.
- Les identifiants de blocs : on modifie avec `edit_block`, jamais `save_content`.
- La longueur : un support humanisé n'est pas plus long. Visez un peu plus court.
- Les blocs `code`, `file`, les tableaux de données : on n'y touche pas.

## 3. Catalogue des motifs

Chaque motif a un identifiant stable, repris dans les comptes rendus. `P` = catalogue Aboudjem
(numéro d'origine), `F` = motif français ajouté. Les motifs d'Aboudjem sans objet dans un
support de cours sont listés à la fin et ne comptent pas dans le score.

### 3.1 Structure (passe 1)

| ID | Motif | Signe | Correction |
| --- | --- | --- | --- |
| F1 | Moule de partie répété | Chaque partie = « Fichiers à créer ou modifier : … » + liste numérotée + tableau + encadré « Attention ». Autre forme : des parties qui font toutes 1 à 3 paragraphes | Varier l'ouverture (situation, constat, question du client) et la longueur des parties. Tableau ou encadré seulement s'il sert |
| F2 | Tableaux en rafale | 3-4 tableaux à la suite (variables, champs, règles, essais), ou un raisonnement mis en tableau (avantages et inconvénients) | Fusionner, ou passer en phrases ce qui tient en une ligne. Garder le tableau d'essais |
| F3 | Intro-sommaire | L'intro résume tout le support avant qu'il commence (= P29, P30 humaniseur) | Ouvrir sur la situation. Une phrase sur ce qu'on construit, pas le plan |
| F4 | Encadré « Attention » systématique | Un encadré par partie, souvent pour un rappel banal | Garder ceux qui préviennent un vrai piège vu en séance. Les autres passent dans le texte ou disparaissent |
| F5 | Listes isométriques | Éléments de même longueur et même forme grammaticale (= P10, P27 humaniseur) | Casser la symétrie : une étape longue, une courte, une fusionnée |
| F6 | Liste-évitement | Étapes numérotées là où deux phrases suffisent (= P37 humaniseur) | Écrire les deux phrases |
| F7 | Écho de fin | « Vous avez maintenant… », « Vous avez terminé quand… » (verdict), dernière partie intitulée « Conclusion », « Bilan » ou « Récapitulatif » | Supprimer, finir sur le dernier geste |
| F8 | Titres-formule | « Exercice x — … », titres en question (verdict, P27) | Titre court qui nomme ce qu'on fait |
| P16 | Majuscules à l'anglaise | Majuscules superflues dans les titres : « Gestion Des Erreurs », « Validation du Formulaire » | Une majuscule au premier mot seulement (et aux noms propres) |
| P17 | Apostrophes mêlées | Apostrophes droites `'` et courbes `’` dans le même support. Seul le mélange compte : `’` est correct en français | Aligner sur l'apostrophe dominante du support (le code ne compte pas) |
| F22 | Redite d'une partie à l'autre | La même règle ou la même explication revient dans plusieurs parties et gonfle le support (P43 y est fondu) | La dire une fois, puis renvoyer : « la règle de tout à l'heure » |
| P38 | Paragraphes permutables | Les parties pourraient être réordonnées sans dommage | Faire dépendre chaque partie de la précédente (« comme la dernière fois », « la page de tout à l'heure ») |
| P49 | Titre suivi de sa paraphrase | « ## Validation » puis « Cette partie traite de la validation. » | Supprimer la phrase |
| P15 | Liste à en-têtes gras | `- **Mot :** description` en série | Phrases, ou liste simple |

### 3.2 Phrases (passes 4 et 5)

| ID | Motif | Signe | Correction |
| --- | --- | --- | --- |
| F9 | **Négation de cadrage** (tic n° 1) | « aucune lecture audio n'est demandée », « ne les traitez pas ici », « Rien n'est encore enregistré », « Aucun fichier ne lit encore `$_GET` », « Il n'y a ni session ni base à ce stade » (verdict) | Dire ce qu'on fait. Garder une négation seulement si son absence ferait perdre du temps à un étudiant (« N'utilisez ni `max()` ni `min()` » reste) |
| F10 | Incises en cascade | Phrase longue, deux ou trois incises, deux-points enchaînés | Couper en deux ou trois phrases |
| F11 | Renvoi administratif | « le TP sur les tableaux associatifs et les objets » répété | « le TP2 », « comme la dernière fois » |
| F12 | Annonce de la suite | « Vous la brancherez à l'exercice… », « Ces deux écarts sont traités dans… » | Supprimer, sauf si l'étudiant risque de faire le travail en avance |
| F13 | Participe présent plaqué | « …, permettant ainsi de… », « …, garantissant… » (P3) | Phrase séparée avec un verbe conjugué, ou supprimer |
| F14 | Passif sans agent | « il est demandé de », « le formulaire doit être soumis » (P50) | « vous », « on » |
| F15 | Nominalisations en chaîne | « la mise en place de la vérification de la saisie » | Un verbe : « vérifier ce qu'on a saisi » |
| P8 | Évitement de la copule | constitue, représente, dispose de, offre, fait office de | est, a |
| P9 | Parallélisme négatif | « Non seulement… mais aussi… », « Ce n'est pas X, c'est Y » | Dire Y |
| P11 | Cycle de synonymes | « le formulaire », « la saisie », « l'interface de saisie » pour la même chose | Un seul terme, répété |
| P13 | Tirets cadratins | `—` comme ponctuation | Virgule, deux-points, point. Zéro dans la prose (le code et les fichiers fournis ne comptent pas) |
| P30 | Longueur uniforme | Toutes les phrases entre 15 et 25 mots | Des phrases de 4-8 mots, d'autres longues. Voir le CoV du script |
| F16 | Anaphore d'attaque | Phrases successives qui commencent pareil (« Créez… Créez… Créez… », « Ce fichier… Ce fichier… ») | Varier l'attaque |

### 3.3 Vocabulaire (passes 2, 3 et 6)

| ID | Motif | Mots à chasser | Remplacement |
| --- | --- | --- | --- |
| F17 | Formules creuses | permet de, afin de, il est important de, il convient de, veillez à, n'hésitez pas, assurez-vous que, il s'agit de, faire en sorte que | Verbe direct : « pour », « vérifiez », ou supprimer |
| P7 | Vocabulaire IA | crucial, essentiel, fondamental, robuste, optimal, incontournable, véritable, également (> 1 par paragraphe), notamment, par ailleurs, en outre, de plus, désormais, au sein de, dans le cadre de, en termes de, mise en œuvre, mettre en place | Le mot simple, ou rien |
| P22 | Remplissage | en ce qui concerne, au niveau de, à ce stade, ainsi que, en raison du fait que | sur, pour, maintenant, et, parce que |
| F18 | Anglicismes et calques | faire du sens, adresser un problème, impacter, supporter (= gérer), et les calques de traduction automatique (une doc anglaise passée au traducteur) | avoir du sens, traiter, toucher, gérer ; la tournure française |
| F19 | Doublets | « simple et efficace », « clair et lisible », « robuste et fiable » | Un seul mot, ou le fait |
| P14 | Gras mécanique | Gras sur chaque phrase importante, ou gras plus italique sur un mot | Un gras par partie, sur le mot que l'étudiant doit retenir |
| P18 | Registre administratif | « il est à noter que », « dans le contexte de » | Langue parlée de prof |

### 3.4 Ton (passes 7 et 8)

| ID | Motif | Signe | Correction |
| --- | --- | --- | --- |
| F20 | Neutre de bout en bout | Aucune phrase ne dit pourquoi, aucune remarque, aucun constat | Ajouter **ponctuellement** le pourquoi, un constat (« ça va planter, c'est voulu »), une remarque de prof. Une ou deux par partie au plus |
| F21 | Paraphrase des fichiers fournis | L'énoncé répète ce que disent les commentaires du squelette (verdict TP4) | Renvoyer au fichier |
| P32 | Connecteurs d'échafaudage | D'abord, Ensuite, De plus, Enfin en tête de paragraphe | Juxtaposer, ou le vrai lien logique (« donc », « mais ») |
| P45 | Narrateur à distance | « l'utilisateur », « l'étudiant », « on peut observer que » | « vous » |
| P39 | Résumé de clôture | « En résumé », « Au final », paragraphe ou partie « Conclusion » qui récapitule | Supprimer |
| P4 | Ton de plaquette | « PHP est un langage puissant et polyvalent », emphase sans fait, langue de bois | Dire ce que l'outil fait dans l'exemple |
| P36 | Rupture de voix | Un bloc lisse et neutre au milieu de blocs écrits par le prof : registre, longueur et vocabulaire changent d'un coup, ou le bloc explique autrement que l'auteur (§ 1.1) (P26 y est fondu) | Réécrire le bloc dans la voix du reste du support |
| F23 | Ton consensuel | Le texte refuse de trancher (« les deux approches ont leurs avantages », « selon les besoins »), empile les précautions (« il peut être intéressant d'envisager »), ou prend un ton poli et maniéré (P23 y est fondu) | Trancher : dire laquelle utiliser ici et pourquoi. Garder une nuance seulement si elle change ce que l'étudiant fait |
| F24 | Généralités clichés | Phrase d'ouverture ou de transition qui vaudrait pour n'importe quel cours ou n'importe quel site : « Dans le monde du web… », « … est au cœur de… », « De nos jours… » | La remplacer par un fait du domaine d'exemple ou du fil rouge, ou la supprimer |
| P37 | Attribution superflue | « Selon la documentation officielle, `echo` affiche… » pour une évidence que personne ne conteste | Affirmer. Citer la doc seulement quand on y renvoie l'étudiant |
| P53 | Énumération annoncée | « Plusieurs points sont à considérer : » | Donner les points |
| P24 | Conclusion positive | « Votre application est maintenant prête ! » | Finir sur un fait |

### 3.5 Motifs d'Aboudjem écartés (sans objet ici)

P2, P5, P6, P12, P19-P21, P25, P28, P33-P35, P40-P42, P44, P46-P48, P51, P52, P54, P55 : propres
au journalisme, au marketing, aux copier-coller de chatbot ou à l'anglais. Ils ne comptent pas
dans le score, mais un artéfact de chatbot trouvé (P19, P33, P34, P35) se corrige quand même :
préambule « Voici une version complète… », balise `:contentReference[oaicite:2]{index=2}`,
paramètre `?utm_source=chatgpt.com`. P1, P3, P10, P23, P26, P27, P29, P31, P43, P50 sont fondus
dans les motifs ci-dessus.

Signes de la page Wikipédia sans objet ici : tout ce qui touche aux sources d'un article
(références absentes, inventées, en double ou mal formatées), les catégories inexistantes, les
commentaires d'édition trop détaillés et les indices par date. Les hallucinations et les
confusions par homonymie (P25) ne relèvent pas du style : la relecture de cohérence et les
étudiants simulés les traitent, le score ne les compte pas.

## 4. Score de 0 à 100

Formule d'Aboudjem, adaptée :

```
score = min(100, 4 × M + B + V)
```

- **M** : nombre de motifs **distincts** du catalogue (sections 3.1 à 3.4) présents au moins
  deux fois dans le support (une fois suffit pour P13 et F7 ; P17 compte quand l'apostrophe
  minoritaire apparaît au moins deux fois en prose). Jugement de l'agent, avec la liste des
  occurrences.
- **B** (rythme, 0-25) : `25 × (1 − min(CoV / 0,7 ; 1))`, CoV = écart-type / moyenne des
  longueurs de phrases en mots, sur la prose seule.
- **V** (lexique, 0-15) : `15 × min(occurrences du lexique pour 100 mots ; 1)`.

Calibrage : le TP1 de PHP (voix de référence) sort à 13, le TP2 (avant réécriture) à 34. La
liste des phrases négatives du script est un signal, pas le compte de F9 : elle attrape aussi
les consignes de contrat légitimes (« N'oubliez aucun `break` »).

B et V sont calculés par le script, qui donne aussi le nombre de tirets et de phrases négatives :

```bash
bun docs/humanizer/score.mjs <export.md> [M] [--negations]
```

Enregistrez l'export `export_content_compact` dans un fichier du scratchpad, puis passez son
chemin. Le script ignore les blocs de code, les tableaux, les titres et les commentaires d'ID.

| Score | Lecture |
| --- | --- |
| 0-20 | Sonne humain |
| 21-40 | Quelques tics, faciles à reprendre |
| 41-60 | Mixte |
| 61-80 | Penche IA |
| 81-100 | IA non relue |

Un agent qui note son propre texte se surestime. Le score sert de signal ; la vraie vérification
reste la relecture humaine. Wikipédia le rappelle aussi : ses signes ne sont que des « indices »,
un débutant peut les produire, et les détecteurs automatiques se trompent dans les deux sens.

## 5. Les 8 passes de réécriture

Avant de toucher un mot, écrivez une ligne : « Lu comme : <TP|cours> de <section>, pour des
étudiants de BUT1, registre courant, voix du TP1. »

1. **Structure.** Repérez le moule (F1), les rafales de tableaux (F2), l'intro-sommaire (F3),
   les encadrés en série (F4), les échos de fin (F7), les redites d'une partie à l'autre (F22). Variez la longueur des parties : certaines
   en deux phrases, d'autres plus longues. Faites dépendre une partie de la précédente.
2. **Gonflement.** Retirez les phrases qui disent l'importance d'une chose au lieu de dire ce
   qu'elle fait.
3. **Vocabulaire.** Lexique de la section 3.3. Un mot simple, ou rien.
4. **Grammaire.** Négations de cadrage (F9), participes (F13), passif (F14), nominalisations
   (F15), copules (P8), synonymes (P11).
5. **Rythme.** Coupez les phrases à incises (F10), retirez les tirets (P13), cassez les listes
   isométriques (F5), variez les attaques (F16). Cherchez des phrases de moins de 8 mots.
6. **Remplissage.** Formules creuses (F17), annonces (F12), renvois administratifs (F11),
   paraphrases du squelette (F21).
7. **Liaisons.** Retirez D'abord / Ensuite / De plus / Enfin. Souvent il ne faut aucun
   connecteur. Sinon « donc », « mais », « comme tout à l'heure ».
8. **Voix.** Une ou deux touches par partie, pas plus : le pourquoi, un constat, une remarque de
   prof. Rien de forcé, pas d'humour qui ne sert pas l'explication.

Puis une auto-relecture : « Qu'est-ce qui sonne encore IA ? » Deux ou trois réponses, une passe
corrective dessus. Re-scorez.

## 6. Compte rendu attendu d'un sous-agent

Court, jamais le texte complet :

- score avant (M, B, V, total) et les cinq motifs les plus présents ;
- score après ;
- liste des blocs modifiés (ID) avec une ligne chacun ;
- changements de vocabulaire (ancien terme → nouveau), pour la cohérence cours/TP ;
- points à vérifier par l'humain (négation gardée exprès, encadré gardé, doute sur le contrat).
