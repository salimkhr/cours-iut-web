# Bac à sable des étudiants : commandes de l'orchestrateur

Image : `cours-iut-bac:1`, construite depuis `docker/etudiant-sandbox/Dockerfile`.
Garde des étudiants : `docker/etudiant-sandbox/garde-bac.mjs` (hook `PreToolUse` de leur
frontmatter). Les commandes ci-dessous sont pour PowerShell (Windows) ; elles évitent la
conversion de chemins de Git Bash, qui réécrit `/work` en `C:/Program Files/Git/work`.

## 0. Prérequis

```powershell
docker info --format "{{.ServerVersion}}"
docker image inspect cours-iut-bac:1 --format "{{.Id}}"
```

Prérequis de session, à vérifier à la première relecture puis après chaque mise à jour
de Claude Code ou de l'app :

- **Permission** : les étudiants tournent sans pouvoir répondre à une demande de
  permission. Il faut une règle d'autorisation `Bash(docker exec cours-iut-bac-:*)`
  dans les réglages ; si elle manque, proposez-la à l'utilisateur, ne l'ajoutez pas
  vous-même.
- **Garde active dans un subagent** (test de fumée, deux minutes, session interactive
  dans un dossier approuvé) : démarrez un conteneur de test (§ 1 et 2), lancez
  `etudiant-fragile` avec un prompt qui lui demande d'exécuter exactement
  `docker exec cours-iut-bac-<run-id> sh -c 'cd /work && echo ok'` puis `ls`, et de
  rapporter les deux sorties. Attendu : `ok`, puis un refus « Bloqué par la garde du bac
  à sable ». Si `ls` passe, la garde ne tourne pas : n'utilisez pas les étudiants et
  prévenez l'utilisateur. Si les deux sont refusés, le hook ne démarre pas (Claude Code
  antérieur à 2.1.295, `node` introuvable, `${CLAUDE_PROJECT_DIR}` non développé).

Image absente : demandez à l'utilisateur la permission de la construire (plusieurs
minutes, environ 4 Go), puis lancez en arrière-plan depuis la racine du dépôt :
`docker build -t cours-iut-bac:1 docker/etudiant-sandbox`. Docker absent : pas
d'étudiant, dites-le et poursuivez avec les seuls relecteurs.

## 1. Run-id et dossier

Run-id : `<module>-<section tronquée à 30 caractères>-<AAAAMMJJ-HHMMSS>`, en minuscules,
seulement `a-z`, `0-9` et `-` (la garde refuse tout autre caractère). Le dossier vit
sous une racine fixe, en chemin long (pas la forme courte `UTILIS~1` de `%TEMP%`) :

```powershell
$run = "rust-structs-enums-20261027-143000"
$racine = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) "Temp\cours-iut-bac"
$dir = Join-Path $racine $run
New-Item -ItemType Directory -Force $dir, "$dir\fragile-cours", "$dir\fragile-tp", "$dir\rapide", "$dir\fournis", "$dir\depart" | Out-Null
```

Déposez les fichiers fournis (`download-file`) dans `fournis\` et l'état de départ du
fil rouge dans `depart\` avec l'outil d'écriture de fichiers, avant le démarrage. Ne
copiez jamais là autre chose (ni fiche, ni dépôt de référence complet, ni rapport).

## 2. Démarrage

```powershell
docker run -d --rm --network none --name "cours-iut-bac-$run" -v "${dir}:/work" `
  --shm-size 1g --memory 3g --cpus 2 --pids-limit 512 `
  --cap-drop ALL --security-opt no-new-privileges cours-iut-bac:1
```

## 3. Contrôle avant de lancer les étudiants

```powershell
docker exec "cours-iut-bac-$run" sh -c 'cd /work && id -un && ls && php -v | head -1 && cargo --version && node --version'
docker exec "cours-iut-bac-$run" sh -c 'cd /work && echo ''<h1>ok</h1>'' > /tmp/t.html && rendu-html /tmp/t.html --capture /tmp/t.png --selecteurs h1 | head -c 200'
```

Attendu : `etudiant`, les sous-dossiers, les versions, un JSON qui commence par `{`.
Piège de PowerShell 5.1 : un guillemet double à l'intérieur de l'argument `sh -c` est
supprimé au passage vers `docker`. Dans ces commandes, n'utilisez que des apostrophes
doublées (`''`) à l'intérieur de la chaîne.
Un échec : n'envoyez pas les étudiants, montrez l'erreur à l'utilisateur.

Le contrôle de la garde elle-même (hors étudiants) se fait en lui passant un JSON :

```powershell
'{"tool_name":"Bash","tool_input":{"command":"ls"}}' | node docker/etudiant-sandbox/garde-bac.mjs; "code $LASTEXITCODE"
```

Attendu : message « Bloqué par la garde du bac à sable » et `code 2`.

## 4. Ce que reçoivent les étudiants

Dans leur prompt : `Conteneur : cours-iut-bac-<run-id>`, leur dossier (`/work/fragile-cours`,
`/work/fragile-tp` ou `/work/rapide`), la liste des fichiers de `/work/fournis` et
`/work/depart` (ou « aucun fichier fourni », « état initial du fil rouge non fourni »).
Les étudiants ont déjà la forme de commande autorisée dans leur définition.

Si l'app demande une permission à chaque `docker exec`, proposez à l'utilisateur une
règle d'autorisation `Bash(docker exec cours-iut-bac-:*)` ; ne la posez pas vous-même.

## 5. Captures et fichiers à regarder avant le nettoyage

Les captures `rendu-html` sont dans `$dir\<sous-dossier>\...png` : lisez-les avec l'outil
de lecture de fichiers pour comparer au rendu annoncé.

## 6. Nettoyage (toujours, même après une erreur)

```powershell
docker stop "cours-iut-bac-$run" | Out-Null
Remove-Item -Recurse -Force -LiteralPath $dir
"conteneurs : [" + ((docker ps -a --filter "name=cours-iut-bac-$run" --format "{{.Names}}") -join ",") + "]"
"dossier présent : " + (Test-Path -LiteralPath $dir)
```

Attendu : `conteneurs : []` et `dossier présent : False`. Ces deux lignes sont la preuve
à coller dans la définition de terminé. Le `--rm` supprime le conteneur à l'arrêt.

Des restes d'une relecture interrompue se repèrent avec
`docker ps -a --filter "name=cours-iut-bac-"` et `Get-ChildItem $racine` : proposez leur
suppression à l'utilisateur.
