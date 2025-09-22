import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Code from "@/components/ui/Code";
import DiagramCard from "@/components/Cards/DiagramCard";

export default function Cours() {
    const chartBasique = `
sequenceDiagram
    participant User as Utilisateur
    participant Browser as Navigateur
    participant Controller as Contrôleur
    participant View as Vue

    User->>Browser: Clique sur \"Voir article\"
    Browser->>Controller: GET article.php?id=1
    Controller->>View: Transmet données
    View-->>Browser: HTML généré
    Browser-->>User: Page affichée
`;

    const chartMVCStructure = `
graph TD
    A[Utilisateur] -->|Requête HTTP| B[Point d'entrée<br/>public/article.php]
    B -->|Instancie| C[Contrôleur<br/>ArticleController]
    C -->|Appelle| D[Vue<br/>article.php]
    D -->|Retourne HTML| A
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#fce4ec
`;

    return (
        <article>
            {/* 1. Introduction */}
            <section>
                <Heading level={2}>Introduction</Heading>
                <Text>
                    Lorsqu&apos;on développe une application web sans méthode particulière, le code a
                    tendance à se transformer en un mélange hétéroclite de logique, de requêtes SQL
                    et de balises HTML dans les mêmes fichiers. Ce type d&apos;organisation, parfois
                    qualifié de <em>spaghetti code</em>, est source de difficultés majeures : manque
                    de lisibilité, duplication, difficultés de maintenance et forte probabilité
                    d&apos;introduire des erreurs lors de la moindre évolution.
                </Text>
                <Text>
                    Pour éviter ces dérives, l&apos;informatique a progressivement adopté des schémas
                    architecturaux éprouvés. Le plus connu dans le développement web est le pattern
                    MVC (<strong>Modèle–Vue–Contrôleur</strong>), qui vise à séparer les
                    responsabilités et à rendre l&apos;application plus robuste et évolutive.
                </Text>
            </section>

            {/* 2. Vue d’ensemble du MVC */}
            <section>
                <Heading level={2}>Vue d&apos;ensemble : le pattern MVC</Heading>
                <Text>
                    Le principe fondamental du MVC repose sur une répartition claire des rôles :
                </Text>
                <List>
                    <ListItem>
                        <strong>Le Modèle</strong> : il gère les données et la logique métier. Par
                        exemple, un objet <Code>Article</Code> qui sait valider son titre et stocker
                        son contenu.
                    </ListItem>
                    <ListItem>
                        <strong>La Vue</strong> : elle se consacre exclusivement à l’affichage. Elle
                        ne décide pas <em>quoi</em> afficher, seulement <em>comment</em> l’afficher.
                    </ListItem>
                    <ListItem>
                        <strong>Le Contrôleur</strong> : il reçoit les requêtes, orchestre le
                        traitement et choisit la Vue appropriée.
                    </ListItem>
                </List>
            </section>

            {/* 3. Organisation du projet */}
            <section>
                <Heading level={2}>Organisation d’un projet MVC</Heading>
                <Text>
                    Pour mettre en œuvre MVC, il est essentiel d&apos;adopter une structure de fichiers
                    cohérente. Cette organisation rend le projet prévisible, facilite la maintenance
                    et permet aux développeurs de collaborer efficacement.
                </Text>
                <CodeCard language={"txt"} showLineNumbers={false}>
                    {`project_tp/
 │
 ├── public/                    ← Seul dossier accessible par le navigateur
 │   ├── index.php              ← Page d'accueil  
 │   ├── article.php            ← Page des articles
 │   └── css/style.css          ← Styles CSS
 │
 ├── app/                       ← Cœur de l'application
 │   ├── controllers/           ← Les contrôleurs (ce cours)
 │   │   ├── ArticleController.php
 │   │   └── UserController.php
 │   │
 │   ├── entities/              ← Les objets métier (cours à venir)
 │   │   ├── Article.php
 │   │   └── User.php
 │   │
 │   ├── repositories/          ← Accès aux données (cours à venir)
 │   │   ├── ArticleRepository.php
 │   │   └── UserRepository.php
 │   │
 │   ├── views/                 ← L'affichage (ce cours)
 │   │   ├── articles/
 │   │   │   ├── list.php
 │   │   │   └── show.php
 │   │   └── _template/
 │   │       ├── header.php
 │   │       └── footer.php
 │   │
 │   └── core/                  ← Classes de base
 │        ├── Repository.php
 │        └── Controller.php
 │
 └── config/
     └── config.php             ← Configuration`}
                </CodeCard>

                <Text>
                    Quelques principes à retenir :
                </Text>
                <List>
                    <ListItem>
                        <Code>public/</Code> est le seul dossier exposé au navigateur ; cela limite
                        les risques d&apos;intrusion.
                    </ListItem>
                    <ListItem>
                        Les <Code>controllers/</Code> définissent la logique des pages accessibles.
                    </ListItem>
                    <ListItem>
                        Les <Code>views/</Code> contiennent les gabarits d&apos;affichage.
                    </ListItem>
                    <ListItem>
                        Les <Code>entities/</Code> et <Code>repositories/</Code> seront étudiés plus
                        tard, lorsqu&apos;on abordera la gestion des données et de la persistance.
                    </ListItem>
                </List>
            </section>

            {/* 4. Rôle du contrôleur */}
            <section>
                <Heading level={2}>Le Contrôleur : chef d’orchestre</Heading>
                <Text>
                    Le contrôleur est la première couche sollicitée lorsqu&apos;une requête HTTP arrive.
                    Sa responsabilité est double : interpréter la demande (paramètres GET, POST,
                    session, etc.) et déterminer la réponse la plus appropriée. Dans la majorité des
                    cas, il prépare des données puis appelle une vue.
                </Text>
                <Text>
                    Un bon contrôleur reste concis : il ne doit pas contenir de logique métier
                    complexe (qui relève du Modèle) ni de code HTML (qui appartient à la Vue).
                </Text>

                <Heading level={3}>Exemple concret : HelloWorldController</Heading>
                <Text>
                    Voici un exemple simple montrant comment un contrôleur transmet des données à une vue,
                    fournit un endpoint JSON et effectue une redirection.
                </Text>

                <CodeCard language="php">
                    {`<?php

use services\\HelloService;

require_once '../app/core/Controller.php';

class HelloWorldController extends Controller
{
    // Affiche la vue hello_world.php avec des données
    public function index(): void
    {
        $this->view('hello_world', 'Hello', ['name' => 'Salim']);
    }

    // Retourne une réponse JSON
    public function indexJson(): void
    {
        $this->json(['title' => 'Hello', 'name' => 'Salim']);
    }    
    
    // Redirige vers la page d'accueil
    public function redirectToHome(): void
    {
        $this->redirectTo('index.php');
    }
}`}
                </CodeCard>

                <Text>
                    <strong>Explications :</strong>
                </Text>
                <List>
                    <ListItem>
                        <strong>Héritage de Controller</strong> : le contrôleur bénéficie des méthodes
                        <Code>view()</Code>, <Code>json()</Code> et <Code>redirectTo()</Code>.
                    </ListItem>
                    <ListItem>
                        <strong>Passage de données à la vue</strong> : la méthode <Code>index()</Code> transmet
                        un tableau <Code>[&apos;name&apos; =&gt; &apos;Salim&apos;]</Code> à la vue <Code>hello_world.php</Code>.
                        La Vue peut ensuite utiliser <Code>&lt;?= $name ?&gt;</Code> pour afficher la valeur.
                    </ListItem>
                    <ListItem>
                        <strong>Endpoint JSON</strong> : <Code>indexJson()</Code> illustre la réponse API.
                    </ListItem>
                    <ListItem>
                        <strong>Redirection</strong> : <Code>redirectToHome()</Code> montre comment rediriger
                        vers une autre page.
                    </ListItem>
                    <ListItem>
                        <strong>Rôle pédagogique</strong> : le contrôleur orchestre le flux, prépare les
                        données, mais n’affiche jamais de HTML ni ne gère la logique métier.
                    </ListItem>
                </List>
            </section>

            {/* 5. Rôle de la vue */}
            <section>
                <Heading level={2}>La Vue : présentation et sécurité</Heading>
                <Text>
                    Les vues se concentrent exclusivement sur la présentation des données transmises
                    par le contrôleur. Dans un projet bien conçu, les vues s&apos;appuient sur des templates réutilisables
                    (entête, pied de page, barre de navigation). Cette factorisation favorise la
                    cohérence visuelle et simplifie l&apos;évolution.
                </Text>

                <Heading level={3}>Syntaxes PHP usuelles dans une Vue</Heading>
                <Text>
                    Une vue peut contenir du HTML enrichi de structures PHP simples comme
                    l&apos;affichage, les conditions ou les boucles. Voici quelques exemples typiques :
                </Text>

                <Heading level={4}>Affichage simple (echo)</Heading>
                <Text>
                    Reprenons l&apos;exemple du contrôleur qui passe <Code>[&apos;name&apos; =&gt; &apos;Salim&apos;]</Code> :
                </Text>
                <CodeCard language="php">
                    {`<!-- Dans la vue hello_world.php -->
<h1>Bonjour <?= $name ?> !</h1>
<p>Bienvenue sur notre site.</p>`}
                </CodeCard>

                <Heading level={4}>Condition (if)</Heading>
                <Text>
                    Si le contrôleur passe <Code>[&apos;name&apos; =&gt; &apos;Salim&apos;, &apos;isLoggedIn&apos; =&gt; true]</Code> :
                </Text>
                <CodeCard language="php">
                    {`<?php if ($isLoggedIn): ?>
    <p>Bonjour <?= $name ?> !</p>
    <a href="logout.php">Déconnexion</a>
<?php else: ?>
    <p><a href="login.php">Connexion</a></p>
<?php endif; ?>`}
                </CodeCard>

                <Heading level={4}>Boucle (foreach)</Heading>
                <Text>
                    Si le contrôleur passe <Code>[&apos;name&apos; =&gt; &apos;Salim&apos;, &apos;articles&apos; =&gt; $listArticles]</Code> :
                </Text>
                <CodeCard language="php">
                    {`<h2>Articles de <?= $name ?></h2>
<ul>
    <?php foreach ($articles as $article): ?>
        <li>
            <a href="article.php?id=<?= $article['id'] ?>">
                <?= $article['title'] ?>
            </a>
        </li>
    <?php endforeach; ?>
</ul>`}
                </CodeCard>

                <Heading level={4}>Combinaison logique</Heading>
                <CodeCard language="php" showLineNumbers={false}>
                    {`<h1>Bienvenue <?= $name ?> !</h1>

<?php if (!empty($articles)): ?>
    <h2>Vos articles</h2>
    <ul>
        <?php foreach ($articles as $article): ?>
            <li><?= $article['title'] ?></li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p>Vous n'avez pas encore d'articles.</p>
<?php endif; ?>`}
                </CodeCard>
            </section>


            <section>
                <Heading level={2}>Schéma représentant la navigation</Heading>
                <div className="flex w-full space-x-8 mt-6">
                    <div className="flex-1 flex flex-col items-center space-y-4 w-full">
                        <DiagramCard chart={chartMVCStructure} />
                        <Text className="text-center">
                            Le cycle typique d&apos;une requête : un utilisateur effectue une action,
                            celle-ci est transmise au contrôleur, qui prépare les données grâce au
                            modèle et délègue l&apos;affichage à la vue.
                        </Text>
                    </div>

                    <div className="flex-1 flex flex-col items-center space-y-4 w-full">
                        <DiagramCard chart={chartBasique} />
                        <Text className="text-center">
                            Ce second schéma illustre le rôle de coordination du contrôleur dans une
                            interaction utilisateur basique.
                        </Text>
                    </div>
                </div>
            </section>
        </article>
    );
}
