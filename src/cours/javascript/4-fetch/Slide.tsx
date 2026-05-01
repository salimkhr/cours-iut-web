'use client';
import {SlidesScreen} from "@/components/Slides/SlidesScreen";
import React from 'react';
import {SlideScreen} from "@/components/Slides/SlideScreen";
import {SlideText} from "@/components/Slides/ui/SlideText";
import {SlideCode} from "@/components/Slides/ui/SlideCode";
import {SlideList, SlideListItem} from "@/components/Slides/ui/SlideList";
import {SlideNote} from "@/components/Slides/ui/SlideNote";
import Image from "next/image";

import Module from "@/types/Module";
import Section from "@/types/Section";
import {SlideDiagram} from "@/components/Slides/ui/SlideDiagram";


export default function FetchSlides() {
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
        title: "Fetch et APIs",
        path: "fetch-et-apis",
        contents: [],
        description: "Communiquer avec des APIs et gérer l'asynchrone en JavaScript",
        tags: ["Fetch", "API", "Promises", "async/await", "TypeScript", "Express"],
        totalDuration: 0,
        hasCorrection: false,
        order: 4
    };

    const requestFlowDiagram = `sequenceDiagram
    participant Frontend as Frontend
    participant Réseau as Réseau
    participant Backend as Backend
    participant Controller as Contrôleur

    Frontend->>Réseau: fetch() avec headers et body
    Réseau->>Backend: Requête HTTP arrive sur le serveur
    Backend->>Backend: Middleware auth vérifie token Bearer
    Backend->>Controller: Router dirige vers le bon contrôleur
    Controller->>Controller: Exécution de la logique métier
    Controller->>Backend: Réponse JSON avec statut HTTP
    Backend->>Réseau: Réponse HTTP
    Réseau->>Frontend: Promise résolue, données disponibles`

    return (
        <div className="w-full py-10">
            <SlidesScreen module={mockModule} section={mockSection}>
                {/* Introduction */}
                <SlideScreen title="Fetch et APIs - Introduction">
                    <SlideNote>
                        {`- Bienvenue dans le cours sur Fetch et les APIs !
- Expliquer qu'aujourd'hui les applications web communiquent constamment avec des serveurs.
- Mentionner que nous allons d'abord voir TypeScript et Express pour comprendre le backend, puis fetch pour le frontend.`}
                    </SlideNote>
                    <SlideText>
                        Les applications web modernes reposent sur la communication entre le frontend (navigateur) et le
                        backend (serveur). Dans ce cours, nous allons voir :
                    </SlideText>
                    <SlideList>
                        <SlideListItem>TypeScript : typage statique pour JavaScript.</SlideListItem>
                        <SlideListItem>NPM : gestionnaire de paquets Node.js.</SlideListItem>
                        <SlideListItem>Express : framework backend Node.js.</SlideListItem>
                        <SlideListItem>
                            Promises et async/await : gestion de l&apos;asynchrone.
                        </SlideListItem>
                        <SlideListItem>Fetch API : communication avec le serveur.</SlideListItem>
                        <SlideListItem>Sécurité : tokens Bearer et CORS.</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* TypeScript Introduction */}
                <SlideScreen title="A.1 - TypeScript : types de base">
                    <SlideNote>
                        {`- TypeScript est un sur-ensemble de JavaScript qui ajoute le typage statique.
- Développé par Microsoft, très populaire pour les projets d'envergure.
- Le code TypeScript est compilé en JavaScript standard.`}
                    </SlideNote>
                    <SlideText>
                        TypeScript ajoute des types à JavaScript pour détecter les erreurs avant
                        l&apos;exécution :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-4 | 6-10">
                        {`// Types de base
const age: number = 25;
const nom: string = "Alice";
const estEtudiant: boolean = true;

// Tableaux et objets typés
const notes: number[] = [15, 18, 12];
const utilisateur: { nom: string; age: number } = {
    nom: "Bob",
    age: 30
};`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="A.2 - TypeScript : interfaces">
                    <SlideNote>
                        {`- Les interfaces décrivent la "forme" d'un objet.
- Très utiles pour partager des contrats entre composants.
- Convention : nom en PascalCase (User, Session, etc.).`}
                    </SlideNote>
                    <SlideText>
                        Les interfaces décrivent la structure d&apos;un objet :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-6 | 8-12">
                        {`// Interfaces
interface User {
    id: string;
    name: string;
    email: string;
}

const user: User = {
    id: "123",
    name: "Alice",
    email: "alice@example.com"
};`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="A.3 - TypeScript : fonctions typées">
                    <SlideText>
                        TypeScript permet de typer les paramètres et les valeurs de retour :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-5 | 7-16">
                        {`// Fonction avec types
function additionner(a: number, b: number): number {
  return a + b;
}
const resultat = additionner(5, 3); // OK

// Interface pour les paramètres
interface Session {
  id: string;
  voltage: number;
  status: string;
}

function createSession(questions: Array<{stimulus: string; response: string}>): Session {
  // ...
}`}
                    </SlideCode>
                </SlideScreen>

                {/* NPM */}
                <SlideScreen title="B.1 - NPM : Node Package Manager">
                    <div className="flex items-start gap-8">

                        {/* Colonne gauche */}
                        <div className="flex-1">
                            <SlideNote>
                                {`- NPM est le gestionnaire de paquets pour Node.js et JavaScript.
- Plus grand registre de logiciels au monde (plus d'1 million de packages).
- Permet de partager et réutiliser du code facilement.
- Installé automatiquement avec Node.js.`}
                            </SlideNote>

                            <SlideText>
                                NPM permet d&apos;installer et de gérer les bibliothèques JavaScript :
                            </SlideText>

                            <SlideList>
                                <SlideListItem>
                                    Installer des packages (express, react, etc.).
                                </SlideListItem>
                                <SlideListItem>Gérer les versions des dépendances.</SlideListItem>
                                <SlideListItem>Partager son propre code avec la communauté.</SlideListItem>
                                <SlideListItem>
                                    Exécuter des scripts de build et de développement.
                                </SlideListItem>
                            </SlideList>
                        </div>

                        {/* Colonne droite */}
                        <div className="shrink-0">
                            <Image
                                src="https://lesjoiesducode.fr/content/052/node_modules-olive-js.jpg"
                                alt="npm logo"
                                width={400}
                                height={400}
                                className="rounded-lg"
                            />
                        </div>

                    </div>
                </SlideScreen>


                <SlideScreen title="B.2 - NPM : installation de packages">
                    <SlideText>
                        Commandes essentielles pour installer des dépendances :
                    </SlideText>
                    <SlideCode language="bash" highlight="1-2 | 4-5 | 7-8 | 10-11">
                        {`# Installer un package (production)
npm install express

# Installer plusieurs packages
npm install express cors uuid

# Installer en dépendance de développement
npm install --save-dev typescript @types/node

# Installer globalement (outils CLI)
npm install -g nodemon`}
                    </SlideCode>
                    <SlideText>
                        Les packages sont téléchargés dans le dossier node_modules/
                    </SlideText>
                </SlideScreen>

                <SlideScreen title="B.3 - NPM : package.json">
                    <SlideNote>
                        {`- package.json est le fichier de configuration du projet.
- Décrit le projet : nom, version, auteur, licence.
- Liste toutes les dépendances nécessaires.
- Définit les scripts (start, build, test, etc.).`}
                    </SlideNote>
                    <SlideText>
                        Le fichier package.json décrit votre projet et ses dépendances :
                    </SlideText>
                    <SlideCode language="json" highlight="1-5 | 6-9 | 10-13 | 14-17">
                        {`{
  "name": "milgram-api",
  "version": "1.0.0",
  "description": "API pour simulation Milgram",
  "main": "index.ts",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.ts"
  }
}`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="B.4 - NPM : versions sémantiques">
                    <SlideText>
                        NPM utilise le versioning sémantique (SemVer) : MAJOR.MINOR.PATCH
                    </SlideText>
                    <SlideList>
                        <SlideListItem>
                            <strong>MAJOR</strong> (1.0.0 → 2.0.0) : changements incompatibles.
                        </SlideListItem>
                        <SlideListItem>
                            <strong>MINOR</strong> (1.0.0 → 1.1.0) : nouvelles fonctionnalités compatibles.
                        </SlideListItem>
                        <SlideListItem>
                            <strong>PATCH</strong> (1.0.0 → 1.0.1) : corrections de bugs.
                        </SlideListItem>
                    </SlideList>
                    <SlideCode language="json" highlight="1-6">
                        {`// Symboles de version dans package.json
{
  "express": "4.18.2",     // Version exacte
  "cors": "^2.8.5",        // Compatible avec 2.x.x
  "uuid": "~9.0.0"         // Compatible avec 9.0.x
}`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="B.5 - NPM : scripts">
                    <SlideNote>
                        {`- Les scripts NPM permettent d'automatiser les tâches répétitives.
- Lancés avec : npm run <nom-du-script>
- start et test peuvent être lancés sans "run" : npm start, npm test`}
                    </SlideNote>
                    <SlideText>
                        Définir des commandes personnalisées dans package.json :
                    </SlideText>
                    <SlideCode language="json" highlight="1-7">
                        {`{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest"
  }
}`}
                    </SlideCode>
                    <SlideCode language="bash" highlight="1-4">
                        {`# Exécuter les scripts
npm start           # Lance le serveur en production
npm run dev         # Lance en mode développement
npm run build       # Compile TypeScript → JavaScript`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="B.6 - NPM : initialiser un projet">
                    <SlideText>
                        Créer un nouveau projet Node.js :
                    </SlideText>
                    <SlideCode language="bash" highlight="1-2 | 4-5 | 7-11 | 13-15">
                        {`# Créer un package.json interactif
npm init

# Créer avec valeurs par défaut
npm init -y

# Installer les dépendances du projet
# (après avoir cloné un repo avec package.json)
npm install
# Lit package.json et installe tout dans node_modules

# Bonnes pratiques
# - Ajouter node_modules/ au .gitignore
# - Committer package.json et package-lock.json
# - Ne JAMAIS committer node_modules/`}
                    </SlideCode>
                </SlideScreen>

                {/* Express Introduction */}
                <SlideScreen title="C.1 - Express : framework backend">
                    <SlideNote>
                        {`- Express est le framework Node.js le plus populaire pour créer des APIs.
- Minimaliste et flexible, il permet de gérer facilement les routes et middlewares.
- Utilisé dans des millions d'applications en production.`}
                    </SlideNote>
                    <SlideText>
                        Express simplifie la création de serveurs HTTP et d&apos;APIs REST :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-3 | 5-9 | 11-13 |15-18">
                        {`// Installation : npm install express
import express from "express";
import cors from "cors";

// Création de l'application
const app = express();
app.use(cors());              // Autorise les requêtes cross-origin
app.use(express.json());      // Parse le JSON des requêtes

// Route de santé
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log("🚀 API running on port 3000");
});`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="C.2 - Express : routes et contrôleurs">
                    <SlideText>
                        Organisation MVC : séparation des routes et de la logique métier :
                    </SlideText>
                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="typescript" highlight="1-9">
                            {`// routes.ts
import { Router } from "express";
import * as controller from "./controller";

const router = Router();

router.post("/", controller.createSession);
router.get("/:id", controller.getQuestion);
router.post("/:id", controller.submitAnswer);

export default router;`}
                        </SlideCode>

                        <SlideCode language="typescript" highlight="1-10">
                            {`// controller.ts
import { Request, Response } from "express";

export async function createSession(
  req: Request, 
  res: Response
) {
  try {
    const session = createSessionDB();
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message 
    });
  }
}`}
                        </SlideCode>
                    </div>
                </SlideScreen>

                {/* Backend Milgram */}
                <SlideScreen title="D.1 - Le backend du TP : vue d'ensemble">
                    <SlideNote>
                        {`- Présenter le backend comme une simulation de l'expérience de Milgram.
- Expliquer brièvement : associations de mots, mauvaises réponses = chocs électriques.
- Mentionner que c'est un exercice pédagogique pour comprendre les APIs REST.`}
                    </SlideNote>
                    <SlideText>
                        Notre API simule une expérience psychologique avec des sessions de
                        questions-réponses :
                    </SlideText>
                    <SlideList>
                        <SlideListItem>
                            <code>auth.ts</code> : middleware d&apos;authentification Bearer.
                        </SlideListItem>
                        <SlideListItem>
                            <code>sessions.ts</code> : gestion des sessions en mémoire.
                        </SlideListItem>
                        <SlideListItem>
                            <code>questions.ts</code> : paires de mots stimulus/réponse.
                        </SlideListItem>
                        <SlideListItem>
                            <code>shocks.ts</code> : simulation des réactions aux chocs.
                        </SlideListItem>
                        <SlideListItem>
                            <code>controller.ts</code> : logique des endpoints.
                        </SlideListItem>
                        <SlideListItem>
                            <code>routes.ts</code> : définition des routes REST.
                        </SlideListItem>
                    </SlideList>
                </SlideScreen>

                <SlideScreen title="D.2 - Structure d'une session">
                    <SlideText>
                        Voici comment une session est structurée dans notre API :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-4 | 6-16">
                        {`// Type de session
export type SessionStatus = "ready" | "in_progress" | "completed";

// Interface complète
export interface Session {
  id: string;
  questions: Array<{ stimulus: string; response: string }>;
  currentIndex: number;
  voltage: number;
  status: SessionStatus;
  shocks: Array<{ voltage: number; timestamp: Date }>;
  correctAnswers: number;
  incorrectAnswers: number;
  awaitingAnswer: boolean;
}`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="D.3 - Endpoints de l'API">
                    <SlideText>
                        Les routes disponibles dans notre API REST :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-2 |  4-5 | 7-9 | 11-13 | 15-16">
                        {`// Créer une nouvelle session
POST   /api/sessions

// Obtenir la question actuelle
GET    /api/sessions/:id

// Soumettre une réponse
POST   /api/sessions/:id
{ "answer": "ciel" }

// Administrer un choc (si réponse incorrecte)
POST   /api/sessions/:id/shock
{ "voltage": 45 }

// Terminer la session
DELETE /api/sessions/:id`}
                    </SlideCode>
                </SlideScreen>

                {/* Promises */}
                <SlideScreen title="E.1 - Les Promises : gérer l'asynchrone">
                    <SlideNote>
                        {`- JavaScript est mono-thread : une seule chose à la fois.
- Les Promises permettent de gérer des opérations asynchrones sans bloquer.
- Essentiel pour les requêtes HTTP, les timers, la lecture de fichiers, etc.`}
                    </SlideNote>
                    <SlideText>
                        Une Promise représente une valeur qui sera disponible maintenant, plus tard, ou
                        jamais :
                    </SlideText>
                    <SlideList>
                        <SlideListItem>
                            <strong>Pending</strong> : en cours d&apos;exécution.
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Fulfilled</strong> : terminée avec succès (<code>resolve</code>).
                        </SlideListItem>
                        <SlideListItem>
                            <strong>Rejected</strong> : terminée avec erreur (<code>reject</code>).
                        </SlideListItem>
                    </SlideList>
                    <SlideCode language="javascript" highlight="1-6">
                        {`// Création d'une Promise
const maPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Données chargées !");
  }, 2000);
});`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="E.2 - Promises : then / catch / finally">
                    <SlideText>
                        Utiliser les méthodes then, catch et finally pour gérer le résultat :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-3 | 4-6 | 7-9">
                        {`maPromise
  .then((resultat) => {
    console.log(resultat); // "Données chargées !"
  })
  .catch((erreur) => {
    console.error("Erreur :", erreur);
  })
  .finally(() => {
    console.log("Terminé (succès ou erreur)");
  });`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="E.3 - async / await : syntaxe moderne">
                    <SlideNote>
                        {`- async/await est du sucre syntaxique pour les Promises.
- Rend le code asynchrone plus lisible, comme du code synchrone.
- Toujours utiliser try/catch avec async/await pour gérer les erreurs.`}
                    </SlideNote>
                    <SlideText>
                        <code>async/await</code> simplifie l&apos;écriture du code asynchrone :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-8 | 10-18">
                        {`// Fonction asynchrone
async function chargerDonnees() {
  try {
    const resultat = await maPromise;
    console.log(resultat);
  } catch (erreur) {
    console.error("Erreur :", erreur);
  }
}

// Comparaison : Promises vs async/await
// Avec Promises
maPromise
  .then(data => console.log(data))
  .catch(err => console.error(err));

// Avec async/await (plus lisible)
const data = await maPromise;
console.log(data);`}
                    </SlideCode>
                </SlideScreen>

                {/* Fetch */}
                <SlideScreen title="F.1 - Fetch API : introduction">
                    <SlideNote>
                        {`- Fetch est l'API moderne pour faire des requêtes HTTP.
- Remplace XMLHttpRequest (ancien, complexe).
- Retourne toujours une Promise.
- Intégré nativement dans tous les navigateurs modernes.`}
                    </SlideNote>
                    <SlideText>
                        L&apos;API Fetch permet de communiquer avec un serveur depuis le navigateur :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-6 | 8-13">
                        {`// GET simple
const response = await fetch("https://api.example.com/data");
const data = await response.json();
console.log(data);

// Avec gestion d'erreur complète
try {
  const response = await fetch("https://api.example.com/data");
  const data = await response.json();
  console.log(data);
} catch (erreur) {
  console.error("Erreur réseau :", erreur);
}`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="F.2 - Fetch : méthodes HTTP">
                    <SlideText>
                        Les principales méthodes HTTP pour interagir avec une API REST :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-4 | 6-13 | 15-20 | 22-25">
                        {`// GET : Récupérer des données
const response = await fetch("/api/sessions/123");
const session = await response.json();

// POST : Créer une ressource
const response = await fetch("/api/sessions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "Nouvelle session" })
});
const newSession = await response.json();

// PUT : Mettre à jour (remplacer)
const response = await fetch("/api/sessions/123", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Session modifiée" })
});

// DELETE : Supprimer
const response = await fetch("/api/sessions/123", {
  method: "DELETE"
});`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="F.3 - Fetch : headers et corps de requête">
                    <SlideText>
                        Personnaliser les en-têtes et le corps de la requête :
                    </SlideText>
                    <SlideCode language="javascript" highlight="1-11 | 13-14">
                        {`// Requête POST complète avec headers
const response = await fetch("/api/sessions/123", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer mon-token-secret"
  },
  body: JSON.stringify({
    answer: "ciel"
  })
});

const result = await response.json();
console.log(result);`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="F.4 - Fetch : gestion des erreurs (1/3)">
                    <SlideText>
                        ❌ Problème : fetch ne rejette PAS sur 404 ou 500
                    </SlideText>

                    <SlideCode language="javascript">
                        {`try {
  const response = await fetch("/api/data");

  // Même si le serveur renvoie 404,
  // on arrive ici !
  const data = await response.json();

  console.log("Données :", data);

} catch (error) {
  // Seulement erreurs réseau (offline, DNS, etc.)
  console.error("Erreur réseau :", error);
}`}
                    </SlideCode>
                </SlideScreen>
                <SlideScreen title="F.5 - Fetch : gestion des erreurs (2/3)">
                    <SlideText>
                        ✅ Solution : vérifier response.ok
                    </SlideText>

                    <SlideCode language="javascript">
                        {`try {
  const response = await fetch("/api/data");

  if (!response.ok) {
    throw new Error(\`Erreur HTTP : \${response.status}\`);
  }

  const data = await response.json();
  console.log("Données :", data);

} catch (error) {
  console.error("Erreur détectée :", error);
}`}
                    </SlideCode>
                </SlideScreen>
                <SlideScreen title="F.6 - Fetch : gestion des erreurs (3/3)">
                    <SlideText>
                        ✅ Gestion détaillée selon le code HTTP
                    </SlideText>

                    <SlideCode language="javascript">
                        {`const response = await fetch("/api/data");

if (response.status === 404) {
  console.error("Ressource introuvable");
} 
else if (response.status === 401) {
  console.error("Non autorisé");
} 
else if (response.status === 500) {
  console.error("Erreur serveur");
} 
else if (response.ok) {
  const data = await response.json();
  console.log("Succès :", data);
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Sécurité */}
                <SlideScreen title="G.1 - Sécurité : Bearer tokens">
                    <SlideNote>
                        {`- Les tokens Bearer sont un standard pour sécuriser les APIs.
- Format : "Authorization: Bearer <token>"
- Le serveur vérifie le token à chaque requête.
- Ne JAMAIS exposer les tokens dans le code frontend (utiliser variables d'environnement).`}
                    </SlideNote>
                    <SlideText>
                        Les tokens Bearer authentifient les requêtes vers l&apos;API :
                    </SlideText>
                    <div className="grid grid-cols-2 gap-6">
                        <SlideCode language="typescript" highlight="1-11">
                            {`// Backend : Middleware auth
export const authMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ 
      error: "Token manquant" 
    });
  }
  
  const token = authHeader.split(" ")[1];
  if (token !== AUTH_TOKEN) {
    return res.status(403).json({ 
      error: "Token invalide" 
    });
  }
  
  next();
};`}
                        </SlideCode>

                        <SlideCode language="javascript" highlight="1-10">
                            {`// Frontend : Envoi du token
const TOKEN = "milgram-secret-token";

const response = await fetch(
  "/api/sessions",
  {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${TOKEN}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data })
  }
);`}
                        </SlideCode>
                    </div>
                </SlideScreen>

                <SlideScreen title="G.2 - Sécurité : CORS">
                    <SlideNote>
                        {`- CORS = Cross-Origin Resource Sharing
- Mécanisme de sécurité des navigateurs
- Empêche les sites malveillants d'accéder à vos APIs
- Le serveur doit explicitement autoriser les origines`}
                    </SlideNote>
                    <SlideText>
                        CORS contrôle quels sites peuvent accéder à votre API :
                    </SlideText>
                    <SlideCode language="typescript" highlight="1-6 | 8-16">
                        {`// Backend : Activer CORS (tous les domaines)
import cors from "cors";

const app = express();
app.use(cors());  // Autorise tous les domaines

// Backend : CORS restreint (production)
app.use(cors({
  origin: "https://mon-site.com",  // Seulement ce domaine
  methods: ["GET", "POST"],        // Méthodes autorisées
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Si CORS n'est pas configuré côté serveur,
// le navigateur bloquera les requêtes et affichera :
// "CORS policy: No 'Access-Control-Allow-Origin' header"`}
                    </SlideCode>
                </SlideScreen>

                <SlideScreen title="H - Flux complet d'une requête">
                    <SlideText>
                        Comprendre le cheminement complet d&apos;une requête HTTP :
                    </SlideText>

                    <SlideDiagram chart={requestFlowDiagram} />
                </SlideScreen>
            </SlidesScreen>
        </div>
    );
}