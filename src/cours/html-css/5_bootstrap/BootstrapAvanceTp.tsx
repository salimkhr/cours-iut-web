import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import ImageCard from "@/components/Cards/ImageCard";

export default function BootstrapAvanceTp() {
    return (
        <section>
            <Heading level={2}>A – International Institute of La RACHE</Heading>

            <Text>
                Notre consultant,
                <strong>Jean CIVE</strong>, Président Honorifique IILaR et Consultant Évangéliste de La RACHE a besoin
                de vous
                pour reprendre son site&nbsp;:&nbsp;
                <Link target="_blank" rel="noopener noreferrer" href="https://www.la-rache.com">
                    https://www.la-rache.com
                </Link>.
                Il vous demande exceptionnellement de ne pas reprendre sa méthode ;-).
            </Text>


            <Text>en partant du fichier
            </Text>

            <CodeCard language="html" filename={"larache.html"}>
                {`<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>International Institute of La RACHE</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
        <style>
             body {
                font-family: 'Arial', sans-serif;
            }
    
            .hero {
                background: linear-gradient(to right, rgba(128, 128, 128, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=2089') no-repeat center center;
                background-size: cover;
                color: white;
                padding: 100px 0;
                text-align: center;
                margin-bottom: 50px;
            }
    
            .section {
                padding: 50px 0;
            }
    
            .section h2 {
                margin-bottom: 30px;
                text-align: center;
            }
    
            .nav-tabs .nav-link {
                color: #495057;
            }
    
            .nav-tabs .nav-link.active {
                color: #0d6efd;
                font-weight: bold;
            }
        </style>
    </head>
<body>
    <!-- code here -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" integrity="sha384-j1CDi7MgGQ12Z7Qab0qlWQ/Qqz24Gc6BM0thvEMVjHnfYGF0rmFCozFSxQBxwHKO" crossorigin="anonymous"></script>
    </body>
</html>`}
            </CodeCard>

            <Heading level={3}>1/ Navbar</Heading>

            <Text>Ajouter une navbar contenant les items :</Text>
            <List>
                <ListItem>
                    <Code>&lt;i class=&quot;fas fa-home&quot;&gt;&lt;/i&gt; Accueil</Code>
                </ListItem>
                <ListItem>
                    <Code>&lt;i class=&quot;fa-info-circle&quot;&gt;&lt;/i&gt; Présentation</Code>
                </ListItem>
                <ListItem>
                    <Code>&lt;i class=&quot;fas fa-question-circle&quot;&gt;&lt;/i&gt; FAQ</Code>
                </ListItem>
                <ListItem>
                    <Code>&lt;i class=&quot;fas fa-graduation-cap&quot;&gt;&lt;/i&gt; Formations</Code>
                </ListItem>
                <ListItem>
                    <Code>&lt;i class=&quot;fas fa-book&quot;&gt;&lt;/i&gt; Publications</Code>
                </ListItem>
                <ListItem>
                    <Code>&lt;i class=&quot;fas fa-images&quot;&gt;&lt;/i&gt;  En Images</Code>
                </ListItem>
            </List>
            <Text>Nous mettrons <Code>#</Code> dans les href, nous ferons les ancres plus tard</Text>

            <Heading level={3}>2/ Présentation</Heading>
            ajouter le HTML ci-dessous, nous reprendrons la logique de <Code>section</Code> dans la suite

            <CodeCard language="html">
                {`<!-- Hero Section -->
<section class="hero" id="hero">
    <div class="container">
        <h1>International Institute of La RACHE</h1>
        <p>La méthode R.A.C.H.E : Rapid Application Conception and Heuristic Extreme-programming</p>
    </div>
</section>

<!-- Presentation Section -->
<section class="section" id="presentation">
    <div class="container">
        <h2><i class="fas fa-info-circle"></i> Présentation</h2>
        <p>La Rache s’appuie sur deux concepts aussi importants l’un que l’autre.</p>
        <p>D’une part la <strong>«&nbsp;Rapid Application Conception&nbsp;»</strong> correspond
            conceptuellement à une
            accélération importante dans
            la phase de conception de l'application par rapport aux méthodes classiques. Pour bien
            débuter avec La RACHE
            il faut soigner la phase d'étude et la rédaction du cahier des charges. Il faut ici produire
            un travail de
            synthèse important en résumant le cahier de charges en un post-it de 8 mots maximum. Puis la
            mission est
            d’extrapoler de ce post-it un sujet de développement vaseux, mais pas trop. À partir de là,
            en règle
            générale, la multiplication du nombre de mots sur le post-it par un chiffre tiré au sort
            entre 20 et 200
            donne la durée du projet en jours/homme. On prendra soin de ne rien planifier dans cette
            phase.</p>
        <p>D'autre part <strong>«&nbsp;L’extrême programming heuristique&nbsp;»</strong> est un concept
            assez
            prometteur. En effet l’heuristique
            est une technique consistant à apprendre petit à petit, en tenant compte de ce que l'on a
            fait précédemment
            pour tendre vers la solution d'un problème. Opposée à l’algorithmique, l'heuristique ne
            garantit pas du tout
            qu'on arrive à une solution quelconque en un temps fini. Ceci sous-entend d’une part une
            démarche
            pédagogique globale d’apprentissage et de capitalisation des acquis, mais aussi que les
            échéances annoncées
            le sont dans une pure optique de déconvenue symbolique. Et c’est précisément le plus
            «&nbsp;produit&nbsp;» de
            la
            méthode RACHE.</p>
    </div>
</section>`}
            </CodeCard>
            <Heading level={3}>3/ Accordion</Heading>
            <Heading level={4}>Ajouter un accordion contenant les rubrique suivante :</Heading>
            <List>
                <ListItem>Pouvez-vous résumer La RACHE en une phrase ?</ListItem>
                <ListItem>Peut-on déployer un prototype en production ?</ListItem>
                <ListItem>Puis-je développer directement en production ?</ListItem>
                <ListItem>Quelle est la licence de La RACHE ?</ListItem>
            </List>
            <Heading level={4}>Elle auront respectivement les réponses :</Heading>

            <List>
                <ListItem>De manière générale la méthode RACHE consiste à prendre des initiatives ne se limitant pas à
                    concevoir des solutions, mais également à faire des trucs insolites, totalement curieux, franchement
                    loupés ou carrément prise de tête. En d&apos;autres termes, La RACHE est une approche basée sur les
                    bonnes pratiques pour la fourniture de services informatiques de qualité s’appuyant sur des
                    processus complexes que tout le monde préfère ignorer.</ListItem>
                <ListItem>Pas de problème, c&apos;est conforme à La RACHE.</ListItem>
                <ListItem>Pas de problème, c&apos;est conforme à La RACHE.</ListItem>
                <ListItem>Afin de faire profiter le plus grand nombre des bienfaits de La RACHE, celle-ci est dans le
                    domaine public ! N&apos;hésitez donc pas à l&apos;utiliser…</ListItem>
            </List>
            <Text>Ajouter la class <Code>bg-light</Code> a la section et le titre <Code>&lt;h2&gt;&lt;i
                class=&quot;fas fa-question-circle&quot;&gt;&lt;/i&gt; FAQ&lt;/h2&gt;</Code></Text>
            <Heading level={3}>4/ Nav-tabs</Heading>
            <Text>Créer une nouvelle section :</Text>
            <CodeCard language="html">
                {`<section class="section" id="formations">
    <div class="container">
        <h2><i class="fas fa-graduation-cap"></i> Formations</h2>
        <p>Sous contrat avec l’International Institute of La RACHE, la Harvard Business School of La RACHE est la seule
            institution à être autorisée à proposer des formations à La RACHE. La Harvard Business School of La RACHE
            vous propose ses formations de qualité :</p>
            
        <!-- Navtabs here-->
    </div>
</section>`}
            </CodeCard>

            <Heading level={4}>Ajouter un tabs avec les onglets : </Heading>
            <List>
                <ListItem>Le licensing mastered by a licensed master</ListItem>
                <ListItem>L&apos;initiation à La RACHE</ListItem>
            </List>
            <Heading level={4}>Elle auront respectivement le contenu suivant :</Heading>
            <List>
                <ListItem>Globalement indispensable, cette formation est parfaite pour les gens qui n&apos;ont pas
                    réellement besoin d&apos;être formés mais qui veulent un titre honorifique de qualité supérieure.
                    Elle
                    est conçue pour ceux qui cherchent à obtenir une reconnaissance formelle de leurs compétences sans
                    avoir à suivre un programme de formation rigoureux. Cette formation offre une opportunité unique
                    d&apos;acquérir un titre prestigieux qui peut être ajouté à votre curriculum vitae, vous distinguant
                    ainsi dans le monde professionnel. De plus, elle est idéale pour ceux qui souhaitent impressionner
                    leurs pairs et collègues avec un titre honorifique sans avoir à investir beaucoup de temps et
                    d&apos;efforts dans une formation traditionnelle.
                </ListItem>
                <ListItem>
                    Cette formation se déroule à la cafet’ de la Harvard Business School of La RACHE, les lundis matins,
                    entre 8h et 8h30 environ. C&apos;est un moment idéal pour commencer la semaine avec une session de
                    formation concise et efficace. La cafet’ offre un environnement détendu et convivial, parfait pour
                    apprendre et échanger des idées. Les participants peuvent profiter d&apos;un café ou d&apos;un thé
                    tout en suivant la formation, ce qui rend l&apos;expérience à la fois agréable et productive. De
                    plus, cette
                    plage horaire matinale permet de ne pas empiéter sur le reste de la journée, laissant ainsi aux
                    participants le temps de vaquer à leurs autres occupations. À La RACHE, nous croyons que
                    l&apos;apprentissage peut être à la fois informel et enrichissant, et cette formation en est un
                    parfait exemple.
                </ListItem>
            </List>

            <Heading level={3}>4/ Cards</Heading>
            <Text>dans une section ayant comme titre <Code>&lt;h2&gt;&lt;i
                class=&quot;fas fa-book&quot;&gt;&lt;/i&gt; Publications&lt;/h2&gt;</Code> et en bg-light, créer 2 card
                cote a
                cote sur tablette ou &gt;.</Text>
            <Text>Les cards seront composé d&apos;une image a gauche et d&apos;un titre + texte et un footer a
                droite.</Text>

            <Heading level={4}>Url des images : </Heading>
            <List>
                <ListItem>https://cours.salimkhraimeche.fr/images/html/tome1.jpg</ListItem>
                <ListItem>https://cours.salimkhraimeche.fr/images/html/tome2.jpg</ListItem>
            </List>
            <Heading level={4}>Titre : </Heading>
            <List>
                <ListItem>La RACHE, une méthodologie réaliste mais formaliste – par Sukender </ListItem>
                <ListItem>Mesures en système pifométrique</ListItem>
            </List>
            <Heading level={4}>Text : (nous metterons la remarque dans <Code>&lt;small
                class=&quot;text-body-secondary&quot;&gt;&lt;/small&gt;</Code>) </Heading>
            <List>
                <ListItem>Publié dans le numéro de décembre du très respecté magazine spécialisé « Science, Technique,
                    Informatique et Choucroute Garnie » et décrivant l&apos;utilisation de La RACHE dans un cas
                    concrètement
                    abstrait. Ce premier tome de cette série d&apos;articles formalise le côté « camouflage » nécessaire
                    pour
                    bien réussir son projet à La RACHE.</ListItem>
                <ListItem>Le système pifométrique est très utilisé dans la méthodologie de La RACHE

                    Remarque : Patrick DUBOIS D&apos;ENGHIEN nous signale qu&apos;une erreur s&apos;est glissée dans ce
                    document. La
                    chiée exprime une valeur non pifométrique mais au contraire précise : Une chiée vaut 11. Et oui,
                    c&apos;est bien connu : 11 fait chiée.</ListItem>
            </List>
            <Heading level={4}>Footer</Heading>
            <Text>Ajouter un lien &quot;Télécharger&quot; avec la class <Code>btn btn-outline-primary</Code> ouvrant le
                lien dans un nouvelle onglet avec le lien
                suivant</Text>
            <List>
                <ListItem>https://www.la-rache.com/img/a1_rache.2bb626ed7a76f4bf.pdf</ListItem>
                <ListItem>https://www.la-rache.com/img/unites.ca6165dfed957810.pdf</ListItem>
            </List>

            <Heading level={3}>5/ Carrouselle</Heading>
            <Text>Ajouter un caroussel avec vos images préféré dans une section <Code>&lt;h2&gt;&lt;i
                class=&quot;fas fa-images&quot;&gt;&lt;/i&gt; En Images&lt;/h2&gt;</Code>: <Link target="_blank"
                                                                                                 rel="noopener noreferrer"
                                                                                                 href="https://www.la-rache.com/images.html">https://www.la-rache.com/images.html</Link></Text>
            <Heading level={3}>Navbar</Heading>
            <Text>Corriger la navbar pour que les liens aille sur les differante section</Text>

            <div className="w-full md:w-1/2 mx-auto p-4">
                <ImageCard src="/images/html/attendu_TP5.png"
                           title="Résultat proposé"/>
            </div>
        </section>
    );
}
