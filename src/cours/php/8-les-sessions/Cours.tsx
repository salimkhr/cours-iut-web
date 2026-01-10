import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text"
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";

export default function Cours() {
    return (
        <article>
            {/* SECTION 1 : INTRODUCTION */}
            <section>
                <Heading level={2}>Introduction aux Sessions</Heading>
                <Text>
                    Les <strong>sessions</strong> sont un mécanisme permettant de conserver des données
                    d'un utilisateur entre plusieurs requêtes HTTP. Contrairement au protocole HTTP qui est
                    <strong> sans état</strong> (stateless), les sessions permettent de maintenir un état
                    pour chaque utilisateur.
                </Text>
                <Text>
                    En PHP, les données de session sont stockées <strong>côté serveur</strong>,
                    généralement dans des fichiers sur le disque. Chaque session est identifiée par un
                    <strong> identifiant unique</strong> (session ID) qui est transmis au client via un
                    cookie nommé <Code>PHPSESSID</Code> par défaut.
                </Text>
                <Text>
                    Les sessions sont particulièrement utiles pour :
                </Text>
                <ul className="list-disc pl-6 my-3 space-y-1 text-gray-700">
                    <li>Gérer l'authentification des utilisateurs</li>
                    <li>Conserver un panier d'achat</li>
                    <li>Maintenir des préférences utilisateur temporaires</li>
                    <li>Stocker des messages flash (notifications temporaires)</li>
                </ul>
            </section>

            {/* SECTION 2 : INITIALISATION */}
            <section>
                <Heading level={2}>Initialisation d'une Session</Heading>

                <Text>
                    Pour utiliser les sessions en PHP, il est <strong>obligatoire</strong> d'appeler la
                    fonction <Code>session_start()</Code> au début de chaque page qui utilise les sessions.
                    Cette fonction doit être appelée <strong>avant tout envoi de contenu HTML</strong>.
                </Text>

                <CodeCard language="php">
                    {`<?php
// Démarrage de la session
session_start();

// Maintenant on peut utiliser le tableau superglobal $_SESSION
?>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>⚠️ Attention critique :</AlertTitle>
                    <AlertDescription>
                        <Text className="mt-5">
                            <Code>session_start()</Code> doit être appelé <strong>avant tout output</strong>
                            (HTML, echo, espaces, sauts de ligne). Sinon, PHP génère l'erreur :
                            <Code>"Cannot modify header information - headers already sent"</Code>.
                        </Text>
                    </AlertDescription>
                </Alert>

                <Text className="mt-5">
                    Lorsque <Code>session_start()</Code> est appelée, PHP effectue les opérations suivantes :
                </Text>
                <ul className="list-disc pl-6 my-3 space-y-1 text-gray-700">
                    <li>Vérifie si un cookie de session existe</li>
                    <li>Si oui, charge les données de session existantes</li>
                    <li>Si non, crée une nouvelle session avec un ID unique</li>
                    <li>Envoie le cookie de session au navigateur</li>
                </ul>

                <CodeCard language="php">
                    {`<?php
// Exemple complet d'initialisation
session_start();

// Vérifier si la session est active
if (session_status() === PHP_SESSION_ACTIVE) {
    echo "Session active avec l'ID : " . session_id();
} else {
    echo "Aucune session active";
}
?>`}
                </CodeCard>
            </section>

            {/* SECTION 3 : STOCKAGE */}
            <section>
                <Heading level={2}>Stockage de Données dans la Session</Heading>

                <Text>
                    Les données de session sont stockées dans le tableau superglobal <Code>$_SESSION</Code>.
                    Ce tableau associatif peut contenir n'importe quel type de données sérialisable.
                </Text>

                <Heading level={3}>Stockage des types primitifs</Heading>

                <Text>
                    Les types primitifs (entiers, chaînes, booléens, flottants) et les tableaux simples
                    peuvent être directement stockés dans <Code>$_SESSION</Code>.
                </Text>

                <CodeCard language="php">
                    {`<?php
session_start();

// Stockage de types primitifs
$_SESSION['username'] = 'Alice';           // String
$_SESSION['user_id'] = 42;                 // Integer
$_SESSION['is_logged_in'] = true;          // Boolean
$_SESSION['score'] = 98.5;                 // Float
$_SESSION['last_login'] = time();          // Timestamp

// Stockage de tableaux simples
$_SESSION['preferences'] = [
    'theme' => 'dark',
    'language' => 'fr',
    'notifications' => true
];

// Stockage d'un tableau indexé
$_SESSION['visited_pages'] = [
    '/home',
    '/products',
    '/contact'
];

// Stockage d'un tableau multidimensionnel
$_SESSION['cart'] = [
    [
        'id' => 1,
        'name' => 'Laptop',
        'price' => 999.99,
        'quantity' => 1
    ],
    [
        'id' => 2,
        'name' => 'Mouse',
        'price' => 25.50,
        'quantity' => 2
    ]
];
?>`}
                </CodeCard>

                <Heading level={3}>Sérialisation et Stockage d'Objets en Session</Heading>

                <Text>
                    PHP permet également de stocker des objets dans la session. Ces objets sont
                    automatiquement <strong>sérialisés</strong> lors du stockage et
                    <strong>désérialisés</strong> lors de la récupération.
                </Text>

                <CodeCard language="php">
                    {`<?php
session_start();

// Définition d'une classe User
class User
{
    private int $id;
    private string $username;
    private string $email;
    
    public function __construct(int $id, string $username, string $email)
    {
        $this->id = $id;
        $this->username = $username;
        $this->email = $email;
    }
    
    public function getId(): int
    {
        return $this->id;
    }
    
    public function getUsername(): string
    {
        return $this->username;
    }
    
    public function getEmail(): string
    {
        return $this->email;
    }
}

// Création et stockage d'un objet User en session
$user = new User(42, 'Alice', 'alice@example.com');
$_SESSION['user'] = $user;

// PHP sérialise automatiquement l'objet
?>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>⚠️ Attention avec les objets :</AlertTitle>
                    <AlertDescription>
                        <Text>
                            La classe de l'objet doit être <strong>définie ou chargée AVANT</strong>
                            l'appel à <Code>session_start()</Code> pour que la désérialisation fonctionne
                            correctement. Sinon, l'objet sera converti en instance de la classe
                            <Code>__PHP_Incomplete_Class</Code>.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            {/* SECTION 4 : SÉRIALISATION */}
            <section>
                <Heading level={2}>Sérialisation des objets</Heading>

                <Text>
                    La <strong>sérialisation</strong> est le processus de conversion d'un objet en une
                    chaîne de caractères qui peut être stockée ou transmise. PHP gère automatiquement
                    la sérialisation des objets stockés en session, mais il est important de comprendre
                    ce mécanisme.
                </Text>

                <CodeCard language="php">
                    {`<?php
// Exemple de sérialisation manuelle (à titre démonstratif)

class Product
{
    private int $id;
    private string $name;
    private float $price;
    
    public function __construct(int $id, string $name, float $price)
    {
        $this->id = $id;
        $this->name = $name;
        $this->price = $price;
    }
    
    public function getInfo(): string
    {
        return "Product #{$this->id}: {$this->name} - {$this->price}€";
    }
}

$product = new Product(1, 'Laptop', 999.99);

// Sérialisation manuelle
$serialized = serialize($product);
echo $serialized;
// Output: O:7:"Product":3:{s:2:"id";i:1;s:4:"name";s:6:"Laptop";s:5:"price";d:999.99;}

// Désérialisation manuelle
$unserialized = unserialize($serialized);
echo $unserialized->getInfo();
// Output: Product #1: Laptop - 999.99€
?>`}
                </CodeCard>

                <Text>
                    En session, ce processus est automatique :
                </Text>

                <CodeCard language="php">
                    {`<?php
// page1.php - Stockage de l'objet
session_start();

require_once 'Product.php';

$product = new Product(1, 'Laptop', 999.99);
$_SESSION['product'] = $product; // Sérialisation automatique

// ---

// page2.php - Récupération de l'objet
session_start();

require_once 'Product.php'; // IMPORTANT : Charger la classe avant !

$product = $_SESSION['product']; // Désérialisation automatique
echo $product->getInfo();
?>`}
                </CodeCard>

                <Heading level={3}>Méthodes magiques de sérialisation</Heading>

                <Text>
                    PHP offre des méthodes magiques pour contrôler le processus de sérialisation :
                </Text>

                <CodeCard language="php">
                    {`<?php
class User
{
    private int $id;
    private string $username;
    private string $password; // Ne pas sérialiser !
    private $dbConnection;    // Ne pas sérialiser !
    
    public function __construct(int $id, string $username)
    {
        $this->id = $id;
        $this->username = $username;
    }
    
    // Alternative moderne à __sleep et __wakeup (PHP 7.4+)
    public function __serialize(): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username
        ];
    }
    
    public function __unserialize(array $data): void
    {
        $this->id = $data['id'];
        $this->username = $data['username'];
    }
}
?>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>⚠️ Propriétés à ne jamais sérialiser :</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Ressources fichiers ouvertes</li>
                            <li>Mots de passe en clair</li>
                            <li>Données sensibles non chiffrées</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </section>

            {/* SECTION 5 : RÉCUPÉRATION */}
            <section>
                <Heading level={2}>Récupération de Données de la Session</Heading>

                <Text>
                    Pour récupérer des données de session, il suffit d'accéder au tableau
                    <Code>$_SESSION</Code> après avoir appelé <Code>session_start()</Code>.
                </Text>

                <Heading level={3}>Récupération des types primitifs</Heading>

                <CodeCard language="php">
                    {`<?php
session_start();

// Récupération simple
$username = $_SESSION['username'];
$userId = $_SESSION['user_id'];

// Vérification de l'existence avant récupération
if (isset($_SESSION['username'])) {
    echo "Bienvenue " . htmlspecialchars($_SESSION['username']);
} else {
    echo "Vous n'êtes pas connecté";
}

// Utilisation de l'opérateur null coalescent (??)
$username = $_SESSION['username'] ?? 'Invité';
$theme = $_SESSION['preferences']['theme'] ?? 'light';

// Récupération d'un tableau
$cart = $_SESSION['cart'] ?? [];
$itemCount = count($cart);

// Vérification avec empty()
if (empty($_SESSION['cart'])) {
    echo "Votre panier est vide";
} else {
    echo "Vous avez " . count($_SESSION['cart']) . " articles";
}

// Récupération de valeurs multiples
$username = $_SESSION['username'] ?? null;
$email = $_SESSION['email'] ?? null;
$role = $_SESSION['role'] ?? 'guest';

if ($username && $email) {
    echo "Utilisateur : $username ($email) - Rôle : $role";
}
?>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>💡 Bonne pratique :</AlertTitle>
                    <AlertDescription>
                        <Text>
                            Utilisez toujours <Code>isset()</Code> ou l'opérateur <Code>??</Code> avant
                            d'accéder à une variable de session pour éviter les erreurs si elle n'existe pas.
                        </Text>
                    </AlertDescription>
                </Alert>

                <Heading level={3}>Récupération et désérialisation d'Objets en Session</Heading>

                <Text>
                    Lorsqu'on récupère un objet stocké en session, PHP le désérialise automatiquement.
                    Il est crucial que la <strong>classe soit chargée avant</strong>
                    <Code>session_start()</Code>.
                </Text>

                <CodeCard language="php">
                    {`<?php
// IMPORTANT : Charger la classe AVANT session_start()
require_once 'app/models/User.php';
require_once 'app/models/Product.php';

// Démarrage de la session (désérialisation automatique)
session_start();

// Récupération d'un objet User
if (isset($_SESSION['user'])) {
    $user = $_SESSION['user']; // Objet User désérialisé
    echo "ID : " . $user->getId() . "<br>";
    echo "Username : " . $user->getUsername() . "<br>";
    echo "Email : " . $user->getEmail() . "<br>";
    
    // On peut appeler les méthodes de l'objet
    if (method_exists($user, 'isAdmin')) {
        if ($user->isAdmin()) {
            echo "Cet utilisateur est administrateur";
        }
    }
}

// Récupération d'un objet avec vérification de type
$user = $_SESSION['user'] ?? null;

if ($user instanceof User) {
    // L'objet est bien une instance de User
    echo "Bienvenue " . $user->getUsername();
} else {
    echo "Aucun utilisateur connecté";
}

// Récupération d'un tableau d'objets
if (isset($_SESSION['cart_items'])) {
    foreach ($_SESSION['cart_items'] as $product) {
        if ($product instanceof Product) {
            echo $product->getName() . " - " . $product->getPrice() . "€<br>";
        }
    }
}
?>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>⚠️ Erreur fréquente :</AlertTitle>
                    <AlertDescription>
                        <Text>
                            Si la classe n'est pas chargée avant <Code>session_start()</Code>, l'objet
                            sera converti en <Code>__PHP_Incomplete_Class</Code> et sera inutilisable.
                        </Text>
                    </AlertDescription>
                </Alert>
            </section>

            {/* SECTION 6 : DESTRUCTION */}
            <section>
                <Heading level={2}>Destruction d'une Session</Heading>

                <Text>
                    La destruction d'une session est essentielle lors de la déconnexion d'un utilisateur.
                    Il faut suivre un processus complet pour s'assurer que toutes les données sont
                    correctement supprimées.
                </Text>

                <Heading level={3}>Destruction complète</Heading>

                <CodeCard language="php">
                    {`<?php
// logout.php - Déconnexion complète

session_start();

// Étape 1 : Vider le tableau $_SESSION
$_SESSION = [];

// Étape 2 : Supprimer le cookie de session côté client
if (isset($_COOKIE[session_name()])) {
    setcookie(
        session_name(),           // Nom du cookie (PHPSESSID par défaut)
        '',                       // Valeur vide
        time() - 3600,            // Date d'expiration dans le passé
        '/'                       // Chemin (doit correspondre au chemin original)
    );
}

// Étape 3 : Détruire la session côté serveur
session_destroy();

// Étape 4 : Redirection vers la page de connexion
header('Location: login.php');
exit;
?>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>⚠️ Ordre important :</AlertTitle>
                    <AlertDescription>
                        <Text>
                            Il est crucial de suivre cet ordre : vider <Code>$_SESSION</Code>,
                            supprimer le cookie, puis appeler <Code>session_destroy()</Code>.
                            Sinon, des données peuvent persister.
                        </Text>
                    </AlertDescription>
                </Alert>

                <Heading level={3}>Suppression de variables spécifiques</Heading>

                <Text>
                    Pour supprimer uniquement certaines variables sans détruire toute la session :
                </Text>

                <CodeCard language="php">
                    {`<?php
session_start();

// Supprimer une variable spécifique
unset($_SESSION['cart']);
unset($_SESSION['temp_data']);

// Supprimer plusieurs variables
unset(
    $_SESSION['flash_message'],
    $_SESSION['form_data'],
    $_SESSION['temp_token']
);

// Vérification après suppression
if (!isset($_SESSION['cart'])) {
    echo "Le panier a été vidé";
}

// L'utilisateur reste connecté, seules les variables spécifiées sont supprimées
if (isset($_SESSION['user_id'])) {
    echo "Vous êtes toujours connecté";
}
?>`}
                </CodeCard>
            </section>
        </article>
    );
}