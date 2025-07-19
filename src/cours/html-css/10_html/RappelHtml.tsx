import Heading from "@/components/ui/Heading";
import Box from "@/components/ui/Box";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import {Stack} from "@/components/ui/Stack";
import Grid from "@/components/ui/Grid";
import CardInput from "@/components/Cards/InputCard";
import Link from "next/link";
import CodeCard from "@/components/Cards/CodeCard";
import CodeWithPreviewCard, {CodePanel, PreviewPanel} from "@/components/Cards/CodeWithPreviewCard";
import Image from "next/image";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export default async function RappelHTML() {
    return (
        <section>
            <Box>
                <Heading level={2}>A- Qu&apos;est-ce que le HTML ?</Heading>
                <Text>
                    Le HTML (HyperText Markup Language) est le langage de balisage utilisé pour structurer et organiser
                    le contenu d&apos;un site web. Il permet de définir la structure de la page en utilisant des balises
                    qui sont ensuite interprétées par les navigateurs pour afficher le contenu à l&apos;utilisateur.
                </Text>
                <Heading level={3}>Structure de base d’une page HTML5</Heading>
                <Text>
                    Voici un exemple de structure minimale d’une page HTML5.
                </Text>

                <CodeCard language="html">
                    {`<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ma page HTML5</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <h1>Bonjour HTML5 !</h1>
    <p>Ceci est une structure de base.</p>
  </body>
</html>`}
                </CodeCard>

                <List>
                    <ListItem><Code>&lt;!DOCTYPE html&gt;</Code> : indique qu&apos;on utilise HTML5.</ListItem>
                    <ListItem><Code>&lt;html lang=&quot;fr&quot;&gt;</Code> : la langue principale est le
                        français.</ListItem>
                    <ListItem><Code>&lt;meta charset=&quot;UTF-8&quot;&gt;</Code> : pour afficher les caractères
                        spéciaux
                        correctement.</ListItem>
                    <ListItem><Code>&lt;meta name=&quot;viewport&quot; …&gt;</Code> : rend la page adaptée aux écrans
                        mobiles.</ListItem>
                    <ListItem><Code>&lt;title&gt;</Code> : texte affiché dans l’onglet du navigateur.</ListItem>
                    <ListItem><Code>&lt;link rel=&quot;stylesheet&quot; href=&quot;…&quot; /&gt;</Code> : lie un
                        fichier CSS externe.</ListItem>
                    <ListItem><Code>&lt;body&gt;</Code> : contient le contenu visible de la page.</ListItem>
                </List>

                <Heading level={3}>Sectionnement sémantique avancé</Heading>
                <CodeCard language="html">
                    {`<header>
  <h1>Mon Blog</h1>
  <nav>
    <a href="#articles">Articles</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<main>
  <section id="articles">
    <article>
      <Heading level={2}>Premier article</Heading>
      <p>Contenu de l’article...</p>
    </article>
    <article>
      <Heading level={2}>Deuxième article</Heading>
      <p>Autre contenu...</p>
    </article>
  </section>

  <aside>
    <h3>À propos</Heading>
    <p>Petit texte complémentaire.</p>
  </aside>
</main>

<footer>
  <p>© 2025 Mon Blog</p>
</footer>`}</CodeCard>
                <Text>En HTML5, on utilise des balises sémantiques pour structurer clairement le contenu, au lieu
                    d’empiler des &lt;div&gt;.
                    Voici les principales :</Text>
                <List>
                    <ListItem><Code>&lt;header&gt;</Code> – en-tête de page ou de section</ListItem>
                    <ListItem><Code>&lt;nav&gt;</Code> – navigation principale</ListItem>
                    <ListItem><Code>&lt;main&gt;</Code> – contenu principal de la page</ListItem>
                    <ListItem><Code>&lt;section&gt;</Code> – bloc de contenu thématique</ListItem>
                    <ListItem><Code>&lt;article&gt;</Code> – contenu autonome (ex : un post, une actu)</ListItem>
                    <ListItem><Code>&lt;aside&gt;</Code> – contenu complémentaire</ListItem>
                    <ListItem><Code>&lt;footer&gt;</Code> – pied de page</ListItem>
                </List>


                <Heading level={2}>B- Contenu de base</Heading>
                <Heading level={3}>Typography</Heading>
                <Text>
                    En HTML, la typographie permet de structurer et mettre en forme le texte pour qu’il soit lisible,
                    hiérarchisé et accessible. Voici les principaux éléments :
                </Text>

                <List>
                    <ListItem>
                        <strong>Titres</strong> : balises <Code>&lt;h1&gt;</Code> à <Code>&lt;h6&gt;</Code> pour
                        hiérarchiser les contenus.
                    </ListItem>
                    <ListItem>
                        <strong>Paragraphe</strong> : balise <Code>&lt;p&gt;</Code> pour regrouper un bloc de texte.
                    </ListItem>
                    <ListItem>
                        <strong>Mise en valeur forte</strong> : balise <Code>&lt;strong&gt;</Code> pour souligner un
                        texte important.
                    </ListItem>
                    <ListItem>
                        <strong>Mise en valeur légère</strong> : balise <Code>&lt;em&gt;</Code> pour insister sur un mot
                        ou une expression.
                    </ListItem>
                </List>

                <Stack>
                    {/* Exemple de titres */}
                    <Heading level={4}>
                        Titres (<Code>H1</Code> à <Code>H6</Code>)
                    </Heading>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<h1>1/ Titre principal</h1>
                    <h2>2/ Sous-titre</h2>
                    <h3>3/ Section</h3>
                    <h4>4/ Sous-section</h4>
                    <h5>5/ Détail</h5>
                    <h6>6/ Note ou remarque</h6>`}
                        </CodePanel>
                        <PreviewPanel>
                            <Box>
                                <Heading level={1}>1/ Titre principal</Heading>
                                <Heading level={2}>2/ Sous-titre</Heading>
                                <Heading level={3}>3/ Section</Heading>
                                <Heading level={4}>4/ Sous-section</Heading>
                                <Heading level={5}>5/ Détail</Heading>
                                <Heading level={6}>6/ Note ou remarque</Heading>
                            </Box>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>

                <Stack>
                    {/* Exemple de paragraphe */}
                    <Heading level={4}>
                        Paragraphe (p)
                    </Heading>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<p>
                        Ce texte est un paragraphe. 
                        Il est utilisé pour structurer les blocs de contenu dans une page HTML.
                    </p>`}
                        </CodePanel>
                        <PreviewPanel>
                            <Text>
                                Ce texte est un paragraphe. Il est utilisé pour structurer les blocs de contenu dans une
                                page HTML.
                            </Text>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>

                <Stack>
                    {/* Exemple de strong */}
                    <Text>
                        Texte important (strong)
                    </Text>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<p>Attention : <strong>le mot de passe est obligatoire</strong> pour continuer.</p>`}
                        </CodePanel>
                        <PreviewPanel>
                            <Text>
                                Attention : <strong>le mot de passe est obligatoire</strong> pour continuer.
                            </Text>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>

                <Stack>
                    {/* Exemple de em */}
                    <Text>
                        Texte accentué (em)
                    </Text>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<p><em>Ce document est très important</em>, lisez-le attentivement.</p>`}
                        </CodePanel>
                        <PreviewPanel>
                            <Text>
                                <em>Ce document est très important</em>, lisez-le attentivement.
                            </Text>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>


                <Heading level={3}>Listes</Heading>
                <Text>
                    En HTML, il existe <strong>trois types de listes</strong> principales :
                </Text>

                <List>
                    <ListItem>
                        <strong>Liste non ordonnée</strong> : <Code>&lt;ul&gt;</Code> → éléments à puces.
                    </ListItem>
                    <ListItem>
                        <strong>Liste ordonnée</strong> : <Code>&lt;ol&gt;</Code> → éléments numérotés.
                    </ListItem>
                    <ListItem>
                        <strong>Liste de définition</strong> : <Code>&lt;dl&gt;</Code> → pour associer des termes et
                        leurs définitions.
                    </ListItem>
                </List>

                <Stack>
                    {/* Exemple UL */}
                    <Text>
                        Liste non ordonnée (ul)
                    </Text>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<ul>
                      <li>HTML</li>
                      <li>CSS</li>
                      <li>JavaScript</li>
                    </ul>`}
                        </CodePanel>
                        <PreviewPanel>
                            <List>
                                <ListItem>HTML</ListItem>
                                <ListItem>CSS</ListItem>
                                <ListItem>JavaScript</ListItem>
                            </List>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>
                <Stack>
                    {/* Exemple OL */}
                    <Text>
                        Liste ordonnée (ol)
                    </Text>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<ol>
                      <li>Préparer le projet</li>
                      <li>Écrire le code</li>
                      <li>Tester et publier</li>
                    </ol>`}
                        </CodePanel>
                        <PreviewPanel>
                            <List ordered={true}>
                                <ListItem>Préparer le projet</ListItem>
                                <ListItem>Écrire le code</ListItem>
                                <ListItem>Tester et publier</ListItem>
                            </List>
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>
                <Stack>
                    {/* Exemple DL */}
                    <Text>
                        Liste de définition (dl)
                    </Text>
                    <CodeWithPreviewCard language="html">
                        <CodePanel>
                            {`<dl>
                      <dt>HTML</dt>
                      <dd>Langage de structure des pages web</dd>
                      
                      <dt>CSS</dt>
                      <dd>Langage de style</dd>
                    </dl>`}
                        </CodePanel>
                        <PreviewPanel>
                            <></>
                            {/*<DataList>*/}
                            {/*    <DataListItemLabel>HTML</DataListItemLabel>*/}
                            {/*    <DataListItemValue>Langage de structure des pages web</DataListItemValue>*/}
                            {/*    <DataListItemLabel>CSS</DataListItemLabel>*/}
                            {/*    <DataListItemValue>Langage de style</DataListItemValue>*/}
                            {/*</DataList>*/}
                        </PreviewPanel>
                    </CodeWithPreviewCard>
                </Stack>
                <Heading level={3}>Tableaux</Heading>
                <Text>
                    Les tableaux en HTML permettent d’afficher des données sous forme de lignes et colonnes.
                    On utilise les balises <Code>&lt;table&gt;</Code>, <Code>&lt;tr&gt;</Code> (ligne),
                    <Code>&lt;td&gt;</Code> (cellule) et <Code>&lt;th&gt;</Code> (cellule d’en-tête).
                </Text>

                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Âge</th>
                  </tr>
                 </thead> 
                  <tbody>
                      <tr>
                        <td>Alice</td>
                        <td>25</td>
                      </tr>
                      <tr>
                        <td>Bob</td>
                        <td>30</td>
                      </tr>
                  <tbody/>
                </table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Âge</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Alice</TableCell>
                                    <TableCell>25</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Bob</TableCell>
                                    <TableCell>30</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </PreviewPanel>
                </CodeWithPreviewCard>
                <Text>
                    Il est possible de définir un nombre de ligne ou de colonne occupé par une cellule :</Text>
                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
                  <thead>
                  <tr>
                    <th>Nom</th>
                    <th colspan="2">Contact</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>Alice</td>
                    <td>Email</td>
                    <td>alice@mail.com</td>
                  </tr>
                  <tr>
                    <td rowspan="2">Bob</td>
                    <td>Email</td>
                    <td>bob@mail.com</td>
                  </tr>
                  <tr>
                    <td>Téléphone</td>
                    <td>06 12 34 56 78</td>
                  </tr>
                  </tbody>
                </table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead colSpan={2}>Contact</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Alice</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>alice@mail.com</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell rowSpan={2}>Bob</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>bob@mail.com</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Téléphone</TableCell>
                                    <TableCell>06 01 02 03 04</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Text>ou des en-tête sur chaque ligne :</Text>
                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Lundi</th>
                      <th>Mardi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Matin</th>
                      <td>Maths</td>
                      <td>Français</td>
                    </tr>
                    <tr>
                      <th scope="row">Après-midi</th>
                      <td>Histoire</td>
                      <td>Sport</td>
                    </tr>
                  </tbody>
                </table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead/>
                                    <TableHead>Lundi</TableHead>
                                    <TableHead>Mardi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell scope="row">Matin</TableCell>
                                    <TableCell>Maths</TableCell>
                                    <TableCell>Français</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell scope="row">Après-midi</TableCell>
                                    <TableCell>Histoire</TableCell>
                                    <TableCell>Sport</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </PreviewPanel>
                </CodeWithPreviewCard>
                <Text>
                    Ici, les <Code>&lt;th scope=&quot;row&quot;&gt;</Code> servent à indiquer le contexte de chaque
                    ligne (Matin,
                    Après-midi).
                    C’est une bonne pratique pour les tableaux de type &quot;grille&quot;, et ça améliore aussi
                    l’accessibilité.
                </Text>
                <Heading level={3}>Liens</Heading>
                <Text id="lien">
                    En HTML, les liens se créent avec <code>&lt;a&gt;</code> et l’attribut <code>href</code>.
                </Text>

                <Grid templateColumns={{
                    base: "1fr",         // Une seule colonne sur les petits écrans
                    sm: "repeat(auto-fit, minmax(300px, 1fr))", // Colonnes dès 300px en petit écran
                    md: "repeat(auto-fit, minmax(400px, 1fr))", // Colonnes dès 400px en moyen écran
                    lg: "repeat(auto-fit, minmax(450px, 1fr))"  // Colonnes dès 450px sur grands écrans
                }}
                      gap={6}
                      width="100%">
                    <div>
                        <CardInput
                            title="Lien vers une autre page"
                            description='Le navigateur charge une autre page du même site via l’attribut `href`.'
                            code={`<a href="/contact.html">Page Contact</a>`}
                            inputElement={<Link href="/contact.html">Page Contact</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers un autre site"
                            description='L’attribut `href` pointe vers un domaine différent.'
                            code={`<a href="https://www.example.com">Visiter example.com</a>`}
                            inputElement={<Link href="https://www.example.com">Visiter
                                example.com</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers une ancre interne"
                            description='L’attribut `href="#id"` fait défiler la page jusqu’à l’élément correspondant à l’ID.'
                            code={`<a href="#lien">\n    Aller à la section "Lien"\n</a>`}
                            inputElement={<Link href="#lien">Aller à la
                                section &quot;Lien&quot;</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien dans un nouvel onglet"
                            description='L’attribut `target="_blank"` ouvre le lien dans un nouvel onglet du navigateur.'
                            code={`<a href="https://www.example.com" target="_blank">\n    Ouvrir dans un nouvel onglet\n</a>`}
                            inputElement={
                                <Link href="https://www.example.com" target="_blank"
                                      rel="noopener noreferrer">
                                    Ouvrir dans un nouvel onglet
                                </Link>
                            }
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers une adresse e-mail"
                            description='Le préfixe `mailto:` ouvre le client de messagerie par défaut avec le champ "À" prérempli.'
                            code={`<a href="mailto:contact@monsite.com">Envoyer un e-mail</a>`}
                            inputElement={<Link href="mailto:contact@monsite.com">Envoyer un
                                e-mail</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers un numéro de téléphone"
                            description='Le préfixe `tel:` ouvre l’application téléphonique sur mobile ou logiciel compatible.'
                            code={`<a href="tel:+33123456789">Appeler le 01 23 45 67 89</a>`}
                            inputElement={<Link href="tel:+33123456789">Appeler le 01 23 45 67
                                89</Link>}
                        />
                    </div>
                </Grid>


                <Heading level={2}>C- Images et Médias</Heading>
                <Heading level={3}>Image</Heading>
                <Text>
                    Pour afficher une image en HTML, on utilise la balise auto-fermante <Code>&lt;img&gt;</Code>.
                    Elle prend principalement les attributs <Code>src</Code> (l’URL de l’image)
                    et <Code>alt</Code> (texte alternatif).
                </Text>
                <CodeWithPreviewCard language="html">
                    <CodePanel>{`<img src="https://picsum.photos/300/200" alt="Exemple d'image" />`}</CodePanel>
                    <PreviewPanel>
                        <Image src="https://picsum.photos/300/200" alt="Exemple d'image" width={50} height={50}/>
                    </PreviewPanel>
                </CodeWithPreviewCard>
                <Text>
                    Le texte <Code>alt</Code> est important pour l’accessibilité et s’affiche si l’image ne se charge
                    pas.
                </Text>

                <Heading level={3}>Audio</Heading>
                <Text>
                    La balise <code>&lt;audio&gt;</code> permet d’intégrer un fichier son. Il est recommandé d’ajouter
                    l’attribut{" "}
                    <code>controls</code> pour que l’utilisateur puisse lire, mettre en pause, etc.
                </Text>

                <CodeWithPreviewCard language="html">
                    <CodePanel>{`<audio controls>
                  <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'audio.
                </audio>`}</CodePanel>
                    <PreviewPanel>
                        <audio controls>
                            <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg"/>
                            Votre navigateur ne supporte pas l&apos;audio.
                        </audio>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Text>
                    On peut aussi fournir plusieurs formats dans des balises <code>&lt;source&gt;</code> pour une
                    meilleure compatibilité navigateur.
                </Text>
                <Heading level={3}>Video</Heading>
                <Text>
                    La balise <code>&lt;video&gt;</code> permet d’intégrer une vidéo sur la page. Comme pour l’audio, on
                    utilise{" "}
                    <code>controls</code> pour permettre les actions de lecture.
                </Text>

                <CodeWithPreviewCard language="html">
                    <CodePanel>{`<video width="320" height="240" controls>
                  <source src="https://www.w3schools.com/html/movie.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la vidéo.
                </video>`}</CodePanel>
                    <PreviewPanel>
                        <video width="320" height="240" controls>
                            <source src="https://www.w3schools.com/html/movie.mp4" type="video/mp4"/>
                            Votre navigateur ne supporte pas la vidéo.
                        </video>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Text>
                    Tu peux aussi ajouter des options comme <Code>autoplay</Code>, <Code>loop</Code>,
                    ou <Code>muted</Code> selon les besoins.
                </Text>
            </Box>
        </section>
    );
}