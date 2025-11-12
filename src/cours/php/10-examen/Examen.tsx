import React from 'react';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Text} from '@/components/ui/Text';
import {AlertCircle, Award, Calculator, Clock} from 'lucide-react';
import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";
import DiagramCard from "@/components/Cards/DiagramCard";

export default function Examen() {
    const chart = `classDiagram

class Matiere {
    +id: ?INT
    +code: STRING
    +nom: STRING
    +heuresCours: INT
    +heuresTD: INT
    +heuresTP: INT
    +responsable: ?Responsable
    +semestre: INT
    +status: BOOL
    +getId(): ?INT
    +getCode(): STRING
    +getNom(): STRING
    +getHeuresCours(): INT
    +getHeuresTD(): INT
    +getHeuresTP(): INT
    +getResponsable(): ?Responsable
    +getSemestre(): INT
    +getStatus(): BOOL
}

class Responsable {
    +id: ?INT
    +nom: STRING
    +prenom: STRING
    +email: STRING
    +getId(): ?INT
    +getNom(): STRING
    +getPrenom(): STRING
    +getEmail(): STRING
}

Responsable "1" <-- "*" Matiere
`;

    const sections = [
        { title: "A - Création des Matières", points: 8, time: "1h" },
        { title: "B - Sauvegarde en Base de Données", points: 8, time: "1h" },
        { title: "C - Gestion des Brouillons", points: 4, time: "0h30" },
    ];

    return (
        <article>
            {/* Entête */}
            <section>
                <Heading level={2}>Département Informatique - BUT Info 2 - 2023/2024</Heading>
                <Heading level={4}>Applications Web - Khraimeche Salim</Heading>
            </section>

            {/* Rendu de l'examen */}
            <section>
                <Alert className="border-blue-300 bg-blue-50">
                    <AlertCircle className="text-blue-600" />
                    <AlertTitle className="text-blue-900">Rendu de l'examen</AlertTitle>
                    <AlertDescription>
                        <Text>
                            À la fin du contrôle, vous devrez déposer l'ensemble de vos fichiers dans une archive ZIP
                            nommée <code className="bg-gray-200 px-2 py-1 rounded text-sm">Exam_prenom_nom.zip</code>, puis la soumettre sur{" "}
                            <a
                                href="https://eureka.univ-lehavre.fr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-700 hover:underline font-medium"
                            >
                                Eureka
                            </a>.
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
                <List ordered>
                    <ListItem>
                        <strong>Création des matières :</strong> formulaire permettant de saisir le code, le nom, les volumes horaires, le semestre et le responsable d'une matière, avec validation côté client et serveur.
                    </ListItem>
                    <ListItem>
                        <strong>Sauvegarde en base de données :</strong> affichage et enregistrement des matières créées en respectant la structure des classes <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Matiere</code> et <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Responsable</code>.
                    </ListItem>
                    <ListItem>
                        <strong>Gestion des brouillons :</strong> sauvegarde temporaire des matières en session, permettant aux utilisateurs de travailler sur plusieurs matières avant de les enregistrer définitivement en base de données.
                    </ListItem>
                </List>
            </section>

            {/* Initialisation */}
            <section>
                <Heading level={2}>Initialisation du projet :</Heading>
                <Text>
                    Téléchargez le projet{" "}
                    <Link
                        href="#"
                        download
                        className="font-medium text-blue-600 hover:underline"
                    >
                        exam_prenom_nom.zip
                    </Link>{" "}
                    et décompressez-le dans un dossier situé en dehors de <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">public_html</code>.
                    Ensuite, lancez le serveur en exécutant le script <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">start.sh</code>.
                </Text>
            </section>

            {/* Partie A */}
            <section className="pt-6">
                <Heading level={2}>A - Création des Matières</Heading>

                <Text>
                    Dans cette partie, vous devez créer un formulaire pour permettre aux utilisateurs de saisir de nouvelles matières
                    pour le département. Le formulaire doit permettre de renseigner toutes les informations nécessaires pour chaque
                    matière et assurer la cohérence des données.
                </Text>

                <Text>
                    Chaque matière doit contenir les champs suivants, <strong>tous obligatoires</strong> :
                </Text>

                <List ordered>
                    <ListItem>
                        <strong>Code de la matière :</strong>
                        <List>
                            <ListItem>Champ de saisie libre.</ListItem>
                            <ListItem>Format attendu : 3 à 10 caractères alphanumériques (ex: "INFO101", "MATH2A").</ListItem>
                            <ListItem>Le code doit être unique (vérification en base lors de la partie B).</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Nom de la matière :</strong>
                        <List>
                            <ListItem>Champ de saisie libre.</ListItem>
                            <ListItem>Limite : 100 caractères maximum.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Volumes horaires :</strong>
                        <List>
                            <ListItem>Trois champs numériques distincts : Heures de Cours, Heures de TD, Heures de TP.</ListItem>
                            <ListItem>En HTML : valeur ≥ 0 pour chaque champ.</ListItem>
                            <ListItem>En PHP : au moins un des trois volumes doit être strictement supérieur à 0.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Semestre :</strong>
                        <List>
                            <ListItem>Boutons radio avec six options : S1, S2, S3, S4, S5, S6.</ListItem>
                            <ListItem>Seules ces valeurs (1 à 6) sont considérées comme valides côté PHP.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Responsable :</strong>
                        <List>
                            <ListItem>Liste déroulante contenant les noms complets des responsables disponibles.</ListItem>
                            <ListItem>Format d'affichage : "NOM Prénom" (ex: "DUPONT Jean").</ListItem>
                            <ListItem>Pas de vérification PHP à cette étape (sera traitée dans la partie B).</ListItem>
                        </List>
                    </ListItem>
                </List>

                <Text className="mt-3">
                    Lorsqu'un utilisateur soumet le formulaire :
                </Text>

                <List>
                    <ListItem>Vérifiez que tous les champs sont remplis et respectent les contraintes.</ListItem>
                    <ListItem>Si le formulaire est valide, créez un objet <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Matiere</code> correspondant aux données saisies et redirigez vers <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">index.php</code>.</ListItem>
                    <ListItem>Si le formulaire contient des erreurs, réaffichez-le avec les valeurs saisies et les messages d'erreur associés pour chaque champ incorrect.</ListItem>
                </List>
            </section>

            {/* Partie B */}
            <section className="pt-6">
                <Heading level={2}>B - Sauvegarde en Base de Données</Heading>
                    <DiagramCard chart={chart}/>
                <Text className="mt-4">
                    Après avoir configuré la base de données en modifiant le fichier <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">config/config.php</code> et exécuté le script <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">db/init.sql</code>, vous devez implémenter la logique permettant :
                </Text>

               <List>
                    <ListItem>d'afficher la liste des matières existantes avec leur responsable,</ListItem>
                    <ListItem>d'enregistrer les nouvelles matières créées via le formulaire de la partie A dans la base de données.</ListItem>
                </List>

                <Text>
                    Dans le dossier <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">app/entites</code>, complétez la classe <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Matiere.php</code> avec les propriétés suivantes :
                </Text>

               <List>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">id</code> (int) : identifiant unique de la matière.</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">code</code> (string) : code unique de la matière (3 à 10 caractères).</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">nom</code> (string) : nom complet de la matière, limité à 100 caractères.</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">heuresCours</code> (int) : nombre d'heures de cours magistral.</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">heuresTD</code> (int) : nombre d'heures de travaux dirigés.</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">heuresTP</code> (int) : nombre d'heures de travaux pratiques.</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">responsable</code> (Responsable) : responsable associé à la matière, représenté par un objet <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Responsable</code>.</ListItem>
                    <ListItem><code className="bg-gray-200 px-1 py-0.5 rounded text-sm">semestre</code> (int) : numéro du semestre (1 à 6).</ListItem>
                </List>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Options dynamiques pour les responsables :</h3>
                <Text>
                    Après avoir complété la méthode <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">ResponsableRepository#findAll()</code>, utilisez-la pour afficher dynamiquement les responsables dans la liste déroulante du formulaire.
                </Text>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">Validation du formulaire :</h3>
                <Text>
                    Lorsqu'un utilisateur soumet le formulaire :
                </Text>

                <List>
                    <ListItem>Vérifiez que le code de la matière n'existe pas déjà en base de données.</ListItem>
                    <ListItem>Si toutes les données sont valides, insérez la nouvelle <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Matiere</code> dans la base de données et redirigez vers <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">index.php</code>.</ListItem>
                    <ListItem>En cas d'erreur, réaffichez le formulaire avec les valeurs saisies et les messages d'erreur correspondants pour permettre à l'utilisateur de corriger sa saisie.</ListItem>
                </List>
            </section>

            {/* Partie C */}
            <section className="pt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">C - Gestion des Brouillons</h2>

                <Text>
                    Dans cette dernière partie, vous devez implémenter un système de brouillons permettant aux utilisateurs
                    de travailler sur plusieurs matières avant de les enregistrer définitivement en base de données.
                    Chaque brouillon sera stocké en session PHP.
                </Text>

                <Text>
                    Les fonctionnalités à implémenter sont :
                </Text>

                <List>
                    <ListItem>
                        <strong>Sauvegarde en brouillon :</strong> au lieu de valider directement le formulaire, l'utilisateur
                        peut choisir de sauvegarder la matière comme brouillon. Les données sont alors stockées dans
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm mx-1">$_SESSION['brouillons']</code> sous forme de tableau d'objets <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Matiere</code>.
                    </ListItem>
                    <ListItem>
                        <strong>Affichage des brouillons :</strong> créer une page <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">brouillons.php</code> qui
                        liste tous les brouillons en session avec leurs informations (code, nom, volumes horaires, semestre, responsable).
                    </ListItem>
                    <ListItem>
                        <strong>Validation des brouillons :</strong> depuis la liste des brouillons, l'utilisateur peut
                        valider un ou plusieurs brouillons pour les enregistrer définitivement en base de données.
                        Une fois validés, ils sont retirés de la session.
                    </ListItem>
                    <ListItem>
                        <strong>Suppression des brouillons :</strong> l'utilisateur peut supprimer un brouillon de la session
                        sans l'enregistrer en base.
                    </ListItem>
                </List>

                <Text>
                    Vous devez modifier ou créer les méthodes suivantes dans <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">MatiereService</code> :
                </Text>

                <List>
                    <ListItem>
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">saveDraft(Matiere $matiere)</code> : sauvegarde une matière
                        dans <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">$_SESSION['brouillons']</code>. Chaque brouillon doit avoir
                        un identifiant temporaire unique (par exemple, un timestamp ou un UUID).
                    </ListItem>
                    <ListItem>
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">getDrafts()</code> : récupère tous les brouillons
                        stockés en session et retourne un tableau d'objets <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">Matiere</code>.
                    </ListItem>
                    <ListItem>
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">validateDraft(string $draftId)</code> : enregistre un brouillon
                        en base de données via <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">MatiereRepository</code>, puis le supprime de la session.
                    </ListItem>
                    <ListItem>
                        <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">deleteDraft(string $draftId)</code> : supprime un brouillon
                        de la session sans l'enregistrer.
                    </ListItem>
                </List>

                <Text>
                    Vous pourrez tester ces fonctionnalités via les pages suivantes :
                </Text>

                <List>
                    <ListItem>
                        <a href="http://localhost:8000/form.php" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            localhost:8000/form.php
                        </a> – formulaire de création avec boutons "Enregistrer" et "Sauvegarder comme brouillon"
                    </ListItem>
                    <ListItem>
                        <a href="http://localhost:8000/brouillons.php" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            localhost:8000/brouillons.php
                        </a> – liste des brouillons avec actions de validation et suppression
                    </ListItem>
                </List>

                <Alert className="mt-6 border-yellow-300 bg-yellow-50">
                    <AlertCircle className="text-yellow-600" />
                    <AlertTitle className="text-yellow-900">⚠️ Attention</AlertTitle>
                    <AlertDescription className="text-gray-700">
                        <Text className="mb-2">
                            Si vous rencontrez des problèmes de redirection infinie, cela peut indiquer un problème
                            dans la gestion de <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">$_SESSION['brouillons']</code>.
                        </Text>
                        <Text>
                            Utilisez <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">session_destroy()</code> pour
                            réinitialiser les sessions si nécessaire, ou créez une page <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">reset.php</code> pour
                            vider les brouillons pendant les tests.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            <Text className="text-xl font-semibold text-center text-gray-800 mt-8 pt-6 border-t">
                Bonne chance ! 🎓
            </Text>
        </article>
    );
}