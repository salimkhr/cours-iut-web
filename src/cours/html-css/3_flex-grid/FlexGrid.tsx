import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import CodeCard from "@/components/Cards/CodeCard";
import CodeWithPreviewCard, {CodePanel, PreviewPanel} from "@/components/Cards/CodeWithPreviewCard";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";

export default function FlexGrid() {
    return (
        <section>
            <Heading level={2}>A- Introduction au Responsive Design</Heading>
            <Heading level={3}>Différence entre Responsive, Adaptatif et Fluid Design</Heading>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Terme</TableHead>
                        <TableHead>Définition rapide</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell><strong>Responsive</strong></TableCell>
                        <TableCell>Layout flexible s&apos;adaptant automatiquement grâce à des media
                            queries.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Adaptatif</strong></TableCell>
                        <TableCell>Layout figé pour chaque résolution (ex : 320px, 768px), sans ajustement
                            fluide.</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell><strong>Fluid Design</strong></TableCell>
                        <TableCell>Disposition fluide basée sur des unités relatives (%, em, rem, vw,
                            vh).</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Heading level={2}>B- Media Queries</Heading>

            <Heading level={3}>Exemple : adapter une barre de navigation</Heading>
            <CodeCard language="css">
                {`.menu {
    display: flex;
    flex-direction: column;
}

@media (min-width: 768px) {
    .menu {
        flex-direction: row;
    }
}`}
            </CodeCard>

            <Heading level={3}>Breakpoints recommandés</Heading>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Appareil</TableHead>
                        <TableHead>Largeur min</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Téléphones</TableCell>
                        <TableCell>576px</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Tablettes</TableCell>
                        <TableCell>768px</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Petits laptops</TableCell>
                        <TableCell>992px</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Desktops larges</TableCell>
                        <TableCell>1200px</TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            <Heading level={3}>Mobile-first vs Desktop-first</Heading>
            <Text>
                Le mobile-first consiste à écrire les styles pour les petits écrans d&apos;abord, puis à ajouter des
                règles
                pour les plus grandes tailles via des media queries avec <code>min-width</code>. C&apos;est
                l&apos;approche
                moderne recommandée pour optimiser la performance et l’accessibilité.
            </Text>

            <Heading level={2}>C/ Flexbox et Grid pour le Responsive</Heading>

            <Heading level={3}>1/ Comparatif Flexbox vs Grid</Heading>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Critère</TableHead>
                        <TableHead>Flexbox</TableHead>
                        <TableHead>Grid</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Axes</TableCell>
                        <TableCell>Un axe principal (ligne ou colonne)</TableCell>
                        <TableCell>Deux axes (lignes + colonnes)</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Comportement</TableCell>
                        <TableCell>Positionne les éléments un par un</TableCell>
                        <TableCell>Positionne des zones entières selon une grille</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Cas typiques</TableCell>
                        <TableCell>Menus, cartes, boutons alignés</TableCell>
                        <TableCell>Layouts complets, galeries d’images</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Heading level={2}>D/ Flexbox</Heading>
            <Text>
                Flexbox est un module de disposition CSS conçu pour faciliter la création de mises en page flexibles
                et intuitives. Il permet de disposer des éléments dans un conteneur de manière à ce qu&apos;ils
                puissent
                s&apos;adapter à différentes tailles d&apos;écran. Voici un exemple de base :
            </Text>
            <CodeCard language="css">
                {`.container {
    display: flex;            /* Active Flexbox */
    flex-direction: row;      /* Disposition en ligne (par défaut) ou en colonne */
    justify-content: space-between; /* Aligne les éléments horizontalement avec un espace entre eux */
    align-items: center;      /* Aligne les éléments verticalement au centre */
    flex-wrap: wrap;          /* Permet aux éléments de passer à la ligne suivante si nécessaire */
    gap: 1rem;                /* Espacement entre les éléments */
}

.item {
    flex-grow: 1; /* L'élément peut grandir pour remplir l'espace disponible. */
    flex-shrink: 1; /* L'élément peut rétrécir si nécessaire. */
    flex-basis: 200px; /* La taille de base de l'élément est de 200 pixels. */
}
`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="container">
    <div class="item">Élément 1</div>
    <div class="item">Élément 2</div>
    <div class="item">Élément 3</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="flex flex-wrap justify-between gap-4">
                        <div className="p-4 bg-gray-100 text-black">Élément 1</div>
                        <div className="p-4 bg-gray-200 text-black">Élément 2</div>
                        <div className="p-4 bg-gray-300 text-black">Élément 3</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>

            <Heading level={3}>1/ Options de Grid</Heading>
            <List>
                <ListItem><Code>flex-direction</Code>: Définit l&apos;axe principal (row,
                    row-reverse,
                    column, column-reverse).</ListItem>
                <ListItem><Code>justify-content</Code>: Aligne les éléments le long de l&apos;axe
                    principal (flex-start, flex-end, center, space-between, space-around,
                    space-evenly).</ListItem>
                <ListItem><Code>align-items</Code>: Aligne les éléments le long de l&apos;axe
                    transversal (flex-start, flex-end, center, baseline, stretch).</ListItem>
                <ListItem><Code>flex-wrap</Code>: Contrôle si les éléments doivent passer à la
                    ligne (nowrap, wrap, wrap-reverse).</ListItem>
                <ListItem><Code>gap</Code>: Définit l&apos;espacement entre les
                    éléments.</ListItem>
                <ListItem><Code>flex</Code>: Définit la flexibilité des éléments (flex-grow,
                    flex-shrink, flex-basis).</ListItem>
                <ListItem><Code>flex-grow</Code>: Définit la capacité d&apos;un élément à grandir
                    par
                    rapport aux autres éléments flexibles.</ListItem>
                <ListItem><Code>flex-shrink</Code>: Définit la capacité d&apos;un élément à
                    rétrécir par
                    rapport aux autres éléments flexibles.</ListItem>
                <ListItem><Code>flex-basis</Code>: Définit la taille de base d&apos;un élément
                    avant que
                    l&apos;espace restant ne soit distribué.</ListItem>
            </List>

            <Heading level={3}>2/ flex-direction</Heading>
            <Text>
                La propriété <Code>flex-direction</Code> permet de définir la direction des éléments dans le
                conteneur flexible.
            </Text>
            <CodeCard language="css">
                {`.flex-direction-example {
    display: flex;
    gap: 1rem;
}

.row {
    flex-direction: row; /* Par défaut, les éléments sont disposés en ligne */
}

.row-reverse {
    flex-direction: row-reverse; /* Les éléments sont disposés en ligne, mais dans l'ordre inverse */
}

.column {
    flex-direction: column; /* Les éléments sont disposés en colonne */
}

.column-reverse {
    flex-direction: column-reverse; /* Les éléments sont disposés en colonne, mais dans l'ordre inverse */
}
`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="flex-direction-example row">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
<hr/>
<div class="flex-direction-example row-reverse">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
<hr/>
<div class="flex-direction-example column">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
<hr/>
<div class="flex-direction-example column-reverse">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="flex flex-col">
                        {/* 1. Flex row normal */}
                        <div className="flex gap-4 mb-4">
                            <div className="p-4 bg-orange-100 text-black">Item 1</div>
                            <div className="p-4 bg-orange-200 text-black">Item 2</div>
                            <div className="p-4 bg-orange-300 text-black">Item 3</div>
                        </div>

                        {/* 2. Flex row-reverse */}
                        <div className="flex flex-row-reverse gap-4 py-4 border-t border-gray-300">
                            <div className="p-4 bg-orange-100 text-black">Item 1</div>
                            <div className="p-4 bg-orange-200 text-black">Item 2</div>
                            <div className="p-4 bg-orange-300 text-black">Item 3</div>
                        </div>

                        {/* 3. Flex column */}
                        <div className="flex flex-col gap-4 py-4 border-t border-gray-300">
                            <div className="p-4 bg-orange-100 text-black">Item 1</div>
                            <div className="p-4 bg-orange-200 text-black">Item 2</div>
                            <div className="p-4 bg-orange-300 text-black">Item 3</div>
                        </div>

                        {/* 4. Flex column-reverse */}
                        <div className="flex flex-col-reverse gap-4 py-4 border-t border-gray-300">
                            <div className="p-4 bg-orange-100 text-black">Item 1</div>
                            <div className="p-4 bg-orange-200 text-black">Item 2</div>
                            <div className="p-4 bg-orange-300 text-black">Item 3</div>
                        </div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>
            <Heading level={3}>3/ flex-wrap</Heading>
            <Text>
                La propriété <Code>flex-wrap</Code> permet de contrôler le passage à la ligne des éléments
                flexibles.
            </Text>
            <CodeCard language="css">
                {`.flex-wrap-example {
    display: flex;
    gap: 1rem;
    border: 1px solid #ccc;
    padding: 16px;
}

.nowrap {
    flex-wrap: nowrap; /* Les éléments ne passent pas à la ligne */
}

.wrap {
    flex-wrap: wrap; /* Les éléments passent à la ligne si nécessaire */
}

.wrap-reverse {
    flex-wrap: wrap-reverse; /* Les éléments passent à la ligne en ordre inverse */
}
`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="flex-wrap-example nowrap" style="width: 216px;">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
<div class="flex-wrap-example wrap" style="width: 216px;">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
<div class="flex-wrap-example wrap-reverse" style="width: 216px;">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="flex flex-col">
                        {/* 1. flex nowrap */}
                        <div className="flex flex-nowrap gap-4 mb-4 p-4 border border-gray-300"
                             style={{width: '216px'}}>
                            <div className="p-4 bg-purple-100 text-black">Item 1</div>
                            <div className="p-4 bg-purple-200 text-black">Item 2</div>
                            <div className="p-4 bg-purple-300 text-black">Item 3</div>
                        </div>

                        {/* 2. flex wrap */}
                        <div className="flex flex-wrap gap-4 mb-4 p-4 border border-gray-300"
                             style={{width: '216px'}}>
                            <div className="p-4 bg-purple-100 text-black">Item 1</div>
                            <div className="p-4 bg-purple-200 text-black">Item 2</div>
                            <div className="p-4 bg-purple-300 text-black">Item 3</div>
                        </div>

                        {/* 3. flex wrap-reverse */}
                        <div className="flex flex-wrap-reverse gap-4 p-4 border border-gray-300"
                             style={{width: '216px'}}>
                            <div className="p-4 bg-purple-100 text-black">Item 1</div>
                            <div className="p-4 bg-purple-200 text-black">Item 2</div>
                            <div className="p-4 bg-purple-300 text-black">Item 3</div>
                        </div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>

            <Heading level={3}>4/ justify-content et align-items</Heading>
            <Text>
                Les propriétés <Code>justify-content</Code> et <Code>align-items</Code> permettent d&apos;aligner
                les
                éléments flexibles.
            </Text>
            <CodeCard language="css">
                {`.justify-align-example {
    display: flex;
    height: 200px;
    border: 1px solid #ccc;
    gap: 1rem;
}

.justify-start {
    justify-content: flex-start; /* Aligne les éléments au début de l'axe principal */
}

.justify-center {
    justify-content: center; /* Centre les éléments sur l'axe principal */
}

.justify-end {
    justify-content: flex-end; /* Aligne les éléments à la fin de l'axe principal */
}

.justify-between {
    justify-content: space-between; /* Distribue les éléments avec un espace égal entre eux */
}

.justify-around {
    justify-content: space-around; /* Distribue les éléments avec un espace égal autour de chaque élément */
}

.align-start {
    align-items: flex-start; /* Aligne les éléments au début de l'axe transversal */
}

.align-center {
    align-items: center; /* Centre les éléments sur l'axe transversal */
}

.align-end {
    align-items: flex-end; /* Aligne les éléments à la fin de l'axe transversal */
}
`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="justify-align-example justify-start align-start">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
<div class="justify-align-example justify-center align-center">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
<div class="justify-align-example justify-between align-center">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
<div class="justify-align-example justify-around align-center">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
<div class="justify-align-example justify-end align-end">
    <div>Item 1</div>
    <div>Item 2</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    {/* 1. justify-start, align-start */}
                    <div className="flex flex-col">
                        <div className="flex justify-start items-start gap-4 mb-4 border border-gray-300"
                             style={{height: '200px'}}>
                            <div className="p-4 bg-teal-100 text-black">Item 1</div>
                            <div className="p-4 bg-teal-200 text-black">Item 2</div>
                        </div>

                        {/* 2. justify-center, align-center */}
                        <div className="flex justify-center items-center gap-4 mb-4 border border-gray-300"
                             style={{height: '200px'}}>
                            <div className="p-4 bg-teal-100 text-black">Item 1</div>
                            <div className="p-4 bg-teal-200 text-black">Item 2</div>
                        </div>

                        {/* 3. justify-between, align-center */}
                        <div className="flex justify-between items-center gap-4 mb-4 border border-gray-300"
                             style={{height: '200px'}}>
                            <div className="p-4 bg-teal-100 text-black">Item 1</div>
                            <div className="p-4 bg-teal-200 text-black">Item 2</div>
                        </div>

                        {/* 4. justify-around, align-center */}
                        <div className="flex justify-around items-center gap-4 mb-4 border border-gray-300"
                             style={{height: '200px'}}>
                            <div className="p-4 bg-teal-100 text-black">Item 1</div>
                            <div className="p-4 bg-teal-200 text-black">Item 2</div>
                        </div>

                        {/* 5. justify-end, align-end */}
                        <div className="flex justify-end items-end gap-4 border border-gray-300"
                             style={{height: '200px'}}>
                            <div className="p-4 bg-teal-100 text-black">Item 1</div>
                            <div className="p-4 bg-teal-200 text-black">Item 2</div>
                        </div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>

            <Heading level={3}>5/ Flexbox avec media queries</Heading>
            <Text>
                Pour rendre une disposition Flexbox responsive, vous pouvez utiliser des media queries pour ajuster
                la disposition en fonction de la taille de l&apos;écran. Par exemple :
            </Text>
            <CodeCard language="css">
                {`.container-responsive {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

@media (min-width: 600px) {
    .container-responsive {
        flex-direction: row;
    }
}

@media (min-width: 900px) {
    .container-responsive {
        flex-direction: row;
        justify-content: space-around;
    }
}`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="container-responsive">
    <div class="item">Élément 1</div>
    <div class="item">Élément 2</div>
    <div class="item">Élément 3</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="flex flex-col md:flex-row lg:justify-around gap-4">
                        <div className="p-4 bg-blue-100 text-black">Élément 1</div>
                        <div className="p-4 bg-blue-200 text-black">Élément 2</div>
                        <div className="p-4 bg-blue-300 text-black">Élément 3</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>


            <Heading level={2}>E/ Grid</Heading>
            <Text>
                CSS Grid Layout est un système de disposition bidimensionnel qui permet de créer des mises en page
                complexes de manière simple et intuitive. Il permet de définir des grilles avec des lignes et des
                colonnes, et de placer des éléments dans ces grilles de manière flexible.
            </Text>
            <CodeCard language="css">
                {`.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    justify-items: center; /* centre chaque élément */
    align-items: start;    /* aligne en haut */
}`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="grid">
    <div>Bloc A</div>
    <div>Bloc B</div>
    <div>Bloc C</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="grid gap-4"
                         style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>
                        <div className="p-4 bg-blue-100 text-black">Bloc A</div>
                        <div className="p-4 bg-blue-200 text-black">Bloc B</div>
                        <div className="p-4 bg-blue-300 text-black">Bloc C</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>

            <Heading level={3}>1/ Unités et templates</Heading>
            <List>
                <ListItem><Code>fr (fraction)</Code>: Une unité de mesure flexible qui représente
                    une fraction de l&apos;espace disponible dans la grille. Par
                    exemple, <Code>1fr</Code> signifie
                    que l&apos;élément prendra une part égale de l&apos;espace disponible.</ListItem>
                <ListItem><Code>minmax(min, max)</Code>: Une fonction qui définit une plage de
                    taille pour une piste de grille. Par exemple, <Code>minmax(200px, 1fr)</Code> signifie que
                    la piste sera au minimum de 200px et pourra grandir jusqu&apos;à prendre une part égale de
                    l&apos;espace disponible.</ListItem>
                <ListItem><Code>repeat(auto-fit, minmax(min, max))</Code>: Une fonction qui répète
                    automatiquement les pistes de grille pour remplir l&apos;espace disponible. Par
                    exemple, <Code>repeat(auto-fit,
                        minmax(200px, 1fr))</Code> créera autant de colonnes de 200px minimum que possible, en
                    les étirant pour remplir l&apos;espace disponible.</ListItem>
            </List>

            <Heading level={3}>2/ Options de Grid</Heading>
            <List>
                <ListItem><Code>grid-template-columns / grid-template-rows</Code>: Définit les
                    colonnes et les lignes de la grille. Par exemple, <Code>grid-template-columns: 1fr
                        2fr;</Code> crée deux colonnes, la première prenant une part de l&apos;espace et la
                    deuxième
                    deux parts. Cela permet de créer des mises en page fluides et adaptatives.</ListItem>
                <ListItem><Code>grid-auto-flow</Code>: Contrôle comment les éléments sont placés
                    automatiquement (row, column, dense). Par exemple, <Code>grid-auto-flow: row;</Code> place
                    les éléments en ligne par défaut. Cela est utile pour des mises en page où l&apos;ordre des
                    éléments n&apos;est pas critique.</ListItem>
                <ListItem><Code>gap</Code>: Définit l&apos;espacement entre les lignes et les
                    colonnes.
                    Par exemple, <Code>gap: 1rem;</Code> ajoute un espacement de 1rem entre les éléments. Cela
                    permet de créer des espaces réguliers entre les éléments de la grille.</ListItem>
                <ListItem><Code>justify-items / align-items</Code>: Aligne les éléments dans leurs
                    cellules respectives. Par exemple, <Code>justify-items: center;</Code> centre les éléments
                    horizontalement dans leurs cellules. Cela est utile pour centrer des éléments comme des
                    icônes ou des boutons.</ListItem>
                <ListItem><Code>justify-content / align-content</Code>: Aligne la grille entière
                    dans le conteneur. Par exemple, <Code>justify-content: center;</Code> centre la grille
                    horizontalement dans le conteneur. Cela est utile pour centrer une grille entière au sein de
                    son conteneur parent.</ListItem>
                <ListItem><Code>grid-column / grid-row</Code>: Place un élément dans une zone
                    spécifique de la grille. Par exemple :
                    <CodeCard language="css">
                        {`.item {
    grid-column: span 2; /* L'élément s'étend sur deux colonnes */
    grid-row: span 2;    /* L'élément s'étend sur deux lignes */
}`}
                    </CodeCard>
                    Cela permet de créer des éléments qui s&apos;étendent sur plusieurs colonnes ou lignes, ce
                    qui
                    est utile pour des mises en page complexes.
                </ListItem>
            </List>

            <Heading level={3}>3/ Grille de base</Heading>
            <Text>
                Pour créer une grille de base, vous pouvez définir des colonnes et des lignes simples. Par exemple,
                une grille avec trois colonnes de largeur égale :
            </Text>
            <CodeCard language="css">
                {`.grid-simple {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
}`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="grid-simple">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
    <div>Item 5</div>
    <div>Item 6</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-100 text-black">Item 1</div>
                        <div className="p-4 bg-green-200 text-black">Item 2</div>
                        <div className="p-4 bg-green-300 text-black">Item 3</div>
                        <div className="p-4 bg-green-400 text-white">Item 4</div>
                        <div className="p-4 bg-green-500 text-white">Item 5</div>
                        <div className="p-4 bg-green-600 text-white">Item 6</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>

            <Heading level={3}>4/ Grille avec des colonnes de largeurs différentes</Heading>
            <Text>
                Pour une mise en page plus complexe, vous pouvez définir des colonnes de largeurs différentes. Par
                exemple, une grille avec une colonne de 1fr et une autre de 2fr :
            </Text>
            <CodeCard language="css">
                {`.grid-intermediate {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
}`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="grid-intermediate">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="grid gap-4" style={{gridTemplateColumns: '1fr 2fr'}}>
                        <div className="p-4 bg-purple-200 text-black">Item 1</div>
                        <div className="p-4 bg-purple-300 text-black">Item 2</div>
                        <div className="p-4 bg-purple-400 text-white">Item 3</div>
                        <div className="p-4 bg-purple-500 text-white">Item 4</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>

            <Heading level={3}>5/ Grille avec des éléments s&apos;étendant sur plusieurs colonnes/lignes</Heading>
            <Text>
                Pour des mises en page encore plus complexes, vous pouvez faire en sorte que certains éléments
                s&apos;étendent sur plusieurs colonnes ou lignes. Par exemple :
            </Text>
            <CodeCard language="css">
                {`.grid-complex {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: 1rem;
}

.grid-complex .item-span {
    grid-column: span 2; /* L'élément s'étend sur deux colonnes */
}`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="grid-complex">
    <div class="item-span">Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div
                        className="grid gap-4"
                        style={{gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto"}}
                    >
                        <div className="p-4 bg-red-200 text-black" style={{gridColumn: "span 2"}}>
                            Item 1
                        </div>
                        <div className="p-4 bg-red-300 text-black">Item 2</div>
                        <div className="p-4 bg-red-400 text-white">Item 3</div>
                        <div className="p-4 bg-red-500 text-white">Item 4</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>
            <Heading level={3}>6/ Grille responsive avec media queries</Heading>
            <Text>
                Pour rendre une grille responsive, vous pouvez utiliser des media queries pour ajuster la
                disposition en fonction de la taille de l&apos;écran. Par exemple :
            </Text>
            <CodeCard language="css">
                {`.grid-responsive {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 600px) {
    .grid-responsive {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 900px) {
    .grid-responsive {
        grid-template-columns: repeat(3, 1fr);
    }
}`}
            </CodeCard>
            <CodeWithPreviewCard language="html">
                <CodePanel>
                    {`<div class="grid-responsive">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
    <div>Item 5</div>
    <div>Item 6</div>
</div>`}
                </CodePanel>
                <PreviewPanel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-teal-100 text-black">Item 1</div>
                        <div className="p-4 bg-teal-200 text-black">Item 2</div>
                        <div className="p-4 bg-teal-300 text-black">Item 3</div>
                        <div className="p-4 bg-teal-400 text-white">Item 4</div>
                        <div className="p-4 bg-teal-500 text-white">Item 5</div>
                        <div className="p-4 bg-teal-600 text-white">Item 6</div>
                    </div>
                </PreviewPanel>
            </CodeWithPreviewCard>
        </section>
    );
}