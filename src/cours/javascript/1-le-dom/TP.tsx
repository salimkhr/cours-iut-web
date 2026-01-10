import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";

export default function TP() {

    const domainName = 'https://salimkhraimeche.dev/images/sfh/';

    const streamers = [
        {
            pseudo: "Aminematue",
            photo: domainName + "aminematue.jpg",
            twitchLink: "https://www.twitch.tv/aminematue",
            name: "Amine"
        },
        {
            pseudo: "Rebeudeter (Billy)",
            photo: domainName + "rebeudeter.jpg",
            twitchLink: "https://www.twitch.tv/rebeudeter",
            name: "Billal Hakkar"
        },
        {
            pseudo: "kameto",
            photo: domainName + "kameto.jpg",
            twitchLink: "https://www.twitch.tv/kamet0",
            name: "Kamel Kebir"
        },
        {
            pseudo: "Pfut",
            photo: domainName + "pfut.jpg",
            twitchLink: "https://www.twitch.tv/pauleta_twitch",
            name: "Arnaud"
        },
        {
            pseudo: "squeezie",
            photo: domainName + "squeezie.jpg",
            twitchLink: "https://www.twitch.tv/squeezie",
            name: "Lucas Hauchard"
        },
        {
            pseudo: "Inoxtag",
            photo: domainName + "inoxtag.jpg",
            twitchLink: "https://www.twitch.tv/inoxtag",
            name: "Inès Benazzouz"
        },
        {
            pseudo: "Maghla",
            photo: domainName + "maghla.jpg",
            twitchLink: "https://www.twitch.tv/maghla",
            name: "Barbara"
        },
        {
            pseudo: "Michou",
            photo: domainName + "michou.jpg",
            twitchLink: "https://www.twitch.tv/michou",
            name: "Miguel Mattioli"
        },
        {
            pseudo: "Zwave",
            photo: domainName + "zwave.jpg",
            twitchLink: "https://www.twitch.tv/zwave69",
            name: "Mahmoud Z."
        },
        {
            pseudo: "Locklear",
            photo: domainName + "locklear.jpg",
            twitchLink: "https://www.twitch.tv/locklear",
            name: "Inconnu"
        },
        {
            pseudo: "joelpostbad",
            photo: domainName + "joelpostbad.jpg",
            twitchLink: "https://www.twitch.tv/BMSJOEL",
            name: "Joël Digbeu"
        },
        {
            pseudo: "Gotaga",
            photo: domainName + "gotaga.jpg",
            twitchLink: "https://www.twitch.tv/gotaga/",
            name: "Corentin Houssein"
        },
        {
            pseudo: "Trixy",
            photo: domainName + "trixy.jpg",
            twitchLink: "https://www.twitch.tv/xo_trixy",
            name: "Sarah"
        },
        {
            pseudo: "Avamind",
            photo: domainName + "avamind.jpg",
            twitchLink: "https://www.twitch.tv/avamind",
            name: "Ava"
        },
        {
            pseudo: "Grimkujow",
            photo: domainName + "grimkujow.jpg",
            twitchLink: "https://www.twitch.tv/grimkujow",
            name: "Mathis"
        },
        {
            pseudo: "Terracid",
            photo: domainName + "terracid.jpg",
            twitchLink: "https://www.twitch.tv/terracid",
            name: "Damien Laguionie"
        },
        {
            pseudo: "Doigby",
            photo: domainName + "doigby.jpg",
            twitchLink: "https://www.twitch.tv/doigby",
            name: "Arif Akin"
        },
        {
            pseudo: "Baghera Jones",
            photo: domainName + "baghera-jones.jpg",
            twitchLink: "https://www.twitch.tv/bagherajones",
            name: "Justine Noguera"
        },
        {pseudo: "Minos", photo: domainName + "minos.jpg", twitchLink: "https://www.twitch.tv/minos", name: "Amin"},
        {
            pseudo: "Zack Nani",
            photo: domainName + "zack-nani.jpg",
            twitchLink: "https://www.twitch.tv/zacknani",
            name: "Zack Nani"
        },
        {
            pseudo: "Etoiles",
            photo: domainName + "etoiles.jpg",
            twitchLink: "https://www.twitch.tv/etoiles",
            name: "Rayenne Guendil"
        },
        {
            pseudo: "Arkunir",
            photo: domainName + "arkunir.jpg",
            twitchLink: "https://www.twitch.tv/arkunir",
            name: "Florian Gripon"
        },
        {
            pseudo: "Lolypokicake",
            photo: domainName + "lolypokicake.jpg",
            twitchLink: "https://www.twitch.tv/lolypokicake",
            name: "Loly"
        },
        {
            pseudo: "tatiana",
            photo: domainName + "tatiana.jpg",
            twitchLink: "https://www.twitch.tv/tatiana_tv/",
            name: "Inconnu"
        },
        {
            pseudo: "Kenny",
            photo: domainName + "kenny.jpg",
            twitchLink: "https://www.twitch.tv/kennystream",
            name: "Guillaume Reynaud"
        },
    ];

    return (
        <article>
            <section>
                <Heading level={2}>A- Le debug</Heading>
                <Text>
                    Dans un fichier <Code>~/public_html/TP1/debug.html</Code>, écrire une page contenant dans des
                    balises script :
                </Text>
                <CodeCard language="javascript" filename={"debug.html"}>
                    {`const lastname = 'Medical';             // Chaîne de caractères
const firstname = ['Anne','Lyse'];          // Tableau de chaîne de caractères
const age = 25;                             // Entier
const price = 19.99;                        // Float
const isStudent = true;                     // Booléen

console.log('Age:', age, 'Price:', price, 'Is Student:', isStudent, 'Lastname:', lastname);`}
                </CodeCard>
                <List ordered>
                    <ListItem>ouvrez l&apos;inspecteur d&apos;éléments.</ListItem>
                    <ListItem>Expliquer ce que fait <Code>console.log()</Code>.</ListItem>
                    <ListItem>utiliser <Code>console.table()</Code> et <Code>console.log()</Code> pour afficher
                        firstname</ListItem>
                </List>
            </section>
            <section>
                <Heading level={2}>B- Modification des éléments</Heading>
                <Text>Voici le contenu du fichier <Code>animalerie.html</Code> :</Text>
                <CodeCard language="html" filename="animalerie.html">
                    {`<!DOCTYPE html>
    <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Animalerie - Bienvenue !</title>
            <style>
                .highlight {
                    background-color: lightyellow;
                    border: 2px dashed green;
                }
                .important {
                    color: red;
                    font-weight: bold;
                }
                    .pet {
                    font-style: italic;
                }
                </style>
            </head>
            <body>
                <header>
                    <h1 id="main-title">Bienvenue dans notre animalerie !</h1>
                </header>
    
                <p class="description">Votre animalerie en ligne préférée, au service de vos compagnons
                à poils, plumes et écailles !</p>
    
                <section>
                    <Heading level={2}>Nos animaux disponibles :</Heading>
                    <ul id="pet-list">
                        <li class="pet">Chien : Labrador</li>
                        <li class="pet">Chat : Persan</li>
                        <li class="pet">Poisson : Combattant</li>
                    </ul>
                </section>
    
                <footer>
                    <p id="footer-text">© 2025 - Animalerie magique</p>
                </footer>
    
                <script src="animalerie.js"></script>
            </body>
        </html>`}
                </CodeCard>

                <Text>
                    Complétez le fichier <Code>animalerie.js</Code> pour effectuer les modifications suivantes :
                </Text>

                <List ordered>
                    <ListItem>
                        <Text>Changez les contenus suivants :</Text>
                        <List>
                            <ListItem>
                                Utilisez <Code>getElementById</Code> pour modifier le texte du titre principal
                                (<Code>h1#main-title</Code>) en : <Code>&quot;Bienvenue dans l&apos;univers magique des
                                animaux !&quot;</Code>.
                            </ListItem>
                            <ListItem>
                                Utilisez <Code>getElementsByClassName</Code> pour modifier le paragraphe avec la classe
                                <Code>.description</Code> en : <Code>&quot;Découvrez nos adorables animaux et leurs
                                accessoires magiques !&quot;</Code>.
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text>
                            Ajoutez ou modifiez des classes CSS pour styliser les éléments :
                        </Text>
                        <List>
                            <ListItem>
                                Ajoutez la classe <Code>highlight</Code> à tous les animaux dans la liste
                                (<Code>li.pet</Code>) en utilisant
                                <Code>getElementsByClassName</Code>.
                            </ListItem>
                            <ListItem>
                                Ajoutez la classe <Code>important</Code> uniquement au premier animal de la liste
                                (<Code>Chien : Labrador</Code>).
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text>Modifiez ou ajoutez des attributs :</Text>
                        <List>
                            <ListItem>
                                Ajoutez un attribut <Code>data-promo=&quot;true&quot;</Code> à chaque élément de la
                                liste des
                                animaux
                                (<Code>li</Code>).
                            </ListItem>
                            <ListItem>
                                Ajoutez un attribut <Code>title=&quot;Merci de nous rendre visite !&quot;</Code> au
                                footer
                                (<Code>#footer-text</Code>).
                            </ListItem>
                        </List>
                    </ListItem>

                    <ListItem>
                        <Text>
                            Modifiez directement le style en ligne du footer (<Code>#footer-text</Code>) pour changer sa
                            couleur en <Code>DarkViolet</Code>.
                        </Text>
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>C- Affichage du tableau</Heading>
                <Text>
                    Le but de l&apos;exercice est de lister les participants du &quot;Stream for Humanity&quot;, un
                    marathon caritatif organisé par Aminematue du 16 au 18 novembre 2025. Cet événement réunit de
                    nombreux streamers pour collecter des dons destinés aux victimes en Palestine, au Congo, au Soudan
                    et au Liban, au profit de Médecins Sans Frontières.
                </Text>
                <Text>Dans un fichier <Code>stream_for_Humanity.html</Code>,contenant :</Text>

                <CodeCard language="html" filename="stream_for_Humanity.html">
                    {`<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Stream for Humanity</title>
</head>
<body>
    <table>
        <thead>
            <tr>
                <th>Photo</th>
                <th>Prénom</th>
                <th>Pseudo</th>
                <th>Lien Twitch</th>
            </tr>
        </thead>
        <tbody id="listSfh">
            <!-- Les lignes des streamers seront ajoutées ici via JavaScript -->
        </tbody>
    </table>

    <script src="stream_for_Humanity.js"></script>
</body>
</html>
`}
                </CodeCard>
                <Text>Dans un fichier <Code>stream_for_Humanity.js</Code>,contenant :</Text>
                <CodeCard language="javascript" filename="stream_for_Humanity.js" collapsible>
                    {`const streamers = ${JSON.stringify(streamers.sort((a, b) => a.pseudo.localeCompare(b.pseudo)), null, 2)};`}
                </CodeCard>
                <Text>En utilisant le tableau de streamers et innerHTML pour créer les élements, suivez les
                    instruction pour réaliser le
                    Tableau ci-dessous :</Text>
               <List ordered>
                    <ListItem>
                        a l&apos;aide de <Code>document.getElementById()</Code>, récupérer l&apos;élément ayant comme
                        id <Code>listSfh</Code>, utiliser <Code>console.log();</Code> pour verifier
                    </ListItem>
                    <ListItem>
                        parcourez le tableau streamers, et a l&apos;aide de <Code>console.log</Code>, afficher les
                        informations de chaque streamer
                    </ListItem>
                    <ListItem>
                        Modifier le parcours, pour ajouter une ligne (&lt;tr&gt;) au tableau pour chaque item de la
                        liste
                    </ListItem>
                    <ListItem>
                        Modifier le parcours, pour ajouter les cellules (&lt;td&gt;) au tableau pour chaque item de la
                        liste. les image auront comme <Code>alt</Code> &quot;Photo de + name&quot; et
                        comme <Code>width</Code> 70px
                    </ListItem>
                </List>

                <Text>Reproduire le même tableau sans utiliser innerHTML, mais en construisant les éléments
                    via <Code>document.createElement</Code> et en les ajoutant au DOM</Text>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="col">Photo</TableHead>
                            <TableHead scope="col">Prénom</TableHead>
                            <TableHead scope="col">Pseudo</TableHead>
                            <TableHead scope="col">Lien Twitch</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {streamers.sort((a, b) => a.pseudo.localeCompare(b.pseudo)).map((streamer) => (
                            <TableRow key={streamer.pseudo}>
                                <TableCell><Image src={streamer.photo} alt={"Photo de " + streamer.name} width={70} height={70}/></TableCell>
                                <TableCell>{streamer.name}</TableCell>
                                <TableCell>{streamer.pseudo}</TableCell>
                                <TableCell><Link as="a"
                                                  target="_blank"
                                                  href={streamer.twitchLink}>{streamer.twitchLink}</Link></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </section>
        </article>
    );
}