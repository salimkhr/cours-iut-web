import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import Link from "next/link";
import {List, ListItem} from "@/components/ui/List";
import {Text} from "@/components/ui/Text";
import {AlertCircleIcon, Award, Calculator, Clock} from "lucide-react";
import DiagramCard from "@/components/Cards/DiagramCard";

export default function Examen() {
    const chart = `classDiagram

class Card {
    +id: ?INT
    +text: STRING
    +theme: ?Theme
    +type: STRING
    +responseCount: INT
    +status: BOOL
    +getId(): ?INT
    +getText(): STRING
    +getTheme(): ?Theme
    +getType(): STRING
    +getResponseCount(): INT
    +getStatus(): BOOL
}

class Theme {
    +id: ?INT
    +name: STRING
    +getId(): ?INT
    +getName(): STRING
}

Theme "1" <-- "*" Card
`;

    const sections = [
        { title: "A - Création des Cartes", points: 8, time: "1h" },
        { title: "B - Sauvegarde en Base de Données", points: 8, time: "1h" },
        { title: "C - Gestion de la Partie", points: 4, time: "0h30" },
    ];

    return (
        <article className="space-y-8">
            {/* Entête */}
            <section>
                <Heading level={2}>Département Informatique - BUT Info 2 - 2023/2024</Heading>
                <Heading level={4}>Applications Web - Khraimeche Salim</Heading>
            </section>

            {/* Rendu de l'examen */}
            <section>
                <Alert className="mt-4">
                    <AlertCircleIcon />
                    <AlertTitle>Rendu de l&apos;examen</AlertTitle>
                    <AlertDescription>
                        <Text>
                            À la fin du contrôle, vous devrez déposer l’ensemble de vos fichiers dans une archive ZIP
                            nommée <Code>Exam_prenom_nom.zip</Code>, puis la soumettre sur{" "}
                            <Link
                                href="https://eureka.univ-lehavre.fr/mod/assign/view.php?id=132709"
                                target="_blank"
                                className="text-red-700 hover:underline"
                            >
                                Eureka
                            </Link>.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            {/* Barème */}
            <section>
                <Heading level={2}>Barème :</Heading>

                <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 mt-6">
                    {/* Liste des sections */}
                    <ul className="flex-1 space-y-3">
                        {sections.map((item, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-3">
                                    <Award className="text-yellow-500" size={22} />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{item.title}</span>
                                        <span className="text-sm">{item.points} points</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock size={18} className="text-blue-500" />
                                    <span>Temps estimé : {item.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Bloc de notation */}
                    <div className="md:w-1/3">
                        <Alert className="h-full flex flex-col justify-center mt-0 md:mt-0">
                            <div className="flex items-center mb-2">
                                <Calculator className="mr-2" />
                                <AlertTitle className="font-semibold">Notation</AlertTitle>
                            </div>
                            <AlertDescription className="leading-relaxed space-y-2">
                                <Text>
                                    La notation portera principalement sur la <strong>qualité du code</strong> et le
                                    <strong> respect des bonnes pratiques</strong> abordées durant le cours.
                                </Text>

                                <Text>
                                    Vous devrez respecter la <strong>structure MVC</strong> présentée en cours.
                                    L’implémentation d’un <strong>service</strong> est <em>optionnelle</em>, mais sa bonne utilisation sera <strong>valorisée</strong>.
                                </Text>

                                <Text className="font-medium">
                                    Le <strong>CSS</strong> et l’aspect visuel de l’interface ne seront pas pris en compte dans la note finale.
                                </Text>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </section>

            {/* Résumé */}
            <section>
                <Heading level={2}>Résumé du sujet :</Heading>
                <Text className="mt-2">
                    L’objectif de cet exercice est de créer un jeu inspiré de &quot;Limite Limite&quot; en utilisant un système de gestion de cartes et de parties.
                    Le projet comporte trois grandes parties :
                </Text>
                <List className="list-decimal list-inside ml-6 mt-2 space-y-1">
                    <ListItem>
                        <strong>Création des cartes :</strong> formulaire permettant de saisir le texte, le type, le nombre de réponses et le thème d’une carte, avec validation côté client et serveur.
                    </ListItem>
                    <ListItem>
                        <strong>Sauvegarde en base de données :</strong> affichage et enregistrement des cartes créées en respectant la structure des classes <Code>Card</Code> et <Code>Theme</Code>.
                    </ListItem>
                    <ListItem>
                        <strong>Gestion de la partie :</strong> initialisation et suivi d’une partie avec plusieurs joueurs, stockage des cartes et des joueurs en session, et test via les pages locales.
                    </ListItem>
                </List>
            </section>

            {/* Initialisation */}
            <section>
                <Heading level={2}>Initialisation du projet :</Heading>
                <Text>
                    Téléchargez le projet{" "}
                    <Link
                        href="/download/php/exam_prenom_nom.zip"
                        download
                        className="font-medium"
                    >
                        <span>exam_prenom_nom.zip</span>
                    </Link>{" "}
                    et décompressez-le dans un dossier situé en dehors de <Code>public_html</Code>.
                    Ensuite, lancez le serveur en exécutant le script <Code>start.sh</Code>.
                </Text>
            </section>

            {/* Partie A */}
            <section>
                <Heading level={2}>A- Création des Cartes</Heading>

                <Text className="mt-2">
                    Dans cette partie, vous devez créer un formulaire pour permettre aux utilisateurs de saisir de nouvelles cartes pour le jeu &quot;Limite Limite&quot;.
                    Le formulaire doit permettre de renseigner toutes les informations nécessaires pour chaque carte et assurer la cohérence des données.
                </Text>

                <Text className="mt-2">
                    Chaque carte doit contenir les champs suivants, <strong>tous obligatoires</strong> :
                </Text>

                <List ordered className="ml-6 mt-2 space-y-2">
                    <ListItem>
                        <strong>Texte de la carte :</strong>
                        <List className="list-disc ml-4 space-y-1">
                            <ListItem>Champ de saisie libre.</ListItem>
                            <ListItem>Limite : 200 caractères maximum.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Type de carte :</strong>
                        <List className="list-disc ml-4 space-y-1">
                            <ListItem>Boutons radio avec deux options : &quot;question&quot; ou &quot;réponse&quot;.</ListItem>
                            <ListItem>Seules ces valeurs sont considérées comme valides côté PHP.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Nombre de réponses :</strong>
                        <List className="list-disc ml-4 space-y-1">
                            <ListItem>Champ numérique.</ListItem>
                            <ListItem>En HTML : valeur ≥ 0.</ListItem>
                            <ListItem>En PHP :
                                <List className="list-disc ml-4 space-y-1">
                                    <ListItem>Si type = &quot;question&quot;, la valeur doit être strictement supérieure à 0.</ListItem>
                                    <ListItem>Si type = &quot;réponse&quot;, la valeur doit être égale à 0.</ListItem>
                                </List>
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Thème :</strong>
                        <List className="list-disc ml-4 space-y-1">
                            <ListItem>Liste déroulante : &quot;Humour&quot;, &quot;Humour noir&quot;, &quot;Humour très noir&quot;.</ListItem>
                            <ListItem>Pas de vérification PHP à cette étape (sera traitée dans la partie B).</ListItem>
                        </List>
                    </ListItem>
                </List>

                <Text className="mt-2">
                    Lorsqu’un utilisateur soumet le formulaire :
                </Text>

                <List className="list-disc list-inside ml-6 space-y-1">
                    <ListItem>Vérifiez que tous les champs sont remplis et respectent les contraintes.</ListItem>
                    <ListItem>Si le formulaire est valide, créez un objet <Code>Card</Code> correspondant aux données saisies et redirigez vers <Code>index.php</Code>.</ListItem>
                    <ListItem>Si le formulaire contient des erreurs, réaffichez-le avec les valeurs saisies et les messages d’erreur associés pour chaque champ incorrect.</ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B- Sauvegarde en Base de Données</Heading>
                <DiagramCard chart={chart} header={"Diagramme de classes"}/>

                <Text className="mt-2">
                    Après avoir configuré la base de données en modifiant le fichier <Code>config/config.php</Code>
                    et exécuté le script <Code>db/init.sql</Code>, vous devez implémenter la logique permettant :
                </Text>

                <List className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <ListItem>d’afficher la liste des cartes existantes,</ListItem>
                    <ListItem>d’enregistrer les nouvelles cartes créées via le formulaire de la partie A dans la base de données.</ListItem>
                </List>

                <Text className="mt-2">
                    Dans le dossier <Code>app/entites</Code>, complétez la classe <Code>Card.php</Code> avec les propriétés suivantes :
                </Text>

                <List className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <ListItem><Code>id</Code> (int) : identifiant unique de la carte.</ListItem>
                    <ListItem><Code>text</Code> (string) : contenu textuel de la carte, limité à 200 caractères.</ListItem>
                    <ListItem><Code>theme</Code> (<Code>Theme</Code>) : thème associé à la carte, représenté par un objet <Code>Theme</Code>.</ListItem>
                    <ListItem><Code>type</Code> (string) : type de la carte, limité aux valeurs &quot;Question&quot; ou &quot;Réponse&quot;.</ListItem>
                    <ListItem><Code>responseCount</Code> (int) : nombre de réponses associées à la carte.</ListItem>
                </List>

                <Heading level={3} className="mt-4">Options dynamiques pour les thèmes :</Heading>
                <Text className="mt-2">
                    Après avoir complété la méthode <Code>ThemeRepository#findAll()</Code>, utilisez-la pour afficher dynamiquement les thèmes dans la liste déroulante du formulaire.
                </Text>

                <Heading level={3} className="mt-4">Validation du formulaire :</Heading>
                <Text className="mt-2">
                    Lorsqu’un utilisateur soumet le formulaire :
                </Text>

                <List className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <ListItem>Si toutes les données sont valides, insérez la nouvelle <Code>Card</Code> dans la base de données et redirigez vers <Code>index.php</Code>.</ListItem>
                    <ListItem>En cas d’erreur, réaffichez le formulaire avec les valeurs saisies et les messages d’erreur correspondants pour permettre à l’utilisateur de corriger sa saisie.</ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>C- Gestion de la Partie</Heading>

                <Text className="mt-2">
                    Dans cette dernière partie, vous devez implémenter la gestion d’une partie du jeu.
                    Chaque partie comprendra plusieurs étapes principales :
                </Text>

                <List className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <ListItem>Initialisation de la partie avec quatre joueurs et trois cartes attribuées à chaque joueur.</ListItem>
                    <ListItem>Gestion des cartes noires et des cartes des joueurs en utilisant des sessions PHP.</ListItem>
                    <ListItem>Mise à jour des informations de la partie, comme l’état des joueurs et le suivi des cartes jouées.</ListItem>
                </List>

                <Text className="mt-2">
                    Après avoir réinitialisé la table <Code>card</Code> avec les données de la partie, vous devez :
                </Text>

                <List className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <ListItem>Modifier la méthode <Code>GameService#init()</Code> et <Code>GameService#finish()</Code> pour stocker dans la clé <Code>&quot;card&quot;</Code> le contenu de la carte noire : <Code>$questionCards-&gt;getText();</Code></ListItem>
                    <ListItem>Modifier la méthode <Code>GameService#maJplayers()</Code> pour stocker dans la clé <Code>&quot;players&quot;</Code> un tableau contenant les instances de <Code>User</Code> créées.</ListItem>
                </List>

                <Text className="mt-2">
                    Vous pourrez tester ces étapes via la page :{" "}
                    <Link href="http://localhost:8000/init.php" className="text-teal-600 hover:underline" target="_blank">
                        localhost:8000/init.php
                    </Link>
                </Text>

                <Text className="mt-2">
                    Ensuite, modifiez la méthode <Code>GameService#players()</Code> pour récupérer les <Code>User</Code> stockés en session sous la clé <Code>&quot;players&quot;</Code>.
                </Text>

                <Text className="mt-2">
                    Les tests peuvent être réalisés via les pages :
                </Text>

                <List className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <ListItem>
                        <Link href="http://localhost:8000/players.php" className="text-teal-600 hover:underline" target="_blank">
                            localhost:8000/players.php
                        </Link> – cette route sera appelée en API pour récupérer les joueurs.
                    </ListItem>
                    <ListItem>
                        <Link href="http://localhost:8000/cards.php" className="text-teal-600 hover:underline" target="_blank">
                            localhost:8000/cards.php
                        </Link> – cette route sera appelée en API pour récupérer les cartes.
                    </ListItem>
                </List>

                <Alert className="mt-4">
                    <AlertTitle>⚠️ Attention</AlertTitle>
                    <AlertDescription>
                        <Text>Si le navigateur affiche : <Code>Firefox a détecté que le serveur redirige la demande pour cette adresse d’une manière qui n’aboutira pas.</Code>,
                        cela signifie que <Code>$_SESSION[&apos;players&apos;]</Code> est mal géré. Utilisez <Code>session_destroy()</Code> pour réinitialiser les sessions.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>


            <Text className="mt-6 text-lg font-semibold text-center">Bonne chance !</Text>
        </article>
    );
}
