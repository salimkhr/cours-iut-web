import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";

export default function TP() {
    return (
        <article className="space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
                <Text>
                    Dans ce TP, vous allez développer une application de quiz en utilisant React.
                    L&apos;objectif est de créer une application interactive où les utilisateurs peuvent
                    répondre à une série de questions et voir leur score en temps réel. Pour cela, vous allez
                    créer quatre composants React :
                </Text>
                <List ordered>
                    <ListItem>
                        <Code>App</Code> : point d&apos;entrée de votre application. Il charge les questions
                        depuis l&apos;API et les transmet au composant <Code>Questions</Code>.
                    </ListItem>
                    <ListItem>
                        <Code>Questions</Code> : conteneur affichant la liste des questions. Il gère la
                        navigation entre les questions et affiche le score total.
                    </ListItem>
                    <ListItem>
                        <Code>Question</Code> : représente une question. Il affiche la question et ses
                        options de réponse, gère la réponse sélectionnée par l&apos;utilisateur et actualise
                        le score selon les bonnes réponses.
                    </ListItem>
                    <ListItem>
                        <Code>Answer</Code> : représente une option de réponse. Il capture la sélection de
                        l&apos;utilisateur et la transmet au composant <Code>Question</Code>.
                    </ListItem>
                </List>
            </section>

            <section className="space-y-4">
                <Heading level={2}>A- Création du projet</Heading>

                <Heading level={3}>1. Le back</Heading>
                <Text>Exécutez les commandes suivantes :</Text>
                <CodeCard language="bash">
                    {`git clone https://www-apps.univ-lehavre.fr/forge/khraimes/exam-js-2-back.git
cd exam-js-2-back
php -S localhost:8000 -t public`}
                </CodeCard>
                <Text>
                    Exécutez le script <Code>db/init.sql</Code> et modifiez la connexion dans{" "}
                    <Code>src/Repository/Repository.php</Code> (<Code>dbname</Code>, <Code>login</Code> et{" "}
                    <Code>password</Code>).
                </Text>

                <Heading level={3}>2. Le front</Heading>
                <Text>Exécutez les commandes suivantes :</Text>
                <CodeCard language="bash">
                    {`git clone https://www-apps.univ-lehavre.fr/forge/khraimes/react-js.git
cd react-js
npm install
npm start`}
                </CodeCard>
            </section>

            <section className="space-y-4">
                <Heading level={2}>B- Création des composants</Heading>
                <Text>
                    Si la fonction <Code>handle...</Code> n&apos;existe pas, vous pouvez passer une fonction
                    vide dans les props : <Code>{`() => {}`}</Code>.
                </Text>

                <Heading level={3}>1. Le composant App</Heading>
                <Text>
                    Développez le composant <Code>App</Code> pour charger les questions et les passer en
                    props au composant <Code>Questions</Code>.
                </Text>
                <CodeCard language="jsx">
                    {`<div>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
            <span className="navbar-brand">
                <i className="fas fa-question-circle"></i> Discover
            </span>
        </div>
    </nav>
    <div>
        {/* Questions component will be rendered here */}
    </div>
</div>`}
                </CodeCard>

                <Heading level={3}>2. Le composant Questions</Heading>
                <Text>
                    Créez le composant <Code>Questions</Code> pour afficher la liste des questions. Ce
                    composant doit recevoir les questions en props. Ajoutez deux <Code>useState</Code>{" "}
                    (<Code>score</Code>, <Code>currentQuestion</Code>) pour gérer le score et l&apos;indice
                    de la question en cours.
                </Text>
                <Text>Le composant retournera ce HTML :</Text>
                <CodeCard language="html">
                    {`<div class="container mt-5">
    <!-- Question component will be rendered here -->
</div>`}
                </CodeCard>

                <Heading level={3}>3. Le composant Question</Heading>
                <Text>
                    Implémentez le composant <Code>Question</Code> pour afficher une question avec ses
                    options de réponse. Ce composant aura comme props <Code>question</Code>,{" "}
                    <Code>setCurrentQuestion</Code>, <Code>setScore</Code>, <Code>score</Code>, et comme
                    state : <Code>selectedAnswer</Code>, <Code>showNext</Code>, <Code>showValidate</Code>.
                </Text>
                <Text>Le composant retournera ce HTML :</Text>
                <CodeCard language="html">
                    {`<div>
    <h1 className="mb-5">%%question.text%%</h1>

    <ul className="list-group mb-5" id="answers">
        <!-- add an Answer component for each question.Answers -->
    </ul>
    <div className="btn-group">
        <button type="button" className="btn btn-success"><!-- 'Valider' button will be conditionally rendered here --></button>
        <button type="button" className="btn btn-primary"><!-- 'Question suivante' button will be conditionally rendered here --></button>
    </div>
</div>`}
                </CodeCard>

                <Heading level={3}>4. Le composant Answer</Heading>
                <Text>
                    Développez le composant <Code>Answer</Code> pour afficher une option de réponse à une
                    question. Ce composant aura comme props <Code>answer</Code>, <Code>selectedAnswer</Code>{" "}
                    et <Code>showValidate</Code>.
                </Text>
                <Text>Le composant retournera ce HTML :</Text>
                <CodeCard language="html">
                    {`<li class="list-group-item mt-5">
    <input class="form-check-input me-1" type="radio" name="listGroupRadio" />
    <label class="form-check-label"><!-- Answer text will be rendered here --></label>
</li>`}
                </CodeCard>
            </section>

            <section className="space-y-4">
                <Heading level={2}>C- Gestion des événements</Heading>

                <List ordered>
                    <ListItem>
                        Modifiez le composant <Code>Answer</Code> pour y appeler la fonction{" "}
                        <Code>handleSelect</Code> lorsque l&apos;événement <Code>onChange</Code> est
                        déclenché. La fonction <Code>handleSelect</Code> aura comme code :
                        <CodeCard language="javascript">
                            {`const handleSelect = () => {
    handleChange(answer.correct);
};`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        <Code>handleChange</Code> sera une prop de <Code>Answer</Code>. Ajoutez au composant{" "}
                        <Code>Question</Code> les trois fonctions suivantes :
                        <CodeCard language="javascript">
                            {`const handleChange = (correct) => {
    setSelectedAnswer(correct);
    setShowValidate(true);
    console.log(correct);
};

const handleNext = () => {
    setSelectedAnswer(null);
    setShowNext(false);
    setShowValidate(true);
    setCurrentQuestion(prevQuestion => prevQuestion + 1);
};

const handleValidate = () => {
    if (selectedAnswer !== null) {
        setShowNext(true);
        setShowValidate(false);
    }
};`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Faites en sorte que le bouton <Code>&quot;Valider&quot;</Code> soit visible
                        uniquement si <Code>showValidate</Code> vaut <Code>true</Code>.
                    </ListItem>
                    <ListItem>
                        Faites en sorte que le bouton <Code>&quot;Question suivante&quot;</Code> soit visible
                        uniquement si <Code>showNext</Code> vaut <Code>true</Code>. Modifiez la fonction{" "}
                        <Code>handleValidate</Code> pour qu&apos;elle mette à jour le score si la réponse est
                        correcte (utilisez le state <Code>score</Code> ; <Code>selectedAnswer</Code> vaut{" "}
                        <Code>true</Code> si la réponse est correcte).
                    </ListItem>

                    <ListItem>
                        Éditez le composant <Code>Questions</Code> pour y ajouter la fonction :
                        <CodeCard language="javascript">
                            {`const handleNextQuestion = () => {
    setCurrentQuestion(prevQuestion => prevQuestion + 1);
};`}
                        </CodeCard>
                    </ListItem>
                </List>
            </section>
        </article>
    );
}
