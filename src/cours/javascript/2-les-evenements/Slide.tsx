'use client';
import {SlidesScreen} from "@/components/Slides/SlidesScreen";
import React, {useState} from 'react';
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideNote} from "@/components/Slides/ui/SlideNote";
import {Button} from "@/components/ui/button";

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
        title: "Les événements",
        description: "Gestion des événements en JavaScript",
        tags: ["Events", "JS", "addEventListener", "handlers", "interactions"],
        order: 2
    } as any;

    return (
        <div className="w-full py-10">
            <SlidesScreen module={mockModule} section={mockSection}>

                {/* Slide 1: Qu'est-ce qu'un événement ? */}
                <SlideScreen title="Qu'est-ce qu'un événement ?">
                    <SlideText>
                        Un événement est une action ou une occurrence qui se produit dans le navigateur.
                    </SlideText>
                    <SlideList>
                        <SlideListItem>Clic de souris</SlideListItem>
                        <SlideListItem>Frappe au clavier</SlideListItem>
                        <SlideListItem>Chargement d'une page</SlideListItem>
                        <SlideListItem>Défilement d'un élément</SlideListItem>
                    </SlideList>
                    <SlideNote>
                        {`Les événements permettent de rendre vos pages web interactives.
JavaScript détecte ces événements et exécute du code en réponse.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 2: addEventListener */}
                <SlideScreen title="Ajouter un écouteur d'événement">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="1-2 | 4-6 | 8-12">
                                {`// Sélectionner un élément
const button = document.getElementById("myButton");

// Ajouter un écouteur avec fonction anonyme
button.addEventListener("click", () => {
  console.log("Bouton cliqué !");
});

// Avec une fonction nommée
function handleClick() {
  console.log("Clic détecté");
}
button.addEventListener("click", handleClick);`}
                            </SlideCode>
                        </div>
                        <div className="flex-1">
                            <InteractiveClickDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`addEventListener(type, fonction) attache un gestionnaire d'événement.
- Premier paramètre : type d'événement ("click", "keydown", etc.)
- Deuxième paramètre : fonction à exécuter`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 3: removeEventListener */}
                <SlideScreen title="Supprimer un écouteur">
                    <SlideCode language="javascript" highlight="4-7 | 9-10 | 13-15">
                        {`const button = document.getElementById("myButton");

// Définir la fonction séparément
const logClick = () => {
  console.log("Clic détecté");
};

// Ajouter l'écouteur
button.addEventListener("click", logClick);

// Supprimer l'écouteur
button.removeEventListener("click", logClick);

// ⚠️ Ceci ne fonctionnera PAS
button.addEventListener("click", () => console.log("Test"));
button.removeEventListener("click", () => console.log("Test"));`}
                    </SlideCode>
                    <SlideText>
                        Pour supprimer un écouteur, vous devez utiliser la <strong>même référence de fonction</strong>.
                    </SlideText>
                    <SlideNote>
                        {`Pour supprimer un écouteur, vous devez utiliser la même référence de fonction.
Les fonctions anonymes créent une nouvelle référence à chaque fois.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 4: Événements de souris */}
                <SlideScreen title="Événements de souris">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideList>
                                <SlideListItem><strong>click</strong> : Clic simple</SlideListItem>
                                <SlideListItem><strong>dblclick</strong> : Double clic</SlideListItem>
                                <SlideListItem><strong>mouseenter / mouseleave</strong> : Survol et
                                    sortie</SlideListItem>
                                <SlideListItem><strong>mousemove</strong> : Déplacement de la souris</SlideListItem>
                                <SlideListItem><strong>mousedown / mouseup</strong> : Appui et
                                    relâchement</SlideListItem>
                            </SlideList>
                        </div>
                        <div className="flex-1">
                            <InteractiveMouseDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`Les événements de souris sont les plus utilisés pour l'interactivité.
contextmenu permet de détecter le clic droit.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 5: Événements de clavier */}
                <SlideScreen title="Événements de clavier">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="1-8">
                                {`document.addEventListener("keydown", (event) => {
  console.log("Touche pressée :", event.key);
  
  if (event.key === "Enter") {
    console.log("Touche Entrée détectée !");
  }
});`}
                            </SlideCode>
                            <SlideList>
                                <SlideListItem><strong>keydown</strong> : Touche pressée</SlideListItem>
                                <SlideListItem><strong>keyup</strong> : Touche relâchée</SlideListItem>
                                <SlideListItem><strong>input</strong> : Saisie dans un champ</SlideListItem>
                            </SlideList>
                        </div>
                        <div className="flex-1">
                            <InteractiveKeyboardDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`event.key contient la valeur de la touche ("a", "Enter", "Escape"...).
Utilisez keydown pour détecter les touches spéciales.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 6: Événements de formulaire */}
                <SlideScreen title="Événements de formulaire">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="4-5 | 7-11">
                                {`const form = document.querySelector("form");
const input = document.querySelector("#username");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Empêche la soumission
  
  if (input.value.length < 3) {
    alert("Minimum 3 caractères");
  } else {
    console.log("Formulaire valide !");
  }
});`}
                            </SlideCode>
                        </div>
                        <div className="flex-1">
                            <InteractiveFormDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`Événements importants :
- submit : Soumission du formulaire
- change : Modification de valeur
- focus / blur : Gain/perte de focus
event.preventDefault() empêche le comportement par défaut.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 7: L'objet Event */}
                <SlideScreen title="L'objet Event">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="2-5">
                                {`document.addEventListener("click", (event) => {
  console.log("Type :", event.type);
  console.log("Cible :", event.target);
  console.log("Position X :", event.clientX);
  console.log("Position Y :", event.clientY);
});`}
                            </SlideCode>
                            <SlideList>
                                <SlideListItem><strong>type</strong> : Type d'événement</SlideListItem>
                                <SlideListItem><strong>target</strong> : Élément déclencheur</SlideListItem>
                                <SlideListItem><strong>clientX / clientY</strong> : Position de la
                                    souris</SlideListItem>
                            </SlideList>
                        </div>
                        <div className="flex-1">
                            <InteractiveEventObject/>
                        </div>
                    </div>
                    <SlideNote>
                        {`L'objet event est automatiquement passé à la fonction gestionnaire.
Il contient toutes les informations sur l'événement déclenché.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 8: Propriétés clavier */}
                <SlideScreen title="Propriétés pour les événements clavier">
                    <SlideCode language="javascript" highlight="2 | 3-6">
                        {`document.addEventListener("keydown", (event) => {
  console.log("Touche :", event.key);
  console.log("Ctrl ?", event.ctrlKey);
  console.log("Shift ?", event.shiftKey);
  console.log("Alt ?", event.altKey);
  console.log("Meta ?", event.metaKey);
});`}
                    </SlideCode>
                    <SlideList>
                        <SlideListItem><strong>key</strong> : Touche pressée ("a", "Enter"...)</SlideListItem>
                        <SlideListItem><strong>ctrlKey, shiftKey, altKey, metaKey</strong> : Touches modificatrices
                            (booléens)</SlideListItem>
                    </SlideList>
                    <SlideNote>
                        {`Propriétés utiles :
- key : Touche pressée ("a", "Enter"...)
- ctrlKey, shiftKey, altKey, metaKey : Touches modificatrices (booléens)`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 9: Exemple - Changer la couleur */}
                <SlideScreen title="Exemple : Changer la couleur au clic">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="1 | 3-5">
                                {`const box = document.querySelector(".box");

box.addEventListener("click", () => {
  box.style.backgroundColor = "lightblue";
});`}
                            </SlideCode>
                        </div>
                        <div className="flex-1">
                            <InteractiveColorDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`Exemple simple : modifier le style CSS d'un élément au clic.
Vous pouvez modifier n'importe quelle propriété CSS via JavaScript.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 10: Exemple - Position de la souris */}
                <SlideScreen title="Exemple : Afficher la position de la souris">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="1 | 3-5">
                                {`const display = document.querySelector("#position");

document.addEventListener("mousemove", (event) => {
  display.textContent = \`X: \${event.clientX}, Y: \${event.clientY}\`;
});`}
                            </SlideCode>
                        </div>
                        <div className="flex-1">
                            <InteractivePositionDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`mousemove se déclenche à chaque mouvement de souris.
event.clientX et event.clientY donnent les coordonnées dans la fenêtre.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 11: Exemple - Compteur de clics */}
                <SlideScreen title="Exemple : Compteur de clics">
                    <div className="flex gap-8 items-start">
                        <div className="flex-1">
                            <SlideCode language="javascript" highlight="1-2 | 4-7">
                                {`const button = document.querySelector("#counter");
let count = 0;

button.addEventListener("click", () => {
  count++;
  button.textContent = \`Cliqué \${count} fois\`;
});`}
                            </SlideCode>
                        </div>
                        <div className="flex-1">
                            <InteractiveCounterDemo/>
                        </div>
                    </div>
                    <SlideNote>
                        {`Exemple classique : utiliser une variable pour compter les clics.
La valeur est mise à jour à chaque événement click.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 12: Événements de chargement */}
                <SlideScreen title="Événements de chargement">
                    <SlideCode language="javascript" highlight="2-4 | 7-9">
                        {`// DOMContentLoaded : HTML chargé et analysé
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM prêt !");
});

// load : Page entièrement chargée (images, styles...)
window.addEventListener("load", () => {
  console.log("Tout est chargé !");
});`}
                    </SlideCode>
                    <SlideList>
                        <SlideListItem><strong>DOMContentLoaded</strong> : HTML chargé et analysé (idéal pour le
                            DOM)</SlideListItem>
                        <SlideListItem><strong>load</strong> : Tout est chargé (images, CSS, scripts)</SlideListItem>
                    </SlideList>
                    <SlideNote>
                        {`DOMContentLoaded : idéal pour commencer à manipuler le DOM
load : tout est chargé (images, CSS, scripts)
Utilisez DOMContentLoaded pour éviter d'attendre les ressources externes.`}
                    </SlideNote>
                </SlideScreen>

                {/* Slide 13: Récapitulatif */}
                <SlideScreen title="Récapitulatif">
                    <SlideList>
                        <SlideListItem>Les événements rendent les pages interactives</SlideListItem>
                        <SlideListItem>addEventListener() pour écouter les événements</SlideListItem>
                        <SlideListItem>L'objet event contient toutes les infos</SlideListItem>
                        <SlideListItem>De nombreux types : souris, clavier, formulaire...</SlideListItem>
                        <SlideListItem>event.preventDefault() pour annuler le comportement par défaut</SlideListItem>
                    </SlideList>
                    <SlideNote>
                        {`Les événements sont au cœur de l'interactivité web.
Maîtriser addEventListener et l'objet event est essentiel en JavaScript.`}
                    </SlideNote>
                </SlideScreen>

            </SlidesScreen>
        </div>
    );
}

// Composant interactif pour addEventListener
function InteractiveClickDemo() {
    const [clicked, setClicked] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-muted/30 rounded-xl border h-full">
            <div className="text-xl font-semibold text-muted-foreground">✨ Démo interactive</div>
            <Button
                size="lg"
                onClick={() => setClicked(!clicked)}
                className="text-xl px-8 py-6 h-auto"
            >
                {clicked ? "✓ Cliqué !" : "Cliquez-moi !"}
            </Button>
        </div>
    );
}

// Composant interactif pour les événements de souris
function InteractiveMouseDemo() {
    const [event, setEvent] = useState<string>("Survolez ou cliquez...");

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-muted-foreground text-center">✨ Démo interactive</div>
            <div
                className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-all hover:shadow-2xl"
                onMouseEnter={() => setEvent("mouseenter 🖱️")}
                onMouseLeave={() => setEvent("mouseleave 👋")}
                onClick={() => setEvent("click 👆")}
                onDoubleClick={() => setEvent("dblclick 👆👆")}
            >
                {event}
            </div>
        </div>
    );
}

// Composant interactif pour le clavier
function InteractiveKeyboardDemo() {
    const [key, setKey] = useState<string>("");
    const [modifiers, setModifiers] = useState<string[]>([]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        setKey(e.key);
        const mods = [];
        if (e.ctrlKey) mods.push("Ctrl");
        if (e.shiftKey) mods.push("Shift");
        if (e.altKey) mods.push("Alt");
        setModifiers(mods);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-muted-foreground text-center">✨ Démo interactive</div>
            <input
                type="text"
                placeholder="Tapez quelque chose..."
                onKeyDown={handleKeyDown}
                className="w-full px-6 py-4 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
            <div className="bg-secondary/50 text-foreground p-6 rounded-xl font-mono space-y-2">
                <div><strong>Touche :</strong> {key || "..."}</div>
                <div><strong>Modificateurs :</strong> {modifiers.length > 0 ? modifiers.join(" + ") : "Aucun"}</div>
            </div>
        </div>
    );
}

// Composant interactif pour les formulaires
function InteractiveFormDemo() {
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.length < 3) {
            setMessage("❌ Le nom doit contenir au moins 3 caractères");
        } else {
            setMessage("✅ Formulaire valide !");
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-muted-foreground text-center">✨ Démo interactive</div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                    className="w-full px-6 py-4 text-xl border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <Button type="submit" size="lg" className="text-xl py-6">
                    Valider
                </Button>
            </form>
            {message && (
                <div
                    className={`p-4 rounded-xl text-lg font-semibold ${message.includes("✅") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

// Composant interactif pour l'objet Event
function InteractiveEventObject() {
    const [position, setPosition] = useState({x: 0, y: 0});
    const [isInside, setIsInside] = useState(false);

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-muted-foreground text-center">✨ Démo interactive</div>
            <div
                className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex flex-col items-center justify-center text-white transition-all"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPosition({x: e.clientX - rect.left, y: e.clientY - rect.top});
                }}
                onMouseEnter={() => setIsInside(true)}
                onMouseLeave={() => setIsInside(false)}
            >
                <div className="text-3xl font-bold mb-2">
                    {isInside ? "🖱️" : "Survolez"}
                </div>
                {isInside && (
                    <div className="text-xl font-mono">
                        X: {Math.round(position.x)} | Y: {Math.round(position.y)}
                    </div>
                )}
            </div>
        </div>
    );
}

// Composant interactif pour changer la couleur
function InteractiveColorDemo() {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];
    const [colorIndex, setColorIndex] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-muted-foreground text-center">✨ Démo interactive</div>
            <div
                onClick={() => setColorIndex((colorIndex + 1) % colors.length)}
                className={`w-full h-48 ${colors[colorIndex]} rounded-xl flex items-center justify-center text-white text-2xl font-bold cursor-pointer transition-all transform hover:scale-105 active:scale-95 shadow-xl`}
            >
                Cliquez pour changer !
            </div>
        </div>
    );
}

// Composant interactif pour la position de la souris
function InteractivePositionDemo() {
    const [position, setPosition] = useState({x: 0, y: 0});

    return (
        <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold text-muted-foreground text-center">✨ Démo interactive</div>
            <div
                className="w-full h-48 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white transition-all cursor-crosshair"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPosition({x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top)});
                }}
            >
                <div className="text-3xl font-mono font-bold">
                    X: {position.x} | Y: {position.y}
                </div>
            </div>
        </div>
    );
}

// Composant interactif pour le compteur
function InteractiveCounterDemo() {
    const [count, setCount] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-8 bg-muted/30 rounded-xl border h-full">
            <div className="text-xl font-semibold text-muted-foreground">✨ Démo interactive</div>
            <Button
                size="lg"
                onClick={() => setCount(count + 1)}
                className="text-2xl px-12 py-8 h-auto"
                variant="default"
            >
                Cliqué {count} fois
            </Button>
        </div>
    );
}