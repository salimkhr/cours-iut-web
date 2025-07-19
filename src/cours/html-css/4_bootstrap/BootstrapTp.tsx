import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import ImageCard from "@/components/Cards/ImageCard";


export default function BootstrapTp() {
    return (
        <section>
            <Heading level={2}>A – Conteneurs et grille</Heading>

            <Text>
                Crée une page HTML avec Bootstrap réalise les tâches suivantes en utilisant la
                class <Code>.block</Code>
            </Text>

            <CodeCard language="html">
                {`<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Bootstrap demo</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
        <style>
            /* Ajoutez votre CSS personnalisé ici */
            .block {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 20px;
                margin: 10px 0;
            }
        </style>
    </head>
<body>
    <!-- code here -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
    </body>
</html>`}
            </CodeCard>

            <Heading level={3}>1/ Conteneurs et Grille de Base</Heading>
            <List>
                <ListItem>
                    Créez une page HTML avec Bootstrap (via CDN).
                </ListItem>
                <ListItem>
                    Utilisez un conteneur <Code>.container</Code> pour créer une section.
                </ListItem>
                <ListItem>
                    Ajoutez une ligne <Code>.row</Code> avec trois colonnes <Code>.col</Code> pour diviser la
                    section en trois parties égales.
                </ListItem>
                <ListItem>
                    Modifiez la première colonne pour qu&apos;elle prenne 50% de la largeur, et les deux dernières
                    pour
                    qu&apos;elles prennent 25% chacune.
                </ListItem>
                <ListItem>
                    Ajoutez une bordure à chaque colonne pour mieux visualiser leur taille.
                </ListItem>
            </List>

            <Heading level={3}>2/ Grille Responsive</Heading>
            <List>
                <ListItem>
                    Créez une ligne contenant 4 blocs (div).
                </ListItem>
                <ListItem>
                    Adaptez leur largeur selon la taille de l’écran :
                    <List>
                        <ListItem>
                            Sur petit écran (sm) : chaque bloc doit occuper toute la largeur → 4 lignes.
                        </ListItem>
                        <ListItem>
                            Sur écran moyen (md) : chaque bloc doit occuper la moitié → 2 blocs par ligne → 2
                            lignes.
                        </ListItem>
                        <ListItem>
                            Sur grand écran (lg) : chaque bloc doit occuper un quart → 4 blocs côte à côte sur 1
                            ligne.
                        </ListItem>
                    </List>
                </ListItem>
                <ListItem>
                    Ajoutez un texte différent dans chaque bloc pour les identifier.
                </ListItem>
                <ListItem>
                    Utilisez des couleurs de fond différentes pour chaque bloc pour les distinguer.
                </ListItem>
            </List>

            <Heading level={2}>B – Flexbox</Heading>

            <Heading level={3}>1/ Conteneurs Flexbox</Heading>
            <List>
                <ListItem>
                    Créez un conteneur flexbox avec la classe <Code>.d-flex</Code>.
                </ListItem>
                <ListItem>
                    Ajoutez trois éléments enfants dans le conteneur et utilisez les classes de direction pour les
                    disposer en ligne, en colonne, et dans l&apos;ordre inverse.
                </ListItem>
                <ListItem>
                    Utilisez les classes d&apos;alignement pour centrer les éléments, les répartir uniformément, et
                    les
                    aligner sur l&apos;axe transversal.
                </ListItem>
            </List>

            <Heading level={3}>2/ Alignement et Justification</Heading>
            <List>
                <ListItem>
                    Créez un conteneur flexbox avec cinq éléments enfants.
                </ListItem>
                <ListItem>
                    Utilisez les
                    classes <Code>.justify-content-between</Code> et <Code>.align-items-center</Code> pour aligner
                    et justifier les éléments.
                </ListItem>
                <ListItem>
                    Expérimentez avec différentes classes d&apos;alignement pour voir comment elles affectent la
                    disposition des éléments.
                </ListItem>
            </List>

            <Heading level={2}>C – Couleurs et Background</Heading>

            <Heading level={3}>1/ Couleurs de Texte et Arrière-plans</Heading>
            <List>
                <ListItem>
                    Créez une section avec un fond de couleur principale et du texte blanc. et ajoutez y un texte
                </ListItem>
                <ListItem>
                    Ajoutez un paragraphe avec du texte de couleur de danger.
                </ListItem>
                <ListItem>
                    Créez un div avec un arrière-plan de couleur d&apos;avertissement et du texte foncé.
                </ListItem>
            </List>

            <Heading level={2}>D – Typographie</Heading>

            <Heading level={3}>1/ Paragraphes</Heading>
            <List>
                <ListItem>
                    Utilisez les classes de titres d&apos;affichage pour créer des titres plus grands et plus
                    accrocheurs.
                </ListItem>
                <ListItem>
                    Ajoutez un paragraphe avec la classe <Code>.lead</Code> pour le mettre en évidence.
                </ListItem>
            </List>

            <Heading level={3}>2/ Utilitaires Typographiques</Heading>
            <List>
                <ListItem>
                    Créez un paragraphe avec du texte en gras, en italique, et souligné.
                </ListItem>
                <ListItem>
                    Utilisez les classes <Code>.text-uppercase</Code>, <Code>.text-lowercase</Code>,
                    et <Code>.text-capitalize</Code> pour modifier la casse du texte.
                </ListItem>
                <ListItem>
                    Ajoutez un lien avec la classe <Code>.text-decoration-none</Code> pour supprimer le
                    soulignement.
                </ListItem>
                <ListItem>
                    Créez une liste avec des éléments de texte de différentes couleurs.
                </ListItem>
            </List>

            <Heading level={2}>E – Espacements</Heading>

            <Heading level={3}>1/ Marges et Remplissages</Heading>
            <List>
                <ListItem>
                    Créez un div avec une marge en haut de taille 3.
                </ListItem>
                <ListItem>
                    Ajoutez un div avec une marge en bas de taille 4.
                </ListItem>
                <ListItem>
                    Créez un div avec un remplissage de taille 5 sur tous les côtés.
                </ListItem>
                <ListItem>
                    Utilisez différentes classes de marge et de remplissage pour créer un effet de grille.
                </ListItem>
            </List>

            <Heading level={3}>2/ Combinaison de Marges et Remplissages</Heading>
            <List>
                <ListItem>
                    Créez un conteneur avec une marge en haut de taille 3, une marge en bas de taille 4, et un
                    remplissage de taille 3 sur tous les côtés.
                </ListItem>
                <ListItem>
                    Ajoutez un élément enfant avec des marges horizontales automatiques et un remplissage de taille
                    4 sur tous les côtés de background rouge (.bg-danger).
                </ListItem>
                <ListItem>
                    Utilisez différentes classes de marge et de remplissage pour créer un effet de carte avec
                    espacement de background gris (.bg-light).
                </ListItem>
            </List>

            <div className="w-full md:w-1/2 mx-auto p-4">
                <ImageCard src="/images/html/attendu_TP4.png"
                           title="Résultat attendu"/>
            </div>

            <Heading level={2}>F – ONZER</Heading>
            <Text>Reprendre le site réalisé lors du dernier TP et, après avoir ajouté le lien du CDN de Bootstrap,
                utiliser les classes pour reproduire le positionnement.</Text>

        </section>
    );
}
