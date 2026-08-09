'use client'
import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Code from "@/components/ui/Code";
import Link from "next/link";
import Image from "next/image";

export default function Cours() {

    return (
        <article>
            <section>
                {/* Introduction */}
                <p className="text-lg mb-8">
                    HTML5 est la version actuelle du langage de balisage qui structure le contenu des pages web.
                </p>
            </section>
            <section>
                {/* Structure de base */}
                <Heading level={2}>A/ Structure de base d&apos;une page HTML5</Heading>
                <p>
                    Chaque page HTML5 commence par la ligne <Code>{"<!DOCTYPE html>"}</Code>.
                    Elle indique au navigateur : « Ceci est une page moderne en HTML5 ».
                </p>

                <p>Ensuite, une page HTML5 est organisée en 3 grandes parties :</p>
                <List>
                    <ListItem><strong>DOCTYPE</strong> : le type de document</ListItem>
                    <ListItem><strong>HEAD</strong> : les infos invisibles (titre, styles, scripts)</ListItem>
                    <ListItem><strong>BODY</strong> : le contenu visible de la page</ListItem>
                </List>

                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma première page HTML5</title>
</head>
<body>
    <header>
        <h1>Mon Site Web</h1>
        <nav>
            <ul>
                <li><a href="#accueil">Accueil</a></li>
                <li><a href="#apropos">À propos</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article>
            <h2>Article principal</h2>
            <p>Voici le contenu principal de ma page.</p>
        </article>
        <aside>
            <h3>Barre latérale</h3>
            <p>Contenu connexe ou publicité</p>
        </aside>
    </main>

    <footer>
        <p>&copy; 2024 Mon Site. Tous droits réservés.</p>
    </footer>
</body>
</html>`}
                    </CodePanel>
                    <PreviewPanel>
                        <div style={{fontFamily: 'Arial, sans-serif'}}>
                            <header style={{background: '#f0f0f0', padding: '10px'}}>
                                <h1>Mon Site Web</h1>
                                <nav>
                                    <ul style={{listStyle: 'none', padding: 0}}>
                                        <li style={{display: 'inline', marginRight: '10px'}}><a
                                            href="#accueil">Accueil</a></li>
                                        <li style={{display: 'inline', marginRight: '10px'}}><a href="#apropos">À
                                            propos</a></li>
                                        <li style={{display: 'inline', marginRight: '10px'}}><a
                                            href="#contact">Contact</a></li>
                                    </ul>
                                </nav>
                            </header>

                            <main style={{margin: '20px 0'}}>
                                <article>
                                    <h2>Article principal</h2>
                                    <p>Voici le contenu principal de ma page.</p>
                                </article>
                                <aside style={{background: '#e0e0e0', padding: '10px', margin: '10px 0'}}>
                                    <h3>Barre latérale</h3>
                                    <p>Contenu connexe ou publicité</p>
                                </aside>
                            </main>

                            <footer style={{background: '#d0d0d0', padding: '10px', textAlign: 'center'}}>
                                <p>&copy; 2024 Mon Site. Tous droits réservés.</p>
                            </footer>
                        </div>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <p><strong>À retenir :</strong></p>
                <List>
                    <ListItem><Code>{`lang="fr"`}</Code> : indique la langue (utile pour accessibilité & SEO)</ListItem>
                    <ListItem><Code>{`charset="UTF-8"`}</Code> : gère accents et caractères spéciaux</ListItem>
                    <ListItem><Code>viewport</Code> : rend la page adaptée aux mobiles</ListItem>
                    <ListItem>Les balises sémantiques (<Code>&lt;header&gt;</Code>, <Code>&lt;main&gt;</Code>…)
                        structurent la page de façon logique</ListItem>
                </List>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Balise</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Exemple</TableHead>
                            <TableHead>Obligatoire ?</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>{"<header>"}</Code></TableCell>
                            <TableCell>En-tête</TableCell>
                            <TableCell>Logo, menu, titre</TableCell>
                            <TableCell>Non</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<nav>"}</Code></TableCell>
                            <TableCell>Menu</TableCell>
                            <TableCell>Navigation principale</TableCell>
                            <TableCell>Non</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<main>"}</Code></TableCell>
                            <TableCell>Contenu central</TableCell>
                            <TableCell>Texte, articles</TableCell>
                            <TableCell>Recommandé</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<article>"}</Code></TableCell>
                            <TableCell>Contenu autonome</TableCell>
                            <TableCell>Article de blog</TableCell>
                            <TableCell>Non</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<section>"}</Code></TableCell>
                            <TableCell>Section thématique</TableCell>
                            <TableCell>Chapitre</TableCell>
                            <TableCell>Non</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<aside>"}</Code></TableCell>
                            <TableCell>Contenu annexe</TableCell>
                            <TableCell>Sidebar, pub</TableCell>
                            <TableCell>Non</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<footer>"}</Code></TableCell>
                            <TableCell>Pied de page</TableCell>
                            <TableCell>Mentions légales</TableCell>
                            <TableCell>Non</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            <section>
                <Heading level={2}>B/ Typographie - Balises de texte</Heading>
                <p>
                    Le texte en HTML ne sert pas seulement à afficher des mots.
                    Il aide aussi à donner du sens et à organiser l’information.
                    On utilise surtout des balises <strong>sémantiques</strong>.
                </p>

                <Heading level={3}>1. Hiérarchie des titres</Heading>
                <p>
                    Les balises <Code>h1</Code> à <Code>h6</Code> créent une hiérarchie.
                    Règles simples :
                </p>
                <List>
                    <ListItem>Un seul <Code>h1</Code> par page</ListItem>
                    <ListItem><Code>h2</Code> pour les sections, <Code>h3</Code> pour les sous-sections,
                        etc.</ListItem>
                    <ListItem>Ne sautez pas de niveau.</ListItem>
                </List>


                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<h1>Titre principal (h1) - 1 seul par page</h1>
<h2>Section principale (h2)</h2>
<h3>Sous-section (h3)</h3>
<h4>Sous-partie (h4)</h4>
<h5>Titre mineur (h5)</h5>
<h6>Le plus petit titre (h6)</h6>`}
                    </CodePanel>
                    <PreviewPanel>
                        <h1>Titre principal (h1) - 1 seul par page</h1>
                        <h2>Section principale (h2)</h2>
                        <h3>Sous-section (h3)</h3>
                        <h4>Sous-partie (h4)</h4>
                        <h5>Titre mineur (h5)</h5>
                        <h6>Le plus petit titre (h6)</h6>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>2. Formatage sémantique</Heading>
                <p>
                    Ces balises ajoutent du <strong>sens</strong> au texte.
                    Elles aident l’accessibilité, le SEO et garantissent un style cohérent.
                </p>

                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<p><strong>Important</strong> et <em>emphase</em>.</p>
<p><mark>Texte surligné</mark> et <small>texte secondaire</small>.</p>

<p><code>console.log("Hello")</code> → Code</p>
<p><kbd>Ctrl+C</kbd> → Saisie clavier</p>
<p>H<sub>2</sub>O et E=mc<sup>2</sup></p>

<p><abbr title="HyperText Markup Language">HTML</abbr> est le langage du web.</p>`}
                    </CodePanel>
                    <PreviewPanel>
                        <p><strong>Important</strong> et <em>emphase</em>.</p>
                        <p>
                            <mark>Texte surligné</mark>
                            et <small>texte secondaire</small>.
                        </p>
                        <p><code>{`console.log("Hello")`}</code> → Code</p>
                        <p><kbd>Ctrl+C</kbd> → Saisie clavier</p>
                        <p>H<sub>2</sub>O et E=mc<sup>2</sup></p>
                        <p><abbr title="HyperText Markup Language">HTML</abbr> est le langage du web.</p>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <p><strong>Pourquoi privilégier ces balises ?</strong></p>
                <List>
                    <ListItem>✅ <strong>Accessibilité</strong> : compréhensible pour les lecteurs d’écran</ListItem>
                    <ListItem>✅ <strong>SEO</strong> : meilleure indexation</ListItem>
                    <ListItem>✅ <strong>Maintenance</strong> : style modifiable via CSS</ListItem>
                    <ListItem>✅ <strong>Cohérence</strong> : rendu uniforme</ListItem>
                </List>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Balise</TableHead>
                            <TableHead>Signification</TableHead>
                            <TableHead>Visuel</TableHead>
                            <TableHead>Exemple</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>{"<strong>"}</Code></TableCell>
                            <TableCell>Importance</TableCell>
                            <TableCell><strong>Gras</strong></TableCell>
                            <TableCell>Mots-clés, avertissements</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<em>"}</Code></TableCell>
                            <TableCell>Emphase</TableCell>
                            <TableCell><em>Italique</em></TableCell>
                            <TableCell>Nuance, insistance</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<mark>"}</Code></TableCell>
                            <TableCell>Mise en évidence</TableCell>
                            <TableCell>Surligné</TableCell>
                            <TableCell>Résultats de recherche, points clés</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<code>"}</Code></TableCell>
                            <TableCell>Code informatique</TableCell>
                            <TableCell>Police monospace</TableCell>
                            <TableCell>Extraits de code</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>3. Citations & Références</Heading>
                <p>
                    Pour les citations, références et contacts, HTML propose des balises spécifiques.
                </p>

                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<p>Einstein : <q>L'imagination est plus importante que le savoir.</q></p>

<blockquote>
  <p>Le web est fait par des personnes, pour des personnes.</p>
  <footer>— <cite>Tim Berners-Lee</cite></footer>
</blockquote>

<p>Dans <cite>Le Petit Prince</cite> de Saint-Exupéry...</p>

<address>
  <strong>Entreprise XYZ</strong><br>
  123 Rue de la Paix, Paris<br>
  Tél : <a href="tel:+33123456789">01 23 45 67 89</a>
</address>`}
                    </CodePanel>
                    <PreviewPanel>
                        <p>Einstein : <q>L&apos;imagination est plus importante que le savoir.</q></p>
                        <blockquote style={{borderLeft: '4px solid #ccc', paddingLeft: '10px', background: '#f9f9f9'}}>
                            <p>Le web est fait par des personnes, pour des personnes.</p>
                            <footer>— <cite>Tim Berners-Lee</cite></footer>
                        </blockquote>
                        <p>Dans <cite>Le Petit Prince</cite> de Saint-Exupéry...</p>
                        <address style={{background: '#f0f0f0', padding: '10px', borderRadius: '5px'}}>
                            <strong>Entreprise XYZ</strong><br/>
                            123 Rue de la Paix, Paris<br/>
                            Tél : <a href="tel:+33123456789">01 23 45 67 89</a>
                        </address>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}
            </section>
            <section>
                <Heading level={2}>C/ Listes</Heading>
                <p>
                    Les listes en HTML permettent d’organiser des informations de manière
                    hiérarchique et lisible. Elles sont essentielles pour la navigation,
                    les instructions, les définitions ou encore les glossaires.
                </p>

                <Heading level={3}>1. Liste non ordonnée (&lt;ul&gt;)</Heading>
                <p>
                    Utilisée quand l’ordre des éléments n’a pas d’importance. Chaque élément
                    est introduit par une puce.
                </p>

                {/* <CodeWithPreviewCard language="html">
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
                </CodeWithPreviewCard> */}

                <Heading level={3}>2. Liste ordonnée (&lt;ol&gt;)</Heading>
                <p>
                    Utilisée quand l’ordre compte (étapes, classement, instructions).
                    Les éléments sont numérotés automatiquement.
                </p>

                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<ol>
  <li>Préparer les ingrédients</li>
  <li>Préchauffer le four</li>
  <li>Cuire pendant 20 minutes</li>
</ol>`}
                    </CodePanel>
                    <PreviewPanel>
                        <List ordered>
                            <ListItem>Préparer les ingrédients</ListItem>
                            <ListItem>Préchauffer le four</ListItem>
                            <ListItem>Cuire pendant 20 minutes</ListItem>
                        </List>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>3. Liste de définitions (&lt;dl&gt;)</Heading>
                <p>
                    Utilisée pour associer un terme à sa définition (glossaire, FAQ,
                    dictionnaire).
                </p>

                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<dl>
  <dt>HTML</dt>
  <dd>Langage de balisage utilisé pour structurer une page web.</dd>

  <dt>CSS</dt>
  <dd>Langage de styles utilisé pour la présentation visuelle.</dd>

  <dt>JavaScript</dt>
  <dd>Langage de programmation qui rend une page interactive.</dd>
</dl>`}
                    </CodePanel>
                    <PreviewPanel>
                        <dl>
                            <dt>HTML</dt>
                            <dd>Langage de balisage utilisé pour structurer une page web.</dd>
                            <dt>CSS</dt>
                            <dd>Langage de styles utilisé pour la présentation visuelle.</dd>
                            <dt>JavaScript</dt>
                            <dd>Langage de programmation qui rend une page interactive.</dd>
                        </dl>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>4. Listes imbriquées</Heading>
                <p>
                    Les listes peuvent être imbriquées pour représenter une hiérarchie plus complexe.
                </p>

                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<ul>
  <li>Frontend
    <ul>
      <li>HTML</li>
      <li>CSS</li>
      <li>JavaScript</li>
    </ul>
  </li>
  <li>Backend
    <ul>
      <li>Node.js</li>
      <li>Python</li>
      <li>PHP</li>
    </ul>
  </li>
</ul>`}
                    </CodePanel>
                    <PreviewPanel>
                        <List>
                            <ListItem>Frontend
                                <List>
                                    <ListItem>HTML</ListItem>
                                    <ListItem>CSS</ListItem>
                                    <ListItem>JavaScript</ListItem>
                                </List>
                            </ListItem>
                            <ListItem>Backend
                                <List>
                                    <ListItem>Node.js</ListItem>
                                    <ListItem>Python</ListItem>
                                    <ListItem>PHP</ListItem>
                                </List>
                            </ListItem>
                        </List>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>5. Cas pratiques</Heading>
                <List>
                    <ListItem><strong>Menu de navigation</strong> → liste non ordonnée (&lt;ul&gt;)</ListItem>
                    <ListItem><strong>Procédure / tutoriel</strong> → liste ordonnée (&lt;ol&gt;)</ListItem>
                    <ListItem><strong>Glossaire ou FAQ</strong> → liste de définitions (&lt;dl&gt;)</ListItem>
                    <ListItem><strong>Plan hiérarchisé</strong> → listes imbriquées (&lt;ul&gt; / &lt;ol&gt;)</ListItem>
                </List>

                <Heading level={3}>6. Tableau récapitulatif</Heading>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Balise</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Exemple typique</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>{"<ul>"}</Code></TableCell>
                            <TableCell>Liste non ordonnée</TableCell>
                            <TableCell>Éléments sans ordre</TableCell>
                            <TableCell>Menu de navigation</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<ol>"}</Code></TableCell>
                            <TableCell>Liste ordonnée</TableCell>
                            <TableCell>Éléments ordonnés</TableCell>
                            <TableCell>Recette, tutoriel</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>{"<dl>"}</Code></TableCell>
                            <TableCell>Liste de définitions</TableCell>
                            <TableCell>Terme + définition</TableCell>
                            <TableCell>Glossaire, FAQ</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            <section>
                {/* Tableaux */}
                <Heading level={2}>D/ Tableaux - Présentation de données structurées</Heading>
                <p>
                    Les tableaux HTML sont conçus pour présenter des <strong>données tabulaires</strong> -
                    pas pour la mise en page ! Ils sont utiles pour afficher des comparaisons, statistiques ou listes
                    structurées.
                </p>

                <Heading level={3}>1. Tableau simple</Heading>
                <p>Un tableau basique avec un en-tête et quelques lignes.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
    <thead>
        <tr>
            <th scope="col">Nom</th>
            <th scope="col">Âge</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Alice</th>
            <td>25</td>
        </tr>
        <tr>
            <th scope="row">Bob</th>
            <td>30</td>
        </tr>
    </tbody>
</table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <table className={"w-full"}>
                            <thead>
                            <tr>
                                <th scope="col">Nom</th>
                                <th scope="col">Âge</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th scope="row">Alice</th>
                                <td>25</td>
                            </tr>
                            <tr>
                                <th scope="row">Bob</th>
                                <td>30</td>
                            </tr>
                            </tbody>
                        </table>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>2. Tableau avec <Code>colspan</Code></Heading>
                <p>Fusion de plusieurs colonnes pour une information combinée.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
    <thead>
        <tr>
            <th scope="col">Nom</th>
            <th scope="col">Langues connues</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Alice</th>
            <td colspan="3">Français, Anglais, Espagnol</td>
        </tr>
        <tr>
            <th scope="row">Bob</th>
            <td>Français</td>
        </tr>
    </tbody>
</table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <table className={"w-full"}>
                            <thead>
                            <tr>
                                <th scope="col">Nom</th>
                                <th scope="col">Langues connues</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th scope="row">Alice</th>
                                <td colSpan={3}>Français, Anglais, Espagnol</td>
                            </tr>
                            <tr>
                                <th scope="row">Bob</th>
                                <td>Français</td>
                            </tr>
                            </tbody>
                        </table>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>3. Tableau avec <Code>rowspan</Code></Heading>
                <p>Fusion de plusieurs lignes pour indiquer un regroupement vertical.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
    <thead>
        <tr>
            <th scope="col">Jour</th>
            <th scope="col">Cours</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row" rowspan="2">Lundi</th>
            <td>Mathématiques</td>
        </tr>
        <tr>
            <td>Physique</td>
        </tr>
        <tr>
            <th scope="row">Mardi</th>
            <td>Français</td>
        </tr>
    </tbody>
</table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <table className={"w-full text-center"}>
                            <thead>
                            <tr className="border-b border-gray-200">
                                <th scope="col">Jour</th>
                                <th scope="col">Cours</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-b border-gray-200">
                                <th scope="row" rowSpan={2}>Lundi</th>
                                <td>Mathématiques</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td>Physique</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th scope="row">Mardi</th>
                                <td>Français</td>
                            </tr>
                            </tbody>
                        </table>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>4. Tableau combinant <Code>rowspan</Code> et <Code>colspan</Code></Heading>
                <p>Un tableau plus complexe avec fusion de colonnes et lignes.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table>
    <thead>
        <tr>
            <th rowspan="2">Membre</th>
            <th colspan="3">Contact</th>
            <th rowspan="2">Rôle</th>
        </tr>
        <tr>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Bureau</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">Alice</th>
            <td>alice@exemple.com</td>
            <td>01 23 45 67 89</td>
            <td>A-101</td>
            <td>Chef de projet</td>
        </tr>
        <tr>
            <th scope="row">Bob</th>
            <td>bob@exemple.com</td>
            <td>01 23 45 67 90</td>
            <td>A-102</td>
            <td>Développeur</td>
        </tr>
    </tbody>
</table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <table className={'w-full text-center'}>
                            <thead>
                            <tr className="border-b border-gray-200">
                                <th rowSpan={2}>Membre</th>
                                <th colSpan={3}>Contact</th>
                                <th rowSpan={2}>Rôle</th>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Bureau</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-b border-gray-200">
                                <th scope="row">Alice</th>
                                <td>alice@exemple.com</td>
                                <td>01 23 45 67 89</td>
                                <td>A-101</td>
                                <td>Chef de projet</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th scope="row">Bob</th>
                                <td>bob@exemple.com</td>
                                <td>01 23 45 67 90</td>
                                <td>A-102</td>
                                <td>Développeur</td>
                            </tr>
                            </tbody>
                        </table>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Heading level={3}>5. Tableau avec en-tête et pied de tableau</Heading>
                <p>Structure complète
                    avec <Code>&lt;thead&gt;</Code>, <Code>&lt;tbody&gt;</Code> et <Code>&lt;tfoot&gt;</Code>.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<table
    <caption>Résultats trimestriels 2024 (en euros HT)</caption>
    <thead>
        <tr>
            <th scope="col">Période</th>
            <th scope="col">Chiffre d'affaires</th>
            <th scope="col">Charges</th>
            <th scope="col">Bénéfice net</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">T1 2024</th>
            <td>150 000</td>
            <td>100 000</td>
            <td>50 000</td>
        </tr>
        <tr>
            <th scope="row">T2 2024</th>
            <td>180 000</td>
            <td>120 000</td>
            <td>60 000</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <th scope="row">TOTAL</th>
            <td>330 000</td>
            <td>220 000</td>
            <td>110 000</td>
        </tr>
    </tfoot>
</table>`}
                    </CodePanel>
                    <PreviewPanel>
                        <table className={'w-full text-center'}>
                            <caption>Résultats trimestriels 2024 (en euros HT)</caption>
                            <thead>
                            <tr className={'border-b border-gray-200'}>
                                <th scope="col">Période</th>
                                <th scope="col">Chiffre d&apos;affaires</th>
                                <th scope="col">Charges</th>
                                <th scope="col">Bénéfice net</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th scope="row">T1 2024</th>
                                <td>150 000</td>
                                <td>100 000</td>
                                <td>50 000</td>
                            </tr>
                            <tr>
                                <th scope="row">T2 2024</th>
                                <td>180 000</td>
                                <td>120 000</td>
                                <td>60 000</td>
                            </tr>
                            </tbody>
                            <tfoot>
                            <tr>
                                <th scope="row">TOTAL</th>
                                <td>330 000</td>
                                <td>220 000</td>
                                <td>110 000</td>
                            </tr>
                            </tfoot>
                        </table>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}
            </section>
            <section>
                <Heading level={2}>E/ Liens - Navigation et interconnexion</Heading>
                <p>
                    Les liens sont l&apos;essence du web : ils connectent les pages entre elles et permettent la
                    navigation. HTML offre de nombreuses possibilités au-delà du simple lien vers une autre page.
                </p>

                <Heading level={3}>1. Types de liens essentiels</Heading>
                <p>
                    Chaque type de lien a sa spécificité et ses bonnes pratiques. La sécurité et l&apos;accessibilité
                    sont cruciales, surtout pour les liens externes.
                </p>

                {/* 1. Liens externes */}
                <Heading level={4}>Liens externes</Heading>
                <p>Les liens vers d&apos;autres sites doivent souvent s&apos;ouvrir dans un nouvel onglet avec des
                    attributs de sécurité.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<p>Consultez la documentation officielle sur 
<a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">
    MDN Web Docs
</a></p>`}
                    </CodePanel>
                    <PreviewPanel>
                        <p>Consultez la documentation officielle sur&nbsp;
                            <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer">
                                MDN Web Docs
                            </a></p>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* 2. Liens internes */}
                <Heading level={4}>Liens internes</Heading>
                <p>Navigation entre les pages d&apos;un même site.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<nav>
    <ul>
        <li><a href="/accueil.html">Retour à l&apos;accueil</a></li>
        <li><a href="../tutoriels/css.html">Guide CSS</a></li>
        <li><a href="./exemples/formulaires.html">Exemples de formulaires</a></li>
    </ul>
</nav>`}
                    </CodePanel>
                    <PreviewPanel>
                        <nav>
                            <ul>
                                <li><a href="/accueil.html">Retour à l&apos;accueil</a></li>
                                <li><a href="../tutoriels/css.html">Guide CSS</a></li>
                                <li><a href="./exemples/formulaires.html">Exemples de formulaires</a></li>
                            </ul>
                        </nav>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* 3. Ancres vers sections */}
                <Heading level={4}>Ancres et navigation interne sur la même page</Heading>
                <p>Permettent d’accéder directement à une section spécifique.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<nav aria-label="Table des matières">
    <ol>
        <li><a href="#introduction">Introduction</a></li>
        <li><a href="#methodes">Méthodes de développement</a></li>
        <li><a href="#conclusion">Conclusion</a></li>
    </ol>
</nav>`}
                    </CodePanel>
                    <PreviewPanel>
                        <nav aria-label="Table des matières">
                            <ol>
                                <li><a href="#introduction">Introduction</a></li>
                                <li><a href="#methodes">Méthodes de développement</a></li>
                                <li><a href="#conclusion">Conclusion</a></li>
                            </ol>
                        </nav>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* 4. Liens de contact */}
                <Heading level={4}>Liens de contact intelligents</Heading>
                <p>Utiliser mailto, tel ou sms pour faciliter la prise de contact.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`
    <p>📧 <a href="mailto:contact@monsite.com?subject=Demande d'information&body=Bonjour,%0A%0AJe souhaite obtenir des informations sur...">
        Envoyer un email
    </a></p>
    
    <p>📞 <a href="tel:+33123456789">Appeler au 01 23 45 67 89</a></p>
    
    <p>💬 <a href="sms:+33123456789?body=Bonjour, je souhaite des informations">
        Envoyer un SMS
    </a></p>`}
                    </CodePanel>
                    <PreviewPanel>
                        <div>
                            <p>📧 <a
                                href="mailto:contact@monsite.com?subject=Demande d'information&body=Bonjour,%0A%0AJe souhaite obtenir des informations sur...">
                                Envoyer un email
                            </a></p>

                            <p>📞 <a href="tel:+33123456789">Appeler au 01 23 45 67 89</a></p>

                            <p>💬 <a href="sms:+33123456789?body=Bonjour, je souhaite des informations">
                                Envoyer un SMS
                            </a></p>
                        </div>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* 5. Liens de téléchargement */}
                <Heading level={4}>Liens de téléchargement</Heading>
                <p>Permettent de télécharger des fichiers directement depuis le site.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<ul>
    <li><a href="guide-html.pdf" download="guide-complet-html5.pdf">
        📄 Guide HTML5 (PDF, 2.5 MB)
    </a></li>
    <li><a href="template.zip" download>
        📦 Template de base (ZIP, 500 KB)
    </a></li>
</ul>`}
                    </CodePanel>
                    <PreviewPanel>
                        <List>
                            <ListItem><a href="guide-html.pdf" download="guide-complet-html5.pdf">
                                📄 Guide HTML5 (PDF, 2.5 MB)
                            </a></ListItem>
                            <ListItem><a href="template.zip" download>
                                📦 Template de base (ZIP, 500 KB)
                            </a></ListItem>
                        </List>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Attribut</TableHead>
                            <TableHead>Valeurs</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Exemple concret</TableHead>
                            <TableHead>Impact SEO</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>target</Code></TableCell>
                            <TableCell>_blank, _self, _parent</TableCell>
                            <TableCell>Contrôle l&apos;ouverture</TableCell>
                            <TableCell>Liens externes vers documentation</TableCell>
                            <TableCell>Neutre</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>rel</Code></TableCell>
                            <TableCell>noopener, noreferrer, nofollow</TableCell>
                            <TableCell>Sécurité et référencement</TableCell>
                            <TableCell>Liens vers réseaux sociaux</TableCell>
                            <TableCell>✅ Important</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>download</Code></TableCell>
                            <TableCell>Nom du fichier ou booléen</TableCell>
                            <TableCell>Force le téléchargement</TableCell>
                            <TableCell>PDF, images, archives</TableCell>
                            <TableCell>Neutre</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>aria-current</Code></TableCell>
                            <TableCell>page, location, step</TableCell>
                            <TableCell>Indique l&apos;élément actuel</TableCell>
                            <TableCell>Page active du menu</TableCell>
                            <TableCell>Accessibilité</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
            <section>
                <Heading level={2}> F/ Images et médias - Contenu riche et accessible</Heading>
                <p>
                    Les médias enrichissent l&apos;expérience utilisateur, mais ils doivent être optimisés pour la
                    performance et l&apos;accessibilité. HTML5 offre des solutions avancées pour gérer différents
                    formats et
                    tailles d&apos;écran.
                </p>

                {/* Exemple 1 : Image avec description */}
                <Heading level={3}>1. Image avec description</Heading>
                <p>Texte alternatif pour l&apos;accessibilité et utilisation
                    de <code>&lt;figure&gt;</code> et <code>&lt;figcaption&gt;</code>.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<figure>
  <img src="https://placehold.co/400x300/007bff/ffffff?text=Graphique+Ventes" 
       alt="Graphique en barres montrant l'évolution des ventes trimestrielles 2024"
       style="max-width:100%; height:auto; border-radius:8px;">
  <figcaption>
      <strong>Figure 1 :</strong> Évolution des ventes par trimestre
  </figcaption>
</figure>`}
                    </CodePanel>
                    <PreviewPanel>
                        <figure style={{textAlign: 'center', margin: '20px 0'}}>
                            <Image src="https://placehold.co/400x300/007bff/ffffff?text=Graphique+Ventes"
                                   alt="Graphique en barres montrant l'évolution des ventes trimestrielles 2024"
                                   style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}}
                                   width={400} height={300}
                                   unoptimized
                            />
                            <figcaption style={{marginTop: '10px', fontStyle: 'italic', color: '#6c757d'}}>
                                <strong>Figure 1 :</strong> Évolution des ventes par trimestre
                            </figcaption>
                        </figure>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 2 : Image avec chargement différé */}
                <Heading level={3}>2. Image avec chargement différé</Heading>
                <p>Améliore la performance en retardant le chargement des images lourdes
                    (<code>{`loading="lazy"`}</code>).
                </p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<img src="https://placehold.co/600x400/28a745/ffffff?text=Image+Lourde" 
     alt="Démonstration d'image avec chargement différé"
     loading="lazy"
     style="width:100%; max-width:600px; height:auto; border-radius:8px;">`}
                    </CodePanel>
                    <PreviewPanel>
                        <Image src="https://placehold.co/600x400/28a745/ffffff?text=Image+Lourde"
                               alt="Démonstration d'image avec chargement différé"
                               loading="lazy"
                               style={{width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '8px'}}
                               width={400} height={300}
                               unoptimized
                        />
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 3 : Images décoratives */}
                <Heading level={3}>3. Images décoratives</Heading>
                <p>Ignorées par les lecteurs d&apos;écran
                    (<Code>{`alt=""`}</Code> et <Code>{`role="presentation"`}</Code>).</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<img src="https://placehold.co/80x80/ffc107/000000?text=1" alt="" role="presentation" style="border-radius:50%;">
<img src="https://placehold.co/80x80/dc3545/ffffff?text=2" alt="" role="presentation" style="border-radius:50%;">
<img src="https://placehold.co/80x80/20c997/ffffff?text=3" alt="" role="presentation" style="border-radius:50%;">`}
                    </CodePanel>
                    <PreviewPanel>
                        <div style={{display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0'}}>
                            <Image src="https://placehold.co/80x80/ffc107/000000?text=1" alt="" role="presentation"
                                   style={{borderRadius: '50%'}} width={400} height={300} unoptimized/>
                            <Image src="https://placehold.co/80x80/dc3545/ffffff?text=2" alt="" role="presentation"
                                   style={{borderRadius: '50%'}} width={400} height={300} unoptimized/>
                            <Image src="https://placehold.co/80x80/20c997/ffffff?text=3" alt="" role="presentation"
                                   style={{borderRadius: '50%'}} width={400} height={300} unoptimized/>
                        </div>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 4 : Image avec dimensions explicites */}
                <Heading level={3}>4. Image avec dimensions explicites</Heading>
                <p>Évite le décalage de mise en page (layout shift) en fixant largeur et hauteur.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<img src="https://placehold.co/300x200/6f42c1/ffffff?text=Logo+Entreprise"
     alt="Logo de l'entreprise - retour à l'accueil"
     width="300" height="200"
     style="display:block; margin:0 auto; border-radius:8px;">`}
                    </CodePanel>
                    <PreviewPanel>
                        <Image src="https://placehold.co/300x200/6f42c1/ffffff?text=Logo+Entreprise"
                               alt="Logo de l'entreprise - retour à l'accueil"
                               width="300" height="200"
                               style={{display: 'block', margin: '0 auto', borderRadius: '8px'}} unoptimized/>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 5 : Images adaptées à la densité de pixels */}
                <Heading level={3}>5. Images adaptées à la densité de pixels</Heading>
                <p>Utilisation de <code>srcSet</code> pour Retina et écrans HiDPI.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<img src="https://placehold.co/200x150/fd7e14/ffffff?text=Standard"
     srcset="https://placehold.co/200x150/fd7e14/ffffff?text=1x 1x,
             https://placehold.co/400x300/fd7e14/ffffff?text=2x 2x,
             https://placehold.co/600x450/fd7e14/ffffff?text=3x 3x"
     alt="Image adaptée à la densité de pixels de l'écran"
     style="max-width:200px; height:auto; border-radius:8px;">`}
                    </CodePanel>
                    <PreviewPanel>
                        <div style={{textAlign: 'center', margin: '20px 0'}}>
                            <picture>
                                <img src="https://placehold.co/200x150/fd7e14/ffffff?text=Standard"
                                     srcSet="https://placehold.co/200x150/fd7e14/ffffff?text=1x 1x,
                         https://placehold.co/400x300/fd7e14/ffffff?text=2x 2x,
                         https://placehold.co/600x450/fd7e14/ffffff?text=3x 3x"
                                     alt="Image adaptée à la densité de pixels de l'écran"
                                     style={{maxWidth: '200px', height: 'auto', borderRadius: '8px'}}/>
                            </picture>
                        </div>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 6 : Images responsives avec <picture> */}
                <Heading level={3}>6. Images responsives avec &lt;picture&gt;</Heading>
                <p>
                    Utilisation de <code>&lt;picture&gt;</code> pour servir des images différentes selon la taille de
                    l&apos;écran.
                </p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<picture>
  <source media="(min-width: 800px)" srcset="https://placehold.co/800x400/007bff/ffffff?text=Grand+Ecran">
  <source media="(min-width: 400px)" srcset="https://placehold.co/400x200/007bff/ffffff?text=Moyen+Ecran">
  <img src="https://placehold.co/200x100/007bff/ffffff?text=Petit+Ecran"
       alt="Image responsive selon la taille de l'écran"
       style="max-width:100%; height:auto; border-radius:8px;">
</picture>`}
                    </CodePanel>
                    <PreviewPanel>
                        <picture>
                            <source media="(min-width: 800px)"
                                    srcSet="https://placehold.co/800x400/007bff/ffffff?text=Grand+Ecran"/>
                            <source media="(min-width: 400px)"
                                    srcSet="https://placehold.co/400x200/007bff/ffffff?text=Moyen+Ecran"/>
                            <img src="https://placehold.co/200x100/007bff/ffffff?text=Petit+Ecran"
                                 alt="Image responsive selon la taille de l'écran"
                                 style={{maxWidth: '100%', height: 'auto', borderRadius: '8px'}}/>
                        </picture>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 7 : Audio accessible */}
                <Heading level={3}>7. Audio</Heading>
                <p>
                    Ajouter des contrôles et un texte alternatif pour les lecteurs d&apos;écran.
                </p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<audio controls>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg">
  Votre navigateur ne supporte pas la balise audio.
</audio>`}
                    </CodePanel>
                    <PreviewPanel>
                        <audio controls style={{width: '100%'}}>
                            <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                                    type="audio/mpeg"/>
                            Votre navigateur ne supporte pas la balise audio.
                        </audio>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

                {/* Exemple 8 : Vidéo accessible */}
                <Heading level={3}>8. Vidéo</Heading>
                <p>
                    Ajouter des sous-titres (<code>&lt;track&gt;</code>) et des contrôles.
                </p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<video controls width="600" style="max-width:100%; border-radius:8px;">
  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
  <track src="https://www.w3schools.com/html/mov_bbb.vtt" kind="subtitles" label="Français">
  Votre navigateur ne supporte pas la balise vidéo.
</video>`}
                    </CodePanel>
                    <PreviewPanel>
                        <video controls width="600" style={{maxWidth: '100%', borderRadius: '8px'}}>
                            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"/>
                            <track src="https://www.w3schools.com/html/mov_bbb.vtt" kind="subtitles"
                                   label="Français"/>
                            Votre navigateur ne supporte pas la balise vidéo.
                        </video>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}

            </section>

            <section className="space-y-4">
                <Heading level={2}>G/ Formulaire de base</Heading>
                <p>Exemple d’un formulaire simple avec un champ texte et un bouton submit.</p>
                {/* <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<form>
  <label>
    Nom :
    <input type="text" placeholder="Votre nom"/>
  </label>
  <button type="submit">Envoyer</button>
</form>`}
                    </CodePanel>
                    <PreviewPanel>
                        <form className="flex flex-col gap-4 max-w-md">
                            <label className="flex flex-col">
                                Nom :
                                <input
                                    type="text"
                                    placeholder="Votre nom"
                                    className="border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                            <button type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Envoyer
                            </button>
                        </form>
                    </PreviewPanel>
                </CodeWithPreviewCard> */}
            </section>

            {/* Catégorie : Textuels */}
            <section className="space-y-6">
                <Heading level={3}>1. Inputs textuels</Heading>

                {/** Input texte */}
                <InputExample
                    title="Input texte"
                    description="Permet à l'utilisateur de saisir une ligne de texte."
                    code={`<input type="text" placeholder="Texte"/>`}
                    preview={<input type="text" placeholder="Texte"
                                    className="border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>}
                />

                {/** Input email */}
                <InputExample
                    title="Input email"
                    description="Permet de saisir un email et active la validation automatique du format."
                    code={`<input type="email" placeholder="Email"/>`}
                    preview={<input type="email" placeholder="Email"
                                    className="border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>}
                />

                {/** Input password */}
                <InputExample
                    title="Input password"
                    description="Permet de saisir un mot de passe avec masquage des caractères."
                    code={`<input type="password" placeholder="Mot de passe"/>`}
                    preview={<input type="password" placeholder="Mot de passe"
                                    className="border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>}
                />

                {/** Textarea */}
                <InputExample
                    title="Textarea"
                    description="Permet de saisir plusieurs lignes de texte."
                    code={`<textarea placeholder="Message" rows="3"></textarea>`}
                    preview={<textarea placeholder="Message" rows={3} className="border rounded px-3 py-2 w-full"/>}
                />
            </section>

            {/* Catégorie : Choix multiples */}
            <section className="space-y-6">
                <Heading level={3}>2. Choix multiples</Heading>

                {/** Checkbox */}
                <InputExample
                    title="Checkbox"
                    description="Permet de sélectionner une ou plusieurs options."
                    code={`<label><input type="checkbox"/> Case à cocher</label>`}
                    preview={<label className="flex items-center gap-2"><input type="checkbox"/> Case à cocher</label>}
                />

                {/** Radio */}
                <InputExample
                    title="Radio"
                    description="Permet de sélectionner une seule option dans un groupe."
                    code={`<label><input type="radio" name="group"/> Option 1</label>`}
                    preview={<label className="flex items-center gap-2"><input type="radio" name="group"/> Option
                        1</label>}
                />

                {/** Select */}
                <InputExample
                    title="Liste déroulante"
                    description="Permet de choisir une option dans une liste."
                    code={`<select><option>Option 1</option><option>Option 2</option></select>`}
                    preview={
                        <select className="border rounded px-3 py-2">
                            <option>Option 1</option>
                            <option>Option 2</option>
                        </select>
                    }
                />
            </section>

            {/* Catégorie : Médias */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Médias</h2>

                {/** Input file */}
                <InputExample
                    title="Input fichier"
                    description="Permet de sélectionner un fichier depuis l'appareil."
                    code={`<input type="file"/>`}
                    preview={<input type="file" className="border rounded px-3 py-2"/>}
                />

                {/** Input color */}
                <InputExample
                    title="Input couleur"
                    description="Permet de choisir une couleur."
                    code={`<input type="color"/>`}
                    preview={<input type="color" className="w-16 h-10 border rounded"/>}
                />
            </section>

            {/* Catégorie : Numérique */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold">Numérique et autres</h2>

                {/** Input number */}
                <InputExample
                    title="Input nombre"
                    description="Permet de saisir un nombre avec validation automatique."
                    code={`<input type="number" placeholder="123"/>`}
                    preview={<input type="number" placeholder="123" className="border rounded px-3 py-2"/>}
                />

                {/** Input date */}
                <InputExample
                    title="Input date"
                    description="Permet de sélectionner une date."
                    code={`<input type="date"/>`}
                    preview={<input type="date" className="border rounded px-3 py-2"/>}
                />

                {/** Input range */}
                <InputExample
                    title="Input range"
                    description="Permet de sélectionner une valeur dans une plage avec un slider."
                    code={`<input type="range" min="0" max="100"/>`}
                    preview={<input type="range" min="0" max="100" className="w-full"/>}
                />
            </section>

            <section>
                <Heading level={2}>H/ Ressources pour aller plus loin</Heading>
                <div className='flex flex-col lg:flex-row gap-2 justify-between'>
                    <div>
                        <Heading level={3}>Documentation officielle</Heading>
                        <List>
                            <ListItem><strong><Link href="https://developer.mozilla.org/fr/docs/Web/HTML"
                                                    target="_blank">MDN
                                Web
                                Docs</Link></strong> : La référence complète et à jour</ListItem>
                            <ListItem><strong><Link href="https://www.w3.org/TR/html52/" target="_blank">Spécification
                                W3C
                                HTML5.2</Link></strong> : Document technique officiel</ListItem>
                            <ListItem><strong><Link href="https://html.spec.whatwg.org/" target="_blank">Living Standard
                                WHATWG</Link></strong> : Spécification vivante d&apos;HTML</ListItem>
                        </List>
                    </div>
                    <div><Heading level={3}>Outils de validation et test</Heading>
                        <List>
                            <ListItem><strong><Link href="https://validator.w3.org/" target="_blank">W3C Markup
                                Validator</Link></strong> : Validation du code HTML</ListItem>
                            <ListItem><strong><Link href="https://webaim.org/resources/contrastchecker/"
                                                    target="_blank">WebAIM
                                Contrast Checker</Link></strong> : Vérification des contrastes</ListItem>
                            <ListItem><strong><Link href="https://wave.webaim.org/" target="_blank">WAVE Web
                                Accessibility
                                Evaluator</Link></strong> : Audit d&apos;accessibilité</ListItem>
                        </List>
                    </div>
                    <div>
                        <Heading level={3}>Guides d&apos;accessibilité</Heading>
                        <List>
                            <ListItem><strong><Link href="https://webaim.org/" target="_blank">WebAIM</Link></strong> :
                                Guides
                                et
                                formations accessibilité</ListItem>
                            <ListItem><strong><Link
                                href="https://www.numerique.gouv.fr/publications/rgaa-accessibilite/"
                                target="_blank">RGAA</Link></strong> : Référentiel français
                                d&apos;accessibilité</ListItem>
                            <ListItem><strong><Link href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank">WCAG
                                Quick
                                Reference</Link></strong> : Guide rapide des critères d&apos;accessibilité</ListItem>
                        </List>
                    </div>
                </div>
            </section>
        </article>
    );
}

interface InputExampleProps {
    title: string;
    description: string;
    code: string;
    preview?: React.ReactNode;
}

export function InputExample({title, description, code, preview}: InputExampleProps) {
    return (
        <div className="space-y-2">
            <Heading level={4}>{title}</Heading>
            <p>{description}</p>
            {/* <CodeWithPreviewCard language="html">
                <CodePanel>{code}</CodePanel>
                <PreviewPanel>
                    {preview || <div></div>}
                </PreviewPanel>
            </CodeWithPreviewCard> */}
        </div>
    );
}