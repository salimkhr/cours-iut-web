import Heading from "@/components/ui/Heading";
import Box from "@/components/ui/Box";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";

function formatNumberToFrench(value: number): string {
    // Création d'une instance d'Intl.NumberFormat pour le formatage en français
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0, // Pas de décimales dans ce cas
        maximumFractionDigits: 0  // Pas de décimales dans ce cas
    });

    return formatter.format(value);
}

const streamers = [
    {name: "Adrien Nougaret", pseudo: "ZeratoR", amount: 1200000, rank: 1},
    {name: "Frédéric Molas", pseudo: "Joueur du Grenier", amount: 1000000, rank: 2},
    {name: "Pierre-Alexis Bizot", pseudo: "Domingo", amount: 900000, rank: 3},
    {name: "Barbara", pseudo: "Maghla", amount: 750000, rank: 4},
    {name: "Xavier Dang", pseudo: "Mister MV", amount: 600000, rank: 5},
    {name: "Aurélien Gilles", pseudo: "Ponce", amount: 500000, rank: 6},
    {name: "Antoine Daniel", pseudo: "Antoine Daniel", amount: 450000, rank: 7},
    {name: "Marianne", pseudo: "LittleBigWhale", amount: 400000, rank: 8},
    {name: "Inès Benazzouz", pseudo: "Inoxtag", amount: 380000, rank: 9},
    {name: "Miguel Mattioli", pseudo: "Michou", amount: 350000, rank: 10},
];

const amounts = streamers.map(streamer => streamer.amount);
const numberOfStreamers = streamers.length;
const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
const averageAmount = totalAmount / numberOfStreamers;
const maxAmount = Math.max(...amounts);
const minAmount = Math.min(...amounts);


export default function IntroductionPhpTp() {
    return (
        <section>
            <Box>
                <Heading level={2}>A- Rappel de HTML</Heading>
                <Text>
                    Le serveur <strong>woody</strong> est un serveur web de l&apos;IUT configuré
                    avec <strong>Apache</strong>.
                    Il permet d&apos;interpréter les scripts PHP et de rendre accessibles sur le réseau les fichiers
                    HTML et PHP que vous placez dans votre dossier personnel <Code>~/public_html</Code>.
                    Par exemple, si vous ajoutez un fichier
                    nommé <Code>index.php</Code> dans <Code>~/public_html/TP1/</Code>, il sera accessible à
                    l&apos;adresse :
                    <Code>http://woody.iut.univ-lehavre.fr/~votre_login/TP1/index.php</Code> ou <Code>http://localhost/~loginLDAP/TP1/index.php</Code>.
                </Text>

                <Text>
                    Dans le fichier <Code>~/public_html/TP1/rappel.html</Code>, créez une page HTML contenant la
                    structure de base d&apos;un document HTML, ainsi qu&apos;un tableau.
                    Ce tableau devra récapituler les montants collectés par les streamers lors du dernier Z-Event, avec
                    les 4 colonnes suivantes :
                    <em>Nom du Streamer</em>, <em>Pseudo</em>, <em>Montant Collecté (en euros)</em> et <em>Rang</em>.
                    Vous pourrez ensuite consulter cette page dans votre navigateur à l&apos;adresse :
                    <Code>http://woody.iut.univ-lehavre.fr/~loginLDAP/TP1/rappel.html</Code> ou <Code>http://localhost/~loginLDAP/TP1/rappel.html</Code>.
                </Text>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="row">Nom du Streamer</TableHead>
                            <TableHead scope="row">Prénom/Pseudo</TableHead>
                            <TableHead scope="row">Montant Collecté (en euros)</TableHead>
                            <TableHead scope="row">Rang</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {streamers.map((streamer) => (
                            <TableRow key={streamer.rank}>
                                <TableCell>{streamer.name}</TableCell>
                                <TableCell>{streamer.pseudo}</TableCell>
                                <TableCell>{formatNumberToFrench(streamer.amount)}</TableCell>
                                <TableCell>{streamer.rank}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <small>Source : ChatGPT (les montants ne sont pas factuels)</small>
            </Box>
            <Box>
                <Heading level={2}>B- Hello World en PHP</Heading>
                <Text>
                    Dans un fichier <Code>~/public_html/TP1/helloWorld.php</Code>, écrire une page contenant :
                </Text>
                <CodeCard language="php">
                    {`<?php
  echo 'Hello World!';
  echo '<br/>';
  echo 'Nous sommes le ' . date('d/m/Y');
?>`}
                </CodeCard>
                <List ordered>
                    <ListItem>Déterminer à quelle heure correspond la date affichée : celle du serveur ou celle du
                        navigateur ?</ListItem>
                    <ListItem>Modifier le script pour ajouter une variable <Code>$name</Code> et afficher Hello $name!
                        à
                        la place de Hello World!</ListItem>
                </List>
            </Box>
            <Box>
                <Heading level={2}>C- Le debug</Heading>
                <Text>
                    Dans un fichier <Code>~/public_html/TP1/debug.php</Code>, écrire une page contenant :
                </Text>
                <CodeCard language="php">
                    {`<?php
$lastname = 'Medical';             // Chaîne de caractères
$firstname = ['Anne','Lyse'];      // Tableau de chaîne de caractères
$age = 25;                         // Entier
$price = 19.99;                    // Float
$isStudent = true;                 // Booléen

var_dump($age, $price, $isStudent, $lastname, $firstname);
?>`}
                </CodeCard>
                <List ordered>
                    <ListItem>Expliquer ce que fait la fonction <Code>var_dump()</Code>.</ListItem>
                    <ListItem>Ajouter au script un appel à la fonction <Code>die();</Code> ainsi que l&apos;affichage
                        du
                        lastname avec <Code>echo $lastname;</Code>. Vérifier si le texte du <Code>echo</Code> est
                        affiché.</ListItem>
                </List>
                <Text>Utiliser les fonctions <Code>var_dump()</Code> et <Code>die()</Code> pour ajouter des
                    traces dans le code afin d&apos;aider au débogage.</Text>
            </Box>
            <Box>
                <Heading level={2}>D- Affichage du tableau</Heading>
                <Text>Dans un fichier <Code>~/public_html/TP1/zevent.php</Code>, partir de la base suivante
                    :</Text>

                <CodeCard language="php">
                    {`<?php
$streamers = [
    ${streamers.map((streamer) => `["name" => "${streamer.name}","pseudo" => "${streamer.pseudo}", "amount" =>${streamer.amount},"rank" => ${streamer.rank}]`).join(',\n\t')}
];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau des Streamers</title>
        <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        th {
            background-color: #f2f2f2;
            color: #000000;
        }

        .gold { background-color: #FFD700; }
        .gold td {color: #000000;}
        
        .silver { background-color: #C0C0C0; }
        
        .bronze { background-color: #CD7F32; }
    </style>
</head>
<body>
    <h1>Tableau des Streamers</h1>
    <?php 
    
       //nombre de streamer
       $streamerCount = count($streamers); 
        
       
       //Ajout du foreach ici
            echo $streamer['rank'].' '; 
            echo $streamer['name'].' ';
            echo $streamer['pseudo'].' '; 
            echo $streamer['amount'].' ';
            echo '<br/>';
       // fin de la boucle
    ?>
</body>
</html>`}
                </CodeCard>
                <List ordered>
                    <ListItem>Écrire une page en PHP contenant le même tableau que l&apos;exercice 1.</ListItem>
                    <ListItem>Modifier le script pour que, en utilisant <Code>switch</Code>, la ligne de rang 1
                        s&apos;affiche en gold <Code>#FFD700</Code>, rang 2 en silver <Code>#C0C0C0</Code> et rang 3 en
                        bronze <Code>#CD7F32</Code>.</ListItem>
                    <ListItem>Modifier le script pour que, en utilisant <Code>match</Code>, la ligne de rang 1
                        s&apos;affiche en gold <Code>#FFD700</Code>, rang 2 en silver <Code>#C0C0C0</Code> et rang 3 en
                        bronze <Code>#CD7F32</Code>. Comparer les deux syntaxes.</ListItem>
                    <ListItem>Ajouter une nouvelle colonne &quot;Performance&quot; dans le tableau HTML. Cette colonne
                        affichera, grâce à un opérateur ternaire, &quot;Au-dessus de la moyenne&quot; ou &quot;En
                        dessous de la moyenne&quot; en fonction du montant collecté.</ListItem>
                    <ListItem>Ajouter sous le tableau, un tableau récapitulatif indiquant les éléments suivant
                        :</ListItem>
                </List>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Indicateur</TableHead>
                            <TableHead>Valeur</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total Collecté</TableCell>
                            <TableCell>{formatNumberToFrench(totalAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Moyenne des Dons</TableCell>
                            <TableCell>{formatNumberToFrench(averageAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Montant Minimum</TableCell>
                            <TableCell>{formatNumberToFrench(minAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Montant Maximum</TableCell>
                            <TableCell>{formatNumberToFrench(maxAmount)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

            </Box>
        </section>
    )

}

// TODO: Ajouter un split sur les 5 assos