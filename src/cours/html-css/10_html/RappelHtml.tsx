import React from "react";
import Heading from "@/components/ui/Heading";
import Box from "@/components/ui/Box";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import {Stack} from "@/components/ui/Stack";
import Grid from "@/components/ui/Grid";
import CardInput from "@/components/Cards/InputCard";
import Link from "next/link";

export default function RappelHTML() {

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

                {/*                <CodeBlock language="html">*/}
                {/*                    {`<!DOCTYPE html>*/}
                {/*<html lang="fr">*/}
                {/*  <head>*/}
                {/*    <meta charset="UTF-8" />*/}
                {/*    <meta name="viewport" content="width=device-width, initial-scale=1.0" />*/}
                {/*    <title>Ma page HTML5</title>*/}
                {/*    <link rel="stylesheet" href="styles.css" />*/}
                {/*  </head>*/}
                {/*  <body>*/}
                {/*    <h1>Bonjour HTML5 !</h1>*/}
                {/*    <p>Ceci est une structure de base.</p>*/}
                {/*  </body>*/}
                {/*</html>`}*/}
                {/*                </CodeBlock>*/}
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
                {/*                <CodeBlock language="html">*/}
                {/*                    {`<header>*/}
                {/*  <h1>Mon Blog</h1>*/}
                {/*  <nav>*/}
                {/*    <a href="#articles">Articles</a>*/}
                {/*    <a href="#contact">Contact</a>*/}
                {/*  </nav>*/}
                {/*</header>*/}

                {/*<main>*/}
                {/*  <section id="articles">*/}
                {/*    <article>*/}
                {/*      <Heading level={2}>Premier article</Heading>*/}
                {/*      <p>Contenu de l’article...</p>*/}
                {/*    </article>*/}
                {/*    <article>*/}
                {/*      <Heading level={2}>Deuxième article</Heading>*/}
                {/*      <p>Autre contenu...</p>*/}
                {/*    </article>*/}
                {/*  </section>*/}

                {/*  <aside>*/}
                {/*    <h3>À propos</Heading>*/}
                {/*    <p>Petit texte complémentaire.</p>*/}
                {/*  </aside>*/}
                {/*</main>*/}

                {/*<footer>*/}
                {/*  <p>© 2025 Mon Blog</p>*/}
                {/*</footer>`}</CodeBlock>*/}
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
                    {/*                    <CodeWithPreview language="html">*/}
                    {/*                        <CodePanel>*/}
                    {/*                            {`<h1>1/ Titre principal</h1>*/}
                    {/*<h2>2/ Sous-titre</h2>*/}
                    {/*<h3>3/ Section</h3>*/}
                    {/*<h4>4/ Sous-section</h4>*/}
                    {/*<h5>5/ Détail</h5>*/}
                    {/*<h6>6/ Note ou remarque</h6>`}*/}
                    {/*                        </CodePanel>*/}
                    {/*                        <PreviewPanel>*/}
                    {/*                            <Box>*/}
                    {/*                                <Heading level={1}>1/ Titre principal</Heading>*/}
                    {/*                                <Heading level={2}>2/ Sous-titre</Heading>*/}
                    {/*                                <Heading level={3}>3/ Section</Heading>*/}
                    {/*                                <Heading level={4}>4/ Sous-section</Heading>*/}
                    {/*                                <Heading level={5}>5/ Détail</Heading>*/}
                    {/*                                <Heading level={6}>6/ Note ou remarque</Heading>*/}
                    {/*                            </Box>*/}
                    {/*                        </PreviewPanel>*/}
                    {/*                    </CodeWithPreview>*/}
                </Stack>

                <Stack>
                    {/* Exemple de paragraphe */}
                    <Heading level={4}>
                        Paragraphe (p)
                    </Heading>
                    {/*                    <CodeWithPreview language="html">*/}
                    {/*                        <CodePanel>*/}
                    {/*                            {`<p>*/}
                    {/*    Ce texte est un paragraphe. */}
                    {/*    Il est utilisé pour structurer les blocs de contenu dans une page HTML.*/}
                    {/*</p>`}*/}
                    {/*                        </CodePanel>*/}
                    {/*                        <PreviewPanel>*/}
                    {/*                            <Text>*/}
                    {/*                                Ce texte est un paragraphe. Il est utilisé pour structurer les blocs de contenu dans une*/}
                    {/*                                page HTML.*/}
                    {/*                            </Text>*/}
                    {/*                        </PreviewPanel>*/}
                    {/*                    </CodeWithPreview>*/}
                </Stack>

                <Stack>
                    {/* Exemple de strong */}
                    <Text>
                        Texte important (strong)
                    </Text>
                    {/*<CodeWithPreview language="html">*/}
                    {/*    <CodePanel>*/}
                    {/*        {`<p>Attention : <strong>le mot de passe est obligatoire</strong> pour continuer.</p>`}*/}
                    {/*    </CodePanel>*/}
                    {/*    <PreviewPanel>*/}
                    {/*        <Text>*/}
                    {/*            Attention : <Strong>le mot de passe est obligatoire</Strong> pour continuer.*/}
                    {/*        </Text>*/}
                    {/*    </PreviewPanel>*/}
                    {/*</CodeWithPreview>*/}
                </Stack>

                <Stack>
                    {/* Exemple de em */}
                    <Text>
                        Texte accentué (em)
                    </Text>
                    {/*<CodeWithPreview language="html">*/}
                    {/*    <CodePanel>*/}
                    {/*        {`<p><em>Ce document est très important</em>, lisez-le attentivement.</p>`}*/}
                    {/*    </CodePanel>*/}
                    {/*    <PreviewPanel>*/}
                    {/*        <Text>*/}
                    {/*            <Em>Ce document est très important</Em>, lisez-le attentivement.*/}
                    {/*        </Text>*/}
                    {/*    </PreviewPanel>*/}
                    {/*</CodeWithPreview>*/}
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
                    {/*                    <CodeWithPreview language="html">*/}
                    {/*                        <CodePanel>*/}
                    {/*                            {`<ul>*/}
                    {/*  <li>HTML</li>*/}
                    {/*  <li>CSS</li>*/}
                    {/*  <li>JavaScript</li>*/}
                    {/*</ul>`}*/}
                    {/*                        </CodePanel>*/}
                    {/*                        <PreviewPanel>*/}
                    {/*                            <List.Root ml={4}>*/}
                    {/*                                <ListItem>HTML</ListItem>*/}
                    {/*                                <ListItem>CSS</ListItem>*/}
                    {/*                                <ListItem>JavaScript</ListItem>*/}
                    {/*                            </List>*/}
                    {/*                        </PreviewPanel>*/}
                    {/*                    </CodeWithPreview>*/}
                </Stack>
                <Stack>
                    {/* Exemple OL */}
                    <Text>
                        Liste ordonnée (ol)
                    </Text>
                    {/*                    <CodeWithPreview language="html">*/}
                    {/*                        <CodePanel>*/}
                    {/*                            {`<ol>*/}
                    {/*  <li>Préparer le projet</li>*/}
                    {/*  <li>Écrire le code</li>*/}
                    {/*  <li>Tester et publier</li>*/}
                    {/*</ol>`}*/}
                    {/*                        </CodePanel>*/}
                    {/*                        <PreviewPanel>*/}
                    {/*                            <List.Root as={"ol"} ml={4}>*/}
                    {/*                                <ListItem>Préparer le projet</ListItem>*/}
                    {/*                                <ListItem>Écrire le code</ListItem>*/}
                    {/*                                <ListItem>Tester et publier</ListItem>*/}
                    {/*                            </List>*/}
                    {/*                        </PreviewPanel>*/}
                    {/*                    </CodeWithPreview>*/}
                </Stack>
                <Stack>
                    {/* Exemple DL */}
                    <Text>
                        Liste de définition (dl)
                    </Text>
                    {/*                    <CodeWithPreview language="html">*/}
                    {/*                        <CodePanel>*/}
                    {/*                            {`<dl>*/}
                    {/*  <dt>HTML</dt>*/}
                    {/*  <dd>Langage de structure des pages web</dd>*/}
                    {/*  */}
                    {/*  <dt>CSS</dt>*/}
                    {/*  <dd>Langage de style</dd>*/}
                    {/*</dl>`}*/}
                    {/*                        </CodePanel>*/}
                    {/*                        <PreviewPanel>*/}
                    {/*                            <DataList.Root>*/}
                    {/*                                <DataListItemLabel>HTML</DataListItemLabel>*/}
                    {/*                                <DataListItemValue>Langage de structure des pages web</DataListItemValue>*/}
                    {/*                                <DataListItemLabel>CSS</DataListItemLabel>*/}
                    {/*                                <DataListItemValue>Langage de style</DataListItemValue>*/}
                    {/*                            </DataList.Root>*/}
                    {/*                        </PreviewPanel>*/}
                    {/*                    </CodeWithPreview>*/}
                </Stack>
                <Heading level={3}>Tableaux</Heading>
                <Text>
                    Les tableaux en HTML permettent d’afficher des données sous forme de lignes et colonnes.
                    On utilise les balises <Code>&lt;table&gt;</Code>, <Code>&lt;tr&gt;</Code> (ligne),
                    <Code>&lt;td&gt;</Code> (cellule) et <Code>&lt;th&gt;</Code> (cellule d’en-tête).
                </Text>

                {/*                <CodeWithPreview language="html">*/}
                {/*                    <CodePanel>*/}
                {/*                        {`<table>*/}
                {/*<thead>*/}
                {/*  <tr>*/}
                {/*    <th>Nom</th>*/}
                {/*    <th>Âge</th>*/}
                {/*  </tr>*/}
                {/* </thead> */}
                {/*  <tbody>*/}
                {/*      <tr>*/}
                {/*        <td>Alice</td>*/}
                {/*        <td>25</td>*/}
                {/*      </tr>*/}
                {/*      <tr>*/}
                {/*        <td>Bob</td>*/}
                {/*        <td>30</td>*/}
                {/*      </tr>*/}
                {/*  <tbody/>*/}
                {/*</table>`}*/}
                {/*                    </CodePanel>*/}
                {/*                    <PreviewPanel>*/}
                {/*                        <Table.Root size="sm" borderWidth="1px" rounded="md" showColumnBorder interactive>*/}
                {/*                            <Table.Header>*/}
                {/*                                <Table.Row bg="bg.subtle">*/}
                {/*                                    <Table.ColumnHeader>Nom</Table.ColumnHeader>*/}
                {/*                                    <Table.ColumnHeader>Âge</Table.ColumnHeader>*/}
                {/*                                </Table.Row>*/}
                {/*                            </Table.Header>*/}
                {/*                            <Table.Body>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell>Alice</Table.Cell>*/}
                {/*                                    <Table.Cell>25</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell>Bob</Table.Cell>*/}
                {/*                                    <Table.Cell>30</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                            </Table.Body>*/}
                {/*                        </Table.Root>*/}
                {/*                    </PreviewPanel>*/}
                {/*                </CodeWithPreview>*/}
                <Text>
                    Il est possible de définir un nombre de ligne ou de colonne occupé par une cellule :</Text>
                {/*                <CodeWithPreview language="html">*/}
                {/*                    <CodePanel>*/}
                {/*                        {`<table>*/}
                {/*  <thead>*/}
                {/*  <tr>*/}
                {/*    <th>Nom</th>*/}
                {/*    <th colspan="2">Contact</th>*/}
                {/*  </tr>*/}
                {/*  </thead>*/}
                {/*  <tbody>*/}
                {/*  <tr>*/}
                {/*    <td>Alice</td>*/}
                {/*    <td>Email</td>*/}
                {/*    <td>alice@mail.com</td>*/}
                {/*  </tr>*/}
                {/*  <tr>*/}
                {/*    <td rowspan="2">Bob</td>*/}
                {/*    <td>Email</td>*/}
                {/*    <td>bob@mail.com</td>*/}
                {/*  </tr>*/}
                {/*  <tr>*/}
                {/*    <td>Téléphone</td>*/}
                {/*    <td>06 12 34 56 78</td>*/}
                {/*  </tr>*/}
                {/*  </tbody>*/}
                {/*</table>`}*/}
                {/*                    </CodePanel>*/}
                {/*                    <PreviewPanel>*/}
                {/*                        <Table.Root size="sm" borderWidth="1px" rounded="md" showColumnBorder interactive>*/}
                {/*                            <Table.Header>*/}
                {/*                                <Table.Row bg="bg.subtle">*/}
                {/*                                    <Table.ColumnHeader>Nom</Table.ColumnHeader>*/}
                {/*                                    <Table.ColumnHeader colSpan={2}>Contact</Table.ColumnHeader>*/}
                {/*                                </Table.Row>*/}
                {/*                            </Table.Header>*/}
                {/*                            <Table.Body>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell>Alice</Table.Cell>*/}
                {/*                                    <Table.Cell>Email</Table.Cell>*/}
                {/*                                    <Table.Cell>alice@mail.com</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell rowSpan={2}>Bob</Table.Cell>*/}
                {/*                                    <Table.Cell>Email</Table.Cell>*/}
                {/*                                    <Table.Cell>bob@mail.com</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell>Téléphone</Table.Cell>*/}
                {/*                                    <Table.Cell>06 01 02 03 04</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                            </Table.Body>*/}
                {/*                        </Table.Root>*/}
                {/*                    </PreviewPanel>*/}
                {/*                </CodeWithPreview>*/}

                <Text>ou des en-tête sur chaque ligne :</Text>
                {/*                <CodeWithPreview language="html">*/}
                {/*                    <CodePanel>*/}
                {/*                        {`<table>*/}
                {/*  <thead>*/}
                {/*    <tr>*/}
                {/*      <th></th>*/}
                {/*      <th>Lundi</th>*/}
                {/*      <th>Mardi</th>*/}
                {/*    </tr>*/}
                {/*  </thead>*/}
                {/*  <tbody>*/}
                {/*    <tr>*/}
                {/*      <th scope="row">Matin</th>*/}
                {/*      <td>Maths</td>*/}
                {/*      <td>Français</td>*/}
                {/*    </tr>*/}
                {/*    <tr>*/}
                {/*      <th scope="row">Après-midi</th>*/}
                {/*      <td>Histoire</td>*/}
                {/*      <td>Sport</td>*/}
                {/*    </tr>*/}
                {/*  </tbody>*/}
                {/*</table>`}*/}
                {/*                    </CodePanel>*/}
                {/*                    <PreviewPanel>*/}
                {/*                        <Table.Root size="sm" borderWidth="1px" rounded="md" showColumnBorder interactive>*/}
                {/*                            <Table.Header>*/}
                {/*                                <Table.Row bg="bg.subtle">*/}
                {/*                                    <Table.ColumnHeader></Table.ColumnHeader>*/}
                {/*                                    <Table.ColumnHeader>Lundi</Table.ColumnHeader>*/}
                {/*                                    <Table.ColumnHeader>Mardi</Table.ColumnHeader>*/}
                {/*                                </Table.Row>*/}
                {/*                            </Table.Header>*/}
                {/*                            <Table.Body>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell scope="row" bg="bg.subtle">Matin</Table.Cell>*/}
                {/*                                    <Table.Cell>Maths</Table.Cell>*/}
                {/*                                    <Table.Cell>Français</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                                <Table.Row>*/}
                {/*                                    <Table.Cell scope="row" bg="bg.subtle">Après-midi</Table.Cell>*/}
                {/*                                    <Table.Cell>Histoire</Table.Cell>*/}
                {/*                                    <Table.Cell>Sport</Table.Cell>*/}
                {/*                                </Table.Row>*/}
                {/*                            </Table.Body>*/}
                {/*                        </Table.Root>*/}
                {/*                    </PreviewPanel>*/}
                {/*                </CodeWithPreview>*/}
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
                            inputElement={<Link color="teal.500" href="/contact.html">Page Contact</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers un autre site"
                            description='L’attribut `href` pointe vers un domaine différent.'
                            code={`<a href="https://www.example.com">Visiter example.com</a>`}
                            inputElement={<Link color="teal.500" href="https://www.example.com">Visiter
                                example.com</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers une ancre interne"
                            description='L’attribut `href="#id"` fait défiler la page jusqu’à l’élément correspondant à l’ID.'
                            code={`<a href="#lien">\n    Aller à la section "Lien"\n</a>`}
                            inputElement={<Link color="teal.500" href="#lien">Aller à la
                                section &quot;Lien&quot;</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien dans un nouvel onglet"
                            description='L’attribut `target="_blank"` ouvre le lien dans un nouvel onglet du navigateur.'
                            code={`<a href="https://www.example.com" target="_blank">\n    Ouvrir dans un nouvel onglet\n</a>`}
                            inputElement={
                                <Link color="teal.500" href="https://www.example.com" target="_blank"
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
                            inputElement={<Link color="teal.500" href="mailto:contact@monsite.com">Envoyer un
                                e-mail</Link>}
                        />
                    </div>

                    <div>
                        <CardInput
                            title="Lien vers un numéro de téléphone"
                            description='Le préfixe `tel:` ouvre l’application téléphonique sur mobile ou logiciel compatible.'
                            code={`<a href="tel:+33123456789">Appeler le 01 23 45 67 89</a>`}
                            inputElement={<Link color="teal.500" href="tel:+33123456789">Appeler le 01 23 45 67
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
                {/*<CodeWithPreview language="html">*/}
                {/*    <CodePanel>{`<img src="https://picsum.photos/300/200" alt="Exemple d'image" />`}</CodePanel>*/}
                {/*    <PreviewPanel>*/}
                {/*        <Image src="https://picsum.photos/300/200" alt="Exemple d'image"/>*/}
                {/*    </PreviewPanel>*/}
                {/*</CodeWithPreview>*/}
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

                {/*                <CodeWithPreview language="html">*/}
                {/*                    <CodePanel>{`<audio controls>*/}
                {/*  <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg" />*/}
                {/*  Votre navigateur ne supporte pas l'audio.*/}
                {/*</audio>`}</CodePanel>*/}
                {/*                    <PreviewPanel>*/}
                {/*                        <audio controls>*/}
                {/*                            <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg"/>*/}
                {/*                            Votre navigateur ne supporte pas l&apos;audio.*/}
                {/*                        </audio>*/}
                {/*                    </PreviewPanel>*/}
                {/*                </CodeWithPreview>*/}

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

                {/*                <CodeWithPreview language="html">*/}
                {/*                    <CodePanel>{`<video width="320" height="240" controls>*/}
                {/*  <source src="https://www.w3schools.com/html/movie.mp4" type="video/mp4" />*/}
                {/*  Votre navigateur ne supporte pas la vidéo.*/}
                {/*</video>`}</CodePanel>*/}
                {/*                    <PreviewPanel>*/}
                {/*                        <video width="320" height="240" controls>*/}
                {/*                            <source src="https://www.w3schools.com/html/movie.mp4" type="video/mp4"/>*/}
                {/*                            Votre navigateur ne supporte pas la vidéo.*/}
                {/*                        </video>*/}
                {/*                    </PreviewPanel>*/}
                {/*                </CodeWithPreview>*/}

                <Text>
                    Tu peux aussi ajouter des options comme <Code>autoplay</Code>, <Code>loop</Code>,
                    ou <Code>muted</Code> selon les besoins.
                </Text>
            </Box>
        </section>
    );
}