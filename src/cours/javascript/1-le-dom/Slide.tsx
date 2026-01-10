import SlidesScreen from "@/components/SlidesScreen";
import SlideScreen from "@/components/SlideScreen";
import CodeCard from "@/components/Cards/CodeCard";

export default function Slide() {
    return (
        <SlidesScreen>
            {/* Slide 1 */}
            <SlideScreen title="Le DOM">
                <h2>Document Object Model</h2>
            </SlideScreen>

            {/* Slide 2 */}
            <SlideScreen title="Recherche par id">
                <CodeCard language="html" filename="index.html">
                    {`<body>
  <div id="myId">
    Contenu de mon élément
  </div>
  <script>
    // Sélectionner un élément par son ID (unique)
    const element = document.getElementById("myId");
    element.innerHTML = 'Nouveau Contenu de mon élément';
  </script>
</body>`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 3 */}
            <SlideScreen title="Recherche par class">
                <CodeCard language="html" filename="index.html">
                    {`<body>
  <ul>
    <li class="titre">a</li>
    <li class="titre">b</li>
    <li class="titre">c</li>
    <li class="titre">d</li>
  </ul>
  <script>
    // Sélectionner les éléments par classe
    const elements = document.getElementsByClassName("titre");
    elements[0].innerHTML = 'Nouveau Contenu de mon élément';
  </script>
</body>`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 4 */}
            <SlideScreen title="Recherche par tag">
                <CodeCard language="html" filename="index.html">
                    {`<body>
  <div class="titre">
    Contenu de mon élément
  </div>
  <script>
    // Sélectionner les éléments par tag
    const elements = document.getElementsByTagName("div");
    elements[0].innerHTML = 'Nouveau Contenu de mon élément';
  </script>
</body>`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 5 */}
            <SlideScreen title="Recherche comme en CSS">
                <CodeCard language="html" filename="index.html">
                    {`<body>
  <div class="titre">
    Contenu de mon élément
  </div>
  <script>
    // Sélectionner le premier élément correspondant à un sélecteur CSS
    const firstElement = document.querySelector(".titre");

    // Sélectionner tous les éléments correspondant à un sélecteur CSS
    const allElements = document.querySelectorAll(".titre");
  </script>
</body>`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 6 */}
            <SlideScreen title="Manipulation des éléments">
                <CodeCard language="javascript" filename="script.js">
                    {`// Modifier le contenu textuel
element.textContent = "Nouveau contenu";

// Modifier un attribut (par exemple, une classe CSS)
element.setAttribute("required", true);

// Ajouter du style en ligne
element.style.color = "red";

// Remplace tout le contenu de l'élément par HTML
element.innerHTML = "<strong>Ceci est du texte avec des balises HTML.</strong>"

// Modifier la classe de l'élément
element.classList.add("nouvelleClasse");
element.classList.remove("ancienneClasse");
element.classList.toggle("toggleClasse");`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 7 */}
            <SlideScreen title="Création et ajout à la fin">
                <CodeCard language="javascript" filename="script.js">
                    {`// Crée un nouvel élément <p>
const newElement = document.createElement("p");

// Ajoute du texte à cet élément
newElement.textContent = "Ceci est un paragraphe.";

// Ajoute cet élément à la fin du body
document.body.appendChild(newElement);`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 8 */}
            <SlideScreen title="Création et ajout au début">
                <CodeCard language="javascript" filename="script.js">
                    {`// Crée un nouvel élément <p>
const anotherElement = document.createElement("p");

// Ajoute du texte à cet élément
anotherElement.textContent = "Ceci est un paragraphe au début.";

// Ajoute cet élément au début du body
document.body.prepend(anotherElement);`}
                </CodeCard>
            </SlideScreen>

            {/* Slide 9 */}
            <SlideScreen title="Création et ajout avant un autre">
                <CodeCard language="javascript" filename="script.js">
                    {`// Sélectionner un élément existant
const referenceElement = document.getElementById("someId");

// Crée un nouvel élément <p>
const newElementBefore = document.createElement("p");

// Ajoute du texte à cet élément
newElementBefore.textContent = "Ceci est un paragraphe avant un autre élément.";

// Ajoute cet élément avant le référencé
document.body.insertBefore(newElementBefore, referenceElement);`}
                </CodeCard>
            </SlideScreen>
        </SlidesScreen>
    );
}