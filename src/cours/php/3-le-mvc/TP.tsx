import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Link from "next/link";

export default function TP() {
    return (
        <article>
            {/* ===================== PARTIE A : PAGE SIMPLE ===================== */}
            <section>
                <Heading level={2}>A - Première page simple : index.php</Heading>

                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>app/controllers/</Code>, créez un fichier <Code>IndexController.php</Code>.
                        Ce contrôleur doit hériter de la classe <Code>Controller</Code> et définir une méthode <Code>index()</Code> qui appelle la vue <Code>index</Code>.
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/index.php</Code>, ajoutez le code nécessaire pour instancier votre <Code>IndexController</Code> et appeler sa méthode <Code>index()</Code>.
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez un fichier <Code>index.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename="index.php">
                            {`<h1>Bienvenue sur NetFlex !</h1>
<p>Cette page est simple et n'utilise aucun paramètre.</p>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Lancez le serveur de développement : <Code>php -S localhost:8000 -t public</Code>
                    </ListItem>

                    <ListItem>
                        Testez votre page sur <Link href="http://localhost:8000" target="_blank">http://localhost:8000</Link>.
                        Vous devez voir la page NetFlex s&apos;afficher correctement.
                    </ListItem>
                </List>
            </section>

            {/* ===================== PARTIE B : PAGE HOME AVEC PARAMÈTRES ===================== */}
            <section>
                <Heading level={2}>B - Page home.php avec paramètres</Heading>

                <List ordered>
                    <ListItem>
                        Dans le dossier <Code>app/controllers/</Code>, créez un fichier <Code>HomeController.php</Code>.
                        Ce contrôleur doit hériter de la classe <Code>Controller</Code> et définir une méthode <Code>index()</Code> qui transmet une variable <Code>$firstname</Code> et un tableau <Code>$films</Code> à la vue <Code>home</Code>.
                    </ListItem>

                    <ListItem>
                        Dans <Code>public/home.php</Code>, ajoutez le code nécessaire pour instancier votre <Code>HomeController</Code> et appeler sa méthode <Code>index()</Code>.
                    </ListItem>

                    <ListItem>
                        Dans le dossier <Code>app/views/</Code>, créez un fichier <Code>home.php</Code> et intégrez-y le code suivant :
                        <CodeCard language="html" filename="home.php">
                            {`<h2>Bienvenue sur NetFlex, <?= htmlspecialchars($firstname) ?> !</h2>

<?php if (!empty($films)): ?>
    <section class="films">
        <?php foreach ($films as $film): ?>
            <div class="film">
                <h3><?= htmlspecialchars($film['titre']) ?></h3>
                <p>Année : <?= htmlspecialchars($film['annee']) ?></p>
            </div>
        <?php endforeach; ?>
    </section>
<?php endif; ?>

<?php include __DIR__ . '/_template/header.php'; ?>
<?php include __DIR__ . '/_template/footer.php'; ?>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Testez votre page sur <Link href="http://localhost:8000/home.php" target="_blank">http://localhost:8000/home.php</Link>.
                        Vous devez voir le prénom et la liste de films s&apos;afficher correctement.
                    </ListItem>
                </List>
            </section>

            {/* ===================== PARTIE C : HEADER / FOOTER ===================== */}
            <section>
                <Heading level={2}>C - Templates header et footer</Heading>

                <List ordered>
                    <ListItem>
                        Créez un dossier <Code>_template/</Code> dans <Code>app/views/</Code>
                    </ListItem>

                    <ListItem>
                        Créez le fichier <Code>app/views/_template/header.php</Code> avec le code suivant :
                        <CodeCard language="html" filename="_template/header.php">
                            {`<header>
    <h1>NetFlex</h1>
    <nav>
        <a href="index.php">Accueil</a>
        <a href="home.php">Home</a>
    </nav>
</header>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Créez le fichier <Code>app/views/_template/footer.php</Code> avec le code suivant :
                        <CodeCard language="html" filename="_template/footer.php">
                            {`<footer>
    <p>&copy; 2025 NetFlex. Tous droits réservés.</p>
</footer>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Modifiez vos vues <Code>index.php</Code> et <Code>home.php</Code> pour inclure le header et le footer **à la fin** (déjà fait dans les codes précédents).
                    </ListItem>

                    <ListItem>
                        Rechargez vos pages : l’affichage est identique mais le code est maintenant plus modulaire.
                    </ListItem>
                </List>
            </section>

            {/* ===================== PARTIE D : STRUCTURE FINALE ===================== */}
            <section>
                <Heading level={2}>D - Résultat attendu</Heading>

                <CodeCard language="txt" showLineNumbers={false}>
                    {`project_tp/
├── public/
│   ├── index.php
│   ├── home.php
│   └── css/
│       └── style.css
├── app/
│   ├── controllers/
│   │   ├── IndexController.php
│   │   └── HomeController.php
│   ├── views/
│   │   ├── index.php
│   │   ├── home.php
│   │   └── _template/
│   │       ├── header.php
│   │       └── footer.php
│   └── core/
│       └── Controller.php`}
                </CodeCard>
            </section>
        </article>
    );
}