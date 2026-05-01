import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import CodeCard from "@/components/Cards/CodeCard";
import {HStack} from "@/components/ui/Stack";
import {DownloadCodeButton} from "@/components/DownloadCodeButton";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2}>A- Introduction aux événements</Heading>
                <Text>
                    Dans un fichier <Code>events.html</Code>, créez une page HTML contenant :
                </Text>
                <CodeCard language="html">
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Événements en JavaScript</title>
    <style>
        #colorBox {
            width: 100px;
            height: 100px;
            background-color: grey;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <button id="btnClick">Cliquer ici</button>
    <div id="colorBox"></div>
    <input type="text" id="nameInput" placeholder="Entrez votre nom" />
    <p id="greetingText"></p>
    <script src="events.js"></script>
</body>
</html>`}
                </CodeCard>

                <Text>Complétez le fichier <Code>events.js</Code> pour effectuer les manipulations suivantes :</Text>
                <List ordered>
                    <ListItem>
                        <Text className="font-bold">Événement de clic</Text> : utilisez{" "}
                        <Code>addEventListener</Code> pour ajouter un événement au bouton. Lorsque le bouton
                        est cliqué, affichez une alerte avec le message{" "}
                        <Code>&quot;Bouton cliqué !&quot;</Code>.
                    </ListItem>

                    <ListItem>
                        <Text className="font-bold">Événement au survol</Text> : ajoutez un gestionnaire
                        d&apos;événement à la <Code>div#colorBox</Code>. Lorsque la souris survole la boîte :
                        <List>
                            <ListItem>Changez la couleur de fond en bleu.</ListItem>
                            <ListItem>
                                Lorsque la souris quitte la boîte, remettez la couleur initiale (grise).
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text className="font-bold">Événement d&apos;entrée clavier</Text> : ajoutez un
                        gestionnaire d&apos;événement à l&apos;<Code>input#nameInput</Code>. Lorsque du texte
                        est saisi, affichez le texte saisi dans le paragraphe <Code>p#greetingText</Code>.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B- Qui veut gagner des bytes en masse</Heading>

                <Text>
                    Le but de ce TP est de simuler le célèbre jeu &quot;Qui veut gagner des millions&quot; en
                    JavaScript. Vous devez gérer les questions, les réponses, les jokers et le système de progression.
                </Text>

                <Text>Téléchargez les fichiers de départ :</Text>
                <HStack>
                    <DownloadCodeButton language="html" filename={"game.html"}>
                        {`<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qui veut gagner des bytes en masse</title>

    <!-- Lien vers Bootstrap pour le style -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

    <!-- Lien vers FontAwesome pour les icônes -->
    <script src="https://kit.fontawesome.com/1038d5e71f.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="game.css">
</head>

<body>

<div class="container">
    <div class="row mb-5">
        <div class="text-center mt-4">
            <h1><i class="fa fa-code"></i>QUI VEUT GAGNER DES BYTES EN MASSE ? <i class="fa fa-code"></i></h1>
        </div>
    </div>
    <div class="row mt-5">
        <!-- Contenu principal -->
        <div class="col-lg-10">
            <!-- Question Box -->
            <div class="question-box text-center mx-auto">
                <p class="question-text" id="question">Votre question ici ?</p>
                <p id="explanation">Votre explication ici</p>
            </div>
        </div>

        <!-- Colonne des montants -->
        <div class="col-lg-2 money-tree">
            <!-- Lifelines -->
            <div class="text-center lifelines">
                <span class="lifeline" id="fifty-fifty" title="le moite moite">
                    <i class="fas fa-percent"></i>
                </span>
                <span class="lifeline" id="call-friend" title="Appeler un ami">
                    <i class="fas fa-phone"></i>
                </span>
                <span class="lifeline" id="ask-audience" title="Demander au public">
                    <i class="fas fa-users"></i>
                </span>
            </div>
            <div class="money-item">1 000 000 €</div>
            <div class="money-item">500 000 €</div>
            <div class="money-item">250 000 €</div>
            <div class="money-item">100 000 €</div>
            <div class="money-item">50 000 €</div>
            <div class="money-item">30 000 €</div>
            <div class="money-item">20 000 €</div>
            <div class="money-item">10 000 €</div>
            <div class="money-item">5 000 €</div>
            <div class="money-item">3 000 €</div>
            <div class="money-item">2 000 €</div>
            <div class="money-item">1 000 €</div>
            <div class="money-item active">500 €</div>
        </div>
    </div>

    <!-- Réponses -->
    <div class="answers row g-3 mt-5">
        <div class="col-6">
            <button class="answer" data-index="0" id="answer-0">Réponse A</button>
        </div>
        <div class="col-6">
            <button class="answer" data-index="1" id="answer-1">Réponse B</button>
        </div>
        <div class="col-6">
            <button class="answer" data-index="2" id="answer-2">Réponse C</button>
        </div>
        <div class="col-6">
            <button class="answer" data-index="3" id="answer-3">Réponse D</button>
        </div>
    </div>
</div>

<!-- Modale pour afficher l'avis du public -->
<div id="ask-audience-modal" class="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Résultats de l'avis du public</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><i class="fa fa-close"></i> </button>
            </div>
            <div class="modal-body">
                <p>Voici ce que l'audience pense :</p>
                <div class="row">
                    <div class="col">
                        <div class="progress">
                            <div class="progress-bar" style="height: 25%;">A - 25%</div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="progress">
                            <div class="progress-bar" style="height: 25%;">B - 25%</div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="progress">
                            <div class="progress-bar" style="height: 25%;">C - 25%</div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="progress">
                            <div class="progress-bar" style="height: 25%;">D - 25%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modale de l'appel avec téléphone qui vibre -->
<div id="call-friend-modal" class="modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Appel avec un ami</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <i class="fa fa-phone text-success" id="vibrating"></i>
                <!-- Téléphone avec animation de vibration -->
                <div id="phone" class="phone">
                    <div id="phone-screen">Appel en cours...</div>
                </div>
                <button id="hang-up" class="btn btn-danger" style="display: none;">Raccrocher</button>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.min.js" integrity="sha384-cuYeSxntonz0PPNlHhBs68uyIAVpIIOZZ5JqeqvYYIcEL727kskC66kF92t6Xl2V" crossorigin="anonymous"></script>
<!-- Lien vers le fichier JavaScript du jeu -->
<script src="question.js"></script>
<script src="game.js"></script>

</body>

</html>`}
                    </DownloadCodeButton>
                    <DownloadCodeButton language="css" filename={"game.css"}>
                        {`body {
    background: linear-gradient(135deg, #0f0f2d, #2a2a64);
    color: #fff; /* Texte blanc */
    font-family: 'Arial', sans-serif;
    height: 100vh;
}

.question-box {
    background-color: #222258;
    border: 3px solid #f1c40f; /* Bordure jaune */
    border-radius: 15px;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    margin-top:25vh;
}

.question-text {
    font-size: 1.5rem;
    font-weight: bold;
}

.answers {
    margin-top: 20px;
}

.answer {
    padding: 10px;
    border: 2px solid #f1c40f; /* Bordure jaune */
    border-radius: 10px;
    background-color: #333372;
    color: white;
    text-align: center;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
}

.answer:hover {
    background-color: #5555aa;
}

.answer.correct {
    background-color: #28a745; /* Vert */
    color: white;
    border: 2px solid #1e7e34; /* Bordure plus foncée */
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5); /* Ombre de texte */
    cursor: pointer;
}

.answer.correct:hover {
    background-color: #218838; /* Hover plus sombre */
    animation: bounce 0.5s ease-in-out; /* Animation de rebond */
}

.answer.incorrect {
    background-color: #dc3545; /* Rouge */
    color: white;
    border: 2px solid #c82333; /* Bordure rouge foncé */
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5); /* Ombre de texte */
    cursor: pointer;
}

.answer.incorrect:hover {
    background-color: #c82333; /* Hover plus sombre */
    animation: shake 0.5s ease-in-out;
}

.answer:disabled {
    background-color: #d3d3d3; /* Gris clair pour l'arrière-plan */
    color: #a9a9a9; /* Gris clair pour le texte */
    border: 1px solid #b0b0b0; /* Bordure gris clair */
    cursor: not-allowed; /* Curseur indiquant que l'élément est inactif */
    opacity: 0.6; /* Transparence pour le rendre visuellement inactif */
}

.money-tree {
    text-align: right;
}

@keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(5px); }
}
/* Animation de rebond pour une bonne réponse */
@keyframes bounce {
    0% { transform: translateY(0); }
    25% { transform: translateY(-10px); }
    50% { transform: translateY(0); }
    75% { transform: translateY(-5px); }
    100% { transform: translateY(0); }
}

.money-item {
    margin-bottom: 5px;
    padding: 5px 10px;
    border: 1px solid #f1c40f; /* Bordure jaune */
    background-color: #1c1c4d;
    color: white;
    font-weight: bold;
    border-radius: 5px;
}

.money-item.active {
    background-color: #f1c40f; /* Actif */
    color: black;
}

.lifelines {
    margin-bottom: 20px;
}

.lifeline {
    margin: 0 10px;
    cursor: pointer;
    color: #fff;
    font-size: 1.5rem;
    transition: all 3s ease;
}

.lifeline:hover {
    color: #ffc107;
}

.modal-content
{
    background: linear-gradient(135deg, #0f0f2d, #2a2a64);
}

.btn-close i
{
    color: white;
}


.progress-bar {
    height: 30px;
    line-height: 30px;
    color: white;
    text-align: center;
}

.progress-bar {
    text-align: center;
    line-height: 30px;
    color: white;
    width: 100%;
}

/* Style pour les barres verticales */
.progress {
    height: 200px; /* Hauteur pour les barres verticales */
    border-radius: 10px;
    position: relative;
    background-color: #333372;
    border: 1px solid #f1c40f; /* Bordure jaune */
}

.progress-bar {
    position: absolute;
    bottom: 0;
    text-align: center;
    border-radius: 5px;
    background-color: #1c1c4d;
}

#vibrating {
    animation: vibrate 0.5s infinite;
    font-size: 4rem;
}

@keyframes vibrate {
    0% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-5px);
    }
    50% {
        transform: translateX(5px);
    }
    75% {
        transform: translateX(-5px);
    }
    100% {
        transform: translateX(0);
    }
}`}
                    </DownloadCodeButton>
                    <DownloadCodeButton language="js" filename={"game.js"}>
                        {`// Ajout des événements pour les jokers
function showAskAudience() {
    const modal = new bootstrap.Modal(document.getElementById('ask-audience-modal'));
    modal.show();
}

function showCallFriend() {
    const friendIcon = document.getElementById('vibrating');
    friendIcon.classList.replace('text-danger', 'text-success');

    const modal = new bootstrap.Modal(document.getElementById('call-friend-modal'));
    modal.show();

    setTimeout(() => {
        friendIcon.classList.replace('text-success', 'text-danger');
    }, 3000);

    setTimeout(() => {
        modal.hide();
    }, 5000);
}

function fiftyFifty() {

}

function displayQuestion(index) {
    console.log(index)
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('ask-audience').addEventListener('click', showAskAudience);
    document.getElementById('call-friend').addEventListener('click', showCallFriend);
    document.getElementById('fifty-fifty').addEventListener('click', fiftyFifty);

    // Initialisation de la première question
    displayQuestion(index);
});`}
                    </DownloadCodeButton>
                    <DownloadCodeButton language="js" filename={"question.js"}>
                        {`// utiliser dans un autre fichier
const quiz = [
    {
        question: "En JavaScript, quelle est la valeur retournée par l'expression suivante ? typeof NaN;",
        options: [
            '"undefined"',
            '"number"',
            '"NaN"',
            '"object"',
        ],
        correctAnswer: 1,
        explanation: "Bien que NaN signifie 'Not a Number', JavaScript considère que son type est 'number'. Dingue, non ? 💀",
    },
    {
        question: "Que va afficher ce code ? console.log(NaN === NaN);",
        options: [
            "true",
            "false",
            "undefined",
            "Une erreur",
        ],
        correctAnswer: 1,
        explanation: "En JavaScript, NaN est une valeur spéciale qui représente un nombre invalide, et c'est l'une des rares valeurs qui n'est pas égale à elle-même. Donc NaN === NaN retourne false. C'est une incohérence étrange mais c'est un comportement défini dans la spécification du langage. 🤯",
    },
    {
        question: "Quelle est la sortie de ce code ? console.log(typeof null);",
        options: [
            '"null"',
            '"object"',
            '"undefined"',
            "Une erreur",
        ],
        correctAnswer: 1,
        explanation: "typeof null retourne 'object' en raison d'un bug historique dans JavaScript datant des années 90. Et ils ne l'ont jamais corrigé... parce que. 🤷‍♂️",
    },
    {
        question: "Que retourne l'expression suivante ? null == undefined;",
        options: [
            "true",
            "false",
            "Une erreur",
            "null",
        ],
        correctAnswer: 0,
        explanation: "null et undefined sont considérés comme égaux en comparaison abstraite (==), mais pas en comparaison stricte (===). JavaScript est un peu trop tolérant parfois... 😅",
    },
    {
        question: "Quelle est la sortie de ce code ? console.log(0.1 + 0.2 === 0.3);",
        options: [
            "true",
            "false",
            "undefined",
            "Une erreur",
        ],
        correctAnswer: 1,
        explanation: "La somme de 0.1 et 0.2 en JavaScript donne un résultat légèrement supérieur à 0.3 à cause des erreurs d'arrondi en virgule flottante. Ce n'est pas un bug, c'est une fonctionnalité. 😏",
    },
    {
        question: "Que va afficher ce code ? console.log([] == ![]);",
        options: [
            "true",
            "false",
            "undefined",
            "Une erreur",
        ],
        correctAnswer: 0,
        explanation: "C'est un piège classique ! L'expression [] == ![] se résout ainsi : ![] est false, et lorsqu'un objet (le tableau vide []) est comparé à un type primitif (false), le tableau est converti en chaîne de caractères (\\"\\"), et donc \\"\\" == false renvoie true. Si vous comprenez ce processus de coercition de type, vous aurez compris cette particularité du langage. 🧩",
    },
    {
        question: "Que va afficher ce code ? for (var i = 0; i < 3; i++) { setTimeout(() => { console.log(i); }, 100); }",
        options: [
            "0 1 2",
            "3 3 3",
            "undefined undefined undefined",
            "Une erreur",
        ],
        correctAnswer: 1,
        explanation: "Avec var, la variable i a une portée fonctionnelle. Les callbacks de setTimeout s'exécutent après la fin de la boucle, quand i vaut déjà 3. Résultat : trois fois le chiffre 3. Avec let, chaque itération aurait sa propre copie de i. ⏳",
    },
    {
        question: "Que va afficher ce code ? console.log('5' - 3);",
        options: [
            '"53"',
            '"5-3"',
            "2",
            "Une erreur",
        ],
        correctAnswer: 2,
        explanation: "Contrairement à l'opérateur +, l'opérateur - n'a pas de surcharge pour les chaînes. JavaScript convertit donc '5' en nombre, et 5 - 3 = 2. Mais '5' + 3 donnerait '53' ! 🤔",
    },
    {
        question: "Que retourne cette expression ? [1, 2, 3] + [4, 5, 6];",
        options: [
            "[1, 2, 3, 4, 5, 6]",
            '"1,2,34,5,6"',
            '[[1,2,3],[4,5,6]]',
            "Une erreur",
        ],
        correctAnswer: 1,
        explanation: "L'opérateur + convertit les deux tableaux en chaînes ('1,2,3' et '4,5,6') avant de les concaténer. Résultat : '1,2,34,5,6'. Magique, non ? 🪄",
    },
    {
        question: "Que retourne cette expression ? console.log(3 > 2 > 1);",
        options: [
            "true",
            "false",
            "undefined",
            "Une erreur",
        ],
        correctAnswer: 1,
        explanation: "Piège ! 3 > 2 retourne true, puis true > 1 devient 1 > 1 (true converti en 1), ce qui donne false. Les comparaisons chaînées ne fonctionnent pas comme en mathématiques ! ⛓️",
    },
    {
        question: "Que va afficher ce code ? console.log([10, 1, 3].sort());",
        options: [
            "[1, 3, 10]",
            "[10, 1, 3]",
            "[1, 10, 3]",
            "Une erreur",
        ],
        correctAnswer: 2,
        explanation: "Par défaut, sort() convertit les éléments en chaînes et les trie par ordre lexicographique (alphabétique). Donc '10' vient avant '3' ! Pour trier numériquement, utilisez .sort((a, b) => a - b). 🔤",
    },
    {
        question: "Que retourne cette expression ? console.log(!!'false' == !!'true');",
        options: [
            "true",
            "false",
            "undefined",
            "Une erreur",
        ],
        correctAnswer: 0,
        explanation: "Les deux chaînes 'false' et 'true' sont des valeurs truthy (non vides). Le double ! les convertit toutes les deux en true, donc true == true retourne true. Les chaînes ne sont pas des booléens ! 🎪",
    },
    {
        question: "Que retourne cette expression ? console.log(Math.max());",
        options: [
            "0",
            "undefined",
            "-Infinity",
            "Infinity",
        ],
        correctAnswer: 2,
        explanation: "Sans arguments, Math.max() retourne -Infinity (la plus petite valeur possible). De même, Math.min() sans arguments retourne Infinity. C'est contre-intuitif mais logique mathématiquement ! ♾️",
    }
];`}
                    </DownloadCodeButton>
                </HStack>

                <Heading level={3}>1. Gestion des questions</Heading>
                <List ordered>
                    <ListItem>
                        <Text>Dans le fichier <Code>game.js</Code>, créez les variables suivantes :</Text>
                        <List>
                            <ListItem><Code>let index = 0;</Code></ListItem>
                            <ListItem>
                                <Code>const btns</Code> contenant les éléments ayant la classe{" "}
                                <Code>answer</Code>.
                            </ListItem>
                            <ListItem>
                                <Code>const moneys</Code> contenant les éléments ayant la classe{" "}
                                <Code>money-item</Code>.
                            </ListItem>
                            <ListItem>
                                <Code>const questionElm</Code> contenant l&apos;élément ayant l&apos;id{" "}
                                <Code>question</Code>.
                            </ListItem>
                            <ListItem>
                                <Code>const explanationElm</Code> contenant l&apos;élément ayant l&apos;id{" "}
                                <Code>explanation</Code>.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Créez une fonction <Code>displayQuestion(index)</Code> modifiant le texte de
                        l&apos;élément <Code>#question</Code> en se basant sur le tableau{" "}
                        <Code>quiz[index].question</Code>. Appelez-la après le chargement du DOM.
                    </ListItem>

                    <ListItem>
                        Créez une fonction <Code>updateAnswers(question)</Code> mettant à jour le texte des
                        éléments <Code>.answer</Code> en se basant sur <Code>quiz.options</Code>. Appelez-la
                        depuis <Code>displayQuestion</Code>.
                    </ListItem>

                    <ListItem>
                        Ajoutez un événement <Code>click</Code> sur les <Code>.answer</Code> qui appelle la
                        fonction <Code>validateAnswer</Code>. Si la réponse est correcte
                        (<Code>data-index</Code> égal à <Code>quiz[index].correctAnswer</Code>), ajoutez la
                        classe <Code>correct</Code> ; sinon ajoutez la classe <Code>incorrect</Code>.
                    </ListItem>

                    <ListItem>
                        Modifiez l&apos;événement pour gérer la variable <Code>index</Code> : incrémentez-la
                        si la réponse est correcte, sinon remettez-la à 0. Rappelez ensuite{" "}
                        <Code>displayQuestion</Code> et créez une fonction <Code>resetDisplayQuestion</Code>
                        pour réafficher les réponses sans les classes <Code>.correct</Code> ou{" "}
                        <Code>.incorrect</Code>.
                    </ListItem>

                    <ListItem>
                        Modifiez l&apos;événement pour mettre à jour le texte de l&apos;élément{" "}
                        <Code>#explanation</Code> avec <Code>quiz[index].explanation</Code>.
                    </ListItem>

                    <ListItem>
                        Afin d&apos;améliorer l&apos;UX, utilisez <Code>setTimeout()</Code> pour appeler la
                        fonction <Code>displayQuestion</Code> après 3 secondes :
                        <CodeCard language="js">
                            {`// Affiche la prochaine question après un délai
setTimeout(() => {
  displayQuestion(index);
}, 3000);`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Modifiez la fonction <Code>resetDisplayQuestion</Code> pour remettre{" "}
                        <Code>&quot;&quot;</Code> dans l&apos;élément <Code>#explanation</Code>.
                    </ListItem>
                </List>

                <Heading level={3}>2. Gestion des jokers</Heading>
                <List ordered>
                    <ListItem>
                        Modifiez la fonction <Code>fiftyFifty</Code> afin de désactiver
                        (<Code>disabled</Code>) deux mauvaises réponses.
                    </ListItem>
                    <ListItem>
                        Modifiez les fonctions <Code>showAskAudience</Code>, <Code>showCallFriend</Code> et{" "}
                        <Code>fiftyFifty</Code> afin de ne permettre de les utiliser qu&apos;une seule fois
                        (ouverture de la modal et action sur les boutons).
                    </ListItem>
                </List>

                <Heading level={3}>3. Gestion des scores</Heading>
                <List ordered>
                    <ListItem>
                        En utilisant la classe <Code>active</Code>, modifiez l&apos;item de la liste{" "}
                        <Code>.money-item</Code> afin d&apos;indiquer au joueur à quel montant il est arrivé.
                    </ListItem>
                </List>
            </section>

        </article>
    );
}
