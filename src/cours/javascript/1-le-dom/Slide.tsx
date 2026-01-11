'use client';
import {SlidesScreen} from "@/components/Slides/SlidesScreen";
import React from 'react';
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";

export default function Slide() {
  const mockModule = {
    title: "JavaScript",
    path: "javascript",
    iconName: "Braces",
    description: "Apprendre les bases de JavaScript pour le web interactif",
    sections: [],
    associatedSae: []
  } as any;

  const mockSection = {
    title: "Le DOM en JavaScript",
    description: "Comprendre et manipuler le Document Object Model pour dynamiser vos pages web.",
    tags: ["DOM", "Events", "Selectors", "Manipulation"],
  } as any;

  return (
    <div className="w-full py-10">
      <SlidesScreen module={mockModule} section={mockSection}>
        {/* Introduction */}
        <SlideScreen title="JavaScript - Introduction">
          <SlideNote>
            {`-Bienvenue dans le cours JavaScript !
              - Rappeler que JS est indispensable aujourd'hui.
              - Expliquer la différence entre structure (HTML), style (CSS) et comportement (JS).`}
          </SlideNote>
          <SlideText>
            JavaScript est un langage de programmation utilisé pour rendre les pages web interactives. C'est l'un des trois piliers du développement web :
          </SlideText>
          <SlideList>
            <SlideListItem>HTML : structure du contenu</SlideListItem>
            <SlideListItem>CSS : mise en forme</SlideListItem>
            <SlideListItem>JavaScript : interactions et logique</SlideListItem>
          </SlideList>
        </SlideScreen>

        {/* A - Introduction au JavaScript */}
        <SlideScreen title="A - Inclure JavaScript dans HTML">
          <SlideText>
            Deux méthodes pour inclure du JavaScript :
          </SlideText>
          <SlideList>
            <SlideListItem>Directement dans la page HTML avec la balise &lt;script&gt;</SlideListItem>
            <SlideListItem>Dans un fichier séparé (meilleure organisation)</SlideListItem>
          </SlideList>
          <SlideCode language="html">
            {`<!-- JavaScript intégré -->
<script>
  console.log("Bonjour depuis le script intégré !");
</script>

<!-- Fichier externe -->
<script src="script.js"></script>`}
          </SlideCode>
        </SlideScreen>

        {/* B - Variables et types */}
        <SlideScreen title="B.1 - Les variables en JavaScript">
          <SlideNote>
            - Expliquer que `const` est la règle par défaut.
            - `let` seulement si on change la valeur.
            - Mentionner que `var` pose des problèmes de portée (scope) et de remontée (hoisting).
          </SlideNote>
          <SlideText>
            Trois mots-clés pour déclarer des variables :
          </SlideText>
          <SlideList>
            <SlideListItem>const : valeur constante (référence immuable)</SlideListItem>
            <SlideListItem>let : variable modifiable</SlideListItem>
            <SlideListItem>var : ancien mot-clé (à ne plus utiliser)</SlideListItem>
          </SlideList>
          <SlideCode language="javascript">
            {`const pi = 3.14;
let age = 25;
age = 26; // OK

const arr = [1, 2, 3];
arr.push(4); // OK - modification du contenu`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="B.2 - Types de données">
          <SlideText>
            JavaScript détermine automatiquement le type à l'exécution :
          </SlideText>
          <SlideCode language="javascript" highlight="1-2 | 4-5 | 7-8 | 10-11 | 13-16">
            {`// Chaîne de caractères
const message = "Bonjour !";

// Nombre
const age = 30;

// Booléen
const isStudent = true;

// Tableau
const fruits = ["pomme", "banane", "cerise"];

// Objet
const personne = {
  nom: "Alice",
  age: 25
};`}
          </SlideCode>
        </SlideScreen>

        {/* C - Opérateurs et conditions */}
        <SlideScreen title="C.1 - Opérateurs de comparaison">
          <SlideText>
            Les opérateurs retournent true ou false :
          </SlideText>
          <SlideList>
            <SlideListItem>=== : Égalité stricte (valeur ET type)</SlideListItem>
            <SlideListItem>!== : Inégalité stricte</SlideListItem>
            <SlideListItem>&gt;, &lt;, &gt;=, &lt;= : Comparaisons numériques</SlideListItem>
          </SlideList>
          <SlideCode language="javascript">
            {`console.log(5 === 5);        // true
console.log(5 === "5");      // false
console.log(10 > 5);         // true
console.log(10 >= 10);       // true`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="C.2 - Opérateurs logiques">
          <SlideText>
            Combiner plusieurs conditions :
          </SlideText>
          <SlideList>
            <SlideListItem>&& (ET) : les deux conditions doivent être vraies</SlideListItem>
            <SlideListItem>|| (OU) : au moins une condition doit être vraie</SlideListItem>
            <SlideListItem>! (NON) : inverse la valeur booléenne</SlideListItem>
          </SlideList>
          <SlideCode language="javascript">
            {`const age = 20;
const hasPermission = true;

console.log(age >= 18 && hasPermission);  // true
console.log(age < 18 || hasPermission);   // true
console.log(!hasPermission);              // false`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="C.3 - Structure if / else">
          <SlideText>
            Exécuter du code selon une condition :
          </SlideText>
          <SlideCode language="javascript">
            {`const age = 20;

// if simple
if (age >= 18) {
  console.log("Vous êtes majeur");
}

// if / else
const temperature = 15;
if (temperature > 25) {
  console.log("Il fait chaud");
} else {
  console.log("Il fait frais");
}`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="C.3 - Structure switch">
          <SlideText>
            Comparer une même valeur à plusieurs cas :
          </SlideText>
          <SlideCode language="javascript">
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
  default:
    console.log("Jour invalide");
}`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="C.4 - Opérateur ternaire">
          <SlideText>
            Forme condensée de if...else pour conditions simples :
          </SlideText>
          <SlideCode language="javascript">
            {`const age = 20;
const statut = age >= 18 ? "majeur" : "mineur";

console.log(statut); // "majeur"`}
          </SlideCode>
        </SlideScreen>

        {/* D - Tableaux */}
        <SlideScreen title="D.1 - Parcourir un tableau">
          <SlideText>
            Trois méthodes principales :
          </SlideText>
          <SlideCode language="javascript" highlight="1 | 3-6 | 8-11 | 13-16">
            {`const fruits = ["pomme", "banane", "cerise"];

// Boucle for classique
for (let i = 0; i < fruits.length; i++) {
  console.log(fruits[i]);
}

// forEach
fruits.forEach((fruit) => {
  console.log(fruit);
});

// for...of
for (let fruit of fruits) {
  console.log(fruit);
}`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="D.2 - Transformer avec map">
          <SlideText>
            Transformer chaque élément et créer un nouveau tableau :
          </SlideText>
          <SlideCode language="javascript" highlight="1-8 | 10-16">
            {`const prices = [10, 20, 30];

// Ajouter 20% de TVA
const pricesWithTax = prices.map((price) => {
  return price * 1.2;
});

console.log(pricesWithTax); // [12, 24, 36]

// Extraire les noms
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 }
];
const names = users.map((user) => user.name);
// ["Alice", "Bob"]`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="D.3 - Filtrer avec filter">
          <SlideText>
            Créer un nouveau tableau avec les éléments respectant une condition :
          </SlideText>
          <SlideCode language="javascript" highlight="1-6 | 8-14">
            {`const ages = [12, 18, 25, 30, 15];

// Conserver uniquement les majeurs
const adults = ages.filter((age) => age >= 18);

console.log(adults); // [18, 25, 30]

// Filtrer des objets
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 30 }
];
const adultUsers = users.filter((user) => user.age >= 18);`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="D.4 - Réduire avec reduce">
          <SlideText>
            Combiner toutes les valeurs en une seule :
          </SlideText>
          <SlideCode language="javascript" highlight="1-8 | 10-18">
            {`const numbers = [1, 2, 3, 4, 5];

// Calculer la somme
const sum = numbers.reduce((accumulator, current) => {
  return accumulator + current;
}, 0);

console.log(sum); // 15

// Calculer un total de panier
const cart = [
  { name: "Laptop", price: 1000, quantity: 1 },
  { name: "Mouse", price: 25, quantity: 2 }
];
const total = cart.reduce((acc, product) => {
  return acc + product.price * product.quantity;
}, 0);
console.log(total); // 1050`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="D.5 - Chaînage des méthodes">
          <SlideText>
            Combiner map, filter et reduce pour des traitements complexes :
          </SlideText>
          <SlideCode language="javascript" highlight="1-5 | 7-13">
            {`const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 },
  { name: "Charlie", age: 30 }
];

// Calculer la somme des âges des majeurs
const totalAge = users
  .filter((user) => user.age >= 18)  // Garder les majeurs
  .map((user) => user.age)           // Extraire les âges
  .reduce((acc, age) => acc + age, 0); // Sommer

console.log(totalAge); // 55`}
          </SlideCode>
        </SlideScreen>

        {/* E - Fonctions */}
        <SlideScreen title="E.1 - Déclaration de fonction">
          <SlideText>
            Créer des blocs de code réutilisables :
          </SlideText>
          <SlideCode language="javascript" highlight="1-5 | 7-11 | 13-17">
            {`// Fonction sans paramètre
function direBonjour() {
  console.log("Bonjour !");
}
direBonjour();

// Fonction avec paramètres
function saluer(nom) {
  console.log("Bonjour " + nom + " !");
}
saluer("Alice");

// Fonction avec retour
function additionner(a, b) {
  return a + b;
}
const resultat = additionner(5, 3); // 8`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="E.2 - Fonctions fléchées">
          <SlideText>
            Syntaxe concise introduite en ES6 :
          </SlideText>
          <SlideCode language="javascript" highlight="1-4 | 6-7 | 9-10 | 12-13">
            {`// Syntaxe complète
const multiplier = (a, b) => {
  return a * b;
};

// Syntaxe courte (return implicite)
const carre = (x) => x * x;

// Un seul paramètre (parenthèses optionnelles)
const doubler = x => x * 2;

// Aucun paramètre (parenthèses obligatoires)
const direHello = () => console.log("Hello!");`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="E.3 - Portée des variables (scope)">
          <SlideText>
            La portée détermine où une variable est accessible :
          </SlideText>
          <SlideList>
            <SlideListItem>Variables globales : accessibles partout</SlideListItem>
            <SlideListItem>Variables locales : uniquement dans la fonction</SlideListItem>
            <SlideListItem>Paramètres : variables locales de la fonction</SlideListItem>
          </SlideList>
          <SlideCode language="javascript" highlight="1-5 | 7-11">
            {`const nom = "Alice"; // Variable globale

function afficherNom() {
  console.log(nom); // Accès possible
}

function calculer() {
  const resultat = 10 + 5; // Variable locale
  console.log(resultat);
}
// console.log(resultat); // Erreur !`}
          </SlideCode>
        </SlideScreen>

        {/* F - Template literals */}
        <SlideScreen title="F.1 - Template literals : Interpolation">
          <SlideText>
            Créer des chaînes avec des variables (backticks) :
          </SlideText>
          <SlideCode language="javascript" highlight="1-5 | 7-8 | 10-13">
            {`const prenom = "Alice";
const age = 25;

// Méthode classique (concaténation)
const message1 = "Bonjour, je m'appelle " + prenom + " et j'ai " + age + " ans.";

// Template literals (plus lisible)
const message2 = \`Bonjour, je m'appelle \${prenom} et j'ai \${age} ans.\`;

// Avec expressions
const a = 10;
const b = 5;
console.log(\`La somme de \${a} et \${b} est \${a + b}\`);`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="F.2 - Template literals : Multi-lignes">
          <SlideText>
            Les template literals conservent les retours à la ligne :
          </SlideText>
          <SlideCode language="javascript" highlight="1-4 | 6-11">
            {`// Méthode classique (compliqué)
const texte1 = "Première ligne\\n" +
               "Deuxième ligne\\n" +
               "Troisième ligne";

// Template literals (simple)
const texte2 = \`Première ligne
Deuxième ligne
Troisième ligne\`;

console.log(texte2);`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="F.3 - Template literals : HTML dynamique">
          <SlideText>
            Très utile pour créer du contenu HTML :
          </SlideText>
          <SlideCode language="javascript">
            {`const utilisateur = {
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

document.body.innerHTML += carte;`}
          </SlideCode>
        </SlideScreen>

        {/* G - Console */}
        <SlideScreen title="G - Afficher des messages">
          <SlideText>
            Utiliser la console pour déboguer :
          </SlideText>
          <SlideCode language="javascript" highlight="1-2 | 4-5 | 7-8 | 10-11">
            {`// Afficher un message simple
console.log("Bonjour, monde !");

// Afficher une variable
console.log("Age :", age);

// Afficher une erreur
console.error("/!\\\\ Une erreur est survenue /!\\\\");

// Afficher un tableau formaté
console.table(fruits);`}
          </SlideCode>
        </SlideScreen>

        {/* H - DOM */}
        <SlideScreen title="H - Le DOM (Document Object Model)">
          <SlideText>
            Interface pour manipuler dynamiquement le contenu, la structure et le style des pages web.
          </SlideText>
          <SlideList>
            <SlideListItem>Représente la page sous forme d'arbre d'objets</SlideListItem>
            <SlideListItem>Permet d'accéder, modifier, ajouter ou supprimer des éléments HTML</SlideListItem>
            <SlideListItem>Rend les pages web interactives</SlideListItem>
          </SlideList>
        </SlideScreen>

        <SlideScreen title="H.1 - Sélectionner des éléments">
          <SlideNote>
            - `getElementById` est le plus rapide.
            - `querySelector` est le plus polyvalent car il utilise la syntaxe CSS.
            - Rappeler que `querySelectorAll` retourne une NodeList (similaire à un tableau mais pas identique).
          </SlideNote>
          <SlideText>
            Méthodes pour sélectionner des éléments :
          </SlideText>
          <SlideCode language="javascript" highlight="1-2 | 4-5 | 7-8 | 10-11 | 13-14">
            {`// Par ID (unique)
const element = document.getElementById("monId");

// Par classe (plusieurs)
const elements = document.getElementsByClassName("maClasse");

// Par tag (plusieurs)
const divs = document.getElementsByTagName("div");

// Premier élément CSS
const firstElement = document.querySelector(".maClasse");

// Tous les éléments CSS
const allElements = document.querySelectorAll(".maClasse");`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="H.2 - Manipuler le contenu">
          <SlideText>
            Modifier le contenu et les attributs :
          </SlideText>
          <SlideCode language="javascript" highlight="1-2 | 4-5 | 7-8 | 10-11">
            {`// Modifier le texte
element.textContent = "Nouveau contenu";

// Modifier le HTML
element.innerHTML = "<strong>Texte en gras</strong>";

// Modifier un attribut
element.setAttribute("required", true);

// Récupérer un attribut
const valeur = element.getAttribute("required");`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="H.2 - Manipuler le style">
          <SlideText>
            Modifier les styles et classes CSS :
          </SlideText>
          <SlideCode language="javascript" highlight="1-3 | 5-8">
            {`// Ajouter du style en ligne
element.style.color = "red";
element.style.fontSize = "20px";

// Manipuler les classes
element.classList.add("nouvelleClasse");
element.classList.remove("ancienneClasse");
element.classList.toggle("active"); // Bascule`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="H.3 - Ajouter des éléments">
          <SlideText>
            Créer et ajouter des éléments dans le DOM :
          </SlideText>
          <SlideCode language="javascript" highlight="1-6 | 8-9 | 11-13">
            {`// Créer un nouvel élément
const newElement = document.createElement("p");
newElement.textContent = "Ceci est un paragraphe.";

// Ajouter à la fin
document.body.appendChild(newElement);

// Ajouter au début
document.body.prepend(newElement);

// Ajouter avant un élément existant
const referenceElement = document.getElementById("someId");
document.body.insertBefore(newElement, referenceElement);`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="H.3 - Supprimer des éléments">
          <SlideText>
            Supprimer des éléments du DOM :
          </SlideText>
          <SlideCode language="javascript">
            {`// Supprimer un élément
element.remove();`}
          </SlideCode>
        </SlideScreen>

        <SlideScreen title="Récapitulatif">
          <SlideList>
            <SlideListItem>Variables : const, let</SlideListItem>
            <SlideListItem>Opérateurs : ===, !==, &&, ||, !</SlideListItem>
            <SlideListItem>Conditions : if/else, switch, ternaire</SlideListItem>
            <SlideListItem>Tableaux : map, filter, reduce</SlideListItem>
            <SlideListItem>Fonctions : classiques et fléchées</SlideListItem>
            <SlideListItem>Template literals : interpolation avec backticks</SlideListItem>
            <SlideListItem>DOM : sélectionner, manipuler, ajouter, supprimer</SlideListItem>
          </SlideList>
        </SlideScreen>
      </SlidesScreen>
    </div>
  );
}