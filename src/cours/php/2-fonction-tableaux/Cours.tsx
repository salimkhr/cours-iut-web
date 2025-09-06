import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";

export default function Cours() {
    return (
        <article>
            <section>
                <Heading level={2}>A - Les tableaux indexés</Heading>
                <Text>
                    Un tableau indexé est une collection ordonnée d&apos;éléments identifiés par un <strong>indice numérique</strong>
                    commençant toujours à <Code>0</Code>. C&apos;est la structure de données la plus simple pour stocker
                    plusieurs valeurs sous un seul nom de variable.
                </Text>

                <Heading level={3}>Création et manipulation</Heading>
                <CodeCard language="php">
                    {`<?php
// 1. Création d'un tableau indexé
$fruits = ["Pomme", "Banane", "Cerise"];
// Syntaxe alternative (plus ancienne)
$couleurs = array("Rouge", "Vert", "Bleu");

// 2. Accès aux éléments
echo $fruits[0];  // "Pomme" (premier élément)
echo $fruits[2];  // "Cerise" (troisième élément)

// 3. Modification d'un élément
$fruits[1] = "Orange";  // Remplace "Banane" par "Orange"

// 4. Ajout d'éléments
$fruits[] = "Kiwi";           // Ajoute à la fin
$fruits[10] = "Ananas";       // Ajoute à l'index 10
array_push($fruits, "Mangue"); // Ajoute à la fin (fonction)

// 5. Suppression d'éléments
unset($fruits[0]);    // Supprime l'élément à l'index 0
array_pop($fruits);   // Supprime le dernier élément
array_shift($fruits); // Supprime le premier élément
?>`}
                </CodeCard>

                <Heading level={3}>Parcours des tableaux</Heading>
                <CodeCard language="php">
                    {`<?php
$nombres = [10, 20, 30, 40, 50];

// Méthode 1 : foreach (recommandée)
foreach ($nombres as $nombre) {
    echo $nombre . " ";
}

// Méthode 2 : foreach avec index
foreach ($nombres as $index => $nombre) {
    echo "Index $index : $nombre\\n";
}

// Méthode 3 : boucle for classique
for ($i = 0; $i < count($nombres); $i++) {
    echo "Element $i : " . $nombres[$i] . "\\n";
}
?>`}
                </CodeCard>

                <Heading level={3}>Fonctions utiles</Heading>
                <CodeCard language="php">
                    {`<?php
$tab = [1, 2, 3, 4, 5];

// Informations sur le tableau
count($tab);        // Nombre d'éléments : 5
empty($tab);        // false (le tableau n'est pas vide)
isset($tab[2]);     // true (l'index 2 existe)

// Manipulation
sort($tab);         // Tri croissant
rsort($tab);        // Tri décroissant
shuffle($tab);      // Mélange aléatoire
array_reverse($tab); // Inverse l'ordre

// Recherche
in_array(3, $tab);           // true (3 est dans le tableau)
array_search(3, $tab);       // Retourne l'index de 3

// Transformation
array_sum($tab);             // Somme de tous les éléments
array_unique([1,1,2,2,3]);   // [1,2,3] (supprime les doublons)
?>`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>B - Les tableaux associatifs</Heading>
                <Text>
                    Un tableau associatif utilise des <strong>clés nommées</strong> (chaînes de caractères ou nombres)
                    plutôt que des indices numériques. Il établit une relation <strong>clé → valeur</strong>,
                    idéal pour représenter des données structurées.
                </Text>

                <Heading level={3}>Syntaxe et utilisation</Heading>
                <CodeCard language="php">
                    {`<?php
// 1. Création d'un tableau associatif
$personne = [
    "nom" => "Dupont",
    "prenom" => "Jean",
    "age" => 35,
    "ville" => "Paris"
];

// 2. Accès aux éléments
echo $personne["nom"];     // "Dupont"
echo $personne["age"];     // 35

// 3. Modification et ajout
$personne["age"] = 36;     // Modifie l'âge
$personne["email"] = "jean.dupont@email.com"; // Ajoute une nouvelle clé

// 4. Suppression
unset($personne["ville"]); // Supprime la clé "ville"

// 5. Vérification d'existence
if (isset($personne["email"])) {
    echo "Email : " . $personne["email"];
}
?>`}
                </CodeCard>

                <Heading level={3}>Parcours et fonctions spécialisées</Heading>
                <CodeCard language="php">
                    {`<?php
$notes = [
    "Mathématiques" => 15,
    "Français" => 12,
    "Histoire" => 14,
    "Anglais" => 16
];

// Parcours avec clé et valeur
foreach ($notes as $matiere => $note) {
    echo "$matiere : $note/20\\n";
}

// Fonctions spécifiques
array_keys($notes);      // ["Mathématiques", "Français", "Histoire", "Anglais"]
array_values($notes);    // [15, 12, 14, 16]
array_flip($notes);      // [15 => "Mathématiques", 12 => "Français", ...]

// Tri associatif
asort($notes);   // Tri par valeurs (conserve les associations)
ksort($notes);   // Tri par clés
arsort($notes);  // Tri par valeurs décroissant
?>`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>C - Les tableaux multidimensionnels</Heading>
                <Text>
                    Un tableau multidimensionnel est un tableau qui contient d&apos;autres tableaux comme éléments.
                    Cette structure permet de représenter des données complexes et hiérarchiques.
                </Text>

                <Heading level={3}>Types de structures</Heading>
                <CodeCard language="php">
                    {`<?php
// 1. Tableau 2D indexé (matrice)
$matrice = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];
echo $matrice[1][2]; // 6 (ligne 1, colonne 2)

// 2. Tableau 2D associatif
$etudiants = [
    [
        "nom" => "Martin",
        "age" => 20,
        "notes" => [15, 12, 18]
    ],
    [
        "nom" => "Durand", 
        "age" => 21,
        "notes" => [16, 14, 13]
    ]
];

// 3. Structure complexe d'entreprise
$entreprise = [
    "employes" => [
        "dev" => ["Alice", "Bob"],
        "design" => ["Charlie", "David"]
    ],
    "projets" => [
        "site_web" => ["status" => "actif", "budget" => 5000],
        "app_mobile" => ["status" => "terminé", "budget" => 8000]
    ]
];
?>`}
                </CodeCard>

                <Heading level={3}>Manipulation et parcours</Heading>
                <CodeCard language="php">
                    {`<?php
$equipes = [
    "Alpha" => [
        ["nom" => "Jean", "role" => "leader"],
        ["nom" => "Marie", "role" => "dev"]
    ],
    "Beta" => [
        ["nom" => "Paul", "role" => "design"],
        ["nom" => "Lisa", "role" => "test"]
    ]
];

// Parcours complet
foreach ($equipes as $nomEquipe => $membres) {
    echo "Équipe $nomEquipe :\\n";
    foreach ($membres as $membre) {
        echo "- {$membre['nom']} ({$membre['role']})\\n";
    }
}

// Ajout d'un membre
$equipes["Alpha"][] = ["nom" => "Tom", "role" => "marketing"];

// Comptage récursif
count($equipes, COUNT_RECURSIVE); // Compte tous les éléments
?>`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>D - Les fonctions</Heading>
                <Text>
                    Depuis PHP 7, il est possible de <strong>typer les paramètres</strong> et le <strong>type de retour</strong>
                    d&apos;une fonction. Cela permet d&apos;éviter des erreurs et de rendre le code plus lisible et maintenable.
                </Text>

                <Heading level={3}>Syntaxe de base et typage</Heading>
                <CodeCard language="php">
                    {`<?php
// Fonction simple sans paramètres
function direBonjour(): string {
    return "Bonjour tout le monde !";
}

// Fonction avec paramètres typés
function calculerSomme(int $a, int $b): int {
    return $a + $b;
}

// Fonction avec paramètres par défaut
function saluer(string $nom = "Visiteur", string $titre = "M./Mme"): string {
    return "Bonjour $titre $nom !";
}

// Types supportés
function exempleTypes(
    string $texte,        // Chaîne de caractères
    int $entier,          // Nombre entier
    float $decimal,       // Nombre décimal
    bool $boolean,        // Booléen
    array $tableau,       // Tableau
    ?string $optionnel    // string ou null
): void {                 // void = aucun retour
    // Traitement...
}
?>`}
                </CodeCard>

                <Heading level={3}>Portée des variables et fonctions avancées</Heading>
                <CodeCard language="php">
                    {`<?php
$globale = "Variable globale";

function exempleScope(): void {
    global $globale;  // Accès à la variable globale
    static $compteur = 0;  // Variable statique (persiste entre appels)
    
    $compteur++;
    echo "Compteur: $compteur\\n";
}

// Fonction avec références
function modifierTableau(array &$tableau): void {
    $tableau[] = "nouvel élément";
}

// Fonction récursive
function factorielle(int $n): int {
    return ($n <= 1) ? 1 : $n * factorielle($n - 1);
}

// Fonctions anonymes (closures)
$multiplier = function(int $x, int $y): int {
    return $x * $y;
};

// Arrow functions (PHP 7.4+)
$doubler = fn($x) => $x * 2;
?>`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>E - Les générateurs</Heading>
                <Text>
                    Un générateur est une fonction spéciale qui utilise le mot-clé <code>yield</code>.
                    Il permet de créer des itérateurs sans stocker tous les éléments en mémoire,
                    très utile pour parcourir de grandes quantités de données ou créer des séquences infinies.
                </Text>

                <CodeCard language="php">
                    {`<?php
// Générateur simple
function compteur(int $debut, int $fin): Generator {
    for ($i = $debut; $i <= $fin; $i++) {
        yield $i;
    }
}

// Générateur avec clés
function alphabet(): Generator {
    foreach (range('A', 'Z') as $index => $lettre) {
        yield $index => $lettre;
    }
}

// Générateur infini (Fibonacci)
function fibonacci(): Generator {
    $a = 0;
    $b = 1;
    
    yield $a;
    yield $b;
    
    while (true) {
        $c = $a + $b;
        yield $c;
        $a = $b;
        $b = $c;
    }
}

// Utilisation
foreach (compteur(1, 5) as $nombre) {
    echo $nombre . " "; // 1 2 3 4 5
}

// Fibonacci avec limitation
$fib = fibonacci();
for ($i = 0; $i < 10; $i++) {
    echo $fib->current() . " ";
    $fib->next();
}
?>`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>F - Les chaînes de caractères</Heading>
                <Text>
                    En PHP, les chaînes peuvent être déclarées de plusieurs façons, chacune ayant ses spécificités
                    en termes d&apos;interprétation des variables et des caractères spéciaux.
                </Text>

                <Heading level={3}>Types de chaînes et syntaxes</Heading>
                <List>
                    <ListItem>
                        <strong>Simple quotes (&apos;&apos;)</strong> : le contenu est pris littéralement.
                        Les variables ne sont <u>pas interprétées</u>.
                    </ListItem>
                    <ListItem>
                        <strong>Double quotes (&quot;&quot;)</strong> : les variables sont <u>interpolées</u>
                        et certains caractères d&apos;échappement reconnus.
                    </ListItem>
                    <ListItem>
                        <strong>Heredoc</strong> : texte multiligne avec interpolation de variables.
                    </ListItem>
                    <ListItem>
                        <strong>Nowdoc</strong> : texte multiligne sans interpolation (comme simple quotes).
                    </ListItem>
                </List>

                <CodeCard language="php">
                    {`<?php
$nom = "Alice";
$age = 25;

// 1. Simple quotes - Interprétation littérale
$message1 = 'Bonjour $nom'; // Affiche: Bonjour $nom

// 2. Double quotes - Interpolation de variables
$message2 = "Bonjour $nom"; // Affiche: Bonjour Alice
$message3 = "Tu as $age ans"; // Affiche: Tu as 25 ans

// 3. Syntaxe complexe avec accolades
$message4 = "Bonjour {$nom}, tu as {$age} ans";

// 4. Concaténation
$message5 = "Bonjour " . $nom . ", tu as " . $age . " ans";
$phrase = "Bonjour ";
$phrase .= $nom;  // Opérateur .= pour concaténer

// 5. Heredoc - Multilignes avec interpolation
$texteHeredoc = <<<EOT
Nom: $nom
Age: $age
Message: Bienvenue sur notre site !
EOT;

// 6. Nowdoc - Multilignes sans interpolation
$texteNowdoc = <<<'EOT'
Nom: $nom
Age: $age
Message: Les variables ne sont pas interprétées
EOT;
?>`}
                </CodeCard>

                <Heading level={3}>Caractères d&apos;échappement et manipulation</Heading>
                <CodeCard language="php">
                    {`<?php
// Caractères d'échappement dans les double quotes
$texte = "Ligne 1\\nLigne 2\\tAvec tabulation";
$guillemets = "Il a dit : \\"Bonjour\\"";
$chemin = "C:\\\\Users\\\\Documents";  // Antislash échappé

// Fonctions de manipulation courantes
$phrase = "  Bonjour le Monde  ";

// Nettoyage
trim($phrase);           // "Bonjour le Monde"
ltrim($phrase);          // "Bonjour le Monde  "
rtrim($phrase);          // "  Bonjour le Monde"

// Casse
strtolower($phrase);     // "  bonjour le monde  "
strtoupper($phrase);     // "  BONJOUR LE MONDE  "
ucfirst("hello");        // "Hello"
ucwords("hello world");  // "Hello World"

// Recherche et remplacement
str_replace("Monde", "PHP", $phrase);     // Remplace "Monde" par "PHP"
strpos($phrase, "Monde");                 // Position de "Monde"
substr($phrase, 0, 7);                    // Extraction de caractères

// Division et jonction
$parties = explode(" ", trim($phrase));   // ["Bonjour", "le", "Monde"]
$rejointe = implode("-", $parties);       // "Bonjour-le-Monde"

// Longueur et validation
strlen($phrase);                 // Longueur en octets
mb_strlen($phrase, 'UTF-8');     // Longueur en caractères UTF-8
?>`}
                </CodeCard>
            </section>
        </article>
    );
}