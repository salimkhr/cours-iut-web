import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import Link from "next/link";
import CourseReminder from "@/components/CourseReminder";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2} netflex>A- Initialisation du projet</Heading>

                <Text>Récupérez le code source de départ depuis le dépôt Git :  </Text><CodeCard language="bash" showLineNumbers={false}>
                {`git clone https://gitlab.com/iut3334332/php/mvc.git
cd mvc`}
            </CodeCard>

            </section>
            <section>
                <Heading level={2} netflex>B- Première page simple : index.php</Heading>
                <Text>
                    Dans cette étape, vous allez afficher votre <strong>première page</strong> avec le
                    modèle MVC : une vue, un contrôleur, et un point d’entrée.
                </Text>
                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez la vue <Code>index.html.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename="index.html.php">
                            {`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NetFlex | Visionnez. Flexez. Profitez</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Spline+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="style.css" rel="stylesheet"/>
</head>
<body>

  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg fixed-top px-4 py-3">
    <a class="navbar-brand logo" href="#">NetFlex</a>
    <div class="ms-auto">
      <a href="#" class="btn btn-danger fw-bold">Log In</a>
    </div>
  </nav>

  <!-- Hero -->
  <header class="hero d-flex flex-column justify-content-between">
  <div class="hero-content d-flex flex-column justify-content-center align-items-center text-center px-3">
    <h1 class="display-4 fw-bold"> Visionnez. Flexez. Profitez.</h1>
    <p class="lead">Films, séries et bien plus, en illimité.</p>
    <a href="#pricing" class="btn btn-danger btn-lg mt-3">Commencer</a>
  </div>
  <div class="mb-4 text-center scroll-indicator-block">
    <span class="fw-normal small d-block mb-2">Faites défiler pour voir les offres</span>
    <div class="scroll-indicator"></div>
  </div>
</header>

  <!-- Pricing Section -->
  <!-- Section des abonnements façon Netflix -->
  <section class="container py-5" id="pricing">
    <div class="text-center mb-5">
      <h3 class="fw-bold">Choisissez votre offre</h3>
      <p class="text-secondary">Rejoignez NetFlex et commencez à regarder dès aujourd'hui.</p>
    </div>
    <div class="row g-3 justify-content-evenly">
      <!-- Basique -->
      <div class="col-md-3">
        <div class="card bg-dark text-white text-center p-2 h-100 d-flex flex-column">
          <h4 class="mb-3">Basique</h4>
          <p class="text-white-50">Qualité vidéo SD (480p). Regardez sur n'importe quel appareil.</p>
          <p class="display-5 fw-bold my-3">9,99€<span class="fs-6 text-white-50 fw-normal">/mois</span></p>
          <ul class="pricing-list list-unstyled mb-4 flex-grow-1 text-start">
            <li>Bibliothèque sans publicité</li>
            <li>Téléchargements sur 1&nbsp;appareil</li>
          </ul>
          <a href="#" class="btn btn-danger w-100 mt-auto">S'abonner</a>
        </div>
      </div>
      <!-- Standard -->
      <div class="col-md-3">
        <div class="card bg-dark text-white text-center p-2 h-100 d-flex flex-column position-relative">
          <div class="position-absolute top-0 start-50 translate-middle badge bg-danger px-3 py-1 rounded-pill">Le plus populaire</div>
          <h4 class="mb-3 mt-4">Standard</h4>
          <p class="text-white-50">Qualité vidéo Full HD (1080p). Regardez sur plusieurs appareils.</p>
          <p class="display-5 fw-bold my-3">15,49€<span class="fs-6 text-white-50 fw-normal">/mois</span></p>
          <ul class="pricing-list list-unstyled mb-4 flex-grow-1 text-start">
            <li>Bibliothèque sans publicité</li>
            <li>Téléchargements sur 2&nbsp;appareils</li>
            <li>Visionnage sur 2 écrans simultanément</li>
          </ul>
          <a href="#" class="btn btn-danger w-100 mt-auto">S'abonner</a>
        </div>
      </div>
      <!-- Premium -->
      <div class="col-md-3">
        <div class="card bg-dark text-white text-center p-2 h-100 d-flex flex-column">
          <h4 class="mb-3">Premium</h4>
          <p class="text-white-50">Meilleure qualité vidéo Ultra HD (4K) et HDR. Regardez sur tous vos appareils.</p>
          <p class="display-5 fw-bold my-3">19,99€<span class="fs-6 text-white-50 fw-normal">/mois</span></p>
          <ul class="pricing-list list-unstyled mb-4 flex-grow-1 text-start">
            <li>Bibliothèque sans publicité</li>
            <li>Téléchargements sur 6&nbsp;appareils</li>
            <li>Visionnage sur 4 écrans simultanément</li>
            <li>Son spatial inclus</li>
          </ul>
          <a href="#" class="btn btn-danger w-100 mt-auto">S'abonner</a>
        </div>
      </div>
    </div>
  </section>


  <!-- Footer -->
  <footer>
    <p>&copy; 2025 NetFlex. Tous droits réservés.</p>
    <div>
      <a href="#">FAQ</a> |
      <a href="#">Centre d'aide</a> |
      <a href="#">Conditions d'utilisation</a> |
      <a href="#">Confidentialité</a>
    </div>
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
</body>
</html>
`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>app/controllers/</Code>, créez <Code>IndexController.php</Code>. Ce contrôleur doit :
                        <List>
                            <ListItem>hériter de la classe <Code>Controller</Code></ListItem>
                            <ListItem>définir une méthode <Code>index()</Code> qui appelle la vue <Code>index</Code></ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/index.php</Code>, ajoutez le code nécessaire pour :
                        <List>
                            <ListItem>inclure le contrôleur</ListItem>
                            <ListItem>instancier <Code>IndexController</Code></ListItem>
                            <ListItem>appeler sa méthode <Code>index()</Code></ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Lancez le serveur de développement : <CodeCard language="bach" showLineNumbers={false}>{`php -S localhost:8000 -t public`}</CodeCard>
                    </ListItem>

                    <ListItem>
                        Testez votre page sur <Link href="http://localhost:8000" target="_blank">http://localhost:8000</Link>.
                        Vous devez voir la page NetFlex s&apos;afficher correctement.
                    </ListItem>
                </List>
            </section>

            <section>
               <Heading level={2} netflex>C- Gestion des paramètres : Page home.php</Heading>
                <Text>
                    Ici, vous allez créer une deuxième page (<Code>home</Code>) et apprendre à{" "}<strong>transmettre des données du contrôleur à la vue</strong>.
                </Text>

                <List ordered>

                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez un fichier <Code>home.html.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename="home.html.php">
                            {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Stitch Design - Netflex</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Spline+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet"/>
</head>
<body>
<!-- HEADER -->
<header class="border-bottom border-dark px-4 py-3 d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
        <h1 class="logo m-0">NETFLEX</h1>
    </div>
    <div class="d-flex align-items-center gap-3">
    <nav class="d-none d-md-flex gap-3">
        <a class="text-white text-decoration-none" href="#">Home</a>
        <a class="text-white text-decoration-none" href="#">Series</a>
        <a class="text-white text-decoration-none" href="#">Movies</a>
        <a class="text-white text-decoration-none" href="#">New & Popular</a>
        <a class="text-white text-decoration-none" href="#">My List</a>
    </nav>
    </div>
    <div class="d-flex align-items-center gap-3">
        <form class="d-none d-sm-block position-relative">
            <span class="material-symbols-outlined position-absolute top-50 start-0 translate-middle-y ps-2 text-muted">search</span>
            <input class="form-control ps-5 bg-dark border-secondary text-white" type="search" placeholder="Search"/>
        </form>
        <i class="fa-regular fa-circle-user fa-2xl"></i>
    </div>
</header>

<!-- HERO -->
<section class="hero-home d-flex align-items-end text-white" style="background-image: linear-gradient(to top, rgba(20,20,20,0.9) 0%, rgba(20,20,20,0) 50%), url('img/HERO_IMG');">
    <div class="container py-5">
        <h1 class="display-4 fw-bold">HERO_TITLE</h1>
        <div class="d-flex gap-3 small text-white">
            <span>HERO_YEAR</span> | <span>HERO_DURATION</span> | <span class="border px-2">HERO_QUALITY</span> | <span class="border px-2">HERO_AUDIO</span>
        </div>
        <p class="mt-3">
HERO_DESCRIPTION 
        </p>
        <div class="d-flex gap-3 mt-4">
            <button class="btn btn-danger d-flex align-items-center gap-2">
                <i class="fas fa-play"></i> Lire
            </button>
            <button class="btn btn-outline-light d-flex align-items-center gap-2">
                <i class="fas fa-plus"></i> Ajouter à ma liste
            </button>
        </div>
    </div>
</section>

<main class="container py-5">
    <h2 class="text-white mb-4">Nos films</h2>
    <div class="row g-4">
         <!-- Répéter pour d'autres films -->
         <div class="col-md-4 col-lg-3">
            <div class="card bg-dark text-white overflow-hidden film-card">
                <img src="img/ligne_verte.png" class="card-img" alt="La Ligne verte">
                <div class="card-img-overlay d-flex flex-column justify-content-end p-3" style="background: rgba(0,0,0,0.5);">
                    <h5 class="card-title">La Ligne verte</h5>
                    <p class="card-text small">1999 | 3h 9m</p>
                    <div class="d-flex gap-2">
                        <button class="btn btn-danger btn-sm"><i class="fas fa-play"></i></button>
                        <button class="btn btn-outline-light btn-sm"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Répéter pour d'autres films -->
    </div>
</main>

<footer>
    <p>&copy; 2025 Netflex Clone. <a href="#">Privacy</a> | <a href="#">Terms</a></p>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Créez un fichier <Code>HomeController.php</Code> dans{" "}
                        <Code>app/controllers/</Code>.
                        Ce contrôleur doit définir une méthode <Code>home()</Code> qui envoie les
                        données suivantes :
                        <List>
                            <ListItem>heroImg = &quot;ligne_verte.png&quot;</ListItem>
                            <ListItem>heroTitle = &quot;La Ligne verte&quot;</ListItem>
                            <ListItem>heroYear = 1999</ListItem>
                            <ListItem>heroDuration = &quot;3h 9m&quot;</ListItem>
                            <ListItem>heroQuality = &quot;HD&quot;</ListItem>
                            <ListItem>heroAudio = &quot;5.1&quot;</ListItem>
                            <ListItem>
                                heroDescription = &quot;Paul Edgecomb, gardien dans le couloir de la mort,
                                découvre que John Coffey possède un don extraordinaire...&quot;
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/home.php</Code>, instanciez votre{" "}
                        <Code>HomeController</Code> et appelez sa méthode{" "}
                        <Code>home()</Code>.
                    </ListItem>

                    <ListItem>
                        Modifiez <Code>home.html.php</Code> pour remplacer les mots clés
                        (HERO_IMG, HERO_TITLE...) par les variables passées par le contrôleur :
{/*                        <Alert>*/}
{/*                            <BookAlert />*/}
{/*                            <AlertTitle><strong>Rappel du cours</strong></AlertTitle>*/}
{/*                            <AlertDescription>*/}

{/*                            </AlertDescription>*/}
{/*                        </Alert>*/}
                        <CourseReminder>
                            <Text>Lorsqu’on appelle une vue depuis un <strong>Controller</strong>, on peut lui transmettre des données sous forme de tableau associatif.
                            La méthode <code>view()</code> va alors automatiquement créer des variables dont le nom correspond aux clés du tableau, et qui seront disponibles directement dans la vue.
                            </Text>
                            <CodeCard language="php">
                                {`<?php
$this->view('home', [
    "img" => "ligne_verte.png",
    "title" => "La Ligne verte",
    "year" => "1999",
    "duration" => "3h 9m"
]);

// Utilisation dans la vue "home.php"
?>
<img src="<?= $img ?>" alt="<?= $title ?>">
<h1><?= $title ?></h1>
<p>Année : <?= $year ?></p>
<p>Durée : <?= $duration ?></p>
`}
                            </CodeCard>

                            <Text>Ici, chaque clé du tableau est devenue une variable :</Text>
                            <List className="pl-6">
                                <ListItem><Code>$img</Code> contient <em>&quot;ligne_verte.png&quot;</em></ListItem>
                                <ListItem><Code>$title</Code> contient <em>&quot;La Ligne verte&quot;</em></ListItem>
                                <ListItem><Code>$year</Code> contient <em>&quot;1999&quot;</em></ListItem>
                                <ListItem><Code>$duration</Code> contient <em>&quot;3h 9m&quot;</em></ListItem>
                            </List>

                            <Text>Le <strong>Controller</strong> prépare donc les données, et la <strong>Vue</strong> se concentre uniquement sur leur affichage.</Text>
                        </CourseReminder>
                    </ListItem>

                    <ListItem>
                        Testez votre page sur <Link href="http://localhost:8000/home.php" target="_blank">http://localhost:8000/home.php</Link>.
                        Vous devez voir le prénom et la liste de films s&apos;afficher correctement.
                    </ListItem>

                    <ListItem>Mofifier la vue <Code>home</Code> pour que le controleur transmette a la vue les films de la liste : <CodeCard
                        language="php">
                        {`[
    [
        "img" => "ligne_verte.png"
        "title" => "La Ligne verte",
        "year" => "1999",
        "duration" => "3h 9m",
    ],
    [
        "img" => "liste_schindler.jpg"
        "title" => "La Liste de Schindler",
        "year" => "1993",
        "duration" => "3h 15m",
    ],
    "img" => "django.jpg",
        "title" => "Django Unchained",
        "year" => "2012",
        "duration" => "2h 45m",
    [
        "img" => "forrest_gump.jpg",
        "title" => "Forrest Gump",
        "year" => "1994",
        "duration" => "2h 22m",
    ],
    [
        "img" => "shawshank_redemption.jpg",
        "title" => "Les Évadés (The Shawshank Redemption)",
        "year" => "1994",
        "duration" => "2h 22m",
    ],
    [
        "img" => "requiem_dream.jpg",
        "title" => "Requiem for a Dream",
        "year" => "2000",
        "duration" => "1h 42m",
    ],
    [
        "img" => "philadelphia.jpg",
        "title" => "Philadelphia",
        "year" => "1993",
        "duration" => "2h 05m",
    ]
];`}
                    </CodeCard>Pour chaque film, généré le HTML sous <Code>{`<h2 class="text-white mb-4">Nos films</h2>`}</Code>
                    </ListItem>
                     <ListItem>
    Ajouter la gestion du cas où la liste est vide :
    afficher un message <CodeCard language="html">{`<div class="alert alert-info">Aucun film disponible pour le moment.</div>`}</CodeCard>
    à la place de la grille des films.
  </ListItem>
                </List>
            </section>

            {/* D - Pricing dynamique */}
            <section>
               <Heading level={2} netflex>D- Gestion des paramètres : Page index.php</Heading>

                <Text>
                    Vous allez maintenant rendre la section « Pricing » dynamique avec un tableau PHP et une boucle <Code>foreach</Code>.
                </Text>

                <List ordered>
                    <ListItem>
                        Analysez le code HTML statique de la section Pricing dansb<Code>index.html.php</Code>. Repérez les points communs (titre, prix, description...).
                    </ListItem>
                    <ListItem>
                        Dans <Code>IndexController</Code>, créez un tableau associatif avec les 3 offres (basique, standard, premium).
                    </ListItem>
                    <ListItem>
                        Transmettez ce tableau à la vue, puis adaptez le code pour générer les cartes via une boucle <Code>foreach</Code>.
                    </ListItem>
                </List>
            </section>

            {/* E - Templates */}
            <section>
               <Heading level={2} netflex>E- Templates header et footer</Heading>

                <Text>
                    Pour éviter de répéter le code HTML du header et du footer dans toutes vos vues, nous allons les mettre dans des fichiers séparés.
                </Text>

                <List ordered>
                    <ListItem>
                        Créez un dossier <Code>_template/</Code> dans <Code>app/views/</Code>.
                    </ListItem>
                    <ListItem>
                        Ajoutez <Code>header.html.php</Code> avec le début du code HTML (balises <Code>&lt;html&gt;</Code>, <Code>&lt;head&gt;</Code>, <Code>&lt;body&gt;</Code>). Utilisez une variable <Code>$title</Code> pour le titre de la page.
                    </ListItem>
                    <ListItem>
                        Ajoutez <Code>footer.html.php</Code> avec la fin du HTML (balises fermantes et scripts).
                    </ListItem>
                    <ListItem>
                        Incluez ces deux fichiers dans vos vues <Code>index</Code> et <Code>home</Code>.
                    </ListItem>
                    <ListItem>
                        Rechargez vos pages : l’affichage reste identique, mais le code est désormais mieux organisé.
                    </ListItem>
                </List>
            </section>
                <Heading level={2} netflex>F- Personnalisation des pages</Heading>
                <Text>Ajoutez vos films préférés aux pages <Code>home</Code> et <Code>index</Code> en personnalisant uniquement les contrôleurs et les images du dossier <Code>public</Code>.
  Ne modifiez pas les vues <Code>home</Code> et <Code>index</Code>, car elles sont conçues pour être génériques et réutilisables.
  Toutes les modifications doivent passer par les contrôleurs et les images afin de préserver la structure et le style des pages.
</Text>
            <section>

            </section>

            <section>
               <Heading level={2} netflex>G- Résultat attendu</Heading>

                <CodeCard language="txt" showLineNumbers={false}>
                    {`project_tp/
 ├── public/
 │   ├── index.php
 │   ├── home.php
 │   └── css/style.css
 │
 ├── app/
 │   ├── controllers/
 │   │   ├── IndexController.php
 │   │   └── HomeController.php
 │   │
 │   ├── views/
 │   │   ├── index.html.php
 │   │   ├── home.html.php
 │   │   └── _template/
 │   │       ├── header.html.php
 │   │       └── footer.html.php
 │   │
 │   └── core/
 │       └── Controller.php
 │
 └── config/
     └── config.php`}
                </CodeCard>
            </section>
        </article>
    );
}
