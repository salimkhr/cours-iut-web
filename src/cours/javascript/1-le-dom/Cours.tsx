import CodeCard from "@/components/Cards/CodeCard";
import CoursePrerequisites from "@/components/CoursePrerequisites";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";

export default function Cours() {
    return (
        <article>
            <CoursePrerequisites>
                <Text>
                    <strong>La structure d&apos;une page HTML</strong> repose sur quatre balises
                    imbriquées : <Code>&lt;html&gt;</Code> contient tout, <Code>&lt;head&gt;</Code>{" "}
                    porte les métadonnées (titre, encodage, styles), <Code>&lt;body&gt;</Code>{" "}
                    contient le contenu visible.
                </Text>
                <CodeCard language="html">
                    {`<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Ma page</title>
    </head>
    <body>
        <h1>Titre principal</h1>
        <p>Un paragraphe.</p>
    </body>
</html>`}
                </CodeCard>

                <Text>
                    <strong>Les balises de contenu courantes</strong> structurent le texte et les blocs
                    de la page : <Code>&lt;div&gt;</Code> et <Code>&lt;span&gt;</Code> sont des
                    conteneurs neutres, <Code>&lt;p&gt;</Code> un paragraphe,{" "}
                    <Code>&lt;h1&gt;</Code>–<Code>&lt;h6&gt;</Code> des titres hiérarchisés.
                </Text>
                <CodeCard language="html">
                    {`<div class="carte">
    <h2>Titre de la carte</h2>
    <p>Description <span class="important">importante</span>.</p>
</div>`}
                </CodeCard>

                <Text>
                    <strong>L&apos;attribut <Code>id</Code></strong> donne un identifiant unique à un
                    élément. <strong>L&apos;attribut <Code>class</Code></strong> lui attribue une ou
                    plusieurs classes réutilisables sur plusieurs éléments.
                </Text>
                <CodeCard language="html">
                    {`<h1 id="titre-principal">Bienvenue</h1>
<p class="intro">Premier paragraphe.</p>
<p class="intro important">Deuxième paragraphe.</p>`}
                </CodeCard>

                <Text>
                    <strong>Les sélecteurs CSS</strong> permettent de cibler des éléments pour leur
                    appliquer des styles : par balise, par classe avec <Code>.</Code> ou par identifiant
                    avec <Code>#</Code>.
                </Text>
                <CodeCard language="css">
                    {`p { color: black; }        /* tous les <p> */
.intro { font-size: 1rem; } /* class="intro" */
#titre-principal { }        /* id="titre-principal" */`}
                </CodeCard>
            </CoursePrerequisites>
            <section>
                <Heading level={2}>A- Introduction au JavaScript</Heading>
                <Text>
                    JavaScript est un langage de programmation utilisé pour rendre les pages web
                    interactives. C&apos;est l&apos;un des trois piliers du développement web :
                </Text>
                <List>
                    <ListItem><strong>HTML</strong> : structure du contenu.</ListItem>
                    <ListItem><strong>CSS</strong> : mise en forme.</ListItem>
                    <ListItem><strong>JavaScript</strong> : interactions et logique.</ListItem>
                </List>

                <Heading level={3}>1. Inclure JavaScript dans un fichier HTML</Heading>
                <Text>
                    Vous pouvez ajouter du JavaScript directement dans une page HTML avec la balise{" "}
                    <Code>{`<script>`}</Code>, ou bien dans un fichier séparé pour une meilleure
                    organisation :
                </Text>
                <CodeCard language="html">
                    {`<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Introduction au JavaScript</title>
    </head>
    <body>
        <h1>Ma première page JavaScript</h1>

        <!-- JavaScript intégré -->
        <script>
            console.log("Bonjour depuis le script intégré !");
        </script>

        <!-- Lien vers un fichier JS externe -->
        <script src="script.js"></script>
    </body>
</html>`}
                </CodeCard>
                <Text>
                    Important : placez toujours la balise <Code>&lt;script&gt;</Code> juste avant{" "}
                    <Code>&lt;/body&gt;</Code>. Si elle se trouve dans le <Code>&lt;head&gt;</Code>,
                    JavaScript s&apos;exécute avant que les éléments HTML soient chargés et ne peut pas
                    les trouver. Vous pouvez aussi utiliser l&apos;attribut <Code>defer</Code> qui charge
                    le script en parallèle et l&apos;exécute une fois la page prête :{" "}
                    <Code>{`<script src="script.js" defer></script>`}</Code>.
                </Text>
                <Text>
                    Dès que votre script est chargé, vous pouvez afficher des messages dans la console
                    du navigateur avec <Code>console.log()</Code>. Ouvrez la console maintenant avec{" "}
                    <Code>F12</Code> → onglet <Code>Console</Code> — les détails de l&apos;outil sont
                    présentés en section G.
                </Text>
            </section>

            <section>
                <Heading level={2}>B- Les variables et types de données</Heading>

                <Heading level={3}>1. Les variables en JavaScript</Heading>
                <Text>
                    On utilise principalement trois mots-clés pour les déclarer : <Code>const</Code>,{" "}
                    <Code>let</Code> et <Code>var</Code>.
                </Text>

                <List>
                    <ListItem>
                        <strong><Code>const</Code></strong> sert à déclarer des valeurs constantes. Cela ne
                        signifie pas que les propriétés d&apos;un objet ou d&apos;un tableau déclaré avec{" "}
                        <Code>const</Code> ne peuvent pas être modifiées : seule la référence est immuable.
                    </ListItem>
                    <ListItem>
                        <strong><Code>let</Code></strong> sert à déclarer des variables dont la valeur peut
                        changer au cours de l&apos;exécution du programme.
                    </ListItem>
                    <ListItem>
                        <strong><Code>var</Code></strong> est l&apos;ancienne façon de déclarer des
                        variables. À ne plus utiliser : <Code>var</Code> est <em>remonté</em> (hoisted)
                        en haut de sa portée — la variable est connue avant même sa déclaration, ce qui
                        produit des comportements inattendus. De plus, il autorise la redéclaration
                        silencieuse sans erreur.
                    </ListItem>
                </List>

                <CodeCard language="javascript">
                    {`// const : valeur constante
const pi = 3.14;
console.log(pi); // 3.14

// Modification du contenu d'un tableau déclaré avec const
const arr = [1, 2, 3];
arr.push(4); // Ok, on modifie le contenu, pas la référence
console.log(arr); // [1, 2, 3, 4]

// let : variable modifiable
let age = 25;
age = 26;
console.log(age); // 26

// var : hoisting — variable connue avant sa déclaration
console.log(compteur); // undefined (pas d'erreur, mais pas 0 !)
var compteur = 0;

// var autorise la redéclaration silencieuse
var x = 1;
var x = 2; // Aucune erreur — avec let ce serait une erreur`}
                </CodeCard>

                <Heading level={3}>2. Types de données</Heading>
                <Text>
                    En JavaScript, les variables ne nécessitent pas de type explicite. Vous pouvez stocker
                    n&apos;importe quel type de données dans une même variable : JavaScript déterminera le
                    type automatiquement à l&apos;exécution.
                </Text>

                <CodeCard language="javascript">
                    {`// Chaîne de caractères
const message = "Bonjour !";   // type: string

// Nombre
const age = 30;                 // type: number

// Booléen
const isStudent = true;         // type: boolean

// Tableau
const fruits = ["pomme", "banane", "cerise"]; // type: array

// Objet
const personne = {
    nom: "Alice", // string
    age: 25       // number
};

// Valeurs spéciales
let nonDefini;           // undefined : variable déclarée sans valeur assignée
const absent = null;     // null : absence intentionnelle de valeur

// typeof révèle le type d'une valeur
console.log(typeof message);   // "string"
console.log(typeof age);       // "number"
console.log(typeof isStudent); // "boolean"
console.log(typeof fruits);    // "object" ← pas "array" (particularité de JS à connaître)
console.log(typeof null);      // "object" ← autre curiosité historique de JS`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>C- Opérateurs et conditions</Heading>

                <Heading level={3}>1. Opérateurs de comparaison</Heading>
                <Text>
                    Les opérateurs de comparaison comparent deux valeurs et retournent un booléen
                    (<Code>true</Code> ou <Code>false</Code>).
                </Text>

                <CodeCard language="javascript">
                    {`// Égalité stricte (type et valeur)
console.log(5 === 5);        // true
console.log(5 === "5");      // false (types différents)

// Inégalité stricte
console.log(5 !== 3);        // true
console.log(5 !== "5");      // true

// Comparaisons numériques
console.log(10 > 5);         // true
console.log(10 < 5);         // false
console.log(10 >= 10);       // true
console.log(5 <= 3);         // false`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong><Code>===</Code></strong> : égalité stricte (valeur ET type doivent être
                        identiques). À privilégier.
                    </ListItem>
                    <ListItem>
                        <strong><Code>!==</Code></strong> : inégalité stricte (valeur OU type différents).
                    </ListItem>
                    <ListItem>
                        <strong>
                            <Code>&gt;</Code>, <Code>&lt;</Code>, <Code>&gt;=</Code>, <Code>&lt;=</Code>
                        </strong>{" "}
                        : comparaisons numériques classiques.
                    </ListItem>
                </List>

                <Heading level={3}>2. Opérateurs logiques</Heading>
                <Text>Les opérateurs logiques permettent de combiner plusieurs conditions.</Text>

                <CodeCard language="javascript">
                    {`const age = 20;
const hasPermission = true;

// ET logique (&&) : les deux conditions doivent être vraies
console.log(age >= 18 && hasPermission);  // true

// OU logique (||) : au moins une condition doit être vraie
console.log(age < 18 || hasPermission);   // true

// NON logique (!) : inverse la valeur booléenne
console.log(!hasPermission);              // false`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong><Code>&amp;&amp;</Code></strong> : retourne <Code>true</Code> si les deux
                        conditions sont vraies.
                    </ListItem>
                    <ListItem>
                        <strong><Code>||</Code></strong> : retourne <Code>true</Code> si au moins une
                        condition est vraie.
                    </ListItem>
                    <ListItem>
                        <strong><Code>!</Code></strong> : inverse la valeur booléenne.
                    </ListItem>
                </List>

                <Heading level={3}>3. Structures conditionnelles</Heading>
                <Text>
                    Les structures conditionnelles permettent d&apos;exécuter du code{" "}
                    <strong>uniquement si une condition est remplie</strong>. Elles sont indispensables pour
                    prendre des décisions dans un programme.
                </Text>

                <Heading level={4}>3.1 Le if simple</Heading>
                <Text>
                    La structure <Code>if</Code> exécute un bloc de code si la condition est vraie.
                </Text>
                <CodeCard language="javascript">
                    {`const age = 20;

if (age >= 18) {
    console.log("Vous êtes majeur");
}`}
                </CodeCard>

                <Heading level={4}>3.2 if / else</Heading>
                <Text>
                    La structure <Code>if...else</Code> permet de gérer deux cas : une condition vraie et
                    une condition fausse.
                </Text>
                <CodeCard language="javascript">
                    {`const temperature = 15;

if (temperature > 25) {
    console.log("Il fait chaud");
} else {
    console.log("Il fait frais");
}`}
                </CodeCard>

                <Heading level={4}>3.3 switch</Heading>
                <Text>
                    Le <Code>switch</Code> est utilisé lorsque l&apos;on compare{" "}
                    <strong>une même valeur à plusieurs cas possibles</strong>. Il est souvent plus lisible
                    qu&apos;une succession de <Code>if...else if</Code>. Le mot-clé <Code>break</Code>{" "}
                    est indispensable à la fin de chaque cas : sans lui, l&apos;exécution continue dans
                    le cas suivant (<em>fall-through</em>), ce qui est rarement voulu.
                </Text>
                <CodeCard language="javascript">
                    {`const day = 3;

switch (day) {
    case 1: console.log("Lundi"); break;
    case 2: console.log("Mardi"); break;
    case 3: console.log("Mercredi"); break;
    case 4: console.log("Jeudi"); break;
    case 5: console.log("Vendredi"); break;
    case 6: console.log("Samedi"); break;
    case 7: console.log("Dimanche"); break;
    default: console.log("Jour invalide");
}`}
                </CodeCard>

                <Heading level={4}>3.4 Opérateur ternaire</Heading>
                <Text>
                    L&apos;opérateur ternaire est une forme condensée de <Code>if...else</Code>, utilisée
                    pour des conditions simples.
                </Text>
                <CodeCard language="javascript">
                    {`const age = 20;
const statut = age >= 18 ? "majeur" : "mineur";

console.log(statut); // "majeur"`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>D- Parcourir et manipuler des tableaux</Heading>

                <Text>
                    Les tableaux sont des structures de données fondamentales en JavaScript. Ils permettent
                    de stocker plusieurs valeurs et offrent de nombreuses méthodes pour parcourir,
                    transformer et analyser leurs données.
                </Text>

                <Heading level={3}>1. Ajouter, supprimer et rechercher</Heading>
                <Text>
                    Avant de parcourir ou transformer un tableau, il est utile de savoir y ajouter et
                    rechercher des éléments.
                </Text>
                <CodeCard language="javascript">
                    {`const fruits = ["pomme", "banane"];

// Ajouter à la fin
fruits.push("cerise");         // ["pomme", "banane", "cerise"]

// Supprimer le dernier élément
const dernier = fruits.pop();  // dernier = "cerise", fruits = ["pomme", "banane"]

// Chercher l'index d'une valeur (-1 si absente)
const idx = fruits.indexOf("banane"); // 1
const absent = fruits.indexOf("kiwi"); // -1

// Vérifier la présence d'une valeur
const existe = fruits.includes("pomme"); // true`}
                </CodeCard>

                <Heading level={3}>2. Parcourir un tableau</Heading>
                <Text>
                    JavaScript propose plusieurs façons de parcourir un tableau. Le choix dépend du type de
                    traitement que vous souhaitez effectuer.
                </Text>

                <Heading level={4}>2.1 Boucle <Code>for</Code> classique</Heading>
                <Text>
                    La boucle <Code>for</Code> permet de parcourir un tableau à l&apos;aide de son index.
                    Elle est utile lorsque l&apos;on a besoin de contrôler précisément la boucle.
                </Text>
                <CodeCard language="javascript">
                    {`const fruits = ["pomme", "banane", "cerise"];

for (let i = 0; i < fruits.length; i++) {
    console.log(fruits[i]);
}`}
                </CodeCard>

                <Heading level={4}>2.2 Méthode <Code>forEach</Code></Heading>
                <Text>
                    <Code>forEach</Code> exécute une fonction pour chaque élément du tableau. Elle est
                    idéale lorsque l&apos;on souhaite simplement effectuer une action sur chaque valeur.
                </Text>
                <CodeCard language="javascript">
                    {`const fruits = ["pomme", "banane", "cerise"];

fruits.forEach((fruit) => {
    console.log(fruit); // pomme, banane, cerise
});`}
                </CodeCard>

                <Heading level={4}>2.3 Boucle <Code>for...of</Code></Heading>
                <Text>
                    <Code>for...of</Code> permet de parcourir directement les valeurs d&apos;un tableau,
                    sans passer par les indices.
                </Text>
                <CodeCard language="javascript">
                    {`const fruits = ["pomme", "banane", "cerise"];

for (const fruit of fruits) {
    console.log(fruit); // pomme, banane, cerise
}`}
                </CodeCard>

                <Heading level={3}>3. Transformer un tableau avec <Code>map</Code></Heading>
                <Text>
                    La méthode <Code>map</Code> permet de <strong>transformer chaque élément</strong>{" "}
                    d&apos;un tableau et de retourner un <strong>nouveau tableau</strong>. Le tableau
                    original n&apos;est jamais modifié.
                </Text>
                <Text>
                    <Code>map</Code> est particulièrement utile lorsque vous souhaitez convertir des
                    données, reformater des valeurs ou extraire certaines informations.
                </Text>
                <CodeCard language="javascript">
                    {`const prices = [10, 20, 30];

// Ajouter une TVA de 20 % à chaque prix
const pricesWithTax = prices.map((price) => price * 1.2);

console.log(pricesWithTax); // [12, 24, 36]`}
                </CodeCard>

                <Text>Exemple avec un tableau d&apos;objets :</Text>
                <CodeCard language="javascript">
                    {`const users = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 17 },
    { name: "Charlie", age: 30 }
];

// Extraire uniquement les noms
const names = users.map((user) => user.name);

console.log(names); // ["Alice", "Bob", "Charlie"]`}
                </CodeCard>

                <Heading level={3}>4. Filtrer un tableau avec <Code>filter</Code></Heading>
                <Text>
                    La méthode <Code>filter</Code> permet de créer un nouveau tableau contenant uniquement
                    les éléments qui respectent une condition.
                </Text>
                <Text>
                    Chaque élément est testé, et seuls ceux pour lesquels la condition est vraie sont
                    conservés.
                </Text>
                <CodeCard language="javascript">
                    {`const ages = [12, 18, 25, 30, 15];

// Conserver uniquement les majeurs
const adults = ages.filter((age) => age >= 18);

console.log(adults); // [18, 25, 30]`}
                </CodeCard>

                <Text>Exemple avec des objets :</Text>
                <CodeCard language="javascript">
                    {`const users = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 17 },
    { name: "Charlie", age: 30 }
];

// Filtrer les utilisateurs majeurs
const adultUsers = users.filter((user) => user.age >= 18);

console.log(adultUsers);`}
                </CodeCard>

                <Heading level={3}>5. Réduire un tableau avec <Code>reduce</Code></Heading>
                <Text>
                    La méthode <Code>reduce</Code> permet de <strong>combiner toutes les valeurs</strong>{" "}
                    d&apos;un tableau en une seule (nombre, chaîne, objet, tableau, etc.).
                </Text>
                <Text>
                    Elle fonctionne à l&apos;aide d&apos;un accumulateur qui évolue à chaque itération.
                </Text>
                <CodeCard language="javascript">
                    {`const numbers = [1, 2, 3, 4, 5];

// À chaque itération, reduce passe l'accumulateur (résultat précédent) à la fonction :
// Départ : acc = 0            (valeur initiale fournie en 2e argument)
// Tour 1 : acc = 0  + 1  → 1
// Tour 2 : acc = 1  + 2  → 3
// Tour 3 : acc = 3  + 3  → 6
// Tour 4 : acc = 6  + 4  → 10
// Tour 5 : acc = 10 + 5  → 15
const sum = numbers.reduce((accumulator, current) => accumulator + current, 0);

console.log(sum); // 15`}
                </CodeCard>

                <Text>Exemple plus avancé avec des objets :</Text>
                <CodeCard language="javascript">
                    {`const cart = [
    { name: "Laptop", price: 1000, quantity: 1 },
    { name: "Mouse", price: 25, quantity: 2 }
];

// Calculer le total du panier
const total = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

console.log(total); // 1050`}
                </CodeCard>

                <Heading level={3}>6. Chaînage des méthodes</Heading>
                <Text>
                    Les méthodes <Code>map</Code>, <Code>filter</Code> et <Code>reduce</Code> peuvent être
                    enchaînées : chaque méthode reçoit le tableau produit par la précédente. L&apos;ordre
                    d&apos;écriture est l&apos;ordre d&apos;exécution, de haut en bas.
                </Text>
                <CodeCard language="javascript">
                    {`const users = [
    { name: "Alice", age: 25 },
    { name: "Bob", age: 17 },
    { name: "Charlie", age: 30 }
];

// Calculer la somme des âges des utilisateurs majeurs
const totalAge = users
    .filter((user) => user.age >= 18)
    .map((user) => user.age)
    .reduce((acc, age) => acc + age, 0);

console.log(totalAge); // 55`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>E- Les fonctions</Heading>
                <Text>
                    Les fonctions sont des blocs de code réutilisables qui effectuent une tâche spécifique.
                    Elles permettent d&apos;organiser le code et d&apos;éviter les répétitions.
                </Text>

                <Heading level={3}>1. Déclaration de fonction classique</Heading>
                <CodeCard language="javascript">
                    {`// Fonction sans paramètre
function direBonjour() {
    console.log("Bonjour !");
}
direBonjour(); // Affiche "Bonjour !"

// Fonction avec paramètres
function saluer(nom) {
    console.log("Bonjour " + nom + " !");
}
saluer("Alice"); // "Bonjour Alice !"
saluer("Bob");   // "Bonjour Bob !"

// Fonction avec valeur de retour
function additionner(a, b) {
    return a + b;
}
const resultat = additionner(5, 3);
console.log(resultat); // 8`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong>Paramètres</strong> : variables que la fonction reçoit lors de son appel.
                    </ListItem>
                    <ListItem>
                        <strong><Code>return</Code></strong> : renvoie une valeur et termine
                        l&apos;exécution de la fonction.
                    </ListItem>
                    <ListItem>
                        Une fonction sans <Code>return</Code> renvoie <Code>undefined</Code> par défaut.
                    </ListItem>
                </List>

                <Heading level={3}>2. Fonctions fléchées (arrow functions)</Heading>
                <Text>
                    Les fonctions fléchées sont une syntaxe plus concise introduite en ES6. Elles sont
                    particulièrement utiles pour les fonctions courtes.
                </Text>
                <CodeCard language="javascript">
                    {`// Syntaxe complète
const multiplier = (a, b) => {
    return a * b;
};
console.log(multiplier(4, 5)); // 20

// Syntaxe courte (return implicite pour une seule expression)
const carre = (x) => x * x;
console.log(carre(5)); // 25

// Un seul paramètre : parenthèses optionnelles
const doubler = x => x * 2;
console.log(doubler(7)); // 14

// Aucun paramètre : parenthèses obligatoires
const direHello = () => console.log("Hello!");
direHello(); // "Hello!"`}
                </CodeCard>

                <List>
                    <ListItem>
                        Si la fonction ne contient qu&apos;une seule expression, les accolades et{" "}
                        <Code>return</Code> sont optionnels.
                    </ListItem>
                    <ListItem>
                        Les parenthèses autour du paramètre sont optionnelles s&apos;il n&apos;y en a
                        qu&apos;un seul.
                    </ListItem>
                    <ListItem>
                        Les fonctions fléchées sont souvent utilisées avec les méthodes de tableaux comme{" "}
                        <Code>forEach</Code>, <Code>map</Code>, <Code>filter</Code>.
                    </ListItem>
                </List>

                <Heading level={3}>3. Portée des variables (scope)</Heading>
                <Text>La portée détermine où une variable est accessible dans le code.</Text>
                <CodeCard language="javascript">
                    {`// Variable globale (accessible partout)
const nom = "Alice";

function afficherNom() {
    console.log(nom); // Accès possible à la variable globale
}
afficherNom(); // "Alice"

// Variable locale (accessible uniquement dans la fonction)
function calculer() {
    const resultat = 10 + 5; // Variable locale
    console.log(resultat);   // 15
}
calculer();
// console.log(resultat); // Erreur : resultat n'existe pas ici

// Paramètres = variables locales
function multiplier(a, b) {
    return a * b;
}
// console.log(a); // Erreur : a n'existe que dans la fonction`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong>Variables globales</strong> : déclarées en dehors de toute fonction,
                        accessibles partout.
                    </ListItem>
                    <ListItem>
                        <strong>Variables locales</strong> : déclarées dans une fonction, accessibles
                        uniquement à l&apos;intérieur.
                    </ListItem>
                    <ListItem>Les paramètres de fonction sont des variables locales.</ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>F- Template literals (chaînes de caractères)</Heading>
                <Text>
                    Les template literals (ou littéraux de gabarit) permettent de créer des chaînes de
                    caractères de manière plus lisible et flexible en utilisant les backticks
                    (<Code>{"`"}</Code>).
                </Text>

                <Heading level={3}>1. Interpolation de variables</Heading>
                <CodeCard language="javascript">
                    {`// Méthode classique avec concaténation (+)
const prenom = "Alice";
const age = 25;
const message1 = "Bonjour, je m'appelle " + prenom + " et j'ai " + age + " ans.";
console.log(message1);

// Avec template literals (plus lisible)
const message2 = \`Bonjour, je m'appelle \${prenom} et j'ai \${age} ans.\`;
console.log(message2);

// Avec des expressions
const a = 10;
const b = 5;
console.log(\`La somme de \${a} et \${b} est \${a + b}\`);
// "La somme de 10 et 5 est 15"`}
                </CodeCard>

                <List>
                    <ListItem>
                        Utilisez les backticks (<Code>{"`"}</Code>) au lieu des guillemets simples ou
                        doubles.
                    </ListItem>
                    <ListItem>
                        <Code>{"${expression}"}</Code> permet d&apos;insérer une variable ou une expression
                        JavaScript.
                    </ListItem>
                    <ListItem>Plus lisible que la concaténation avec <Code>+</Code>.</ListItem>
                </List>

                <Heading level={3}>2. Chaînes multi-lignes</Heading>
                <CodeCard language="javascript">
                    {`// Méthode classique (compliqué)
const texte1 = "Première ligne\\n" +
               "Deuxième ligne\\n" +
               "Troisième ligne";

// Avec template literals (simple et lisible)
const texte2 = \`Première ligne
Deuxième ligne
Troisième ligne\`;

console.log(texte2);`}
                </CodeCard>

                <List>
                    <ListItem>
                        Les template literals conservent les retours à la ligne sans avoir besoin de{" "}
                        <Code>{"\\n"}</Code>.
                    </ListItem>
                    <ListItem>Très utile pour créer du HTML dynamique.</ListItem>
                </List>

                <Heading level={3}>3. Utilisation avec le DOM</Heading>
                <CodeCard language="javascript">
                    {`// Créer du HTML dynamique
const utilisateur = {
    nom: "Dupont",
    prenom: "Marie",
    age: 30
};

const carte = \`
    <div class="user-card">
        <h2>\${utilisateur.prenom} \${utilisateur.nom}</h2>
        <p>Âge : \${utilisateur.age} ans</p>
    </div>
\`;

document.body.innerHTML += carte;

// Modifier le contenu d'un élément
const element = document.getElementById("message");
element.textContent = \`Bienvenue \${utilisateur.prenom} !\`;`}
                </CodeCard>

                <Text>
                    Les template literals sont particulièrement utiles pour générer du contenu HTML
                    dynamique de manière lisible et maintenable.
                </Text>
            </section>

            <section>
                <Heading level={2}>G- Afficher des messages</Heading>
                <Text>
                    La fonction <Code>console.log()</Code> permet d&apos;afficher des messages dans la
                    console du navigateur :
                </Text>
                <CodeCard language="javascript">
                    {`console.log("Bonjour, monde !");
console.log("Age :", age);
console.error("/!\\\\ Une erreur est survenue /!\\\\");
console.table(fruits);`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>H- Le DOM</Heading>
                <Text>
                    Le DOM (<em>Document Object Model</em>) est une interface de programmation qui permet
                    de manipuler dynamiquement le contenu, la structure et le style des pages web. Il
                    représente la page sous forme d&apos;un arbre d&apos;objets, où chaque élément HTML est
                    un objet auquel vous pouvez accéder et modifier en JavaScript. Avec le DOM, vous pouvez
                    interagir avec des éléments HTML, les modifier, les ajouter, ou même les supprimer.
                </Text>

                <Heading level={3}>1. Sélectionner des éléments</Heading>
                <Text>
                    Pour manipuler un élément dans le DOM, la première étape consiste à le sélectionner.
                    Voici les méthodes les plus courantes :
                </Text>
                <CodeCard language="javascript">
                    {`// Sélectionner un élément par son ID (unique)
const element = document.getElementById("monId");

// Sélectionner des éléments par leur classe (renvoie une HTMLCollection)
const elements = document.getElementsByClassName("maClasse");

// Sélectionner des éléments par leur nom de tag (renvoie une HTMLCollection)
const divs = document.getElementsByTagName("div");

// Sélectionner le premier élément correspondant à un sélecteur CSS
const firstElement = document.querySelector(".maClasse");

// Sélectionner tous les éléments correspondant à un sélecteur CSS (NodeList)
const allElements = document.querySelectorAll(".maClasse");`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong><Code>getElementById</Code></strong> : sélectionne un élément unique en
                        fonction de son ID. Les ID doivent être uniques dans une page HTML, donc cette
                        méthode ne retourne qu&apos;un seul élément.
                    </ListItem>
                    <ListItem>
                        <strong><Code>getElementsByClassName</Code></strong> : sélectionne tous les éléments
                        correspondant à une classe donnée. Renvoie une <Code>HTMLCollection</Code>, même si
                        un seul élément porte la classe.
                    </ListItem>
                    <ListItem>
                        <strong><Code>getElementsByTagName</Code></strong> : sélectionne tous les éléments
                        d&apos;un type spécifique (ex. <Code>&lt;div&gt;</Code>, <Code>&lt;p&gt;</Code>).
                    </ListItem>
                    <ListItem>
                        <strong><Code>querySelector</Code></strong> : sélectionne le premier élément
                        correspondant à un sélecteur CSS donné (id, classe, tag, etc.).
                    </ListItem>
                    <ListItem>
                        <strong><Code>querySelectorAll</Code></strong> : sélectionne tous les éléments
                        correspondant à un sélecteur CSS, renvoie une <Code>NodeList</Code>.
                    </ListItem>
                </List>
                <Text>
                    <strong>HTMLCollection vs NodeList</strong> — <Code>getElementsByClassName</Code> et{" "}
                    <Code>getElementsByTagName</Code> renvoient une <Code>HTMLCollection</Code>, qui ne
                    supporte pas <Code>forEach</Code>. Utilisez <Code>for...of</Code> ou accédez aux
                    éléments par leur index. <Code>querySelectorAll</Code> renvoie une{" "}
                    <Code>NodeList</Code> qui supporte <Code>forEach</Code>.
                </Text>
                <CodeCard language="javascript">
                    {`// getElementsByClassName → HTMLCollection (pas de forEach)
const items = document.getElementsByClassName("item");

// Accéder à un élément précis par son index
items[0].textContent = "Premier élément modifié";

// Itérer sur une HTMLCollection avec for...of
for (const item of items) {
    item.classList.add("highlight");
}

// querySelectorAll → NodeList (forEach disponible)
const allItems = document.querySelectorAll(".item");
allItems.forEach((item) => {
    item.classList.add("highlight");
});`}
                </CodeCard>

                <Heading level={3}>2. Manipuler des éléments</Heading>
                <Text>
                    Une fois un élément sélectionné, vous pouvez manipuler ses propriétés, son contenu ou
                    ses attributs pour modifier son apparence ou son comportement.
                </Text>
                <CodeCard language="javascript">
                    {`// Modifier le contenu textuel
element.textContent = "Nouveau contenu"; // Remplace le texte de l'élément

// Modifier un attribut
element.setAttribute("required", true);

// Récupérer la valeur d'un attribut
const valeur = element.getAttribute("required");

// Ajouter du style en ligne
element.style.color = "red";

// Remplacer tout le contenu par du HTML
element.innerHTML = "<strong>Ceci est du texte avec des balises HTML.</strong>";

// Modifier les classes CSS
element.classList.add("nouvelleClasse");
element.classList.remove("ancienneClasse");
element.classList.toggle("toggleClasse"); // Bascule ajout/suppression`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong><Code>textContent</Code></strong> : modifie le contenu textuel d&apos;un
                        élément. Remplace tout le contenu existant (y compris les balises HTML internes).
                    </ListItem>
                    <ListItem>
                        <strong><Code>setAttribute</Code></strong> : modifie un attribut de l&apos;élément.
                        Fonctionne avec tous les attributs HTML valides, y compris les attributs
                        personnalisés <Code>data-*</Code> qui permettent de stocker des données sur un
                        élément : <Code>{"element.setAttribute('data-id', '42')"}</Code>.
                    </ListItem>
                    <ListItem>
                        <strong><Code>getAttribute</Code></strong> : récupère la valeur d&apos;un attribut
                        de l&apos;élément.
                    </ListItem>
                    <ListItem>
                        <strong><Code>style</Code></strong> : ajoute ou modifie des styles en ligne. On
                        peut aussi modifier la taille de police, les marges, etc.
                    </ListItem>
                    <ListItem>
                        <strong><Code>innerHTML</Code></strong> : modifie tout le contenu HTML à
                        l&apos;intérieur de l&apos;élément, balises comprises. Sûr si le contenu est
                        statique (écrit dans votre code). Dangereux si le contenu vient de
                        l&apos;utilisateur : c&apos;est une faille XSS (<em>Cross-Site Scripting</em>),
                        où du code malveillant peut être injecté dans la page via la saisie.
                        Dans ce cas, utilisez <Code>textContent</Code> à la place.
                    </ListItem>
                    <ListItem>
                        <strong><Code>classList</Code></strong> : manipule les classes d&apos;un élément
                        de manière flexible. Vous pouvez ajouter (<Code>add</Code>), supprimer
                        (<Code>remove</Code>) ou basculer (<Code>toggle</Code>) une classe sans manipuler
                        directement l&apos;attribut <Code>class</Code>.
                    </ListItem>
                </List>
                <Text>
                    Pour les attributs <Code>data-*</Code>, l&apos;API <Code>dataset</Code> est plus
                    concise que <Code>setAttribute</Code>/<Code>getAttribute</Code>. Elle convertit
                    automatiquement le nom en camelCase : l&apos;attribut HTML{" "}
                    <Code>data-en-stock</Code> devient <Code>element.dataset.enStock</Code>.
                </Text>
                <CodeCard language="javascript">
                    {`const carte = document.getElementById("carte-produit");

// Via setAttribute / getAttribute (verbeux)
carte.setAttribute("data-prix", "29.99");
console.log(carte.getAttribute("data-prix")); // "29.99"

// Via dataset (plus lisible)
carte.dataset.prix = "29.99";
carte.dataset.enStock = "true";     // → attribut data-en-stock dans le HTML
console.log(carte.dataset.prix);    // "29.99"
console.log(carte.dataset.enStock); // "true"`}
                </CodeCard>
                <Text>
                    <Code>innerHTML</Code> est particulièrement utile pour injecter du HTML structuré,
                    comme des lignes de tableau générées depuis un tableau de données :
                </Text>
                <CodeCard language="javascript">
                    {`const tbody = document.getElementById("liste");

const utilisateurs = [
    { prenom: "Alice", age: 25 },
    { prenom: "Bob",   age: 17 }
];

utilisateurs.forEach((utilisateur) => {
    tbody.innerHTML += \`
        <tr>
            <td>\${utilisateur.prenom}</td>
            <td>\${utilisateur.age} ans</td>
        </tr>
    \`;
});`}
                </CodeCard>

                <Heading level={3}>3. Ajouter ou supprimer des éléments</Heading>
                <Text>
                    Vous pouvez aussi ajouter ou supprimer des éléments dans le DOM grâce à des méthodes
                    dédiées. Ces actions sont très courantes lors de l&apos;ajout dynamique de contenu ou
                    de la gestion d&apos;interactions utilisateur.
                </Text>
                <CodeCard language="javascript">
                    {`// Ajouter un nouvel élément à la fin du body
const newElement = document.createElement("p");
newElement.textContent = "Ceci est un paragraphe.";
document.body.appendChild(newElement);

// Ajouter un élément au début du body
const anotherElement = document.createElement("p");
anotherElement.textContent = "Ceci est un paragraphe au début.";
document.body.prepend(anotherElement);

// Ajouter un élément avant un autre élément
const referenceElement = document.getElementById("someId");
const newElementBefore = document.createElement("p");
newElementBefore.textContent = "Ceci est un paragraphe avant un autre élément.";
document.body.insertBefore(newElementBefore, referenceElement);

// Supprimer un élément existant
element.remove();`}
                </CodeCard>

                <List>
                    <ListItem>
                        <strong><Code>createElement</Code></strong> : crée un nouvel élément HTML. Ce
                        nouvel élément doit ensuite être ajouté à la page via <Code>appendChild</Code>,{" "}
                        <Code>prepend</Code>, ou des méthodes similaires.
                    </ListItem>
                    <ListItem>
                        <strong><Code>appendChild</Code></strong> : ajoute un élément enfant à la fin
                        d&apos;un autre élément.
                    </ListItem>
                    <ListItem>
                        <strong><Code>prepend</Code></strong> : ajoute un élément <strong>au début</strong>{" "}
                        d&apos;un autre élément.
                    </ListItem>
                    <ListItem>
                        <strong><Code>insertBefore</Code></strong> : insère un élément avant un autre
                        élément spécifique. Permet de contrôler précisément où un élément est inséré dans
                        le DOM.
                    </ListItem>
                    <ListItem>
                        <strong><Code>remove</Code></strong> : supprime un élément du DOM. Il
                        n&apos;apparaîtra plus dans le navigateur.
                    </ListItem>
                </List>
                <Text>
                    Pour construire du HTML complexe avec <Code>createElement</Code>, créez chaque
                    élément séparément et assemblez-les du plus profond vers le plus haut — enfant
                    d&apos;abord, parent ensuite. Exemple avec une liste de définitions{" "}
                    <Code>&lt;dl&gt;</Code> :
                </Text>
                <CodeCard language="javascript">
                    {`const glossaire = document.getElementById("glossaire");

const termes = [
    { mot: "DOM",  definition: "Représentation en arbre d'une page HTML." },
    { mot: "CSS",  definition: "Langage de mise en forme des pages web." },
    { mot: "HTML", definition: "Langage de structuration du contenu web." }
];

termes.forEach((terme) => {
    // 1. Créer le groupe (div englobe dt + dd)
    const groupe = document.createElement("div");

    // 2. Créer le terme et sa définition
    const dt = document.createElement("dt");
    dt.textContent = terme.mot;

    const dd = document.createElement("dd");
    dd.textContent = terme.definition;

    // 3. Assembler du plus profond vers le plus haut
    groupe.appendChild(dt);        // terme → groupe
    groupe.appendChild(dd);        // définition → groupe
    glossaire.appendChild(groupe); // groupe → liste
});`}
                </CodeCard>
            </section>
        </article>
    );
}
