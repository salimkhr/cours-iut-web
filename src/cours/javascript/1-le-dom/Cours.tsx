import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text"
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";

export default function Cours() {
    return (
        <article>
            <section>
                <Text>
                JavaScript est un langage de programmation utilisé pour rendre les pages
                web interactives. C&apos;est l&apos;un des trois piliers du développement web :
            </Text>
            <List>
                <ListItem><strong>HTML</strong> : structure du contenu</ListItem>
                <ListItem><strong>CSS</strong> : mise en forme</ListItem>
                <ListItem><strong>JavaScript</strong> : interactions et logique</ListItem>
            </List>

            </section>

            <section>
<Heading level={2}>A- Introduction au JavaScript</Heading>

            <Heading level={3}>1. Inclure JavaScript dans un fichier HTML</Heading>

            <Text>
                Vous pouvez ajouter du JavaScript directement dans une page HTML avec la
                balise <Code>{`<script>`}</Code> ou bien dans un fichier séparé pour une meilleure organisation :
            </Text>
            <CodeCard language="html">
                {`<!DOCTYPE html>
<html lang="en">
    <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Introduction au JavaScript</title>
    </head>
    <body>
          <h1>Ma première page JavaScript</h1>
          
           <!-- Ajouter JavaScript directement -->
          <script>
            console.log("Bonjour depuis le script intégré !");
          </script>
        
          <!-- Lien vers un fichier JS -->
          <script src="script.js"></script>
    </body>
</html>`}
            </CodeCard>

            </section>

            <section>
<Heading level={2}>B- Les variables et types de données</Heading>

            <Heading level={3}>1. Les variables en JavaScript</Heading>

            <Text>
                On utilise principalement trois mots-clés pour les déclarer : <Code>const</Code>, <Code>let</Code>, et <Code>var</Code>.
            </Text>

            <List>
                <ListItem>
                    <strong><Code>const</Code></strong> est utilisé pour déclarer des valeurs constantes, mais cela ne
                    signifie pas que les propriétés d&apos;un objet ou d&apos;un tableau déclaré avec <Code>const</Code> ne
                    peuvent
                    pas être modifiées. Seule la référence est immuable.
                </ListItem>

                <ListItem>
                    <strong><Code>let</Code></strong> est utilisé pour les variables dont la valeur peut changer au cours de
                    l&apos;exécution du programme.
                </ListItem>
                <ListItem>
                    <strong><Code>var</Code></strong> similaire à <Code>let</Code> mais ayant un comportement global ou de fonction. On ne l&apos;utilise plus.
                </ListItem>
            </List>

            <CodeCard language="javascript">
                {`// const : valeur constante
const pi = 3.14;
console.log(pi); // 3.14

// Exemple de modification d'un tableau avec const
const arr = [1, 2, 3];
arr.push(4); // Ok, modification du contenu
console.log(arr); // [1, 2, 3, 4]

// let : une variable modifiable
let age = 25;
age = 26; // Ok
console.log(age); // 26

// var : ancien mot-clé, à ne plus utiliser, peut avoir des fonctionnements étranges
var name = "Alice";
name = "Bob"; // Ok
console.log(name); // Bob`}
            </CodeCard>

            <Heading level={3}>2. Types de données</Heading>
            <Text>
                En JavaScript, les variables ne nécessitent pas de type explicite. Cela signifie que vous pouvez stocker
                n&apos;importe quel type de données dans une même variable, et JavaScript déterminera le type
                automatiquement
                à l&apos;exécution.
            </Text>

            <CodeCard language="javascript">
                {`// Chaîne de caractères
const message = "Bonjour !"; // type: string

// Nombre
const age = 30; // type: number

// Booléen
const isStudent = true; // type: boolean

// Tableau
const fruits = ["pomme", "banane", "cerise"]; // type: array

// Objet
const personne = {
  nom: "Alice", // type: string
  age: 25 // type: number
};`}
            </CodeCard>

            </section>

            <section>
<Heading level={2}>C- Opérateurs et conditions</Heading>

            <Heading level={3}>1. Opérateurs de comparaison</Heading>
            <Text>
                Les opérateurs de comparaison permettent de comparer deux valeurs et retournent un booléen
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
                <ListItem><strong><Code>===</Code></strong> : Égalité stricte (valeur ET type doivent être identiques). À privilégier.</ListItem>
                <ListItem><strong><Code>!==</Code></strong> : Inégalité stricte (valeur OU type différents).</ListItem>
                <ListItem><strong><Code>&gt;</Code>, <Code>&lt;</Code>, <Code>&gt;=</Code>, <Code>&lt;=</Code></strong> : Comparaisons numériques classiques.</ListItem>
            </List>

            <Heading level={3}>2. Opérateurs logiques</Heading>
            <Text>
                Les opérateurs logiques permettent de combiner plusieurs conditions.
            </Text>

            <CodeCard language="javascript">
                {`const age = 20;
const hasPermission = true;

// ET logique (&&) - les deux conditions doivent être vraies
console.log(age >= 18 && hasPermission);  // true

// OU logique (||) - au moins une condition doit être vraie
console.log(age < 18 || hasPermission);   // true

// NON logique (!) - inverse la valeur booléenne
console.log(!hasPermission);              // false`}
            </CodeCard>

            <List>
                <ListItem><strong><Code>&&</Code></strong> : Retourne <Code>true</Code> si les deux conditions sont vraies.</ListItem>
                <ListItem><strong><Code>||</Code></strong> : Retourne <Code>true</Code> si au moins une condition est vraie.</ListItem>
                <ListItem><strong><Code>!</Code></strong> : Inverse la valeur booléenne.</ListItem>
            </List>

            <Heading level={3}>3. Structures conditionnelles</Heading>

            <Text>
                Les structures conditionnelles permettent d’exécuter du code
                <strong> uniquement si une condition est remplie</strong>.
                Elles sont indispensables pour prendre des décisions dans un programme.
            </Text>

            {/* IF SIMPLE */}
            <Heading level={4}>Le if simple</Heading>
            <Text>
                La structure <Code>if</Code> permet d’exécuter un bloc de code
                si la condition est vraie.
            </Text>

            <CodeCard language="javascript">
                {`const age = 20;

if (age >= 18) {
  console.log("Vous êtes majeur");
}`}
            </CodeCard>

            {/* IF / ELSE */}
            <Heading level={4}>if / else</Heading>
            <Text>
                La structure <Code>if...else</Code> permet de gérer deux cas :
                une condition vraie et une condition fausse.
            </Text>

            <CodeCard language="javascript">
                {`const temperature = 15;

if (temperature > 25) {
  console.log("Il fait chaud");
} else {
  console.log("Il fait frais");
}`}
            </CodeCard>

            {/* SWITCH */}
            <Heading level={4}>switch</Heading>
            <Text>
                Le <Code>switch</Code> est utilisé lorsque l’on compare
                <strong> une même valeur à plusieurs cas possibles</strong>.
                Il est souvent plus lisible qu’une succession de <Code>if...else if</Code>.
            </Text>

            <CodeCard language="javascript">
                {`const day = 3;

switch (day) {
  case 1:
    console.log("Lundi");
    break;
  case 2:
    console.log("Mardi");
    break;
  case 3:
    console.log("Mercredi");
    break;
  case 4:
    console.log("Jeudi");
    break;
  case 5:
    console.log("Vendredi");
    break;
  case 6:
    console.log("Samedi");
    break;
  case 7:
    console.log("Dimanche");
    break;
  default:
    console.log("Jour invalide");
}`}
            </CodeCard>

            {/* TERNAIRE */}
            <Heading level={4}>4 Opérateur ternaire</Heading>
            <Text>
                L’opérateur ternaire est une forme condensée de <Code>if...else</Code>,
                utilisée pour des conditions simples.
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
                Les tableaux sont des structures de données fondamentales en JavaScript.
                Ils permettent de stocker plusieurs valeurs et offrent de nombreuses méthodes
                pour parcourir, transformer et analyser leurs données.
            </Text>

            {/* PARCOURS CLASSIQUES */}
            <Heading level={3}>D.1 Parcourir un tableau</Heading>

            <Text>
                JavaScript propose plusieurs façons de parcourir un tableau.
                Le choix dépend du type de traitement que vous souhaitez effectuer.
            </Text>

            <Heading level={4}>Boucle <Code>for</Code> classique</Heading>
            <Text>
                La boucle <Code>for</Code> permet de parcourir un tableau à l’aide de son index.
                Elle est utile lorsque l’on a besoin de contrôler précisément la boucle.
            </Text>

            <CodeCard language="javascript">
                {`const fruits = ["pomme", "banane", "cerise"];

for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}`}
            </CodeCard>

            <Heading level={4}>Méthode <Code>forEach</Code></Heading>
            <Text>
                <Code>forEach</Code> exécute une fonction pour chaque élément du tableau.
                Elle est idéale lorsque l’on souhaite simplement effectuer une action sur chaque valeur.
            </Text>

            <CodeCard language="javascript">
                {`const fruits = ["pomme", "banane", "cerise"];

fruits.forEach((fruit) => {
  console.log(fruit); //pomme banane cerise
});`}
            </CodeCard>

            <Heading level={4}>Boucle <Code>for...of</Code></Heading>
            <Text>
                <Code>for...of</Code> permet de parcourir directement les valeurs d’un tableau,
                sans passer par les indices.
            </Text>

            <CodeCard language="javascript">
                {`const fruits = ["pomme", "banane", "cerise"];

for (let fruit of fruits) {
  console.log(fruit); //pomme banane cerise
}`}
            </CodeCard>

            {/* TRANSFORMATIONS */}
            <Heading level={3}>D.2 Transformer un tableau avec <Code>map</Code></Heading>

            <Text>
                La méthode <Code>map</Code> permet de <strong>transformer chaque élément</strong>
                d’un tableau et de retourner un <strong>nouveau tableau</strong>.
                Le tableau original n’est jamais modifié.
            </Text>

            <Text>
                <Code>map</Code> est particulièrement utile lorsque vous souhaitez convertir
                des données, reformater des valeurs ou extraire certaines informations.
            </Text>

            <CodeCard language="javascript">
                {`const prices = [10, 20, 30];

// Ajouter une TVA de 20 % à chaque prix
const pricesWithTax = prices.map((price) => {
  return price * 1.2;
});

console.log(pricesWithTax); // [12, 24, 36]`}
            </CodeCard>

            <Text>
                Exemple avec un tableau d’objets :
            </Text>

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

            {/* FILTRAGE */}
            <Heading level={3}>D.3 Filtrer un tableau avec <Code>filter</Code></Heading>

            <Text>
                La méthode <Code>filter</Code> permet de créer un nouveau tableau
                contenant uniquement les éléments qui respectent une condition.
            </Text>

            <Text>
                Chaque élément est testé, et seuls ceux pour lesquels la condition est vraie
                sont conservés.
            </Text>

            <CodeCard language="javascript">
                {`const ages = [12, 18, 25, 30, 15];

// Conserver uniquement les majeurs
const adults = ages.filter((age) => age >= 18);

console.log(adults); // [18, 25, 30]`}
            </CodeCard>

            <Text>
                Exemple avec des objets :
            </Text>

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

            {/* RÉDUCTION */}
            <Heading level={3}>D.4 Réduire un tableau avec <Code>reduce</Code></Heading>

            <Text>
                La méthode <Code>reduce</Code> permet de <strong>combiner toutes les valeurs</strong>
                d’un tableau en une seule (nombre, chaîne, objet, tableau, etc.).
            </Text>

            <Text>
                Elle fonctionne à l’aide d’un accumulateur qui évolue à chaque itération.
            </Text>

            <CodeCard language="javascript">
                {`const numbers = [1, 2, 3, 4, 5];

// Calculer la somme des nombres
const sum = numbers.reduce((accumulator, current) => {
  return accumulator + current;
}, 0);

console.log(sum); // 15`}
            </CodeCard>

            <Text>
                Exemple plus avancé avec des objets :
            </Text>

            <CodeCard language="javascript">
                {`const cart = [
  { name: "Laptop", price: 1000, quantity: 1 },
  { name: "Mouse", price: 25, quantity: 2 }
];

// Calculer le total du panier
const total = cart.reduce((acc, product) => {
  return acc + product.price * product.quantity;
}, 0);

console.log(total); // 1050`}
            </CodeCard>

            {/* CHAÎNAGE */}
            <Heading level={3}>D.5 Chaînage des méthodes</Heading>

            <Text>
                Les méthodes <Code>map</Code>, <Code>filter</Code> et <Code>reduce</Code>
                peuvent être enchaînées pour effectuer des traitements complexes
                de manière lisible et expressive.
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

direBonjour(); // Appel de la fonction -> affiche "Bonjour !"

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
                <ListItem><strong>Paramètres</strong> : Variables que la fonction reçoit lors de son appel.</ListItem>
                <ListItem><strong><Code>return</Code></strong> : Renvoie une valeur et termine l&apos;exécution de la fonction.</ListItem>
                <ListItem>Une fonction sans <Code>return</Code> renvoie <Code>undefined</Code> par défaut.</ListItem>
            </List>

            <Heading level={3}>2. Fonctions fléchées (Arrow functions)</Heading>

            <Text>
                Les fonctions fléchées sont une syntaxe plus concise introduite en ES6. Elles sont particulièrement
                utiles pour les fonctions courtes.
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
                <ListItem>Si la fonction ne contient qu&apos;une seule expression, les accolades et <Code>return</Code> sont optionnels.</ListItem>
                <ListItem>Les parenthèses autour du paramètre sont optionnelles s&apos;il n&apos;y en a qu&apos;un seul.</ListItem>
                <ListItem>Les fonctions fléchées sont souvent utilisées avec les méthodes de tableaux comme <Code>forEach</Code>, <Code>map</Code>, <Code>filter</Code>.</ListItem>
            </List>

            <Heading level={3}>3. Portée des variables (scope)</Heading>

            <Text>
                La portée détermine où une variable est accessible dans le code.
            </Text>

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
  console.log(resultat); // 15
}

calculer();
// console.log(resultat); // Erreur ! resultat n'existe pas ici

// Paramètres = variables locales
function multiplier(a, b) {
  return a * b;
}
// console.log(a); // Erreur ! a n'existe que dans la fonction`}
            </CodeCard>

            <List>
                <ListItem><strong>Variables globales</strong> : Déclarées en dehors de toute fonction, accessibles partout.</ListItem>
                <ListItem><strong>Variables locales</strong> : Déclarées dans une fonction, accessibles uniquement à l&apos;intérieur.</ListItem>
                <ListItem>Les paramètres de fonction sont des variables locales.</ListItem>
            </List>

            </section>

            <section>
<Heading level={2}>F- Template literals (chaînes de caractères)</Heading>

            <Text>
                Les template literals (ou littéraux de gabarit) permettent de créer des chaînes de caractères
                de manière plus lisible et flexible en utilisant les backticks (<Code>`</Code>).
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
                <ListItem>Utilisez les backticks (<Code>`</Code>) au lieu des guillemets simples ou doubles.</ListItem>
                <ListItem><Code>${'${expression}'}</Code> permet d&apos;insérer une variable ou une expression JavaScript.</ListItem>
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
                <ListItem>Les template literals conservent les retours à la ligne sans avoir besoin de <Code>\n</Code>.</ListItem>
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
    <p>Age: \${utilisateur.age} ans</p>
  </div>
\`;

document.body.innerHTML += carte;

// Modifier le contenu d'un élément
const element = document.getElementById("message");
element.textContent = \`Bienvenue \${utilisateur.prenom} !\`;`}
            </CodeCard>

            <Text>
                Les template literals sont particulièrement utiles pour générer du contenu HTML dynamique
                de manière lisible et maintenable.
            </Text>

            </section>

            <section>
<Heading level={2}>G- Afficher des messages</Heading>

            <Text>
                La fonction <code>console.log()</code> permet d&apos;afficher des messages dans la console du
                navigateur :
            </Text>

            <CodeCard language="javascript">
                {`console.log("Bonjour, monde !");
console.log("Age :", age);
console.error("/!\\\\ Une erreur est survenue /!\\\\");
console.table(fruits)`}
            </CodeCard>

            </section>

            <section>
<Heading level={2}>H- Le DOM</Heading>

            <Text>
                Le DOM (Document Object Model) est une interface de programmation qui permet de manipuler dynamiquement
                le contenu, la structure et le style des pages web. Il représente la page web sous forme d&apos;un arbre
                d&apos;objets, où chaque élément HTML est un objet auquel vous pouvez accéder et modifier en JavaScript.
                Avec le DOM, vous pouvez interagir avec des éléments HTML, les modifier, les ajouter, ou même les
                supprimer.
            </Text>

            <Heading level={3}>1. Sélectionner des éléments</Heading>

            <Text>
                Pour manipuler un élément dans le DOM, la première étape consiste à le sélectionner. Voici les méthodes
                les plus courantes pour sélectionner des éléments dans une page HTML :
            </Text>

            <CodeCard language="javascript">
                {`// Sélectionner un élément par son ID (unique)
const element = document.getElementById("monId");

// Sélectionner des éléments par leur classe (renvoie une liste de nœuds)
const elements = document.getElementsByClassName("maClasse");

// Sélectionner des éléments par leur nom de tag (renvoie une liste de nœuds)
const divs = document.getElementsByTagName("div");

// Sélectionner le premier élément correspondant à un sélecteur CSS
const firstElement = document.querySelector(".maClasse");

// Sélectionner tous les éléments correspondant à un sélecteur CSS
const allElements = document.querySelectorAll(".maClasse");`}
            </CodeCard>

            <List>
                <ListItem><strong><Code>getElementById</Code></strong> : Sélectionne un élément unique en fonction de
                    son ID. Les ID doivent être uniques dans une page HTML, donc cette méthode ne retourne qu&apos;un
                    seul
                    élément.</ListItem>
                <ListItem><strong><Code>getElementsByClassName</Code></strong> : Sélectionne tous les éléments
                    correspondant à une classe donnée. Cette méthode renvoie un &quot;HTMLCollection&quot;, qui est une
                    liste
                    d&apos;éléments (même si la classe n&apos;est associée qu&apos;à un seul élément).</ListItem>
                <ListItem><strong><Code>getElementsByTagName</Code></strong> : Sélectionne tous les éléments d&apos;un
                    type
                    spécifique, comme tous les <Code>&lt;div&gt;</Code>, <Code>&lt;p&gt;</Code>, etc.</ListItem>
                <ListItem><strong><Code>querySelector</Code></strong> : Sélectionne le premier élément correspondant à
                    un sélecteur CSS donné (id, classe, tag, etc.).</ListItem>
                <ListItem><strong><Code>querySelectorAll</Code></strong> : Sélectionne tous les éléments correspondant
                    à
                    un sélecteur CSS, renvoyant une &quot;NodeList&quot;.</ListItem>
            </List>

            <Heading level={3}>2. Manipuler des éléments</Heading>

            <Text>
                Une fois un élément sélectionné, vous pouvez manipuler ses propriétés, son contenu ou ses
                attributs pour modifier son apparence ou son comportement.
            </Text>

            <CodeCard language="javascript">
                {`// Modifier le contenu textuel
element.textContent = "Nouveau contenu"; // Remplace le texte de l'élément

// Modifier un attribut (par exemple, une classe CSS)
element.setAttribute("required", true); // Ajoute l'attribut 'required' et le définit à true

// Récupérer la valeur d'un attribut
const valeur = element.getAttribute("required"); // Récupère la valeur de l'attribut 'required'

// Ajouter du style en ligne
element.style.color = "red"; // Applique une couleur rouge au texte de l'élément

// Remplace tout le contenu de l'élément par HTML
element.innerHTML = "<strong>Ceci est du texte avec des balises HTML.</strong>"

// Modifier la classe de l'élément
element.classList.add("nouvelleClasse"); // Ajoute une nouvelle classe à l'élément
element.classList.remove("ancienneClasse"); // Supprime une classe de l'élément
element.classList.toggle("toggleClasse"); // Bascule entre l'ajout et la suppression de la classe
`}
            </CodeCard>

            <List>
                <ListItem><strong><Code>textContent</Code></strong> : Permet de modifier le contenu textuel d&apos;un
                    élément. Attention, cela remplace tout le contenu existant (y compris les balises HTML à
                    l&apos;intérieur).</ListItem>
                <ListItem><strong><Code>setAttribute</Code></strong> : Permet de modifier un attribut de
                    l&apos;élément.
                    Dans
                    cet exemple, on modifie l&apos;attribut `required` pour rendre obligatoire la saisie dans
                    l&apos;input.</ListItem>
                <ListItem><strong><Code>getAttribute</Code></strong> : Permet de récupérer la valeur d&apos;un attribut de l&apos;élément.</ListItem>
                <ListItem><strong><Code>style</Code></strong> : Permet d&apos;ajouter ou de modifier des styles en
                    ligne.
                    Ici, on change la couleur du texte de l&apos;élément, mais il est possible d&apos;ajouter
                    d&apos;autres styles
                    comme la taille de police, les marges, etc.</ListItem>
                <ListItem><strong><Code>innerHTML</Code></strong> : Modifie tout le contenu HTML à l&apos;intérieur de
                    l&apos;élément, y compris les balises HTML. Très utile, mais à utiliser avec précaution pour éviter
                    des
                    vulnérabilités de sécurité. Préférez <Code>textContent</Code> pour du texte simple.</ListItem>
                <ListItem><strong><Code>classList</Code></strong> : Permet de manipuler les classes d&apos;un élément
                    de
                    manière plus flexible. Vous pouvez ajouter (<Code>add</Code>), supprimer (<Code>remove</Code>), ou
                    basculer (<Code>toggle</Code>) une classe CSS de manière dynamique sans avoir à manipuler
                    directement l&apos;attribut <Code>class</Code>.</ListItem>
            </List>


            <Heading level={3}>3. Ajouter ou supprimer des éléments</Heading>

            <Text>
                Vous pouvez également ajouter ou supprimer des éléments dans le DOM en utilisant des méthodes dédiées.
                Ces actions sont très courantes lors de l&apos;ajout dynamique de contenu ou de la gestion
                d&apos;interactions
                utilisateur.
            </Text>

            <CodeCard language="javascript">
                {`// Ajouter un nouvel élément dans le DOM
const newElement = document.createElement("p"); // Crée un nouvel élément <p>
newElement.textContent = "Ceci est un paragraphe."; // Ajoute du texte à cet élément
document.body.appendChild(newElement); // Ajoute cet élément à la fin du body de la page

// Ajouter un élément au début du DOM
const anotherElement = document.createElement("p");
anotherElement.textContent = "Ceci est un paragraphe au début.";
document.body.prepend(anotherElement); // Ajoute cet élément au début du body

// Ajouter un élément avant un autre élément
const referenceElement = document.getElementById("someId"); // Sélectionner un élément existant
const newElementBefore = document.createElement("p");
newElementBefore.textContent = "Ceci est un paragraphe avant un autre élément.";
document.body.insertBefore(newElementBefore, referenceElement); // Ajoute avant le référencé

// Supprimer un élément existant
element.remove(); // Supprime l'élément sélectionné du DOM`}
            </CodeCard>

            <List>
                <ListItem><strong><Code>createElement</Code></strong> : Crée un nouvel élément HTML. Dans cet exemple,
                    on crée un élément <Code>&lt;p&gt;</Code>. Ce nouvel élément doit ensuite être ajouté à la page à
                    l&apos;aide
                    de <Code>appendChild</Code>, <Code>prepend</Code>, ou d&apos;autres méthodes similaires.</ListItem>
                <ListItem><strong><Code>appendChild</Code></strong> : Ajoute un élément enfant à un autre élément. Ici,
                    l&apos;élément <Code>&lt;p&gt;</Code> est ajouté à la fin du <Code>&lt;body&gt;</Code>.</ListItem>
                <ListItem><strong><Code>prepend</Code></strong> : Ajoute un élément **au début** d&apos;un autre
                    élément.
                    Dans cet exemple, l&apos;élément <Code>&lt;p&gt;</Code> est ajouté au début
                    du <Code>&lt;body&gt;</Code>.</ListItem>
                <ListItem><strong><Code>insertBefore</Code></strong> : Insère un élément avant un autre élément
                    spécifique. Cela vous permet de contrôler précisément où un élément est inséré dans la structure
                    DOM.</ListItem>
                <ListItem><strong><Code>remove</Code></strong> : Supprime un élément du DOM. Cette méthode supprime
                    l&apos;élément de la page, ce qui signifie qu&apos;il n&apos;apparaîtra plus dans l&apos;affichage
                    du
                    navigateur.</ListItem>
            </List>
            </section>
        </article>
    );
}