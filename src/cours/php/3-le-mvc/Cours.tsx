import {Text} from "@/components/ui/Text";
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
    participant Controller as ArticleController
    participant View as Vue articles/show

    User->>Browser: Clique sur "Voir article"
    Browser->>Controller: GET article.php?id=1
    Controller->>View: Transmet données article
    View-->>Browser: HTML généré
    Browser-->>User: Page article affichée
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
                <Text className="mt-4">
                    Pour éviter ces dérives, l&apos;informatique a progressivement adopté des architectures. La plus connu dans le développement web est le pattern
                    MVC (<strong>Modèle–Vue–Contrôleur</strong>), qui vise à séparer les responsabilités et à rendre l&apos;application plus robuste et évolutive.
                </Text>
            </section>

            {/* 2. Vue d'ensemble du MVC */}
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
                        <strong>La Vue</strong> : elle se consacre exclusivement à l&apos;affichage. Elle
                        ne décide pas <em>quoi</em> afficher, seulement <em>comment</em> l&apos;afficher.
                    </ListItem>
                    <ListItem>
                        <strong>Le Contrôleur</strong> : il reçoit les requêtes, orchestre le
                        traitement et choisit la Vue appropriée.
                    </ListItem>
                </List>


                <Heading level={3}>Principe de séparation des responsabilités</Heading>
                <Text>
                    Pour bien comprendre MVC, imaginons une conversation entre les trois composants
                    lors de l&apos;affichage d&apos;un article :
                </Text>
                <List>
                    <ListItem><strong>Contrôleur</strong> : &quot;L&apos;utilisateur veut voir l&apos;article #1, je récupère les données et prépare l&apos;affichage&quot;</ListItem>
                    <ListItem><strong>Modèle</strong> : &quot;Voici l&apos;article #1 avec ses données validées selon mes règles métier&quot;</ListItem>
                    <ListItem><strong>Vue</strong> : &quot;Je reçois ces données et je génère le HTML correspondant&quot;</ListItem>
                </List>

                <Text>
                    Chaque composant a un rôle précis et ne dépasse jamais ses responsabilités. Cette
                    discipline architecturale facilite la maintenance, les tests et l&apos;évolution de l&apos;application.
                </Text>

                <Heading level={3}>Flux d&apos;une requête MVC</Heading>
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

            {/* 3. Organisation du projet */}
            <section>
                <Heading level={2}>Organisation d&apos;un projet MVC</Heading>
                <Text>
                    Pour mettre en œuvre MVC, il est essentiel d&apos;adopter une structure de fichiers . Cette organisation facilite la maintenance
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
 │   ├── entities/              ← Les objets métier (TP5)
 │   │   ├── Article.php
 │   │   └── User.php
 │   │
 │   ├── repositories/          ← Accès aux données (TP5)
 │   │   ├── ArticleRepository.php
 │   │   └── UserRepository.php
 │   │
 │   ├── views/                 ← L'affichage (ce cours)
 │   │   ├── articles/
 │   │   │   ├── list.html.php
 │   │   │   └── show.html.php
 │   │   └── _template/
 │   │       ├── header.html.php
 │   │       └── footer.html.php
 │   │
 │   └── core/                  ← Classes de base
 │        ├── Repository.php
 │        └── Controller.php
 │
 └── config/
     └── config.php             ← Configuration (TP5)`}
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

                <Text>
                    <strong>Note :</strong> Le Modèle (entités, repositories, logique métier) sera
                    développé en détail dans un prochain TP. Pour l&apos;instant, concentrons-nous sur
                    la coordination entre Contrôleur et Vue.
                </Text>
            </section>

            {/* 4. Point d'entrée et appel du contrôleur */}
            <section>
                <Heading level={2}>Point d&apos;entrée : appeler le contrôleur</Heading>
                <Text>
                    Dans le dossier <Code>public/</Code>, chaque page PHP constitue un point d&apos;entrée
                    qui instancie et appelle le contrôleur approprié. Voici comment procéder :
                </Text>

                <CodeCard language="php">
                    {`<?php
// public/article.php - Point d'entrée pour les articles

require_once '../app/controllers/ArticleController.php';

// Instanciation et appel de l'action
$controller = new ArticleController();
$controller->index();
?>`}
                </CodeCard>

                <Text>
                    <strong>Principe :</strong> Le fichier dans <Code>public/</Code> sert uniquement
                    de <em>pont</em> entre l&apos;URL et le contrôleur. Il ne contient aucune logique métier
                    ni HTML.
                </Text>
            </section>

            {/* 5. Rôle du contrôleur */}
            <section>
                <Heading level={2}>Le Contrôleur : chef d&apos;orchestre</Heading>
                <Text>
                    Le contrôleur est la première couche sollicitée lorsqu&apos;une requête HTTP arrive.
                    Sa responsabilité est double :</Text>
                <List>
                    <ListItem>Interpréter la demande (paramètres GET, POST, session, etc.)</ListItem>
                    <ListItem>Déterminer la réponse la plus appropriée.</ListItem>
                </List>
                <Text className="mt-4">Dans la majorité des cas, il prépare des données puis appelle une vue.
                </Text>
                <Text>
                    Un bon contrôleur reste concis : il ne doit pas contenir de logique métier
                    complexe (qui relève du Modèle) ni de code HTML (qui appartient à la Vue).
                </Text>

                <Heading level={3}>Méthodes héritées de la classe Controller</Heading>
                <Text className={"mb-4"}>
                    La classe <Code>Controller</Code> fournit des méthodes utilitaires
                    qui évitent de réécrire des opérations courantes comme l&apos;affichage d’une vue, l’envoi de données au format JSON
                    ou la redirection vers une autre page.
                </Text>

                <List ordered>
                    <ListItem>
                        <Code>protected function view(string $viewName, string $title = &apos;Titre de la page&apos;, array $data = [], int $status = 200)</Code>Affiche une vue PHP.
                        <List>
                            <ListItem><Code>$viewName</Code> : chemin relatif de la vue (ex. <Code>&apos;articles/list&apos;</Code>).</ListItem>
                            <ListItem><Code>$title</Code> : titre envoyé à la vue dans la balise <Code>title</Code> du <Code>head</Code>.</ListItem>
                            <ListItem><Code>$data</Code> : tableau associatif de données. Chaque clé devient une variable dans la vue.</ListItem>
                            <ListItem><Code>$status</Code> : code HTTP (par défaut 200, mais peut être 404, 500...).</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Code>protected function json($data, int $status = 200)</Code>
                        Retourne une réponse JSON.
                        <List>
                            <ListItem><Code>$data</Code> : données à encoder en JSON.</ListItem>
                            <ListItem><Code>$status</Code> : code HTTP (200 par défaut, mais peut être 404, 500...).</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Code>protected function redirectTo(string $url)</Code>
                        Redirige immédiatement vers une autre page.
                        <List>
                            <ListItem><Code>$url</Code> : l’URL de destination (ex. <Code>&apos;index.php&apos;</Code>).</ListItem>
                        </List>
                    </ListItem>
                </List>

                <Heading level={3}>Exemple : ArticleController</Heading>
                <Text>
                    Voici un exemple montrant comment un contrôleur transmet des données à une vue,
                    fournit un endpoint JSON et effectue une redirection.
                </Text>

                <CodeCard language="php">
                    {`<?php

require_once '../app/core/Controller.php';

class ArticleController extends Controller
{
    // Affiche la liste des articles
    public function index(): void
    {
        $articles = [
            ['id' => 1, 'title' => 'PS5', 'content' => '...'],
            ['id' => 2, 'title' => 'XBox 360', 'content' => '...']
        ];
        // protected function view(string $viewName, string $title = 'Titre de la page', array $data = [], $status = 200)
        $this->view('articles/list', 'Liste des articles', ['articles' => $articles]);
    }

    // Affiche un article spécifique
    public function show(): void
    {
        $article = ['id' => 1, 'title' => 'PS5', 'content' => 'Contenu...'];
        
         // protected function view(string $viewName, string $title = 'Titre de la page', array $data = [], $status = 200)
        $this->view('articles/show', $article['title'], ['article' => $article]);
    }

    // Retourne la liste des articles en JSON
    public function indexJson(): void
    {
        $articles = [
            ['id' => 1, 'title' => 'PS5'],
            ['id' => 2, 'title' => 'XBox 360']
        ];
        // protected function json($data, $status = 200)
        $this->json(['articles' => $articles]);
    }    
    
    // Redirige vers la page d'accueil
    public function redirectToHome(): void
    {
        // protected function redirectTo($url)
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
                        <Code>view()</Code>, <Code>json()</Code> et <Code>redirectTo()</Code>, définit dans la class mére <Code>Controller</Code>.
                    </ListItem>
                    <ListItem>
                        <strong>Passage de données à la vue</strong> : la méthode <Code>index()</Code> transmet
                        un tableau <Code>[&apos;articles&apos; =&gt; $articles]</Code> à la vue <Code>articles/list.php</Code>.
                        La méthode <Code>view()</Code> va créer une variable par cléf du tableau
                        <Code>$data</Code> et l&apos;injecter dans la vue.
                        La Vue peut donc les utiliser <Code>&lt;?php foreach($articles as $article): ?&gt;</Code>
                        pour afficher la liste.
                    </ListItem>
                    <ListItem>
                        <strong>Endpoint JSON</strong> : <Code>indexJson()</Code> illustre comment fournir
                        les mêmes données sous format JSON pour une API.
                    </ListItem>
                    <ListItem>
                        <strong>Redirection</strong> : <Code>redirectToHome()</Code> montre comment rediriger
                        vers une autre page.
                    </ListItem>
                </List>
            </section>

            {/* 6. Le Modèle : aperçu rapide */}
            <section>
                <Heading level={2}>Le Modèle : aperçu rapide</Heading>
                <Text>
                    Le <strong>Modèle</strong> représente la couche métier de l&apos;application. Il gère
                    les données, applique les règles de validation et contient la logique spécifique
                    au domaine. Elle est indépendante de la manière dont les informations sont
                    transmises au contrôleur (formulaire, fichier JSON, etc.).
                </Text>
                <Text>
                    Cette indépendance est fondamentale : le Modèle ne doit jamais se préoccuper de
                    savoir si les données proviennent d&apos;un formulaire web, d&apos;une API REST, d&apos;un fichier
                    CSV ou d&apos;une interface en ligne de commande. Il se contente de recevoir des données,
                    de les valider selon ses règles métier et de les traiter. Cette séparation garantit
                    la réutilisabilité : un même modèle <Code>Article</Code> peut être utilisé dans
                    une application web, une API mobile ou un script de migration de données.
                </Text>
            </section>

            {/* 7. Rôle de la vue */}
            <section>
                <Heading level={2}>La Vue : génération du HTML</Heading>
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
                    Reprenons l&apos;exemple du contrôleur qui passe <Code>[&apos;article&apos; =&gt; $article]</Code> :
                </Text>
                <CodeCard language="php">
                    {`<!-- Dans la vue articles/show.php -->
<h1><?= $article['title'] ?></h1>
<p>
    <?= $article['content'] ?>
</p>`}
                </CodeCard>

                <Heading level={4}>Condition (if)</Heading>
                <Text>
                    Si le contrôleur passe <Code>[&apos;articles&apos; =&gt; $articles, &apos;isAuthor&apos; =&gt; true]</Code> :
                </Text>
                <CodeCard language="php">
                    {`<?php if ($isAuthor): ?>
    <a href="article_create.php" class="btn">Créer un article</a>
<?php else: ?>
    <p>Seuls les auteurs peuvent créer des articles.</p>
<?php endif; ?>`}
                </CodeCard>

                <Heading level={4}>Boucle (foreach)</Heading>
                <Text>
                    Si le contrôleur passe <Code>[&apos;articles&apos; =&gt; $articles]</Code> :
                </Text>
                <CodeCard language="php">
                    {`<h2>Liste des articles</h2>
<ul class="articles-list">
    <?php foreach ($articles as $article): ?>
        <li>
            <h3>
                <a href="article.php?id=<?= $article['id'] ?>">
                    <?= $article['title'] ?>
                </a>
            </h3>
            <p><?= substr($article['content'], 0, 100) ?>...</p>
        </li>
    <?php endforeach; ?>
</ul>`}
                </CodeCard>

                <Heading level={4}>Combinaison logique</Heading>
                <CodeCard language="php" showLineNumbers={false}>
                    {`<h1>Gestion des articles</h1>

<?php if (!empty($articles)): ?>
    <h2>Articles disponibles</h2>
    <div class="articles-grid">
        <?php foreach ($articles as $article): ?>
            <article class="article-card">
                <h3><?= $article['title'] ?></h3>
                <p><?= substr($article['content'], 0, 150) ?>...</p>
                <a href="article.php?id=<?= $article['id'] ?>">Lire la suite</a>
            </article>
        <?php endforeach; ?>
    </div>
<?php else: ?>
    <p>Aucun article disponible pour le moment.</p>
    <a href="article_create.php">Créer le premier article</a>
<?php endif; ?>`}
                </CodeCard>
            </section>
        </article>
    );
}