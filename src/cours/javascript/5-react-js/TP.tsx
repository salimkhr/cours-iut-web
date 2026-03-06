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
                    Dans ce TP, vous serez amené à développer une application de quiz en utilisant React.
                    L&apos;objectif est
                    de créer une application interactive où les utilisateurs peuvent répondre à une série de questions
                    et voir leur score en temps réel. Pour ce faire, vous allez créer quatre composants React :</Text>
                <List ordered>
                    <ListItem>
                        <Code>App</Code> Component : Ce composant sera le point d&apos;entrée de votre
                        application. Il
                        sera responsable de charger les questions depuis une API et de les transmettre au composant
                        Questions.
                    </ListItem>

                    <ListItem>
                        <Code>Questions</Code> Component : Ce composant servira de conteneur pour afficher la
                        liste des questions. Il gérera la logique de navigation entre les questions et affichera le
                        score total.
                    </ListItem>

                    <ListItem>
                        <Code>Question</Code> Component : Chaque question sera représentée par ce composant. Il
                        affichera la question et ses options de réponse. Il sera responsable de gérer les réponses
                        sélectionnées par l&apos;utilisateur et d&apos;actualiser le score en fonction des réponses
                        correctes.
                    </ListItem>

                    <ListItem><Code>Answer</Code> Component : Ce composant représentera une option de réponse à une
                        question. Il sera responsable de capturer les sélections de l&apos;utilisateur et de les
                        transmettre au composant Question.</ListItem>

                </List>

                <Heading level={2}>Création du projet</Heading>
                <Heading level={3}>Le Back</Heading>
                <Text>Exécuter les commandes suivantes :</Text>
                <CodeCard language={'bash'}>
                    {`git clone https://www-apps.univ-lehavre.fr/forge/khraimes/exam-js-2-back.git
cd exam-js-2-back
php -S localhost:8000 -t public`}
                </CodeCard>
                <Text>Exécuter le script <Code>db/init.sql</Code> et modifier la connexion
                    dans <Code>src/Repository/Repository.php</Code> (dbname, login et password)</Text>
                <Heading level={3}>Le Front</Heading>
                <Text>Exécuter les commandes suivantes :</Text>
                <CodeCard language={'bash'}>
                    {`git clone https://www-apps.univ-lehavre.fr/forge/khraimes/react-js.git
cd react-js
npm install
npm start`}
                </CodeCard>
            </section>
                <section className="space-y-4">

                <Heading level={2}>Création des Composants :</Heading>
                <Text>Si la fonction handle... n&apos;existe pas, vous pouvez passer une fonction vide dans les props :
                    <Code>() =&gt; &#123;&#125;</Code>
                    Développez le composant App pour charger les questions dans un Composant Questions qui auras en
                    props les questions</Text>
                <CodeCard language={'jsx'}>
                    {` <div>
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
            <span className="navbar-brand">
                <i className="fas fa-question-circle"></i> Discover
            </span>
        </div>
    </nav>
    <div>
        <!-- Questions component will be rendered here -->
    </div>
</div>`}
                </CodeCard>

                Créez le composant Questions pour afficher la liste des questions. Ce composant devrait recevoir les
                questions en tant que props. Ajouter 2 useState (score, currentQuestion) pour gérer le score et
                l&apos;indice
                de la question en cours.

                Le composant retournera ce HTML :

                <CodeCard language={'html'}>
                    {`<div class="container mt-5">
    <!-- Question component will be rendered here -->
</div>`}
                </CodeCard>

                Implémentez le composant Question pour afficher une question avec ses options de réponse. ce composant
                aura comme props question, setCurrentQuestion, setScore, score et comme state :
                <Code>selectedAnswer</Code>, <Code>showNext</Code>, <Code>showValidate</Code>

                Le composant retournera ce HTML :

                <CodeCard language={'html'}>
                    {`<div>
    <h1 className="mb-5">%%question.text%%</h1>
    
    <ul className="list-group mb-5" id="answers">
        <!-- add an Answer component for each question.Answers -->
    </ul>
    <div className="btn-group">
        <button type="button" className="btn btn-success" <!-- 'Valider' button will be conditionally rendered here --></button>
        <button type="button" className="btn btn-primary" <!-- 'Question suivante' button will be conditionally rendered here --></button>
    </div>
</div>`}
                </CodeCard>
                <Text>Développez le composant Answer pour afficher une option de réponse à une question. Ce composant
                    aura comme props answer, selectedAnswer,showValidate
                    Le composant retournera ce HTML :</Text>

                <CodeCard language={'html'}>
                    {`<li class="list-group-item mt-5">
    <input class="form-check-input me-1" type="radio" name="listGroupRadio" />
    <label class="form-check-label"><!-- Answer text will be rendered here --></label>
</li>`}
                </CodeCard>
                Gestion des événements :
                Modifier le composant Answer pour y ajouter l&apos;appel a la fonction handleSelect lorsque
                l&apos;évènement
                onChange est déclanché. la fonction handleSelect aura comme code :

                <CodeCard language={'javascript'}>
                    {`const handleSelect = () => {
        handleChange(answer.correct);
};`}
                </CodeCard>

                <Text>handleChange sera une props de Answer. Ajouter au composant Question les 3 fonctions</Text>
                <CodeCard language={'javascript'}>
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
                <List>
                    <ListItem> Faire en sorte que le boutton &quot;Valider&quot; soit visible uniquement si
                        showValidate
                        est a true.</ListItem>
                    <ListItem> Faire en sorte que le boutton &quot;Question suivante&quot; soit visible uniquement si
                        showNext est a
                        true Modifier la fonction handleValidate pour qu&apos;elle mette à jour le score si la réponse
                        est
                        correcte (utiliser le state score, le state selectedAnswer est à true si la réponse est
                        correcte).</ListItem>
                </List>


                Editer le composant Questions pour y ajouter la fonction :

                <CodeCard language={'javascript'}>
                    {`const handleNextQuestion = () => {
    setCurrentQuestion(prevQuestion => prevQuestion + 1);
};`}
                </CodeCard>
            </section>

        </article>
    );
}
