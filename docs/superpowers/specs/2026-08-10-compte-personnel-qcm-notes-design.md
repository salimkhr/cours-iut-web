# Compte personnel : QCM de diagnostic et notes autorisées en examen

**Date :** 2026-08-10
**Statut :** brainstorming — orientations arrêtées, trois points restent à trancher (§7)

## 1. Objectif

Deux comptes coexistent aujourd'hui : les comptes personnels créés via `/register` et le
**compte générique de l'intranet** (`etInfo`), partagé par l'ensemble des étudiants. Les deux
donnent le même accès au contenu, donc rien n'incite à s'inscrire individuellement.

L'objectif est double :

1. **Donner une raison concrète de créer un compte personnel** — pas par la contrainte, par
   l'utilité.
2. **Proposer des fonctionnalités réellement utiles aux étudiants**, pas des métriques utiles
   à la plateforme.

Ce n'est **pas** un objectif de traçabilité ni de surveillance. Ce cadrage contraint toutes
les décisions qui suivent : chaque fois qu'une fonctionnalité pouvait être lue comme du
flicage, elle a été écartée ou rendue anonyme.

## 2. Écarté en cours de conception

À conserver pour ne pas re-proposer ces pistes lors d'une reprise :

| Piste | Raison de l'abandon |
|---|---|
| Progression passive « parcouru » (scroll + temps de lecture) | Télémétrie fragile, faux positifs, nourrit la méfiance qu'on cherche à dissiper |
| Progression « pratiqué » (compter les éditions de code du bac à sable) | Même raison — transforme un service en mesure |
| Bouton « marquer comme terminé » | Demande à l'étudiant de travailler pour le système, sans contrepartie : personne ne clique |
| Liste « à revoir » | Écartée par l'utilisateur |
| Classement complet type Kahoot, points à la vitesse | Récompense ceux qui savaient déjà et corrompt le diagnostic recherché |
| QCM live à chaque séance | Trop lourd en rituel hebdomadaire |
| Notes strictement invisibles à l'enseignant | Révisé : dès lors que les notes servent en examen, elles sont un matériau d'examen, pas un carnet privé |

**Attention à ne pas confondre** « pratiqué » (rejeté) et la sauvegarde du code (retenue) : le
premier compte les éditions comme une **mesure**, la seconde rend à l'étudiant son travail
comme un **service**. Rien n'est compté ni jugé dans le second cas.

## 3. QCM — deux formats distincts

### 3.1 Fin de TP, individuel et asynchrone

Une à trois questions à la fin du TP (voir §3.3 sur le volume au démarrage), correction
immédiate assortie d'une explication et d'un renvoi vers le bloc de cours concerné.

Le placement en fin de TP ne teste pas « ont-ils écouté » mais **« savent-ils expliquer ce
qu'ils viennent de faire »**. C'est là que se révèle le TP réussi par tâtonnement et
copier-coller. Le format asynchrone évite le problème de la fin de séance, où le groupe finit
en ordre dispersé et n'a plus de moment collectif.

Contraintes :

- **Jamais derrière une condition d'achèvement du TP.** Ceux qui n'arrivent pas au bout sont
  précisément ceux dont le signal manque. Un QCM accessible seulement aux étudiants rapides
  produit un agrégat qui fait paraître le cours plus clair qu'il ne l'est.
- **« Valider » produit un état, jamais un droit d'accès.** Un QCM qui déverrouille la
  correction est brute-forcé en trente secondes, et la mesure ne vaut plus rien.
- **Le texte d'explication porte seul la charge pédagogique** : aucun enseignant n'est présent
  au moment où l'étudiant se trompe. C'est plus exigeant à rédiger qu'une mention « faux »,
  et c'est ce qui fait que le QCM enseigne au lieu de mesurer.

### 3.2 Mi-semestre et avant l'examen, en live

Le format événement : podium, équipes, cérémonie.

Ce qui justifie le poids n'est pas la cérémonie mais le **contenu** : il couvre tout depuis le
début du semestre. Se retester à plusieurs semaines de distance est de très loin ce qui ancre
le mieux. La révision espacée est le produit ; le podium est l'emballage.

- **Coût de rédaction quasi nul** : les questions sont celles qui ont eu les pires
  distributions pendant le semestre. Le rituel de fin de TP fabrique l'événement.
- **Podium à 3-5, jamais de bas de classement visible**, et aucun lien avec la note. Le jour
  où un étudiant soupçonne que le podium compte dans l'évaluation, il cesse de répondre
  honnêtement et le diagnostic est perdu.
- **Classer la progression entre les deux votes** (vote → discussion par deux → revote), ou
  **par table**. Un classement au score absolu couronne les trois mêmes chaque semaine ; à la
  troisième séance, les 25 autres décrochent. Un classement prévisible n'est pas une
  compétition, c'est un rappel de la hiérarchie existante.
- **Remise à zéro à chaque événement** : un cumul fige le podium dès octobre.
- **Le podium exige une identité.** Si la moitié de la promo répond depuis `etInfo`, le
  tableau affiche « etInfo, etInfo, etInfo » et le jeu ne fonctionne pas. « Connecte-toi avec
  ton compte si tu veux apparaître » est appliqué en direct par la pression du groupe — c'est
  le levier anti-`etInfo` le plus direct identifié.
- **Ajustement de calendrier** : une version courte et sans cérémonie dès la séance 2-3.
  Attendre la mi-semestre laisse s'installer les habitudes qu'on veut changer.

### 3.3 Conception des questions

- **Chaque distracteur correspond à une erreur de raisonnement précise**, pas à un remplissage
  plausible. C'est ce qui transforme « 40 % n'ont pas compris » en « c'est *ce* raccourci
  d'explication qui est mal passé ». Différence entre un quiz et un instrument de diagnostic.
- **Cibler les points suspectés fragiles**, pas couvrir le programme. Trois questions sur les
  trois pièges connus valent mieux qu'un balayage.
- **Une question plutôt que trois au démarrage.** Le coût réel n'est pas les cinq minutes de
  séance, c'est la rédaction. Une question par entrée de `Section.objectives[]`
  (`src/types/Section.ts:10`) est une règle d'ancrage qui borne l'effort et garde le QCM
  aligné sur les objectifs annoncés.
- **La banque s'accumule** : une question écrite cette année ressert l'an prochain. L'année 1
  paie, les suivantes encaissent.
- **L'agrégat par question est un retour sur le cours, pas sur le groupe.** « 80 % ratent la
  question 3 » ne dit pas que le groupe est faible, il dit que la section 3 est mal expliquée.

### 3.4 Protocole en séance (peer instruction)

Quand une question est réussie par 30 à 70 % du groupe, ne pas réexpliquer immédiatement :
faire débattre deux minutes par deux, puis revoter. Le taux monte fortement, et ce sont les
étudiants qui formulent l'explication — ce qui révèle avec quels mots elle passe. Au-dessus de
80 %, enchaîner sans commentaire ; en dessous de 30 %, c'est l'explication de l'enseignant
qu'il faut reprendre.

### 3.5 Ce que Kahoot apporte, et ce qu'il faut lui refuser

À garder : réponse simultanée, projection, format court, distribution affichée immédiatement.

À refuser : **les points à la vitesse**, qui récompensent ceux qui savaient déjà et poussent
les hésitants à cliquer au hasard — l'étudiant qui réfléchit vingt secondes et trouve est
exactement le signal recherché. Et le **classement nominatif complet**, qui rend l'erreur
humiliante, donc pousse à regarder l'écran du voisin, donc pollue la mesure.

### 3.6 Ancrage technique

- **Bloc `quiz`** ajouté à `src/lib/blockDefs.ts`, comme `text`, `callout` ou `table` :
  éditable au builder, créable via les outils MCP, validé par `blockSchemas` /
  `validateBlockTree`. Aucun pipeline de contenu à inventer.
- **Le podium ne se persiste pas.** Remis à zéro à chaque événement, il se calcule dans la
  session live (`LiveSessionRegistry`, `src/lib/live/`) et disparaît avec elle. Pas de nouvelle
  collection, pas de classement stocké, pas de données nominatives résiduelles.
- **Seul l'agrégat par question mérite la base**, sans identité : il alimente à la fois le
  retour sur le cours et la construction des QCM de mi-semestre.

## 4. Notes et annotations

### 4.1 Pourquoi c'est le cœur du dispositif

Les notes sont **autorisées pendant l'examen**. Le problème d'adoption disparaît : personne
n'a besoin d'être convaincu de prendre des notes qu'il aura sous les yeux le jour J.

Et cela donne l'argument anti-`etInfo` décisif, qui n'est pas un avantage à vendre mais un
risque à éviter :

> Sur le compte générique, vos notes d'examen sont partagées avec toute la promo — et
> n'importe qui peut les écraser.

### 4.2 Ce que le modèle de données offre déjà

- **Ancrage par `blockId`.** Le point difficile de tout système d'annotation est l'ancrage :
  rattacher une note à un passage qui bouge quand le contenu est édité. Ici c'est réglé
  gratuitement — chaque `Block` porte un `id` stable (`src/types/CourseContent.ts:8`). Modifier
  un autre bloc ne casse pas la note.
- **`InlineTextEditor`** (`src/components/builder/InlineTextEditor.tsx`) et `applyInlineMarker`
  (`src/lib/markdownToolbar.ts`) fournissent déjà l'édition markdown du builder : même UX,
  aucune dépendance nouvelle.
- Collection `user_notes` (`userId`, `moduleSlug`, `sectionSlug`, `blockId`, `text`,
  `updatedAt`), index déclaré dans `src/lib/db/indexes.ts` comme les deux existants.
- **Politique d'orphelin** : un bloc annoté supprimé depuis le builder ne supprime pas la
  note ; elle est conservée et signalée comme détachée. On n'efface jamais en silence un
  matériau d'examen.

### 4.3 Format : une note courte par bloc

Pas un grand document libre. Ce n'est pas qu'une contrainte technique, c'est un levier de
comportement : un étudiant qui colle la correction complète n'apprend rien **et** se retrouve
le jour J avec quarante pages illisibles ; celui qui écrit trois lignes en face du bloc
concerné a appris en écrivant et dispose d'un outil utilisable. L'ancrage par bloc pousse
naturellement vers la synthèse.

### 4.4 Conséquences de l'examen sur machine

La plateforme devient une **infrastructure d'examen**. Si elle tombe pendant l'épreuve, ce
n'est plus « le site est down », c'est une épreuve notée compromise.

- **Sauvegarde automatique**, jamais un bouton « enregistrer », avec un état de sauvegarde
  visible — pas d'échec silencieux.
- **Export PDF / markdown**, à télécharger la veille. Ce n'est pas un confort, c'est le plan de
  secours : une copie qui ne dépend ni du serveur ni du réseau de l'IUT.
- **Aucun déploiement le jour d'un examen.** Gratuit, et cela élimine la cause de panne la plus
  probable. La charge n'est pas le sujet — trente étudiants, ce n'est rien.
- **Mode examen** : le symétrique de `Section.examenIsLock` / `ExamenGate`
  (`src/components/ExamenGate.tsx`), qui verrouille aujourd'hui le contenu d'examen. Pendant la
  fenêtre d'épreuve : cours, TP et corrections fermés, `/mes-notes` ouvert. C'est ce contraste
  qui donne une raison de rédiger — « le jour de l'examen, vous n'aurez que ce que vous aurez
  écrit vous-même ».
- **Vue du jour J** : une page unique, groupée par section, **avec recherche dans ses propres
  notes**. Un étudiant stressé qui doit naviguer entre douze sections n'utilisera pas ses
  notes, il ouvrira un autre onglet.

### 4.5 Modération

Modérer est légitime, pour deux raisons distinctes : l'intégrité de l'examen (une note peut
contenir la correction entière) et la responsabilité d'hébergeur de contenu utilisateur.

Mais **lire l'intégralité des notes est le pire des mondes** : coût en temps prohibitif, perte
des notes honnêtes, et aucune garantie. Il n'est pas nécessaire de lire pour obtenir ce qu'on
cherche. Par ordre d'efficacité :

1. **Plafond de longueur par note.** Le plus efficace : le collage de correction devient
   structurellement impossible, pas détecté après coup. Et cela pousse vers la synthèse
   voulue. Une contrainte structurelle vaut mieux qu'une modération.
2. **Gel des notes** quelques heures avant l'épreuve, contre le collage de dernière minute.
3. **Signalement automatique par similarité** avec le contenu du cours et de la correction :
   seuls les cas aberrants remontent, sans lecture des remarques personnelles.
4. **Lecture humaine en dernier recours**, sur cas signalé ou contenu rapporté. Se branche sur
   l'admin existant (`src/app/admin/(dashboard)/`, `AdminDataTable`).

**Condition de légitimité : l'annoncer au point de saisie**, pas dans les CGU.

> Vos notes sont personnelles et ne sont pas lues. Elles peuvent être consultées en cas de
> contrôle du respect des règles d'examen.

Annoncée, la modération coûte un peu de franchise — certains garderont un fichier à part pour
les « je n'ai rien compris », et ce n'est pas cet usage qui justifie le projet. Découverte
après coup, elle détruirait la confiance dans l'ensemble de la plateforme, QCM compris. Les
pages `conditions-utilisation` et `politique-confidentialite` couvrent la partie formelle, mais
c'est la mention au point de saisie qui compte.

## 5. Ce qui justifie le compte personnel, par ordre de force

1. **Les notes d'examen** — structurellement impossibles à tenir sur un compte partagé.
2. **Le podium** — exige une identité, appliqué socialement en salle.
3. **La sauvegarde du code du bac à sable** de `CodeWithPreviewCard`
   (`src/components/Cards/CodeWithPreviewCard.tsx`) : l'étudiant peut déjà modifier le code et
   voir l'aperçu en direct, mais l'état est purement local et disparaît au rafraîchissement.
4. **La mémoire des QCM validés** — réel, mais mince. Le QCM lui-même fonctionne sans compte.

## 6. Ce qu'il ne faut pas mélanger

Deux objectifs distincts cohabitent, et les confondre ferait concevoir un outil qui rate les
deux :

- **Le QCM sert d'abord l'enseignant** : « est-ce que ce que j'ai expliqué est clair ». Seul
  l'agrégat compte, et il fonctionne sans compte personnel.
- **Les notes servent d'abord l'étudiant**, et ce sont elles qui portent l'argument
  anti-`etInfo`.

Le podium est le seul point où les deux se rejoignent, parce qu'il exige une identité.

## 7. Restant à trancher

1. **Fermer le cours pendant l'examen est-il réaliste ?** Si les machines de l'IUT ont un accès
   internet libre, les étudiants retrouveront MDN et le cours en cache en trois clics : le
   verrou est cosmétique et les notes retombent au rang de confort. Cela ne tue pas l'idée,
   mais cela change ce qu'il vaut la peine de construire.
2. **Les sujets d'examen résistent-ils au copier-coller ?** Sur papier, recopier une correction
   coûte du temps et oblige à relire — la triche est auto-limitante. Sur machine, c'est
   `Ctrl+V` : friction nulle, apprentissage nul. La réponse n'est pas une fonctionnalité mais
   une contrainte de rédaction des sujets (modifier du code existant, expliquer pourquoi ça
   casse, corriger un bug). Mieux vaut la décider maintenant qu'à la correction des copies.
3. **« Continuer où j'en étais »** : jamais tranché. Un unique champ « dernière page ouverte »,
   écrit à chaque visite — pas de scroll, pas de chronomètre. Utile et quasi gratuit, mais
   écarté si l'on veut n'enregistrer que des réponses de QCM et des notes.
