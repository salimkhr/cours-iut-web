import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Heading from "@/components/ui/Heading";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeCard from "@/components/Cards/CodeCard";
import CoursePrerequisites from "@/components/CoursePrerequisites";

export default function Cours() {
    return (
        <article>
            <CoursePrerequisites>
                <Text>
                    <strong>Les fonctions fléchées</strong> sont utilisées partout dans les traitements
                    asynchrones — en particulier comme callbacks passés à <Code>then</Code> et comme
                    corps de fonctions <Code>async</Code>.
                </Text>
                <CodeCard language="javascript" title="Fonction fléchée">
                    {`const doubler = (x) => x * 2;
const saluer = (nom) => {
    return "Bonjour " + nom;
};`}
                </CodeCard>

                <Text>
                    <strong>Les méthodes de tableau</strong> <Code>map</Code> et <Code>filter</Code>{" "}
                    servent à transformer et filtrer les données reçues d&apos;une API avant de les
                    afficher.
                </Text>
                <CodeCard language="javascript" title="map et filter">
                    {`const noms = utilisateurs.map((u) => u.nom);
const majeurs = utilisateurs.filter((u) => u.age >= 18);`}
                </CodeCard>

                <Text>
                    <strong>Modifier le DOM après réception des données</strong> — <Code>innerHTML</Code>{" "}
                    et <Code>createElement</Code> permettent d&apos;injecter les résultats d&apos;une API
                    directement dans la page.
                </Text>
                <CodeCard language="javascript" title="Afficher dans le DOM">
                    {`const liste = document.getElementById("resultats");
liste.innerHTML = "<li>Élément chargé</li>";`}
                </CodeCard>

                <Text>
                    <strong>Les événements</strong> déclenchent souvent les appels réseau —{" "}
                    <Code>addEventListener("click", ...)</Code> sur un bouton pour lancer une
                    requête à la demande de l&apos;utilisateur.
                </Text>
            </CoursePrerequisites>

            <section>
                <Heading level={2}>A- Introduction aux API et à la sécurité</Heading>
                <Text>
                    Les API (Interfaces de Programmation d&apos;Applications) jouent un rôle central dans la
                    communication entre différentes applications et services. Elles permettent
                    d&apos;exposer des fonctionnalités, d&apos;échanger des données et d&apos;automatiser
                    de nombreux processus.
                </Text>
                <Text>
                    Cependant, une API mal sécurisée peut devenir une porte d&apos;entrée vers des données
                    sensibles et exposer un système à diverses attaques telles que l&apos;injection SQL,
                    les attaques par force brute ou le vol de session. Il est donc essentiel d&apos;appliquer
                    de bonnes pratiques de sécurité afin de garantir la fiabilité et l&apos;intégrité des
                    services.
                </Text>
                <Text>Les principales bonnes pratiques de sécurité des API sont :</Text>
                <List>
                    <ListItem>Utiliser HTTPS pour chiffrer les échanges de données.</ListItem>
                    <ListItem>
                        Protéger l&apos;accès aux API à l&apos;aide de mécanismes d&apos;authentification
                        robustes.
                    </ListItem>
                    <ListItem>
                        Mettre en place du <em>rate limiting</em> afin de limiter les abus et attaques
                        automatisées.
                    </ListItem>
                    <ListItem>
                        Valider et filtrer les entrées utilisateur pour prévenir les attaques de type SQL
                        ou XSS.
                    </ListItem>
                    <ListItem>
                        Journaliser les accès et erreurs afin de détecter rapidement toute activité
                        suspecte.
                    </ListItem>
                </List>

                <Heading level={3}>1. Différents modes d&apos;authentification</Heading>
                <Text>
                    L&apos;authentification est un élément clé de la sécurisation des API. Le tableau
                    ci-dessous présente plusieurs méthodes couramment utilisées.
                </Text>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Avantages</TableHead>
                            <TableHead>Inconvénients</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>API Keys</TableCell>
                            <TableCell>Clé unique envoyée avec chaque requête.</TableCell>
                            <TableCell>Simple à implémenter.</TableCell>
                            <TableCell>Vulnérable si exposée.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>OAuth 2.0</TableCell>
                            <TableCell>
                                Autorise l&apos;accès à des ressources sans partager les identifiants.
                            </TableCell>
                            <TableCell>Très sécurisé et standardisé.</TableCell>
                            <TableCell>Mise en œuvre complexe.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>JWT</TableCell>
                            <TableCell>
                                Token autonome contenant les informations d&apos;authentification.
                            </TableCell>
                            <TableCell>Stateless et sécurisé.</TableCell>
                            <TableCell>Peut devenir volumineux.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Basic Auth</TableCell>
                            <TableCell>
                                Identifiants encodés en Base64 dans l&apos;en-tête HTTP.
                            </TableCell>
                            <TableCell>Facile à mettre en place.</TableCell>
                            <TableCell>Peu sécurisé sans HTTPS.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>

            <section>
                <Heading level={2}>B- Programmation asynchrone en JavaScript</Heading>

                <Heading level={3}>1. Les Promises</Heading>
                <Text>
                    La programmation asynchrone permet d&apos;exécuter des opérations non bloquantes en
                    JavaScript. Une <Code>Promise</Code> représente une opération dont le résultat sera
                    disponible ultérieurement. Elle peut être dans trois états :
                </Text>
                <List>
                    <ListItem><strong>Pending</strong> : la promesse est en attente.</ListItem>
                    <ListItem><strong>Fulfilled</strong> : l&apos;opération a réussi.</ListItem>
                    <ListItem><strong>Rejected</strong> : l&apos;opération a échoué.</ListItem>
                </List>

                <CodeCard language="javascript">
                    {`const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = Math.random() > 0.5;
        success ? resolve("Succès !") : reject("Échec !");
    }, 2000);
});

myPromise
    .then((result) => console.log(result))
    .catch((error) => console.error(error));`}
                </CodeCard>

                <Heading level={3}>2. async / await</Heading>
                <Text>
                    <Code>async</Code> / <Code>await</Code> permet d&apos;écrire du code asynchrone plus
                    lisible. Une fonction déclarée avec <Code>async</Code> retourne toujours une{" "}
                    <Code>Promise</Code>, et <Code>await</Code> permet d&apos;attendre son résultat.
                </Text>

                <CodeCard language="javascript">
                    {`async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Erreur :', error);
    }
}

fetchData();`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>C- Requêtes HTTP avec Fetch</Heading>

                <Heading level={3}>1. Présentation</Heading>
                <Text>
                    <Code>fetch</Code> est une API moderne permettant d&apos;effectuer des requêtes HTTP
                    de manière asynchrone. Elle repose sur les Promises et remplace progressivement{" "}
                    <Code>XMLHttpRequest</Code>.
                </Text>

                <Heading level={3}>2. Requête GET</Heading>
                <CodeCard language="javascript">
                    {`fetch('https://api.example.com/data')
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error('Erreur :', error));`}
                </CodeCard>

                <Heading level={3}>3. Requête POST</Heading>
                <CodeCard language="javascript">
                    {`fetch('https://api.example.com/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key: 'value' }),
})
    .then((response) => response.json())
    .then((data) => console.log('Réponse :', data))
    .catch((error) => console.error('Erreur :', error));`}
                </CodeCard>
            </section>

            <section>
                <Heading level={2}>D- Stockage local et de session</Heading>
                <Text>
                    <Code>localStorage</Code> et <Code>sessionStorage</Code> permettent de stocker des
                    données côté client directement dans le navigateur.
                </Text>

                <Heading level={3}>1. Comparaison</Heading>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Persistance</TableHead>
                            <TableHead>Portée</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>localStorage</Code></TableCell>
                            <TableCell>Persistant.</TableCell>
                            <TableCell>Tous les onglets du domaine.</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>sessionStorage</Code></TableCell>
                            <TableCell>Temporaire.</TableCell>
                            <TableCell>Onglet courant uniquement.</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>2. Exemple avec localStorage</Heading>
                <Text>
                    Le <Code>localStorage</Code> permet de conserver des données de manière persistante.
                    Les informations restent disponibles même après la fermeture du navigateur.
                </Text>
                <CodeCard language="javascript">
                    {`// Sauvegarder une donnée
localStorage.setItem('username', 'Alice');

// Récupérer une donnée
const username = localStorage.getItem('username');
console.log(username);

// Supprimer une donnée
localStorage.removeItem('username');

// Vider complètement le localStorage
localStorage.clear();`}
                </CodeCard>
                <Text>
                    Ce type de stockage est particulièrement utile pour conserver des préférences
                    utilisateur ou un token d&apos;authentification sur le long terme.
                </Text>

                <Heading level={3}>3. Exemple avec sessionStorage</Heading>
                <Text>
                    Le <Code>sessionStorage</Code> fonctionne de manière similaire au{" "}
                    <Code>localStorage</Code>, mais les données sont automatiquement supprimées lorsque
                    l&apos;onglet du navigateur est fermé.
                </Text>
                <CodeCard language="javascript">
                    {`// Sauvegarder une donnée pour la session courante
sessionStorage.setItem('theme', 'dark');

// Récupérer une donnée
const theme = sessionStorage.getItem('theme');
console.log(theme);

// Supprimer une donnée
sessionStorage.removeItem('theme');

// Vider complètement le sessionStorage
sessionStorage.clear();`}
                </CodeCard>
                <Text>
                    Le stockage de session est recommandé pour des données temporaires, comme un état de
                    connexion ou des informations nécessaires uniquement pendant la navigation en cours.
                </Text>

                <Heading level={3}>4. Bearer Token et stockage</Heading>
                <Text>
                    Un <Code>Bearer Token</Code> est un jeton d&apos;authentification envoyé dans
                    l&apos;en-tête <Code>Authorization</Code> pour accéder à des routes protégées. Il peut
                    être stocké temporairement (<Code>sessionStorage</Code>) ou de manière persistante
                    (<Code>localStorage</Code>), puis envoyé dans l&apos;en-tête lors des requêtes.
                </Text>
                <CodeCard language="javascript">
                    {`// Stockage du token
const token = 'Bearer abc123xyz';

// localStorage (session persistante)
localStorage.setItem('authToken', token);

// sessionStorage (session temporaire)
// sessionStorage.setItem('authToken', token);

// Utilisation du token avec fetch
fetch('https://api.example.com/protected', {
    headers: {
        Authorization: localStorage.getItem('authToken'),
    },
})
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));`}
                </CodeCard>
            </section>
        </article>
    );
}
