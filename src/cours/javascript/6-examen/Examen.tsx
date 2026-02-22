import React from 'react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle} from 'lucide-react';
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";
import CodeCard from "@/components/Cards/CodeCard";
import Link from "next/link";

export default function Examen() {

    const sections = [
        {title: "A - Initialisation & Fetch", points: 8, time: "1h"},
        {title: "B - DOM & Events", points: 8, time: "1h"},
        {title: "C - Formulaire & POST", points: 4, time: "0h30"},
    ];

    return (
        <article>

            {/* Entête */}
            <section className="flex flex-col items-center justify-center py-16 space-y-4">
                <Heading level={2}>Département Informatique - BUT Info 2 - 2024/2025</Heading>
                <Heading level={3}>Examen DOM - Event - Fetch</Heading>
            </section>


            {/* Introduction */}
            <section>
                <Text>
                    L’objectif de cet examen est de créer une application de quiz. L’application devra récupérer les questions à partir d’une API fournie, permettre aux utilisateurs de répondre à ces questions et gérer leur score en fonction de leurs réponses. Bonne chance !
                </Text>

                <Alert className="mt-6 border-yellow-300 bg-yellow-50">
                    <AlertCircle className="h-5 w-5 text-yellow-600"/>
                    <AlertTitle className="text-yellow-900 font-semibold">Consignes</AlertTitle>
                    <AlertDescription className="text-yellow-800">
                        <Text>
                            L’utilisation d’Internet, du téléphone ou d’outils d’IA est interdite.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            {/* Barème */}
            <section>
                <Heading level={2}>Barème</Heading>
                <List>
                    {sections.map((item, index) => (
                        <ListItem key={index}>
                            <strong>{item.title}</strong> — {item.points} points — {item.time}
                        </ListItem>
                    ))}
                </List>
            </section>

            {/* Initialisation */}
            <section>
                <Heading level={2}>Initialisation du projet</Heading>

                <List>
                    <ListItem>
                        Clonez le projet frontend :
                        <Link href="https://www-apps.univ-lehavre.fr/forge/khraimes/exam-js-2-front" target="_blank">
                            exam-js-2-front
                        </Link>
                    </ListItem>
                    <ListItem>
                        Clonez le projet backend :
                        <Link href="https://www-apps.univ-lehavre.fr/forge/khraimes/exam-js-2-back" target="_blank">
                            exam-js-2-back
                        </Link>
                    </ListItem>
                </List>

                <Heading level={3}>Lancement du projet</Heading>
                <List>
                    <ListItem>Mettre le dossier frontend dans le dossier public_html</ListItem>
                    <ListItem>Mettre le dossier back hors du dossier public_html</ListItem>
                    <ListItem>Dans le dossier backend, exécuter <code> php -S localhost:8000 -t public </code></ListItem>
                    <ListItem>Modifier le fichier backend/src/Repository.php pour indiquer les bonnes informations de connexion</ListItem>
                    <ListItem>Exécuter le fichier backend/db/init.sql</ListItem>
                    <ListItem>
                        Tester l’API :
                        <Link href="http://localhost:8000/questions" target="_blank">
                            http://localhost:8000/questions
                        </Link>
                    </ListItem>
                </List>
            </section>

            {/* Partie A */}
            <section className="pt-6">
                <Heading level={2}>A - Initialisation & Fetch</Heading>

                <Text>
                    Écrivez une fonction principale <Code>startApp</Code> dans le fichier js/index.js qui sera appelée lors de l'événement load de la page : <Code><Link href="https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event#examples" target="_blank">MDN : Window/load_event</Link></Code>.
                </Text>

                <List>
                    <ListItem>Dans la fonction <Code>startApp</Code>, mettre 0 dans le score affiché sur le #score</ListItem>
                </List>

                <Heading level={3}>Utilisation de Fetch</Heading>

                <Text>L’API propose deux routes :</Text>

                <List>
                    <ListItem>http://localhost:8000/questions</ListItem>
                    <ListItem>http://localhost:8000/questions/fix</ListItem>
                </List>

                <Text>
                    La route <Code>/questions/fix</Code> renvoie toujours <strong>la même question</strong>,
                    pratique pour les tests.
                </Text>

                <Text>
                    La route <Code>/questions</Code> renvoie les questions dans un
                    <strong> ordre aléatoire</strong>.
                </Text>

                <Text className="mt-4">
                    Exemple de JSON retourné :
                </Text>

                <CodeCard language="json" filename="questions.json">
                    {`[
        {
            "id": 1,
            "text": "Qui a conçu le cône porté par Madonna lors de sa tournée Blond Ambition en 1990 ?",
            "answers": [
                {
                    "id": 1,
                    "text": "Jean-Paul Gaultier",
                    "correct": true
                },
                {
                    "id": 2,
                    "text": "Christian Lacroix",
                    "correct": false
                },
                {
                    "id": 3,
                    "text": "Versace",
                    "correct": false
                },
                {
                    "id": 4,
                    "text": "Karl Lagerfeld",
                    "correct": false
                }
            ]
        },
        {
            ...
        }
]`}
                </CodeCard>

                <Text>Créer une fonction <Code>fetchQuestions</Code> pour récupérer toutes les questions disponibles depuis l'API REST du backend. Elle sera appelée dans <Code>startApp</Code>.</Text>

                <Heading level={3}>Affichage des questions</Heading>
                <Text>Créer <Code>displayQuestion</Code> qui sera appelée dans la réponse du fetch pour :</Text>
                <List>
                    <ListItem>Mettre le texte de la question sur <Code>#question-text</Code></ListItem>
                    <ListItem>Mettre le numéro de la question en cours sur <Code>#question-number</Code></ListItem>
                    <ListItem>
                        Modifier le style de la div <Code>#progress</Code> de manière que le width soit ((number+1)*10)+'%' (number correspond au numéro de la question en cours)
                    </ListItem>
                    <ListItem>Ajouter à la liste <Code>#answers</Code> un radio button pour chaque réponse avec le HTML suivant :</ListItem>
                </List>

                <CodeCard language="html" filename="answer.html">
                    {`<li class="list-group-item mt-5">
  <input type="radio" name="answers">
  <label>Réponse</label>
</li>`}
                </CodeCard>
            </section>

            {/* Partie B */}
            <section className="pt-6">
                <Heading level={2}>B - DOM & Events</Heading>

                <Heading level={3}>Bouton #next</Heading>
                <Text>Ajouter à la fonction <Code>startApp</Code> un évènement sur le bouton <Code>#next</Code> faisant en sorte :</Text>
                <List>
                    <ListItem>Afficher la question suivante (fonction majApp)</ListItem>
                    <ListItem>Masquer <Code>#next</Code></ListItem>
                    <ListItem>Mettre en <Code>hidden=true</Code> le bouton <Code>#next</Code></ListItem>
                    <ListItem>Mettre en hidden=false le bouton <Code>#validate</Code></ListItem>
                </List>

                <Heading level={3}>Bouton #validate</Heading>
                <Text>Ajouter à la fonction <Code>startApp</Code> un évènement sur le bouton <em>#validate</em> faisant en sorte :</Text>
                <List>
                    <ListItem>Ajouter la classe <Code>.border-success</Code> si la bonne réponse est sélectionnée, <Code>.border-danger</Code> sinon.</ListItem>
                    <ListItem>Ajouter 1 au score affiché sur le #score si la réponse est bonne</ListItem>
                    <ListItem>Mettre en <Code>hidden=false</Code> le bouton <Code>#next</Code></ListItem>
                    <ListItem>Mettre en hidden=true le bouton <Code>#validate</Code></ListItem>
                </List>

                <Heading level={3}>Sélection réponse</Heading>
                <Text>Ajouter à l'évènement du bouton <em>#next</em>, le fait de mettre disabled le bouton <em>#validate</em>.</Text>
                <Text>Faire en sorte que le disabled passe à false lors de la sélection d’une réponse.</Text>
            </section>

            {/* Partie C */}
            <section className="pt-6">
                <Heading level={2}>C - Formulaire & POST</Heading>

                <Text>
                    L’API propose une route POST <Code>/questions</Code> permettant d’ajouter une question.
                </Text>

                <Text>Format attendu :</Text>

                <CodeCard language="json" filename="body.json">
                    {`{
  "text": "TEST",
  "answers": [
    {"text": "Réponse 1", "correct": true},
    {"text": "Réponse 2", "correct": false},
    {"text": "Réponse 3", "correct": false},
    {"text": "Réponse 4", "correct": false}
  ]
}`}
                </CodeCard>

                <List>
                    <ListItem>Utiliser le formulaire <Code>#formAdd</Code></ListItem>
                    <ListItem>Envoyer les données avec fetch (POST)</ListItem>
                    <ListItem>Ajouter l’événement dans <Code>startApp</Code></ListItem>
                </List>

                <Text className="mt-4">
                    Astuce : Pour éviter d’avoir à ouvrir la modal, vous pouvez décommenter la ligne 121 du fichier <Code>index.html</Code>.
                </Text>
            </section>

            <p className="mt-8 text-xl font-semibold text-center border-t pt-6">
                Bonne chance 🎓
            </p>

        </article>
    );
}