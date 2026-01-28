import Text from "@/components/ui/Text"
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import DiagramCard from "@/components/Cards/DiagramCard";

export default function Cours() {
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

    console.log("📊 Chart propagationDiagram:", propagationDiagram);

    return (
        <article>
            <section>
                <Heading level={2}>Propagation des Événements</Heading>

                <Heading level={3}>1. La Propagation des Événements</Heading>
                <Text>
                    Lorsqu&apos;un événement est déclenché sur un élément du DOM, il traverse plusieurs phases avant
                    d&apos;être
                    complètement traité. Ces phases définissent le parcours de l&apos;événement à travers l&apos;arbre
                    DOM :
                </Text>

                <DiagramCard chart={propagationDiagram} header="Parcours complet d'un événement dans le DOM"/>

                <List>
                    <ListItem>
                        <strong>Phase de capture</strong> : L&apos;événement commence son parcours à partir de
                        l&apos;élément racine
                        du document
                        (<code>document</code>) et descend dans l&apos;arbre DOM jusqu&apos;à l&apos;élément cible.
                        Pendant cette phase, les gestionnaires enregistrés avec le paramètre <code>capture:
                        true</code> seront exécutés.
                    </ListItem>
                    <ListItem>
                        <strong>Phase de cible</strong> : L&apos;événement atteint l&apos;élément sur lequel il a été
                        déclenché
                        (l&apos;élément cible).
                        Les gestionnaires d&apos;événements enregistrés directement sur cet élément sont exécutés (si
                        applicable).
                    </ListItem>
                    <ListItem>
                        <strong>Phase de bouillonnement</strong> : Une fois que l&apos;événement a atteint
                        l&apos;élément
                        cible, il
                        commence à
                        &quot;bouillonner&quot; en remontant à travers l&apos;arbre DOM, en passant par ses ancêtres
                        directs
                        jusqu&apos;à
                        l&apos;élément racine.
                        Pendant cette phase, les gestionnaires enregistrés sans le paramètre <Code>capture:
                        true</Code> sont
                        exécutés.
                    </ListItem>
                </List>

                <DiagramCard chart={eventPhasesDiagram} header="Séquence des phases d'événement"/>

                <Text>
                    Par défaut, les gestionnaires d&apos;événements sont déclenchés pendant la phase de bouillonnement.
                    Cela
                    signifie que,
                    si un gestionnaire est ajouté à un parent d&apos;un élément cible, ce gestionnaire sera exécuté
                    lorsque
                    l&apos;événement
                    remontera de l&apos;élément cible à travers ses ancêtres.
                </Text>

                <CodeCard language="javascript">
                    {`// Exemple de propagation d'événements
const parent = document.getElementById("parent");
const child = document.getElementById("child");

// Ajout de gestionnaires d'événements
parent.addEventListener("click", () => console.log("Clic sur le parent (bouillonnement)"));
child.addEventListener("click", () => console.log("Clic sur l'enfant"));

// Cliquez sur l'élément enfant
// Résultat dans la console :
// - "Clic sur l'enfant" (Phase de cible)
// - "Clic sur le parent (bouillonnement)" (Phase de bouillonnement)
`}
                </CodeCard>

                <Heading level={3}>2. Différence entre Phase de Capture et Phase de Bouillonnement</Heading>
                <Text>
                    Par défaut, les gestionnaires d&apos;événements s&apos;exécutent dans la phase de bouillonnement.
                    Toutefois,
                    il
                    est possible
                    d&apos;intercepter un événement pendant la phase de capture en passant un troisième argument
                    (<code>capture: true</code>) ou <code>true</code> lors de l&apos;ajout d&apos;un gestionnaire
                    d&apos;événements.
                </Text>

                <CodeCard language="javascript">
                    {`// Ajout de gestionnaires d'événements pour la phase de capture
parent.addEventListener("click", () => console.log("Clic capturé sur le parent"), true);
child.addEventListener("click", () => console.log("Clic capturé sur l'enfant"), true);

// Cliquez sur l'élément enfant
// Résultat dans la console :
// - "Clic capturé sur le parent" (Phase de capture)
// - "Clic capturé sur l'enfant" (Phase de capture)
// - "Clic sur l'enfant" (Phase de cible)
// - "Clic sur le parent (bouillonnement)" (Phase de bouillonnement)
`}
                </CodeCard>

                <Heading level={3}>3. Arrêter la Propagation des Événements</Heading>
                <Text>
                    Si vous souhaitez empêcher un événement de continuer à se propager, vous pouvez utiliser la méthode
                    <code>event.stopPropagation()</code>. Cela arrête l&apos;événement au niveau actuel et empêche son
                    passage
                    aux phases suivantes (que ce soit en capture ou en bouillonnement).
                </Text>

                <CodeCard language="javascript">
                    {`// Exemple d'arrêt de propagation
child.addEventListener("click", (event) => {
    console.log("Clic sur l'enfant");
    event.stopPropagation(); // Arrête la propagation ici
});

parent.addEventListener("click", () => console.log("Clic sur le parent"));

// Cliquez sur l'élément enfant
// Résultat dans la console :
// - "Clic sur l'enfant" (Phase de cible)
// - Le clic sur le parent n'est pas enregistré car la propagation est arrêtée
`}
                </CodeCard>

                <Heading level={3}>4. Pourquoi Utiliser la Phase de Bouillonnement ?</Heading>
                <Text>
                    La phase de bouillonnement est souvent utilisée pour une fonctionnalité appelée délégation
                    d&apos;événements.
                    Elle permet d&apos;attacher un gestionnaire d&apos;événements à un parent pour gérer les événements
                    de
                    ses
                    enfants,
                    même si ces derniers sont ajoutés dynamiquement. Cela réduit le nombre de gestionnaires nécessaires
                    et
                    améliore
                    les performances.
                </Text>
            </section>
            <section>
                <Heading level={2}>La Délégation d&apos;Événements</Heading>

                <Text>
                    La délégation consiste à attacher un écouteur d&apos;événement à un parent commun pour gérer
                    plusieurs
                    enfants, souvent créés dynamiquement. Cela améliore les performances et simplifie le code.
                </Text>

                <DiagramCard chart={delegationDiagram} header="Principe de la délégation d'événements"/>

                <CodeCard language="javascript">
                    {`// Exemple de délégation d'événements
const list = document.getElementById("list"); // un <ul> sur la page

list.addEventListener("click", (event) => {
    if (event.target.tagName === "LI") {
        console.log("Élément cliqué :", event.target.textContent);
    }
});

// Ajoutez dynamiquement des éléments à la liste
data.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
});`}
                </CodeCard>

                <List>
                    <ListItem>Utilisez la propriété <Code>event.target</Code> pour identifier l&apos;élément
                        cible.</ListItem>
                    <ListItem>La délégation réduit le nombre d&apos;écouteurs attachés.</ListItem>
                    <ListItem>Elle fonctionne automatiquement pour les éléments ajoutés dynamiquement après
                        l&apos;attachement de l&apos;écouteur.</ListItem>
                </List>

                <Heading level={3}>1. Parcours Père/Fils dans le DOM</Heading>
                <Text>
                    Dans le DOM, vous pouvez naviguer entre un élément parent et ses éléments enfants :
                </Text>

                <List>
                    <ListItem><strong>parentElement</strong> : Permet d&apos;accéder à l&apos;élément parent
                        direct.</ListItem>
                    <ListItem><strong>children</strong> : Permet d&apos;accéder à tous les éléments enfants
                        directs.</ListItem>
                </List>

                <Text>
                    <strong>closest()</strong> : Cette méthode permet de trouver l&apos;ancêtre le plus proche
                    correspondant à un sélecteur CSS. La méthode remonte dans l&apos;arbre DOM (en commençant par
                    l&apos;élément lui-même) pour trouver le
                    premier ancêtre correspondant au sélecteur. Si aucun ancêtre ne correspond, elle
                    retourne <code>null</code>.
                </Text>

                <DiagramCard chart={closestDiagram} header="Navigation dans le DOM avec closest() et parentElement"/>

                <CodeCard language="javascript">
                    {`// Exemple avec closest()
const child = document.getElementById("child");

// Trouver l'élément parent <div> le plus proche
const parentDiv = child.closest("div");

if (parentDiv) {
    console.log("Parent <div> trouvé : ", parentDiv);
} else {
    console.log("Aucun parent <div> trouvé.");
}

// Trouver un ancêtre avec une classe spécifique
const container = child.closest(".container");`}
                </CodeCard>

                <Heading level={3}>2. La méthode preventDefault</Heading>
                <Text>
                    La méthode <Code>preventDefault()</Code> empêche le comportement par défaut d&apos;un événement
                    (comme
                    la
                    soumission d&apos;un formulaire ou le suivi d&apos;un lien). Elle n&apos;arrête pas la propagation
                    de l&apos;événement, contrairement à <Code>stopPropagation()</Code>.
                </Text>

                <CodeCard language="javascript">
                    {`// Exemple avec preventDefault
const link = document.getElementById("myLink");

link.addEventListener("click", (event) => {
    event.preventDefault(); // Empêche le suivi du lien
    console.log("Lien cliqué, mais le comportement par défaut est annulé.");
});

// Exemple avec un formulaire
const form = document.getElementById("myForm");

form.addEventListener("submit", (event) => {
    event.preventDefault(); // Empêche la soumission du formulaire
    console.log("Formulaire intercepté pour validation personnalisée");
    // Traitement personnalisé du formulaire
});`}
                </CodeCard>
            </section>
        </article>
    );
}