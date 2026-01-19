import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text"
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export default function Cours() {
    return (
        <article>
            <section>

                <Heading level={2}>1. Qu'est-ce qu'un événement ?</Heading>
                <Text>
                    Un événement est une action ou une occurrence qui se produit dans le navigateur, comme un clic de souris,
                    une frappe au clavier, le chargement d'une page, ou le défilement d'un élément. JavaScript permet de
                    détecter ces événements et d'y réagir en exécutant du code spécifique.
                </Text>
            </section>
            <section>

                <Heading level={2}>2. Écouteurs d'événements</Heading>

                <Text>
                    Les écouteurs d'événements permettent d'attendre et de répondre à des actions spécifiques.
                    Ils constituent le mécanisme principal pour rendre vos pages web interactives.
                </Text>

                <Heading level={3}>2.1. Ajouter un écouteur avec addEventListener</Heading>

                <CodeCard language="javascript">
                    {`// Sélectionner un élément et lui ajouter un écouteur
const button = document.getElementById("myButton");

button.addEventListener("click", () => {
  console.log("Bouton cliqué !");
});

// Avec une fonction nommée
function handleClick() {
  console.log("Clic détecté");
}

button.addEventListener("click", handleClick);`}
                </CodeCard>

                <List>
                    <ListItem><Code>addEventListener(type, fonction)</Code> : Attache un gestionnaire d'événement à un élément.</ListItem>
                    <ListItem><strong>Premier paramètre</strong> : Le type d'événement (ex. "click", "keydown").</ListItem>
                    <ListItem><strong>Deuxième paramètre</strong> : La fonction à exécuter lorsque l'événement se produit.</ListItem>
                </List>

                <Heading level={3}>2.2. Supprimer un écouteur avec removeEventListener</Heading>

                <CodeCard language="javascript">
                    {`const button = document.getElementById("myButton");

// Définir la fonction séparément pour pouvoir la supprimer
const logClick = () => console.log("Clic détecté");

// Ajouter l'écouteur
button.addEventListener("click", logClick);

// Supprimer l'écouteur
button.removeEventListener("click", logClick);

// ⚠️ Attention : Ceci ne fonctionnera PAS
button.addEventListener("click", () => console.log("Test"));
button.removeEventListener("click", () => console.log("Test")); 
// Les fonctions anonymes sont différentes à chaque fois`}
                </CodeCard>

                <Text>
                    Pour pouvoir supprimer un écouteur, vous devez utiliser la même référence de fonction que celle
                    utilisée lors de l'ajout. C'est pourquoi il faut définir la fonction dans une variable ou
                    utiliser une fonction nommée.
                </Text>

                <Heading level={3}>2.3. Options avancées d'addEventListener</Heading>

                <CodeCard language="javascript">
                    {`const button = document.getElementById("myButton");

// Écouteur qui ne s'exécute qu'une seule fois
button.addEventListener("click", () => {
  console.log("Premier clic uniquement");
}, { once: true });

// Écouteur passif (améliore les performances pour le scroll)
document.addEventListener("scroll", () => {
  console.log("Défilement détecté");
}, { passive: true });`}
                </CodeCard>

                <List>
                    <ListItem><Code>once: true</Code> : L'écouteur est automatiquement supprimé après la première exécution.</ListItem>
                    <ListItem><Code>passive: true</Code> : Indique que la fonction ne bloquera pas le défilement (utile pour les performances).</ListItem>
                </List>
            </section>
            <section>
                <Heading level={2}>3. Types d'événements courants</Heading>

                <Text>
                    JavaScript supporte une large variété d'événements organisés par catégories selon leur contexte d'utilisation.
                </Text>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Événement</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Événements de chargement */}
                        <TableRow>
                            <TableCell rowSpan={2}><strong>Chargement</strong></TableCell>
                            <TableCell><Code>DOMContentLoaded</Code></TableCell>
                            <TableCell>Déclenché lorsque le HTML de la page est entièrement chargé et analysé, mais avant
                                que les ressources externes (images, styles) soient complètement chargées. Idéal pour commencer
                                à manipuler le DOM.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>load</Code></TableCell>
                            <TableCell>Déclenché lorsque la page entière, y compris toutes les ressources (images, feuilles
                                de style, scripts), est complètement chargée.</TableCell>
                        </TableRow>

                        {/* Événements de souris */}
                        <TableRow>
                            <TableCell rowSpan={6}><strong>Souris</strong></TableCell>
                            <TableCell><Code>click</Code></TableCell>
                            <TableCell>Déclenché lors d'un clic.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>dblclick</Code></TableCell>
                            <TableCell>Déclenché lors d'un double clic.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>mouseenter</Code> / <Code>mouseleave</Code></TableCell>
                            <TableCell>Survol ou sortie de la souris.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>mousemove</Code></TableCell>
                            <TableCell>Déclenché lorsque la souris est déplacée.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>mousedown</Code> / <Code>mouseup</Code></TableCell>
                            <TableCell>Appui ou relâchement d'un bouton de souris.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>contextmenu</Code></TableCell>
                            <TableCell>Déclenché lorsqu'un clic droit affiche le menu contextuel.</TableCell>
                        </TableRow>

                        {/* Événements de clavier */}
                        <TableRow>
                            <TableCell rowSpan={2}><strong>Clavier</strong></TableCell>
                            <TableCell><Code>keydown</Code> / <Code>keyup</Code></TableCell>
                            <TableCell>Appui ou relâchement d'une touche du clavier.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>input</Code></TableCell>
                            <TableCell>Déclenché lorsque l'utilisateur saisit une valeur dans un champ de texte.</TableCell>
                        </TableRow>

                        {/* Événements de formulaire */}
                        <TableRow>
                            <TableCell rowSpan={3}><strong>Formulaire</strong></TableCell>
                            <TableCell><Code>submit</Code></TableCell>
                            <TableCell>Soumission d'un formulaire.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>change</Code></TableCell>
                            <TableCell>Déclenché lorsque la valeur d'un élément de formulaire est modifiée.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>focus</Code> / <Code>blur</Code></TableCell>
                            <TableCell>Événements déclenchés lorsque l'élément reçoit ou perd le focus.</TableCell>
                        </TableRow>

                        {/* Événements liés à la fenêtre */}
                        <TableRow>
                            <TableCell rowSpan={4}><strong>Fenêtre</strong></TableCell>
                            <TableCell><Code>resize</Code></TableCell>
                            <TableCell>Changement de la taille de la fenêtre.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>scroll</Code></TableCell>
                            <TableCell>Déclenché lorsqu'un élément est défilé.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>load</Code></TableCell>
                            <TableCell>Déclenché lorsque la page ou une ressource (image, script) est entièrement chargée.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>error</Code></TableCell>
                            <TableCell>Déclenché lorsqu'une erreur survient lors du chargement d'une ressource.</TableCell>
                        </TableRow>

                        {/* Événements de glisser-déposer */}
                        <TableRow>
                            <TableCell rowSpan={3}><strong>Glisser-Déposer</strong></TableCell>
                            <TableCell><Code>dragstart</Code></TableCell>
                            <TableCell>Début d'un glissement d'élément.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>dragend</Code></TableCell>
                            <TableCell>Fin d'un glissement d'élément.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>drop</Code></TableCell>
                            <TableCell>Déclenché lorsqu'un élément glissé est déposé.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            <section>
                <Heading level={2}>4. L'objet Event et ses propriétés</Heading>

                <Text>
                    Lorsqu'un événement est déclenché, JavaScript crée automatiquement un objet contenant des informations
                    détaillées sur cet événement. Cet objet est passé en paramètre à la fonction gestionnaire.
                </Text>

                <CodeCard language="javascript">
                    {`// L'objet event est automatiquement passé à la fonction
document.addEventListener("click", (event) => {
  console.log("Objet événement :", event);
  console.log("Type d'événement :", event.type);
  console.log("Élément cliqué :", event.target);
});`}
                </CodeCard>

                <Heading level={3}>4.1. Propriétés communes</Heading>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Propriété</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>type</Code></TableCell>
                            <TableCell>Le type de l'événement déclenché (par exemple : <Code>"click"</Code>, <Code>"keydown"</Code>).</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>target</Code></TableCell>
                            <TableCell>L'élément sur lequel l'événement a été déclenché.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>currentTarget</Code></TableCell>
                            <TableCell>L'élément auquel le gestionnaire est attaché.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>timeStamp</Code></TableCell>
                            <TableCell>L'heure, en millisecondes, à laquelle l'événement a été créé.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>4.2. Propriétés spécifiques aux événements de souris</Heading>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Propriété</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>clientX</Code> / <Code>clientY</Code></TableCell>
                            <TableCell>Position horizontale et verticale de la souris dans la fenêtre lors d'un événement de souris.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>button</Code></TableCell>
                            <TableCell>Indique quel bouton de la souris a été utilisé (0 = gauche, 1 = milieu, 2 = droit).</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>4.3. Propriétés spécifiques aux événements de clavier</Heading>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Propriété</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>key</Code></TableCell>
                            <TableCell>La touche appuyée, pour un événement de clavier (par exemple : <Code>"a"</Code>, <Code>"Enter"</Code>).</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>ctrlKey</Code>, <Code>shiftKey</Code>, <Code>altKey</Code>, <Code>metaKey</Code></TableCell>
                            <TableCell>Valeurs booléennes qui indiquent si des touches spéciales (comme <Code>Ctrl</Code> ou <Code>Shift</Code>) étaient pressées au moment de l'événement.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <CodeCard language="javascript">
                    {`// Exemple : Utilisation des propriétés d'un événement
document.addEventListener("click", (event) => {
  console.log("Type d'événement :", event.type); // Affiche 'click'
  console.log("Cible de l'événement :", event.target); // Affiche l'élément cliqué
  console.log("Position de la souris :", event.clientX, event.clientY); // Coordonnées
});

// Exemple : Événement clavier
document.addEventListener("keydown", (event) => {
  console.log("Touche pressée :", event.key); // Affiche la touche (par exemple 'a')
  console.log("Ctrl appuyé ?", event.ctrlKey); // Affiche true si Ctrl est appuyé
});`}
                </CodeCard>
            </section>
            <section>
                <Heading level={2}>5. Exemples pratiques</Heading>

                <Heading level={3}>5.1. Changer la couleur d'un élément au clic</Heading>

                <CodeCard language="javascript">
                    {`const box = document.querySelector(".box");

box.addEventListener("click", () => {
  box.style.backgroundColor = "lightblue";
});`}
                </CodeCard>

                <Heading level={3}>5.2. Afficher la position de la souris</Heading>

                <CodeCard language="javascript">
                    {`const display = document.querySelector("#position");

document.addEventListener("mousemove", (event) => {
  display.textContent = \`X: \${event.clientX}, Y: \${event.clientY}\`;
});`}
                </CodeCard>

                <Heading level={3}>5.3. Détecter quelle touche est pressée</Heading>

                <CodeCard language="javascript">
                    {`document.addEventListener("keydown", (event) => {
  console.log("Vous avez pressé :", event.key);
  
  if (event.key === "Enter") {
    console.log("Touche Entrée détectée !");
  }
});`}
                </CodeCard>

                <Heading level={3}>5.4. Validation simple d'un formulaire</Heading>

                <CodeCard language="javascript">
                    {`const form = document.querySelector("form");
const input = document.querySelector("#username");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Empêche la soumission par défaut
  
  if (input.value.length < 3) {
    alert("Le nom d'utilisateur doit contenir au moins 3 caractères");
  } else {
    console.log("Formulaire valide !");
  }
});`}
                </CodeCard>

                <Heading level={3}>5.5. Compteur de clics</Heading>

                <CodeCard language="javascript">
                    {`const button = document.querySelector("#counter");
let count = 0;

button.addEventListener("click", () => {
  count++;
  button.textContent = \`Cliqué \${count} fois\`;
});`}
                </CodeCard>
            </section>
        </article>
    );
}