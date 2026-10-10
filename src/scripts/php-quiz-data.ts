// src/scripts/php-quiz-data.ts
//
// Quiz du module PHP, sections 1 à 4 : bases du PHP, tableaux associatifs et objets,
// structurer son code, formulaire. Chaque question renvoie à une notion et à un piège
// signalé dans le cours correspondant (cf. exports `cours` du module « php »).
//
// Barème : les questions à plusieurs réponses valent 2 points, les autres 1. Les points
// négatifs sont actifs : sans eux, cocher toutes les propositions d'une question à choix
// multiple rapporterait le maximum.

import {randomUUID} from "node:crypto";
import type {Block} from "@/types/CourseContent";

export interface PhpQuizQuestion {
    blocks: Block[];
    options: {text: string; correct: boolean}[];
    weight: number;
    durationSeconds: number;
}

const text = (content: string): Block => ({id: randomUUID(), type: "text", props: {content}});
const php = (code: string): Block => ({
    id: randomUUID(),
    type: "code",
    props: {language: "php", code, showLineNumbers: false},
});

/** `ok` : la ou les bonnes propositions ; `ko` : les autres. */
const question = (
    blocks: Block[],
    ok: string[],
    ko: string[],
    durationSeconds = 25,
): PhpQuizQuestion => ({
    blocks,
    options: [...ok.map((t) => ({text: t, correct: true})), ...ko.map((t) => ({text: t, correct: false}))],
    weight: ok.length > 1 ? 2 : 1,
    durationSeconds,
});

export const PHP_QUIZ_NEGATIVE_MARKING = true;

export const phpQuizQuestions = (): PhpQuizQuestion[] => [
    // ── 1. Bases du PHP ─────────────────────────────────────────────────────
    question(
        [text("Un navigateur demande la page `recette.php`. Que reçoit-il en réponse ?")],
        ["Uniquement le HTML produit par l'exécution du code"],
        ["Le code PHP du fichier, tel quel", "Le code PHP suivi de son résultat", "Le fichier `recette.php` à télécharger"],
    ),
    question(
        [text("Quelles affirmations sur les méthodes HTTP sont exactes ?")],
        ["GET sert à demander une ressource", "Avec POST, les données voyagent dans le corps de la requête"],
        ["Avec POST, les données apparaissent dans l'URL", "Suivre un lien envoie une requête POST"],
        35,
    ),
    question(
        [text("Que s'affiche-t-il ?"), php("<?php\n$nom = \"Gaspacho\";\n\necho 'Plat : $nom';")],
        ["Plat : $nom"],
        ["Plat : Gaspacho", "Une erreur : variable non définie", "Rien du tout"],
        30,
    ),
    question(
        [
            text("Que s'affiche-t-il ?"),
            php("<?php\n$ingredients = [\"pastèque\", \"tomate\", \"concombre\", \"menthe\"];\n\necho $ingredients[3];"),
        ],
        ["menthe"],
        ["concombre", "pastèque", "Une erreur : indice inexistant"],
        30,
    ),
    question(
        [
            text("Que s'affiche-t-il ?"),
            php(
                "<?php\n$difficulte = \"facile\";\n\nswitch ($difficulte) {\n    case \"facile\":\n        echo \"A\";\n"
                + "    case \"moyen\":\n        echo \"B\";\n        break;\n    default:\n        echo \"C\";\n}",
            ),
        ],
        ["AB"],
        ["A", "ABC", "B"],
        40,
    ),
    question(
        [text("Quelles affirmations sur `match` (PHP 8) sont exactes ?")],
        ["Il renvoie une valeur qu'on peut affecter à une variable", "La comparaison est stricte : le type compte", "Aucun `break` n'est nécessaire"],
        ["Sans `default`, il continue en silence si aucun cas ne correspond"],
        40,
    ),
    question(
        [
            text("Que se passe-t-il à l'exécution ?"),
            php("<?php\n$plat = \"Gaspacho\";\n\nfunction afficherPlat() {\n    echo $plat;\n}\n\nafficherPlat();"),
        ],
        ["Un `Warning` : variable non définie, rien n'est affiché"],
        ["Elle affiche Gaspacho", "Elle affiche $plat", "Une `Fatal error` arrête la page"],
        35,
    ),
    question(
        [
            text("Que se passe-t-il au deuxième appel ?"),
            php("<?php\nfunction tempsEnSecondes(int $minutes): int {\n    return $minutes * 60;\n}\n\necho tempsEnSecondes(12);\necho tempsEnSecondes(\"douze\");"),
        ],
        ["Une `TypeError` arrête la page"],
        ["Il affiche 0", "Il affiche douze", "Il affiche 720 une seconde fois"],
        35,
    ),

    // ── 2. Tableaux associatifs et objets ───────────────────────────────────
    question(
        [
            text("Que se passe-t-il à l'exécution ?"),
            php("<?php\n$sushi = [\"nom\" => \"Nigiri saumon\", \"temps\" => 15];\n\necho $sushi[\"tmps\"];"),
        ],
        ["Un `Warning` : clé inexistante, la page continue avec une valeur vide"],
        ["Une `Fatal error` arrête la page", "Elle affiche 15", "Elle affiche tmps"],
        35,
    ),
    question(
        [
            text("Que vaut `$temps` ?"),
            php("<?php\n$sushi = [\"nom\" => \"California saumon avocat\"];\n\n$temps = $sushi[\"temps\"] ?? 0;"),
        ],
        ["0"],
        ["null", "Une chaîne vide", "Rien : le script s'arrête sur une erreur"],
        25,
    ),
    question(
        [text("Que renvoie `usort($sushis, fn($a, $b) => $a[\"temps\"] <=> $b[\"temps\"])` ?")],
        ["`true` : le tableau est trié en place"],
        ["Le tableau trié", "Un nouveau tableau trié, l'original est inchangé", "Le nombre d'éléments triés"],
        30,
    ),
    question(
        [text("Après un `array_filter`, des indices manquent dans le tableau. Quelle fonction les renumérote à partir de zéro ?")],
        ["`array_values`"],
        ["`array_keys`", "`array_map`", "`in_array`"],
        25,
    ),
    question(
        [
            text("Que se passe-t-il à l'exécution ?"),
            php(
                "<?php\nclass Sushi {\n    public function __construct(\n        private string $nom,\n        private int $temps,\n    ) {}\n}\n\n"
                + "$california = new Sushi(\"California saumon avocat\", 12);\n\necho $california->nom;",
            ),
        ],
        ["Une `Fatal error` : la propriété est privée"],
        ["Elle affiche California saumon avocat", "Un `Warning` : propriété inconnue, valeur vide", "Elle affiche 12"],
        40,
    ),
    question(
        [text("Quels avantages un objet a-t-il sur un tableau associatif ?")],
        ["La forme de la donnée est fixée par la classe", "Une propriété inconnue arrête la page au lieu de passer inaperçue", "Les fonctions qui manipulent la donnée se rangent dans les méthodes"],
        ["Deux objets de la même classe peuvent porter des propriétés différentes"],
        40,
    ),
    question(
        [text("Dans une méthode de la classe, comment lire la propriété privée `temps` de l'objet courant ?")],
        ["`$this->temps`"],
        ["`$temps`", "`this.temps`", "`$this.temps`"],
        25,
    ),

    // ── 3. Structurer son code ──────────────────────────────────────────────
    question(
        [text("Une classe ne doit pas être déclarée deux fois, et son absence doit arrêter le script. Quelle instruction choisir ?")],
        ["`require_once`"],
        ["`include`", "`include_once`", "`require`"],
        30,
    ),
    question(
        [text("Dans `render()`, que fait `extract($data)` ?")],
        ["Il transforme les clés du tableau en variables disponibles dans la vue"],
        ["Il échappe les valeurs du tableau pour l'affichage", "Il supprime les entrées vides du tableau", "Il charge le fichier de la vue"],
        30,
    ),
    question(
        [text("Pourquoi charger une vue avec `render()` plutôt qu'avec un `require` direct ?")],
        ["Les données attendues par la vue sont explicites dans l'appel", "La vue ne dépend plus par accident d'une autre variable du script", "La même vue peut servir avec des valeurs différentes"],
        ["La vue s'exécute plus vite"],
        40,
    ),

    // ── 4. Formulaire ───────────────────────────────────────────────────────
    question(
        [text("Quel attribut d'un champ de formulaire détermine sa clé dans `$_POST` ?")],
        ["`name`"],
        ["`id`", "`type`", "`value`"],
        20,
    ),
    question(
        [text("Pourquoi tester `$_SERVER['REQUEST_METHOD'] === 'POST'` avant de valider ?")],
        ["Sans ce test, les erreurs s'afficheraient dès l'ouverture de la page"],
        ["Pour empêcher les requêtes GET", "Pour échapper les saisies", "Pour que `$_POST` contienne des tableaux"],
        30,
    ),
    question(
        [text("Un formulaire contient des cases `diet[]`. Aucune n'est cochée à l'envoi. Que contient `$_POST` ?")],
        ["La clé `diet` est absente"],
        ["`diet` vaut un tableau vide", "`diet` vaut une chaîne vide", "`diet` vaut `false`"],
        30,
    ),
    question(
        [text("L'URL est `search.php?query[]=tarte`. Que contient `$_GET['query']` ?")],
        ["Un tableau"],
        ["La chaîne `tarte`", "La chaîne `Array`", "`null`"],
        30,
    ),
    question(
        [text("Que donne `(int) '12abc'` ?")],
        ["12"],
        ["0", "`false`", "Une `TypeError`"],
        25,
    ),
    question(
        [text("Quand faut-il échapper une saisie avec `htmlspecialchars()` ?")],
        ["Au dernier moment, quand elle rejoint le HTML"],
        ["Dès la lecture de `$_POST`, avant toute validation", "Seulement avant de l'enregistrer", "Jamais pour un champ de type `number`"],
        30,
    ),
    question(
        [text("Après un `POST` réussi, quelles lignes évitent que F5 renvoie le formulaire ?")],
        ["`header('Location: recipes.php');`", "`exit;`"],
        ["`echo 'Recette acceptée';`", "`session_start();`"],
        40,
    ),
];
