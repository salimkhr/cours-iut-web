import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text"
import CodeCard from "@/components/Cards/CodeCard";

const teams = [
    {
        "team": "Netflix",
        "members": [
            { "number": 14, "name": "Squeezie" },
            { "number": 10, "name": "Amine" }
        ]
    },
    {
        "team": "LEGO Racing Team",
        "members": [
            { "number": 15, "name": "Djilsi" },
            { "number": 97, "name": "Maxime Biaggi" }
        ]
    },
    {
        "team": "Sol de Janeiro",
        "members": [
            { "number": 31, "name": "Maghla" },
            { "number": 48, "name": "Lea Elui" }
        ]
    },
    {
        "team": "Andros Be Nuts !",
        "members": [
            { "number": 23, "name": "Théodort" },
            { "number": 56, "name": "Mastu" }
        ]
    },
    {
        "team": "Subway",
        "members": [
            { "number": 38, "name": "MisterV" },
            { "number": 92, "name": "PLK" }
        ]
    },
    {
        "team": "Lofi Girl M8",
        "members": [
            { "number": 7, "name": "Gotaga" },
            { "number": 4, "name": "Nikof" }
        ]
    },
    {
        "team": "Samsung",
        "members": [
            { "number": 19, "name": "SCH" },
            { "number": 99, "name": "Billy" }
        ]
    },
    {
        "team": "Erborian",
        "members": [
            { "number": 28, "name": "Baghera" },
            { "number": 2, "name": "Cocottee" }
        ]
    },
    {
        "team": "Alpine",
        "members": [
            { "number": 16, "name": "Ana" },
            { "number": 27, "name": "Kaatsup" }
        ]
    },
    {
        "team": "CUPRA",
        "members": [
            { "number": 17, "name": "Ander" },
            { "number": 21, "name": "Karchez" }
        ]
    },
    {
        "team": "The Crew Motorfest",
        "members": [
            { "number": 42, "name": "Ludwig" },
            { "number": 51, "name": "Michael Reeves" }
        ]
    },
    {
        "team": "Durex",
        "members": [
            { "number": 77, "name": "Houdi" },
            { "number": 3, "name": "Anyme" }
        ]
    }
]

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2}>A- Tableau indexé</Heading>
                <List ordered>
                    <ListItem>
                        Dans un fichier <Code>1_pilote.php</Code>, crée un tableau <Code>$pilots</Code> contenant tous les pilotes du GP Explorer :
                        {teams.flatMap(t => t.members.flatMap(m => m.name)).join(', ')}
                    </ListItem>

                    <ListItem>
                        Avec une boucle foreach, affiche tous les pilotes dans une liste {`<ul> / <li>`} :
                        <List>
                            <ListItem>Squeezie </ListItem>
                            <ListItem>Amine </ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Avec une boucle for, affiche tous les pilotes dans une liste {`<ul> / <li>`} :
                        <List>
                            <ListItem>Pilote 0 : Squeezie </ListItem>
                            <ListItem>Pilote 1 : Amine </ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Affiche le nombre total de pilotes.
                    </ListItem>
                    <ListItem>
                        Ajoute à la fin du tableau un nouveau pilote : &quot;Sylvain Lyve&quot;
                    </ListItem>
                    <ListItem>
                        Affiche le premier pilote du tableau.
                    </ListItem>
                    <ListItem>
                        Affiche le dernier pilote du tableau.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B- Tableau associatif</Heading>
                <List ordered>
                    <ListItem>
                        Dans un fichier <Code>2_equipe.php</Code>, crée un tableau <Code>$teams</Code> contenant les équipes du GP Explorer :
                        ({teams.flatMap(t => t.members.flatMap(m => `${m.name} : ${t.team}`)).join('), (')})
                    </ListItem>

                    <ListItem>
                        Avec une boucle foreach, affiche tous les pilotes dans une liste {`<ul> / <li>`} :
                        <List>
                            <ListItem>Squeezie roule pour Netflix </ListItem>
                            <ListItem>Amine roule pour Netflix</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Affiche uniquement l’équipe de Anyme.
                    </ListItem>
                    <ListItem>
                        Ajoute à la fin du tableau un nouveau pilote : &quot;Sylvain Lyve&quot; roulant pour &quot;Chatenet&quot;
                    </ListItem>
                    <ListItem>
                        &quot;Billy&quot; quitte &quot;Samsung&quot; pour rejoindre &quot;Apple&quot;
                    </ListItem>
                    <ListItem>
                        &quot;Anyme&quot;, n’ayant pas son permis, se retire de la compétition. Supprime-le du tableau.
                    </ListItem>
                    <ListItem>
                        Affiche uniquement la liste des pilotes <Code>(array_keys)</Code>.
                    </ListItem>
                    <ListItem>
                        Affiche uniquement la liste des équipes <Code>(array_values)</Code>.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>C- Tableau à plusieurs dimensions</Heading>
                <List ordered>
                    <ListItem>
                        Dans un fichier <Code>3_teams_multidim.php</Code>, crée un tableau <Code>$teams</Code> contenant toutes les équipes et leurs membres. Chaque équipe doit être un tableau associatif avec :
                        <List>
                            <ListItem>Le nom de l&apos;equipe comme clé</ListItem>
                            <ListItem>Un tableau contenant des tableaux pour chaque pilote avec <Code>number</Code> et <Code>name</Code></ListItem>
                        </List>
                        Exemple :
                        <CodeCard language="php">
                            {`<?php
    [
        "Netflix" => [
            ["number" => 10, "name" => "Amine"],
            ["number" => 14, "name" => "Squeezie"]
        ]
    ];                          
?>`}
                        </CodeCard>
                        {teams.flatMap(t => `${t.team} => [${t.members.flatMap(m => `[number => ${m.number}, name => ${m.name}]`)}]`).join(', ')}
                    </ListItem>

                    <ListItem>
                        Affiche tous les pilotes et leur numéro pour chaque équipe :
                        <List>
                            <ListItem>Netflix :
                                <List>
                                    <ListItem>10 - Amine</ListItem>
                                    <ListItem>14 - Squeezie</ListItem>
                                </List>
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        Affiche tous les pilotes de l&apos;equipe &quot;LEGO Racing Team&quot;.
                    </ListItem>

                    <ListItem>
                        Ajoute un nouveau pilote :
                        <List>
                            <ListItem>Nom : &quot;Sylvain Lyve&quot;</ListItem>
                            <ListItem>Numéro : 99</ListItem>
                        </List>
                        a l&apos;equipe &quot;Netflix&quot;
                    </ListItem>

                    <ListItem>
                        Supprime le pilote &quot;Houdi&quot; de l&apos;equipe &quot;Durex&quot;.
                    </ListItem>

                    <ListItem>
                        Calcule le **nombre total de pilotes** toutes équipes confondues.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>D- Les fonctions sans paramètre</Heading>
                <List ordered>
                    <ListItem>
                        Écris une fonction <Code>startRace()</Code> qui initialise la course en ajoutant,
                        pour chaque pilote, une clé <Code>laps</Code> contenant un tableau vide.
                    </ListItem>
                    <ListItem>
                        Écris une fonction <Code>ExtractDriverName()</Code> qui retourne un tableau
                        contenant uniquement les noms de tous les pilotes, indépendamment de leur équipe.
                    </ListItem>
                    <ListItem>
                        Écris une fonction <Code>showAllDrivers()</Code> qui parcourt toutes les équipes
                        et affiche, dans un tableau, le nom de chaque pilote ainsi que son nombre de tours effectués et le temps total.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>E- Les fonctions avec paramètre</Heading>
                <List>
                    <ListItem>
                        Écris une fonction <Code>driverExist(string $driverName): bool</Code>
                        qui renvoie <Code>true</Code> si le pilote existe et <Code>false</Code> sinon.  Exemple d’utilisation :
                        <CodeCard language="php">
                            {`echo driverExist('Djilsi') ? 'Yes' : 'No';`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                    Écris une fonction <Code>recordLap(string $driverName, float $lapTime)</Code>
                    qui ajoute un nouveau temps <Code>$lapTime</Code> dans le tableau <Code>laps</Code>
                    du pilote concerné. Exemple d’utilisation : <CodeCard language="php">
                        {`recordLap('Djilsi',2.54);`}
                    </CodeCard>
                        en utilisant <Code>driverExist</Code>, généré une Exception si le driver n&apos;existe pas
                    <CodeCard language="php">
                        {`throw new Exception("Pilote inexistant : $driverName");`}
                    </CodeCard>
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>F- Les fonctions avec paramètre par défaut</Heading>
                <Text>
                    Écris une fonction <Code>simulateRace($laps = 3)</Code> qui simule une course
                    en utilisant la liste des pilotes générée par <Code>ExtractDriverName()</Code>.
                    Pour chaque tour, utilise <Code>recordLap()</Code> afin d’ajouter un temps aléatoire
                    à chaque pilote.</Text>
                <Text>
                    Utiliser la fonction showAllDrivers pour afficher le résultat de la course
                </Text>
            </section>

            <section>
                <Heading level={2}>G- Les générateurs (optionnel)</Heading>
                <List ordered>
                    <ListItem>
                        Crée une fonction générateur <Code>generateDrivers()</Code> qui utilise
                        <Code>yield</Code> pour renvoyer les pilotes un par un à partir du tableau des équipes.
                    </ListItem>
                    <ListItem>
                        Crée une fonction générateur <Code>generateLaps($laps = 5)</Code> qui simule
                        les temps d’un pilote sur plusieurs tours. Chaque appel à <Code>yield</Code> renvoie
                        un temps aléatoire pour un tour.
                    </ListItem>
                    <ListItem>
                        Crée une fonction <Code>simulateWithGenerator()</Code> qui utilise les deux générateurs
                        pour attribuer automatiquement des temps de course à chaque pilote.
                    </ListItem>
                    <ListItem>
                        Affiche le résultat de la course en parcourant les générateurs avec une boucle <Code>foreach</Code>.
                    </ListItem>
                </List>
            </section>
        </article>
    );
}
