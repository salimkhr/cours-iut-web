import Heading from "@/components/ui/Heading";
import Box from "@/components/ui/Box";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";

export default function TP() {
    return (
        <Box>
            <Heading level={2}>C- Manipulation des chaînes de caractères</Heading>
            <Heading level={3}>1. Différence entre guillemets doubles et simples</Heading>
            <Text>
                Les chaînes de caractères peuvent être définies avec des guillemets simples ou doubles. La
                principale différence réside dans la gestion des variables et des caractères spéciaux :
            </Text>
            <List>
                <ListItem><strong>Guillemets simples (<Code>&apos; &apos;</Code>) :</strong> Les variables
                    et les caractères spéciaux ne sont pas interprétés. Le texte est affiché tel quel.</ListItem>
                <ListItem><strong>Guillemets doubles (<Code>&quot; &quot;</Code>) :</strong> Les variables
                    sont interprétées et remplacées par leur valeur. Les caractères spéciaux
                    comme <Code>\n</Code> pour un saut de ligne sont également interprétés.</ListItem>
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
                La concaténation des chaînes en PHP se fait en utilisant le point (<Code>.</Code>). Vous pouvez
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
    );
}