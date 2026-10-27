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
New-Item -ItemType Directory -Force $dir, "$dir\fragile-cours", "$dir\fragile-tp", "$dir\rapide", "$dir\fournis", "$dir\depart", "$dir\supports" | Out-Null
```

L'agent de préparation (`SKILL.md` § 5 bis) écrit l'export du cours et du TP dans
`supports\` (`cours.md`, `tp.md`) et les fichiers des `download-file` dans `fournis\`.
Vous déposez l'état de départ du fil rouge dans `depart\`. Ne copiez jamais là autre
chose : ni slides, ni fiche, ni verdicts, ni dépôt de référence complet, ni rapport.

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
Image construite avant le 2026-10-27 (capture par défaut dans `/work/rendu.png`) :
reconstruisez-la (§ 0) ; `docker image inspect cours-iut-bac:1 --format "{{.Created}}"`.
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

Dans leur prompt : `Conteneur : cours-iut-bac-<run-id>`, leur dossier et leur plage de
ports, les chemins de leurs supports dans `/work/supports`, la liste des fichiers de
`/work/fournis` et `/work/depart` (ou « aucun fichier fourni », « état initial du fil
rouge non fourni »).

| Étudiant | Dossier | Ports | Supports |
|---|---|---|---|
| fragile, mode lecture | `/work/fragile-cours` | 8000–8009 | `cours.md` |
| fragile, mode exécution | `/work/fragile-tp` | 8010–8019 | `tp.md`, `cours.md` |
| rapide | `/work/rapide` | 8020–8029 | `tp.md`, `cours.md` |

Les étudiants ont déjà dans leur définition la forme de commande autorisée, y compris
celle d'un serveur en arrière-plan :
`docker exec cours-iut-bac-<run-id> sh -c 'cd /work/<dossier> && (php -S localhost:PORT >/tmp/srv-PORT.log 2>&1 & echo $! >/tmp/srv-PORT.pid)'`,
arrêt par `kill $(cat /tmp/srv-PORT.pid)` (pas `pkill -f`, qui tue le `sh -c` lui-même).
Un serveur arrêté reste en zombie (`sleep infinity` en PID 1 ne récupère pas les
processus) : c'est sans effet, le port est libéré.
La garde accepte cette forme et refuse `docker exec -d` ; ses cas sont scriptés dans
`tests/sandbox/garde-bac.test.ts` (`bun test tests/sandbox`).

Si l'app demande une permission à chaque `docker exec`, proposez à l'utilisateur une
règle d'autorisation `Bash(docker exec cours-iut-bac-:*)` ; ne la posez pas vous-même.

## 5. Captures et fichiers à regarder avant le nettoyage

Les captures `rendu-html` sont dans le dossier de l'étudiant qui les a faites
(`$dir\<sous-dossier>\<fichier>.rendu.png` ou `rendu-<port>.png`) : lisez-les avec l'outil
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
