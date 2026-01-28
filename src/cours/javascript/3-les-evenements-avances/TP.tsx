import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import {DownloadCodeButton} from "@/components/DownloadCodeButton";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2}>A- Vérification du mot de passe</Heading>
                <Text>Dans le fichier <Code>login.html</Code>, ajoute la page suivante :</Text>
                <DownloadCodeButton language="html" filename="login.html">
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de Mot de Passe</title>
    <!-- Lien vers Bootstrap CSS -->
    <link crossorigin="anonymous" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
              integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" rel="stylesheet">
    <style>
        .password-strength {
            margin-top: 10px;
        }
        .strength-weak { color: red; }
        .strength-medium { color: orange; }
        .strength-strong { color: green; }
    </style>
</head>
<body>

    <div class="container mt-5">
        <h2 class="text-center mb-4">Réinitialiser votre mot de passe</Heading>

        <form id="resetPasswordForm">
            <div class="mb-3">
                <label for="email" class="form-label">Email :</label>
                <input type="email" id="email" name="email" class="form-control" required>
            </div>

            <div class="mb-3">
                <label for="newPassword" class="form-label">Nouveau mot de passe :</label>
                <input type="password" id="newPassword" name="newPassword" class="form-control" required>
            </div>

            <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirmer le mot de passe :</label>
                <input type="password" id="confirmPassword" name="confirmPassword" class="form-control" required>
            </div>

            <div id="passwordStrength" class="password-strength"></div>
            <div id="errorMessage" class="error text-danger mb-3"></div>

            <button type="submit" class="btn btn-primary w-100">Réinitialiser le mot de passe</button>
        </form>
    </div>

   
    <!-- Lien vers Bootstrap JS -->
 <script crossorigin="anonymous"
                integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V"
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js"></script>
<script> 

</script>                
    </body>
</html>`}
                </DownloadCodeButton>
                <List ordered>
                    <ListItem>
                        Crée un gestionnaire d&apos;événements pour la soumission du formulaire de réinitialisation du
                        mot de
                        passe.
                        Il doit empêcher l&apos;envoi du formulaire par défaut en
                        utilisant <Code>event.preventDefault()</Code>.
                    </ListItem>

                    <ListItem>
                        Vérifie si les mots de passe saisis dans les
                        champs <Code>newPassword</Code> et <Code>confirmPassword</Code>
                        correspondent. Si ce n&apos;est pas le cas, affiche un message d&apos;erreur
                        dans <Code>errorMessage</Code> et empêche l&apos;envoi du formulaire.
                    </ListItem>

                    <ListItem>
                        Crée une fonction <Code>validatePassword</Code> qui valide la force du mot de passe saisi
                        dans <Code>newPassword</Code>.
                        La validation doit vérifier :
                        <List ordered>
                            <ListItem>La longueur du mot de passe (au moins 8 caractères). <Code>const lengthCriteria =
                                password.length &gt;= 8;</Code></ListItem>
                            <ListItem>La présence d&apos;une lettre majuscule<Code>const upperCase =
                                /[A-Z]/.test(password);</Code></ListItem>
                            <ListItem>La présence d&apos;une lettre minuscule<Code>const lowerCase =
                                /[a-z]/.test(password);</Code></ListItem>
                            <ListItem>La présence d&apos;un chiffre <Code>const digit =
                                /\d/.test(password);</Code></ListItem>
                            <ListItem>La présence d&apos;un caractère spécial <Code>const specialChar =
                                /[!@#$%^&*]/.test(password);</Code>.</ListItem>
                        </List>
                        <Text>La fonction doit retourner un objet contenant :</Text>
                        <List ordered>
                            <ListItem><Code>isValid</Code> : un booléen indiquant si le mot de passe est
                                valide.</ListItem>
                            <ListItem><Code>message</Code> : un message expliquant pourquoi le mot de passe est
                                invalide
                                (le cas échéant).</ListItem>
                            <ListItem><Code>strength</Code> : un indicateur de la force du mot de passe
                                (&quot;Faible&quot; (&lt; a 4 critères) ,&quot;Moyenne&quot; (4 critères)
                                ou &quot;Fort&quot;
                                (5 critères)).</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Utilise la fonction <Code>validatePassword</Code> pour afficher la force du mot de passe
                        dans <Code>passwordStrength</Code>.
                        Change la classe de <Code>passwordStrength</Code> en fonction de la force du mot de passe
                        (&quot;strength-weak&quot;, &quot;strength-medium&quot;, &quot;strength-strong&quot;).
                    </ListItem>

                    <ListItem>
                        Si tous les critères sont remplis (les mots de passe correspondent et le mot de passe est
                        valide), affiche une alerte
                        avec le message &quot;Mot de passe réinitialisé avec succès !&quot; et réinitialise le
                        formulaire.
                    </ListItem>

                    <ListItem>
                        Ajoute un gestionnaire d&apos;événements pour détecter la perte du focus sur le
                        champ <Code>newPassword</Code>.
                        Ce gestionnaire doit appeler la fonction de validation du mot de passe chaque fois que
                        l&apos;utilisateur quitte le champ.
                    </ListItem>
                </List>

            </section>
            <section>
                <Heading level={2}>B - Création d&apos;un dashboard</Heading>

                <Text>Dans le fichier <Code>Dashboard.html</Code>, ajoute la page suivante :</Text>
                <DownloadCodeButton language="html" filename="dashboard.html">
                    {`<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta content="width=device-width, initial-scale=1.0" name="viewport">
        <title>Mes taches</title>
    
        <!-- Lien vers Bootstrap pour les styles -->
        <link crossorigin="anonymous" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
              integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" rel="stylesheet">
    
        <!-- Lien vers FontAwesome pour les icônes -->
        <script crossorigin="anonymous" src="https://kit.fontawesome.com/1038d5e71f.js"></script>
        <!--    <link href="game.css" rel="stylesheet">-->
    </head>
    
    <body>
        <div class="container">
            <div class="row mb-5">
                <div class="text-center mt-4">
                    <h1>Mes Tâches</h1>
                </div>
            </div>
            <div class="row justify-content-end my-5">
                <div class="col-sm-4 offset-8">
                    <button class="btn btn-primary w-100" id="addTask"><i class="fa fa-add"></i> Ajouter une tâche</button>
                </div>
            </div>
        
            <div class="row row-cols-1 row-cols-md-4 g-4" id="taskList">
        
            </div>
        </div>
        
        <script crossorigin="anonymous"
                integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3"
                src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
        <script crossorigin="anonymous"
                integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V"
                src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js"></script>
        <!-- Lien vers le fichier JavaScript -->
        <script src="dashboard.js"></script>
    </body>
</html>
`}
                </DownloadCodeButton>

                <Text>Dans le fichier <Code>dashboard.js</Code>, ajoute le code suivant :</Text>
                <CodeCard language="javascript">
                    {`const CARD_HTML = \`
        <div class=" col">
            <div class=" card">
                <div class=" card-body">
                    <h5 class=" taskTitle" data-type=" task-title">Titre de la tâche</h5>
                    <p class=" taskDescription" data-type=" task-description">Description de la tâche...</p>
                </div>
                <ul class=" list-group list-group-flush">
                    <li class=" list-group-item d-flex justify-content-between align-items-center">
                        <span class=" item-text" data-type=" item-text">Nouvel élément</span>
                        <button class=" btn btn-danger btn-sm ms-2 delete-item"><i class=" fa fa-trash"></i></button>
                    </li>
                </ul>
                <div class=" card-footer row">
                    <button class=" btn btn-outline-success col add-item mx-1"><i class=" fa fa-add"></i> Ajouter un élément</button>
                    <button class=" btn btn-outline-danger col mx-1 delete-task"><i class=" fa fa-trash"></i> Supprimer cette tâche</button>
                </div>
            </div>
        </div>\`;

const LIST_HTML = \`
            <li class=" list-group-item d-flex justify-content-between align-items-center">
                <span class=" item-text" data-type=" item-text">Nouvel élément</span>
                <button class=" btn btn-danger btn-sm ms-2 delete-item"><i class=" fa fa-trash"></i></button>
            </li>\`;
                    `}
                </CodeCard>

                <List ordered>
                    <ListItem> Crée une fonction <Code>addTask</Code> qui sera exécutée lorsqu&apos;on clique sur
                        le bouton <Code>button#addTask</Code>. Cette fonction devra ajouter à
                        la <Code>div#taskList</Code> le code HTML contenu dans la
                        constante <Code>CARD_HTML</Code>.</ListItem>

                    <ListItem>Attribue un gestionnaire d&apos;événements à la <Code>div#taskList</Code> pour gérer les
                        clics
                        sur les éléments suivants :
                        <List ordered>
                            <ListItem>Ajouter un nouvel élément à la <Code>ul.list-group</Code> en insérant le HTML de
                                la constante <Code>LIST_HTML</Code> lorsque le bouton <Code>button.add-item</Code> est
                                cliqué.</ListItem>
                            <ListItem>Supprimer l&apos;élément <Code>li</Code> parent du bouton lorsque le
                                bouton <Code>button.delete-item</Code> est cliqué.</ListItem>
                            <ListItem>Supprimer l&apos;élément <Code>div.card</Code> parent du bouton lorsque le
                                bouton <Code>button.delete-task</Code> est cliqué.</ListItem>
                            <ListItem>Remplacer l&apos;élément en fonction de
                                l&apos;attribut <Code>data-type</Code> par
                                un <Code>input</Code> ou un <Code>textarea</Code> (pour <Code>task-description</Code>)
                                lorsqu&apos;on clique dessus.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Ajoute un gestionnaire d&apos;événements pour gérer le <Code>onBlur</Code> (perte du focus) sur
                        les
                        éléments, afin de :
                        <List ordered>
                            <ListItem>Remplacer l&apos;élément en fonction de
                                l&apos;attribut <Code>data-type</Code> par
                                un <Code>h5</Code>, un <Code>span</Code> ou un <Code>p</Code>.</ListItem>
                        </List>
                    </ListItem>
                </List>
            </section>
        </article>
    );
}