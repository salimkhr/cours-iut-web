import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import Code from "@/components/ui/Code";
import Grid from "@/components/ui/Grid";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import CodeWithPreviewCard, {CodePanel, PreviewPanel} from "@/components/Cards/CodeWithPreviewCard";
import InputCard from "@/components/Cards/InputCard";
import CodeCard from "@/components/Cards/CodeCard";

export default function Cours() {
    return (
        <article>
            {/* PARTIE A : HTML */}
            <section>
                <Heading level={2}>A- Création d&apos;un formulaire HTML</Heading>

                <Heading level={3}>1. Structure de base</Heading>
                <Text>
                    Un formulaire HTML commence par la balise <Code>&lt;form&gt;</Code> avec deux attributs essentiels :
                </Text>
                <List>
                    <ListItem><Code>action</Code> : URL de destination des données</ListItem>
                    <ListItem><Code>method</Code> : GET (données dans l&apos;URL) ou POST (données cachées)</ListItem>
                </List>

                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<form method="post" action="traitement.php">
    <label for="username">Nom d'utilisateur :</label>
    <input type="text" id="username" name="username" required>
    
    <button type="submit">Envoyer</button>
</form>`}
                    </CodePanel>
                    <PreviewPanel>
                        <form method="post">
                            <label htmlFor="username">Nom d&apos;utilisateur :</label>
                            <input type="text" id="username" name="username" required className="input"/>
                            <button type="submit" className="button">Envoyer</button>
                        </form>
                    </PreviewPanel>
                </CodeWithPreviewCard>

                <Heading level={3}>2. Types de champs</Heading>

                <Heading level={4}>Champs texte</Heading>
                <Grid templateColumns={{base: "1fr", md: "repeat(2, 1fr)"}} gap={6} width="100%">
                    <InputCard
                        title="Text"
                        description="Texte simple"
                        code={`<input type="text" name="username" />`}
                        inputElement={<input type="text" placeholder="Username" className="input"/>}
                    />
                    <InputCard
                        title="Email"
                        description="Email avec validation"
                        code={`<input type="email" name="email" />`}
                        inputElement={<input type="email" placeholder="email@example.com" className="input"/>}
                    />
                    <InputCard
                        title="Password"
                        description="Mot de passe masqué"
                        code={`<input type="password" name="password" />`}
                        inputElement={<input type="password" placeholder="••••••" className="input"/>}
                    />
                    <InputCard
                        title="Tel"
                        description="Numéro de téléphone"
                        code={`<input type="tel" name="phone" />`}
                        inputElement={<input type="tel" placeholder="06 12 34 56 78" className="input"/>}
                    />
                </Grid>

                <Heading level={4}>Sélections</Heading>
                <Grid templateColumns={{base: "1fr", md: "repeat(2, 1fr)"}} gap={6} width="100%">
                    <InputCard
                        title="Checkbox"
                        description="Choix multiples"
                        code={`<input type="checkbox" name="agree" />`}
                        inputElement={
                            <>
                                <label><input type="checkbox"/> Option 1</label>
                                <label><input type="checkbox"/> Option 2</label>
                            </>
                        }
                    />
                    <InputCard
                        title="Radio"
                        description="Choix unique"
                        code={`<input type="radio" name="choice" value="1" />`}
                        inputElement={
                            <>
                                <label><input type="radio" name="ex" value="1"/> Option 1</label>
                                <label><input type="radio" name="ex" value="2"/> Option 2</label>
                            </>
                        }
                    />
                    <InputCard
                        title="Select"
                        description="Menu déroulant"
                        code={`<select name="fruit">
  <option>Apple</option>
</select>`}
                        inputElement={
                            <select className="input">
                                <option>Apple</option>
                                <option>Banana</option>
                                <option>Cherry</option>
                            </select>
                        }
                    />
                    <InputCard
                        title="Textarea"
                        description="Texte multiligne"
                        code={`<textarea name="message" rows="4"></textarea>`}
                        inputElement={<textarea rows={4} placeholder="Votre message..." className="input"/>}
                    />
                </Grid>

                <Heading level={4}>Date et nombre</Heading>
                <Grid templateColumns={{base: "1fr", md: "repeat(2, 1fr)"}} gap={6} width="100%">
                    <InputCard
                        title="Date"
                        description="Sélecteur de date"
                        code={`<input type="date" name="birthday" />`}
                        inputElement={<input type="date" className="input"/>}
                    />
                    <InputCard
                        title="Number"
                        description="Nombre avec contrôles"
                        code={`<input type="number" min="0" max="100" />`}
                        inputElement={<input type="number" min="0" max="100" className="input"/>}
                    />
                    <InputCard
                        title="Time"
                        description="Sélecteur d'heure"
                        code={`<input type="time" name="appointment" />`}
                        inputElement={<input type="time" className="input"/>}
                    />
                    <InputCard
                        title="Color"
                        description="Sélecteur de couleur"
                        code={`<input type="color" name="favorite" />`}
                        inputElement={<input type="color" className="input"/>}
                    />
                </Grid>

                <Heading level={3}>3. Validation et attributs</Heading>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Attribut</TableHead>
                            <TableHead>Effet</TableHead>
                            <TableHead>Exemple</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>required</Code></TableCell>
                            <TableCell>Champ obligatoire</TableCell>
                            <TableCell><Code>required</Code></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>placeholder</Code></TableCell>
                            <TableCell>Texte d&apos;aide</TableCell>
                            <TableCell><Code>placeholder=&quot;Votre nom&quot;</Code></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>pattern</Code></TableCell>
                            <TableCell>Format regex</TableCell>
                            <TableCell><Code>pattern=&quot;[0-9]{'{5}'}&quot;</Code></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>min / max</Code></TableCell>
                            <TableCell>Valeurs limites</TableCell>
                            <TableCell><Code>min=&quot;18&quot; max=&quot;99&quot;</Code></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>disabled</Code></TableCell>
                            <TableCell>Désactivé (non envoyé)</TableCell>
                            <TableCell><Code>disabled</Code></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>readonly</Code></TableCell>
                            <TableCell>Lecture seule (envoyé)</TableCell>
                            <TableCell><Code>readonly</Code></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>4. Autocomplete intelligent</Heading>
                <Text>
                    L&quot;attribut <Code>autocomplete</Code> permet au navigateur de suggérer des valeurs sauvegardées.
                    Valeurs courantes : <Code>name</Code>, <Code>email</Code>, <Code>tel</Code>, <Code>street-address</Code>,
                    <Code>postal-code</Code>, <Code>cc-number</Code>, <Code>new-password</Code>, <Code>current-password</Code>.
                </Text>

                <CodeWithPreviewCard language="html">
                    <CodePanel>
                        {`<form method="post">
    <input type="text" name="firstname" 
           autocomplete="given-name" 
           placeholder="Prénom">
    
    <input type="email" name="email" 
           autocomplete="email" 
           placeholder="Email">
    
    <input type="password" name="password" 
           autocomplete="new-password" 
           placeholder="Mot de passe">
</form>`}
                    </CodePanel>
                    <PreviewPanel>
                        <form>
                            <input type="text" autoComplete="given-name" placeholder="Prénom" className="input"/>
                            <input type="email" autoComplete="email" placeholder="Email" className="input"/>
                            <input type="password" autoComplete="new-password" placeholder="Mot de passe" className="input"/>
                        </form>
                    </PreviewPanel>
                </CodeWithPreviewCard>
            </section>

            {/* PARTIE B : PHP */}
            <section>
                <Heading level={2}>B- Transmission des données en PHP</Heading>

                <Heading level={3}>1. Les méthodes GET et POST</Heading>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Caractéristiques</TableHead>
                            <TableHead>Usage recommandé</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Code>GET</Code></TableCell>
                            <TableCell>
                                • Données visibles dans l&quot;URL<br/>
                                • Limité à ~2000 caractères<br/>
                                • Peut être bookmarké<br/>
                                • Mise en cache possible
                            </TableCell>
                            <TableCell>Recherches, filtres, pagination</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell><Code>POST</Code></TableCell>
                            <TableCell>
                                • Données invisibles (corps HTTP)<br/>
                                • Pas de limite de taille<br/>
                                • Plus sécurisé<br/>
                                • Non mis en cache
                            </TableCell>
                            <TableCell>Connexion, inscription, modifications</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Heading level={3}>2. Récupération avec $_GET</Heading>
                <Text>
                    La superglobale <Code>$_GET</Code> récupère les données envoyées via l&quot;URL.
                    Le nom du paramètre correspond à l&quot;attribut <Code>name</Code> du champ HTML.
                </Text>

                <CodeCard language="html">
                    {`<!-- search.php -->
<form action="search.php" method="get">
    <input type="text" name="query" placeholder="Recherche">
    <select name="category">
        <option value="all">Toutes</option>
        <option value="news">Actualités</option>
        <option value="docs">Documentation</option>
    </select>
    <button type="submit">Rechercher</button>
</form>`}
                </CodeCard>

                <Text>
                    URL générée : <Code>search.php?query=php&category=news</Code>
                </Text>

                <CodeCard language="php">
                    {`<?php
// search.php - Traitement côté serveur

// Récupération des données GET
$query = $_GET['query'] ?? '';      // Correspond à name="query"
$category = $_GET['category'] ?? 'all';  // Correspond à name="category"

// Sécurisation (IMPORTANT)
$query = htmlspecialchars($query, ENT_QUOTES, 'UTF-8');
$category = htmlspecialchars($category, ENT_QUOTES, 'UTF-8');

// Utilisation
if (!empty($query)) {
    echo "Recherche de : " . $query;
    echo "<br>Catégorie : " . $category;
    
    // Ici : requête base de données, etc.
} else {
    echo "Veuillez saisir une recherche.";
}
?>`}
                </CodeCard>

                <Heading level={3}>3. Récupération avec $_POST</Heading>
                <Text>
                    La superglobale <Code>$_POST</Code> récupère les données du corps de la requête HTTP.
                    Les données ne sont pas visibles dans l&quot;URL.
                </Text>

                <CodeCard language="html">
                    {`<!-- login.php -->
<form action="login.php" method="post">
    <label for="username">Nom d'utilisateur :</label>
    <input type="text" name="username" id="username" required>
    
    <label for="password">Mot de passe :</label>
    <input type="password" name="password" id="password" required>
    
    <button type="submit">Se connecter</button>
</form>`}
                </CodeCard>

                <CodeCard language="php">
                    {`<?php
// login.php - Traitement côté serveur

// Récupération des données POST
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Sécurisation pour l'affichage
$username = htmlspecialchars($username, ENT_QUOTES, 'UTF-8');

// Validation
if (empty($username) || empty($password)) {
    echo "Tous les champs sont obligatoires.";
    exit;
}

// Vérification en base de données (exemple simplifié)
// En production : utiliser password_verify() avec hash en BDD
if ($username === 'admin' && $password === 'secret') {
    echo "Connexion réussie pour : " . $username;
    // Démarrer une session, rediriger, etc.
} else {
    echo "Identifiants incorrects.";
}
?>`}
                </CodeCard>

                <Heading level={3}>4. $_SERVER[&quot;REQUEST_METHOD&quot;] : Détection de la méthode</Heading>
                <Text>
                    <Code>$_SERVER[&quot;REQUEST_METHOD&quot;]</Code> permet de connaître la méthode HTTP utilisée.
                    C&quot;est utile pour créer un fichier qui affiche le formulaire ET traite les données.
                </Text>

                <CodeCard language="php">
                    {`<?php
// contact.php - Formulaire et traitement dans le même fichier

$errors = [];
$success = false;
$name = '';
$email = '';
$message = '';

// Traitement UNIQUEMENT si méthode POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupération des données
    $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8'); //htmlspecialchars uniquement pour traiter la faille XSS. La récuperation de la valeur ce fait via $_POST['name']? ?? permet de gérer le cas du NULL
    $email = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Validation côté serveur
    if (empty($name)) {
        $errors[] = "Le nom est requis.";
    }
    
    if (empty($email)) {
        $errors[] = "L'email est requis.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "L'email n'est pas valide.";
    }
    
    if (empty($message)) {
        $errors[] = "Le message est requis.";
    } elseif (strlen($message) < 10) {
        $errors[] = "Le message doit contenir au moins 10 caractères.";
    }
    
    // Si aucune erreur
    if (empty($errors)) {
        $success = true;
        // Traitement : envoi email, insertion BDD, etc.
        
        // Réinitialiser les champs après succès
        $name = '';
        $email = '';
        $message = '';
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Formulaire de contact</title>
    <style>
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Contactez-nous</h1>
    
    <?php if ($success): ?>
        <p class="success">✓ Votre message a été envoyé avec succès !</p>
    <?php endif; ?>
    
    <?php if (!empty($errors)): ?>
        <div class="error">
            <ul>
                <?php foreach ($errors as $error): ?>
                    <li><?= $error ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    <?php endif; ?>
    
    <form method="post">
        <div>
            <label for="name">Nom :</label>
            <input type="text" name="name" id="name" 
                   value="<?= $name ?>" required>
        </div>
        
        <div>
            <label for="email">Email :</label>
            <input type="email" name="email" id="email" 
                   value="<?= $email ?>" required>
        </div>
        
        <div>
            <label for="message">Message :</label>
            <textarea name="message" id="message" rows="5" required><?= $message ?></textarea>
        </div>
        
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>`}
                </CodeCard>

                <Text>
                    <strong>Avantages de cette approche :</strong>
                </Text>
                <List>
                    <ListItem>Un seul fichier pour le formulaire et le traitement</ListItem>
                    <ListItem>Les erreurs sont affichées directement</ListItem>
                    <ListItem>Les valeurs saisies sont conservées en cas d&quot;erreur</ListItem>
                    <ListItem>Meilleure expérience utilisateur</ListItem>
                </List>

                <Heading level={3}>5. Validation côté serveur</Heading>
                <Text>
                    <strong>IMPORTANT :</strong> Ne jamais faire confiance aux données du client.
                    Toujours valider côté serveur même avec validation HTML5.
                </Text>

                <CodeCard language="php">
                    {`<?php
// Validation d'un email
$email = $_POST['email'] ?? '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Email invalide";
}

// Validation d'une URL
$website = $_POST['website'] ?? '';
if (!filter_var($website, FILTER_VALIDATE_URL)) {
    $errors[] = "URL invalide";
}

// Validation d'un nombre
$age = $_POST['age'] ?? '';
if (!is_numeric($age) || $age < 18 || $age > 120) {
    $errors[] = "Âge invalide (18-120)";
}

// Validation de la longueur
$password = $_POST['password'] ?? '';
if (strlen($password) < 8) {
    $errors[] = "Le mot de passe doit contenir au moins 8 caractères";
}

// Validation d'un format spécifique
$postal_code = $_POST['postal_code'] ?? '';
if (!preg_match('/^[0-9]{5}$/', $postal_code)) {
    $errors[] = "Code postal invalide (5 chiffres)";
}
?>`}
                </CodeCard>

                <Heading level={3}>6. Traitement des checkboxes et radio</Heading>

                <CodeCard language="html">
                    {`<!-- Checkboxes (choix multiples) -->
<form method="post">
    <label><input type="checkbox" name="hobbies[]" value="sport"> Sport</label>
    <label><input type="checkbox" name="hobbies[]" value="music"> Musique</label>
    <label><input type="checkbox" name="hobbies[]" value="reading"> Lecture</label>
    
    <!-- Radio (choix unique) -->
    <label><input type="radio" name="gender" value="M"> Homme</label>
    <label><input type="radio" name="gender" value="F"> Femme</label>
    <label><input type="radio" name="gender" value="O"> Autre</label>
    
    <button type="submit">Envoyer</button>
</form>`}
                </CodeCard>

                <CodeCard language="php">
                    {`<?php
// Traitement des checkboxes (tableau)
$hobbies = $_POST['hobbies'] ?? [];
if (!empty($hobbies)) {
    echo "Hobbies sélectionnés :<br>";
    foreach ($hobbies as $hobby) {
        $hobby = htmlspecialchars($hobby, ENT_QUOTES, 'UTF-8');
        echo "- " . $hobby . "<br>";
    }
}

// Traitement des radio (valeur unique)
$gender = $_POST['gender'] ?? '';
$gender = htmlspecialchars($gender, ENT_QUOTES, 'UTF-8');

$valid_genders = ['M', 'F', 'O'];
if (in_array($gender, $valid_genders)) {
    echo "Genre : " . $gender;
} else {
    echo "Sélection invalide";
}
?>`}
                </CodeCard>

                <Heading level={3}>7. $_REQUEST : à éviter</Heading>
                <Text>
                    <Code>$_REQUEST</Code> contient les données de <Code>$_GET</Code>, <Code>$_POST</Code> et <Code>$_COOKIE</Code>.
                    Son utilisation n&quot;est pas recommandée car elle ne permet pas de distinguer la source des données
                    et peut créer des conflits.
                </Text>

                <CodeCard language="php">
                    {`<?php
// ❌ DÉCONSEILLÉ : Source ambiguë
$username = $_REQUEST['username'];

// ✅ RECOMMANDÉ : Source explicite
$username = $_POST['username'] ?? '';
// OU
$username = $_GET['username'] ?? '';
?>`}
                </CodeCard>
            </section>

            {/* PARTIE C : SÉCURITÉ */}
            <section>
                <Heading level={2}>C- Sécurisation des données : Protection XSS</Heading>

                <Heading level={3}>Qu&quot;est-ce qu&quot;une attaque XSS ?</Heading>
                <Text>
                    XSS (Cross-Site Scripting) est une vulnérabilité qui permet d&quot;injecter du code JavaScript malveillant.
                    Sans protection, un attaquant peut voler des cookies, des sessions, ou manipuler le contenu de la page.
                </Text>

                <CodeCard language="php">
                    {`<?php
// ❌ VULNÉRABLE : Injection possible
$name = $_POST['name'];
echo "Bonjour " . $name;
// Si $name = "<script>alert('XSS')</script>" → Le script s'exécute !

// ✅ SÉCURISÉ : htmlspecialchars() neutralise le code
$name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
echo "Bonjour " . $name;
// Le script est affiché comme texte : &lt;script&gt;alert('XSS')&lt;/script&gt;
?>`}
                </CodeCard>

                <Heading level={3}>Règle d&quot;or : TOUJOURS utiliser htmlspecialchars()</Heading>
                <Text>
                    Cette fonction convertit les caractères dangereux (<Code>&lt;</Code>, <Code>&gt;</Code>,
                    <Code>&quot;</Code>, <Code>&apos;</Code>) en entités HTML inoffensives.
                </Text>

                <CodeCard language="php">
                    {`<?php
// Syntaxe complète recommandée
$safe_data = htmlspecialchars(
    $user_input,      // Données à sécuriser
    ENT_QUOTES,       // Convertir " et '
    'UTF-8'           // Encodage
);

// Exemples pratiques

// 1. Affichage dans le HTML
$comment = htmlspecialchars($_POST['comment'] ?? '', ENT_QUOTES, 'UTF-8');
echo "<p>" . $comment . "</p>";

// 2. Dans un attribut HTML (CRITIQUE)
$username = htmlspecialchars($_POST['username'] ?? '', ENT_QUOTES, 'UTF-8');
echo '<input type="text" value="' . $username . '">';

// 3. Dans une URL (combiner avec urlencode)
$search = htmlspecialchars($_GET['search'] ?? '', ENT_QUOTES, 'UTF-8');
echo '<a href="results.php?q=' . urlencode($search) . '">' . $search . '</a>';
?>`}
                </CodeCard>

                <Text>
                    <strong>Protection systématique :</strong> Sécuriser dès la récupération des données
                    pour éviter les oublis.
                </Text>

                <CodeCard language="php">
                    {`<?php
// Bonne pratique : sécuriser immédiatement
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
    $email = htmlspecialchars($_POST['email'] ?? '', ENT_QUOTES, 'UTF-8');
    $message = htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // Maintenant toutes les variables sont sûres pour l'affichage
}
?>`}
                </CodeCard>
            </section>

            {/* RÉCAPITULATIF */}
            <section className="p-6 bg-gray-50 rounded">
                <Heading level={2}>D- Récapitulatif et bonnes pratiques</Heading>

                <Heading level={3}>HTML</Heading>
                <List>
                    <ListItem>Attribut <Code>name</Code> obligatoire sur chaque input (utilisé en PHP)</ListItem>
                    <ListItem>Attribut <Code>id</Code> pour lier au <Code>&lt;label&gt;</Code></ListItem>
                    <ListItem>Validation HTML5 : <Code>required</Code>, <Code>pattern</Code>, <Code>min/max</Code></ListItem>
                    <ListItem>Autocomplete pour améliorer l&quot;expérience utilisateur</ListItem>
                </List>

                <Heading level={3}>PHP</Heading>
                <List>
                    <ListItem><Code>GET</Code> : pour recherches, filtres (données dans l&quot;URL)</ListItem>
                    <ListItem><Code>POST</Code> : pour inscriptions, connexions (données cachées)</ListItem>
                    <ListItem>Utiliser <Code>$_SERVER[&quot;REQUEST_METHOD&quot;]</Code> pour détecter la méthode</ListItem>
                    <ListItem>Toujours valider côté serveur (ne jamais faire confiance au client)</ListItem>
                    <ListItem>Opérateur <Code>??</Code> pour valeurs par défaut : <Code>$var = $_POST[&quot;field&quot;] ?? &quot;&quot;</Code></ListItem>
                </List>

                <Heading level={3}>Sécurité</Heading>
                <List>
                    <ListItem><strong>TOUJOURS</strong> utiliser <Code>htmlspecialchars($data, ENT_QUOTES, &quot;UTF-8&quot;)</Code></ListItem>
                    <ListItem>Validation email : <Code>filter_var($email, FILTER_VALIDATE_EMAIL)</Code></ListItem>
                    <ListItem>Validation des données : longueur, format, valeurs autorisées</ListItem>
                    <ListItem>Messages d&quot;erreur clairs et utiles pour l&quot;utilisateur</ListItem>
                </List>

                <Heading level={3}>Structure recommandée</Heading>
                <CodeCard language="php">
                    {`<?php
// 1. Initialisation des variables
$errors = [];
$success = false;
$field1 = '';
$field2 = '';

// 2. Traitement si POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 3. Récupération + sécurisation
    $field1 = htmlspecialchars($_POST['field1'] ?? '', ENT_QUOTES, 'UTF-8');
    $field2 = htmlspecialchars($_POST['field2'] ?? '', ENT_QUOTES, 'UTF-8');
    
    // 4. Validation
    if (empty($field1)) {
        $errors[] = "Le champ 1 est requis";
    }
    
    // 5. Traitement si valide
    if (empty($errors)) {
        $success = true;
        // Insertion BDD, envoi email, etc.
    }
}
?>
<!DOCTYPE html>
<html>
<body>
    <?php if ($success): ?>
        <p class="success">Succès !</p>
    <?php endif; ?>
    
    <?php foreach ($errors as $error): ?>
        <p class="error"><?= $error ?></p>
    <?php endforeach; ?>
    
    <form method="post">
        <input type="text" name="field1" value="<?= $field1 ?>" required>
        <button type="submit">Envoyer</button>
    </form>
</body>
</html>`}
                </CodeCard>
            </section>
        </article>
    );
}