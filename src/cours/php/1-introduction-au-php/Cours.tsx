import Heading from "@/components/ui/Heading";
import Box from "@/components/ui/Box";
import {List, ListItem} from "@/components/ui/List";
import Text from "@/components/ui/Text";
import ImageCard from "@/components/Cards/ImageCard";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeCard from "@/components/Cards/CodeCard";
import Code from "@/components/ui/Code";

export default function Cours() {
    return (
        <section>
            {/* Contenu du cours */}
            <Box>
                <Heading level={2}>A- Protocole HTTP, URL, et architecture des applications web</Heading>

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
                <Heading level={2}>B- Présentation de PHP</Heading>
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
                    Les variables sont définies avec le symbole <Code>$</Code> suivi du nom de la variable. Le
                    type est déterminé automatiquement même si il peut être contraint. Ici, <Code>$message</Code> est
                    une chaîne de
                    caractères, <Code>$age</Code> est un entier, <Code>$price</Code> est un flottant,
                    et <Code>$isStudent</Code> est un booléen.
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
                    Pour afficher du texte, utilisez les fonctions <Code>echo</Code> ou <Code>print</Code>.
                </Text>
            </Box>

            <Box>
                <Heading level={3}>3. Les structures de contrôle</Heading>
                <Heading level={4}>Conditionnel</Heading>
                <Heading level={5}>Conditions avec <Code>if</Code> :</Heading>
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
                    Il existe deux opérateurs de comparaison&nbsp;:&nbsp;
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
                        <Code>===</Code> : Cet opérateur compare à la fois la valeur <strong>et le type</strong>. Cela
                        signifie
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

                <Heading level={5}>Conditions avec <Code>ternaire</Code> :</Heading>
                <CodeCard language="php">
                    {`<?php
echo $humeur !== 'heureux' ? 'Je suis de bonne humeur' : 'bof!!';
?>`}
                </CodeCard>

                <Heading level={5}>Conditions avec <Code>switch</Code> :</Heading>
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

                <Heading level={5}>Conditions avec <Code>match</Code> :</Heading>
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
                <Heading level={5}>La boucle <Code>while</Code> :</Heading>
                <CodeCard language="php">
                    {`<?php
$compteur = 1;
while($compteur < 12) {
    echo "compteur: $compteur <br>\\n";
    $compteur++;
}
?>`}
                </CodeCard>

                <Heading level={5}>La boucle <Code>do ... while</Code> :</Heading>
                <CodeCard language="php">
                    {`<?php
$num = 1;
do {
    echo "Nombre d&apos;exécution: $num <br>\\n";
    $num++;
} while($num > 200 && $num < 400);
?>`}
                </CodeCard>

                <Heading level={5}>La boucle <Code>for</Code> :</Heading>
                <CodeCard language="php">
                    {`<?php
for($compteur = 1; $compteur < 12; $compteur++) {
    echo "compteur: $compteur <br>\\n";
}
?>`}
                </CodeCard>

                <Heading level={5}>La boucle <Code>foreach</Code> :</Heading>
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
            <Box>
                <Heading level={2}>D- Programmation Orienté Objet</Heading>

                <Heading level={3}>1. Définition d&lsquo;une classe</Heading>
                <Text>
                    En PHP, la structure d&lsquo;une classe est similaire à celle de Java. Les méthodes magiques sont
                    des méthodes spéciales en PHP qui commencent par deux underscores (__) et ont des comportements
                    spécifiques. Par exemple, <Code>__construct</Code> est utilisé pour initialiser un objet lors de sa
                    création.
                </Text>
                <CodeCard language="php">
                    {`<?php
class Person {

    private string $name;
    private int $age;
     
    public function __construct(string $name, int $age) {
        $this->name = $name;
        $this->age = $age;
    }

    public function __toString(): string {
        return 'Name: ' . $this->name . ', Age: ' . $this->age;
    }
    
    public function getName(): string {
        return $this->name;
    }
    
    public function setName(string $name): void {
        $this->name = $name;
    }
    
    public function getAge(): int {
        return $this->age;
    }
    
    public function setAge(int $age): void {
        $this->age = $age;
    }
}
?>`}
                </CodeCard>
                <Text>
                    Dans cet exemple, la méthode <Code>__construct</Code> initialise les
                    propriétés <Code>$name</Code> et <Code>$age</Code>. La méthode <Code>__toString</Code> permet de
                    définir comment l&lsquo;objet sera converti en chaîne de caractères lorsqu&lsquo;il est utilisé dans
                    un contexte de chaîne. Le constructeur peut être raccourci comme suit :
                </Text>
                <CodeCard language="php">
                    {`<?php
class Person {
     
    public function __construct(private string $name, private int $age) {}

    public function __toString(): string {
        return 'Name: ' . $this->name . ', Age: ' . $this->age;
    }
    
    public function getName(): string {
        return $this->name;
    }
    
    public function getAge(): int {
        return $this->age;
    }
}
?>`}
                </CodeCard>
                <Heading level={3}>2. Instanciation d&lsquo;un objet</Heading>
                <Text>
                    Pour créer un objet à partir d&lsquo;une classe, on utilise le mot-clé <Code>new</Code> :
                </Text>
                <CodeCard language="php">
                    {`<?php
$person1 = new Person('Alice', 30);
echo $person1; // Outputs "Name: Alice, Age: 30"
?>`}
                </CodeCard>
                <Text>
                    Ici, l&lsquo;objet <Code>$person1</Code> est créé avec les
                    valeurs &rdquo;Alice&rdquo; pour <Code>$name</Code> et 30 pour <Code>$age</Code>. Lorsque
                    l&lsquo;objet est converti en chaîne, la méthode <Code>__toString</Code> est appelée
                    automatiquement.
                </Text>

                <Heading level={3}>3. Héritage</Heading>
                <Text>
                    PHP permet l&lsquo;héritage avec des classes, ce qui signifie qu&lsquo;une classe peut en étendre
                    une autre. De plus, il est possible d&lsquo;utiliser des méthodes magiques dans les classes
                    dérivées.
                </Text>
                <CodeCard language="php">
                    {`<?php
class Employee extends Person {

    private string $position;

    public function __construct(string $name, int $age, string $position) {
        parent::__construct($name, $age);
        $this->position = $position;
    }

    // Magic method __toString
    public function __toString(): string {
        return parent::__toString() . ', Position: ' . $this->position;
    }
}
?>`}
                </CodeCard>
                <Text>
                    Ici, <Code>Employee</Code> hérite de <Code>Person</Code> et ajoute la
                    propriété <Code>$position</Code>. La méthode <Code>__toString</Code> est étendue pour inclure cette
                    nouvelle propriété.
                </Text>

                <Heading level={3}>4. Les Traits</Heading>
                <Text>
                    Les Traits en PHP permettent de réutiliser du code dans plusieurs classes sans nécessiter
                    l&lsquo;héritage. Les Traits sont particulièrement utiles pour partager des méthodes communes entre
                    des classes qui n&lsquo;ont pas de relation hiérarchique.
                </Text>
                <CodeCard language="php">
                    {`<?php
trait Logger {
    public function log(string $message): void {
        echo "[LOG] " . $message;
    }
}

class Employee extends Person {
    use Logger;

    private string $position;

    public function __construct(string $name, int $age, string $position) {
        parent::__construct($name, $age);
        $this->position = $position;
    }

    public function work(): void {
        $this->log($this->name . " is working.");
    }
}
?>`}
                </CodeCard>
                <Text>
                    Ici, le Trait <Code>Logger</Code> ajoute une fonctionnalité de journalisation à la
                    classe <Code>Employee</Code>. Cela permet de centraliser le code commun dans un Trait sans utiliser
                    l&lsquo;héritage.
                </Text>

                <Heading level={3}>5. Différence entre Traits et Héritage</Heading>
                <Text>
                    L&lsquo;héritage en PHP est utilisé pour établir une relation hiérarchique entre les classes, où une
                    classe enfant hérite des propriétés et des méthodes d&lsquo;une classe parent. En revanche, les
                    Traits sont utilisés pour partager des méthodes entre plusieurs classes indépendamment de toute
                    relation hiérarchique. Les Traits permettent la réutilisation du code dans différentes classes sans
                    avoir besoin d&lsquo;utiliser l&lsquo;héritage.
                </Text>
            </Box>
        </section>
    )

}