import React from 'react';
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Box from "@/components/ui/Box";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Link from "next/link";
import CodeCard from "@/components/Cards/CodeCard";


export default function LesFormulairesTp() {

    return (
        <section>
            <Box>
                {/* Création d'un formulaire HTML */}
                <Heading level={2}>A/ Page de connexion</Heading>
                <Text>En partant du fichier <Code>login.html</Code> :</Text>
                <CodeCard language="html">
                    {`<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="UTF-8">
        <title>Connexion</title>
    </head>
    <body>
        <h1>Connexion</h1>
    </body>
</html>`}
                </CodeCard>

                <Text>Créez un formulaire de connexion avec les champs suivants :</Text>
                <List ordered>
                    <ListItem>Un champ pour le nom d&apos;utilisateur (input de type <Code>text</Code>).</ListItem>
                    <ListItem>Un champ pour le mot de passe (input de type <Code>password</Code>).</ListItem>
                    <ListItem>Un bouton de soumission.</ListItem>
                </List>

                <Text>Ajoutez les contraintes suivantes :</Text>
                <List>
                    <ListItem>Les champs doivent avoir des labels associés.</ListItem>
                    <ListItem>Le champ du nom d&apos;utilisateur doit être requis.</ListItem>
                    <ListItem>Le champ du mot de passe doit être requis et avoir un minimum de 6
                        caractères.</ListItem>
                </List>
            </Box>
            <Box>
                <Heading level={2}>B/ Page d&apos;inscription</Heading>
                <Text>Dans un fichier <Code>register.html</Code>, créez un formulaire d&apos;inscription avec les
                    champs suivants :</Text>
                <List ordered>
                    <ListItem>Un champ pour le nom complet (input de type <Code>text</Code>).</ListItem>
                    <ListItem>Un champ pour l&apos;adresse email (input de type <Code>email</Code>).</ListItem>
                    <ListItem>Un champ pour le mot de passe (input de type <Code>password</Code>).</ListItem>
                    <ListItem>Un champ pour la confirmation du mot de passe (input de
                        type <Code>password</Code>).</ListItem>
                    <ListItem>Un champ pour la date de naissance (input de type <Code>date</Code>).</ListItem>
                    <ListItem>
                        Un champ pour choisir le genre (input de type <Code>select</Code> avec les options
                        &quot;Homme&quot;, &quot;Femme&quot;, &quot;Autre&quot;, et une option &quot;-- Sélectionnez
                        votre genre --&quot;par défaut non
                        sélectionnable).
                    </ListItem>
                    <ListItem>
                        Un champ pour sélectionner son niveau d&apos;expérience en développement web (input de
                        type <Code>radio</Code> avec les
                        options &quot;Débutant&quot;, &quot;Intermédiaire&quot;, &quot;Avancé&quot;).
                    </ListItem>
                    <ListItem>
                        Un champ pour choisir les langages de programmation maîtrisés (input de
                        type <Code>select</Code> avec
                        l&apos;attribut <Code>multiple</Code>) avec les options
                        &quot;HTML&quot;, &quot;CSS&quot;, &quot;JavaScript&quot;, &quot;Java&quot; et une option par
                        défaut non sélectionnable)..
                    </ListItem>
                    <ListItem>Un champ pour télécharger une photo de profil (input de
                        type <Code>file</Code>).</ListItem>
                    <ListItem>
                        Une case à cocher pour accepter les conditions générales (input de type <Code>checkbox</Code>).
                    </ListItem>
                    <ListItem>Un bouton de soumission.</ListItem>
                </List>

                <Text>Ajoutez les contraintes suivantes :</Text>
                <List>
                    <ListItem>Tous les champs, à l&apos;exception de la photo de profil, sont obligatoires.</ListItem>
                    <ListItem>Le champ du mot de passe doit être requis et avoir un minimum de 8
                        caractères.</ListItem>
                </List>
            </Box>
            <Box>
                <Heading level={2}>C/ Pour aller plus loin</Heading>
                <Heading level={3}>1/ Bootstrap</Heading>
                <Text>Modifiez le <Code>&lt;head&gt;</Code> des
                    fichiers <Code>login.html</Code> et <Code>register.html</Code> pour y ajouter :</Text>
                <CodeCard language="html">
                    {`<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">`}
                </CodeCard>

                <Text>
                    Utilisez <Link href="https://getbootstrap.com/docs/5.3/forms/overview/#overview" target="_blank">les
                    classes fournies par Bootstrap </Link> pour améliorer l&apos;esthétique de la page. Nous verrons le
                    fonctionnement des
                    classes <Code>.mb</Code> lors du TP sur Bootstrap.
                </Text>

                <Heading level={3}>2/ L&apos;autocomplete</Heading>
                <Text>Ajoutez l&apos;utilisation de l&apos;attribut <Code>autocomplete</Code> dans les formulaires pour
                    améliorer l&apos;expérience utilisateur et faciliter la saisie des informations.</Text>
            </Box>
        </section>
    );
}
