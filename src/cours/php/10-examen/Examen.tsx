import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {AlertCircle, Award, Calculator, Clock, Settings} from 'lucide-react';
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";
import DiagramCard from "@/components/Cards/DiagramCard";
import CodeCard from "@/components/Cards/CodeCard";
import Link from "next/link";

export default function Examen() {
    const chart = `classDiagram
class Matiere {
    +id: ?INT
    +code: STRING
    +nom: STRING
    +heuresTD: INT
    +heuresTP: INT
    +responsable: ?Responsable
    +semestre: INT
    +getId(): ?INT
    +getCode(): STRING
    +getNom(): STRING
    +getHeuresTD(): INT
    +getHeuresTP(): INT
    +getResponsable(): ?Responsable
    +getSemestre(): INT
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

Responsable "1" <-- "*" Matiere`;

    const sections = [
        {title: "A- Création des matières", points: 8, time: "1h"},
        {title: "B- Sauvegarde en base de données", points: 8, time: "1h"},
        {title: "C- Gestion des brouillons en session", points: 4, time: "0h30"},
    ];

    return (
        <article>
            {/* Entête */}
            <section className="flex flex-col items-center justify-center py-16 space-y-4">
                <Heading level={2}>Département Informatique - BUT Info 2 - 2024/2025</Heading>
                <Heading level={3}>R3.01 Développement WEB - Khraimeche Salim</Heading>
            </section>

            {/* Rendu de l'examen */}
            <section>
                <Alert className="border-blue-300 bg-blue-50">
                    <AlertCircle className="h-5 w-5 text-blue-600"/>
                    <AlertTitle className="text-blue-900 font-semibold">Rendu de l&apos;examen</AlertTitle>
                    <AlertDescription className="text-blue-800">
                        <Text>
                            À la fin du contrôle, vous devrez déposer l&apos;ensemble de vos fichiers dans une
                            archive ZIP nommée{" "}
                            <Code className="bg-blue-100 px-2 py-1 rounded text-sm">Exam_prenom_nom.zip</Code>,
                            puis la soumettre sur{" "}
                            <Link
                                href="https://eureka.univ-lehavre.fr/mod/assign/view.php?id=176564"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline font-medium"
                            >
                                Eurêka
                            </Link>{" "}
                            dans les délais indiqués.
                        </Text>

                        <Text>
                            Tout projet qui ne sera pas déposé sur la plateforme dans les délais
                            <strong> ne sera pas pris en compte lors de la correction.</strong>
                        </Text>

                        <Text className="mt-2">
                            L&rsquo;usage du téléphone, des montres connectées ainsi que de toute forme
                            d&rsquo;IA (y compris locale) est strictement interdit pendant toute la durée de
                            l&rsquo;épreuve. L&rsquo;autocomplétion intégrée à votre IDE est en revanche
                            autorisée.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            {/* Barème */}
            <section>
                <Heading level={2}>Barème</Heading>

                <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 mt-6">
                    {/* Liste des sections */}
                    <List className="flex-1 space-y-3">
                        {sections.map((item, index) => (
                            <ListItem
                                key={index}
                                className="flex items-center justify-between rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-3">
                                    <Award className="text-yellow-500" size={22}/>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{item.title}</span>
                                        <span className="text-sm">{item.points} points</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock size={18} className="text-blue-500"/>
                                    <span>Temps estimé : {item.time}</span>
                                </div>
                            </ListItem>
                        ))}
                    </List>

                    {/* Bloc de notation */}
                    <div className="md:w-1/3">
                        <Alert className="h-full flex flex-col justify-center mt-0 md:mt-0">
                            <div className="flex items-center mb-2">
                                <Calculator className="mr-2"/>
                                <AlertTitle className="font-semibold">Notation</AlertTitle>
                            </div>
                            <AlertDescription className="leading-relaxed space-y-2">
                                <Text>
                                    La notation portera principalement sur la <strong>qualité du code</strong> et le
                                    <strong> respect des bonnes pratiques</strong> ainsi que des <strong>règles de
                                    sécurités</strong> abordées durant le cours.
                                </Text>

                                <Text className="font-medium">
                                    Le <strong>CSS</strong> et l&rsquo;aspect visuel de l&rsquo;interface ne
                                    seront pas pris en compte dans la note finale.
                                </Text>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </section>

            {/* Résumé */}
            <section>
                <Heading level={2}>Résumé du sujet</Heading>
                <Text>
                    L&apos;objectif de cet exercice est de créer un système de gestion des matières pour
                    l&apos;intranet du département. Le projet comporte trois grandes parties :
                </Text>
                <List ordered>
                    <ListItem>
                        <strong>Création des matières :</strong> formulaire permettant de saisir le code, le
                        nom, les volumes horaires, le responsable et le semestre d&apos;une matière, avec
                        validation côté client et serveur.
                    </ListItem>
                    <ListItem>
                        <strong>Sauvegarde en base de données :</strong> affichage et enregistrement des
                        matières créées en respectant la structure des classes <Code>Matiere</Code> et{" "}
                        <Code>Responsable</Code>.
                    </ListItem>
                    <ListItem>
                        <strong>Gestion des brouillons en session :</strong> sauvegarde temporaire des données
                        du formulaire en session lorsque l&apos;utilisateur coche la case &quot;brouillon&quot;,
                        permettant de reprendre la saisie ultérieurement.
                    </ListItem>
                </List>
            </section>

            {/* Initialisation */}
            <section>
                <Heading level={2}>Initialisation du projet</Heading>
                <Text>
                    Téléchargez le projet{" "}
                    <Link download href="/download/php/exam_prenom_nom.zip">
                        <span className="font-medium text-blue-600">exam_prenom_nom.zip</span>
                    </Link>{" "}
                    et décompressez-le dans un dossier situé en dehors de <Code>public_html</Code>. Ensuite,
                    lancez le serveur en exécutant le script <Code>start.sh</Code>.
                </Text>
            </section>

            {/* Partie A */}
            <section className="pt-6">
                <Heading level={2}>A- Création des matières</Heading>

                <Text>
                    Dans cette partie, vous devez créer un formulaire permettant aux administrateurs de saisir
                    de nouvelles matières dans l&apos;intranet. Le formulaire doit permettre de renseigner
                    toutes les informations nécessaires pour chaque matière et assurer la cohérence des données.
                </Text>

                <Text className="mt-4">
                    Créez le fichier <Code>public/admin.php</Code> afin qu&rsquo;il appelle la méthode{" "}
                    <Code>index()</Code> de la classe <Code>AdminController</Code>. Modifiez ensuite cette
                    méthode <Code>index()</Code> pour qu&rsquo;elle charge la vue <Code>admin.html.php</Code>.
                    La page est accessible depuis l&rsquo;interface via l&rsquo;icône{" "}
                    <Link href="http://localhost:8000/admin.php" target="_blank">
                        <Settings className="inline w-4 h-4 mx-1 mb-0.5"/>
                    </Link>.
                </Text>

                <List ordered>
                    <ListItem>
                        <strong>Code de la matière :</strong>
                        <List>
                            <ListItem>Champ de saisie libre.</ListItem>
                            <ListItem>Format : exactement 5 caractères (ex : &quot;R3.01&quot;, &quot;R4.10&quot;).</ListItem>
                            <ListItem>Validation PHP : vérifiez la longueur.</ListItem>
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
                            <ListItem>Deux champs numériques distincts : Heures de TD, Heures de TP.</ListItem>
                            <ListItem>En HTML : valeurs ≥ 0 pour chaque champ.</ListItem>
                            <ListItem>En PHP : chaque valeur doit être un entier positif ou nul.</ListItem>
                            <ListItem>La somme totale (TD + TP) doit être strictement supérieure à 0.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Responsable :</strong>
                        <List>
                            <ListItem>Liste déroulante affichant les responsables disponibles.</ListItem>
                            <ListItem>
                                Format d&apos;affichage : &quot;NOM Prénom&quot; (ex : &quot;DUPONT Jean&quot;,
                                &quot;MARTIN Sophie&quot;, &quot;BERNARD Lucas&quot;).
                            </ListItem>
                            <ListItem>Valeur soumise : l&apos;ID du responsable.</ListItem>
                            <ListItem>
                                Ajoutez une option par défaut &quot;-- Sélectionner un responsable --&quot;
                                avec une valeur vide.
                            </ListItem>
                            <ListItem>
                                Pas de vérification PHP à cette étape (sera traitée dans la partie B).
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Semestre :</strong>
                        <List>
                            <ListItem>Boutons radio avec six options : S1, S2, S3, S4, S5, S6.</ListItem>
                            <ListItem>Validation PHP : valeur entre 1 et 6 uniquement.</ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Brouillon :</strong>
                        <List>
                            <ListItem>
                                Case à cocher permettant d&apos;indiquer si la saisie est un brouillon.
                            </ListItem>
                            <ListItem>
                                Si cochée, les données sont sauvegardées en session sans être insérées en base.
                            </ListItem>
                            <ListItem>Valeur par défaut : non cochée.</ListItem>
                        </List>
                    </ListItem>
                </List>

                <Text className="font-semibold mt-6 mb-3">
                    Lorsqu&apos;un utilisateur soumet le formulaire :
                </Text>

                <List>
                    <ListItem>
                        Vérifiez que tous les champs sont remplis et respectent les contraintes définies
                        ci-dessus.
                    </ListItem>
                    <ListItem>
                        Si le formulaire est valide, redirigez vers <Code>index.php</Code>.
                    </ListItem>
                    <ListItem>
                        Si le formulaire contient des erreurs, réaffichez-le avec les valeurs saisies et les
                        messages d&apos;erreur associés pour chaque champ incorrect.
                    </ListItem>
                </List>
            </section>

            {/* Partie B */}
            <section className="pt-6">
                <Heading level={2}>B- Sauvegarde en base de données</Heading>
                <DiagramCard chart={chart} header="Diagramme de classes"/>
                <Text className="mt-4">
                    Après avoir configuré la base de données en modifiant le fichier{" "}
                    <Code>config/config.php</Code> et exécuté le script :
                </Text>

                <CodeCard language="sql" filename={"init.sql"} collapsible>
                    {`-- Suppression des tables si elles existent
DROP TABLE IF EXISTS matiere CASCADE;
DROP TABLE IF EXISTS responsable CASCADE;

-- Création de la table responsable
CREATE TABLE responsable (
                             id SERIAL PRIMARY KEY,
                             nom VARCHAR(50) NOT NULL,
                             prenom VARCHAR(50) NOT NULL,
                             email VARCHAR(100) NOT NULL UNIQUE
);

-- Création de la table matiere
CREATE TABLE matiere (
                         id SERIAL PRIMARY KEY,
                         code VARCHAR(6) NOT NULL UNIQUE,
                         nom VARCHAR(100) NOT NULL,
                         heures_td INTEGER NOT NULL DEFAULT 0,
                         heures_tp INTEGER NOT NULL DEFAULT 0,
                         responsable_id INTEGER NOT NULL,
                         semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 6),
                         CONSTRAINT fk_responsable FOREIGN KEY (responsable_id)
                             REFERENCES responsable(id)
                             ON DELETE RESTRICT
                             ON UPDATE CASCADE
);

-- Insertion de responsables de test
INSERT INTO responsable (nom, prenom, email) VALUES
('DUPONT', 'Jean', 'jean.dupont@univ-lehavre.fr'),
('MARTIN', 'Sophie', 'sophie.martin@univ-lehavre.fr'),
('BERNARD', 'Lucas', 'lucas.bernard@univ-lehavre.fr'),
('PETIT', 'Marie', 'marie.petit@univ-lehavre.fr'),
('DURAND', 'Pierre', 'pierre.durand@univ-lehavre.fr'),
('LAMBERT', 'Claire', 'claire.lambert@univ-lehavre.fr'),
('ROUSSEAU', 'Marc', 'marc.rousseau@univ-lehavre.fr'),
('MOREAU', 'Anne', 'anne.moreau@univ-lehavre.fr');

-- Insertion de matières du BUT Informatique (Semestres 1 à 6)
INSERT INTO matiere (code, nom, heures_td, heures_tp, responsable_id, semestre) VALUES
-- Semestre 1
('R1.01', 'Initiation au développement',  10, 20, 1, 1),
('R1.02', 'Développement interfaces Web', 15, 20, 2, 1),
('R1.03', 'Introduction Architecture',  10, 10, 3, 1),
('R1.04', 'Introduction Système', 10, 15, 3, 1),
('R1.05', 'Introduction Base de données',  15, 15, 4, 1),
('R1.06', 'Mathématiques discrètes', 15, 0, 5, 1),
('R1.07', 'Outils mathématiques fondamentaux', 15, 0, 5, 1),
('R1.08', 'Gestion de projet et des organisations', 10, 0, 6, 1),
('R1.09', 'Économie durable et numérique', 10, 0, 7, 1),
('R1.10', 'Anglais Technique', 20, 0, 8, 1),
('R1.11', 'Bases de la communication',  15, 0, 8, 1),
('R1.12', 'Projet Professionnel et Personnel', 15, 0, 6, 1),
('P1.01', 'Portfolio', 0,  20, 6, 1),

-- Semestre 2
('R2.01', 'Développement orienté objets', 10, 25, 1, 2),
('R2.02', 'Développement d''applications avec IHM', 10, 20, 2, 2),
('R2.03', 'Qualité de développement', 15, 15, 1, 2),
('R2.04', 'Communication et fonctionnement bas niveau', 10, 10, 3, 2),
('R2.05', 'Introduction aux services réseaux',  10, 15, 3, 2),
('R2.06', 'Exploitation d''une base de données',  15, 15, 4, 2),
('R2.07', 'Graphes',  15, 0, 5, 2),
('R2.08', 'Outils numériques pour les statistiques', 10, 10, 5, 2),
('R2.09', 'Méthodes Numériques',  15, 0, 5, 2),
('R2.10', 'Gestion de projet et des organisations',  15, 0, 6, 2),
('R2.11', 'Droit',  10, 0, 7, 2),
('R2.12', 'Anglais d''entreprise',  20, 0, 8, 2),
('R2.13', 'Communication Technique', 15, 0, 8, 2),
('R2.14', 'Projet Professionnel et Personnel', 15, 0, 6, 2),
('P2.01', 'Portfolio',  0, 20, 6, 2),

-- Semestre 3
('R3.01', 'Développement WEB',  10, 25, 2, 3),
('R3.02', 'Développement Efficace',  10, 20, 1, 3),
('R3.03', 'Analyse',  15, 0, 5, 3),
('R3.04', 'Qualité de développement 3', 10, 15, 1, 3),
('R3.05', 'Programmation Système',  10, 15, 3, 3),
('R3.06', 'Architecture des réseaux', 10, 10, 3, 3),
('R3.07', 'SQL dans un langage de programmation', 10, 15, 4, 3),
('R3.08', 'Probabilités',  15, 0, 5, 3),
('R3.09', 'Cryptographie et sécurité',  10, 10, 3, 3),
('R3.10', 'Management des systèmes d''information',  10, 0, 6, 3),
('R3.11', 'Droits des contrats et du numérique',  10, 0, 7, 3),
('R3.12', 'Anglais 3', 20, 0, 8, 3),
('R3.13', 'Communication professionnelle', 15, 0, 8, 3),
('R3.14', 'PPP 3', 15, 0, 6, 3),
('P3.01', 'Portfolio', 0, 20, 6, 3),

-- Semestre 4
('R4.01', 'Architecture logicielle', 10, 20, 1, 4),
('R4.02', 'Qualité de développement 4', 10, 15, 1, 4),
('R4.03', 'Qualité et au delà du relationnel', 10, 15, 4, 4),
('R4.04', 'Méthodes d''optimisation', 15, 0, 5, 4),
('R4.05', 'Anglais 4', 0, 0, 8, 4),
('R4.06', 'Communication interne',15, 0, 8, 4),
('R4.07', 'PPP 4',  15, 0, 6, 4),
('R4.08', 'Virtualisation',  10, 20, 3, 4),
('R4.09', 'Management avancé des SI', 10, 0, 6, 4),
('R4.10', 'Complément web',  10, 20, 2, 4),
('R4.11', 'Développement mobile', 10, 25, 2, 4),
('R4.12', 'Automates', 15, 0, 5, 4),
('S4.ST', 'Stages',  0, 0, 6, 4),
('P4.01', 'Portfolio', 0, 20, 6, 4),

-- Semestre 5
('R5.01', 'Initiation au management équipe projet',  10, 0, 6, 5),
('R5.02', 'Projet Personnel et Professionnel',  15, 0, 6, 5),
('R5.03', 'Politique de communication',  15, 0, 8, 5),
('R5.04', 'Qualité algorithmique',  15, 15, 1, 5),
('R5.05', 'Programmation avancée',  10, 25, 1, 5),
('R5.06', 'Programmation multimédia',  10, 20, 2, 5),
('R5.07', 'Automatisation chaîne de production', 10, 20, 3, 5),
('R5.08', 'Qualité de développement', 10, 15, 1, 5),
('R5.09', 'Virtualisation avancée',  10, 20, 3, 5),
('R5.10', 'Nouveaux paradigmes BDD',  10, 15, 4, 5),
('R5.11', 'Optimisation pour aide à la décision', 15, 0, 5, 5),
('R5.12', 'Modélisations mathématiques',  15, 0, 5, 5),
('R5.13', 'Économie durable et numérique',10, 0, 7, 5),
('R5.14', 'Anglais',  20, 0, 8, 5),

-- Semestre 6
('R6.01', 'Initiation à l''entrepreneuriat',  10, 0, 7, 6),
('R6.02', 'Droit numérique propriété intellectuelle',  10, 0, 7, 6),
('R6.03', 'Communication diffusion information',  15, 0, 8, 6),
('R6.04', 'Projet Personnel et Professionnel',  15, 0, 6, 6),
('R6.05', 'Développement avancé',  10, 25, 1, 6),
('R6.06', 'Maintenance applicative',  10, 20, 1, 6),
('S6.ST', 'Stage',  0, 0, 6, 6);`}
                </CodeCard>

                <Text className="mt-4">
                    Vous devez implémenter la logique permettant d&apos;enregistrer les nouvelles matières
                    créées via le formulaire de la partie A dans la base de données.
                </Text>

                <Text className="mt-4">
                    Dans le dossier <Code>app/entites</Code>, créez la classe <Code>Matiere.php</Code> avec
                    les propriétés suivantes :
                </Text>

                <List>
                    <ListItem><Code>id</Code> (int) : identifiant unique de la matière.</ListItem>
                    <ListItem><Code>code</Code> (string) : code unique de la matière.</ListItem>
                    <ListItem><Code>nom</Code> (string) : nom de la matière.</ListItem>
                    <ListItem><Code>heuresTD</Code> (int) : nombre d&apos;heures de travaux dirigés.</ListItem>
                    <ListItem><Code>heuresTP</Code> (int) : nombre d&apos;heures de travaux pratiques.</ListItem>
                    <ListItem>
                        <Code>responsable</Code> (Responsable) : objet représentant le responsable de la
                        matière.
                    </ListItem>
                    <ListItem><Code>semestre</Code> (int) : numéro du semestre (1 à 6).</ListItem>
                </List>

                <Text className="mt-4">
                    Dans le dossier <Code>app/entites</Code>, créez la classe <Code>Responsable.php</Code>{" "}
                    avec les propriétés suivantes :
                </Text>

                <List>
                    <ListItem><Code>id</Code> (?int) : identifiant unique du responsable.</ListItem>
                    <ListItem><Code>nom</Code> (string) : nom de famille du responsable.</ListItem>
                    <ListItem><Code>prenom</Code> (string) : prénom du responsable.</ListItem>
                    <ListItem><Code>email</Code> (string) : adresse e-mail du responsable.</ListItem>
                </List>

                <Heading level={3}>1. Options dynamiques pour les responsables</Heading>
                <Text>
                    Après avoir complété la méthode <Code>ResponsableRepository#findAll()</Code>, utilisez-la
                    pour afficher dynamiquement les responsables dans la liste déroulante du formulaire.
                </Text>

                <Heading level={3}>2. Validation du formulaire</Heading>
                <Text>
                    Lorsqu&apos;un utilisateur soumet le formulaire :
                </Text>

                <List>
                    <ListItem>
                        Créez une instance de la classe <Code>Matiere</Code> avec les données du formulaire.
                    </ListItem>
                    <ListItem>
                        Si toutes les données sont valides, insérez la nouvelle <Code>Matiere</Code> dans la
                        base de données et redirigez vers <Code>index.php</Code>.
                    </ListItem>
                    <ListItem>
                        En cas d&apos;erreur, réaffichez le formulaire avec les valeurs saisies et les
                        messages d&apos;erreur correspondants pour permettre à l&apos;utilisateur de
                        corriger sa saisie.
                    </ListItem>
                </List>
            </section>

            {/* Partie C */}
            <section className="pt-6">
                <Heading level={2}>C- Gestion des brouillons en session</Heading>

                <Text>
                    Dans cette dernière partie, vous devez implémenter la gestion des brouillons pour
                    permettre aux utilisateurs de sauvegarder temporairement leurs saisies.
                </Text>

                <Heading level={3}>1. Fonctionnement attendu</Heading>

                <List ordered>
                    <ListItem>
                        <strong>Sauvegarde du brouillon :</strong>
                        <List>
                            <ListItem>
                                Lorsque l&apos;utilisateur coche la case &quot;brouillon&quot; et soumet le
                                formulaire valide, toutes les données doivent être stockées en session sous la
                                clé <Code>$_SESSION[&apos;draft_matiere&apos;]</Code>.
                            </ListItem>
                            <ListItem>
                                Stockez cet objet <Code>Matiere</Code> en session sous la clé{" "}
                                <Code>$_SESSION[&apos;draft_matiere&apos;]</Code>.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Chargement du brouillon :</strong>
                        <List>
                            <ListItem>
                                Au chargement du formulaire, vérifiez si un brouillon existe en session.
                            </ListItem>
                            <ListItem>
                                Si un brouillon existe, récupérez l&apos;objet <Code>Matiere</Code> et utilisez
                                ses getters pour pré-remplir automatiquement tous les champs du formulaire.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Validation et suppression du brouillon :</strong>
                        <List>
                            <ListItem>
                                Si l&apos;utilisateur soumet le formulaire sans cocher &quot;brouillon&quot;
                                et que les données sont valides, insérez la matière en base et supprimez le
                                brouillon de la session.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <strong>Gestion des erreurs :</strong>
                        <List>
                            <ListItem>
                                Si le formulaire contient des erreurs (même avec &quot;brouillon&quot; coché),
                                ne sauvegardez PAS le brouillon et affichez les erreurs.
                            </ListItem>
                            <ListItem>
                                L&apos;utilisateur doit corriger les erreurs avant de pouvoir sauvegarder un
                                brouillon.
                            </ListItem>
                        </List>
                    </ListItem>
                </List>

                <Alert className="mt-6 border-yellow-300 bg-yellow-50">
                    <AlertCircle className="h-5 w-5 text-yellow-600"/>
                    <AlertTitle className="text-yellow-900 font-semibold">⚠️ Attention</AlertTitle>
                    <AlertDescription className="text-yellow-800">
                        <Text>
                            Si vous rencontrez des problèmes de redirection infinie ou si les données en
                            session ne se comportent pas comme prévu, vérifiez que vous utilisez correctement{" "}
                            <Code>session_start()</Code> au début de chaque fichier PHP et que vous testez
                            l&apos;existence des clés avec <Code>isset()</Code> avant d&apos;y accéder.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            <Text className="mt-8 text-xl font-semibold text-center border-t pt-6">
                Bonne chance ! 🎓
            </Text>
        </article>
    );
}