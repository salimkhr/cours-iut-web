#!/usr/bin/env node
// Hook PreToolUse des agents etudiant-fragile et etudiant-rapide.
//
// Seule forme de commande acceptée (une ligne, éventuellement suivie d'un heredoc) :
//
//   docker exec [-i] cours-iut-bac-<run-id> sh -c 'cd /work && <commandes>'
//   docker exec -i cours-iut-bac-<run-id> sh -c 'cd /work && cat > fichier' <<'FIN'
//   ...contenu...
//   FIN
//
// Pourquoi si strict :
// - tout ce que le shell de l'hôte interprète (; && | > < $ ` * ~ ...) doit rester
//   entre apostrophes, donc passer tel quel au sh du conteneur ;
// - le script commence par « cd /work » : sous Git Bash, un argument qui commence
//   par « / » ou « NOM=/ » est réécrit en chemin Windows (conversion MSYS), ce qui
//   casse la commande ; « cd /work ... » n'est jamais réécrit ;
// - le heredoc doit être à délimiteur entre apostrophes (aucune expansion sur l'hôte)
//   et le délimiteur doit être la dernière ligne : rien ne s'exécute après lui.
// Pour une apostrophe dans le script : '\'' (fermer, apostrophe échappée, rouvrir).
// Le contenu d'un fichier va de préférence dans le heredoc.
//
// Sortie : code 0 sans sortie = pas d'objection ; code 2 + message stderr = refus.
// Configuré avec onFailure: block : un plantage du hook refuse aussi la commande.

import { readFileSync } from "node:fs";

// SubagentHandback : rendu du rapport à l'orchestrateur, sans accès à la machine.
const OUTILS_LIBRES = new Set(["TodoWrite", "TaskCreate", "TaskUpdate", "TaskList", "TaskGet", "SubagentHandback"]);
const FORME =
    "Forme attendue : docker exec [-i] cours-iut-bac-<run-id> sh -c 'cd /work && <commandes>' " +
    "[<<'FIN' + contenu + ligne FIN]. Tout entre apostrophes ; apostrophe interne : '\\''.";

const LIGNE = new RegExp(
    "^docker exec(?: -i)? cours-iut-bac-[a-z0-9][a-z0-9-]{0,80} (?:sh|bash) -c " +
    "((?:'[^']*'|\\\\')+)" + // script : segments entre apostrophes et \' accolés
    "(?: <<'([A-Za-z_][A-Za-z0-9_]{0,30})')?" + // heredoc éventuel, délimiteur entre apostrophes
    " *$",
);
const DEBUT_SCRIPT = /^cd \/work(?:\/[A-Za-z0-9._\/-]*)?(?:\s*(?:&&|;)|\s*$)/;

function refuser(raison) {
    process.stderr.write(`Bloqué par la garde du bac à sable : ${raison}\n${FORME}\n`);
    process.exit(2);
}

function verifier(entree) {
    const outil = entree?.tool_name;
    if (OUTILS_LIBRES.has(outil)) return null;
    if (outil !== "Bash") return `outil « ${outil} » interdit (seul Bash vers le conteneur est permis).`;

    const commande = entree?.tool_input?.command;
    if (typeof commande !== "string" || commande.length === 0) return "commande vide ou illisible.";

    const saut = commande.indexOf("\n");
    const ligne = saut === -1 ? commande : commande.slice(0, saut);
    const suite = saut === -1 ? "" : commande.slice(saut + 1);
    if (ligne.includes("\r")) return "retour chariot dans la ligne de commande.";

    const m = LIGNE.exec(ligne);
    if (!m) return "la commande ne respecte pas la forme autorisée.";

    const script = m[1].replace(/\\'/g, "\u0000").replace(/'/g, "").replace(/\u0000/g, "'");
    if (!DEBUT_SCRIPT.test(script)) return "le script sh -c doit commencer par « cd /work ».";

    const delimiteur = m[2];
    if (!delimiteur) {
        if (suite.trim() !== "") return "plusieurs lignes sans heredoc : une seule commande par appel.";
        return null;
    }
    const lignes = suite.split("\n");
    const fin = lignes.indexOf(delimiteur);
    if (fin === -1) return `heredoc sans ligne de fin « ${delimiteur} ».`;
    if (lignes.slice(fin + 1).some((l) => l.trim() !== "")) return "du texte suit la fin du heredoc.";
    return null;
}

function main() {
    let entree;
    try {
        entree = JSON.parse(readFileSync(0, "utf8").replace(/^﻿/, ""));
    } catch {
        refuser("entrée du hook illisible.");
    }
    const raison = verifier(entree);
    if (raison) refuser(raison);
    process.exit(0);
}

main();
