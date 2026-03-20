'use client';
import { SlidesScreen } from "@/components/Slides/SlidesScreen";
import React from 'react';
import { SlideScreen } from "@/components/Slides/SlideScreen";
import { SlideText } from "@/components/Slides/ui/SlideText";
import { SlideCode } from "@/components/Slides/ui/SlideCode";
import { SlideList, SlideListItem } from "@/components/Slides/ui/SlideList";
import { SlideNote } from "@/components/Slides/ui/SlideNote";
import { SlideDiagram } from "@/components/Slides/ui/SlideDiagram";
import Module from "@/types/Module";
import Section from "@/types/Section";

export default function SymfonySlides() {
    const mockModule: Module = {
        _id: "php",
        title: "PHP",
        path: "php",
        iconName: "Code",
        sections: [],
        associatedSae: []
    };

    const mockSection: Section = {
        title: "Symfony",
        path: "9-symfony",
        contents: [],
        description: "Introduction à Symfony : architecture, routing, Doctrine ORM et formulaires",
        tags: ["Symfony", "PHP", "MVC", "Doctrine", "Twig"],
        totalDuration: 0,
        hasCorrection: false,
        order: 9
    };

    return (
        <div className="w-full py-10">
            <SlidesScreen module={mockModule} section={mockSection}>

                {/* Slide 1 — Introduction à Symfony */}
                <SlideScreen title="Introduction à Symfony">
                    <SlideNote>
                        {`- Symfony est le framework PHP de référence en entreprise en France et en Europe.
- Créé par Fabien Potencier (SensioLabs) en 2005, il est open-source et très actif.
- Contrairement à Laravel (plus orienté rapid dev), Symfony est connu pour sa rigueur et sa flexibilité.
- Beaucoup de grands projets l'utilisent, et Laravel lui-même s'appuie sur des composants Symfony.`}
                    </SlideNote>
                    <SlideText>
                        <strong>Symfony</strong> est un framework PHP open-source créé par <strong>Fabien Potencier</strong> (SensioLabs) en 2005.
                        Il fournit un ensemble de composants réutilisables pour construire des applications web robustes.
                    </SlideText>
                    <SlideList>
                        <SlideListItem><strong>Symfony</strong> — rigueur, composants, idéal pour des projets complexes et durables</SlideListItem>
                        <SlideListItem><strong>Laravel</strong> — plus accessible, batteries incluses, fort écosystème</SlideListItem>
                        <SlideListItem><strong>Vanilla PHP</strong> — aucune abstraction, tout est à faire manuellement</SlideListItem>
                    </SlideList>
                    <SlideList>
                        <SlideListItem>Utilisé par <strong>BlaBlaCar</strong>, <strong>Drupal</strong>, <strong>Magento</strong>, <strong>phpBB</strong></SlideListItem>
                        <SlideListItem>Versions <strong>LTS</strong> (support 3 ans) vs versions standard (support 8 mois)</SlideListItem>
                        <SlideListItem>Version actuelle stable : <strong>Symfony 7.x</strong> — LTS recommandée : <strong>6.4</strong></SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Slide 2 — Installation [TP] */}
                <SlideScreen title="[TP] Installation et premier projet">
                    <SlideNote>
                        {`- Composer est le gestionnaire de dépendances PHP, indispensable pour Symfony.
- symfony/skeleton crée un projet minimal ; "composer require webapp" ajoute Twig, Doctrine, formulaires...
- php bin/console est le point d'entrée de toutes les commandes Symfony en développement.
- La page de bienvenue Symfony confirme que tout fonctionne correctement.`}
                    </SlideNote>
                    <SlideText>
                        Créer un projet Symfony avec <strong>Composer</strong> :
                    </SlideText>
                    <SlideCode language="bash" highlight="1-2 | 4-5 | 7-8">
                        {`# 1. Créer un nouveau projet Symfony (squelette minimal)
composer create-project symfony/skeleton:"7.x.*" mon-projet

# 2. Installer les composants web (Twig, Doctrine, formulaires...)
cd mon-projet && composer require webapp

# 3. Lancer le serveur de développement intégré PHP
php -S localhost:8000 -t public/`}
                    </SlideCode>
                    <SlideText>
                        Ouvrir <code>http://localhost:8000</code> — la page de bienvenue Symfony confirme l&apos;installation.
                    </SlideText>
                </SlideScreen>

                {/* Slide 2b — Les commandes make:* */}
                <SlideScreen title="La console Symfony et les commandes make:*">
                    <SlideNote>
                        {`- php bin/console liste toutes les commandes disponibles.
- Le bundle MakerBundle fournit toutes les commandes make:* pour générer du code.
- Ces commandes font gagner un temps considérable et respectent les conventions Symfony.
- On peut toujours modifier le code généré après coup.`}
                    </SlideNote>
                    <SlideText>
                        <code>php bin/console</code> est la porte d&apos;entrée de toutes les commandes Symfony. Le <strong>MakerBundle</strong> ajoute les commandes <code>make:*</code> pour générer du code automatiquement :
                    </SlideText>
                    <SlideCode language="bash" highlight="1-2 | 4-5 | 7-8 | 10-11 | 13-14">
                        {`# Générer un contrôleur
php bin/console make:controller ArticleController

# Générer une entité Doctrine (interactif)
php bin/console make:entity Article

# Générer un formulaire lié à une entité
php bin/console make:form ArticleType

# Générer un fichier de migration SQL
php bin/console make:migration

# Voir toutes les commandes disponibles
php bin/console list make`}
                    </SlideCode>
                    <SlideText>
                        Chaque commande est <strong>interactive</strong> : elle pose des questions et génère les fichiers dans les bons dossiers.
                    </SlideText>
                </SlideScreen>

                {/* Slide 3 — Architecture des dossiers */}
                <SlideScreen title="Architecture des dossiers">
                    <SlideNote>
                        {`- src/ contient tout le code métier : controllers, entités, services, formulaires.
- config/ : fichiers YAML de configuration (routes, services, packages).
- templates/ : fichiers Twig (vues HTML).
- public/ : seul dossier accessible depuis le web, contient index.php (point d'entrée).
- var/ : cache et logs générés automatiquement.
- migrations/ : historique des modifications de base de données.`}
                    </SlideNote>
                    <SlideCode language="bash">
                        {`mon-projet/
├── src/                  # Code PHP : Controllers, Entity, Repository, Service
│   ├── Controller/       # Les contrôleurs (logique applicative)
│   ├── Entity/           # Les entités Doctrine (modèles de données)
│   ├── Repository/       # Accès à la base de données
│   └── Service/          # Services métier réutilisables
├── config/               # Configuration YAML (routes, services, packages)
├── templates/            # Fichiers Twig (vues HTML)
├── public/               # Seul dossier accessible depuis le web
│   └── index.php         # Point d'entrée unique de l'application
├── migrations/           # Historique des migrations SQL
├── var/                  # Cache et logs (généré automatiquement)
└── .env                  # Variables d'environnement (BDD, mailer...)`}
                    </SlideCode>
                    <SlideText>
                        Le fichier <code>.env</code> stocke les variables d&apos;environnement sensibles (URL de BDD, clés API…) — ne jamais le committer avec des vraies credentials.
                    </SlideText>
                </SlideScreen>

                {/* Slide 4 — Cycle Requête / Réponse */}
                <SlideScreen title="Cycle Requête / Réponse">
                    <SlideNote>
                        {`- Tout passe par public/index.php : c'est le Front Controller.
- Le HttpKernel orchestre tout : il dispatche la requête au bon contrôleur.
- Le Router analyse l'URL et détermine quel contrôleur appeler.
- Le contrôleur construit et retourne une Response (HTML, JSON...).`}
                    </SlideNote>
                    <SlideDiagram chart={`sequenceDiagram
    participant Browser as Navigateur
    participant FrontController as public/index.php
    participant Kernel as HttpKernel
    participant Router as Router
    participant Controller as Controller
    participant Response as Response

    Browser->>FrontController: HTTP Request (GET /articles)
    FrontController->>Kernel: handle(request)
    Kernel->>Router: match(request)
    Router-->>Kernel: ArticleController::list
    Kernel->>Controller: list(request)
    Controller-->>Kernel: Response (HTML/JSON)
    Kernel-->>Browser: HTTP Response 200`} />
                    <SlideText>
                        Le <strong>HttpKernel</strong> est le cœur de Symfony : il transforme une <code>Request</code> en <code>Response</code> en passant par le routing et les contrôleurs.
                    </SlideText>
                </SlideScreen>

                {/* Slide 5 — Routing et Contrôleurs [TP] */}
                <SlideScreen title="[TP] Routing et Contrôleurs">
                    <SlideNote>
                        {`- "make:controller" génère un contrôleur avec une route par défaut et son template Twig associé.
- L'attribut #[Route] remplace les fichiers YAML/XML de routes depuis Symfony 5.
- Les paramètres entre accolades ({slug}) sont injectés comme arguments de la méthode.
- "requirements" permet de valider le format du paramètre avec une regex.`}
                    </SlideNote>
                    <SlideCode language="bash">
                        {`# Générer un contrôleur avec la console Symfony
php bin/console make:controller ArticleController`}
                    </SlideCode>
                    <SlideCode language="php" highlight="1-5 | 7-12 | 14-19">
                        {`<?php
// src/Controller/ArticleController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ArticleController extends AbstractController
{
    // Route simple
    #[Route('/articles', name: 'article_list')]
    public function list(): Response
    {
        return $this->render('article/list.html.twig');
    }

    // Route avec paramètre et validation
    #[Route('/articles/{slug}', name: 'article_show', requirements: ['slug' => '[a-z0-9\-]+'])]
    public function show(string $slug): Response
    {
        return $this->render('article/show.html.twig', ['slug' => $slug]);
    }
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 6 — Twig : syntaxe de base */}
                <SlideScreen title="Twig : syntaxe de base">
                    <SlideNote>
                        {`- Twig a trois types de balises : {{ }} pour afficher, {% %} pour agir, {# #} pour commenter.
- L'échappement HTML est automatique : pas de faille XSS par défaut.
- Les filtres transforment une valeur : upper, lower, date, length, default...
- On accède aux propriétés d'un objet ET aux clés d'un tableau avec le même point.`}
                    </SlideNote>
                    <SlideCode language="twig" highlight="1-4 | 6-10 | 12-16">
                        {`{# Ceci est un commentaire Twig (non affiché dans le HTML) #}

{# Afficher une variable — échappement HTML automatique #}
<h1>{{ titre }}</h1>

{# Filtres : transformer une valeur #}
<p>{{ nom | upper }}</p>               {# NOM EN MAJUSCULES #}
<p>{{ texte | truncate(100) }}</p>     {# Tronquer à 100 caractères #}
<p>{{ date | date('d/m/Y') }}</p>      {# Formater une date #}
<p>{{ valeur | default('Non défini') }}</p>

{# Accès aux propriétés d'objet ET aux clés de tableau #}
<p>{{ article.title }}</p>             {# objet PHP : $article->getTitle() #}
<p>{{ article['title'] }}</p>          {# tableau PHP : $article['title'] #}
<p>{{ user.adresse.ville }}</p>        {# chaînage de propriétés #}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 7 — Twig : structures de contrôle */}
                <SlideScreen title="Twig : structures de contrôle">
                    <SlideNote>
                        {`- {% if %} fonctionne comme en PHP avec les opérateurs classiques (==, !=, and, or, not).
- {% for %} itère sur un tableau ou une collection Doctrine.
- La clause {% else %} dans un for s'exécute si le tableau est vide.
- loop.index, loop.first, loop.last sont disponibles dans les boucles.`}
                    </SlideNote>
                    <SlideCode language="twig" highlight="1-7 | 9-19">
                        {`{# Condition #}
{% if articles | length > 0 %}
    <p>{{ articles | length }} article(s) trouvé(s)</p>
{% elseif utilisateur is defined %}
    <p>Bonjour {{ utilisateur.nom }}, aucun article.</p>
{% else %}
    <p>Aucun contenu disponible.</p>
{% endif %}

{# Boucle avec clause else et variable loop #}
{% for article in articles %}
    <article class="{{ loop.index is odd ? 'pair' : 'impair' }}">
        <h2>{{ loop.index }}. {{ article.title }}</h2>
        {% if loop.first %}<span>Nouveau !</span>{% endif %}
    </article>
{% else %}
    <p>Aucun article pour le moment.</p>
{% endfor %}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 7b — Twig : héritage de templates */}
                <SlideScreen title="Twig : héritage de templates">
                    <SlideNote>
                        {`- L'héritage est le mécanisme le plus puissant de Twig.
- base.html.twig définit la structure HTML commune (head, nav, footer...).
- Chaque page enfant "extends" ce layout et remplace uniquement les blocs nécessaires.
- On peut appeler {{ parent() }} pour conserver le contenu du bloc parent.`}
                    </SlideNote>
                    <SlideCode language="twig" highlight="1-12 | 14-23">
                        {`{# templates/base.html.twig — layout commun #}
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}Mon Site{% endblock %}</title>
</head>
<body>
    <nav>Menu commun</nav>

    {% block content %}{% endblock %}

    <footer>Pied de page commun</footer>
</body>
</html>

{# templates/article/list.html.twig — page enfant #}
{% extends 'base.html.twig' %}

{% block title %}Liste des articles{% endblock %}

{% block content %}
    <h1>Mes articles</h1>
    {# Le contenu spécifique à cette page #}
{% endblock %}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 7c — TP Twig */}
                <SlideScreen title="[TP] Twig : contrôleur + template">
                    <SlideNote>
                        {`- Le contrôleur passe les variables à Twig via le deuxième argument de render().
- Dans Twig, on accède aux propriétés d'un objet avec un point : article.title.
- La clause else du for gère élégamment le cas "liste vide".`}
                    </SlideNote>
                    <SlideCode language="php" highlight="1-4 | 6-12">
                        {`// src/Controller/ArticleController.php
#[Route('/articles', name: 'article_list')]
public function list(): Response
{
    $articles = [
        ['title' => 'Mon premier article', 'content' => 'Contenu...'],
        ['title' => 'Deuxième article',    'content' => 'Autre contenu...'],
    ];

    return $this->render('article/list.html.twig', [
        'articles' => $articles,
    ]);
}`}
                    </SlideCode>
                    <SlideCode language="twig" highlight="1-2 | 4-14">
                        {`{# templates/article/list.html.twig #}
{% extends 'base.html.twig' %}

{% block content %}
    <h1>Liste des articles ({{ articles | length }})</h1>

    {% for article in articles %}
        <article>
            <h2>{{ article.title }}</h2>
            <p>{{ article.content }}</p>
        </article>
    {% else %}
        <p>Aucun article pour le moment.</p>
    {% endfor %}
{% endblock %}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 8 — Doctrine ORM et Entités [TP] */}
                <SlideScreen title="[TP] Doctrine ORM et Entités">
                    <SlideNote>
                        {`- Doctrine est l'ORM (Object Relational Mapper) intégré à Symfony.
- Une entité est une classe PHP ordinaire annotée avec des attributs Doctrine.
- make:entity génère la classe et met à jour le Repository associé.
- Doctrine mappe automatiquement la classe vers une table SQL.`}
                    </SlideNote>
                    <SlideCode language="bash">
                        {`# Générer une entité interactive
php bin/console make:entity Article
# > title (string, 255, not null)
# > content (text, not null)
# > createdAt (datetime_immutable, not null)`}
                    </SlideCode>
                    <SlideCode language="php" highlight="1-8 | 10-20 | 22-27">
                        {`<?php
// src/Entity/Article.php
namespace App\Entity;

use App\Repository\ArticleRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ArticleRepository::class)]
class Article
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: 'text')]
    private ?string $content = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    // Getters et setters générés automatiquement...
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 9 — Base de données et Migrations [TP] */}
                <SlideScreen title="[TP] Base de données et Migrations">
                    <SlideNote>
                        {`- DATABASE_URL dans .env définit la connexion (MySQL, PostgreSQL, SQLite...).
- make:migration génère un fichier PHP décrivant les changements SQL à appliquer.
- doctrine:migrations:migrate applique les migrations non encore exécutées.
- Les migrations permettent de versionner le schéma SQL comme on versionne le code.`}
                    </SlideNote>
                    <SlideCode language="bash" highlight="1-2 | 4-5 | 7-8 | 10-11">
                        {`# 1. Configurer la connexion dans .env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/mon_projet"

# 2. Créer la base de données
php bin/console doctrine:database:create

# 3. Générer le fichier de migration
php bin/console make:migration

# 4. Appliquer les migrations
php bin/console doctrine:migrations:migrate`}
                    </SlideCode>
                    <SlideText>
                        Les migrations sont des fichiers PHP versionnés dans <code>migrations/</code>.
                        Elles permettent à toute l&apos;équipe de synchroniser le schéma de BDD, contrairement au SQL direct qui n&apos;est pas traçable.
                    </SlideText>
                </SlideScreen>

                {/* Slide 10 — Les Repositories */}
                <SlideScreen title="Les Repositories">
                    <SlideNote>
                        {`- Chaque entité a son Repository généré automatiquement.
- Les méthodes "magiques" couvrent la majorité des besoins courants.
- QueryBuilder permet de construire des requêtes complexes de façon orientée objet.
- C'est ici qu'on écrit les requêtes, pas dans le contrôleur.`}
                    </SlideNote>
                    <SlideList>
                        <SlideListItem><code>find($id)</code> — récupérer par identifiant</SlideListItem>
                        <SlideListItem><code>findAll()</code> — récupérer tous les enregistrements</SlideListItem>
                        <SlideListItem><code>findBy(['status' =&gt; 'published'])</code> — filtrer par critères</SlideListItem>
                        <SlideListItem><code>findOneBy(['slug' =&gt; $slug])</code> — récupérer un seul résultat</SlideListItem>
                    </SlideList>
                    <SlideCode language="php" highlight="1-3 | 5-14">
                        {`// src/Repository/ArticleRepository.php
// Méthode personnalisée avec QueryBuilder
public function findRecent(int $limit = 5): array
{
    return $this->createQueryBuilder('a')
        ->orderBy('a.createdAt', 'DESC')
        ->setMaxResults($limit)
        ->getQuery()
        ->getResult();
}

// Utilisation dans le contrôleur :
// $articles = $articleRepository->findRecent(10);`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 11 — Écrire et lire en base [TP fil rouge] */}
                <SlideScreen title="[TP] Écrire et lire en base">
                    <SlideNote>
                        {`- EntityManagerInterface est le service central de Doctrine.
- persist() marque l'entité comme à sauvegarder.
- flush() exécute réellement les requêtes SQL en attente.
- Le Repository est injecté automatiquement dans le contrôleur via l'autowiring.`}
                    </SlideNote>
                    <SlideCode language="php" highlight="1-8 | 10-16">
                        {`use Doctrine\ORM\EntityManagerInterface;

// Créer et sauvegarder un article
#[Route('/articles/new', name: 'article_new')]
public function new(EntityManagerInterface $em): Response
{
    $article = new Article();
    $article->setTitle('Mon article Symfony');
    $article->setContent('Contenu rédigé avec Doctrine.');
    $article->setCreatedAt(new \DateTimeImmutable());

    $em->persist($article);  // Marquer pour sauvegarde
    $em->flush();            // Exécuter le SQL INSERT

    return $this->redirectToRoute('article_list');
}`}
                    </SlideCode>
                    <SlideCode language="php">
                        {`// Lire depuis le Repository (injection automatique)
#[Route('/articles', name: 'article_list')]
public function list(ArticleRepository $repo): Response
{
    $articles = $repo->findAll();

    return $this->render('article/list.html.twig', [
        'articles' => $articles,
    ]);
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 12 — Services et injection de dépendances */}
                <SlideScreen title="Services et injection de dépendances">
                    <SlideNote>
                        {`- Le container de services de Symfony instancie et gère tous les objets de l'application.
- L'autowiring détecte automatiquement les dépendances via le type-hinting PHP.
- Un service est n'importe quelle classe PHP enregistrée dans le container.
- Cela permet de découpler le code et de faciliter les tests.`}
                    </SlideNote>
                    <SlideList>
                        <SlideListItem><strong>Container</strong> — registre de tous les services disponibles</SlideListItem>
                        <SlideListItem><strong>Autowiring</strong> — injection automatique par type PHP</SlideListItem>
                        <SlideListItem><strong>Service</strong> — toute classe dans <code>src/</code> est un service potentiel</SlideListItem>
                    </SlideList>
                    <SlideCode language="php" highlight="1-10 | 12-20">
                        {`<?php
// src/Service/SlugService.php
namespace App\Service;

class SlugService
{
    public function slugify(string $text): string
    {
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text)));
    }
}

// Dans le contrôleur — injection automatique
#[Route('/articles/new')]
public function new(SlugService $slugService, EntityManagerInterface $em): Response
{
    $article = new Article();
    $article->setTitle('Mon Super Article !');
    $article->setSlug($slugService->slugify($article->getTitle()));
    // ...
}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 13 — Les Formulaires [TP] */}
                <SlideScreen title="[TP] Les Formulaires Symfony">
                    <SlideNote>
                        {`- make:form génère une classe FormType liée à une entité.
- handleRequest() analyse la requête HTTP et remplit le formulaire.
- isSubmitted() + isValid() vérifient la soumission et les contraintes de validation.
- {{ form(form) }} dans Twig affiche tout le formulaire en une ligne.`}
                    </SlideNote>
                    <SlideCode language="bash">
                        {`# Générer un formulaire lié à l'entité Article
php bin/console make:form ArticleType`}
                    </SlideCode>
                    <SlideCode language="php" highlight="1-5 | 7-14 | 16-22">
                        {`// src/Controller/ArticleController.php
use App\Form\ArticleType;
use Symfony\Component\HttpFoundation\Request;

#[Route('/articles/create', name: 'article_create')]
public function create(Request $request, EntityManagerInterface $em): Response
{
    $article = new Article();
    $form = $this->createForm(ArticleType::class, $article);

    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        $article->setCreatedAt(new \DateTimeImmutable());
        $em->persist($article);
        $em->flush();

        return $this->redirectToRoute('article_list');
    }

    return $this->render('article/create.html.twig', [
        'form' => $form,
    ]);
}`}
                    </SlideCode>
                    <SlideCode language="twig">
                        {`{# templates/article/create.html.twig #}
{% extends 'base.html.twig' %}

{% block content %}
    <h1>Créer un article</h1>
    {{ form(form) }}
{% endblock %}`}
                    </SlideCode>
                </SlideScreen>

                {/* Slide 14 — Récapitulatif et suite */}
                <SlideScreen title="Récapitulatif et pour aller plus loin">
                    <SlideNote>
                        {`- Ce schéma résume le flux complet d'une requête Symfony avec BDD et Twig.
- Security Bundle : authentification, autorisation, voters.
- API Platform : générer une API REST/GraphQL en annotant ses entités.
- Messenger : traitement asynchrone de messages (emails, notifications...).`}
                    </SlideNote>
                    <SlideDiagram chart={`flowchart LR
    A[Route HTTP] --> B[Controller]
    B --> C[Repository]
    C --> D[(Base de données)]
    D --> C
    C --> B
    B --> E[Twig Template]
    E --> F[Response HTML]`} />
                    <SlideList>
                        <SlideListItem><strong>Security Bundle</strong> — authentification, rôles, voters</SlideListItem>
                        <SlideListItem><strong>API Platform</strong> — générer une API REST/GraphQL depuis les entités</SlideListItem>
                        <SlideListItem><strong>Messenger</strong> — traitement asynchrone (emails, tâches de fond)</SlideListItem>
                        <SlideListItem><strong>Mailer</strong> — envoi d&apos;emails avec templating Twig</SlideListItem>
                    </SlideList>
                    <SlideList>
                        <SlideListItem><strong>docs.symfony.com</strong> — documentation officielle complète</SlideListItem>
                        <SlideListItem><strong>symfonycasts.com</strong> — tutoriels vidéo de qualité</SlideListItem>
                        <SlideListItem><strong>grafikart.fr</strong> — cours Symfony en français</SlideListItem>
                    </SlideList>
                </SlideScreen>

                {/* Slide Quiz final */}
                <SlideScreen title="Quiz — Vérification des acquis">
                    <SlideNote>
                        {`- Questions de validation rapide à faire à l'oral ou par écrit.
- Les réponses sont visibles : l'objectif est de consolider, pas de piéger.
- Encourager les étudiants à expliquer pourquoi, pas juste la bonne réponse.`}
                    </SlideNote>
                    <SlideList>
                        <SlideListItem>
                            Dans quel dossier se trouvent les entités Doctrine ?
                            {" → "}<strong>src/Entity/</strong>
                        </SlideListItem>
                        <SlideListItem>
                            Quelle commande génère un fichier de migration ?
                            {" → "}<strong>php bin/console make:migration</strong>
                        </SlideListItem>
                        <SlideListItem>
                            Quel fichier configure l&apos;URL de connexion à la base de données ?
                            {" → "}<strong>.env</strong>
                        </SlideListItem>
                        <SlideListItem>
                            Comment afficher une variable <code>name</code> dans un template Twig ?
                            {" → "}<strong>{"{{ name }}"}</strong>
                        </SlideListItem>
                        <SlideListItem>
                            Quelle balise Twig sert à hériter d&apos;un layout ?
                            {" → "}<strong>{"{% extends 'base.html.twig' %}"}</strong>
                        </SlideListItem>
                        <SlideListItem>
                            Quel design pattern est utilisé par les Repository Doctrine ?
                            {" → "}<strong>Repository Pattern (Data Mapper)</strong>
                        </SlideListItem>
                    </SlideList>
                </SlideScreen>

            </SlidesScreen>
        </div>
    );
}
