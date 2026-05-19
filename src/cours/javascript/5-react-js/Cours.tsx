import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import CoursePrerequisites from "@/components/CoursePrerequisites";

export default function Cours() {
    return (
        <article>
            <CoursePrerequisites>
                <Text>
                    <strong>Les fonctions fléchées</strong> sont le format standard des composants
                    React — chaque composant est une fonction qui reçoit des props et retourne du JSX.
                </Text>
                <CodeCard language="javascript" title="Fonction fléchée avec objet">
                    {`const afficher = ({ nom, age }) => {
    return nom + " a " + age + " ans";
};`}
                </CodeCard>

                <Text>
                    <strong><Code>Array.map</Code></strong> est indispensable en React pour transformer
                    un tableau de données en liste d&apos;éléments JSX — chaque élément doit avoir une
                    prop <Code>key</Code> unique.
                </Text>
                <CodeCard language="javascript" title="map pour afficher une liste">
                    {`const fruits = ["pomme", "banane", "cerise"];
fruits.map((fruit) => console.log(fruit));`}
                </CodeCard>

                <Text>
                    <strong><Code>fetch</Code> et les promesses</strong> alimentent <Code>useEffect</Code>{" "}
                    pour charger des données au montage d&apos;un composant. Une promesse représente une
                    valeur disponible dans le futur.
                </Text>
                <CodeCard language="javascript" title="fetch basique">
                    {`fetch("https://api.example.com/data")
    .then((res) => res.json())
    .then((data) => console.log(data));`}
                </CodeCard>

                <Text>
                    <strong>Les événements DOM</strong> (<Code>addEventListener</Code>) sont remplacés
                    en React par des props JSX comme <Code>onClick</Code>, <Code>onChange</Code> —
                    même concept, syntaxe différente.
                </Text>
            </CoursePrerequisites>
            <section>
                <Text>
                    React est une bibliothèque JavaScript populaire pour la construction d&apos;interfaces
                    utilisateur interactives et dynamiques. Ce cours vous guidera à travers les concepts
                    fondamentaux de React :
                </Text>
                <List>
                    <ListItem><strong>Composants</strong> : les blocs de construction de l&apos;UI.</ListItem>
                    <ListItem>
                        <strong>Props</strong> : les paramètres passés aux composants.
                    </ListItem>
                    <ListItem>
                        <strong>État</strong> : la mémoire interne des composants (<Code>useState</Code>).
                    </ListItem>
                    <ListItem>
                        <strong>Effets</strong> : les opérations déclenchées par un changement (<Code>useEffect</Code>).
                    </ListItem>
                    <ListItem>
                        <strong>Événements</strong> : la réponse aux interactions utilisateur.
                    </ListItem>
                    <ListItem>
                        <strong>Contexte</strong> : le partage de données entre composants distants.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>A- Composants</Heading>
                <Text>
                    Les composants sont les blocs de construction de toute application React. Ils permettent
                    de diviser l&apos;interface utilisateur en morceaux indépendants et réutilisables.
                </Text>

                <Heading level={3}>1. Définition d&apos;un composant</Heading>
                <Text>
                    Un composant est une fonction (ou une classe) qui renvoie un élément React, généralement
                    écrit en JSX. Par convention, son nom commence par une majuscule.
                </Text>
                <CodeCard language="javascript">
                    {`import React from 'react';

// Définition d'un composant simple
function HelloWorld() {
    return <h1>Hello, World!</h1>;
}

export default HelloWorld;`}
                </CodeCard>

                <Heading level={3}>2. Utilisation d&apos;un composant</Heading>
                <Text>
                    Pour utiliser un composant, il faut l&apos;importer puis le rendre comme une balise
                    JSX à l&apos;intérieur d&apos;un autre composant.
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
}

export default App;`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>B- Props</Heading>
                <Text>
                    Les <em>props</em> (abréviation de <em>properties</em>) sont les arguments passés aux
                    composants. Elles permettent de personnaliser le comportement et l&apos;apparence des
                    composants depuis le parent.
                </Text>
                <CodeCard language="javascript">
                    {`function Hello(props) {
    return <h1>Hello, {props.name}! You are {props.age} years old.</h1>;
}

export default Hello;`}
                </CodeCard>

                <Text>
                    On peut également déstructurer directement les props dans la signature de la fonction
                    pour un code plus concis :
                </Text>
                <CodeCard language="javascript">
                    {`function Hello({ name, age }) {
    return <h1>Hello, {name}! You are {age} years old.</h1>;
}

export default Hello;`}
                </CodeCard>

                <Text>Utilisation depuis un parent :</Text>
                <CodeCard language="jsx">
                    {`function HelloAlice() {
    return <Hello name="Alice" age={25} />;
}

export default HelloAlice;`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>C- Gestion d&apos;état avec useState</Heading>
                <Text>
                    <Code>useState</Code> est un <em>hook</em> qui permet aux composants de gérer leur
                    propre état interne. Il retourne un tableau de deux éléments :
                </Text>
                <List>
                    <ListItem>la valeur actuelle de l&apos;état ;</ListItem>
                    <ListItem>une fonction pour la mettre à jour.</ListItem>
                </List>
                <CodeCard language="javascript">
                    {`import React, { useState } from 'react';

// Composant de compteur utilisant useState pour gérer l'état
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Compteur : {count}</p>
            <button onClick={() => setCount(count + 1)}>Incrémenter</button>
        </div>
    );
}

export default Counter;`}
                </CodeCard>
                <Text>
                    Chaque appel à <Code>setCount</Code> déclenche un nouveau rendu du composant avec la
                    nouvelle valeur de <Code>count</Code>.
                </Text>
            </section>

            <section>
                <Heading level={2}>D- Effets avec useEffect</Heading>
                <Text>
                    <Code>useEffect</Code> permet d&apos;effectuer des opérations en réponse à des
                    changements dans le composant : appels à des API externes, abonnements, minuteurs,
                    manipulation manuelle du DOM, etc.
                </Text>
                <Text>
                    Le <em>tableau de dépendances</em> (deuxième argument) contrôle quand l&apos;effet est
                    rejoué : à chaque changement d&apos;une dépendance.
                </Text>
                <CodeCard language="javascript">
                    {`import React, { useState, useEffect } from 'react';

// Composant minuteur utilisant useEffect pour mettre à jour le temps écoulé
function Timer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);

        // Fonction de nettoyage : appelée avant le prochain effet ou au démontage
        return () => clearInterval(timer);
    }, []); // [] = exécuté une seule fois (au montage)

    return <p>Temps écoulé : {seconds} secondes</p>;
}

export default Timer;`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>E- Les événements</Heading>
                <Text>
                    React simplifie la gestion des événements avec une syntaxe similaire à JavaScript natif,
                    mais en <strong>camelCase</strong> (<Code>onClick</Code>, <Code>onChange</Code>,{" "}
                    <Code>onSubmit</Code>…) et avec une <strong>fonction</strong> en valeur.
                </Text>
                <CodeCard language="javascript">
                    {`function MyButton() {
    // Fonction handleClick pour gérer le clic sur le bouton
    function handleClick() {
        console.log("Le bouton a été cliqué !");
    }

    return (
        <button onClick={handleClick}>Cliquez-moi</button>
    );
}

export default MyButton;`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>F- Contexte</Heading>
                <Text>
                    Le contexte permet de partager des valeurs globales entre plusieurs composants sans
                    avoir à les passer manuellement à chaque niveau de l&apos;arborescence (<em>prop drilling</em>).
                </Text>
                <Text>
                    Trois étapes : créer le contexte avec <Code>createContext()</Code>, fournir une valeur
                    avec <Code>&lt;Context.Provider&gt;</Code>, puis la consommer avec <Code>useContext()</Code>.
                </Text>
                <CodeCard language="javascript">
                    {`import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

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
            <p>Valeur du contexte : {value}</p>
            <button onClick={() => setValue("Nouveau contexte")}>
                Changer la valeur
            </button>
        </div>
    );
}

function App() {
    return (
        <MyProvider>
            <MyComponent />
        </MyProvider>
    );
}

export default App;`}
                </CodeCard>
            </section>
        </article>
    );
}
