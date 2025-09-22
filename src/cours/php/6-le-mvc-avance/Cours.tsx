import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Code from "@/components/ui/Code";
import DiagramCard from "@/components/Cards/DiagramCard";

export default function Cours() {
    const chartBasique = `
sequenceDiagram
    participant Router as Routeur
    participant Controller as Controller
    participant Vue as Vue

    Router->>Controller: faire une requête (ex: accéder à un article)
    Controller->>Vue: envoyer les données de l'article
    Vue-->>Router: afficher l'article
`;

    return (
        <article>
            {/* Introduction générale */}
            <section>
                <Text>
                    Ce cours présente les concepts architecturaux fondamentaux pour développer des applications web
                    robustes et maintenables. Nous aborderons d&apos;abord les principes théoriques (Clean Architecture et SOLID),
                    puis nous verrons leur application pratique avec le pattern MVC dans un contexte simplifié pour les TP.
                </Text>
            </section>

            {/* Clean Architecture */}
            <section>
                <Heading level={2}>Clean Architecture</Heading>
                <Text>
                    La Clean Architecture, proposée par Robert Martin (Uncle Bob), est une approche architecturale qui
                    vise à créer des systèmes logiciels maintenables, testables et indépendants des frameworks. Elle
                    organise le code en couches concentriques où les dépendances pointent toujours vers l&apos;intérieur.
                </Text>

                <Heading level={3}>Les 4 couches principales</Heading>

                <List ordered>
                    <ListItem><strong>Entités</strong> : Contiennent les règles métier fondamentales et sont
                        complètement indépendantes de toute technologie.</ListItem>
                    <ListItem><strong>Cas d&apos;usage</strong> : Définissent la logique applicative spécifique
                        et orchestrent les entités.</ListItem>
                    <ListItem><strong>Adaptateurs d&apos;interface</strong> : Convertissent les données entre
                        les cas d&apos;usage et les couches externes.</ListItem>
                    <ListItem><strong>Frameworks et pilotes</strong> : Contiennent les détails techniques comme
                        la base de données, l&apos;interface utilisateur, etc.</ListItem>
                </List>

                <Heading level={3}>Structure avec Clean Architecture</Heading>
                <CodeCard language={'txt'} showLineNumbers={false}>
                    {`project_clean/
 │
 ├── src/
 │   ├── Domain/              # Couche Entités
 │   │   ├── Entities/
 │   │   │   ├── Article.php
 │   │   │   └── User.php
 │   │   └── Interfaces/
 │   │       ├── ArticleRepositoryInterface.php
 │   │       └── UserRepositoryInterface.php
 │   │
 │   ├── Application/         # Couche Cas d'usage
 │   │   ├── UseCases/
 │   │   │   ├── CreateArticle.php
 │   │   │   ├── GetArticle.php
 │   │   │   └── ListArticles.php
 │   │   └── DTOs/
 │   │       ├── ArticleDTO.php
 │   │       └── CreateArticleRequest.php
 │   │
 │   ├── Infrastructure/      # Couche Frameworks
 │   │   ├── Database/
 │   │   │   ├── ArticleRepository.php
 │   │   │   └── UserRepository.php
 │   │   └── Web/
 │   │       ├── Controllers/
 │   │       │   └── ArticleController.php
 │   │       └── Views/
 │   │           └── article.php
 │   │
 │   └── Interfaces/          # Couche Adaptateurs
 │       ├── Http/
 │       │   └── ArticlePresenter.php
 │       └── CLI/
 │           └── ArticleCommand.php
 │
 └── public/
     └── index.php`}
                </CodeCard>

                <Heading level={3}>Exemple d&apos;implémentation</Heading>
                <Text>Voici comment structurer un cas d&apos;usage pour créer un article :</Text>

                <CodeCard language={'php'}>
                    {`<?php
// Domain/Entities/Article.php
class Article
{
    private string $title;
    private string $content;
    private DateTime $createdAt;

    public function __construct(string $title, string $content)
    {
        $this->validateTitle($title);
        $this->title = $title;
        $this->content = $content;
        $this->createdAt = new DateTime();
    }

    private function validateTitle(string $title): void
    {
        if (strlen($title) < 3) {
            throw new InvalidArgumentException('Title must be at least 3 characters');
        }
    }

    // Getters...
    public function getTitle(): string { return $this->title; }
    public function getContent(): string { return $this->content; }
}`}
                </CodeCard>

                <CodeCard language={'php'}>
                    {`<?php
// Application/UseCases/CreateArticle.php
class CreateArticle
{
    private ArticleRepositoryInterface $articleRepository;

    public function __construct(ArticleRepositoryInterface $articleRepository)
    {
        $this->articleRepository = $articleRepository;
    }

    public function execute(CreateArticleRequest $request): ArticleDTO
    {
        // Validation et logique métier
        $article = new Article($request->title, $request->content);
        
        // Sauvegarde
        $savedArticle = $this->articleRepository->save($article);
        
        // Retour d'un DTO
        return new ArticleDTO($savedArticle);
    }
}`}
                </CodeCard>
            </section>

            {/* Principes SOLID */}
            <section>
                <Heading level={2}>Les Principes SOLID</Heading>
                <Text>
                    SOLID est un acronyme qui représente cinq principes de conception orientée objet. Ces principes
                    permettent de créer des logiciels plus maintenables, extensibles et compréhensibles.
                </Text>

                <Heading level={3}>S - Single Responsibility Principle (SRP)</Heading>
                <Text>
                    Une classe ne doit avoir qu&apos;une seule raison de changer. Chaque classe doit avoir une
                    responsabilité unique et bien définie.
                </Text>

                <Text><strong>❌ Mauvais exemple :</strong></Text>
                <CodeCard language={'php'}>
                    {`<?php
class User
{
    public function save(): void
    {
        // Logique de sauvegarde en base
        $pdo = new PDO(/* ... */);
        // Code SQL...
    }

    public function sendEmail(): void
    {
        // Logique d'envoi d'email
        mail(/* ... */);
    }

    public function generateReport(): string
    {
        // Génération de rapport
        return "Report content...";
    }
}`}
                </CodeCard>

                <Text><strong>✅ Bon exemple :</strong></Text>
                <CodeCard language={'php'}>
                    {`<?php
class User
{
    private string $email;
    private string $name;
    
    // Uniquement les propriétés et méthodes liées à l'entité User
}

class UserRepository
{
    public function save(User $user): void
    {
        // Logique de sauvegarde
    }
}

class EmailService
{
    public function sendEmail(User $user, string $message): void
    {
        // Logique d'envoi d'email
    }
}

class ReportGenerator
{
    public function generateUserReport(User $user): string
    {
        // Génération de rapport
        return "Report for " . $user->getName();
    }
}`}
                </CodeCard>

                <Heading level={3}>O - Open/Closed Principle (OCP)</Heading>
                <Text>
                    Les classes doivent être ouvertes à l&apos;extension mais fermées à la modification.
                    On peut ajouter de nouvelles fonctionnalités sans modifier le code existant.
                </Text>

                <CodeCard language={'php'}>
                    {`<?php
// Interface pour l'extension
interface PaymentProcessor
{
    public function process(float $amount): bool;
}

// Implémentations spécifiques
class CreditCardProcessor implements PaymentProcessor
{
    public function process(float $amount): bool
    {
        // Traitement carte de crédit
        return true;
    }
}

class PayPalProcessor implements PaymentProcessor
{
    public function process(float $amount): bool
    {
        // Traitement PayPal
        return true;
    }
}

// Nouveau processeur sans modifier l'existant
class CryptoProcessor implements PaymentProcessor
{
    public function process(float $amount): bool
    {
        // Traitement crypto-monnaie
        return true;
    }
}`}
                </CodeCard>

                <Heading level={3}>L - Liskov Substitution Principle (LSP)</Heading>
                <Text>
                    Les objets d&apos;une classe dérivée doivent pouvoir remplacer les objets de la classe
                    de base sans altérer la fonctionnalité du programme.
                </Text>

                <CodeCard language={'php'}>
                    {`<?php
abstract class Bird
{
    abstract public function move(): string;
}

class Sparrow extends Bird
{
    public function move(): string
    {
        return "Flying";
    }
}

class Penguin extends Bird
{
    public function move(): string
    {
        return "Swimming and walking"; // Respecte le contrat
    }
}

// Usage - toutes les classes dérivées peuvent être substituées
function makeBirdMove(Bird $bird): string
{
    return $bird->move(); // Fonctionne avec tous les types de Bird
}`}
                </CodeCard>

                <Heading level={3}>I - Interface Segregation Principle (ISP)</Heading>
                <Text>
                    Les clients ne doivent pas être forcés de dépendre d&apos;interfaces qu&apos;ils n&apos;utilisent pas.
                    Il vaut mieux avoir plusieurs interfaces spécifiques qu&apos;une interface générale.
                </Text>

                <Text><strong>❌ Mauvais exemple :</strong></Text>
                <CodeCard language={'php'}>
                    {`<?php
interface WorkerInterface
{
    public function work(): void;
    public function eat(): void;
    public function sleep(): void;
}

class Robot implements WorkerInterface
{
    public function work(): void { /* travail */ }
    public function eat(): void { /* ??? Robot ne mange pas */ }
    public function sleep(): void { /* ??? Robot ne dort pas */ }
}`}
                </CodeCard>

                <Text><strong>✅ Bon exemple :</strong></Text>
                <CodeCard language={'php'}>
                    {`<?php
interface Workable
{
    public function work(): void;
}

interface Eatable
{
    public function eat(): void;
}

interface Sleepable
{
    public function sleep(): void;
}

class Human implements Workable, Eatable, Sleepable
{
    public function work(): void { /* travail */ }
    public function eat(): void { /* manger */ }
    public function sleep(): void { /* dormir */ }
}

class Robot implements Workable
{
    public function work(): void { /* travail */ }
    // Pas besoin d'implémenter eat() et sleep()
}`}
                </CodeCard>

                <Heading level={3}>D - Dependency Inversion Principle (DIP)</Heading>
                <Text>
                    Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau.
                    Les deux doivent dépendre d&apos;abstractions. Les abstractions ne doivent pas
                    dépendre des détails, mais les détails doivent dépendre des abstractions.
                </Text>

                <Text><strong>❌ Mauvais exemple :</strong></Text>
                <CodeCard language={'php'}>
                    {`<?php
class MySQLDatabase
{
    public function save(array $data): void
    {
        // Code spécifique à MySQL
    }
}

class OrderService
{
    private MySQLDatabase $database;

    public function __construct()
    {
        $this->database = new MySQLDatabase(); // Dépendance forte
    }
}`}
                </CodeCard>

                <Text><strong>✅ Bon exemple :</strong></Text>
                <CodeCard language={'php'}>
                    {`<?php
interface DatabaseInterface
{
    public function save(array $data): void;
}

class MySQLDatabase implements DatabaseInterface
{
    public function save(array $data): void
    {
        // Code spécifique à MySQL
    }
}

class PostgreSQLDatabase implements DatabaseInterface
{
    public function save(array $data): void
    {
        // Code spécifique à PostgreSQL
    }
}

class OrderService
{
    private DatabaseInterface $database;

    public function __construct(DatabaseInterface $database)
    {
        $this->database = $database; // Dépendance sur l'abstraction
    }
}`}
                </CodeCard>

                <Heading level={3}>Application pratique des principes SOLID</Heading>
                <Text>
                    Voici comment appliquer ces principes dans une architecture web :
                </Text>

                <CodeCard language={'php'}>
                    {`<?php
// Respecte SRP : ne gère que les articles
class ArticleController
{
    private ArticleServiceInterface $articleService;

    // Respecte DIP : dépend d'une interface
    public function __construct(ArticleServiceInterface $articleService)
    {
        $this->articleService = $articleService;
    }

    public function show(int $id): Response
    {
        try {
            $article = $this->articleService->findById($id);
            return new JsonResponse($article->toArray());
        } catch (ArticleNotFoundException $e) {
            return new JsonResponse(['error' => 'Article not found'], 404);
        }
    }

    public function create(CreateArticleRequest $request): Response
    {
        $article = $this->articleService->create($request);
        return new JsonResponse($article->toArray(), 201);
    }
}`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>Synthèse des concepts théoriques</Heading>
                <Text>
                    La Clean Architecture et les principes SOLID forment ensemble un cadre théorique solide pour
                    concevoir des applications maintenables. Ces concepts peuvent paraître complexes au début, mais
                    ils deviennent essentiels pour développer des applications professionnelles robustes.
                </Text>

                <Text>
                    Dans la suite de ce cours, nous allons voir comment appliquer ces concepts dans un contexte
                    pédagogique simplifié avec le pattern MVC, adapté aux besoins des TP.
                </Text>
            </section>

            {/* ======================== PARTIE PRATIQUE POUR LES TP ======================== */}

            <section>
                <Heading level={2}>🎯 Application pratique : MVC simplifié pour les TP</Heading>
                <Text>
                    Cette section présente une implémentation simplifiée du pattern MVC, adaptée pour les travaux pratiques.
                    Nous gardons les concepts fondamentaux tout en réduisant la complexité pour faciliter l&apos;apprentissage.
                </Text>
            </section>

            {/* Introduction au modèle MVC */}
            <section>
                <Heading level={3}>Le modèle MVC (Modèle-Vue-Contrôleur)</Heading>
                <Text>
                    Le modèle MVC est une architecture logicielle qui permet de structurer les
                    applications web en séparant la logique métier, la présentation, et le contrôle des interactions
                    utilisateurs.
                </Text>
                <List>
                    <ListItem><strong>Modèle (Model)</strong> : Gère les données et la logique métier.</ListItem>
                    <ListItem><strong>Vue (View)</strong> : Affiche les données à l&apos;utilisateur.</ListItem>
                    <ListItem><strong>Contrôleur (Controller)</strong> : Gère les interactions entre l&apos;utilisateur
                        et l&apos;application.</ListItem>
                </List>
            </section>

            {/* Structure d'un projet MVC */}
            <section>
                <Heading level={3}>Structure d&apos;un Projet MVC pour les TP</Heading>
                <Text>Cette structure est volontairement simplifiée pour les exercices pratiques :</Text>

                <CodeCard language={'txt'} showLineNumbers={false}>
                    {`project_tp/
 │
 ├── app/
 │   ├── controllers/
 │   │   ├── ArticleController.php
 │   │   ├── CategoryController.php
 │   │   └── UserController.php
 │   │ 
 │   ├── entities/
 │   │   ├── Article.php
 │   │   ├── Category.php
 │   │   └── User.php
 │   │
 │   ├── repositories/
 │   │   ├── ArticleRepository.php
 │   │   ├── CategoryRepository.php
 │   │   └── UserRepository.php
 │   │
 │   ├── views/
 │   │   ├── article.php
 │   │   ├── category.php
 │   │   └── user.php
 │   │
 │   └─ core/
 │      ├── Repository.php
 │      └── Controller.php
 │   
 ├── config/
 │   └── config.php
 │   
 └── public/
     ├── index.php 
     ├── print_hello.php
     └── css/
         └── style.css`}
                </CodeCard>
            </section>

            {/* Explication des dossiers */}
            <section>
                <Heading level={3}>Rôle de chaque dossier</Heading>
                <List>
                    <ListItem><strong>/app/controllers</strong> : Contient les contrôleurs. Chaque contrôleur est
                        chargé
                        de gérer une partie spécifique de l&apos;application (par
                        exemple, <code>ArticleController.php</code> pour gérer les articles).</ListItem>
                    <ListItem><strong>/app/entities</strong> : Contient les entités, qui représentent les objets métier
                        (comme <code>Article.php</code> pour un article).</ListItem>
                    <ListItem><strong>/app/repositories</strong> : Contient les repositories, qui contiennent les
                        requêtes SQL concernant chaque entité (comme <code>ArticleRepository.php</code> pour un
                        article).</ListItem>
                    <ListItem><strong>/app/views</strong> : Les vues sont des fichiers qui présentent les données à
                        l&apos;utilisateur. Par exemple, <code>article.php</code> affiche une liste d&apos;articles ou
                        un article individuel.</ListItem>
                    <ListItem><strong>/app/core</strong> : Contient les classes de base
                        (comme <code>Controller.php</code>) qui définissent des comportements partagés par
                        l&apos;ensemble des contrôleurs.</ListItem>
                    <ListItem><strong>/config</strong> : Contient les fichiers de configuration (comme la connexion à
                        la
                        base de données dans <code>config.php</code>).</ListItem>
                    <ListItem><strong>/public</strong> : Contient les fichiers publics, comme <code>index.php</code> et
                        les fichiers CSS ou JavaScript. Ils sont les seuls accessibles depuis le navigateur.</ListItem>
                </List>
            </section>

            {/* Rôle des contrôleurs */}
            <section>
                <Heading level={3}>Le rôle des Contrôleurs</Heading>
                <Text>
                    Les contrôleurs sont responsables de la logique applicative. Lorsqu&apos;un utilisateur effectue une
                    requête (par exemple, accéder à une page d&apos;article), le contrôleur associé traite cette
                    requête, récupère les données nécessaires via le modèle ou le service, et les envoie à la vue pour
                    affichage.
                </Text>

                <Heading level={4}>Exemple de Contrôleur</Heading>
                <Text>
                    Voici un exemple de contrôleur en PHP, nommé <code>HelloWorldController.php</code>, qui utilise un
                    service pour afficher un texte.
                </Text>
                <CodeCard language={'php'}>
                    {`<?php
require_once '../app/core/Controller.php';

class HelloWorldController extends Controller
{
    public function index():void
    {
      $this->view('hello_world', 'Hello', ['name' => 'Salim']);
    }

    public function indexJson():void
    {
      $this->json(['title' => 'Hello', 'name' => 'Salim']);
    }    
    
    public function redirectToHome():void
    {
       $this->redirectTo('index.php');
    }
}
`}
                </CodeCard>
            </section>

            {/* Rôle des Vues */}
            <section>
                <Heading level={3}>Le rôle des Vues</Heading>
                <Text>
                    Les vues sont responsables de l&apos;affichage des données à l&apos;utilisateur. Elles reçoivent les
                    données du contrôleur et les formatent en HTML pour être affichées dans le navigateur. Les vues
                    n&apos;ont pas de logique métier ; elles ne font qu&apos;afficher les données.
                </Text>
                <Text>
                    Les variables disponibles dans la vue sont créées par les paramètres
                    de <Code>{`$this->view('login', 'login', ['errors' => ['Login incorrect']])`}</Code>. Dans la vue,
                    la clé <Code>&apos;errors&apos;</Code> devient la variable <Code>$errors</Code>.
                </Text>
                <CodeCard language={'php'}>
                    {`<?php require '../app/views/_template/header.php'; ?>
<h1>Hello <?= $name; ?></h1>

<?php if (!empty($errors)): ?>
    <?php foreach($errors as $error): ?>
        <div class="alert alert-danger text-center" role="alert">
            <?= $error; ?>
        </div>
    <?php endforeach; ?>
<?php endif; ?>

<?php require '../app/views/_template/footer.php'; ?>`}
                </CodeCard>

                <Text>
                    Plusieurs façons de structurer le code conditionnel et les boucles existent. Les
                    syntaxes <code>endif</code> et <code>endforeach</code> sont des alternatives aux
                    accolades <code>{}</code>, souvent utilisées pour intégrer PHP dans du HTML.
                </Text>
            </section>

            {/* Rôle des Modèles */}
            <section>
                <Heading level={3}>Le rôle des Modèles</Heading>
                <Text>
                    Les modèles gèrent la logique métier et les interactions avec la base de données. Ils sont
                    responsables de la récupération, de l&apos;insertion, et de la modification des données. Les entités
                    comme <code>Article</code> ou <code>User</code> sont des représentations de ces données, mais nous
                    verrons dans le prochain module comment les modèles communiquent avec la base de données via les
                    repositories.
                </Text>
            </section>

            <section>
                <Heading level={3}>La page appelée par le navigateur</Heading>
                <Text>
                    Cette page PHP du dossier <Code>public</Code> établit le lien entre nos classes du
                    dossier <Code>app</Code> et le navigateur. Son unique rôle est d&apos;appeler une méthode d&apos;un
                    contrôleur.
                </Text>
                <CodeCard language="php">
                    {`<?php
require_once '../app/controllers/HelloWorldController.php';
(new HelloWorldController())->index();
?>`}
                </CodeCard>
            </section>

            <section>
                <Heading level={3}>Schéma de navigation d&apos;une page simple</Heading>
                <DiagramCard chart={chartBasique}></DiagramCard>
            </section>
        </article>
    );
}