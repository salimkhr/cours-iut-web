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
        {title: "A - Fetch & Boutons", points: 8, time: "0h45"},
        {title: "B - DOM & Cartes", points: 8, time: "0h45"},
        {title: "C - Events & Formulaire", points: 4, time: "0h30"},
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
                    Le fichier <Code>index.html</Code> vous est fournis. Tout le travail se fait dans <Code>js/index.js</Code>.
                </Text>

                <CodeCard language="js" filename="js/index.js">
                    {`// Fonctions disponibles — NE PAS MODIFIER

const AGENTS_DATA = [
  { id: "ba",   nom: "Business Analyst", emoji: "🔍" },
  { id: "pm",   nom: "Product Manager",  emoji: "📋" },
  { id: "arch", nom: "Architect",        emoji: "🏗️" },
  { id: "dev",  nom: "Developer",        emoji: "💻" },
];

function fetchAgents() {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(AGENTS_DATA), 900);
  });
}

// ─── Votre code ci-dessous ───────────────────────────────`}
                </CodeCard>
                <CodeCard language="html" filename="index.html" collapsible>
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BMAD Pipeline</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --ba: #0096b4; --pm: #7c3fc9; --arch: #c95f00; --dev: #00924f;
      --text: #181b2a; --muted: #8b91ab;
      --border: rgba(255,255,255,0.55);
      --glass: rgba(255,255,255,0.62); --glass2: rgba(255,255,255,0.35);
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; color: var(--text); min-height: 100vh; background: #dde8f5; overflow-x: hidden; }
    .bg-mesh {
      position: fixed; inset: 0; z-index: 0;
      background:
        radial-gradient(ellipse 70% 60% at 10% 10%, #c8e8f8 0%, transparent 60%),
        radial-gradient(ellipse 50% 50% at 90% 0%,  #ddd0f8 0%, transparent 55%),
        radial-gradient(ellipse 60% 50% at 80% 90%, #fde8d0 0%, transparent 55%),
        radial-gradient(ellipse 50% 60% at 5%  85%, #cdf5e2 0%, transparent 55%),
        #dde8f5;
    }
    .bg-grid {
      position: fixed; inset: 0; z-index: 0;
      background-image: linear-gradient(rgba(100,120,180,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(100,120,180,0.07) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* HEADER */
    header {
      position: relative; z-index: 10;
      padding: 1.8rem 2rem;
      display: flex; align-items: center; justify-content: space-between;
      background: var(--glass);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 12px rgba(0,0,0,0.05);
    }
    .logo-area { display: flex; align-items: center; gap: 1rem; }
    .logo-badge { width: 42px; height: 42px; background: linear-gradient(135deg, var(--ba), var(--pm)); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(124,63,201,0.25); }
    header h1 { font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em; }
    header h1 span { background: linear-gradient(90deg, var(--ba), var(--pm)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    header p { font-size: 0.72rem; color: var(--muted); margin-top: 0.15rem; }
    .header-right { display: flex; align-items: center; gap: 1.5rem; }
    #loading { font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--muted); display: none; }
    #error   { font-family: 'Space Mono', monospace; font-size: 0.72rem; color: #c03030; background: rgba(200,60,60,0.08); border: 1px solid rgba(200,60,60,0.2); padding: 0.3rem 0.8rem; border-radius: 6px; display: none; }

    /* PROGRESS */
    .progress-bar-outer { position: relative; z-index: 9; height: 3px; background: rgba(0,0,0,0.06); }
    .progress-bar-inner { height: 100%; background: linear-gradient(90deg, var(--ba), var(--pm), var(--arch), var(--dev)); width: 0%; transition: width 1.2s ease; }

    /* MAIN */
    main { position: relative; z-index: 1; padding: 3rem 0 8rem; display: flex; flex-direction: column; align-items: center; overflow-x: auto; }

    /* PIPELINE */
    #pipeline { display: flex; align-items: center; min-width: max-content; padding: 0 2rem 1rem; }

    /* CARDS */
    .card {
      position: relative;
      background: var(--glass);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem 0.9rem;
      width: 148px; flex-shrink: 0;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset;
    }
    .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.9); border-radius: 14px 14px 0 0; }
    .card::after  { content: ''; position: absolute; inset: 0; border-radius: 14px; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
    .card.agent-ba   { border-top: 2px solid var(--ba); }
    .card.agent-ba::after   { background: radial-gradient(ellipse at 20% 10%, rgba(0,150,180,0.08), transparent 65%); }
    .card.agent-pm   { border-top: 2px solid var(--pm); }
    .card.agent-pm::after   { background: radial-gradient(ellipse at 20% 10%, rgba(124,63,201,0.08), transparent 65%); }
    .card.agent-arch { border-top: 2px solid var(--arch); }
    .card.agent-arch::after { background: radial-gradient(ellipse at 20% 10%, rgba(201,95,0,0.08), transparent 65%); }
    .card.agent-dev  { border-top: 2px solid var(--dev); }
    .card.agent-dev::after  { background: radial-gradient(ellipse at 20% 10%, rgba(0,146,79,0.08), transparent 65%); }
    .card:hover::after, .card.open::after { opacity: 1; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(0,0,0,0.09), 0 1px 0 rgba(255,255,255,0.9) inset; }
    .card.open { width: 178px; transform: translateY(-10px); }
    .card.agent-ba.open   { box-shadow: 0 16px 48px rgba(0,150,180,0.18),  0 1px 0 rgba(255,255,255,0.9) inset; }
    .card.agent-pm.open   { box-shadow: 0 16px 48px rgba(124,63,201,0.18), 0 1px 0 rgba(255,255,255,0.9) inset; }
    .card.agent-arch.open { box-shadow: 0 16px 48px rgba(201,95,0,0.18),   0 1px 0 rgba(255,255,255,0.9) inset; }
    .card.agent-dev.open  { box-shadow: 0 16px 48px rgba(0,146,79,0.18),   0 1px 0 rgba(255,255,255,0.9) inset; }
    .card-top    { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.6rem; }
    .card-emoji  { font-size: 1.4rem; line-height: 1; }
    .card-num    { font-family: 'Space Mono', monospace; font-size: 0.55rem; color: var(--muted); background: rgba(255,255,255,0.5); padding: 0.15rem 0.4rem; border-radius: 4px; border: 1px solid var(--border); }
    .card-agent  { font-size: 0.56rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
    .agent-ba   .card-agent { color: var(--ba); }
    .agent-pm   .card-agent { color: var(--pm); }
    .agent-arch .card-agent { color: var(--arch); }
    .agent-dev  .card-agent { color: var(--dev); }
    .card-action  { font-size: 0.78rem; font-weight: 600; line-height: 1.3; margin-bottom: 0.7rem; }
    .badge-statut { display: inline-flex; align-items: center; gap: 0.3rem; font-family: 'Space Mono', monospace; font-size: 0.58rem; padding: 0.2rem 0.55rem; border-radius: 20px; }
    .badge-statut.termine    { background: rgba(0,146,79,0.10);  color: var(--dev); }
    .badge-statut.en-cours   { background: rgba(200,140,0,0.12); color: #a07800; }
    .badge-statut.en-attente { background: rgba(200,60,60,0.10); color: #c03030; }
    .card-expand { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.4s ease, opacity 0.3s; }
    .card.open .card-expand { max-height: 200px; opacity: 1; }
    .card-desc    { font-size: 0.72rem; color: var(--muted); line-height: 1.6; border-top: 1px solid rgba(0,0,0,0.07); padding-top: 0.7rem; margin-top: 0.7rem; }
    .card-produit { font-family: 'Space Mono', monospace; font-size: 0.58rem; color: var(--muted); margin-top: 0.45rem; }

    /* ARROWS */
    .arrow-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.2rem 0.2rem 0; cursor: pointer; flex-shrink: 0; gap: 0.2rem; transition: transform 0.2s; }
    .arrow-wrap:hover { transform: scale(1.15); }
    .arrow-dots { display: flex; align-items: center; gap: 3px; }
    .adot { width: 4px; height: 4px; border-radius: 50%; background: var(--muted); animation: dotflow 1.6s infinite; }
    .adot:nth-child(2) { animation-delay: 0.25s; }
    .adot:nth-child(3) { animation-delay: 0.5s; }
    @keyframes dotflow { 0%,100% { opacity: 0.18; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.3); } }
    .arrow-wrap.done .adot { animation: none; opacity: 1; background: var(--dev); }
    .arrow-wrap.done .arrow-tip   { color: var(--dev); }
    .arrow-wrap.done .arrow-label { color: var(--dev); opacity: 0.7; }
    .arrow-tip  { color: var(--muted); font-size: 1.1rem; }
    .arrow-label { font-family: 'Space Mono', monospace; font-size: 0.52rem; color: var(--muted); text-align: center; max-width: 72px; word-break: break-all; line-height: 1.3; }

    /* MODAL HANDOFF */
    #modal-overlay { position: fixed; inset: 0; background: rgba(180,200,230,0.35); backdrop-filter: blur(12px); display: none; align-items: center; justify-content: center; z-index: 200; }
    #modal-overlay.show { display: flex; }
    #modal { background: rgba(255,255,255,0.82); border: 1px solid var(--border); border-radius: 20px; padding: 2.2rem; max-width: 380px; width: 90%; backdrop-filter: blur(24px); box-shadow: 0 24px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.9) inset; animation: pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    @keyframes pop { from { transform: scale(0.82); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    #modal h3      { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem; }
    #modal-p       { font-size: 0.78rem; color: var(--muted); line-height: 1.7; margin-bottom: 1.2rem; }
    .modal-flow    { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; background: rgba(255,255,255,0.5); border: 1px solid var(--border); border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 1.2rem; }
    .modal-agent   { font-size: 0.8rem; font-weight: 600; }
    .modal-sep     { color: var(--muted); }
    .modal-file    { font-family: 'Space Mono', monospace; font-size: 0.65rem; color: var(--ba); background: rgba(0,150,180,0.08); padding: 0.15rem 0.45rem; border-radius: 4px; }
    #modal-close   { width: 100%; background: rgba(255,255,255,0.5); border: 1px solid var(--border); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; padding: 0.7rem; border-radius: 8px; cursor: pointer; }
    #modal-close:hover { background: rgba(255,255,255,0.85); }

    /* MODAL FORMULAIRE */
    #modal-form-overlay { position: fixed; inset: 0; background: rgba(180,200,230,0.35); backdrop-filter: blur(12px); display: none; align-items: center; justify-content: center; z-index: 200; }
    #modal-form-overlay.show { display: flex; }
    #modal-form { background: rgba(255,255,255,0.82); border: 1px solid var(--border); border-radius: 20px; padding: 2.2rem; max-width: 400px; width: 90%; backdrop-filter: blur(24px); box-shadow: 0 24px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.9) inset; animation: pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
    #modal-form h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 1.4rem; }
    #modal-agent-label { font-size: 0.72rem; color: var(--muted); margin-bottom: 1.2rem; display: block; }
    #form-session label { display: block; font-size: 0.72rem; font-weight: 600; margin-bottom: 0.3rem; margin-top: 1rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    #form-session textarea,
    #form-session input[type="text"] { width: 100%; background: rgba(255,255,255,0.5); border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem 0.8rem; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: var(--text); outline: none; transition: border 0.2s; }
    #form-session textarea { resize: vertical; min-height: 80px; }
    #form-session textarea:focus,
    #form-session input[type="text"]:focus { border-color: var(--ba); }
    .form-actions { display: flex; gap: 0.7rem; margin-top: 1.4rem; }
    #btn-submit-session { flex: 1; background: linear-gradient(135deg, var(--ba), var(--pm)); color: white; border: none; border-radius: 8px; padding: 0.75rem; font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; }
    #btn-fermer-modal { background: rgba(255,255,255,0.5); border: 1px solid var(--border); color: var(--muted); border-radius: 8px; padding: 0.75rem 1.2rem; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; cursor: pointer; }

    /* FOOTER BOUTONS */
    footer {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 10;
      background: var(--glass);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex; align-items: center; justify-content: space-between;
      box-shadow: 0 -1px 0 rgba(255,255,255,0.8) inset;
    }
    #boutons-agents { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    #btn-lancer { font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600; background: linear-gradient(135deg, var(--arch), var(--dev)); color: white; border: none; border-radius: 10px; padding: 0.7rem 1.6rem; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
    #btn-lancer:not(:disabled) { opacity: 1; }
  </style>
</head>
<body>
  <div class="bg-mesh"></div>
  <div class="bg-grid"></div>

  <header>
    <div class="logo-area">
      <div class="logo-badge">⚡</div>
      <div>
        <h1><span>BMAD</span> Pipeline</h1>
        <p>Constructeur de sessions agentiques</p>
      </div>
    </div>
    <div class="header-right">
      <span id="loading">⏳ Chargement...</span>
      <span id="error"></span>
    </div>
  </header>
  <div class="progress-bar-outer"><div class="progress-bar-inner" id="pbar"></div></div>

  <main>
    <div id="pipeline"></div>
  </main>

  <footer>
    <div id="boutons-agents"></div>
    <button id="btn-lancer" disabled>▶ Lancer le pipeline</button>
  </footer>

  <!-- Modale handoff (clic flèche) -->
  <div id="modal-overlay">
    <div id="modal">
      <h3 id="modal-title">Handoff entre agents</h3>
      <p id="modal-p"></p>
      <div class="modal-flow" id="modal-flow"></div>
      <button id="modal-close">Fermer</button>
    </div>
  </div>

  <!-- Modale formulaire (clic bouton agent) -->
  <div id="modal-form-overlay">
    <div id="modal-form">
      <h3>Ajouter une session</h3>
      <span id="modal-agent-label"></span>
      <form id="form-session">
        <label for="input-action">Action (prompt)</label>
        <textarea id="input-action" placeholder="Décrivez le prompt exécuté par l'agent..." required></textarea>

        <label for="input-produit">Fichier produit</label>
        <input type="text" id="input-produit" placeholder="ex: brief.md" required/>

        <label for="input-description">Description</label>
        <input type="text" id="input-description" placeholder="Résumé de la session" required/>

        <div class="form-actions">
          <button type="button" id="btn-fermer-modal">Annuler</button>
          <button type="submit" id="btn-submit-session">Ajouter au pipeline</button>
        </div>
      </form>
    </div>
  </div>

  <script src="js/index.js"></script>
</body>
</html>`}
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
                <CodeCard language="js">
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
                    Cette fonction sera appelée à chaque soumission du formulaire (partie C).
                </Text>
                <Text>
                    À la fin de <Code>js/index.js</Code>, ajouter un appel direct à <Code>ajouterCarteAuPipeline()</Code>
                    avec des données en dur pour vérifier que la carte s'affiche correctement.
                </Text>
                <CodeCard language="js">
                    {`// À supprimer après vérification
ajouterCarteAuPipeline(
  { id: "ba", nom: "Business Analyst", emoji: "🔍" },
  "Analyse du besoin client",
  "brief.md",
  "Reformule le besoin en brief structuré."
);`}
                </CodeCard>
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

                <Heading level={3}>Mise à jour des statuts</Heading>
                <Text>
                    Ajouter dans <Code>startApp</Code> un événement <Code>click</Code> sur <Code>#btn-lancer</Code>.
                    Au clic, appeler <Code>lancerPipeline(sessions)</Code> en lui passant le tableau <Code>sessions</Code>.
                    Elle retourne une Promise qui résout avec le tableau suivant :
                </Text>
                <CodeCard language="json" filename="Retour de lancerPipeline()">
                    {`[
  { "id": 1, "statut": "terminé" },
  { "id": 2, "statut": "terminé" },
  { "id": 3, "statut": "en cours" }
]`}
                </CodeCard>
                <Text>
                    Pour chaque objet du tableau retourné, sélectionner la carte dont l'attribut <Code>data-id</Code> correspond à <Code>id</Code>,
                    puis remplacer le <Code>textContent</Code> de son <Code>.badge-statut</Code> par la valeur de <Code>statut</Code>.
                </Text>
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
            </section>

            <p className="mt-8 text-xl font-semibold text-center border-t pt-6">
                Bonne chance 🎓
            </p>

        </article>
    );
}