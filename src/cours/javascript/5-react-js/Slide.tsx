'use client';
import { SlidesScreen } from "@/components/Slides/SlidesScreen";
import React from 'react';
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";

import Module from "@/types/Module";
import Section from "@/types/Section";

export default function ReactSlides() {
    const mockModule: Module = {
        _id: "react",
        title: "React",
        path: "react",
        iconName: "Atom",
        description: "Apprendre les bases de React pour construire des interfaces modernes",
        sections: [],
        associatedSae: []
    };

    const mockSection: Section = {
        title: "Introduction à React",
        path: "introduction-react",
        contents: [],
        description: "Les fondamentaux de React : composants, props, état et hooks",
        tags: ["React", "Composants", "Props", "useState", "useEffect", "Contexte"],
        totalDuration: 0,
        hasCorrection: false,
        order: 1
    };

    return (
        <div className="w-full py-10">
            <SlidesScreen module={mockModule} section={mockSection}>

                {/* Rappel Fetch */}
                <SlideScreen title="Rappel — Fetch : principes de base">
                    <SlideNote>
                        {`- Fetch est l'API native du navigateur pour effectuer des requêtes HTTP.
- Elle remplace l'ancien XMLHttpRequest avec une syntaxe bien plus simple.
- fetch() retourne une Promise : on utilise async/await pour la consommer.`}
                    </SlideNote>
                    <SlideText>
                        <code>fetch()</code> permet de communiquer avec un serveur depuis le navigateur.
                        Elle retourne une <strong>Promise</strong> qui se résout avec la réponse HTTP :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-2 | 4-5 | 7-8">
                        {`// Requête GET simple
const response = await fetch("https://api.example.com/data");

// La réponse n'est pas encore les données : il faut la parser
const data = await response.json();

// data contient maintenant l'objet JavaScript
console.log(data);`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="Rappel — Fetch : méthodes HTTP">
                    <SlideNote>
                        {`- GET : récupérer des données (lecture seule, pas de body).
- POST : envoyer des données pour créer une ressource.
- PUT/PATCH : mettre à jour une ressource existante.
- DELETE : supprimer une ressource.`}
                    </SlideNote>
                    <SlideText>
                        On configure la méthode, les headers et le body dans le deuxième argument de <code>fetch()</code> :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-2 | 4-12 | 14-18">
                        {`// GET : pas de body
const response = await fetch("/api/users");

// POST : envoyer des données JSON
const response = await fetch("/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "Alice", age: 25 })
});
const newUser = await response.json();

// DELETE : supprimer une ressource
const response = await fetch("/api/users/42", {
  method: "DELETE"
});`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="Rappel — Fetch : gestion des erreurs">
                    <SlideNote>
                        {`- Attention : fetch() ne rejette PAS la Promise sur une erreur HTTP (404, 500...).
- Il faut vérifier response.ok ou response.status manuellement.
- Le catch ne capture que les erreurs réseau (hors-ligne, DNS...).`}
                    </SlideNote>
                    <SlideText>
                        ⚠️ <code>fetch()</code> ne lève pas d&apos;erreur sur les codes HTTP d&apos;erreur — il faut les vérifier explicitement :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-5 | 7-13">
                        {`async function getData() {
  try {
    const response = await fetch("/api/data");

    // response.ok = true si status entre 200 et 299
    if (!response.ok) {
      throw new Error(\`Erreur HTTP : \${response.status}\`);
    }

    const data = await response.json();
    console.log("Données :", data);

  } catch (error) {
    // Erreurs réseau OU l'erreur qu'on a levée manuellement
    console.error("Erreur :", error);
  }
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Introduction */}
                <SlideScreen title="Introduction à React">
                    <SlideNote>
                        {`- Bienvenue dans le cours sur React !
- React est la bibliothèque frontend la plus populaire au monde.
- Développée par Meta (Facebook), elle est utilisée dans d'innombrables applications.
- Nous allons couvrir les concepts clés : composants, props, état, effets et contexte.`}
                    </SlideNote>
                    <SlideText>
                        React est une bibliothèque JavaScript populaire pour la construction d&apos;interfaces utilisateur
                        interactives et dynamiques. Ce cours vous guidera à travers ses concepts fondamentaux :
                    </SlideText>
                    <SlideList>
                        <SlideListItem>Composants : les briques de base de toute application React</SlideListItem>
                        <SlideListItem>Props : passer des données entre composants</SlideListItem>
                        <SlideListItem>useState : gérer l&apos;état interne d&apos;un composant</SlideListItem>
                        <SlideListItem>useEffect : réagir aux changements et effets secondaires</SlideListItem>
                        <SlideListItem>Événements : gérer les interactions utilisateur</SlideListItem>
                        <SlideListItem>Contexte : partager des données globalement</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Composants */}
                <SlideScreen title="A - Composants : les briques de base">
                    <SlideNote>
                        {`- Un composant est une fonction qui retourne du JSX.
- Les composants sont réutilisables et indépendants.
- Par convention, leur nom commence toujours par une majuscule.`}
                    </SlideNote>
                    <SlideText>
                        Les composants sont les blocs de construction de toute application React. Ils permettent de diviser
                        l&apos;interface utilisateur en morceaux indépendants et réutilisables.
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-4 | 6">
                        {`// Définition d'un composant simple
function HelloWorld() {
    return <h1>Hello, World!</h1>;
}

export default HelloWorld;`}
                    </SlideCode>
                </SlideScreen>

                {/* Utilisation d'un composant */}
                <SlideScreen title="A - Composants : utilisation">
                    <SlideNote>
                        {`- Un composant s'utilise comme une balise HTML.
- On peut imbriquer des composants à l'infini.
- App est le composant racine, il compose tous les autres.`}
                    </SlideNote>
                    <SlideText>
                        Pour utiliser un composant, on l&apos;importe puis on l&apos;intègre comme une balise HTML dans
                        le JSX du composant parent :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-3 | 5-11">
                        {`import React from 'react';
import ReactDOM from 'react-dom';
import HelloWorld from './HelloWorld';

// Composant principal de l'application
function App() {
    return (
        <div>
            <HelloWorld />
        </div>
    );
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Props */}
                <SlideScreen title="B - Props : personnaliser les composants">
                    <SlideNote>
                        {`- Les props sont en lecture seule : un composant ne doit jamais modifier ses propres props.
- Elles permettent de rendre les composants dynamiques et réutilisables.
- On peut passer n'importe quel type de valeur : string, number, boolean, objet, fonction...`}
                    </SlideNote>
                    <SlideText>
                        Les props sont des arguments passés à des composants. Ils permettent de personnaliser leur
                        comportement et leur apparence :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-3 | 5-9">
                        {`function Hello(props) {
    return <h1>Hello, {props.name}! You are {props.age} years old.</h1>;
}

// Utilisation du composant avec des props
function HelloAlice() {
    return <Hello name="Alice" age={25} />;
}

export default HelloAlice;`}
                    </SlideCode>
                </SlideScreen>

                {/* Props destructurées */}
                <SlideScreen title="B - Props : déstructuration">
                    <SlideNote>
                        {`- La déstructuration rend le code plus lisible.
- C'est la syntaxe la plus utilisée en React moderne.
- On peut aussi définir des valeurs par défaut directement dans la déstructuration.`}
                    </SlideNote>
                    <SlideText>
                        En pratique, on déstructure souvent les props directement dans les paramètres pour un code plus lisible :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-3 | 5-7">
                        {`// Avec déstructuration
function Hello({ name, age }) {
    return <h1>Hello, {name}! You are {age} years old.</h1>;
}

// Utilisation identique
function HelloBob() {
    return <Hello name="Bob" age={30} />;
}`}
                    </SlideCode>
                </SlideScreen>

                {/* useState */}
                <SlideScreen title="C - useState : gérer l'état">
                    <SlideNote>
                        {`- useState est le hook le plus fondamental de React.
- Il retourne un tableau : [valeurActuelle, fonctionDeMiseAJour].
- Chaque appel à la fonction de mise à jour déclenche un re-rendu du composant.`}
                    </SlideNote>
                    <SlideText>
                        <code>useState</code> est un hook qui permet aux composants de gérer leur propre état interne.
                        À chaque changement d&apos;état, le composant se re-rend automatiquement :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1 | 3 | 5-11">
                        {`import React, { useState } from 'react';

function Counter() {
  // count : valeur actuelle, setCount : fonction de mise à jour
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrémenter</button>
    </div>
  );
}`}
                    </SlideCode>
                </SlideScreen>

                {/* useEffect */}
                <SlideScreen title="D - useEffect : effets de bord">
                    <SlideNote>
                        {`- useEffect s'exécute après chaque rendu par défaut.
- Le tableau de dépendances contrôle quand l'effet se relance.
- La fonction de nettoyage (return) s'exécute avant le prochain effet ou au démontage.`}
                    </SlideNote>
                    <SlideText>
                        <code>useEffect</code> permet d&apos;effectuer des opérations en réponse à des changements dans
                        le composant, comme des appels à des APIs externes ou des abonnements :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1 | 4-10 | 12">
                        {`import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);

    return () => clearInterval(timer); // Nettoyage
  }, [seconds]); // Se relance quand seconds change

  return <p>Temps écoulé : {seconds} secondes</p>;
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Événements */}
                <SlideScreen title="E - Événements : gérer les interactions">
                    <SlideNote>
                        {`- React utilise une syntaxe camelCase pour les événements : onClick, onChange, onSubmit...
- On passe une fonction (pas un appel de fonction) au gestionnaire d'événements.
- L'objet event est automatiquement passé en paramètre si on en a besoin.`}
                    </SlideNote>
                    <SlideText>
                        React simplifie la gestion des événements avec une syntaxe similaire au JavaScript natif.
                        On attache les gestionnaires directement sur les éléments JSX :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-4 | 6-9">
                        {`function MyButton() {
  // Fonction handleClick pour gérer le clic sur le bouton
  function handleClick() {
    console.log("Le bouton a été cliqué !");
  }

  return (
    // Utilisation de onClick pour détecter le clic
    <button onClick={handleClick}>Cliquez-moi</button>
  );
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Contexte - Introduction */}
                <SlideScreen title="F - Contexte : partager des données globalement">
                    <SlideNote>
                        {`- Le contexte évite le "prop drilling" : passer des props à travers de nombreux niveaux.
- Idéal pour des données globales : thème, langue, utilisateur connecté...
- Trois étapes : créer le contexte, créer le Provider, consommer avec useContext.`}
                    </SlideNote>
                    <SlideText>
                        Le contexte en React est utilisé pour partager des valeurs globales entre plusieurs composants
                        sans avoir à les passer manuellement à chaque niveau de l&apos;arborescence :
                    </SlideText>
                    <SlideList>
                        <SlideListItem><strong>createContext()</strong> — crée le contexte</SlideListItem>
                        <SlideListItem><strong>{'<Context.Provider>'}</strong> — fournit la valeur aux composants enfants</SlideListItem>
                        <SlideListItem><strong>useContext()</strong> — consomme la valeur dans n&apos;importe quel composant enfant</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Contexte - Code */}
                <SlideScreen title="F - Contexte : exemple complet">
                    <SlideCode language="javascript" highlight="1-9 | 11-18 | 20-26">
                        {`const MyContext = createContext();

// 1. Le Provider encapsule les composants qui ont besoin du contexte
function MyProvider({ children }) {
    const [value, setValue] = useState("Hello Context");
    return (
        <MyContext.Provider value={{ value, setValue }}>
            {children}
        </MyContext.Provider>
    );
}

// 2. N'importe quel enfant peut consommer le contexte
function MyComponent() {
    const { value, setValue } = useContext(MyContext);
    return (
        <div>
            <p>Valeur du contexte: {value}</p>
            <button onClick={() => setValue("Nouveau Contexte")}>
                Changer la valeur
            </button>
        </div>
    );
}

// 3. Utilisation dans l'application
function App() {
    return (
        <MyProvider>
            <MyComponent />
        </MyProvider>
    );
}`}
                    </SlideCode>
                </SlideScreen>

            </SlidesScreen>
        </div>
    );
}
