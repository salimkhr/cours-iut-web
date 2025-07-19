import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Link from "next/link";
import CodeCard from "@/components/Cards/CodeCard";
import ColorSwatch from "@/components/ui/ColorSwatch";

export default function RappelCSSTp() {
    return (
        <section>
            <Heading level={2}>A- Chronicles of DevQuest</Heading>

            <Text>
                En partant du fichier <Link href="/download/html/blog.html" download>blog.html</Link>,
                écrire un fichier <Code>style.css</Code> dans le même dossier permettant :
            </Text>

            <Heading level={3}>1/ Mettre en forme générale :</Heading>
            <List>
                <ListItem>
                    Définir la police de base sur <Code>Arial, sans-serif</Code>.
                </ListItem>
                <ListItem>
                    Définir la couleur de fond sur <ColorSwatch value={"#f4f4f9"}/>.
                </ListItem>
                <ListItem>
                    Régler la marge et le padding du body à <Code>0</Code>.
                </ListItem>
                <ListItem>
                    Définir la couleur du texte sur <ColorSwatch value={"#333"}/>.
                </ListItem>
                <ListItem>
                    Centrer les titres <Code>h1, h2, h3</Code> et leur donner une couleur <ColorSwatch
                    value={"#222"}/> avec une
                    marge verticale de <Code>20px</Code>.
                </ListItem>
                <ListItem>
                    Définir une hauteur de ligne de <Code>1.6</Code> pour les paragraphes avec une marge verticale
                    de <Code>10px</Code>.
                </ListItem>
                <ListItem>
                    Styliser les liens avec une couleur <ColorSwatch value="#0066cc"/> et sans décoration, ajouter un
                    soulignement
                    au survol.
                </ListItem>
                <ListItem>
                    Créer une classe <Code>.container</Code> avec une largeur maximale de <Code>60vw</Code>, centrée,
                    avec une marge <Code>auto</Code>.
                </ListItem>
                <ListItem>
                    Créer une classe <Code>.center</Code> permettant de centrer le texte.
                </ListItem>
            </List>

            <Heading level={3}>2/ Style des cartes :</Heading>
            <List>
                <ListItem>
                    Créer une classe <Code>.card</Code> avec un fond blanc, des coins arrondis, une ombre, un padding
                    de <Code>20px</Code> et une marge inférieure de <Code>20px</Code>.
                </ListItem>
            </List>

            <Heading level={3}>3/ Section des critiques de la communauté :</Heading>
            <List>
                <ListItem>
                    Créer une classe <Code>.reactions</Code> avec une marge automatique, un padding de <Code>40px
                    20px</Code>.
                </ListItem>
                <ListItem>
                    Styliser les titres <Code>h2</Code> dans <Code>.reactions</Code> avec une taille
                    de <Code>32px</Code> et une marge inférieure de <Code>20px</Code>.
                </ListItem>
                <ListItem>
                    Centrer les paragraphes dans <Code>.reactions</Code> avec une taille de <Code>18px</Code> et une
                    marge inférieure de <Code>30px</Code>.
                </ListItem>
            </List>

            <Heading level={3}>4/ Style des critiques individuelles :</Heading>
            <List>
                <ListItem>
                    Créer une classe <Code>.reaction</Code> avec une marge inférieure de <Code>30px</Code>, un padding
                    de <Code>20px</Code>, un fond <ColorSwatch
                    value={"#f9f9f9"}/>, des coins arrondis.
                </ListItem>
                <ListItem>
                    Styliser les images dans <Code>.reaction</Code> avec une taille
                    de <Code>80px</Code> par <Code>80px</Code>, des coins arrondis et une marge droite
                    de <Code>20px</Code>.
                </ListItem>
                <ListItem>
                    Styliser les titres <Code>h3</Code> dans <Code>.reaction</Code> avec une taille
                    de <Code>24px</Code> et une marge inférieure de <Code>10px</Code>.
                </ListItem>
                <ListItem>
                    Styliser les paragraphes dans <Code>.reaction</Code> avec une taille de <Code>16px</Code>, en
                    italique, de couleur <ColorSwatch
                    value={"#666"}/>.
                </ListItem>
                <ListItem>
                    Styliser les liens dans <Code>.reaction</Code> avec une taille de <Code>16px</Code>, une marge
                    supérieure de <Code>10px</Code>, un fond <ColorSwatch
                    value={"#0066cc"}/>, une couleur de texte
                    blanche, un padding de <Code>10px 15px</Code>, des coins arrondis et une transition de couleur de
                    fond au survol.
                </ListItem>
            </List>

            <Heading level={3}>5/ Style pour le tableau :</Heading>
            <List>
                <ListItem>
                    Styliser la table avec une largeur de <Code>100%</Code> et une bordure <Code>collapse</Code>.
                </ListItem>
                <ListItem>
                    Styliser les en-têtes de la table <Code>th</Code> avec un fond <ColorSwatch
                    value={"#0066cc"}/>, une couleur de
                    texte blanche, un padding de <Code>10px</Code> et une bordure inférieure de <Code>2px solid
                    #ddd</Code>.
                </ListItem>
                <ListItem>
                    Styliser les cellules de la table <Code>td</Code> avec un padding de <Code>10px</Code> et une
                    bordure inférieure de <Code>1px solid #ddd</Code>.
                </ListItem>
                <ListItem>
                    Utiliser le sélecteur <Code>tr:nth-child(even)</Code> pour appliquer un
                    fond <ColorSwatch
                    value={"#f9f9f9"}/> aux lignes paires.
                </ListItem>
                <ListItem>
                    Utiliser le sélecteur <Code>tbody &gt;n tr:hover</Code> pour changer le fond des lignes au survol
                    en <Code>#f1f1f1</Code><ColorSwatch
                    value={"#f1f1f1"}/>.
                </ListItem>
            </List>

            <Heading level={3}>6/ Footer :</Heading>
            <List>
                <ListItem>
                    Styliser le <Code>footer</Code> avec un fond <ColorSwatch
                    value={"#222"}/>, un texte blanc, centré, un padding
                    vertical de <Code>20px</Code>, une marge supérieure de <Code>20px</Code>, positionné en bas et
                    occupant toute la largeur.
                </ListItem>
                <ListItem>
                    Styliser les paragraphes dans le <Code>footer</Code> avec une taille de <Code>14px</Code> et sans
                    marge.
                </ListItem>
            </List>

            <Heading level={2}>B- Utilisation des variables CSS</Heading>
            <Text>
                Pour implémenter un mode clair et un mode sombre, vous pouvez utiliser des variables CSS. Créez deux
                fichiers CSS : <Code>light-mode.css</Code> et <Code>dark-mode.css</Code>. Définissez les variables dans
                chaque fichier et utilisez-les dans votre fichier principal <Code>style.css</Code>.
            </Text>

            <Heading level={3}>1/ Définir les variables dans <Code>light-mode.css</Code> :</Heading>
            <List>
                <ListItem>background-color: #f4f4f9;</ListItem>
                <ListItem>text-color: #333;</ListItem>
                <ListItem>card-background: #fff;</ListItem>
                <ListItem>reaction-background: #f9f9f9;</ListItem>
                <ListItem>link-color: #0066cc;</ListItem>
                <ListItem>footer-background: #222</ListItem>
                <ListItem>footer-text-color: #fff;</ListItem>
            </List>

            <Heading level={3}>2/ Définir les variables dans <Code>dark-mode.css</Code> :</Heading>
            <List>
                <ListItem>background-color: #121212;</ListItem>
                <ListItem>text-color: #e0e0e0;</ListItem>
                <ListItem>card-background: #1e1e1e;</ListItem>
                <ListItem>reaction-background: #2b2b2b;</ListItem>
                <ListItem>link-color: #bb86fc;</ListItem>
                <ListItem>footer-background: #1e1e1e</ListItem>
                <ListItem>footer-text-color: #e0e0e0;</ListItem>
            </List>

            <Heading level={3}>3/ Utiliser les variables dans <Code>style.css</Code> :</Heading>
            <List>
                <ListItem><Code>body</Code> : background-color et : text-color</ListItem>
                <ListItem><Code>.card</Code> : card-background</ListItem>
                <ListItem><Code>.reaction</Code> : reaction-background</ListItem>
                <ListItem><Code>.footer</Code> : footer-background et footer-text-color</ListItem>
            </List>

            <Heading level={3}>4/ Ajouter les liens vers les fichiers CSS avant l&apos;appel a <Code>style.css</Code> :</Heading>
            <List>
                <ListItem>
                    <CodeCard language={"html"}>
                        {`<link rel="stylesheet" href="light-mode.css">
<!--<link rel="stylesheet" href="dark-mode.css">-->`}
                    </CodeCard>
                </ListItem>
            </List>
        </section>
    );
}
