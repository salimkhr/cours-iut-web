'use client';
import {SlidesScreen} from "@/components/Slides/SlidesScreen";
import React from 'react';
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";
import ClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ClickableBox";
import MouseTrackerBox from "@/cours/javascript/2-les-evenements/Exemple/MouseTrackerBox";
import KeyPressBox from "@/cours/javascript/2-les-evenements/Exemple/KeyPressBox";
import ColorClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ColorClickableBox";
import FormBox from "@/cours/javascript/2-les-evenements/Exemple/FormBox";
import ClickCounterBox from "@/cours/javascript/2-les-evenements/Exemple/ClickCounterBox";

import Module from "@/types/Module";
import Section from "@/types/Section";

interface DemoBoxProps {
    children: React.ReactNode;
    title: string;
}

const DemoBox = ({children, title}: DemoBoxProps) => (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
        {title && <h3 className="text-xl font-semibold mb-4 text-blue-900">🎯 {title}</h3>}
        <div className="flex items-center justify-center">
            {children}
        </div>
    </div>
);

const mockModule: Module = {
    _id: "javascript",
    title: "JavaScript",
    path: "javascript",
    iconName: "Braces",
    description: "Apprendre les bases de JavaScript pour le web interactif",
    sections: [],
    associatedSae: []
};

const mockSection: Section = {
    title: "Les événements",
    path: "les-evenements",
    contents: [],
    description: "Gestion des événements en JavaScript",
    tags: ["Events", "JS", "addEventListener", "handlers", "interactions"],
    totalDuration: 0,
    hasCorrection: false,
    order: 2
};

export default function Slide() {
    return (
        <div className="w-full">
            <SlidesScreen module={mockModule} section={mockSection}>
                {/* Introduction */}
                <SlideScreen title="Les Événements - Introduction">
                    <SlideNote>
                        {`- Bienvenue dans le cours sur les événements JavaScript !
- Rappeler que les événements sont au cœur de l'interactivité web.
- Expliquer qu'un événement c'est une action de l'utilisateur ou du navigateur.`}
                    </SlideNote>
                    <SlideText>
                        Les événements sont des actions ou occurrences qui se produisent dans le navigateur et
                        auxquelles JavaScript peut réagir.
                    </SlideText>
                    <SlideList>
                        <SlideListItem>Clic de souris, frappe au clavier, défilement...</SlideListItem>
                        <SlideListItem>Permettent de rendre les pages web interactives</SlideListItem>
                        <SlideListItem>JavaScript écoute ces événements et exécute du code en réponse</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* A - Qu'est-ce qu'un événement */}
                <SlideScreen title="A - Qu'est-ce qu'un événement ?">
                    <SlideText>
                        Un événement est une action détectable qui se produit dans le navigateur :
                    </SlideText>
                    <SlideList>
                        <SlideListItem>Actions utilisateur : clic, double-clic, frappe clavier, mouvement
                            souris</SlideListItem>
                        <SlideListItem>Événements navigateur : chargement page, redimensionnement fenêtre,
                            défilement</SlideListItem>
                        <SlideListItem>Événements formulaire : soumission, changement de valeur,
                            focus/blur</SlideListItem>
                    </SlideList>
                    <SlideText>
                        JavaScript permet de détecter ces événements et d&apos;y réagir en exécutant du code
                        spécifique.
                    </SlideText>
                </SlideScreen>

                {/* B - addEventListener */}
                <SlideScreen title="B.1 - Ajouter un écouteur avec addEventListener">
                    <SlideNote>
                        {`- addEventListener est LA méthode moderne pour gérer les événements.
- Expliquer que c'est mieux que les attributs HTML onclick="..." (séparation HTML/JS).
- Montrer qu'on peut ajouter plusieurs écouteurs sur le même élément.`}
                    </SlideNote>
                    <SlideText>
                        Les écouteurs d&apos;événements permettent d&apos;attendre et de répondre à des
                        actions spécifiques.
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`const button = 
  document.getElementById("myButton");

button.addEventListener("click", () => {
  alert("Bouton cliqué !");
});`}
                        </SlideCode>

                        <DemoBox title="Essayez !">
                            <ClickableBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                <SlideScreen title="B.2 - Structure de addEventListener">
                    <SlideText>
                        addEventListener() prend deux paramètres essentiels :
                    </SlideText>
                    <SlideList>
                        <SlideListItem>
                            Premier paramètre : le type d&apos;événement (ex. &quot;click&quot;, &quot;keydown&quot;).
                        </SlideListItem>
                        <SlideListItem>
                            Deuxième paramètre : la fonction à exécuter quand l&apos;événement se produit.
                        </SlideListItem>
                    </SlideList>

                    <SlideCode language="javascript">
                        {`// Syntaxe générale
element.addEventListener(type, fonction);

// Exemples
button.addEventListener("click", handleClick);
input.addEventListener("keydown", detectKey);
window.addEventListener("scroll", updateScroll);`}
                    </SlideCode>
                </SlideScreen>

                {/* C - removeEventListener */}
                <SlideScreen title="B.3 - Supprimer un écouteur avec removeEventListener">
                    <SlideNote>
                        {`- IMPORTANT : Pour supprimer un écouteur, il faut la même référence de fonction.
- Les fonctions anonymes ne peuvent pas être supprimées (différente à chaque fois).
- Toujours utiliser une fonction nommée ou une variable si on veut pouvoir supprimer.`}
                    </SlideNote>
                    <SlideText>
                        Pour supprimer un écouteur, vous devez utiliser la même référence de fonction.
                    </SlideText>

                    <SlideCode language="javascript">
                        {`// ✅ Correct : fonction définie séparément
const logClick = () => console.log("Clic détecté");

button.addEventListener("click", logClick);
button.removeEventListener("click", logClick);

// ❌ Incorrect : fonctions anonymes différentes
button.addEventListener("click", () => console.log("Test"));
button.removeEventListener("click", () => console.log("Test")); 
// Ne fonctionne PAS !`}
                    </SlideCode>
                </SlideScreen>

                {/* D - Types d'événements - Chargement */}
                <SlideScreen title="C.1 - Événements de chargement">
                    <SlideText>
                        Événements liés au chargement de la page et des ressources :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">DOMContentLoaded</h3>
                            <SlideList>
                                <SlideListItem>HTML chargé et analysé</SlideListItem>
                                <SlideListItem>Ressources externes pas encore chargées</SlideListItem>
                                <SlideListItem>Idéal pour manipuler le DOM</SlideListItem>
                            </SlideList>
                        </div>

                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">load</h3>
                            <SlideList>
                                <SlideListItem>Page entière chargée</SlideListItem>
                                <SlideListItem>Toutes les ressources (images, CSS, JS)</SlideListItem>
                                <SlideListItem>Utiliser si besoin des dimensions d&apos;images</SlideListItem>
                            </SlideList>
                        </div>
                    </div>

                    <SlideCode language="javascript">
                        {`document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM prêt !");
});

window.addEventListener("load", () => {
  console.log("Tout est chargé !");
});`}
                    </SlideCode>
                </SlideScreen>

                {/* E - Types d'événements - Souris */}
                <SlideScreen title="C.2 - Événements de souris">
                    <SlideText>
                        Les événements déclenchés par les interactions avec la souris :
                    </SlideText>

                    <SlideCode language="javascript">
                        {`// Clic simple et double
element.addEventListener("click", handleClick);
element.addEventListener("dblclick", handleDoubleClick);

// Survol et sortie
element.addEventListener("mouseenter", handleEnter);
element.addEventListener("mouseleave", handleLeave);

// Mouvement de la souris
element.addEventListener("mousemove", handleMove);

// Boutons souris
element.addEventListener("mousedown", handleDown);
element.addEventListener("mouseup", handleUp);`}
                    </SlideCode>
                </SlideScreen>

                {/* F - Types d'événements - Clavier */}
                <SlideScreen title="C.3 - Événements de clavier">
                    <SlideText>
                        Les événements déclenchés par l&apos;utilisation du clavier :
                    </SlideText>

                    <SlideCode language="javascript">
                        {`// Appui et relâchement de touche
document.addEventListener("keydown", (event) => {
  console.log("Touche appuyée :", event.key);
});

document.addEventListener("keyup", (event) => {
  console.log("Touche relâchée :", event.key);
});

// Saisie dans un champ de texte
input.addEventListener("input", (event) => {
  console.log("Valeur actuelle :", event.target.value);
});`}
                    </SlideCode>
                </SlideScreen>

                {/* G - Types d'événements - Formulaire */}
                <SlideScreen title="C.4 - Événements de formulaire">
                    <SlideText>
                        Événements spécifiques aux formulaires et champs de saisie :
                    </SlideText>

                    <SlideCode language="javascript">
                        {`// Soumission de formulaire
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Empêcher l'envoi
  console.log("Formulaire soumis !");
});

// Changement de valeur
select.addEventListener("change", (event) => {
  console.log("Nouvelle valeur :", event.target.value);
});

// Focus et perte de focus
input.addEventListener("focus", () => {
  console.log("Champ activé");
});`}
                    </SlideCode>
                </SlideScreen>

                {/* H - Types d'événements - Fenêtre */}
                <SlideScreen title="C.5 - Événements de fenêtre">
                    <SlideText>
                        Événements liés à la fenêtre du navigateur :
                    </SlideText>

                    <SlideCode language="javascript">
                        {`// Redimensionnement de la fenêtre
window.addEventListener("resize", () => {
  console.log("Largeur :", window.innerWidth);
});

// Défilement de la page
window.addEventListener("scroll", () => {
  console.log("Position :", window.scrollY);
});

// Erreur de chargement
image.addEventListener("error", () => {
  console.log("Erreur de chargement");
});`}
                    </SlideCode>
                </SlideScreen>

                {/* I - L'objet Event */}
                <SlideScreen title="D - L'objet Event">
                    <SlideNote>
                        {`- L'objet event est AUTOMATIQUEMENT créé et passé à la fonction.
- Il contient toutes les informations sur l'événement qui s'est produit.
- Très important pour accéder à l'élément cliqué, position souris, touche pressée, etc.`}
                    </SlideNote>
                    <SlideText>
                        Lorsqu&apos;un événement est déclenché, JavaScript crée automatiquement un objet
                        contenant des informations détaillées.
                    </SlideText>

                    <SlideCode language="javascript">
                        {`// L'objet event est passé automatiquement
document.addEventListener("click", (event) => {
  console.log("Objet événement :", event);
  console.log("Type :", event.type);
  console.log("Élément cliqué :", event.target);
  console.log("Timestamp :", event.timeStamp);
});`}
                    </SlideCode>
                </SlideScreen>

                {/* J - Propriétés communes Event */}
                <SlideScreen title="D.1 - Propriétés communes de Event">
                    <SlideText>
                        Propriétés disponibles pour tous les types d&apos;événements :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`// type : type d'événement
event.type // "click"

// target : élément déclenché
event.target

// currentTarget : élément écouté
event.currentTarget`}
                        </SlideCode>

                        <SlideCode language="javascript">
                            {`// timeStamp : moment
event.timeStamp

// preventDefault : annuler
event.preventDefault()

// stopPropagation : stopper
event.stopPropagation()`}
                        </SlideCode>
                    </div>
                </SlideScreen>

                {/* K - Propriétés souris */}
                <SlideScreen title="D.2 - Propriétés spécifiques : souris">
                    <SlideText>
                        Propriétés disponibles pour les événements de souris :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`element.addEventListener("click", (e) => {
  // Position dans la fenêtre
  console.log("X:", e.clientX);
  console.log("Y:", e.clientY);
  
  // Position dans la page
  console.log("Page X:", e.pageX);
  console.log("Page Y:", e.pageY);
  
  // Quel bouton ?
  // 0=gauche, 1=milieu, 2=droit
  console.log("Bouton:", e.button);
});`}
                        </SlideCode>

                        <DemoBox title="Déplacez votre souris">
                            <MouseTrackerBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                {/* L - Propriétés clavier */}
                <SlideScreen title="D.3 - Propriétés spécifiques : clavier">
                    <SlideText>
                        Propriétés disponibles pour les événements de clavier :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`document.addEventListener("keydown", (e) => {
  // Quelle touche ?
  console.log("Touche:", e.key);
  
  // Touches modificatrices ?
  console.log("Ctrl:", e.ctrlKey);
  console.log("Shift:", e.shiftKey);
  console.log("Alt:", e.altKey);
  console.log("Meta:", e.metaKey);
  
  // Exemple : Ctrl+S
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    console.log("Sauvegarde !");
  }
});`}
                        </SlideCode>

                        <DemoBox title="Appuyez sur une touche">
                            <KeyPressBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                {/* M - Exemple : Changer couleur */}
                <SlideScreen title="E.1 - Exemple : changer la couleur au clic">
                    <SlideText>
                        Modifier le style d&apos;un élément lors d&apos;un clic :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`const box = 
  document.querySelector(".box");

box.addEventListener("click", () => {
  box.style.backgroundColor = 
    "lightblue";
  box.style.color = "white";
});`}
                        </SlideCode>

                        <DemoBox title="Cliquez sur la boîte">
                            <ColorClickableBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                {/* N - Exemple : Position souris */}
                <SlideScreen title="E.2 - Exemple : afficher la position souris">
                    <SlideText>
                        Suivre le mouvement de la souris en temps réel :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`const display = 
  document.querySelector("#position");

document.addEventListener(
  "mousemove", 
  (event) => {
    display.textContent = 
      \`X: \${event.clientX}, 
       Y: \${event.clientY}\`;
  }
);`}
                        </SlideCode>

                        <DemoBox title="Zone de détection">
                            <MouseTrackerBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                {/* O - Exemple : Détecter touche */}
                <SlideScreen title="E.3 - Exemple : détecter les touches">
                    <SlideText>
                        Afficher quelle touche ou combinaison est pressée :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`window.addEventListener("keydown", (e) => {
  let keys = [];

  // Modificatrices
  if (e.ctrlKey) keys.push("Ctrl");
  if (e.shiftKey) keys.push("Shift");
  if (e.altKey) keys.push("Alt");
  if (e.metaKey) keys.push("Meta");

  // Touche principale
  if (!["Control", "Shift", 
        "Alt", "Meta"].includes(e.key)) {
    keys.push(e.key);
  }

  display.textContent = 
    "Touche(s) : " + keys.join(" + ");
});`}
                        </SlideCode>

                        <DemoBox title="Testez les combinaisons">
                            <KeyPressBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                {/* P - Exemple : Validation formulaire */}
                <SlideScreen title="E.4 - Exemple : validation de formulaire">
                    <SlideNote>
                        {`- event.preventDefault() est ESSENTIEL pour empêcher la soumission par défaut.
- Sans preventDefault, le formulaire recharge la page.
- Permet de valider les données avant l'envoi.`}
                    </SlideNote>
                    <SlideText>
                        Valider un formulaire avant sa soumission :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Important !

  if (input.value.length < 3) {
    message.textContent = 
      "Au moins 3 caractères";
    message.classList.add("error");
  } else {
    message.textContent = 
      "Formulaire valide !";
    message.classList.remove("error");
  }
});`}
                        </SlideCode>

                        <DemoBox title="Testez la validation">
                            <FormBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>

                {/* Q - Exemple : Compteur */}
                <SlideScreen title="E.5 - Exemple : compteur de clics">
                    <SlideText>
                        Créer un compteur qui s&apos;incrémente à chaque clic :
                    </SlideText>

                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="javascript">
                            {`const button = 
  document.querySelector("#counter");
let count = 0;

button.addEventListener("click", () => {
  count++;
  button.textContent = 
    \`Cliqué \${count} fois\`;
});`}
                        </SlideCode>

                        <DemoBox title="Cliquez plusieurs fois">
                            <ClickCounterBox/>
                        </DemoBox>
                    </div>
                </SlideScreen>
            </SlidesScreen>
        </div>
    );
}