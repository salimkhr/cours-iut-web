import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeWithPreviewCard, {CodePanel, PreviewPanel} from "@/components/Cards/CodeWithPreviewCard";
import ClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ClickableBox";
import CodeCard from "@/components/Cards/CodeCard";
import ColorClickableBox from "@/cours/javascript/2-les-evenements/Exemple/ColorClickableBox";
import MouseTrackerBox from "@/cours/javascript/2-les-evenements/Exemple/MouseTrackerBox";
import ClickCounterBox from "@/cours/javascript/2-les-evenements/Exemple/ClickCounterBox";
import KeyPressBox from "@/cours/javascript/2-les-evenements/Exemple/KeyPressBox";
import FormBox from "@/cours/javascript/2-les-evenements/Exemple/FormBox";
import CoursePrerequisites from "@/components/CoursePrerequisites";

export default function Cours() {
    return (
        <article>
            <CoursePrerequisites>
                <Text>
                    <strong>Sélectionner un élément DOM</strong> — <Code>getElementById</Code> et{" "}
                    <Code>querySelector</Code> retournent l&apos;élément HTML ciblé, sur lequel on
                    pourra attacher des actions.
                </Text>
                <CodeCard language="javascript">
                    {`const btn = document.getElementById("mon-bouton");
const titre = document.querySelector(".titre");`}
                </CodeCard>

                <Text>
                    <strong>Modifier le contenu d&apos;un élément</strong> — <Code>textContent</Code>{" "}
                    remplace le texte, <Code>innerHTML</Code> injecte du HTML, <Code>classList</Code>{" "}
                    ajoute ou retire des classes CSS.
                </Text>
                <CodeCard language="javascript">
                    {`element.textContent = "Nouveau texte";
element.classList.add("actif");
element.classList.remove("cache");`}
                </CodeCard>

                <Text>
                    <strong>Les fonctions fléchées</strong> sont une syntaxe concise pour déclarer une
                    fonction. Elles sont fréquemment utilisées comme fonctions de rappel.
                </Text>
                <CodeCard language="javascript">
                    {`const direBonjour = (nom) => {
    console.log("Bonjour " + nom);
};`}
                </CodeCard>
            </CoursePrerequisites>

            <section>
                <Heading level={2}>A- Qu&apos;est-ce qu&apos;un événement ?</Heading>
                <Text>
                    Un événement est une action ou une occurrence qui se produit dans le navigateur,
                    comme un clic de souris, une frappe au clavier, le chargement d&apos;une page, ou le
                    défilement d&apos;un élément. JavaScript permet de détecter ces événements et d&apos;y
                    réagir en exécutant du code spécifique.
                </Text>
            </section>

            <section>
                <Heading level={2}>B- Écouteurs d&apos;événements</Heading>
                <Text>
                    Les écouteurs d&apos;événements permettent d&apos;attendre et de répondre à des actions
                    spécifiques. Ils constituent le mécanisme principal pour rendre vos pages web
                    interactives.
                </Text>

                <Heading level={3}>1. Ajouter un écouteur avec addEventListener</Heading>
                <CodeWithPreviewCard language="javascript">
                    <CodePanel>
                        {`// Sélectionner un élément et lui ajouter un écouteur
const button = document.getElementById("myButton");

button.addEventListener("click", () => {
    alert("Bouton cliqué !");
});

// Avec une fonction nommée
function handleClick() {
    alert("Clic détecté");
}

button.addEventListener("click", handleClick);`}
                    </CodePanel>
                    <PreviewPanel>
                        <ClickableBox/>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <List>
                    <ListItem>
                        <Code>addEventListener(type, fonction)</Code> : attache un gestionnaire
                        d&apos;événement à un élément.
                    </ListItem>
                    <ListItem>
                        <strong>Premier paramètre</strong> : le type d&apos;événement (ex.{" "}
                        <Code>&quot;click&quot;</Code>, <Code>&quot;keydown&quot;</Code>).
                    </ListItem>
                    <ListItem>
                        <strong>Deuxième paramètre</strong> : la fonction à exécuter lorsque
                        l&apos;événement se produit.
                    </ListItem>
                </List>

                <Heading level={3}>2. Supprimer un écouteur avec removeEventListener</Heading>
                <CodeCard language="javascript">
                    {`const button = document.getElementById("myButton");

// Définir la fonction séparément pour pouvoir la supprimer
const logClick = () => console.log("Clic détecté");

// Ajouter l'écouteur
button.addEventListener("click", logClick);

// Supprimer l'écouteur
button.removeEventListener("click", logClick);

// ⚠️ Attention : ceci ne fonctionnera PAS
button.addEventListener("click", () => console.log("Test"));
button.removeEventListener("click", () => console.log("Test"));
// Les fonctions anonymes sont différentes à chaque fois`}
                </CodeCard>

                <Text>
                    Pour pouvoir supprimer un écouteur, vous devez utiliser la même référence de fonction
                    que celle utilisée lors de l&apos;ajout. C&apos;est pourquoi il faut définir la fonction
                    dans une variable ou utiliser une fonction nommée.
                </Text>
            </section>

            <section>
                <Heading level={2}>C- Types d&apos;événements courants</Heading>
                <Text>
                    JavaScript supporte une large variété d&apos;événements organisés par catégories selon
                    leur contexte d&apos;utilisation.
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
                            <TableCell>
                                Déclenché lorsque le HTML de la page est entièrement chargé et analysé,
                                mais avant que les ressources externes (images, styles) soient complètement
                                chargées. Idéal pour commencer à manipuler le DOM.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>load</Code></TableCell>
                            <TableCell>
                                Déclenché lorsque la page entière, y compris toutes les ressources (images,
                                feuilles de style, scripts), est complètement chargée.
                            </TableCell>
                        </TableRow>

                        {/* Événements de souris */}
                        <TableRow>
                            <TableCell rowSpan={6}><strong>Souris</strong></TableCell>
                            <TableCell><Code>click</Code></TableCell>
                            <TableCell>Déclenché lors d&apos;un clic.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>dblclick</Code></TableCell>
                            <TableCell>Déclenché lors d&apos;un double clic.</TableCell>
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
                            <TableCell>Appui ou relâchement d&apos;un bouton de souris.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>contextmenu</Code></TableCell>
                            <TableCell>
                                Déclenché lorsqu&apos;un clic droit affiche le menu contextuel.
                            </TableCell>
                        </TableRow>

                        {/* Événements de clavier */}
                        <TableRow>
                            <TableCell rowSpan={2}><strong>Clavier</strong></TableCell>
                            <TableCell><Code>keydown</Code> / <Code>keyup</Code></TableCell>
                            <TableCell>Appui ou relâchement d&apos;une touche du clavier.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>input</Code></TableCell>
                            <TableCell>
                                Déclenché lorsque l&apos;utilisateur saisit une valeur dans un champ de
                                texte.
                            </TableCell>
                        </TableRow>

                        {/* Événements de formulaire */}
                        <TableRow>
                            <TableCell rowSpan={3}><strong>Formulaire</strong></TableCell>
                            <TableCell><Code>submit</Code></TableCell>
                            <TableCell>Soumission d&apos;un formulaire.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>change</Code></TableCell>
                            <TableCell>
                                Déclenché lorsque la valeur d&apos;un élément de formulaire est modifiée.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>focus</Code> / <Code>blur</Code></TableCell>
                            <TableCell>
                                Événements déclenchés lorsque l&apos;élément reçoit ou perd le focus.
                            </TableCell>
                        </TableRow>

                        {/* Événements liés à la fenêtre */}
                        <TableRow>
                            <TableCell rowSpan={4}><strong>Fenêtre</strong></TableCell>
                            <TableCell><Code>resize</Code></TableCell>
                            <TableCell>Changement de la taille de la fenêtre.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>scroll</Code></TableCell>
                            <TableCell>Déclenché lorsqu&apos;un élément est défilé.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>load</Code></TableCell>
                            <TableCell>
                                Déclenché lorsque la page ou une ressource (image, script) est entièrement
                                chargée.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>error</Code></TableCell>
                            <TableCell>
                                Déclenché lorsqu&apos;une erreur survient lors du chargement d&apos;une
                                ressource.
                            </TableCell>
                        </TableRow>

                        {/* Événements de glisser-déposer */}
                        <TableRow>
                            <TableCell rowSpan={3}><strong>Glisser-déposer</strong></TableCell>
                            <TableCell><Code>dragstart</Code></TableCell>
                            <TableCell>Début d&apos;un glissement d&apos;élément.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>dragend</Code></TableCell>
                            <TableCell>Fin d&apos;un glissement d&apos;élément.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>drop</Code></TableCell>
                            <TableCell>Déclenché lorsqu&apos;un élément glissé est déposé.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>

            <section>
                <Heading level={2}>D- L&apos;objet Event et ses propriétés</Heading>
                <Text>
                    Lorsqu&apos;un événement est déclenché, JavaScript crée automatiquement un objet
                    contenant des informations détaillées sur cet événement. Cet objet est passé en
                    paramètre à la fonction gestionnaire.
                </Text>

                <CodeCard language="javascript">
                    {`// L'objet event est automatiquement passé à la fonction
document.addEventListener("click", (event) => {
    console.log("Objet événement :", event);
    console.log("Type d'événement :", event.type);
    console.log("Élément cliqué :", event.target);
});`}
                </CodeCard>

                <Heading level={3}>1. Propriétés communes</Heading>
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
                            <TableCell>
                                Le type de l&apos;événement déclenché (par exemple{" "}
                                <Code>&quot;click&quot;</Code>, <Code>&quot;keydown&quot;</Code>).
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>target</Code></TableCell>
                            <TableCell>
                                L&apos;élément sur lequel l&apos;événement a été déclenché.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>currentTarget</Code></TableCell>
                            <TableCell>L&apos;élément auquel le gestionnaire est attaché.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>timeStamp</Code></TableCell>
                            <TableCell>
                                L&apos;heure, en millisecondes, à laquelle l&apos;événement a été créé.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>2. Propriétés spécifiques aux événements de souris</Heading>
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
                            <TableCell>
                                Position horizontale et verticale de la souris dans la fenêtre lors
                                d&apos;un événement de souris.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>button</Code></TableCell>
                            <TableCell>
                                Indique quel bouton de la souris a été utilisé (0 = gauche, 1 = milieu,
                                2 = droit).
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>3. Propriétés spécifiques aux événements de clavier</Heading>
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
                            <TableCell>
                                La touche appuyée, pour un événement de clavier (par exemple{" "}
                                <Code>&quot;a&quot;</Code>, <Code>&quot;Enter&quot;</Code>).
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <Code>ctrlKey</Code>, <Code>shiftKey</Code>, <Code>altKey</Code>,{" "}
                                <Code>metaKey</Code>
                            </TableCell>
                            <TableCell>
                                Valeurs booléennes qui indiquent si des touches spéciales (comme{" "}
                                <Code>Ctrl</Code> ou <Code>Shift</Code>) étaient pressées au moment de
                                l&apos;événement.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <CodeCard language="javascript">
                    {`// Exemple : utilisation des propriétés d'un événement
document.addEventListener("click", (event) => {
    console.log("Type d'événement :", event.type);          // 'click'
    console.log("Cible de l'événement :", event.target);    // élément cliqué
    console.log("Position de la souris :", event.clientX, event.clientY);
});

// Exemple : événement clavier
document.addEventListener("keydown", (event) => {
    console.log("Touche pressée :", event.key);             // ex. 'a'
    console.log("Ctrl appuyé ?", event.ctrlKey);            // true si Ctrl est appuyé
});`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>E- Exemples pratiques</Heading>

                <Heading level={3}>1. Changer la couleur d&apos;un élément au clic</Heading>
                <CodeWithPreviewCard language="javascript">
                    <CodePanel>
                        {`const box = document.querySelector(".box");

box.addEventListener("click", () => {
    box.style.backgroundColor = "lightblue";
});`}
                    </CodePanel>
                    <PreviewPanel>
                        <ColorClickableBox/>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Heading level={3}>2. Afficher la position de la souris</Heading>
                <CodeWithPreviewCard language="javascript">
                    <CodePanel>
                        {`const display = document.querySelector("#position");

document.addEventListener("mousemove", (event) => {
    display.textContent = \`X: \${event.clientX}, Y: \${event.clientY}\`;
});`}
                    </CodePanel>
                    <PreviewPanel>
                        <MouseTrackerBox/>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Heading level={3}>3. Détecter quelle touche est pressée</Heading>
                <CodeWithPreviewCard language="javascript">
                    <CodePanel>
                        {`const pressedKeysP = document.getElementById("pressedKeys");

window.addEventListener("keydown", (event) => {
    const keys = [];

    if (event.ctrlKey)  keys.push("Ctrl");
    if (event.shiftKey) keys.push("Shift");
    if (event.altKey)   keys.push("Alt");
    if (event.metaKey)  keys.push("Meta"); // Command sur Mac

    if (!["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
        keys.push(event.key);
    }

    if (keys.length > 0) {
        pressedKeysP.textContent = "Touche(s) pressée(s) : " + keys.join(" + ");
    }
});`}
                    </CodePanel>
                    <PreviewPanel>
                        <KeyPressBox/>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Heading level={3}>4. Validation simple d&apos;un formulaire</Heading>
                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<form>
    <label for="username">Nom d'utilisateur :</label>
    <input type="text" id="username" />
    <button type="submit">Valider</button>
</form>

<p id="message"></p>

<script>
    const form = document.querySelector("form");
    const input = document.querySelector("#username");
    const message = document.getElementById("message");

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Empêche la soumission par défaut

        if (input.value.length < 3) {
            message.textContent = "Le nom d'utilisateur doit contenir au moins 3 caractères";
            message.classList.add("error");
        } else {
            message.textContent = "Formulaire valide !";
            message.classList.remove("error");
        }
    });
</script>`}
                    </CodePanel>
                    <PreviewPanel>
                        <FormBox/>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Heading level={3}>5. Compteur de clics</Heading>
                <CodeWithPreviewCard language="javascript">
                    <CodePanel>
                        {`const button = document.querySelector("#counter");
let count = 0;

button.addEventListener("click", () => {
    count++;
    button.textContent = \`Cliqué \${count} fois\`;
});`}
                    </CodePanel>
                    <PreviewPanel>
                        <ClickCounterBox/>
                    </PreviewPanel>
                </CodeWithPreviewCard>
            </section>
        </article>
    );
}
