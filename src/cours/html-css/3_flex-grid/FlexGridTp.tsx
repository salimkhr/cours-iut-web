import Link from "next/link";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import ImageCard from "@/components/Cards/ImageCard";

export default function FlexGridTp() {
    return (
        <section>
            <Heading level={2}>A- Onzer</Heading>

            <Text>
                En partant des fichiers <Link href="/download/html/onzer.html"
                                              download>onzer.html</Link> et <Link href="/download/html/onzer.css"
                                                                                  download>onzer.css</Link>,
                complété le fichier <Code>onzer.css</Code> pour :
            </Text>

            <Heading level={3}>1/ Flex</Heading>
            <List>
                <ListItem>
                    Les éléments dans <Code>.player</Code> doivent être alignés horizontalement, avec un espace maximal
                    entre eux et centrés verticalement.
                </ListItem>

                <List>
                    Les cartes dans <Code>.cards</Code> doivent être disposées côte à côte, avec un espace 1&nbsp;rem
                    entre elles. Un retour à la ligne si l&apos;espace est insuffisant sera réalisé en
                    utilisant <Code>Wrap</Code>.
                </List>
                <List>
                    Les éléments dans <Code>.artist</Code> doivent être centrés horizontalement et verticalement. (Texte
                    présent dans la bulle)
                </List>
            </List>

            <Heading level={3}>2/ Grid</Heading>
            <List>
                <ListItem>
                    Les boutons dans <Code>.cat-buttons</Code> doivent être disposés en grille avec 4 colonnes de
                    largeur égale et un espace d&apos;environ 3 rem entre eux.
                </ListItem>

                <ListItem>
                    Les éléments dans <Code>.artist-list</Code> doivent être disposés en grille, avec des colonnes
                    d&apos;au
                    moins 200px de large qui s&apos;adaptent à la taille de l&apos;écran et un espace d&apos;environ 3
                    rem entre eux.
                </ListItem>
            </List>
            <div className="w-full md:w-1/2 mx-auto p-4">
                <ImageCard src="/images/html/attendu_TP2.png" title="Résultat attendu" width={800} height={800}/>
            </div>

            <Heading level={2}>B- Media Query</Heading>

            <Heading level={3}>1/ Modifier le template de grid</Heading>
            <List>
                <ListItem>
                    Pour les écrans de moins de 768px de large, modifiez <Code>.cat-buttons</Code> pour qu&apos;il
                    n&apos;affiche
                    que 2 colonnes au lieu de 4.
                </ListItem>
                <ListItem>
                    Pour les écrans de moins de 576px de large, modifiez <Code>.cat-buttons</Code> pour qu&apos;il
                    n&apos;affiche
                    que 1 colonne au lieu de 4.
                </ListItem>
            </List>
        </section>
    )
}