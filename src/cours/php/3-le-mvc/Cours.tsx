import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import DiagramCard from "@/components/Cards/DiagramCard";
import Code from "@/components/ui/Code";

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
            {/* Introduction au modèle MVC */}
            <section>
                <Text>
                    Le modèle MVC (Modèle-Vue-Contrôleur) est une architecture logicielle qui permet de structurer les
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
                <Heading level={2}>Structure d&apos;un Projet MVC</Heading>
                <Heading level={3}>Schéma de l&apos;Arborescence des Dossiers</Heading>
                <CodeCard language={'txt'} showLineNumbers={false}>
                    {`project_root/
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
                <Heading level={2}>Le rôle des Contrôleurs</Heading>
                <Text>
                    Les contrôleurs sont responsables de la logique applicative. Lorsqu&apos;un utilisateur effectue une
                    requête (par exemple, accéder à une page d&apos;article), le contrôleur associé traite cette
                    requête, récupère les données nécessaires via le modèle ou le service, et les envoie à la vue pour
                    affichage.
                </Text>

                <Heading level={3}>Exemple de Contrôleur</Heading>
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
                <Heading level={2}>Le rôle des Vues</Heading>
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
                <Heading level={2}>Le rôle des Modèles</Heading>
                <Text>
                    Les modèles gèrent la logique métier et les interactions avec la base de données. Ils sont
                    responsables de la récupération, de l&apos;insertion, et de la modification des données. Les entités
                    comme <code>Article</code> ou <code>User</code> sont des représentations de ces données, mais nous
                    verrons dans le prochain module comment les modèles communiquent avec la base de données via les
                    repositories.
                </Text>
            </section>

            <section>
                <Heading level={2}>La page appelée par le navigateur</Heading>
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
                <Heading level={2}>Schéma de navigation d&apos;une page simple</Heading>
                <DiagramCard chart={chartBasique}></DiagramCard>
            </section>
        </article>
    );
}