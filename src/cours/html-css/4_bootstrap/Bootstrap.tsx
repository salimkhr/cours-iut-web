import Text from "@/components/ui/Text";
import Box from "@/components/ui/Box";
import Heading from "@/components/ui/Heading";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";

export default function Bootstrap() {
    return (
        <Box>
            <section>
                <Text>
                    Bootstrap propose un ensemble complet de classes utilitaires. Ces classes sont conçues pour être
                    réutilisables et modulaires, ce qui signifie qu&apos;elles peuvent être appliquées à différents
                    éléments pour obtenir des effets de style cohérents et prévisibles.
                </Text>

                <Text>
                    Les classes utilitaires dans Bootstrap sont des classes CSS pré-défines qui appliquent des styles
                    spécifiques à un élément. Elles sont conçues pour être réutilisables et modulaires, permettant aux
                    développeurs de rapidement appliquer des styles communs sans avoir à écrire du CSS personnalisé.
                    Cela favorise une approche de développement plus rapide et plus cohérente.
                </Text>
                <Text>
                    Les classes utilitaires couvrent une large gamme de styles, y compris les marges, les remplissages,
                    les couleurs, les alignements, et bien plus encore. En utilisant ces classes, les développeurs
                    peuvent facilement créer des interfaces utilisateur responsives et esthétiquement agréables.
                </Text>

                <Heading level={2}>A – Conteneurs et Grille</Heading>

                <Heading level={3}>1/ Introduction</Heading>
                <Text>
                    Bootstrap repose sur un système de grille fluide et responsive basé sur 12 colonnes. Ce système
                    permet d’agencer facilement les éléments d’une page de façon cohérente, quel que soit le format
                    d’écran. <Link target="_blank"
                                   href="https://getbootstrap.com/docs/5.3/layout/grid/">Documentation</Link>
                </Text>

                <Heading level={3}>2/ Conteneurs</Heading>
                <Text>
                    Les conteneurs sont des éléments fondamentaux dans Bootstrap qui vous permettent de centrer et de
                    structurer le contenu de votre page. Il existe deux types principaux de conteneurs :
                </Text>
                <List>
                    <ListItem>
                        <Code>.container</Code> : crée un conteneur centré avec des marges automatiques et une largeur
                        fixe qui s’adapte selon la taille de l’écran. Ce type de conteneur est idéal pour les mises en
                        page qui nécessitent une largeur maximale définie.
                    </ListItem>
                    <ListItem>
                        <Code>.container-fluid</Code> : crée un conteneur qui prend 100% de la largeur disponible, peu
                        importe la taille de l’écran. Ce type de conteneur est utile pour les mises en page qui doivent
                        s&apos;étendre sur toute la largeur de la fenêtre du navigateur.
                    </ListItem>
                </List>

                <Heading level={3}>3/ Grille</Heading>
                <Text>
                    La grille Bootstrap est divisée en lignes (<Code>.row</Code>) et colonnes (<Code>.col</Code>). Les
                    lignes permettent d’aligner horizontalement les colonnes, et les colonnes peuvent être configurées
                    de différentes manières pour créer des mises en page flexibles et responsives.
                </Text>

                <Heading level={3}>4/ Colonnes</Heading>
                <Text>
                    Les colonnes dans Bootstrap peuvent être configurées de plusieurs manières pour s&apos;adapter à
                    différents besoins de mise en page :
                </Text>
                <List>
                    <ListItem>
                        <Code>.col</Code> : taille automatique, se partage l’espace équitablement entre les colonnes.
                    </ListItem>
                    <ListItem>
                        <Code>.col-*</Code> : taille fixe en fonction du total de 12 colonnes (<Code>.col-6</Code> =
                        50%, <Code>.col-4</Code> = 33%, etc.).
                    </ListItem>
                    <ListItem>
                        <Code>.col-sm-*</Code>, <Code>.col-md-*</Code>, <Code>.col-lg-*</Code>, <Code>.col-xl-*</Code>, <Code>.col-xxl-*</Code> :
                        colonnes **responsives**, qui changent de taille selon la largeur de l’écran (breakpoints). Par
                        exemple, <Code>.col-md-6</Code> signifie que la colonne prendra 50% de la largeur sur les écrans
                        de taille moyenne et plus.
                    </ListItem>
                </List>

                <Heading level={3}>5/ Exemples de mise en page</Heading>
                <Text>
                    Voici quelques exemples de mise en page utilisant le système de grille de Bootstrap :
                </Text>

                <Text>
                    <strong>Exemple 1 : Deux colonnes de largeur égale</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="container">
    <div class="row">
        <div class="col">
            Colonne 1
        </div>
        <div class="col">
            Colonne 2
        </div>
    </div>
</div>`}
                </CodeCard>

                <Text>
                    <strong>Exemple 2 : Trois colonnes de largeur fixe</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="container">
    <div class="row">
        <div class="col-4">
            Colonne 1
        </div>
        <div class="col-4">
            Colonne 2
        </div>
        <div class="col-4">
            Colonne 3
        </div>
    </div>
</div>`}
                </CodeCard>

                <Text>
                    <strong>Exemple 3 : Colonnes responsives</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="container">
    <div class="row">
        <div class="col-12 col-md-6 col-lg-4">
            Colonne 1
        </div>
        <div class="col-12 col-md-6 col-lg-4">
            Colonne 2
        </div>
        <div class="col-12 col-md-12 col-lg-4">
            Colonne 3
        </div>
    </div>
</div>`}
                </CodeCard>

                <Heading level={2}>B – Flexbox</Heading>

                <Heading level={3}>1/ Introduction</Heading>
                <Text>
                    Bootstrap intègre des utilitaires Flexbox pour faciliter la création de mises en page flexibles et
                    responsives. Flexbox est un modèle de disposition qui permet de contrôler l&apos;alignement, la
                    direction, l&apos;ordre et la taille des éléments dans un conteneur. <Link target="_blank"
                                                                                               href="https://getbootstrap.com/docs/5.3/utilities/flex/">Documentation</Link>
                </Text>

                <Heading level={3}>2/ Conteneurs Flexbox</Heading>
                <Text>
                    Pour utiliser Flexbox avec Bootstrap, vous devez d&apos;abord créer un conteneur flexbox en
                    utilisant la
                    classe <Code>.d-flex</Code>. Cette classe applique <Code>display: flex</Code> à l&apos;élément.
                </Text>

                <List>
                    <ListItem>
                        <Code>.d-flex</Code> : crée un conteneur flexbox.
                    </ListItem>
                </List>

                <Heading level={3}>3/ Direction des éléments</Heading>
                <Text>
                    Vous pouvez contrôler la direction des éléments dans un conteneur flexbox en utilisant les classes
                    suivantes :
                </Text>

                <List>
                    <ListItem>
                        <Code>.flex-row</Code> : dispose les éléments en ligne (par défaut).
                    </ListItem>
                    <ListItem>
                        <Code>.flex-row-reverse</Code> : dispose les éléments en ligne, mais dans l&apos;ordre inverse.
                    </ListItem>
                    <ListItem>
                        <Code>.flex-column</Code> : dispose les éléments en colonne.
                    </ListItem>
                    <ListItem>
                        <Code>.flex-column-reverse</Code> : dispose les éléments en colonne, mais dans l&apos;ordre
                        inverse.
                    </ListItem>
                </List>

                <Heading level={3}>4/ Alignement des éléments</Heading>
                <Text>
                    Vous pouvez aligner les éléments dans un conteneur flexbox en utilisant les classes suivantes :
                </Text>

                <List>
                    <ListItem>
                        <Code>.justify-content-start</Code> : aligne les éléments au début du conteneur.
                    </ListItem>
                    <ListItem>
                        <Code>.justify-content-end</Code> : aligne les éléments à la fin du conteneur.
                    </ListItem>
                    <ListItem>
                        <Code>.justify-content-center</Code> : centre les éléments dans le conteneur.
                    </ListItem>
                    <ListItem>
                        <Code>.justify-content-between</Code> : répartit les éléments uniformément dans le conteneur.
                    </ListItem>
                    <ListItem>
                        <Code>.justify-content-around</Code> : répartit les éléments uniformément avec un espace égal
                        autour d&apos;eux.
                    </ListItem>
                    <ListItem>
                        <Code>.align-items-start</Code> : aligne les éléments au début de l&apos;axe transversal.
                    </ListItem>
                    <ListItem>
                        <Code>.align-items-start</Code> : aligne les éléments au début de l&apos;axe transversal.
                        <Code>.align-items-end</Code> : aligne les éléments à la fin de laxe transversal.
                    </ListItem>
                    <ListItem>
                        <Code>.align-items-start</Code> : aligne les éléments au début de l&apos;axe transversal.
                        <Code>.align-items-center</Code> : centre les éléments sur laxe transversal.
                    </ListItem>
                    <ListItem>
                        <Code>.align-items-baseline</Code> : aligne les éléments sur la ligne de base de l&apos;axe
                        transversal.
                    </ListItem>
                    <ListItem>
                        <Code>.align-items-stretch</Code> : étire les éléments pour remplir le conteneur sur l&apos;axe
                        transversal.
                    </ListItem>
                </List>

                <Heading level={2}>C – Couleurs et background</Heading>

                <Heading level={3}>1/ Introduction</Heading>
                <Text>
                    Bootstrap offre une variété de classes utilitaires pour gérer les couleurs du texte et les
                    arrière-plans. Ces classes permettent de styliser facilement les éléments sans avoir à écrire du CSS
                    personnalisé. <Link target="_blank"
                                        href="https://getbootstrap.com/docs/5.3/helpers/color-background/">Documentation</Link>
                </Text>

                <Heading level={3}>2/ Couleurs de texte</Heading>
                <Text>
                    Vous pouvez changer la couleur du texte en utilisant les classes de couleur de texte. Bootstrap
                    propose des classes pour plusieurs couleurs de texte :
                </Text>
                <List>
                    <ListItem>
                        <Code>.text-primary</Code> : couleur principale (bleu par défaut).
                    </ListItem>
                    <ListItem>
                        <Code>.text-secondary</Code> : couleur secondaire (gris par défaut).
                    </ListItem>
                    <ListItem>
                        <Code>.text-success</Code> : couleur de succès (vert).
                    </ListItem>
                    <ListItem>
                        <Code>.text-danger</Code> : couleur de danger (rouge).
                    </ListItem>
                    <ListItem>
                        <Code>.text-warning</Code> : couleur d&apos;avertissement (jaune).
                    </ListItem>
                    <ListItem>
                        <Code>.text-info</Code> : couleur d&apos;information (cyan).
                    </ListItem>
                    <ListItem>
                        <Code>.text-light</Code> : couleur claire (blanc).
                    </ListItem>
                    <ListItem>
                        <Code>.text-dark</Code> : couleur foncée (noir).
                    </ListItem>
                    <ListItem>
                        <Code>.text-muted</Code> : couleur atténuée (gris clair).
                    </ListItem>
                    <ListItem>
                        <Code>.text-white</Code> : couleur blanche.
                    </ListItem>
                </List>

                <Heading level={3}>3/ Arrière-plans</Heading>
                <Text>
                    Vous pouvez également changer la couleur de fond des éléments en utilisant les classes
                    d&apos;arrière-plan. Bootstrap propose des classes pour plusieurs couleurs de fond :
                </Text>
                <List>
                    <ListItem>
                        <Code>.bg-primary</Code> : couleur principale (bleu par défaut).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-secondary</Code> : couleur secondaire (gris par défaut).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-success</Code> : couleur de succès (vert).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-danger</Code> : couleur de danger (rouge).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-warning</Code> : couleur d&apos;avertissement (jaune).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-info</Code> : couleur d&apos;information (cyan).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-light</Code> : couleur claire (blanc).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-dark</Code> : couleur foncée (noir).
                    </ListItem>
                    <ListItem>
                        <Code>.bg-white</Code> : couleur blanche.
                    </ListItem>
                    <ListItem>
                        <Code>.bg-transparent</Code> : couleur transparente.
                    </ListItem>
                </List>

                <Heading level={3}>4/ Exemples d&apos;utilisation</Heading>
                <Text>
                    Voici quelques exemples d&apos;utilisation des classes de couleur et d&apos;arrière-plan :
                </Text>

                <Text>
                    <strong>Exemple 1 : Texte coloré</strong>
                </Text>
                <CodeCard language="html">
                    {`<p class="text-primary">Ce texte est en couleur principale.</p>
<p class="text-success">Ce texte est en couleur de succès.</p>
<p class="text-danger">Ce texte est en couleur de danger.</p>`}
                </CodeCard>

                <Text>
                    <strong>Exemple 2 : Arrière-plans colorés</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="bg-primary text-white p-3">Arrière-plan principal avec texte blanc.</div>
<div class="bg-success text-white p-3">Arrière-plan de succès avec texte blanc.</div>
<div class="bg-danger text-white p-3">Arrière-plan de danger avec texte blanc.</div>`}
                </CodeCard>

                <Text>
                    <strong>Exemple 3 : Combinaison de couleurs de texte et d&apos;arrière-plan</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="bg-light text-dark p-3">Arrière-plan clair avec texte foncé.</div>
<div class="bg-dark text-light p-3">Arrière-plan foncé avec texte clair.</div>
<div class="bg-warning text-dark p-3">Arrière-plan d'avertissement avec texte foncé.</div>`}
                </CodeCard>

                <Heading level={2}>D – Typographie</Heading>

                <Heading level={3}>1/ Introduction</Heading>
                <Text>
                    Bootstrap propose une variété de classes et de composants pour styliser le texte et améliorer la
                    typographie de vos pages web. Ces outils permettent de créer des mises en page attrayantes et
                    lisibles. <Link target="_blank"
                                    href="https://getbootstrap.com/docs/5.3/content/typography/">Documentation</Link>
                </Text>

                <Heading level={3}>2/ Titres</Heading>
                <Text>
                    Bootstrap fournit des classes pour les titres de <Code>h1</Code> à <Code>h6</Code>, ainsi que des
                    classes utilitaires pour modifier leur apparence :
                </Text>
                <List>
                    <ListItem>
                        <Code>.h1</Code> à <Code>.h6</Code> : classes pour les titres de niveau 1 à 6.
                    </ListItem>
                    <ListItem>
                        <Code>.display-1</Code> à <Code>.display-4</Code> : classes pour les titres d&apos;affichage
                        plus
                        grands et plus accrocheurs.
                    </ListItem>
                </List>

                <Text>
                    <strong>Exemple : Utilisation des titres</strong>
                </Text>
                <CodeCard language="html">
                    {`<h1>Titre de niveau 1</h1>
<h2>Titre de niveau 2</h2>
<Heading level={3}>Titre de niveau 3</Heading>
<h4>Titre de niveau 4</h4>
<h5>Titre de niveau 5</h5>
<h6>Titre de niveau 6</h6>

<h1 class="display-1">Titre d'affichage 1</h1>
<h2 class="display-2">Titre d'affichage 2</h2>
<h3 class="display-3">Titre d'affichage 3</Heading>
<h4 class="display-4">Titre d'affichage 4</h4>`}
                </CodeCard>

                <Heading level={3}>3/ Paragraphes et texte</Heading>
                <Text>
                    Bootstrap propose des classes pour styliser les paragraphes et le texte :
                </Text>
                <List>
                    <ListItem>
                        <Code>.lead</Code> : met en évidence un paragraphe pour le rendre plus visible.
                    </ListItem>
                    <ListItem>
                        <Code>.small</Code> : réduit la taille du texte.
                    </ListItem>
                    <ListItem>
                        <Code>.text-muted</Code> : atténue la couleur du texte.
                    </ListItem>
                    <ListItem>
                        <Code>.text-uppercase</Code> : transforme le texte en majuscules.
                    </ListItem>
                    <ListItem>
                        <Code>.text-lowercase</Code> : transforme le texte en minuscules.
                    </ListItem>
                    <ListItem>
                        <Code>.text-capitalize</Code> : met en majuscule la première lettre de chaque mot.
                    </ListItem>
                </List>

                <Text>
                    <strong>Exemple : Utilisation des classes de texte</strong>
                </Text>
                <CodeCard language="html">
                    {`<p class="lead">Ce paragraphe est mis en évidence.</p>
<p class="small">Ce texte est plus petit.</p>
<p class="text-muted">Ce texte est atténué.</p>
<p class="text-uppercase">Ce texte est en majuscules.</p>
<p class="text-lowercase">CE TEXTE EST EN MINUSCULES.</p>
<p class="text-capitalize">ce texte a la première lettre de chaque mot en majuscule.</p>`}
                </CodeCard>

                <Heading level={3}>4/ Alignement du texte</Heading>
                <Text>
                    Vous pouvez aligner le texte en utilisant les classes d&apos;alignement :
                </Text>
                <List>
                    <ListItem>
                        <Code>.text-left</Code> : aligne le texte à gauche.
                    </ListItem>
                    <ListItem>
                        <Code>.text-center</Code> : centre le texte.
                    </ListItem>
                    <ListItem>
                        <Code>.text-right</Code> : aligne le texte à droite.
                    </ListItem>
                    <ListItem>
                        <Code>.text-justify</Code> : justifie le texte.
                    </ListItem>
                </List>

                <Text>
                    <strong>Exemple : Alignement du texte</strong>
                </Text>
                <CodeCard language="html">
                    {`<p class="text-left">Ce texte est aligné à gauche.</p>
<p class="text-center">Ce texte est centré.</p>
<p class="text-right">Ce texte est aligné à droite.</p>
<p class="text-justify">Ce texte est justifié. Il s'étend sur toute la largeur disponible et ajuste les espaces entre les mots pour aligner les deux côtés.</p>`}
                </CodeCard>

                <Heading level={3}>5/ Autres utilitaires typographiques</Heading>
                <Text>
                    Bootstrap propose également d&apos;autres utilitaires pour styliser le texte :
                </Text>
                <List>
                    <ListItem>
                        <Code>.fw-bold</Code> : met le texte en gras.
                    </ListItem>
                    <ListItem>
                        <Code>.fw-normal</Code> : met le texte en poids normal.
                    </ListItem>
                    <ListItem>
                        <Code>.fst-italic</Code> : met le texte en italique.
                    </ListItem>
                    <ListItem>
                        <Code>.text-decoration-underline</Code> : souligne le texte.
                    </ListItem>
                    <ListItem>
                        <Code>.text-decoration-none</Code> : supprime la décoration du texte (comme les soulignements).
                    </ListItem>

                </List>

                <Text>
                    <strong>Exemple : Autres utilitaires typographiques</strong>
                </Text>
                <CodeCard language="html">
                    {`<p class="font-weight-bold">Ce texte est en gras.</p>
<p class="font-weight-normal">Ce texte est en poids normal.</p>
<p class="font-italic">Ce texte est en italique.</p>
<a href="#" class="text-decoration-none">Ce lien n'a pas de soulignement.</a>`}
                </CodeCard>

                <Heading level={2}>E – Espacements</Heading>

                <Heading level={3}>1/ Introduction</Heading>
                <Text>
                    Bootstrap propose un ensemble complet de classes utilitaires pour gérer les marges et les
                    remplissages (padding) des éléments. Ces classes permettent de contrôler facilement
                    l&apos;espacement
                    autour et à l&apos;intérieur des éléments sans avoir à écrire de CSS personnalisé.
                    <Link target="_blank"
                          href="https://getbootstrap.com/docs/5.3/utilities/spacing/">Documentation</Link>
                </Text>

                <Heading level={3}>2/ Marges</Heading>
                <Text>
                    Les classes de marge dans Bootstrap suivent le
                    format <Code>property</Code><Code>sides</Code>-<Code>size</Code> :
                </Text>
                <List>
                    <ListItem>
                        <Code>property</Code> : <Code>m</Code> pour les marges.
                    </ListItem>
                    <ListItem>
                        <Code>sides</Code> : spécifie les côtés sur lesquels appliquer la marge.
                        <List>
                            <ListItem><Code>t</Code> : marge en haut (top).</ListItem>
                            <ListItem><Code>b</Code> : marge en bas (bottom).</ListItem>
                            <ListItem><Code>l</Code> : marge à gauche (left).</ListItem>
                            <ListItem><Code>r</Code> : marge à droite (right).</ListItem>
                            <ListItem><Code>x</Code> : marges horizontales (left et right).</ListItem>
                            <ListItem><Code>y</Code> : marges verticales (top et bottom).</ListItem>
                            <ListItem>Pas de côté spécifié : marge appliquée sur tous les côtés.</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        <Code>size</Code> : spécifie la taille de la marge, allant de <Code>0</Code> à <Code>5</Code>,
                        ainsi que <Code>auto</Code> pour les marges automatiques.
                    </ListItem>
                </List>

                <Text>
                    <strong>Exemple : Utilisation des classes de marge</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="mt-3">Marge en haut de taille 3.</div>
<div class="mb-4">Marge en bas de taille 4.</div>
<div class="ml-2">Marge à gauche de taille 2.</div>
<div class="mr-5">Marge à droite de taille 5.</div>
<div class="mx-auto">Marges horizontales automatiques.</div>
<div class="my-3">Marges verticales de taille 3.</div>
<div class="m-4">Marge de taille 4 sur tous les côtés.</div>`}
                </CodeCard>

                <Heading level={3}>3/ Remplissages (Padding)</Heading>
                <Text>
                    Les classes de remplissage dans Bootstrap suivent le même format que les marges
                    :<Code>property</Code><Code>sides</Code>-<Code>size</Code> :
                </Text>
                <List>
                    <ListItem>
                        <Code>property</Code> : <Code>p</Code> pour les remplissages.
                    </ListItem>
                    <ListItem>
                        <Code>sides</Code> : spécifie les côtés sur lesquels appliquer le remplissage (même que pour les
                        marges).
                    </ListItem>
                    <ListItem>
                        <Code>size</Code> : spécifie la taille du remplissage, allant de <Code>0</Code> à <Code>5</Code>.
                    </ListItem>
                </List>

                <Text>
                    <strong>Exemple : Utilisation des classes de remplissage</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="pt-3">Remplissage en haut de taille 3.</div>
<div class="pb-4">Remplissage en bas de taille 4.</div>
<div class="pl-2">Remplissage à gauche de taille 2.</div>
<div class="pr-5">Remplissage à droite de taille 5.</div>
<div class="px-3">Remplissages horizontaux de taille 3.</div>
<div class="py-4">Remplissages verticaux de taille 4.</div>
<div class="p-5">Remplissage de taille 5 sur tous les côtés.</div>`}
                </CodeCard>

                <Heading level={3}>4/ Exemples combinés</Heading>
                <Text>
                    Vous pouvez combiner les classes de marge et de remplissage pour créer des mises en page complexes :
                </Text>

                <Text>
                    <strong>Exemple : Combinaison de marges et de remplissages</strong>
                </Text>
                <CodeCard language="html">
                    {`<div class="mt-3 mb-4 p-3">
    Ce div a une marge en haut de taille 3, une marge en bas de taille 4 et un remplissage de taille 3 sur tous les côtés.
</div>
<div class="mx-auto p-4">
    Ce div a des marges horizontales automatiques et un remplissage de taille 4 sur tous les côtés.
</div>`}
                </CodeCard>


            </section>
        </Box>
    );
}
