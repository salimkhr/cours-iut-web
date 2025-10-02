import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";
import CodeCard from "@/components/Cards/CodeCard";
import CourseReminder from "@/components/CourseReminder";
import Link from "next/link";

export default function TP() {

    return (
        <article>
            <section>
                <Heading level={2}>A- Convertisseur de devises</Heading>
                <List ordered>
                    <ListItem>
                        <Text>
                            Créez un fichier <Code>convertisseur.php</Code> contenant un formulaire HTML utilisant la méthode <Code>GET</Code> et possédant un attribut <Code>action</Code>.
                            Ce formulaire devra comporter :
                        </Text>
                        <List className="mt-2">
                            <ListItem>
                                Un champ de type <Code>number</Code> ayant comme <Code>name=&quot;amount&quot;</Code>, permettant la saisie de nombres décimaux positifs
                                (attributs <Code>min=&quot;0&quot;</Code> et <Code>step=&quot;0.01&quot;</Code>).
                            </ListItem>
                            <ListItem>
                                Un libellé (balise <Code>&lt;label&gt;</Code>) associé à ce champ.
                            </ListItem>
                            <ListItem>
                                Un bouton de soumission.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text>
                            Modifiez le fichier <Code>convertisseur.php</Code> pour afficher, <strong>sous le formulaire</strong> :
                            <Code>&quot;Vous voulez convertir X€&quot;</Code> une fois le formulaire soumis.
                            Vous pourrez utiliser le tableau <Code>$_GET</Code> pour récupérer la valeur saisie.
                        </Text>

                        <CourseReminder>
                            <Text>
                                En PHP, lorsqu&apos;un formulaire est soumis, les données envoyées sont accessibles dans un tableau associatif :
                                <Code>$_GET</Code> (si la méthode du formulaire est <Code>GET</Code>) ou <Code>$_POST</Code> (si la méthode est <Code>POST</Code>).
                                La clé utilisée dans ces tableaux correspond toujours à l&apos;attribut <Code>name</Code> défini sur l&apos;élément de formulaire.
                            </Text>
                        </CourseReminder>
                    </ListItem>

                    <ListItem>
                        Ajoutez au formulaire un menu déroulant (<Code>&lt;select&gt;</Code>) nommé <Code>currency</Code> proposant les options suivantes :
                        <List className="mt-2">
                            <ListItem><Code>value=&quot;USD&quot;</Code> Dollar américain (USD)</ListItem>
                            <ListItem><Code>value=&quot;CAD&quot;</Code> Dollar canadien (CAD)</ListItem>
                            <ListItem><Code>value=&quot;BRL&quot;</Code> Réal brésilien (BRL)</ListItem>
                            <ListItem><Code>value=&quot;GBP&quot;</Code> Livre sterling (GBP)</ListItem>
                            <ListItem><Code>value=&quot;CHF&quot;</Code> Franc suisse (CHF)</ListItem>
                            <ListItem><Code>value=&quot;SEK&quot;</Code> Couronne suédoise (SEK)</ListItem>
                            <ListItem><Code>value=&quot;JPY&quot;</Code> Yen japonais (JPY)</ListItem>
                            <ListItem><Code>value=&quot;CNY&quot;</Code> Yuan chinois (CNY)</ListItem>
                            <ListItem><Code>value=&quot;INR&quot;</Code> Roupie indienne (INR)</ListItem>
                            <ListItem><Code>value=&quot;DZD&quot;</Code> Dinar algérien (DZD)</ListItem>
                            <ListItem><Code>value=&quot;TND&quot;</Code> Dinar tunisien (TND)</ListItem>
                            <ListItem><Code>value=&quot;ZAR&quot;</Code> Rand sud-africain (ZAR)</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text>
                            Modifiez l&apos;affichage du résultat pour afficher :
                            <Code>&quot;Vous voulez convertir X€ en YYY&quot;</Code> une fois le formulaire soumis.
                        </Text>
                    </ListItem>

                    <ListItem>
                        <Text>En utilisant le tableau suivant :</Text>
                        <CodeCard language="php">
                            {`$rate = [
    // Amérique
    "USD" => 1.08,
    "CAD" => 1.45,
    "BRL" => 5.35,
    // Europe
    "GBP" => 0.86,
    "CHF" => 0.95,
    "SEK" => 11.20,
    // Asie
    "JPY" => 162.45,
    "CNY" => 7.75,
    "INR" => 88.50,
    // Afrique
    "DZD" => 145.50,
    "TND" => 3.30,
    "ZAR" => 20.15
];`}
                        </CodeCard>
                        <Text>
                            effectuez la conversion en multipliant le montant saisi par le taux de change correspondant à la devise choisie. Vous afficherez : <Code>&quot;X€ = N YYY&quot;</Code> avec N correspondant au résultat du calcul.
                        </Text>
                    </ListItem>

                    <ListItem>
                        Utilisez <Link href="https://developer.mozilla.org/fr/docs/Web/HTML/Reference/Elements/optgroup" target="_blank"><Code>&lt;optgroup&gt;</Code></Link> pour regrouper, au sein du <Code>&lt;select&gt;</Code>, les monnaies par zone géographique (comme défini dans le tableau ci-dessus).
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B- Formulaire de fiche de film</Heading>
                <List ordered>
                    <ListItem>
                        <Text>
                            Créez un fichier <Code>film.php</Code> contenant un formulaire HTML utilisant la méthode <Code>POST</Code> et possédant un attribut <Code>action</Code>.
                            Le formulaire devra comporter les champs suivants :
                        </Text>
                        <List className="mt-2">
                            <ListItem><Code>text</Code> : Titre du film (champ texte simple, obligatoire)</ListItem>
                            <ListItem><Code>number</Code> : Année de sortie (valeurs entre 1888 et l&apos;année prochaine, obligatoire)</ListItem>
                            <ListItem><Code>time</Code> : Durée du film (format hh:mm, obligatoire)</ListItem>
                            <ListItem>
                                <Code>radio</Code> : Qualité vidéo
                                <List>
                                    <ListItem>SD</ListItem>
                                    <ListItem>HD</ListItem>
                                    <ListItem>4K</ListItem>
                                </List>
                            </ListItem>
                            <ListItem>
                                <Code>checkbox</Code> : Langues disponibles
                                <List>
                                    <ListItem>Français</ListItem>
                                    <ListItem>Anglais</ListItem>
                                    <ListItem>Espagnol</ListItem>
                                </List>
                            </ListItem>
                            <ListItem>
                                <Code>select</Code> : Genre du film (optionnel, &quot;Autre&quot; sélectionné par défaut)
                                <List>
                                    <ListItem>Drame</ListItem>
                                    <ListItem>Comédie</ListItem>
                                    <ListItem>Science-fiction</ListItem>
                                    <ListItem>Action</ListItem>
                                    <ListItem>Autre</ListItem>
                                </List>
                            </ListItem>
                            <ListItem><Code>color</Code> : Couleur de fond de la fiche (par défaut <Code>#000000</Code>)</ListItem>
                            <ListItem><Code>range</Code> : Note du film (0 à 10, incréments de 1)</ListItem>
                            <ListItem><Code>date</Code> : Date de sortie du film</ListItem>
                            <ListItem><Code>textarea</Code> : Description du film (multi-lignes)</ListItem>
                            <ListItem><Code>submit</Code> et <Code>reset</Code> : Boutons pour envoyer ou réinitialiser le formulaire</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text>
                            Lorsque le formulaire est soumis, affichez une &quot;fiche film&quot; stylisée en utilisant directement les données saisies (même si elles ne respectent pas toutes les règles).
                        </Text>
                        <CodeCard language="php">
                            {`<div class="film-card" style="background-color: <?= $color ?>; padding: 20px; border-radius: 8px; color: #fff; max-width: 400px;">
    <h2><?= $title ?></h2>
    <p><strong>Année :</strong> <?= $year ?></p>
    <p><strong>Durée :</strong> <?= $duration ?></p>
    <p><strong>Qualité :</strong> <?= $quality ?></p>
    <p><strong>Langues :</strong> <?= implode(', ', $languages) ?></p>
    <p><strong>Note :</strong> <?= $rating ?>/10</p>
    <p><strong>Date de sortie :</strong> <?= $release_date ?></p>
    <p><strong>Description :</strong></p>
    <p><?= $description ?></p>
</div>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        <Text>
                            Ajoutez ensuite une validation des données :
                        </Text>
                        <List className="mt-2">
                            <ListItem><strong>Titre</strong> : obligatoire (ne doit pas être vide)</ListItem>
                            <ListItem><strong>Année</strong> : doit être comprise entre 1888 et l&apos;année suivante</ListItem>
                            <ListItem><strong>Durée</strong> : obligatoire (format hh:mm)</ListItem>
                            <ListItem><strong>Qualité</strong> : une seule valeur parmi SD, HD ou 4K</ListItem>
                            <ListItem><strong>Langues</strong> : au moins une sélection possible (facultatif mais recommandé)</ListItem>
                            <ListItem><strong>Genre</strong> : si aucune sélection, valeur par défaut = Autre</ListItem>
                            <ListItem><strong>Note</strong> : comprise entre 0 et 10</ListItem>
                            <ListItem><strong>Date de sortie</strong> : obligatoire (format date valide)</ListItem>
                            <ListItem><strong>Description</strong> : obligatoire (minimum quelques caractères)</ListItem>
                        </List>
                        <Text className="mt-2">Si une ou plusieurs règles ne sont pas respectées :</Text>
                        <List className="mt-2">
                            <ListItem>Réaffichez le formulaire</ListItem>
                            <ListItem>Conservez les données saisies (<Code>value</Code>, <Code>checked</Code>, <Code>selected</Code>)</ListItem>
                            <ListItem>Ajoutez un <strong>message d&apos;erreur</strong> listant les champs invalides</ListItem>
                        </List>

                        <CourseReminder>
                            <Text>
                                En HTML, l&apos;attribut <Code>value</Code> permet de définir la valeur affichée ou envoyée par un champ de formulaire. Pour les champs texte, number, date, etc., <Code>value</Code> correspond au contenu affiché dans le champ. Pour les boutons radio et les cases à cocher, <Code>value</Code> est la valeur envoyée lorsque l&apos;option est sélectionnée, et l&apos;état est contrôlé avec l&apos;attribut <Code>checked</Code>. Pour les menus déroulants (<Code>&lt;select&gt;</Code>), c&apos;est l&apos;attribut <Code>selected</Code> qui indique quelle option est choisie par défaut. Cela permet de pré-remplir un formulaire avec des données déjà connues, par exemple après une validation ratée.
                            </Text>
                        </CourseReminder>
                    </ListItem>
                </List>
            </section>
            <section>
                <Heading level={2} netflex>C- Login</Heading>

                <Text>En reprenant le projet <Code>NetFlex</Code> du dernier TP, vous allez créer un formulaire de connexion, qui sera réutilisé plus tard.</Text>
                <Heading level={3}>1. Affichage de la page de login</Heading>
                <List ordered>
                    <ListItem>Créez la vue <Code>login.html.php</Code> dans le dossier <Code>view</Code> ayant comme base le HTML suivant :
                        <CodeCard language="html" filename={"login.html.php"}>
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
        <a href="#" class="btn btn-danger fw-bold">Créer un compte</a>
    </div>
</nav>

<!-- Hero -->
<header class="hero d-flex flex-column justify-content-between">
    <div class="hero-content w-100" style="max-width: 400px; margin: 30vh auto;">
        <div class="card p-4 bg-dark text-white shadow">
            <h2 class="text-center mb-4">Connexion</h2>
            <form>
<!-- FORM CONTENT HERE -->
                <p class="text-center">Pas encore inscrit ? <a href="#" class="text-danger">Créer un compte</a></p>
            </form>
        </div>
    </div>
</header>

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
                        Créez une classe <Code>LoginController</Code> dans le fichier <Code>app/controllers/LoginController.php</Code> qui, dans sa méthode <Code>login</Code>, affiche la vue <Code>login.html.php</Code>.
                    </ListItem>
                    <ListItem>
                        Créez un fichier <Code>login.php</Code> dans le dossier <Code>public</Code> qui crée une instance de <Code>LoginController</Code>.
                    </ListItem>
                </List>
                <CourseReminder>
                    <Text>
                        Petit rappel du TP précédent : vous aviez mis en place le mécanisme MVC pour afficher vos pages NetFlex.
                    </Text>
                    <List>
                        <ListItem>
                            <strong>Vue :</strong> le fichier <Code>login.html.php</Code> contient le code HTML qui sera affiché à l&apos;utilisateur.
                        </ListItem>
                        <ListItem>
                            <strong>Contrôleur :</strong> la classe <Code>LoginController</Code> contient la logique pour choisir quelle vue afficher. Ici, elle se contente de charger la vue login.
                        </ListItem>
                        <ListItem>
                            <strong>Appel depuis public :</strong> le fichier <Code>login.php</Code> instancie le contrôleur et appelle sa méthode <Code>login()</Code>. C&apos;est le point d&apos;entrée que l&apos;utilisateur utilise pour accéder à la page via le navigateur.
                        </ListItem>
                    </List>
                    <Text>
                        Après avoir lancé le serveur web, testez <Link href="http://localhost:8000/login.php" target="_blank"><Code>http://localhost:8000/login.php</Code></Link> dans le navigateur, vous devriez voir la page de login sans les inputs.
                    </Text>
                </CourseReminder>

                <Heading level={3}>2. Création du formulaire</Heading>
                <List ordered>
                    <ListItem>Modifiez le fichier <Code>login.html.php</Code> pour y ajouter le formulaire avec comme méthode <Code>POST</Code> et comme action <Code>login.php</Code>.</ListItem>
                    <ListItem>Ajoutez les champs suivants :
                        <List>
                            <ListItem><Code>email</Code> Email (champ de type email)</ListItem>
                            <ListItem><Code>password</Code> Mot de passe (champ de type password)</ListItem>
                            <ListItem><Code>submit</Code> et <Code>reset</Code> : Boutons pour envoyer ou réinitialiser le formulaire</ListItem>
                        </List>
                    </ListItem>
                </List>
                <Heading level={3}>3. Gestion du formulaire</Heading>
                <List ordered>
                    <ListItem>
                        Modifiez la classe <Code>LoginController</Code> pour rediriger vers <Code>home.php</Code> si la méthode est <Code>POST</Code>, et sinon afficher la vue <Code>login.html.php</Code>. Testez de soumettre le formulaire pour voir si la redirection se fait.
                    </ListItem>
                    <ListItem>
                        Ajoutez une propriété privée à la classe <Code>LoginController</Code> :
                        <CodeCard language="php">
                            {`private $users = [
    ["email" => "user1@example.com", "password" => "pass123"],
    ["email" => "user2@example.com", "password" => "password"]
];`}
                        </CodeCard>
                        et redirigez vers <Code>home.php</Code> uniquement si les données saisies existent dans la liste. (Nous verrons dans un prochain TP comment hacher les mots de passe et comment vérifier si un mot de passe est correct).
                    </ListItem>
                    <ListItem>
                        Si l&apos;email / mot de passe est invalide, modifiez l&apos;appel à la vue pour, dans le tableau data, ajouter une clé <Code>withFailed</Code> qui aura comme valeur <Code>true</Code>.
                    </ListItem>
                    <ListItem>
                        Modifiez la vue <Code>login.html.php</Code> pour afficher un message d&apos;erreur si la valeur de <Code>withFailed</Code> est <Code>true</Code>.
                    </ListItem>
                </List>
            </section>
            <section>
                <Heading level={2} netflex>D- Inscription</Heading>
                <Heading level={3}>1. Affichage de la page d&apos;inscription</Heading>
                <List ordered>
                    <ListItem>
                        Créez la vue <Code>register.html.php</Code> dans le dossier <Code>view</Code> ayant comme base le même HTML que la page login. modifier le titre de la page en <Code>Inscription</Code> et ajouter un lien vers la page de connexion :/
                    </ListItem>
                    <ListItem>
                        Créez une classe <Code>RegisterController</Code> dans le fichier <Code>app/controllers/RegisterController.php</Code> qui, dans sa méthode <Code>register</Code>, affiche la vue <Code>register.html.php</Code>.
                    </ListItem>
                    <ListItem>
                        Créez un fichier <Code>register.php</Code> dans le dossier <Code>public</Code> qui crée une instance de <Code>RegisterController</Code>.
                    </ListItem>
                </List>

                <CourseReminder>
                    <Text>
                        Comme pour la page de login, vous mettez en place le mécanisme MVC pour la page d&apos;inscription :
                    </Text>
                    <List>
                        <ListItem>
                            <strong>Vue :</strong> le fichier <Code>register.html.php</Code> contient le code HTML qui sera affiché à l&apos;utilisateur.
                        </ListItem>
                        <ListItem>
                            <strong>Contrôleur :</strong> la classe <Code>RegisterController</Code> contient la logique pour choisir quelle vue afficher.
                        </ListItem>
                        <ListItem>
                            <strong>Appel depuis public :</strong> le fichier <Code>register.php</Code> instancie le contrôleur et appelle sa méthode <Code>register()</Code>.
                        </ListItem>
                    </List>
                    <Text>
                        Après avoir lancé le serveur web, testez <Link href="http://localhost:8000/register.php" target="_blank"><Code>http://localhost:8000/register.php</Code></Link> dans le navigateur, vous devriez voir la page d&apos;inscription sans les inputs.
                    </Text>
                </CourseReminder>

                <Heading level={3}>2. Création du formulaire</Heading>
                <List ordered>
                    <ListItem>
                        Modifiez le fichier <Code>register.html.php</Code> pour y ajouter le formulaire avec comme méthode <Code>POST</Code> et comme action <Code>register.php</Code>.
                    </ListItem>
                    <ListItem>
                        Ajoutez les champs suivants :
                        <List>
                            <ListItem><Code>username</Code> : Nom d&apos;utilisateur (champ de type text)</ListItem>
                            <ListItem><Code>email</Code> : Email (champ de type email)</ListItem>
                            <ListItem><Code>password</Code> : Mot de passe (champ de type password)</ListItem>
                            <ListItem><Code>confirm_password</Code> : Confirmation du mot de passe (champ de type password)</ListItem>
                            <ListItem><Code>birthdate</Code> : Date de naissance (champ de type date)</ListItem>
                            <ListItem><Code>terms</Code> : Case à cocher pour accepter les conditions d&apos;utilisation (checkbox)</ListItem>
                            <ListItem><Code>submit</Code> et <Code>reset</Code> : Boutons pour envoyer ou réinitialiser le formulaire</ListItem>
                        </List>
                    </ListItem>
                </List>

                <Heading level={3}>3. Gestion du formulaire</Heading>
                <List ordered>
                    <ListItem>
                        Modifiez la classe <Code>RegisterController</Code> pour rediriger vers <Code>login.php</Code> si la méthode est <Code>POST</Code>, et sinon afficher la vue <Code>register.html.php</Code>. Testez de soumettre le formulaire pour voir si la redirection se fait.
                    </ListItem>
                    <ListItem>
                        Ajoutez une propriété privée à la classe <Code>RegisterController</Code> :
                        <CodeCard language="php">
                            {`private $users = [
    ["email" => "user1@example.com", "password" => "pass123"],
    ["email" => "user2@example.com", "password" => "password"]
];`}
                        </CodeCard>
                        <Text>
                            Implémentez les règles de validation suivantes :
                        </Text>
                        <List className="mt-2">
                            <ListItem><strong>Nom d&apos;utilisateur :</strong> obligatoire, minimum 3 caractères, maximum 20 caractères, uniquement des lettres, chiffres et tirets bas (_)</ListItem>
                            <ListItem><strong>Email :</strong> obligatoire, format email valide (utilisez <Code>filter_var($email, FILTER_VALIDATE_EMAIL)</Code>)</ListItem>
                            <ListItem><strong>Mot de passe :</strong> obligatoire, minimum 8 caractères, doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial (@$!%*?&)</ListItem>
                            <ListItem><strong>Confirmation du mot de passe :</strong> doit être identique au mot de passe</ListItem>
                            <ListItem><strong>Date de naissance :</strong> obligatoire, l&apos;utilisateur doit avoir au moins 13 ans</ListItem>
                            <ListItem><strong>Conditions d&apos;utilisation :</strong> la case doit être cochée</ListItem>
                        </List>
                        <Text className="mt-2">
                            Si toutes les validations passent, redirigez vers <Code>login.php</Code>. (Dans un prochain TP, nous verrons comment sauvegarder les données dans une base de données).
                        </Text>
                    </ListItem>
                    <ListItem>
                        Si une ou plusieurs validations échouent, modifiez l&apos;appel à la vue pour, dans le tableau data, ajouter une clé <Code>errors</Code> qui contiendra un tableau avec les messages d&apos;erreur, et une clé <Code>oldData</Code> pour conserver les données saisies (sauf les mots de passe).
                    </ListItem>
                    <ListItem>
                        Modifiez la vue <Code>register.html.php</Code> pour :
                        <List className="mt-2">
                            <ListItem>Afficher les messages d&apos;erreur si le tableau <Code>errors</Code> existe et n&apos;est pas vide</ListItem>
                            <ListItem>Pré-remplir les champs avec les valeurs de <Code>oldData</Code> (sauf les champs de type password)</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Ajoutez un lien sur la page de login (<Code>login.php</Code>) vers la page d&apos;inscription et inversement sur la page d&apos;inscription vers la page de login.
                    </ListItem>
                </List>

                <CourseReminder>
                    <Text>
                        Pour valider un mot de passe complexe, vous pouvez utiliser des expressions régulières (regex) en PHP avec la fonction <Code>preg_match()</Code>. Exemple :
                    </Text>
                    <CodeCard language="php">
                        {`// Vérifier si le mot de passe contient au moins une majuscule, une minuscule, un chiffre et un caractère spécial
$pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/';
if (preg_match($pattern, $password)) {
    // Le mot de passe est valide
} else {
    $errors[] = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial";
}`}
                    </CodeCard>
                    <Text className="mt-2">
                        Pour calculer l&apos;âge à partir d&apos;une date de naissance, vous pouvez utiliser la classe <Code>DateTime</Code> :
                    </Text>
                    <CodeCard language="php">
                        {`$birthdate = new DateTime($birthdateString);
$today = new DateTime();
$age = $today->diff($birthdate)->y;

if ($age < 13) {
    $errors[] = "Vous devez avoir au moins 13 ans pour vous inscrire";
}`}
                    </CodeCard>
                </CourseReminder>
            </section>
        </article>
    );
}