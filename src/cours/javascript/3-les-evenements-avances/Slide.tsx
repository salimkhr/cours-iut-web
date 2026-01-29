'use client';
import {SlidesScreen} from "@/components/Slides/SlidesScreen";
import React from 'react';
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";
import {SlideDiagram} from "@/components/Slides/ui/SlideDiagram";

export default function PropagationSlides() {
    const mockModule = {
        title: "JavaScript",
        path: "javascript",
        iconName: "Braces",
        description: "Apprendre les bases de JavaScript pour le web interactif",
        sections: [],
        associatedSae: []
    } as any;

    const mockSection = {
        title: "Propagation et Délégation",
        description: "Propagation des événements et délégation en JavaScript",
        tags: ["Events", "Propagation", "Delegation", "Bubbling", "Capture"],
        order: 3
    } as any;

    // Diagrams
    const propagationDiagram = `graph TD
    A[Document] -->|1. Capture ↓| B[Body]
    B -->|2. Capture ↓| C[Parent]
    C -->|3. Capture ↓| D[Enfant - Cible]
    D -->|4. Bouillonnement ↑| C
    C -->|5. Bouillonnement ↑| B
    B -->|6. Bouillonnement ↑| A
    
    style D fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style A fill:#e3f2fd,stroke:#1976d2
    style B fill:#e8f5e9,stroke:#388e3c
    style C fill:#fff3e0,stroke:#f57c00`;

    const eventPhasesDiagram = `sequenceDiagram
    participant Doc as Document
    participant Parent as Parent
    participant Enfant as Enfant (Cible)
    
    Note over Doc,Enfant: Phase de Capture
    Doc->>Parent: Événement descend
    Parent->>Enfant: Événement descend
    
    Note over Enfant: Phase de Cible
    Enfant->>Enfant: Gestionnaires exécutés
    
    Note over Enfant,Doc: Phase de Bouillonnement
    Enfant->>Parent: Événement remonte
    Parent->>Doc: Événement remonte`;

    const delegationDiagram = `graph LR
    A[Liste UL] -->|Écouteur unique| B[Click Event]
    B -.->|Délégation| C[LI - Item 1]
    B -.->|Délégation| D[LI - Item 2]
    B -.->|Délégation| E[LI - Item 3]
    B -.->|Délégation| F[LI - Item N...]
    
    style A fill:#4caf50,stroke:#2e7d32,color:#fff
    style B fill:#2196f3,stroke:#1565c0,color:#fff
    style C fill:#fff9c4,stroke:#f9a825
    style D fill:#fff9c4,stroke:#f9a825
    style E fill:#fff9c4,stroke:#f9a825
    style F fill:#fff9c4,stroke:#f9a825`;

    const closestDiagram = `graph TD
    A[Grand-parent div.container] -->|children| B[Parent div.card]
    B -->|children| C[Enfant button#child]
    C -.->|closest'div'| B
    C -.->|closest'.container'| A
    C -.->|parentElement| B
    
    style C fill:#ff6b6b,stroke:#c92a2a,color:#fff
    style B fill:#4caf50,stroke:#2e7d32,color:#fff
    style A fill:#2196f3,stroke:#1565c0,color:#fff`;

    return (
        <div className="w-full">
            <SlidesScreen module={mockModule} section={mockSection}>
                {/* Introduction */}
                <SlideScreen title="Propagation des Événements - Introduction">
                    <SlideNote>
                        {`- Bienvenue dans le cours sur la propagation des événements !
- Ce concept est fondamental pour comprendre comment les événements se déplacent dans le DOM.
- Expliquer que la propagation permet la délégation d'événements, une technique très puissante.`}
                    </SlideNote>
                    <SlideText>
                        Lorsqu'un événement est déclenché sur un élément du DOM, il ne reste pas uniquement sur cet
                        élément. Il traverse plusieurs phases avant d'être complètement traité.
                    </SlideText>
                    <SlideList>
                        <SlideListItem>L'événement parcourt l'arbre DOM en suivant un chemin précis</SlideListItem>
                        <SlideListItem>Trois phases distinctes : capture, cible, et bouillonnement</SlideListItem>
                        <SlideListItem>Comprendre ce mécanisme permet d'optimiser la gestion des
                            événements</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Les 3 phases */}
                <SlideScreen title="1 - Les Trois Phases de Propagation">
                    <SlideNote>
                        {`- IMPORTANT : Chaque événement traverse ces 3 phases dans l'ordre.
- La plupart du temps, on travaille avec la phase de bouillonnement (par défaut).
- La phase de capture est moins utilisée mais reste importante à connaître.`}
                    </SlideNote>
                    <SlideText>
                        Voici les trois phases que traverse un événement dans l'arbre DOM :
                    </SlideText>

                    <SlideList>
                        <SlideListItem>
                            <strong>Phase de Capture</strong> : L'événement descend de document vers l'élément cible.
                            Les gestionnaires avec capture: true sont exécutés.
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Phase de Cible</strong> : L'événement atteint l'élément sur lequel il a été
                            déclenché. Les gestionnaires de cet élément sont exécutés.
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Phase de Bouillonnement</strong> : L'événement remonte de l'élément cible vers
                            document. Les gestionnaires sans capture sont exécutés (comportement par défaut).
                        </SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Visualisation du parcours */}
                <SlideScreen title="1.1 - Parcours Complet d'un Événement">
                    <SlideNote>
                        {`- Utiliser ce diagramme pour expliquer visuellement le parcours.
- Insister sur le fait que l'événement descend PUIS remonte.
- La couleur rouge indique l'élément cible où l'événement est déclenché.`}
                    </SlideNote>

                    <SlideDiagram chart={propagationDiagram}/>

                    <SlideText>
                        L'événement part de Document, descend jusqu'à la cible, puis remonte.
                    </SlideText>
                </SlideScreen>

                {/* Exemple phase de bouillonnement */}
                <SlideScreen title="2 - Phase de Bouillonnement (Par Défaut)">
                    <SlideNote>
                        {`- C'est le comportement par défaut de addEventListener.
- L'événement "bouillonne" vers le haut comme une bulle d'air dans l'eau.
- Très utile pour la délégation d'événements qu'on verra plus tard.`}
                    </SlideNote>

                    <SlideDiagram chart={eventPhasesDiagram}/>

                    <SlideCode language="javascript" highlight="1 | 4-7 | 9-12 | 14-17">
                        {`// HTML : <div id="parent"><button id="child">Cliquez</button></div>

const parent = document.getElementById("parent");
const child = document.getElementById("child");

// Gestionnaires en phase de bouillonnement (défaut)
parent.addEventListener("click", () => {
  console.log("Clic sur le parent (bouillonnement)");
});

child.addEventListener("click", () => {
  console.log("Clic sur l'enfant");
});

// Résultat dans la console :
// 1. "Clic sur l'enfant" (Phase de cible)
// 2. "Clic sur le parent (bouillonnement)" (Remonte)`}
                    </SlideCode>
                </SlideScreen>

                {/* Exemple phase de capture */}
                <SlideScreen title="3 - Phase de Capture">
                    <SlideNote>
                        {`- Pour activer la capture, passer true ou { capture: true } en 3ème argument.
- La capture intercepte l'événement AVANT qu'il n'atteigne la cible.
- Moins courant mais utile dans certains cas spécifiques.`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-4 | 6-8 | 10-16">
                        {`// Phase de capture - utiliser true ou { capture: true }
parent.addEventListener("click", () => {
  console.log("Clic capturé sur le parent");
}, true); // ou { capture: true }

child.addEventListener("click", () => {
  console.log("Clic capturé sur l'enfant");
}, true);

// Cliquez sur le bouton enfant
// Résultat dans la console :
// 1. "Clic capturé sur le parent" (Capture descend)
// 2. "Clic capturé sur l'enfant" (Cible atteinte)
// 3. "Clic sur l'enfant" (Si gestionnaire sans capture)
// 4. "Clic sur le parent (bouillonnement)" (Remonte)`}
                    </SlideCode>
                </SlideScreen>

                {/* stopPropagation */}
                <SlideScreen title="4 - Arrêter la Propagation">
                    <SlideNote>
                        {`- stopPropagation() arrête la propagation à l'élément actuel.
- Les gestionnaires suivants dans la chaîne ne seront PAS exécutés.
- À utiliser avec parcimonie car peut créer des bugs difficiles à déboguer.`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-4 | 6-8 | 10-13">
                        {`child.addEventListener("click", (event) => {
  console.log("Clic sur l'enfant");
  event.stopPropagation(); // Arrête la propagation ici
});

parent.addEventListener("click", () => {
  console.log("Clic sur le parent");
});

// Cliquez sur le bouton enfant
// Résultat dans la console :
// - "Clic sur l'enfant"
// - Le gestionnaire du parent n'est PAS appelé`}
                    </SlideCode>

                    <SlideText>
                        L'événement s'arrête au niveau actuel et ne remonte/descend plus.
                    </SlideText>
                </SlideScreen>

                {/* Délégation - Introduction */}
                <SlideScreen title="5 - La Délégation d'Événements">
                    <SlideNote>
                        {`- La délégation est UNE technique majeure en JavaScript.
- Au lieu d'attacher un écouteur à chaque élément enfant, on en attache UN SEUL au parent.
- Très performant et fonctionne même pour les éléments ajoutés dynamiquement.`}
                    </SlideNote>

                    <SlideDiagram chart={delegationDiagram}/>

                    <SlideList>
                        <SlideListItem>Utilise la phase de bouillonnement pour capturer les événements des
                            enfants</SlideListItem>
                        <SlideListItem>Réduit le nombre d'écouteurs attachés (meilleures
                            performances)</SlideListItem>
                        <SlideListItem>Fonctionne automatiquement pour les éléments ajoutés
                            dynamiquement</SlideListItem>
                        <SlideListItem>Utilise event.target pour identifier l'élément cliqué</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Délégation - Exemple */}
                <SlideScreen title="5.1 - Exemple de Délégation">
                    <SlideNote>
                        {`- Montrer qu'on attache UN SEUL écouteur sur le <ul>.
- event.target.tagName permet de vérifier le type d'élément cliqué.
- Les éléments ajoutés dynamiquement fonctionnent automatiquement !`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-5 | 7-12 | 14-18">
                        {`// HTML : <ul id="list">
//   <li>Item 1</li>
//   <li>Item 2</li>
//   <li>Item 3</li>
// </ul>

const list = document.getElementById("list");

// UN SEUL écouteur sur le parent <ul>
list.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    console.log("Élément cliqué :", event.target.textContent);
  }
});

// Les éléments ajoutés dynamiquement fonctionnent aussi !
const newItem = document.createElement("li");
newItem.textContent = "Item 4 (dynamique)";
list.appendChild(newItem);`}
                    </SlideCode>
                </SlideScreen>

                {/* event.target vs event.currentTarget */}
                <SlideScreen title="5.2 - event.target vs event.currentTarget">
                    <SlideNote>
                        {`- CRITIQUE : Bien comprendre la différence entre target et currentTarget.
- target = l'élément qui a déclenché l'événement (où le clic a eu lieu).
- currentTarget = l'élément sur lequel l'écouteur est attaché.`}
                    </SlideNote>

                    <SlideList>
                        <SlideListItem>
                            <strong>event.target</strong> : L'élément qui a réellement déclenché l'événement (l'élément
                            cliqué)
                        </SlideListItem>
                        <SlideListItem>
                            <strong>event.currentTarget</strong> : L'élément sur lequel l'écouteur est attaché (toujours
                            le même)
                        </SlideListItem>
                    </SlideList>

                    <SlideCode language="javascript" highlight="2-3 | 5-8">
                        {`list.addEventListener("click", (event) => {
  console.log("target:", event.target); 
  console.log("currentTarget:", event.currentTarget); 
  
  if (event.target.tagName === "LI") {
    // On a cliqué sur un <li>
    console.log("Item cliqué:", event.target.textContent);
  }
});`}
                    </SlideCode>
                </SlideScreen>

                {/* Navigation DOM - closest */}
                <SlideScreen title="6 - Navigation DOM : closest()">
                    <SlideNote>
                        {`- closest() est TRÈS utile pour la délégation d'événements.
- Remonte dans l'arbre DOM pour trouver le premier ancêtre correspondant.
- Commence par l'élément lui-même, puis remonte vers les parents.`}
                    </SlideNote>

                    <SlideDiagram chart={closestDiagram}/>

                    <SlideCode language="javascript" highlight="5-7 | 9-11 | 13-15">
                        {`// HTML : <div class="container">
//   <div class="card">
//     <button id="child">Cliquer</button>
//   </div>
// </div>

const child = document.getElementById("child");

const parentDiv = child.closest("div");
console.log(parentDiv); // <div class="card">

const container = child.closest(".container");
console.log(container); // <div class="container">

const notFound = child.closest(".inexistant");
console.log(notFound); // null`}
                    </SlideCode>
                </SlideScreen>

                {/* Délégation avancée avec closest */}
                <SlideScreen title="6.1 - Délégation Avancée avec closest()">
                    <SlideNote>
                        {`- closest() permet de gérer des structures HTML complexes.
- Très utile quand on clique sur un élément enfant mais qu'on veut agir sur le parent.
- Pattern très courant : boutons de suppression, cartes cliquables, etc.`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-5 | 7-17">
                        {`// HTML complexe avec des éléments imbriqués
// <ul id="list">
//   <li><span class="delete">×</span> <strong>Item 1</strong></li>
//   <li><span class="delete">×</span> <strong>Item 2</strong></li>
// </ul>

const list = document.getElementById("list");

list.addEventListener("click", (event) => {
  // Si on clique sur le bouton de suppression
  const deleteBtn = event.target.closest(".delete");
  
  if (deleteBtn) {
    const listItem = deleteBtn.closest("li");
    listItem.remove();
  }
});`}
                    </SlideCode>
                </SlideScreen>

                {/* Navigation DOM - parentElement et children */}
                <SlideScreen title="6.2 - parentElement et children">
                    <SlideNote>
                        {`- parentElement : accès direct au parent (un seul niveau).
- children : tous les enfants directs sous forme de HTMLCollection.
- Moins flexible que closest() mais parfois plus simple.`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-4 | 6-11">
                        {`const child = document.getElementById("child");

const parent = child.parentElement;
console.log(parent);

const parent2 = document.getElementById("parent");
const children = parent2.children; // HTMLCollection

for (let child of parent2.children) {
  console.log(child);
}`}
                    </SlideCode>

                    <SlideList>
                        <SlideListItem>
                            <strong>parentElement</strong> : Accède à l'élément parent direct
                        </SlideListItem>
                        <SlideListItem>
                            <strong>children</strong> : Accède à tous les éléments enfants directs
                        </SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* preventDefault */}
                <SlideScreen title="7 - preventDefault()">
                    <SlideNote>
                        {`- preventDefault() empêche le comportement par défaut de l'événement.
- N'arrête PAS la propagation (contrairement à stopPropagation).
- Très utilisé pour les formulaires et les liens.`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-6 | 8-14">
                        {`// Empêcher le suivi d'un lien
const link = document.getElementById("myLink");

link.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("Lien cliqué, mais navigation annulée");
});

// Empêcher la soumission d'un formulaire
const form = document.getElementById("myForm");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Formulaire intercepté pour validation");
});`}
                    </SlideCode>
                </SlideScreen>

                {/* preventDefault vs stopPropagation */}
                <SlideScreen title="7.1 - preventDefault vs stopPropagation">
                    <SlideNote>
                        {`- Ces deux méthodes sont souvent confondues mais font des choses différentes.
- preventDefault : annule l'action par défaut (suivre un lien, soumettre un formulaire).
- stopPropagation : arrête la remontée/descente de l'événement dans l'arbre DOM.
- On peut utiliser les deux ensemble si nécessaire.`}
                    </SlideNote>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">preventDefault()</h3>
                            <SlideList>
                                <SlideListItem>Annule le comportement par défaut</SlideListItem>
                                <SlideListItem>La propagation continue normalement</SlideListItem>
                                <SlideListItem>Exemples : soumettre formulaire, suivre lien</SlideListItem>
                            </SlideList>
                        </div>

                        <div>
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">stopPropagation()</h3>
                            <SlideList>
                                <SlideListItem>Arrête la propagation de l'événement</SlideListItem>
                                <SlideListItem>Le comportement par défaut s'exécute</SlideListItem>
                                <SlideListItem>Les gestionnaires parents non appelés</SlideListItem>
                            </SlideList>
                        </div>
                    </div>

                    <SlideCode language="javascript" highlight="2-3">
                        {`link.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  console.log("Aucun parent ne sera notifié");
});`}
                    </SlideCode>
                </SlideScreen>

                {/* Exemple complet délégation */}
                <SlideScreen title="8 - Exemple Complet : Liste de Tâches">
                    <SlideNote>
                        {`- Exemple pratique combinant délégation, closest(), et plusieurs types d'actions.
- Montre comment gérer plusieurs types d'événements avec un seul écouteur.
- Pattern très courant dans les applications réelles.`}
                    </SlideNote>

                    <SlideCode language="javascript" highlight="1-6 | 8-16 | 18-23">
                        {`// HTML : <ul id="todoList">
//   <li>
//     <input type="checkbox"> Tâche 1
//     <button class="delete">×</button>
//   </li>
// </ul>

const todoList = document.getElementById("todoList");

// UN SEUL écouteur pour toute la liste
todoList.addEventListener("click", (event) => {
  
  // Gestion de la suppression
  const deleteBtn = event.target.closest(".delete");
  if (deleteBtn) {
    const li = deleteBtn.closest("li");
    li.remove();
    return;
  }
  
  // Gestion de la checkbox
  if (event.target.type === "checkbox") {
    const li = event.target.closest("li");
    li.classList.toggle("completed");
  }
});`}
                    </SlideCode>
                </SlideScreen>

                {/* Cas d'usage délégation */}
                <SlideScreen title="8.1 - Quand Utiliser la Délégation ?">
                    <SlideNote>
                        {`- La délégation n'est pas toujours nécessaire, mais très utile dans ces cas.
- Pour un seul bouton, pas besoin de délégation - attachez directement l'écouteur.
- Dès qu'il y a répétition ou ajout dynamique, pensez délégation !`}
                    </SlideNote>

                    <SlideList>
                        <SlideListItem>
                            <strong>Éléments dynamiques</strong> : Listes ajoutées/supprimées (commentaires, tâches,
                            notifications)
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Grand nombre d'éléments</strong> : Tableaux, listes longues (inefficace d'attacher
                            un écouteur à chacun)
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Structure répétitive</strong> : Grilles de cartes, galeries d'images, menus de
                            navigation
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Performance</strong> : Réduit la consommation mémoire et améliore la vitesse
                        </SlideListItem>
                    </SlideList>
                </SlideScreen>
            </SlidesScreen>
        </div>
    );
}