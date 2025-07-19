"use client"
import Heading from "@/components/ui/Heading";
import Box from "@/components/ui/Box";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {List, ListItem} from "@/components/ui/List";
import CodeCard from "@/components/Cards/CodeCard";
import ImageCard from "@/components/Cards/ImageCard";


export default function IntroductionPHP() {

    return (
        <section>
            {/* Contenu du cours */}
            <Box>
                <Heading level={2}>A- Protocole HTTP, URL, et architecture des appl²ications web</Heading>

                {/* Introduction au protocole HTTP */}
                <Heading level={3}>1. Introduction au protocole HTTP</Heading>
                <Text>
                    Le protocole HTTP (HyperText Transfer Protocol) est utilisé depuis 1990 pour le transfert de données
                    sur Internet, notamment des pages Web écrites en HTML. La version 1.0 permet de transférer des
                    messages avec des en-têtes décrivant le contenu en utilisant un codage MIME. La version sécurisée de
                    HTTP est appelée HTTPS, qui ajoute chiffrement et authentification.
                    HTTP permet le transfert de fichiers localisés grâce à une URL, entre un navigateur (client) et un
                    serveur Web.
                </Text>

                {/* Communication entre navigateur et serveur */}
                <Heading level={3}>2. Communication entre navigateur et serveur</Heading>
                <Text>
                    La communication entre le navigateur et le serveur s&apos;effectue en deux étapes principales :
                </Text>
                <List ordered>
                    <ListItem>Le navigateur envoie une requête HTTP.</ListItem>
                    <ListItem>Le serveur traite cette requête et renvoie une réponse HTTP.</ListItem>
                </List>

                <ImageCard src="/images/http.png" title={'Explication du fonctionnement du protocole HTTP'}/>

                <Heading level={3}>2.1 Qu&apos;est-ce qu&apos;une URL ?</Heading>
                <Text>
                    Une URL (Uniform Resource Locator) est un format universel de nommage pour désigner une ressource
                    sur Internet. Elle se compose de plusieurs parties :
                </Text>
                <List ordered>
                    <ListItem><strong>Le protocole :</strong> le langage utilisé pour la communication sur le
                        réseau, par exemple HTTP.</ListItem>
                    <ListItem><strong>Le nom du serveur :</strong> le nom de domaine de l&apos;ordinateur
                        hébergeant la ressource. L&apos;adresse IP du serveur peut également être utilisée, bien que
                        cela rende l&apos;URL moins lisible.</ListItem>
                    <ListItem><strong>Le numéro de port :</strong> un numéro associé à un service, permettant
                        au
                        serveur d&apos;identifier le type de ressource demandée. Le port utilisé par HTTP est le 80,
                        HTTPS utilise le 443.</ListItem>
                    <ListItem><strong>Le chemin d&apos;accès à la ressource :</strong> l&apos;emplacement
                        spécifique de la ressource sur le serveur, comprenant le répertoire et le nom du
                        fichier.</ListItem>
                </List>
                <Text>
                    Une URL a donc la structure suivante :
                </Text>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="col">Protocole</TableHead>
                            <TableHead scope="col">Nom du serveur</TableHead>
                            <TableHead scope="col">Port (facultatif si 80)</TableHead>
                            <TableHead scope="col">Chemin</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>http://</TableCell>
                            <TableCell>di-web.iut.univ-lehavre.fr</TableCell>
                            <TableCell>:80</TableCell>
                            <TableCell>pedago/info2/PHP/s1/s1.html</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {/* Requête HTTP */}
                <Heading level={4}>
                    2.2 Requête HTTP
                </Heading>
                <Text>
                    Une requête HTTP commence par une méthode qui indique l&apos;action que le navigateur veut
                    effectuer. Les deux méthodes les plus courantes sont :
                </Text>
                <List>
                    <ListItem><strong>GET</strong> : pour récupérer des données depuis le serveur.</ListItem>
                    <ListItem><strong>POST</strong> : pour envoyer des données au serveur, généralement via un
                        formulaire.</ListItem>
                    <ListItem><strong>PUT</strong> : pour mettre à jour une ressource existante sur le
                        serveur.</ListItem>
                    <ListItem><strong>DELETE</strong> : pour supprimer une ressource sur le serveur.</ListItem>
                </List>
                <Text>
                    En fonction de la méthode utilisée, des données peuvent être ajoutées à la requête, soit dans
                    l&apos;URL (pour GET), soit dans le corps de la requête (pour POST / PUT).
                </Text>
            </Box>

            {/* Documents PHP */
            }
            <Box>
                <Heading level={2}>B- Présentation de PHP & premier exemple</Heading>
                <Text> PHP est un langage de script associé à HTML. Son but est de générer du contenu HTML à partir de
                    données.</Text>

                <Heading level={3}>1. Syntaxe de base</Heading>
                <CodeCard language="php">
                    {`<?php
$message = "Hello, World!"; // Chaîne de caractères
$age = 25;                  // Entier
$price = 19.99;             // Float
$isStudent = true;          // Booléen
?>`}
                </CodeCard>
                <Text>
                    En PHP, les variables sont définies avec le symbole <code>$</code> suivi du nom de la variable. Le
                    type est déterminé automatiquement. Ici, <code>$message</code> est une chaîne de
                    caractères, <code>$age</code> est un entier, <code>$price</code> est un flottant,
                    et <code>$isStudent</code> est un booléen.
                </Text>
            </Box>

            <Box>
                <Heading level={3}>2. Affichage de Texte</Heading>
                <CodeCard language="php">
                    {`<?php
echo "Hello, World!";
?>`}
                </CodeCard>
                <Text>
                    Pour afficher du texte en PHP, utilisez les fonctions <code>echo</code> ou <code>print</code>. Ces
                    fonctions permettent de sortir des chaînes de caractères à l&apos;écran.
                </Text>
            </Box>

            <Box>
                <Heading level={3}>3. Les structures de contrôle</Heading>
                <Heading level={4}>
                    Conditionnel
                </Heading>
                <Text>Conditions avec <Code>if</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
$humeur = 'triste';
if ($humeur === 'heureux') {
    echo 'Je suis de bonne humeur';
} elseif ($humeur === 'triste') {
    echo 'bof!!';
} else {
    echo $humeur;
}
?>`}
                </CodeCard>

                <Text>
                    En PHP, il existe deux opérateurs de comparaison :
                    <Code>==</Code> et <Code>===</Code>. Bien qu&apos;ils semblent similaires, ils ont des rôles
                    différents :
                </Text>

                <List>
                    <ListItem>
                        <Code>==</Code> : Cet opérateur compare les valeurs de deux variables, mais ne prend pas en
                        compte leur type. Par exemple, la chaîne de caractères <Code>&apos;5&apos;</Code> et
                        l&apos;entier <Code>5</Code> sont considérés comme égaux avec cet opérateur, car PHP convertit
                        les types automatiquement.
                    </ListItem>
                    <ListItem>
                        <Code>===</Code> : Cet opérateur compare à la fois la valeur **et le type**. Cela signifie
                        que <Code>&apos;5&apos;</Code> (chaîne de caractères) et <Code>5</Code> (entier) ne seront pas
                        considérés comme égaux avec <Code>===</Code>, car leurs types sont différents.
                    </ListItem>
                </List>

                <Text>
                    Par exemple :
                </Text>

                <CodeCard language="php">
                    {`<?php
if (5 == '5') {
    echo "5 == '5' : vrai";
} else {
    echo "5 == '5' : faux";
}

if (5 === '5') {
    echo "5 === '5' : vrai";
} else {
    echo "5 === '5' : faux";
}
?>`}
                </CodeCard>

                <Text>
                    Dans cet exemple, la première condition avec <Code>==</Code> renverra <Code>5 == &apos;5&apos; :
                    vrai</Code>, car PHP
                    convertit la chaîne en entier et les valeurs sont égales. Par contre, la seconde condition avec
                    <Code>===</Code> renverra <Code>5 === &apos;5&apos; : faux</Code>, car bien que les valeurs soient
                    identiques, leurs
                    types diffèrent (entier vs chaîne de caractères).
                </Text>

                <Text>Conditions avec <Code>ternaire</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
echo $humeur !== 'heureux' ? 'Je suis de bonne humeur' : 'bof!!';
?>`}
                </CodeCard>

                <Text>Conditions avec <Code>switch</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
$humeur = 'triste';
switch($humeur) {
    case 'heureux':
        echo 'Je suis de bonne humeur';
        break;
    case 'triste':
        echo 'bof!!';
        break;
    default:
        echo $humeur;
}
?>`}
                </CodeCard>

                <Text>Conditions avec <Code>match</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
$humeur = 'triste';
echo match ($humeur) {
    'heureux' => 'Je suis de bonne humeur',
    'triste' => 'bof!!',
    default => $humeur,
};
?>`}
                </CodeCard>

                <Heading level={4}>
                    Les boucles
                </Heading>
                <Text>La boucle <Code>while</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
$compteur = 1;
while($compteur < 12) {
    echo "compteur: $compteur <br>\\n";
    $compteur++;
}
?>`}
                </CodeCard>

                <Text>La boucle <Code>do ... while</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
$num = 1;
do {
    echo "Nombre d&apos;exécution: $num <br>\\n";
    $num++;
} while($num > 200 && $num < 400);
?>`}
                </CodeCard>

                <Text>La boucle <Code>for</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
for($compteur = 1; $compteur < 12; $compteur++) {
    echo "compteur: $compteur <br>\\n";
}
?>`}
                </CodeCard>

                <Text>La boucle <Code>foreach</Code> :</Text>
                <CodeCard language="php">
                    {`<?php
// Définition d'un tableau de valeurs
$fruits = array("pomme", "banane", "orange");

// Utilisation de foreach pour parcourir le tableau
foreach ($fruits as $fruit) {
    echo 'J\\'aime les '.$fruit.'<br>';
}

/*---------------------------------------*/

// Définition d'un tableau associatif
$fruits = array(
    "pomme" => "rouge",
    "banane" => "jaune",
    "orange" => "orange"
);

// Utilisation de foreach pour parcourir le tableau

foreach ($fruits as $couleur) {
    echo 'J\\'aime les fruits '.$couleur.'<br/>';
}

// Utilisation de foreach pour parcourir le tableau avec les clés
foreach ($fruits as $fruit => $couleur) {
    echo 'Le fruit '.$fruit.' est de couleur '.$couleur.'<br/>';
}
?>`}
                </CodeCard>
            </Box>

            {/* Manipulation des chaînes de caractères */
            }
            <Box>
                <Heading level={2}>C- Manipulation des chaînes de caractères en PHP</Heading>
                <Heading level={3}>1. Différence entre guillemets doubles et simples</Heading>
                <Text>
                    En PHP, les chaînes de caractères peuvent être définies avec des guillemets simples ou doubles. La
                    principale différence réside dans la gestion des variables et des caractères spéciaux :
                </Text>
                <List>
                    <ListItem><strong>Guillemets simples (<code>&apos; &apos;</code>) :</strong> Les variables
                        et les caractères spéciaux ne sont pas interprétés. Le texte est affiché tel quel.</ListItem>
                    <ListItem><strong>Guillemets doubles (<code>&quot; &quot;</code>) :</strong> Les variables
                        sont interprétées et remplacées par leur valeur. Les caractères spéciaux
                        comme <code>\n</code> pour un saut de ligne sont également interprétés.</ListItem>
                </List>
                <CodeCard language="php">
                    {`<?php
$nom = 'John';
echo 'Bonjour, $nom';    // Affiche : Bonjour, $nom
echo "Bonjour, $nom";    // Affiche : Bonjour, John
?>`}
                </CodeCard>

                <Heading level={3}>2. Concaténation des chaînes</Heading>
                <Text>
                    La concaténation des chaînes en PHP se fait en utilisant le point (<code>.</code>). Vous pouvez
                    combiner plusieurs chaînes de caractères ou variables pour former une seule chaîne.
                </Text>
                <CodeCard language="php">
                    {`<?php
$prenom = 'Alice';
$nom = 'Dupont';
$message = $prenom . ' ' . $nom;
echo $message;  // Affiche : Alice Dupont
?>`}
                </CodeCard>

                <Heading level={3}>3. Fonctions courantes de manipulation des chaînes</Heading>
                <Text>
                    PHP offre de nombreuses fonctions pour manipuler les chaînes de caractères. Voici quelques-unes des
                    plus courantes :
                </Text>
                <List>
                    <ListItem><Code>strlen()</Code> : Retourne la longueur d&apos;une chaîne.</ListItem>
                    <ListItem><Code>mb_strtoupper()</Code> : Convertit une chaîne en majuscules.</ListItem>
                    <ListItem><Code>mb_strtolower()</Code> : Convertit une chaîne en minuscules.</ListItem>
                    <ListItem><Code>strpos()</Code> : Trouve la position de la première occurrence d&apos;une
                        sous-chaîne dans une chaîne.</ListItem>
                    <ListItem><Code>substr()</Code> : Extrait une sous-chaîne d&apos;une chaîne donnée.</ListItem>
                </List>
                <CodeCard language="php">
                    {`<?php
$texte = "Bonjour le monde!";
echo strlen($texte);    // Affiche : 16
echo mb_strtoupper($texte); // Affiche : BONJOUR LE MONDE!
echo mb_strtolower($texte); // Affiche : bonjour le monde!
echo strpos($texte, "le"); // Affiche : 8
echo substr($texte, 8, 2); // Affiche : le
?>`}
                </CodeCard>
            </Box>
        </section>
    )

}