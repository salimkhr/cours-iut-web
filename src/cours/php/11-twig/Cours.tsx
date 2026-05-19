import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Code from "@/components/ui/Code";
import CoursePrerequisites from "@/components/CoursePrerequisites";

export default function Cours() {
    return (
        <article>
            <CoursePrerequisites>
                <Text><strong>Vues PHP natif</strong> — une vue PHP mélange HTML et balises <Code>&lt;?php ... ?&gt;</Code> ; <Code>htmlspecialchars()</Code> doit être appelée manuellement sur chaque variable affichée.</Text>
                <CodeCard language="php" title="Vue PHP natif">
                    {`<h2><?= htmlspecialchars($article->getName()) ?></h2>
<p><?= htmlspecialchars($article->getContent()) ?></p>`}
                </CodeCard>
                <Text><strong>Contrôleur Symfony</strong> — un contrôleur retourne un objet <Code>Response</Code> ; la méthode <Code>render()</Code> compile un template et renvoie le HTML généré.</Text>
                <CodeCard language="php" title="render() dans Symfony">
                    {`return $this->render('articles/list.html.twig', [
    'articles' => $articles,
]);`}
                </CodeCard>
                <Text><strong>Variables passées à la vue</strong> — le deuxième argument de <Code>render()</Code> est un tableau associatif ; chaque clé devient une variable disponible dans le template.</Text>
            </CoursePrerequisites>

            {/* 0. Introduction */}
            <section>
                <Heading level={2}>Pourquoi Twig ?</Heading>
                <Text>
                    Dans le cours précédent, vos vues ressemblaient à ceci :
                </Text>
                <CodeCard language="php" filename="articles/list.html.php">
                    {`<h2>Liste des articles</h2>
<ul>
    <?php foreach ($articles as $article): ?>
        <li>
            <h3><?= htmlspecialchars($article->getName()) ?></h3>
            <p><?= htmlspecialchars($article->getContent()) ?></p>
        </li>
    <?php endforeach; ?>
</ul>`}
                </CodeCard>
                <Text>
                    Ce code fonctionne, mais il souffre de plusieurs problèmes récurrents dans les vues PHP
                    natif :
                </Text>
                <List>
                    <ListItem>
                        <strong>Sécurité fragile</strong> : il faut penser à appeler{" "}
                        <Code>htmlspecialchars()</Code> sur <em>chaque</em> variable affichée, sans quoi
                        un utilisateur malveillant peut injecter du HTML ou du JavaScript dans la page
                        (attaque XSS). Un oubli suffit.
                    </ListItem>
                    <ListItem>
                        <strong>Lisibilité réduite</strong> : les balises PHP se mêlent au HTML et
                        alourdissent le code, surtout pour les boucles et les conditions imbriquées.
                    </ListItem>
                    <ListItem>
                        <strong>Séparation des responsabilités imparfaite</strong> : rien n&apos;empêche
                        techniquement d&apos;écrire une requête SQL ou de la logique métier dans une vue.
                    </ListItem>
                </List>
                <Text>
                    <strong>Twig</strong> est un moteur de templates PHP conçu pour répondre à ces
                    problèmes. Avec Twig, la même vue s&apos;écrit :
                </Text>
                <CodeCard language="twig" filename="articles/list.html.twig">
                    {`<h2>Liste des articles</h2>
<ul>
    {% for article in articles %}
        <li>
            <h3>{{ article.name }}</h3>
            <p>{{ article.content }}</p>
        </li>
    {% endfor %}
</ul>`}
                </CodeCard>
                <Text>
                    Deux différences immédiates : la syntaxe est plus claire, et{" "}
                    <strong>l&apos;échappement HTML est automatique</strong> — Twig protège toutes les
                    variables par défaut, sans que vous ayez à y penser.
                </Text>
                <Text>
                    Du côté contrôleur, <strong>rien ne change</strong> : vous continuez d&apos;appeler{" "}
                    <Code>$this-&gt;view()</Code> exactement comme avant. Seule l&apos;extension du fichier de
                    vue change : <Code>.html.php</Code> devient <Code>.html.twig</Code>.
                </Text>
            </section>

            {/* 1. Syntaxe de base */}
            <section>
                <Heading level={2}>A- Syntaxe de base : les 3 blocs Twig</Heading>
                <Text>
                    Twig repose sur trois constructions syntaxiques. Elles correspondent chacune à un
                    usage précis :
                </Text>

                <Heading level={3}>
                    1. <Code>{`{{ }}`}</Code> — Afficher une valeur
                </Heading>
                <Text>
                    Les doubles accolades affichent la valeur d&apos;une variable ou d&apos;une expression,
                    en l&apos;échappant automatiquement.
                </Text>
                <CodeCard language="php" filename="Vue PHP natif">
                    {`<h1><?= $title ?></h1>
<p>Bonjour, <?= $username ?> !</p>`}
                </CodeCard>
                <CodeCard language="twig" filename="Vue Twig équivalente">
                    {`<h1>{{ title }}</h1>
<p>Bonjour, {{ username }} !</p>`}
                </CodeCard>

                <Heading level={3}>
                    2. <Code>{`{% %}`}</Code> — Instructions et structures de contrôle
                </Heading>
                <Text>
                    Les balises à pourcentage servent pour tout ce qui est logique : conditions, boucles,
                    déclarations de variables, inclusions de fichiers… Elles n&apos;affichent rien par elles-mêmes.
                </Text>
                <CodeCard language="php" filename="Vue PHP natif">
                    {`<?php if ($isAdmin): ?>
    <a href="admin.php">Tableau de bord</a>
<?php endif; ?>`}
                </CodeCard>
                <CodeCard language="twig" filename="Vue Twig équivalente">
                    {`{% if isAdmin %}
    <a href="admin.php">Tableau de bord</a>
{% endif %}`}
                </CodeCard>
                <Text>
                    <strong>Piège courant :</strong> les débutants essaient d&apos;écrire{" "}
                    <Code>{`{{ if isAdmin }}`}</Code> — c&apos;est une erreur de syntaxe. Les accolades doubles
                    servent <em>uniquement</em> à afficher une valeur. Pour toute instruction, utilisez
                    les pourcentages.
                </Text>

                <Heading level={3}>
                    3. <Code>{`{# #}`}</Code> — Commentaires
                </Heading>
                <Text>
                    Les commentaires Twig ne sont jamais envoyés au navigateur, contrairement aux
                    commentaires HTML <Code>{`<!-- -->`}</Code>.
                </Text>
                <CodeCard language="php" filename="Vue PHP natif">
                    {`<?php /* Ce commentaire n'apparaît pas dans le HTML final */ ?>`}
                </CodeCard>
                <CodeCard language="twig" filename="Vue Twig équivalente">
                    {`{# Ce commentaire n'apparaît pas dans le HTML final #}`}
                </CodeCard>
            </section>

            {/* 2. Variables et expressions */}
            <section>
                <Heading level={2}>B- Variables et expressions</Heading>

                <Heading level={3}>1. Afficher une variable simple</Heading>
                <CodeCard language="php" filename="PHP natif">
                    {`<h1><?= $title ?></h1>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig">
                    {`<h1>{{ title }}</h1>`}
                </CodeCard>

                <Heading level={3}>2. Accéder à une propriété d&apos;objet</Heading>
                <Text>
                    En PHP natif, accéder à la propriété d&apos;un objet nécessite d&apos;appeler le getter
                    explicitement. Twig le fait pour vous : <Code>category.name</Code> appelle
                    automatiquement <Code>getName()</Code> sur l&apos;objet.
                </Text>
                <CodeCard language="php" filename="PHP natif">
                    {`<!-- $category est un objet Category avec getName() -->
<p><?= $category->getName() ?></p>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig">
                    {`{# category est un objet Category #}
<p>{{ category.name }}</p>`}
                </CodeCard>
                <Text>
                    Twig résout <Code>category.name</Code> en cherchant dans cet ordre :{" "}
                    une propriété publique <Code>$name</Code>, puis une méthode <Code>getName()</Code>,
                    puis <Code>name()</Code>, puis <Code>isName()</Code>. Il n&apos;y a aucune ambiguïté :
                    Twig trouve toujours le bon accès.
                </Text>

                <Heading level={3}>3. Accéder à une clé de tableau</Heading>
                <Text>
                    Twig unifie l&apos;accès aux tableaux et aux objets avec le point. Les deux syntaxes
                    fonctionnent indifféremment.
                </Text>
                <CodeCard language="php" filename="PHP natif">
                    {`<p><?= $article['title'] ?></p>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig — les deux syntaxes sont équivalentes">
                    {`<p>{{ article.title }}</p>
<p>{{ article['title'] }}</p>`}
                </CodeCard>
                <Text>
                    <strong>Piège :</strong> en PHP natif, <Code>$article-&gt;title</Code> et{" "}
                    <Code>$article[&apos;title&apos;]</Code> sont deux choses très différentes (objet vs tableau).
                    Twig masque cette distinction — c&apos;est pratique, mais veillez à savoir ce que vous
                    manipulez.
                </Text>

                <Heading level={3}>4. Valeur par défaut avec <Code>|default()</Code></Heading>
                <Text>
                    Si une variable n&apos;est pas définie ou est <Code>null</Code>, Twig peut afficher une
                    valeur de secours grâce au filtre <Code>default</Code>.
                </Text>
                <CodeCard language="php" filename="PHP natif">
                    {`<p><?= $article['description'] ?? 'Pas de description' ?></p>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig">
                    {`<p>{{ article.description|default('Pas de description') }}</p>`}
                </CodeCard>
            </section>

            {/* 3. Structures de contrôle */}
            <section>
                <Heading level={2}>C- Structures de contrôle</Heading>

                <Heading level={3}>1. Condition : if / elseif / else</Heading>
                <CodeCard language="php" filename="PHP natif">
                    {`<?php if ($isAdmin): ?>
    <a href="admin.php">Tableau de bord</a>
<?php elseif ($isModerator): ?>
    <a href="moderate.php">Modération</a>
<?php else: ?>
    <p>Accès restreint.</p>
<?php endif; ?>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig">
                    {`{% if isAdmin %}
    <a href="admin.php">Tableau de bord</a>
{% elseif isModerator %}
    <a href="moderate.php">Modération</a>
{% else %}
    <p>Accès restreint.</p>
{% endif %}`}
                </CodeCard>
                <Text>
                    <strong>Piège :</strong> oublier <Code>{'{% endif %}'}</Code> produit une erreur
                    Twig immédiate et explicite. En PHP natif, un <Code>endif;</Code> oublié peut
                    provoquer des comportements inattendus difficiles à localiser.
                </Text>

                <Heading level={3}>2. Boucle : for...in</Heading>
                <CodeCard language="php" filename="PHP natif">
                    {`<ul>
    <?php foreach ($categories as $category): ?>
        <li><?= $category->getName() ?></li>
    <?php endforeach; ?>
</ul>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig">
                    {`<ul>
    {% for category in categories %}
        <li>{{ category.name }}</li>
    {% endfor %}
</ul>`}
                </CodeCard>
                <Text>
                    <strong>Piège :</strong> oublier <Code>{'{% endfor %}'}</Code> est l&apos;erreur la plus
                    fréquente chez les débutants Twig.
                </Text>

                <Heading level={3}>3. Le bloc <Code>else</Code> du <Code>for</Code> (liste vide)</Heading>
                <Text>
                    Twig propose une fonctionnalité absente de PHP natif : un bloc <Code>else</Code>
                    directement dans la boucle, exécuté quand le tableau est vide.
                </Text>
                <CodeCard language="php" filename="PHP natif — il faut un if séparé">
                    {`<?php if (!empty($categories)): ?>
    <ul>
        <?php foreach ($categories as $category): ?>
            <li><?= $category->getName() ?></li>
        <?php endforeach; ?>
    </ul>
<?php else: ?>
    <p>Aucune catégorie disponible.</p>
<?php endif; ?>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig — le else est intégré au for">
                    {`<ul>
    {% for category in categories %}
        <li>{{ category.name }}</li>
    {% else %}
        <p>Aucune catégorie disponible.</p>
    {% endfor %}
</ul>`}
                </CodeCard>

                <Heading level={3}>4. Variables de boucle : <Code>loop</Code></Heading>
                <Text>
                    À l&apos;intérieur d&apos;une boucle <Code>for</Code>, Twig expose automatiquement la variable
                    spéciale <Code>loop</Code> qui donne des informations sur l&apos;itération en cours.
                </Text>
                <CodeCard language="twig">
                    {`{% for category in categories %}
    <li class="{% if loop.first %}first{% endif %} {% if loop.last %}last{% endif %}">
        {{ loop.index }}. {{ category.name }}
    </li>
{% endfor %}`}
                </CodeCard>
                <List>
                    <ListItem><Code>loop.index</Code> : numéro de l&apos;itération, commence à 1</ListItem>
                    <ListItem><Code>loop.index0</Code> : numéro de l&apos;itération, commence à 0</ListItem>
                    <ListItem><Code>loop.first</Code> : <Code>true</Code> pour la première itération</ListItem>
                    <ListItem><Code>loop.last</Code> : <Code>true</Code> pour la dernière itération</ListItem>
                    <ListItem><Code>loop.length</Code> : nombre total d&apos;éléments</ListItem>
                </List>
            </section>

            {/* 4. Filtres */}
            <section>
                <Heading level={2}>D- Filtres</Heading>
                <Text>
                    Les filtres transforment une valeur avant de l&apos;afficher. On les applique avec le
                    caractère <Code>|</Code> (pipe) juste après la variable.
                </Text>

                <Heading level={3}>1. Filtres courants</Heading>
                <CodeCard language="twig">
                    {`{# Casse #}
{{ category.name|upper }}          {# → "CATÉGORIE" #}
{{ category.name|lower }}          {# → "catégorie" #}

{# Longueur d'un tableau ou d'une chaîne #}
{{ categories|length }}            {# → 5 #}
{{ category.name|length }}         {# → 9 #}

{# Formatage de date #}
{# article.createdAt est un objet DateTime #}
{{ article.createdAt|date('d/m/Y') }}          {# → "27/03/2026" #}
{{ article.createdAt|date('d/m/Y à H:i') }}    {# → "27/03/2026 à 14:30" #}

{# Formatage de nombre #}
{{ price|number_format(2, ',', ' ') }}         {# → "19 990,00" #}`}
                </CodeCard>

                <Heading level={3}>2. Filtres d&apos;échappement : <Code>escape</Code> et <Code>raw</Code></Heading>
                <Text>
                    Par défaut, Twig échappe automatiquement toutes les variables affichées avec{" "}
                    <Code>{`{{ }}`}</Code>. Cela signifie que si une variable contient{" "}
                    <Code>&lt;script&gt;alert(1)&lt;/script&gt;</Code>, Twig l&apos;affichera comme du texte
                    inoffensif, jamais comme du code exécutable. C&apos;est la protection anti-XSS intégrée.
                </Text>
                <CodeCard language="twig">
                    {`{# Échappement explicite (redondant, déjà fait par défaut) #}
{{ category.name|escape }}

{# Désactiver l'échappement — DANGER : réservé au HTML de confiance #}
{{ article.htmlContent|raw }}`}
                </CodeCard>
                <Text>
                    <strong>Règle absolue :</strong> n&apos;utilisez <Code>|raw</Code> que sur du HTML que
                    vous avez vous-même généré ou validé. Ne l&apos;appliquez <em>jamais</em> à une valeur
                    saisie par un utilisateur — vous désactiveriez la protection XSS.
                </Text>

                <Heading level={3}>3. Chaîner plusieurs filtres</Heading>
                <Text>
                    Les filtres s&apos;appliquent de gauche à droite. Vous pouvez en enchaîner autant que nécessaire.
                </Text>
                <CodeCard language="twig">
                    {`{# Met en minuscules, puis coupe à 50 caractères #}
{{ article.title|lower|slice(0, 50) }}

{# Supprime les espaces en début/fin, puis met en majuscules #}
{{ username|trim|upper }}`}
                </CodeCard>
            </section>

            {/* 5. Include */}
            <section>
                <Heading level={2}>E- Include : réutiliser des fragments de template</Heading>
                <Text>
                    Vous avez créé des fichiers <Code>header.html.php</Code> et{" "}
                    <Code>footer.html.php</Code> dans le TP MVC (étape E). Twig propose la même
                    fonctionnalité avec <Code>{'{% include %}'}</Code>.
                </Text>

                <Heading level={3}>1. Include simple</Heading>
                <CodeCard language="php" filename="PHP natif">
                    {`<?php include '_template/header.html.php'; ?>
<main>
    <h1><?= $title ?></h1>
</main>
<?php include '_template/footer.html.php'; ?>`}
                </CodeCard>
                <CodeCard language="twig" filename="Twig">
                    {`{% include '_template/header.html.twig' %}
<main>
    <h1>{{ title }}</h1>
</main>
{% include '_template/footer.html.twig' %}`}
                </CodeCard>
                <Text>
                    Le fichier inclus hérite de toutes les variables disponibles dans le template
                    parent. La variable <Code>title</Code> sera donc accessible dans <Code>header.html.twig</Code>.
                </Text>

                <Heading level={3}>2. Passer des variables supplémentaires avec <Code>with</Code></Heading>
                <Text>
                    Il est possible de passer des variables spécifiques au fichier inclus, en plus de
                    celles déjà disponibles.
                </Text>
                <CodeCard language="twig">
                    {`{% include 'components/alert.html.twig' with {'message': 'Catégorie créée avec succès', 'type': 'success'} %}`}
                </CodeCard>
                <Text>
                    Dans <Code>alert.html.twig</Code>, les variables <Code>message</Code> et{" "}
                    <Code>type</Code> sont disponibles, ainsi que toutes celles du template parent.
                </Text>

                <Heading level={3}>3. Isoler le contexte avec <Code>only</Code></Heading>
                <Text>
                    Le mot-clé <Code>only</Code> restreint les variables disponibles dans le fichier
                    inclus aux seules variables passées avec <Code>with</Code>. Cela évite les effets
                    de bord involontaires.
                </Text>
                <CodeCard language="twig">
                    {`{# Seule la variable 'category' est accessible dans category-card.html.twig #}
{% include 'components/category-card.html.twig' with {'category': category} only %}`}
                </CodeCard>
            </section>

            {/* 6. Héritage de templates */}
            <section>
                <Heading level={2}>F- Héritage de templates</Heading>
                <Text>
                    L&apos;héritage est la fonctionnalité la plus puissante de Twig. Elle va au-delà de
                    l&apos;<Code>include</Code> : au lieu de copier-coller des fragments, une vue{" "}
                    <em>hérite</em> d&apos;un template parent et remplace uniquement des zones prédéfinies.
                </Text>

                <Heading level={3}>1. Le template parent : <Code>base.html.twig</Code></Heading>
                <Text>
                    Le template de base définit la structure commune à toutes les pages (balises{" "}
                    <Code>html</Code>, <Code>head</Code>, navigation, footer). Les zones variables sont
                    déclarées avec <Code>{'{% block %}'}</Code>.
                </Text>
                <CodeCard language="twig" filename="views/base.html.twig">
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}Mon site{% endblock %}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav>
        <a href="index.php">Accueil</a>
    </nav>

    <main>
        {% block content %}{% endblock %}
    </main>

    <footer>
        <p>&copy; 2026 Mon site</p>
    </footer>
</body>
</html>`}
                </CodeCard>

                <Heading level={3}>2. La vue enfant : <Code>extends</Code> et <Code>block</Code></Heading>
                <Text>
                    Une vue enfant déclare qu&apos;elle hérite du template parent avec{" "}
                    <Code>{'{% extends %}'}</Code>, puis remplace uniquement les blocs qu&apos;elle veut
                    personnaliser.
                </Text>
                <CodeCard language="twig" filename="views/categories/list.html.twig">
                    {`{% extends 'base.html.twig' %}

{% block title %}Liste des catégories{% endblock %}

{% block content %}
    <h1>Catégories</h1>
    <ul>
        {% for category in categories %}
            <li>{{ category.name }}</li>
        {% else %}
            <p>Aucune catégorie.</p>
        {% endfor %}
    </ul>
{% endblock %}`}
                </CodeCard>
                <Text>
                    Twig va fusionner ce fichier avec <Code>base.html.twig</Code> : le contenu du
                    bloc <Code>title</Code> remplace <Code>Mon site</Code>, et le contenu du bloc{" "}
                    <Code>content</Code> remplace le bloc vide du parent.
                </Text>

                <Heading level={3}>3. Include vs Extends : quand choisir l&apos;un ou l&apos;autre ?</Heading>
                <List>
                    <ListItem>
                        <strong>Extends</strong> — pour la structure globale d&apos;une page (layout).
                        Utilisez-le quand chaque page doit avoir le même squelette HTML mais un
                        contenu différent. Une vue ne peut hériter que d&apos;un seul parent.
                    </ListItem>
                    <ListItem>
                        <strong>Include</strong> — pour les composants répétés (carte de film, alerte,
                        formulaire). Utilisez-le pour insérer un fragment dans n&apos;importe quel endroit
                        d&apos;un template.
                    </ListItem>
                </List>
            </section>

            {/* 7. Passage de paramètres PHP → Twig */}
            <section>
                <Heading level={2}>G- Passage de paramètres PHP vers Twig</Heading>
                <Text>
                    C&apos;est la section la plus importante : comprendre exactement comment les données
                    transitent du contrôleur vers la vue Twig, en utilisant la méthode{" "}
                    <Code>$this-&gt;view()</Code> que vous connaissez déjà.
                </Text>

                <Heading level={3}>1. Rappel : la méthode <Code>view()</Code></Heading>
                <Text>
                    La signature de la méthode héritée de la classe <Code>Controller</Code> est
                    identique à ce que vous avez utilisé jusqu&apos;ici :
                </Text>
                <CodeCard language="php">
                    {`protected function view(string $viewName, string $title = '', array $data = [], int $status = 200)`}
                </CodeCard>
                <List>
                    <ListItem>
                        <Code>$viewName</Code> : chemin de la vue sans extension (ex. <Code>&apos;categories/list&apos;</Code>).
                        Le moteur cherchera <Code>categories/list.html.twig</Code>.
                    </ListItem>
                    <ListItem>
                        <Code>$title</Code> : injecté automatiquement comme variable{" "}
                        <Code>{'{{ title }}'}</Code> dans la vue.
                    </ListItem>
                    <ListItem>
                        <Code>$data</Code> : tableau associatif. <strong>Chaque clé devient une
                        variable Twig.</strong> <Code>[&apos;categories&apos; =&gt; $categories]</Code> rend{" "}
                        <Code>{'{{ categories }}'}</Code> disponible dans le template.
                    </ListItem>
                </List>

                <Heading level={3}>2. Exemple bout en bout complet</Heading>
                <Text>
                    Reprenons les classes <Code>Category</Code> et <Code>CategoryRepository</Code>
                    du cours sur les bases de données.
                </Text>

                <Heading level={4}>2.1 L&apos;entité</Heading>
                <CodeCard language="php" filename="app/entities/Category.php">
                    {`<?php
// app/entities/Category.php

class Category
{
    public function __construct(private int $id, private string $name)
    {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }
}`}
                </CodeCard>

                <Heading level={4}>2.2 Le repository</Heading>
                <CodeCard language="php" filename="app/repositories/CategoryRepository.php">
                    {`<?php
// app/repositories/CategoryRepository.php

class CategoryRepository
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = Repository::getInstance()->getPDO();
    }

    public function findAll(): array
    {
        $stmt = $this->pdo->query('SELECT * FROM categories ORDER BY name');
        $categories = [];
        foreach ($stmt->fetchAll() as $row) {
            $categories[] = new Category($row['id'], $row['name']);
        }
        return $categories;
    }
}`}
                </CodeCard>

                <Heading level={4}>2.3 Le contrôleur</Heading>
                <CodeCard language="php" filename="app/controllers/CategoryController.php">
                    {`<?php

require_once '../app/core/Controller.php';
require_once '../app/entities/Category.php';
require_once '../app/repositories/CategoryRepository.php';

class CategoryController extends Controller
{
    private CategoryRepository $categoryRepository;

    public function __construct()
    {
        $this->categoryRepository = new CategoryRepository();
    }

    public function index(): void
    {
        $categories = $this->categoryRepository->findAll();

        // Chaque clé de $data devient une variable Twig
        // 'title' est injectée automatiquement par view()
        $this->view('categories/list', 'Liste des catégories', [
            'categories' => $categories,
        ]);
    }
}`}
                </CodeCard>

                <Heading level={4}>2.4 La vue Twig</Heading>
                <CodeCard language="twig" filename="app/views/categories/list.html.twig">
                    {`{% extends 'base.html.twig' %}

{% block title %}{{ title }}{% endblock %}

{% block content %}
    <h1>{{ title }}</h1>

    <ul class="categories-list">
        {% for category in categories %}
            <li>
                <strong>{{ loop.index }}.</strong>
                {{ category.name }}
                {# Twig appelle automatiquement getName() #}
            </li>
        {% else %}
            <p>Aucune catégorie disponible.</p>
        {% endfor %}
    </ul>
{% endblock %}`}
                </CodeCard>

                <Heading level={3}>3. Passer des scalaires (string, int, bool)</Heading>
                <Text>
                    Le tableau <Code>$data</Code> peut contenir n&apos;importe quel type de valeur, pas
                    seulement des objets.
                </Text>
                <CodeCard language="php" filename="Dans le contrôleur">
                    {`$this->view('home', 'Accueil', [
    'username'  => 'Alice',       // string → {{ username }}
    'isAdmin'   => true,          // bool   → {% if isAdmin %}
    'count'     => 42,            // int    → {{ count }}
    'categories'=> $categories,   // array d'objets → {% for category in categories %}
]);`}
                </CodeCard>
                <CodeCard language="twig" filename="Dans la vue">
                    {`<p>Bonjour, {{ username }} !</p>

{% if isAdmin %}
    <a href="admin.php">Administration ({{ count }} éléments)</a>
{% endif %}

<ul>
    {% for category in categories %}
        <li>{{ category.name }}</li>
    {% endfor %}
</ul>`}
                </CodeCard>

                <Heading level={3}>4. Piège classique : clé absente du tableau <Code>$data</Code></Heading>
                <Text>
                    L&apos;erreur la plus fréquente est d&apos;utiliser dans la vue une variable qui n&apos;a pas été
                    transmise dans <Code>$data</Code>.
                </Text>
                <CodeCard language="php" filename="Contrôleur — clé au singulier par erreur">
                    {`// On passe 'category' (singulier)...
$this->view('categories/list', 'Catégories', [
    'category' => $categories,  // ← faute de frappe
]);`}
                </CodeCard>
                <CodeCard language="twig" filename="Vue — on itère sur 'categories' (pluriel)">
                    {`{% for category in categories %}  {# ← 'categories' n'existe pas ! #}
    <li>{{ category.name }}</li>
{% endfor %}`}
                </CodeCard>
                <Text>
                    Twig lèvera une erreur claire :{" "}
                    <Code>Variable &quot;categories&quot; does not exist.</Code>
                </Text>
                <Text>
                    En PHP natif, le même oubli provoque une <em>Notice: Undefined variable</em>
                    (ou un simple silence selon la configuration), ce qui peut passer inaperçu.
                    L&apos;erreur explicite de Twig est en réalité un avantage : elle vous force à corriger
                    le problème immédiatement.
                </Text>
                <Text>
                    <strong>Bonne pratique :</strong> adoptez une convention de nommage cohérente —
                    la clé dans <Code>$data</Code> doit avoir exactement le même nom que la variable
                    utilisée dans la vue.
                </Text>
            </section>

        </article>
    );
}
