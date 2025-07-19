import Heading from "@/components/ui/Heading";
import Grid, {GridItem} from "@/components/ui/Grid";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import ImageCard from "@/components/Cards/ImageCard";
import CodeCard from "@/components/Cards/CodeCard";

export default function RappelCss() {
    return (
        <section>
            <Heading level={2}>A- Qu&apos;est-ce que le CSS ?</Heading>
            <Text>
                Le CSS (Cascading Style Sheets) est un langage utilisé pour décrire la présentation des documents
                HTML. Il permet de séparer le contenu (HTML) de la mise en forme (CSS), facilitant ainsi la
                maintenance et l&apos;évolution des sites web.
            </Text>

            <Heading level={3}>Intégration au HTML</Heading>
            <Text>Il existe trois principales méthodes pour intégrer du CSS dans un document HTML, mais on
                privilégiera
                le CSS Externe : </Text>

            <Heading level={4}>1. CSS Externe</Heading>
            <Grid templateColumns={{
                base: "1fr",
                md: "2fr 1fr",
            }}
                  gap={6}>
                <GridItem>
                    <CodeCard language="html">
                        {`<!DOCTYPE html>
<html lang="fr">
<head>
    <title>Exemple de CSS Externe</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Titre de la page</h1>
    <p>Ceci est un paragraphe stylisé avec du CSS externe.</p>
</body>
</html>`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="css">
                        {`body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
}
h1 {
    color: #333;
}
p {
    line-height: 1.6;
}
`}
                    </CodeCard>
                </GridItem>
                <></>
            </Grid>
            <Grid templateColumns={{
                base: "1fr",
                md: "2fr 1fr",
            }} gap={6} width="100%">
                <GridItem>
                    <Heading level={4}>2. CSS Interne</Heading>
                    <CodeCard language="html">
                        {`<!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Exemple de CSS Interne</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f0f0f0;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                line-height: 1.6;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Titre de la page</h1>
                        <p>
                            Ceci est un paragraphe stylisé
                             avec du CSS interne.
                         </p>
                    </body>
                    </html>`}
                    </CodeCard>
                </GridItem>
                <GridItem>

                    <Heading level={4}>3. CSS Inline</Heading>
                    <CodeCard language="html">
                        {`<!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">
                      
                        <title>Exemple de CSS Inline</title>
                    </head>
                    <body>
                        <h1 style="color: #333;">Titre de la page</h1>
                        <p style="line-height: 1.6;">
                            Ceci est un paragraphe stylisé
                            avec du CSS inline.
                        </p>
                    </body>
                    </html>
                    `}
                    </CodeCard>
                </GridItem>
            </Grid>
            <Heading level={2}>Les unités</Heading>
            <Text>
                Les unités CSS sont utilisées pour définir les dimensions des éléments sur une page web. Elles
                permettent de spécifier des tailles, des espacements, et d&apos;autres mesures de manière précise et
                flexible. Voici un aperçu des principales unités CSS :
            </Text>

            <Heading level={3}>Unités absolues</Heading>
            <Text>
                Les unités absolues sont fixes et ne changent pas en fonction d&apos;autres facteurs.
            </Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`/* Unités absolues */
.exemple {
    width: 100px;       /* Pixels */
    height: 1in;        /* Pouces */
    margin: 1cm;        /* Centimètres */
    padding: 1mm;       /* Millimètres */
    font-size: 12pt;    /* Points */
    line-height: 1pc;   /* Picas */
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <Text>
                        - <Code>px</Code> : Pixels, d&apos;unité la plus couramment utilisée.<br/>
                        - <Code>in</Code> : Pouces (1 pouce = 96 pixels).<br/>
                        - <Code>cm</Code> : Centimètres (1 cm = 37.8 pixels).<br/>
                        - <Code>mm</Code> : Millimètres (1 mm = 3.78 pixels).<br/>
                        - <Code>pt</Code> : Points (1 point = 1/72 de pouce).<br/>
                        - <Code>pc</Code> : Picas (1 pica = 12 points).
                    </Text>
                </GridItem>
            </Grid>

            <Heading level={3}>B- Unités relatives</Heading>
            <Text>
                Les unités relatives sont basées sur d&apos;autres longueurs et peuvent changer en fonction du
                contexte.
            </Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`/* Unités relatives */
.exemple {
    width: 50%;         /* Pourcentage de l'élément parent */
    font-size: 1.5em;   /* Relatif à la taille de la police de l'élément parent */
    margin: 2rem;       /* Relatif à la taille de la police de la racine */
    padding: 2vw;       /* Pourcentage de la largeur de la fenêtre */
    height: 50vh;       /* Pourcentage de la hauteur de la fenêtre */
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <Text>
                        - <Code>%</Code> : Pourcentage de la dimension de l&apos;élément parent.<br/>
                        - <Code>em</Code> : Relatif à la taille de la police de l&apos;élément parent.<br/>
                        - <Code>rem</Code> : Relatif à la taille de la police de la racine (<Code>html</Code>).<br/>
                        - <Code>vw</Code> : Pourcentage de la largeur de la fenêtre.<br/>
                        - <Code>vh</Code> : Pourcentage de la hauteur de la fenêtre.<br/>
                        - <Code>vmin</Code> : Pourcentage de la plus petite dimension de la fenêtre.<br/>
                        - <Code>vmax</Code> : Pourcentage de la plus grande dimension de la fenêtre.
                    </Text>
                </GridItem>
            </Grid>

            <Heading level={2}>C- Les sélecteurs</Heading>
            <Text>
                Les sélecteurs CSS permettent de cibler les éléments HTML auxquels vous souhaitez appliquer des
                styles.
                Ils sont fondamentaux pour contrôler la mise en forme de votre document. Voici les principaux types
                de
                sélecteurs :
            </Text>

            <Heading level={3}>Sélecteurs de type</Heading>

            <Text>Ciblent tous les éléments d&apos; un type donné.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`p {
    color: blue;
}
div {
    border: 1px solid black;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div>
    <p>
        lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    </p>
</div>
`}
                    </CodeCard>
                </GridItem>
            </Grid>
            <Heading level={3}>Sélecteurs de classe</Heading>

            <Text>Ciblent les éléments ayant une classe spécifique.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`.ma-classe {
    font-weight: bold;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div>
   <p class="ma-classe">Ce texte est en gras.</p>
</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>

            <Heading level={3}>Sélecteurs d&apos;ID</Heading>

            <Text>Ciblent un élément unique avec un ID spécifique.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`#mon-id {
    background-color: yellow;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div id="mon-id">
   <p>Ce div a un fond jaune.</p>
</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>

            <Heading level={2}>D- Les sélecteurs avancés</Heading>
            <Heading level={3}>Sélecteurs d&apos;attributs</Heading>
            <Text>Ciblent les éléments en fonction de leurs attributs.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <></>
            </Grid>

            <Heading level={3}>Sélecteurs de pseudo-classes</Heading>
            <Text>Ciblent les éléments en fonction de leurs attributs.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`input[type="email"] {
    border: 1px solid red;
}
`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div id="mon-id">
 <input type="text" name="text" id="text" placeholder="Input de type text" required />
 <input type="email" name="email" id="email"  placeholder="Input de type email" required />
</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>

            <Heading level={3}>Sélecteurs de descendant (<Code>p</Code> <Code>a</Code>)</Heading>
            <Text>Ciblent tous les éléments `a` à l&apos;intérieur des éléments `p` (même s&apos;ils ne sont pas des
                descendants
                directs).</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`a:hover {
    color: green;
}
input:focus {
    border-color: blue;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div id="mon-id">
    <a href="#">
        Passez la souris ici pour voir le texte devenir vert.
    </a>
    <input type="text" placeholder="Cliquez ici pour voir la bordure devenir bleue.">
</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>
            <Heading level={3}>Sélecteurs de descendant direct (<Code>p</Code>&gt;<Code>a</Code>)</Heading>
            <Text>Ciblent les éléments `a` qui sont des descendants directs de `p`.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}>
                <GridItem>
                    <CodeCard language="css">
                        {`p > a {
    color: purple;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div>
    <p>
        <a href="#">Ce lien dans un paragraphe direct sera violet.</a>
    </p>
    <p>
        <span><a href="#">Ce lien ne sera pas violet, car il n'est pas un descendant direct.</a></span>
    </p>
</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>
            <Heading level={2}>E- Le Box Model</Heading>
            <Text>Le Box Model définit comment les éléments sont rendus sur une
                page web. Chaque élément est considéré comme une boîte composée de quatre parties principales : le
                contenu, le padding, la bordure et la marge.</Text>

            <div className="w-full md:w-1/2 mx-auto p-4">
                <ImageCard
                    src="https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Styling_basics/Box_model/box-model.png"
                    title="Diagramme du modèle de boîte"
                    width={800}
                    height={800}
                />
            </div>

            <Text>En prenant une boîte définie avec les valeurs suivantes de width, height, margin, border et
                padding
                :</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`.box {
  width: 350px;
  height: 150px;
  margin: 10px;
  padding: 25px;
  border: 5px solid black;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <ImageCard
                        src="https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Styling_basics/Box_model/standard-box-model.png"
                        title="Diagramme du modèle de boîte"
                        width={800}
                        height={800}/>
                </GridItem>
            </Grid>

            <Heading level={2}>F- Propriétés de texte</Heading>
            <Text>Les propriétés de texte permettent de styliser le texte dans vos éléments HTML.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`.texte {
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  color: #333;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<p class="texte">Ce texte est stylisé.</p>`}
                    </CodeCard>
                </GridItem>
            </Grid>

            <Heading level={2}>G- Couleurs et fonds</Heading>
            <Text>Les propriétés de couleur et de fond permettent de styliser l&apos;apparence visuelle de vos
                éléments.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`.fond {
  color: white;
  background-color: #333;
  padding: 20px;
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div class="fond">Ce div a un fond gris et du texte blanc.</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>

            <Heading level={2}>H- Bordures et ombres</Heading>
            <Text>Les propriétés de bordure et d&apos;ombre permettent d&apos;ajouter des effets visuels à vos
                éléments.</Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`.bordure {
  border: 2px solid #333;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div class="bordure">Ce div a une bordure, des coins arrondis et une ombre.</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>

            <Heading level={2}>I- Les variables CSS</Heading>
            <Text>
                Les variables CSS, également appelées &quot;custom properties&quot;, permettent de stocker des
                valeurs pouvant
                être réutilisées à travers tout votre CSS. Elles sont définies avec deux tirets (--) suivis
                d&apos;un nom et d&apos;une valeur :
            </Text>
            <Grid
                templateColumns={{
                    base: "1fr",
                    md: "1fr 1fr",
                }}
                gap={6}
                width="100%">
                <GridItem>
                    <CodeCard language="css">
                        {`:root {
    --main-color: #3498db;
    --padding: 15px;
}

.box {
    background-color: var(--main-color);
    padding: var(--padding);
}`}
                    </CodeCard>
                </GridItem>
                <GridItem>
                    <CodeCard language="html">
                        {`<div class="box">
    Ce div utilise des variables CSS pour la couleur de fond et le padding.
</div>`}
                    </CodeCard>
                </GridItem>
            </Grid>
        </section>
    );
}
