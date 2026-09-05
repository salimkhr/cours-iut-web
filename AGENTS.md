# Navigateur de test dans cet environnement

## Méthode validée le 5 septembre 2026

Le projet tourne dans WSL, dans `/var/www/cours-iut-web`. Pour les tests où
l'utilisateur doit voir et manipuler la fenêtre, utiliser **Microsoft Edge natif
Windows**, lancé depuis WSL avec `powershell.exe`.

Chromium installé via Playwright sous Linux démarre et charge le site, mais sa
fenêtre WSLg reste invisible pour l'utilisateur, malgré une icône dans la barre
des tâches. Les essais X11, Wayland, sans GPU, repositionnement et maximisation
n'ont pas résolu le problème. Une capture Playwright réussie ne prouve pas que
l'utilisateur voit la fenêtre. L'utilisateur a confirmé voir Edge natif Windows.

## Ouvrir le site

Vérifier que `http://localhost:3000` répond ; sinon lancer `bun run dev` depuis
le projet. Utiliser un profil de test séparé du profil personnel de l'utilisateur.
La commande suivante a été exécutée avec succès depuis Bash dans WSL :

```bash
powershell.exe -NoProfile -Command '$browser = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"; $profile = Join-Path $env:TEMP "cours-iut-browser-test"; Start-Process -FilePath $browser -ArgumentList @("--user-data-dir=`"$profile`"", "--remote-debugging-port=9222", "--remote-debugging-address=127.0.0.1", "--no-first-run", "--no-default-browser-check", "--new-window", "--start-maximized", "http://localhost:3000")'
```

L'ouverture d'une application graphique et l'accès à Windows nécessitent une
exécution hors du bac à sable ; suivre les permissions de la session.

## Vérifier et réutiliser la session

Le port de débogage est limité à la boucle locale Windows. Vérifier la session
existante avant de lancer une nouvelle fenêtre :

```bash
powershell.exe -NoProfile -Command '$tabs = Invoke-RestMethod http://127.0.0.1:9222/json/list; foreach ($tab in $tabs) { Write-Output ($tab.title + " | " + $tab.url) }'
```

Cette vérification a confirmé le titre `Développement Web | Salim Khraimeche`
et l'URL `http://localhost:3000/`. Le point d'accès CDP peut servir au pilotage
automatisé ; la connexion Playwright depuis WSL à cette session Windows reste
à vérifier. Ne pas supposer que `127.0.0.1` côté WSL atteint la boucle locale
Windows, ni exposer le port de débogage sur le réseau pour contourner ce point.

Conserver le profil de test pour réutiliser sa session. Ne pas utiliser le profil
personnel, fermer les autres navigateurs de l'utilisateur ou inscrire des mots
de passe dans ce fichier.
