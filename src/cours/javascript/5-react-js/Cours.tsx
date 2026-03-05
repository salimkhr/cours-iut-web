import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";

export default function Cours() {
    return (
       <article>
           <Heading level={2}>Introduction à React</Heading>
           <Text>
               React est une bibliothèque JavaScript populaire pour la construction d&apos;interfaces utilisateur
               interactives et dynamiques.
               Ce cours vous guidera à travers les concepts fondamentaux de React.
           </Text>

           <Heading level={2}>Composants</Heading>
           <Text>
               Les composants sont les blocs de construction de toute application React. Ils permettent de diviser
               l&apos;interface utilisateur
               en morceaux indépendants et réutilisables.
           </Text>
           <Text>
               Un composant est une fonction ou une classe qui renvoie un élément React (généralement du JSX). Voici un
               exemple :
           </Text>
           <CodeCard language="javascript">
               {`import React from 'react';

// Définition d'un composant simple
function HelloWorld() {
    return <h1>Hello, World!</h1>;
}

export default HelloWorld;`}
           </CodeCard>

           <Heading level={2}>Exemple d&apos;utilisation d&apos;un composant</Heading>
           <Text>
               Dans cet exemple, nous importons le composant HelloWorld dans notre application principale, puis nous le
               rendons à l&apos;intérieur du composant principal.
           </Text>
           <CodeCard language="javascript">
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
           </CodeCard>

           <Heading level={2}>Props</Heading>
           <Text>
               Les props sont des arguments passés à des composants. Ils permettent de personnaliser le comportement et
               l&apos;apparence des composants.
           </Text>
           <CodeCard language="javascript">
               {`function Hello(props) {
    return <h1>Hello, {props.name}! You are {props.age} years old.</h1>;
}

export default Hello;`}
           </CodeCard>
           <Text>
               Utilisation :
           </Text>
           <CodeCard language="jsx">
               {`
function HelloAlice() {
    return <Hello name="Alice" age={25} />;
}

export default HelloAlice;`}
           </CodeCard>

           <Heading level={2}>Gestion d&apos;état avec useState</Heading>
           <Text>
               <Code>useState</Code> est un hook qui permet aux composants de gérer leur propre état interne.
           </Text>
           <CodeCard language="javascript">
               {`import React, { useState } from 'react';

// Composant de compteur utilisant useState pour gérer l'état
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrémenter</button>
    </div>
  );
}`}
           </CodeCard>

           <Heading level={2}>Effets avec useEffect</Heading>
           <Text>
               <Code>useEffect</Code> permet d&apos;effectuer des opérations en réponse à des changements dans le
               composant,
               comme la mise à jour de l&apos;interface utilisateur
               ou les appels à des API externes.
           </Text>
           <CodeCard language="javascript">
               {`import React, { useState, useEffect } from 'react';

// Composant de minuteur utilisant useEffect pour mettre à jour le temps écoulé
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  return <p>Temps écoulé : {seconds} secondes</p>;
}`}
           </CodeCard>

           <Heading level={2}>Les événements</Heading>
           <Text>
               React simplifie la gestion des événements avec une syntaxe similaire au JavaScript natif. Voici un
               exemple :
           </Text>
           <CodeCard language="javascript">
               {`function MyButton() {
  // Fonction handleClick pour gérer le clic sur le bouton
  function handleClick() {
    console.log("Le bouton a été cliqué !");
  }

  return (
    // Utilisation de onClick pour détecter le clic sur le bouton
    <button onClick={handleClick}>Cliquez-moi</button>
  );
}`}
           </CodeCard>

           <Heading level={2}>Composants</Heading>
           <Text>
               Les composants sont les blocs de construction de toute application React. Ils permettent de diviser
               l&apos;interface utilisateur en morceaux indépendants et réutilisables.
           </Text>
           <CodeCard language="javascript">{`function HelloWorld() {
    return <h1>Hello, World!</h1>;
}`}</CodeCard>

           <Heading level={2}>Props</Heading>
           <Text>
               Les props sont des arguments passés à des composants pour les personnaliser.
           </Text>
           <CodeCard language="javascript">{`function Hello({ name }) {
    return <h1>Hello, {name}!</h1>;
}`}</CodeCard>

           <Heading level={2}>Gestion d&apos;état avec useState</Heading>
           <CodeCard language="javascript">{`function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Compteur: {count}</p>
      <button onClick={() => setCount(count + 1)}>Incrémenter</button>
    </div>
  );
}`}</CodeCard>

           <Heading level={2}>Effets avec useEffect</Heading>
           <CodeCard language="javascript">{`function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return <p>Temps écoulé: {seconds} secondes</p>;
}`}</CodeCard>

           <Heading level={2}>Contexte</Heading>
           <Text>
               Le contexte en React est utilisé pour partager des valeurs globales entre plusieurs composants sans
               avoir à les passer manuellement à chaque niveau de l&apos;arborescence.
           </Text>
           <CodeCard language="javascript">{`const MyContext = createContext();

function MyProvider({ children }) {
    const [value, setValue] = useState("Hello Context");
    return (
        <MyContext.Provider value={{ value, setValue }}>
            {children}
        </MyContext.Provider>
    );
}

function MyComponent() {
    const { value, setValue } = useContext(MyContext);
    return (
        <div>
            <p>Valeur du contexte: {value}</p>
            <button onClick={() => setValue("Nouveau Contexte")}>Changer la valeur</button>
        </div>
    );
}

function App() {
    return (
        <MyProvider>
            <MyComponent />
        </MyProvider>
    );
}`}</CodeCard>
       </article>
    );
}
