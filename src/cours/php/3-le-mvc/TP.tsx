import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import Link from "next/link";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2}>A - Initialisation du projet</Heading>

                Récupérez le code source de départ depuis le dépôt Git : <CodeCard language="bash" showLineNumbers={false}>
                {`git clone https://gitlab.com/iut3334332/php/mvc.git
cd mvc`}
            </CodeCard>

            </section>
            <section>
                <Heading level={2}>B - Première page simple : index.php</Heading>

                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>app/controllers/</Code>, créez un fichier <Code>IndexController.php</Code>.
                        Ce contrôleur doit hériter de la classe <Code>Controller</Code> et définir une méthode <Code>index()</Code> qui appelle la vue <Code>index</Code>.
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/index.php</Code>, ajoutez le code nécessaire pour instancier votre <Code>IndexController</Code> et appeler sa méthode <Code>index()</Code>.
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez un fichier <Code>index.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename="index.php">
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
                        Lancez le serveur de développement : <Code> php -S localhost:8000 -t public public/error.php</Code>
                    </ListItem>

                    <ListItem>
                        Testez votre page sur <Link href="http://localhost:8000" target="_blank">http://localhost:8000</Link>.
                        Vous devez voir la page NetFlex s&apos;afficher correctement.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>C - Gestion des paramètres : Page home.php</Heading>

                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>app/controllers/</Code>, créez un fichier <Code>HomeController.php</Code>.
                        Ce contrôleur doit hériter de la classe <Code>Controller</Code> et définir une méthode <Code>index()</Code> qui transmet une variable <Code>$firstname</Code> et un tableau <Code>$films</Code> à la vue <Code>home</Code>.
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/home.php</Code>, ajoutez le code nécessaire pour instancier votre <Code>HomeController</Code> et appeler sa méthode <Code>index()</Code>.
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez un fichier <Code>home.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename="home.php">
                            {`<h2>Bienvenue sur NetFlex, <?= htmlspecialchars($firstname) ?> !</h2>

<?php if (!empty($films)): ?>
    <section class="films">
        <?php foreach ($films as $film): ?>
            <div class="film">
                <h3><?= htmlspecialchars($film['titre']) ?></h3>
                <p>Année : <?= htmlspecialchars($film['annee']) ?></p>
            </div>
        <?php endforeach; ?>
    </section>
<?php endif; ?>

<?php include __DIR__ . '/_template/header.php'; ?>
<?php include __DIR__ . '/_template/footer.php'; ?>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Testez votre page sur <Link href="http://localhost:8000/home.php" target="_blank">http://localhost:8000/home.php</Link>.
                        Vous devez voir le prénom et la liste de films s&apos;afficher correctement.
                    </ListItem>
                </List>
            </section>

            <section>
            <Heading level={2}>D - Gestion des paramètres : Page index.php</Heading>

            <Text>
                Analysez le code HTML statique de la section « Pricing » dans{" "}
                <Code>index.php</Code>. Identifiez les différences et points communs entre
                les 3 offres.
            </Text>

            <List ordered>
                <ListItem>
                    Proposez une structure PHP (tableau associatif) pour représenter les 3
                    offres avec titre, prix ...
                </ListItem>

                <ListItem>
                    Modifiez le contrôleur <Code>IndexController</Code> pour créer ce tableau
                    et le transmettre à la vue.
                </ListItem>

                <ListItem>
                    Adaptez la vue pour générer les cartes d’offres via une boucle
                    <Code>foreach</Code>, au lieu d’écrire le HTML en dur.
                </ListItem>

                <ListItem>
                    Vérifiez que le rendu visuel est identique et notez les avantages de cette
                    approche (maintenabilité, réutilisation, séparation logique/affichage).
                </ListItem>
            </List>
        </section>

            <section>
                <Heading level={2}>E - Templates header et footer</Heading>

                <List ordered>
                    <ListItem>
                        Créez un dossier <Code>_template/</Code> dans <Code>app/views/</Code>
                    </ListItem>

                    <ListItem>
                        Créez le fichier <Code>app/views/_template/header.php</Code> avec le début du HTML commun aux pages index.php et home.php
                    </ListItem>

                    <ListItem>
                        Créez le fichier <Code>app/views/_template/footer.php</Code> aavec la fin du HTML commun aux pages index.php et home.php
                    </ListItem>

                    <ListItem>
                        Modifiez vos vues <Code>index.php</Code> et <Code>home.php</Code> pour inclure le header et le footer.
                    </ListItem>

                    <ListItem>
                        Rechargez vos pages : l’affichage est identique mais le code est maintenant plus modulaire.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>F - Gestion des erreurs 404</Heading>

                <List ordered>
                    <ListItem>
                        Créez un fichier <Code>app/controllers/ErrorController.php</Code> qui hérite de la classe <Code>Controller</Code>.
                    </ListItem>

                    <ListItem>
                        Créez la vue d&apos;erreur dans <Code>app/views/error.php</Code> :
                        <CodeCard language="html" filename="app/views/error.php">
                            {`<?php include __DIR__ . '/_template/header.php'; ?>
<!-- Contenu 404 -->
<main class="error-container">
    <div class="error-code">404</div>
    <h1 class="fw-bold">Oups ! Page introuvable</h1>
    <p class="error-message">Il semble que vous soyez perdu dans le streaming...</p>
    <a href="index.html" class="btn btn-danger btn-lg fw-bold">Retour à l'accueil</a>
</main>
<?php include __DIR__ . '/_template/footer.php'; ?>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Dans la classe <Code>ErrorController</Code>, ajoutez une méthode <Code>error404()</Code> qui affiche cette vue avec le bon code de statut HTTP (404).
                    </ListItem>

                    <ListItem>
                        Créé le fichier <Code>public/error.php</Code> pour appeler le controller d&apos;erreur.
                    </ListItem>

                    <ListItem>
                        Testez en accédant à une page inexistante comme <Code>http://localhost:8000/pageInexistante.php</Code> - vous devriez voir votre page d&apos;erreur personnalisée !
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>G - Résultat attendu</Heading>

                <CodeCard language="txt" showLineNumbers={false}>
                    {`project_tp/
├── public/
│   ├── api
│   │   └── films.php
│   ├── index.php
│   ├── home.php
│   └── css/
│       └── style.css
├── app/
│   ├── controllers/
│   │   ├── IndexController.php
│   │   └── HomeController.php
│   ├── views/
│   │   ├── index.php
│   │   ├── home.php
│   │   └── _template/
│   │       ├── header.php
│   │       └── footer.php
│   └── core/
│       └── Controller.php`}
                </CodeCard>
            </section>
        </article>
    );
}