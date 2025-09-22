import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Link from "next/link";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2}>A - Première page</Heading>

                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>app/controllers/</Code>, créez un fichier <Code>HomeController.php</Code>.
                        Ce contrôleur doit hériter de la classe <Code>Controller</Code> et définir une méthode <Code>index()</Code> qui appelle la vue <Code>home.php</Code>.
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/index.php</Code>, ajoutez un appel au contrôleur que vous venez de créer afin de charger la page d’accueil.
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez un fichier <Code>home.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename={"home.php"}>
                            {``}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Lancez le serveur de développement avec la commande : <Code>php -S localhost:8000 -t public</Code>.
                    </ListItem>

                    <ListItem>
                        Allez sur <Link href="http://localhost:8000" target="_blank">http://localhost:8000</Link>.
                        (Grâce à l’option <Code>-t public</Code>, PHP utilise automatiquement le fichier <Code>index.php</Code> situé dans le dossier <Code>public/</Code> comme point d’entrée.)
                    </ListItem>

                    <ListItem>
                        Si tout est correct, vous devez voir apparaître la page <strong>NetFlex</strong> avec son titre affiché dans le navigateur.
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2}>B - Passage de paramètres du contrôleur vers la vue</Heading>

                <Text>
                    Un contrôleur prépare des données et les transmet à une vue pour les afficher.
                    Nous allons voir deux exemples : un paramètre simple (une chaîne de caractères) et un paramètre complexe (un tableau).
                </Text>

                <Heading level={3}>1. Passage d’un paramètre simple</Heading>
                <List ordered>
                    <ListItem>
                        Dans <Code>HomeController.php</Code>, modifiez la méthode <Code>index()</Code> pour y ajouter un paramétre <Code>firstname</Code> à  l&apos;appel de la vue
                    </ListItem>

                    <ListItem>
                        Dans la vue <Code>home.php</Code>, affichez la variable transmise en utilisant la syntaxe <Code>{`<?= $variable; ?>`}</Code>
                    </ListItem>

                    <ListItem>
                        Rechargez la page <Link href="http://localhost:8000" target="_blank">http://localhost:8000</Link>.
                        Vous devez voir : <strong>Bienvenue, Alex !</strong>
                    </ListItem>
                </List>

                <Heading level={3}>2. Passage d’un paramètre complexe</Heading>
                <List ordered>
                    <ListItem>
                        Dans le contrôleur, ajoutez un tableau de films et transmettez-le à la vue :
                        <CodeCard language="php">
                            {`$films = ["Inception", "Interstellar", "Tenet"];}`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Dans la vue <Code>home.php</Code>, affichez la liste des films en utilisant la syntaxe <Code>{`<?= $variable; ?>`}</Code>
                    </ListItem>

                    <ListItem>
                        Dans la vue, affichez la liste des films avec une boucle  <Code>{` <?php foreach ($tabs as $tab: ?> .... <?php endforeach; ?>`}</Code> :
                    </ListItem>

                    <ListItem>
                        Rechargez la page. Vous devez voir le prénom personnalisé et la liste des films affichée sous forme de catalogue.
                    </ListItem>
                </List>
            </section>
        </article>
    );
}