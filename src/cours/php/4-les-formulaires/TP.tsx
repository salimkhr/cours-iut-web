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
                <Heading level={2}>A - Convertisseur de devises</Heading>

                <Heading level={3}>1 - Création du formulaire</Heading>
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
                            Modifiez le fichier <Code>convertisseur.php</Code> pour afficher, <strong>sous le formulaire</strong>:
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
                            Modifiez l’affichage du résultat pour afficher :
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
                            effectuez la conversion en multipliant le montant saisi par le taux de change correspondant à la devise choisie. vous afficherez : <Code>&quot;X€ = N YYY&quot;</Code> avec N correspondant au résultat du calcul
                        </Text>
                    </ListItem>

                    <ListItem>
                        Utilisez <Link href="https://developer.mozilla.org/fr/docs/Web/HTML/Reference/Elements/optgroup" target="_blank"><Code>&lt;optgroup&gt;</Code></Link> pour regrouper, au sein du <Code>&lt;select&gt;</Code>, les monnaies par zone géographique (comme défini dans le tableau ci-dessus).
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B - Formulaire de fiche de film</Heading>

                <Heading level={3}>1 - Création du formulaire</Heading>
                <List ordered>
                    <ListItem>
                        <Text>
                            1. Créez un fichier <Code>film.php</Code> contenant un formulaire HTML utilisant la méthode <Code>POST</Code> et possédant un attribut <Code>action</Code>.
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
                            <ListItem><strong>Année</strong> : doit être comprise entre 1888 et l’année suivante</ListItem>
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
                            <ListItem>Ajoutez un <strong>message d’erreur</strong> listant les champs invalides</ListItem>
                        </List>

                        <CourseReminder>
                            <Text>
                                En HTML, l’attribut <Code>value</Code> permet de définir la valeur affichée ou envoyée par un champ de formulaire. Pour les champs texte, number, date, etc., <Code>value</Code> correspond au contenu affiché dans le champ. Pour les boutons radio et les cases à cocher, <Code>value</Code> est la valeur envoyée lorsque l’option est sélectionnée, et l’état est contrôlé avec l’attribut <Code>checked</Code>. Pour les menus déroulants (<Code>&lt;select&gt;</Code>), c’est l’attribut <Code>selected</Code> qui indique quelle option est choisie par défaut. Cela permet de pré-remplir un formulaire avec des données déjà connues, par exemple après une validation ratée.
                            </Text>
                        </CourseReminder>
                    </ListItem>
                </List>
            </section>
            <section>
                <Heading level={2} netflex>C - Login</Heading>

                <Text>en reprenant le projet <Code>NetFlex</Code> du dernier TP, vous allez créer un formulaire de connexion, qui sera réutiliser plus tard.</Text>
                <Heading level={3}>1. Affichage de la page de login</Heading>
                <List ordered>
                    <ListItem>créez la vue <Code>liste.html.php</Code> dans le dossier <Code>view</Code> ayant comme base le HTML suivant :
                        <CodeCard language="html" filename={"liste.html.php"}>
                            {``}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Créez une class <Code>LoginController</Code> dans le fichier <Code>app/controllers/LoginController.php</Code> qui, dans sa méthode <Code>login</Code> affiche la vue <Code>login .html.php</Code>
                    </ListItem>
                    <ListItem>
                        Créez un fichier <Code>login.php</Code> dans le dossier <Code>public</Code> qui crée une instance de <Code>LoginController</Code>
                    </ListItem>
                </List>
                <CourseReminder>
                    <Text>
                        Petit rappel du TP précédent : vous aviez mis en place le mécanisme MVC pour afficher vos pages NetFlex.
                    </Text>
                    <List>
                        <ListItem>
                            <strong>Vue :</strong> le fichier <Code>login.html.php</Code> contient le code HTML qui sera affiché à l’utilisateur.
                        </ListItem>
                        <ListItem>
                            <strong>Contrôleur :</strong> la classe <Code>LoginController</Code> contient la logique pour choisir quelle vue afficher. Ici, elle se contente de charger la vue login.
                        </ListItem>
                        <ListItem>
                            <strong>Appel depuis public :</strong> le fichier <Code>login.php</Code> instancie le contrôleur et appelle sa méthode <Code>login()</Code>. C’est le point d’entrée que l’utilisateur utilise pour accéder à la page via le navigateur.
                        </ListItem>
                    </List>
                    <Text>
                        Apres avoir lancé le serveur web, tester <Link href="http://localhost:8000/login.php" target="_blank"><Code>http://localhost:8000/login.php</Code></Link> dans le navigateur, vous devriez voir la page de login sans les inputs.
                    </Text>
                </CourseReminder>

                <Heading level={3}>2. création du formulaire</Heading>
                <List ordered>
                    <ListItem>Modifiez le fichier <Code>login.html.php</Code> pour y ajouter le formulaire avec comme méthode <Code>POST</Code> et comme action <Code>login.php</Code></ListItem>
                    <ListItem> ajoutez les  les champs suivants :
                        <List>
                            <ListItem><Code>email</Code> Email (champs de type email)</ListItem>
                            <ListItem><Code>password</Code> Mot de passe (champs de type password)</ListItem>
                            <ListItem><Code>submit</Code> et <Code>reset</Code> : Boutons pour envoyer ou réinitialiser le formulaire</ListItem>
                        </List>
                    </ListItem>
                </List>
                <Heading level={3}>3. Gestion du formulaire</Heading>
                <List ordered>
                    <ListItem>
                        Modifier la classe <Code>LoginController</Code> pour rediriger vers <Code>home.php</Code> si la méthode est <Code>POST</Code>, et sinon afficher la vue <Code>login.html.php</Code>.Tester de submit le formulaire pour voir si la redirection ce fait
                    </ListItem>
                    <ListItem>
                        ajouter une propriété privé a la classe <Code>LoginController</Code>
                        <CodeCard language="php">
                            {`private $users = [
        ["email" => "user1@example.com", "password" => "pass123"],
        ["email" => "user2@example.com", "password" => "password"]
    ];
`}
                        </CodeCard>
                        et redirige vers <Code>home.php</Code> uniquement si les données saisis existe dans la liste.(Nous verrons dans un prochain TP comment hacher les mots de passe et comment verifier si un mot de passe est correct).
                    </ListItem>
                    <ListItem>
                        Si le email / mot de passe est invalide, modifier l&apos;appel a la vue pour, dans le tableau data, ajouter une clé <Code>withFailed</Code> qui aura comme valeur <Code>true</Code>
                    </ListItem>
                    <ListItem>
                        Modifier la vue <Code>login.html.php</Code> pour afficher un message d&apos;erreur si la valeur de <Code>withFailed</Code> est <Code>true</Code>
                    </ListItem>
                </List>
            </section>
        </article>
    );
}