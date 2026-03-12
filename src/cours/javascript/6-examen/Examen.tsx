import React from 'react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";
import CodeCard from "@/components/Cards/CodeCard";

export default function Examen() {

    const sections = [
        {title: "A - Fetch & Boutons", points: 6, time: "0h30"},
        {title: "B - DOM & Cartes",    points: 8, time: "0h40"},
        {title: "C - Events & Formulaire", points: 6, time: "0h20"},
    ];

    const agents = [
        {emoji: "🔍", nom: "Business Analyst", role: "Analyse le besoin et le reformule en brief structuré"},
        {emoji: "📋", nom: "Product Manager",  role: "Découpe le brief en User Stories priorisées"},
        {emoji: "🏗️", nom: "Architect",        role: "Conçoit l'architecture technique à partir des stories"},
        {emoji: "💻", nom: "Developer",        role: "Implémente le code à partir de l'architecture"},
    ];

    return (
        <article>

            {/* Entête */}
            <section className="flex flex-col items-center justify-center py-16 space-y-4">
                <Heading level={2}>Département Informatique - BUT Info 2 - 2024/2025</Heading>
                <Heading level={3}>Examen DOM - Event - Fetch · Groupe 1</Heading>
            </section>

            {/* Contexte */}
            <section>
                <Heading level={2}>Contexte — La méthode BMAD</Heading>
                <Text>
                    BMAD est une méthode de développement assistée par IA qui découpe un projet en 4 rôles spécialisés,
                    chacun exécuté par un agent IA distinct. Les agents travaillent <strong>en chaîne</strong> :
                    la sortie de l'un devient l'entrée du suivant.
                </Text>
                <List>
                    {agents.map((a, i) => (
                        <ListItem key={i}>
                            <strong>{a.emoji} {a.nom}</strong> — {a.role}
                        </ListItem>
                    ))}
                </List>
                <Text className="mt-4">
                    Chaque agent reçoit un <strong>prompt</strong> (l'action à exécuter), produit un <strong>fichier de sortie</strong>,
                    et le transmet à l'agent suivant.
                    Votre mission : construire une interface qui permet de <strong>composer un pipeline BMAD</strong> en ajoutant des agents un par un.
                </Text>

                <Alert className="mt-6 border-yellow-300 bg-yellow-50">
                    <AlertCircle className="h-5 w-5 text-yellow-600"/>
                    <AlertTitle className="text-yellow-900 font-semibold">Consignes</AlertTitle>
                    <AlertDescription className="text-yellow-800">
                        <Text>L'utilisation d'Internet, du téléphone ou d'outils d'IA est interdite.</Text>
                    </AlertDescription>
                </Alert>
            </section>

            {/* Barème */}
            <section>
                <Heading level={2}>Barème</Heading>
                <List>
                    {sections.map((item, index) => (
                        <ListItem key={index}>
                            <strong>{item.title}</strong> — {item.points} points — {item.time}
                        </ListItem>
                    ))}
                </List>
            </section>

            {/* Fichiers fournis */}
            <section>
                <Heading level={2}>Fichiers fournis</Heading>
                <Text>
                    Les fichiers <Code>index.html</Code> et <Code>css/style.css</Code> vous sont fournis.
                    Tout le travail se fait dans <Code>js/index.js</Code>.
                </Text>

                <CodeCard language="css" filename="css/style.css">
                    {`/* Classes de carte */
.card                  { /* carte agent, glassmorphisme */ }
.card.open             { /* carte dépliée, .card-expand devient visible */ }
.card.agent-ba         { /* bordure couleur Business Analyst */ }
.card.agent-pm         { /* bordure couleur Product Manager */ }
.card.agent-arch       { /* bordure couleur Architect */ }
.card.agent-dev        { /* bordure couleur Developer */ }

/* Éléments internes d'une carte */
.card-top              { /* ligne emoji + numéro */ }
.card-emoji            { /* emoji de l'agent */ }
.card-num              { /* numéro de session ex: 01 */ }
.card-agent            { /* nom de l'agent en majuscules */ }
.card-action           { /* titre de l'action */ }
.card-expand           { /* zone masquée par défaut, visible quand .card.open */ }
.card-desc             { /* description de la session */ }
.card-produit          { /* fichier produit ex: 📤 brief.md */ }

/* Badges statut */
.badge-statut          { /* badge générique */ }
.badge-statut.termine  { /* fond vert */ }
.badge-statut.en-cours { /* fond orange */ }
.badge-statut.en-attente { /* fond rouge */ }

/* Flèche entre cartes */
.arrow-wrap            { /* conteneur flèche */ }
.arrow-wrap.done       { /* flèche verte, animation arrêtée */ }
.arrow-dots            { /* conteneur des 3 points animés */ }
.adot                  { /* point animé */ }
.arrow-tip             { /* › */ }
.arrow-label           { /* nom du fichier transmis */ }

/* Modales */
#modal-overlay         { /* fond flouté, display:none par défaut */ }
#modal-overlay.show    { /* display:flex, modale visible */ }
#modal-form-overlay    { /* fond flouté, display:none par défaut */ }
#modal-form-overlay.show { /* display:flex, modale visible */ }`}
                </CodeCard>

                <CodeCard language="js" filename="js/index.js">
                    {`// ─── Votre code ci-dessous ───────────────────────────────`}
                </CodeCard>
                <CodeCard language="html" filename="index.html">
                    {`<header>
  <div class="logo-area">...</div>
  <div class="header-right">
    <span id="loading">⏳ Chargement...</span>  <!-- à afficher/masquer -->
    <span id="error"></span>                    <!-- à afficher en cas d'erreur -->
  </div>
</header>

<div class="progress-bar-outer">
  <div class="progress-bar-inner" id="pbar"></div>  <!-- width en % -->
</div>

<main>
  <div id="pipeline"></div>  <!-- les cartes et flèches s'insèrent ici -->
</main>

<footer>
  <div id="boutons-agents"></div>          <!-- les boutons agents s'insèrent ici -->
  <button id="btn-lancer" disabled>        <!-- à activer quand le pipeline n'est pas vide -->
    ▶ Lancer le pipeline
  </button>
</footer>

<!-- Modale handoff — s'ouvre au clic sur une flèche -->
<div id="modal-overlay">
  <div id="modal">
    <h3 id="modal-title">Handoff entre agents</h3>
    <p id="modal-p"></p>
    <div class="modal-flow" id="modal-flow"></div>
    <button id="modal-close">Fermer</button>
  </div>
</div>

<!-- Modale formulaire — s'ouvre au clic sur un bouton agent -->
<div id="modal-form-overlay">
  <div id="modal-form">
    <h3>Ajouter une session</h3>
    <span id="modal-agent-label"></span>  <!-- nom et emoji de l'agent sélectionné -->
    <form id="form-session">
      <textarea id="input-action"      required></textarea>  <!-- prompt de l'agent -->
      <input    id="input-produit"     type="text" required/>  <!-- fichier produit -->
      <input    id="input-description" type="text" required/>  <!-- description -->
      <button type="submit"  id="btn-submit-session">Ajouter au pipeline</button>
      <button type="button"  id="btn-fermer-modal">Annuler</button>
    </form>
  </div>
</div>

<script src="js/index.js"></script>`}
                </CodeCard>
            </section>

            {/* Partie A */}
            <section className="pt-6">
                <Heading level={2}>A - Fetch & Boutons</Heading>

                <Heading level={3}>Initialisation</Heading>
                <Text>
                    Dans <Code>js/index.js</Code>, créer une fonction <Code>startApp</Code> appelée lors de l'événement <Code>load</Code> de la page.
                </Text>

                <Heading level={3}>Récupération des agents</Heading>
                <Text>
                    Dans <Code>startApp</Code>, utiliser <Code>fetch</Code> pour récupérer la liste des agents depuis l'URL suivante :
                </Text>
                <CodeCard language="text" filename="URL de l'API">
                    {`http://localhost:8000/agents`}
                </CodeCard>
                <Text>
                    L'API retourne directement un tableau JSON :
                </Text>
                <CodeCard language="json" filename="Réponse de l'API">
                    {`[
  { "id": "ba",   "nom": "Business Analyst", "emoji": "🔍" },
  { "id": "pm",   "nom": "Product Manager",  "emoji": "📋" },
  { "id": "arch", "nom": "Architect",        "emoji": "🏗️" },
  { "id": "dev",  "nom": "Developer",        "emoji": "💻" }
]`}
                </CodeCard>
                <List>
                    <ListItem>Passer <Code>#loading</Code> à <Code>display: block</Code> avant le fetch, puis à <Code>display: none</Code> une fois les données reçues</ListItem>
                    <ListItem>En cas d'erreur, passer <Code>#error</Code> à <Code>display: block</Code> et y écrire le message</ListItem>
                    <ListItem>Passer le tableau à <Code>afficherBoutons(agents)</Code></ListItem>
                </List>

                <Heading level={3}>Génération des boutons</Heading>
                <Text>
                    Implémenter <Code>afficherBoutons(agents)</Code>.
                    Pour chaque agent du tableau, créer un bouton avec <Code>document.createElement</Code> et l'insérer dans <Code>#boutons-agents</Code>.
                </Text>
                <List>
                    <ListItem>Définir le <Code>textContent</Code> avec l'emoji et le nom de l'agent</ListItem>
                    <ListItem>Ajouter la classe <Code>btn-agent</Code></ListItem>
                    <ListItem>Stocker l'identifiant de l'agent dans <Code>dataset.agentId</Code></ListItem>
                    <ListItem>Insérer le bouton dans <Code>#boutons-agents</Code> avec <Code>appendChild</Code></ListItem>
                </List>
            </section>

            {/* Partie B */}
            <section className="pt-6">
                <Heading level={2}>B - DOM & Cartes</Heading>

                <Heading level={3}>Tableau des sessions</Heading>
                <Text>
                    Déclarer un tableau vide <Code>sessions</Code> en dehors de toute fonction.
                    Il contiendra un objet par carte ajoutée au pipeline, et sera passé à <Code>lancerPipeline()</Code> en partie B.
                </Text>
                <CodeCard language="js" filename="Structure d'un objet session">
                    {`{
  id: 1,               // numéro d'ordre dans le pipeline
  agentId: "ba",       // identifiant de l'agent
  agent: "Business Analyst",
  emoji: "🔍",
  action: "Analyse du besoin client",
  produit: "brief.md",
  description: "Reformule le besoin en brief structuré."
}`}
                </CodeCard>

                <Heading level={3}>Ajout d'une carte</Heading>
                <Text>
                    Implémenter <Code>ajouterCarteAuPipeline(agent, action, produit, description)</Code>.
                    Cette fonction est appelée à chaque soumission du formulaire (partie C).
                </Text>
                <Text>
                    À chaque appel, ajouter un objet au tableau <Code>sessions</Code>.
                    Le champ <Code>id</Code> correspond à la longueur du tableau après ajout.
                </Text>
                <Text>
                    Si <Code>sessions</Code> contient déjà au moins un élément avant l'ajout,
                    créer une flèche et l'insérer dans <Code>#pipeline</Code> avant la carte.
                    La flèche affiche le <Code>produit</Code> du dernier élément de <Code>sessions</Code>
                    — c'est le fichier transmis par l'agent précédent.
                </Text>
                <Text>
                    Créer ensuite la carte avec <Code>innerHTML</Code> et l'insérer dans <Code>#pipeline</Code>.
                    La carte doit porter l'attribut <Code>data-id</Code> égal à son <Code>id</Code> dans <Code>sessions</Code>.
                </Text>
                <Text>Structure HTML attendue pour une flèche :</Text>
                <CodeCard language="html" filename="arrow.html">
                    {`<div class="arrow-wrap">
  <div class="arrow-dots">
    <div class="adot"></div>
    <div class="adot"></div>
    <div class="adot"></div>
    <span class="arrow-tip">›</span>
  </div>
  <div class="arrow-label">brief.md</div>  <!-- produit de la session précédente -->
</div>`}
                </CodeCard>
                <Text>Structure HTML attendue pour une carte :</Text>
                <CodeCard language="html" filename="card.html">
                    {`<div class="card agent-ba" data-id="1">
  <div class="card-top">
    <span class="card-emoji">🔍</span>
    <span class="card-num">01</span>
  </div>
  <div class="card-agent">Business Analyst</div>
  <div class="card-action">Analyse du besoin client</div>
  <div class="badge-statut en-attente">○ en attente</div>
  <div class="card-expand">
    <div class="card-desc">Reformule le besoin en brief structuré.</div>
    <div class="card-produit">📤 brief.md</div>
  </div>
</div>`}
                </CodeCard>

                <Heading level={3}>Test</Heading>
                <Text>
                    À la fin de <Code>js/index.js</Code>, ajouter un appel direct à <Code>ajouterCarteAuPipeline()</Code>
                    avec des données en dur pour vérifier que la carte s'affiche correctement avant de passer à la partie C.
                </Text>
                <CodeCard language="js" filename="Exemple de test">
                    {`// À supprimer après vérification
ajouterCarteAuPipeline(
  { id: "ba", nom: "Business Analyst", emoji: "🔍" },
  "Analyse du besoin client",
  "brief.md",
  "Reformule le besoin en brief structuré."
);`}
                </CodeCard>
            </section>

            {/* Partie C */}
            <section className="pt-6">
                <Heading level={2}>C - Events & Formulaire</Heading>

                <Heading level={3}>Clic sur un bouton agent</Heading>
                <Text>
                    Au clic sur un bouton agent, ajouter la classe <Code>show</Code> sur <Code>#modal-form-overlay</Code>.
                    Écrire le nom et l'emoji de l'agent dans <Code>#modal-agent-label</Code>.
                </Text>

                <Heading level={3}>Soumission du formulaire</Heading>
                <Text>
                    Ajouter un événement <Code>submit</Code> sur <Code>#form-session</Code>.
                    Récupérer les valeurs des trois champs :
                </Text>
                <List>
                    <ListItem><Code>#input-action</Code> — le prompt exécuté par l'agent</ListItem>
                    <ListItem><Code>#input-produit</Code> — le fichier produit</ListItem>
                    <ListItem><Code>#input-description</Code> — la description</ListItem>
                </List>
                <Text>
                    Appeler <Code>ajouterCarteAuPipeline()</Code> avec ces valeurs,
                    puis retirer la classe <Code>show</Code> de <Code>#modal-form-overlay</Code> et réinitialiser le formulaire.
                </Text>

                <Heading level={3}>Clic sur une carte</Heading>
                <Text>
                    Au clic sur une carte dans <Code>#pipeline</Code>,
                    toggler la classe <Code>open</Code> sur la carte.
                    Quand <Code>open</Code> est présente, le <Code>.card-expand</Code> devient visible via le CSS fourni.
                </Text>
            </section>

            <p className="mt-8 text-xl font-semibold text-center border-t pt-6">
                Bonne chance 🎓
            </p>

        </article>
    );
}