import React from 'react';
import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";
import DiagramCard from "@/components/Cards/DiagramCard";
import Code from "@/components/ui/Code";
import BaseCard from "@/components/Cards/BaseCard";

export default function Cours() {
    const chartMVCAvance = `
sequenceDiagram
    participant Utilisateur
    participant EntryPoint as Point d'entrée<br/>public/register.php
    participant Controller as UserController
    participant Service as UserService
    participant Repository as UserRepository
    participant DB as Base de données
    participant Email as EmailService
    participant Audit as AuditService
    participant View as Vue<br/>register.php

    Utilisateur->>EntryPoint: Requête HTTP
    EntryPoint->>Controller: Instanciation du contrôleur
    Controller->>Service: Appelle le service UserService
    Service->>Repository: Utilise le UserRepository
    Repository->>DB: Accès à la base de données
    DB-->>Repository: Résultat de la requête
    Repository-->>Service: Données récupérées
    Service->>Email: Envoi d’un email
    Service->>Audit: Journalisation de l’action
    Email-->>Service: Confirmation d’envoi
    Audit-->>Service: Confirmation d’audit
    Service-->>Controller: Résultat du traitement
    Controller->>View: Appelle la vue register.php
    View-->>Utilisateur: Retourne le HTML généré
`;

    const chartSOLID = `
graph TD
    A[SOLID] --> B[S - Single Responsibility]
    A --> C[O - Open/Closed]
    A --> D[L - Liskov Substitution]
    A --> E[I - Interface Segregation]
    A --> F[D - Dependency Inversion]
    
    B --> B1[Une classe = une responsabilité]
    C --> C1[Ouvert à l'extension<br/>Fermé à la modification]
    D --> D1[Les sous-classes peuvent<br/>remplacer les classes parentes]
    E --> E1[Interfaces spécifiques<br/>plutôt que générales]
    F --> F1[Dépendre d'abstractions<br/>pas d'implémentations]
`;

    return (
        <article>
            <section>
                <Heading level={2}>Introduction</Heading>
                <Text>
                    Dans ce cours, vous allez approfondir l&apos;architecture MVC en y ajoutant une couche de services
                    et en appliquant les principes SOLID pour obtenir un code professionnel, testable et maintenable.
                </Text>
                <List>
                    <ListItem>Comprendre le rôle de la couche service dans l&apos;architecture MVC</ListItem>
                    <ListItem>Appliquer les principes SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)</ListItem>
                    <ListItem>Refactorer un code monolithique vers une Clean Architecture</ListItem>
                </List>
            </section>
            <section>
                <Heading level={2}>A- Ajout des services à notre architecture MVC</Heading>
                <Text>
                    Les services sont un des principes de l&apos;architecture MVC (Modèle - Vue - Contrôleur).
                    Dans notre architecture, les <strong>services</strong> représentent une couche supplémentaire entre
                    les contrôleurs et les modèles (ou repositories).
                    Ils permettent d&apos;extraire la<strong> logique métier </strong> complexe des contrôleurs pour les
                    rendre plus clairs, plus testables et plus
                    faciles à maintenir.
                </Text>
                <Text className="mt-2">
                    Le but est donc de ne plus laisser les contrôleurs exécuter directement des opérations métiers, mais
                    de déléguer cette responsabilité aux services. Les contrôleurs orchestrent, les services exécutent.
                </Text>

                <Heading level={3}>1. Étapes pour ajouter un service</Heading>
                <List ordered>
                    <ListItem>
                        <strong>Créer un dossier <Code>/app/services</Code></strong> s&apos;il n&apos;existe pas déjà.
                        Ce dossier contiendra tous les services de votre application (un par entité ou par
                        fonctionnalité).
                    </ListItem>
                    <ListItem>
                        <strong>Créer votre premier service</strong> — par exemple,
                        <Code>HelloService.php</Code> — et y placer la logique métier spécifique.
                    </ListItem>
                    <ListItem>
                        <strong>Importer le service dans votre contrôleur</strong> via un
                        <Code>require_once</Code> et le stocker dans une propriété du contrôleur.
                    </ListItem>
                    <ListItem>
                        <strong>Utiliser le service</strong> dans vos méthodes de contrôleur pour récupérer les données
                        ou
                        exécuter des opérations métiers, puis les transmettre à la vue.
                    </ListItem>
                </List>

                <Text className="mt-3">
                    Ce découpage renforce la séparation des responsabilités :
                    <ul className="list-disc ml-6 mt-2">
                        <li>Les <strong>Contrôleurs</strong> gèrent les requêtes et les réponses.</li>
                        <li>Les <strong>Services</strong> contiennent la logique métier.</li>
                        <li>Les <strong>Repositories</strong> s&apos;occupent de la communication avec la base de
                            données.
                        </li>
                        <li>Les <strong>Vues</strong> affichent les résultats à l&apos;utilisateur.</li>
                    </ul>
                </Text>

                <Heading level={3}>2. Rappel de l&apos;arborescence des dossiers</Heading>
                <List>
                    <ListItem><strong>/app/controllers</strong> : Contient les contrôleurs. Chaque contrôleur gère une
                        partie spécifique de l&apos;application (par exemple, <Code>ArticleController.php</Code> pour
                        gérer les articles).</ListItem>
                    <ListItem><strong>/app/entities</strong> : Contient les entités, représentant les objets métier
                        (comme <Code>Article.php</Code> pour un article).</ListItem>
                    <ListItem><strong>/app/repositories</strong> : Contient les repositories, responsables des requêtes
                        SQL pour chaque entité (comme <Code>ArticleRepository.php</Code>).</ListItem>
                    <ListItem><strong>/app/services</strong> : Contient les services qui encapsulent la logique métier
                        complexe (comme <Code>ArticleService.php</Code> pour les articles).</ListItem>
                    <ListItem><strong>/app/views</strong> : Contient les vues (ex. <Code>article.php</Code>) qui
                        affichent les données à l&apos;utilisateur.</ListItem>
                    <ListItem><strong>/app/core</strong> : Contient les classes de base partagées,
                        comme <Code>Controller.php</Code>.</ListItem>
                    <ListItem><strong>/config</strong> : Contient les fichiers de configuration (ex. connexion à la base
                        dans <Code>config.php</Code>).</ListItem>
                    <ListItem><strong>/public</strong> : Contient les fichiers accessibles publiquement
                        (<Code>index.php</Code>, CSS, JS, etc.).</ListItem>
                </List>

                <Heading level={3}>3. Exemple</Heading>
                <CodeCard language="php" filename={"app/services/UserController.php"}>
                    {`<?php
class HelloService
{
    public function hello()
    {
        return 'Hello World!';
    }
}`}
                </CodeCard>

                <CodeCard language="php" filename={"app/controllers/HelloWorldController.php"}>
                    {`<?php

use services\\HelloService;

require_once '../app/core/Controller.php';
require_once '../app/services/HelloService.php';

class HelloWorldController extends Controller
{
    private HelloService $helloService;
    public function __construct()
    {
        $this->helloService  = new HelloService();
    }
    public function index():void
    {
      $this->view('hello_world', $this->helloService->hello(), ['name' => 'Salim']);
    }
}`}
                </CodeCard>
            </section>
            <section>
                <Heading level={2}>B- Introduction à la Clean Architecture et aux principes SOLID</Heading>
                <Text className="leading-relaxed mb-4">
                    Nous allons partir d&apos;un code <strong>réel et problématique</strong> que
                    l&apos;on rencontre souvent dans les projets : un contrôleur qui fait tout. Nous allons le
                    refactorer étape par étape en appliquant les principes SOLID et en nous rapprochant
                    d&apos;une Clean Architecture.
                </Text>
                <Text className="leading-relaxed">
                    Chaque étape apportera une amélioration concrète : meilleure testabilité, réutilisabilité,
                    maintenabilité. Vous verrez comment transformer du &quot;spaghetti code&quot; en code professionnel.
                </Text>
            </section>

            {/* Étape 0 : Le code problématique */}
            <section>
                <Heading level={2}>
                    C- Étape 0 : Le code problématique (God Class)
                </Heading>

                <Heading level={3} className="text-lg font-bold text-red-800 mb-3">1. Code initial : tous les problèmes
                    réunis</Heading>
                <CodeCard language="php">
                    {`<?php
class UserController {
    public function register() {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            // 🔴 PROBLÈME 1 : HTML dans le contrôleur
            echo '<!DOCTYPE html>
<html>
<head>
    <title>Inscription</title>
</head>
<body>
    <h1>Créer un compte</h1>
    <form method="POST" action="/register.php">
        <label>Email :</label><br>
        <input type="email" name="email" required><br><br>
        
        <label>Mot de passe :</label><br>
        <input type="password" name="password" required><br><br>
        
        <button type="submit">S\\'inscrire</button>
    </form>
</body>
</html>';
            return;
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? null;
            $password = $_POST['password'] ?? null;
            
            // 🔴 PROBLÈME 2 : Validation dans le contrôleur
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                die("Email invalide");
            }
            
            if (strlen($password) < 8) {
                die("Mot de passe trop court");
            }
            
            // 🔴 PROBLÈME 3 : Accès direct à la DB dans le contrôleur
            $pdo = new PDO('mysql:host=localhost;dbname=test', 'root', '');
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $exists = $stmt->fetchColumn() > 0;
            
            if ($exists) {
                die("L'utilisateur existe déjà");
            }
            
            // 🔴 PROBLÈME 4 : Logique métier dans le contrôleur
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            
            // 🔴 PROBLÈME 5 : Encore de l'accès DB
            $stmt = $pdo->prepare(
                "INSERT INTO users (email, password, created_at) 
                 VALUES (:email, :password, NOW())"
            );
            $stmt->execute([
                'email' => $email,
                'password' => $hashedPassword
            ]);
            
            // 🔴 PROBLÈME 6 : Envoi d'email dans le contrôleur
            $subject = "Bienvenue sur notre plateforme";
            $message = "Bonjour, merci de vous être inscrit avec $email";
            mail($email, $subject, $message);
            
            // 🔴 PROBLÈME 7 : Logging dans un fichier dans le contrôleur
            file_put_contents(
                __DIR__ . "/logs.txt",
                date('Y-m-d H:i:s') . " - Nouvel utilisateur: $email\\n",
                FILE_APPEND
            );
            
            echo "<Heading level={2}>Utilisateur créé avec succès !</Heading>";
        }
    }
}

$controller = new UserController();
$controller->register();`}</CodeCard>

                <Heading level={3} className="text-xl font-bold mb-4">2. Problèmes identifiés</Heading>
                <List>
                    <ListItem>
                        <Text className="font-semibold">Violation du MVC</Text>
                        <Text className="text-sm">Le HTML est écrit directement dans le contrôleur</Text>
                    </ListItem>
                    <ListItem>
                        <Text className="font-semibold">Violation du SRP (Single Responsibility)</Text>
                        <Text className="text-sm">Le contrôleur fait TOUT : validation, DB, email, logging...</Text>
                    </ListItem>
                    <ListItem>
                        <Text className="font-semibold">Impossible à tester</Text>
                    </ListItem>
                    <ListItem>
                        <Text className="font-semibold">Couplage fort</Text>
                        <Text className="text-sm">PDO hardcodé, fonction mail() native, impossible de changer</Text>
                    </ListItem>
                    <ListItem>
                        <Text className="font-semibold">Code non réutilisable</Text>
                        <Text className="text-sm">Impossible d&apos;utiliser cette logique dans une API ou un CLI</Text>
                    </ListItem>
                </List>
            </section>

            {/* Étape 1 : Séparer la Vue */}
            <section>
                <Heading level={2}>
                    D- Étape 1 : Séparer la vue du contrôleur
                </Heading>

                <Heading level={3}>1. Objectif</Heading>
                <Text className="text-blue-800">
                    Respecter le principe MVC de base : le contrôleur ne doit pas contenir de HTML.
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <Heading level={4}>Contrôleur simplifié</Heading>
                        <CodeCard language="php"
                                  className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {`<?php
// app/controllers/UserController.php
require_once '../app/core/Controller.php';

class UserController extends Controller
{
    public function register(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            // ✅ Délègue l'affichage à la vue
            $this->view('users/register', 
                        'Inscription');
            return;
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? null;
            $password = $_POST['password'] ?? null;
            
            // Validation
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $this->view('users/register', 
                    'Inscription', 
                    ['error' => 'Email invalide']
                );
                return;
            }
            
            if (strlen($password) < 8) {
                $this->view('users/register', 
                    'Inscription', 
                    ['error' => 'Mot de passe trop court']
                );
                return;
            }
            
            // ... reste du code
            
            $this->view('users/success', 
                'Succès', 
                ['message' => 'Utilisateur créé !']
            );
        }
    }
}`}</CodeCard>
                    </div>

                    <div>
                        <Heading level={4}>Vue séparée</Heading>
                        <CodeCard language="php"
                                  className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
                            {`<!-- app/views/users/register.php -->
<!DOCTYPE html>
<html>
<head>
    <title><?= $title ?></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="container">
        <h1>Créer un compte</h1>
        
        <?php if (isset($error)): ?>
            <div class="alert alert-error">
                <?= $error ?>
            </div>
        <?php endif; ?>
        
        <form method="POST" action="/register.php">
            <div class="form-group">
                <label>Email :</label>
                <input type="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label>Mot de passe :</label>
                <input type="password" name="password" required>
            </div>
            
            <button type="submit" class="btn">S'inscrire</button>
        </form>
    </div>
</body>
</html>`}</CodeCard>
                    </div>
                </div>

                <Heading level={3}>2. Améliorations obtenues</Heading>
                <List>
                    <ListItem>Séparation des responsabilités : le contrôleur coordonne, la vue affiche</ListItem>
                    <ListItem>Le design peut être modifié sans toucher au contrôleur</ListItem>
                    <ListItem>Réutilisation du template possible pour d&apos;autres pages</ListItem>
                    <ListItem>Gestion des erreurs plus élégante</ListItem>
                </List>
            </section>

            {/* Étape 2 : Extraire le Repository */}
            <section>
                <Heading level={2}>
                    E- Étape 2 : Créer un repository pour l&apos;accès aux données
                </Heading>

                <Heading level={3}>1. Objectif</Heading>
                <Text>
                    Respecter le <strong>Single Responsibility Principle</strong> : séparer l&apos;accès aux données
                    dans une classe dédiée.
                </Text>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <Heading level={4}>Contrôleur simplifié</Heading>
                        <CodeCard language="php">
                            {`<?php
// app/controllers/UserController.php

class UserController extends Controller
{
    private UserRepository $userRepo;
    
    public function __construct(UserRepository $userRepo)
    {
        $this->userRepo = $userRepo;
    }
    
    public function register(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $this->view('users/register', 'Inscription');
            return;
        }
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? null;
            $password = $_POST['password'] ?? null;
            
            // Validation...
            
            // ✅ Utilise le repository
            if ($this->userRepo->existsByEmail($email)) {
                $this->view('users/register', 'Inscription', 
                    ['error' => "L'utilisateur existe déjà"]
                );
                return;
            }
            
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            
            // ✅ Utilise le repository
            $userId = $this->userRepo->create([
                'email' => $email,
                'password' => $hashedPassword
            ]);
            
            // Envoi email, logging...
            
            $this->view('users/success', 'Succès', 
                ['message' => 'Utilisateur créé !']
            );
        }
    }
}`}</CodeCard>
                    </div>
                    <div>
                        <Heading level={4}>Repository créé</Heading>
                        <CodeCard language="php">
                            {`<?php
// app/repositories/UserRepository.php

class UserRepository
{
    private PDO $pdo;
    
    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }
    
    /**
     * Vérifie si un utilisateur existe par email
     */
    public function existsByEmail(string $email): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM users WHERE email = :email"
        );
        $stmt->execute(['email' => $email]);
        return $stmt->fetchColumn() > 0;
    }
    
    /**
     * Crée un nouvel utilisateur
     */
    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (email, password, created_at) 
             VALUES (:email, :password, NOW())"
        );
        
        $stmt->execute([
            'email' => $data['email'],
            'password' => $data['password']
        ]);
        
        return (int) $this->pdo->lastInsertId();
    }
    
    /**
     * Récupère un utilisateur par son ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM users WHERE id = :id"
        );
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user ?: null;
    }
}`}</CodeCard>
                    </div>
                </div>


                <Heading level={3}>2. Améliorations obtenues</Heading>
                <List>
                    <ListItem><strong>Single Responsibility</strong> : le Repository gère UNIQUEMENT l&apos;accès aux
                        données</ListItem>
                    <ListItem>Requêtes SQL centralisées et réutilisables</ListItem>
                    <ListItem>Facilite les tests : on peut mocker le repository</ListItem>
                    <ListItem>Changement de DB plus facile (MySQL → PostgreSQL)</ListItem>
                </List>

            </section>

            {/* Étape 3 : Créer les Services */}
            <section>
                <Heading level={2}>
                    F- Étape 3 : Extraire la logique métier dans des services
                </Heading>

                <Heading level={3}>1. Objectif</Heading>
                <Text className="text-blue-800">
                    Créer des services spécialisés pour chaque responsabilité : validation, email, audit.
                    Cela respecte <strong>Single Responsibility</strong> et prépare
                    l&apos;<strong>Inversion de Dépendances</strong>.
                </Text>
                <Heading level={4}>1. Service de validation</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/ValidationService.php

class ValidationService
{
    /**
     * Valide un email
     * @throws ValidationException
     */
    public function validateEmail(string $email): void
    {
        if (empty($email)) {
            throw new ValidationException("L'email est requis");
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ValidationException("L'email n'est pas valide");
        }
    }
    
    /**
     * Valide un mot de passe
     * @throws ValidationException
     */
    public function validatePassword(string $password): void
    {
        if (empty($password)) {
            throw new ValidationException("Le mot de passe est requis");
        }
        
        if (strlen($password) < 8) {
            throw new ValidationException(
                "Le mot de passe doit contenir au moins 8 caractères"
            );
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            throw new ValidationException(
                "Le mot de passe doit contenir au moins une majuscule"
            );
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            throw new ValidationException(
                "Le mot de passe doit contenir au moins un chiffre"
            );
        }
    }
}`}</CodeCard>
                <Heading level={4}>2. Service d&apos;email</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/EmailService.php

class EmailService
{
    private string $fromEmail;
    private string $fromName;
    
    public function __construct(
        string $fromEmail = 'noreply@example.com',
        string $fromName = 'Mon Application'
    ) {
        $this->fromEmail = $fromEmail;
        $this->fromName = $fromName;
    }
    
    /**
     * Envoie un email de bienvenue
     */
    public function sendWelcomeEmail(string $toEmail): void
    {
        $subject = "Bienvenue sur notre plateforme";
        $message = "Bonjour,\\n\\n";
        $message .= "Merci de vous être inscrit avec $toEmail.\\n";
        $message .= "Nous sommes ravis de vous compter parmi nous !\\n\\n";
        $message .= "L'équipe " . $this->fromName;
        
        $headers = [
            'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
            'Reply-To: ' . $this->fromEmail,
            'X-Mailer: PHP/' . phpversion(),
            'Content-Type: text/plain; charset=UTF-8'
        ];
        
        mail($toEmail, $subject, $message, implode("\\r\\n", $headers));
    }
}`}</CodeCard>
                <Heading level={4}>3. Service d&apos;audit</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/AuditService.php

class AuditService
{
    private string $logFile;
    
    public function __construct(string $logFile = null)
    {
        $this->logFile = $logFile ?? __DIR__ . '/../../logs/audit.log';
    }
    
    /**
     * Enregistre un événement dans les logs
     */
    public function log(string $event, array $context = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = empty($context) ? '' : ' | ' . json_encode($context);
        $logEntry = "[$timestamp] $event$contextStr\\n";
        
        // Crée le dossier si nécessaire
        $dir = dirname($this->logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND);
    }
    
    /**
     * Log spécifique pour la création d'utilisateur
     */
    public function logUserRegistration(string $email, int $userId): void
    {
        $this->log('USER_REGISTERED', [
            'email' => $email,
            'user_id' => $userId
        ]);
    }
}`}</CodeCard>
                <Heading level={4}>4. Service principal UserService</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/UserService.php

class UserService
{
    private UserRepository $userRepo;
    private ValidationService $validator;
    private EmailService $emailService;
    private AuditService $auditService;
    
    public function __construct(
        UserRepository $userRepo,
        ValidationService $validator,
        EmailService $emailService,
        AuditService $auditService
    ) {
        $this->userRepo = $userRepo;
        $this->validator = $validator;
        $this->emailService = $emailService;
        $this->auditService = $auditService;
    }
    
    /**
     * Enregistre un nouvel utilisateur
     * @throws ValidationException
     * @throws DomainException
     */
    public function register(string $email, string $password): int
    {
        // 1. Validation des données
        $this->validator->validateEmail($email);
        $this->validator->validatePassword($password);
        
        // 2. Vérification unicité
        if ($this->userRepo->existsByEmail($email)) {
            throw new DomainException(
                "Un utilisateur avec cet email existe déjà"
            );
        }
        
        // 3. Hash du mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        // 4. Sauvegarde en base
        $userId = $this->userRepo->create([
            'email' => $email,
            'password' => $hashedPassword
        ]);
        
        // 5. Envoi de l'email de bienvenue
        $this->emailService->sendWelcomeEmail($email);
        
        // 6. Log de l'événement
        $this->auditService->logUserRegistration($email, $userId);
        
        return $userId;
    }
}`}</CodeCard>
                <Heading level={4}>5. Contrôleur ultra-simplifié</Heading>
                <CodeCard language="php">
                    {`<?php
// app/controllers/UserController.php

class UserController extends Controller
{
    private UserService $userService;
    
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }
    
    public function register(): void
    {
        // Affichage du formulaire
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $this->view('users/register', 'Inscription');
            return;
        }
        
        // Traitement du formulaire
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            
            try {
                // ✅ Tout est délégué au service
                $userId = $this->userService->register($email, $password);
                
                $this->view('users/success', 'Succès', [
                    'message' => 'Votre compte a été créé avec succès !'
                ]);
                
            } catch (ValidationException $e) {
                $this->view('users/register', 'Inscription', [
                    'error' => $e->getMessage(),
                    'old' => ['email' => $email]
                ]);
                
            } catch (DomainException $e) {
                $this->view('users/register', 'Inscription', [
                    'error' => $e->getMessage(),
                    'old' => ['email' => $email]
                ]);
                
            } catch (Exception $e) {
                $this->view('errors/500', 'Erreur serveur', [
                    'message' => 'Une erreur est survenue'
                ], 500);
            }
        }
    }
}`}</CodeCard>


                <Heading level={3}>2. Améliorations massives obtenues</Heading>
                <List className="space-y-2 text-green-800">
                    <ListItem><strong>Single Responsibility</strong> : chaque service a UNE responsabilité</ListItem>
                    <ListItem><strong>Testabilité</strong> : chaque service peut être testé indépendamment</ListItem>
                    <ListItem><strong>Réutilisabilité</strong> : ValidationService peut être utilisé partout</ListItem>
                    <ListItem><strong>Contrôleur ultra-léger</strong> : seulement 40 lignes, facile à
                        comprendre</ListItem>
                    <ListItem><strong>Gestion d&apos;erreurs robuste</strong> : exceptions métier spécifiques</ListItem>
                </List>
            </section>

            {/* Étape 4 : Interfaces et Dependency Inversion */}
            <section>
                <Heading level={2}>
                    G- Étape 4 : Interfaces et Dependency Inversion (SOLID - D)
                </Heading>

                <Heading level={3}>1. Objectif</Heading>
                <Text>
                    Appliquer le principe <strong>Dependency Inversion</strong> : dépendre d&apos;abstractions
                    (interfaces) plutôt que d&apos;implémentations concrètes. Cela rend le code flexible et
                    facilite les tests.
                </Text>
                <Text className="text-blue-800 font-semibold">
                    &quot;Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau.
                    Les deux doivent dépendre d&apos;abstractions.&quot;
                </Text>


                <Heading level={4}>1. Interface pour l&apos;envoi d&apos;emails</Heading>
                <CodeCard language="php">
                    {`<?php
// app/interfaces/EmailSenderInterface.php

interface EmailSenderInterface
{
    /**
     * Envoie un email de bienvenue
     */
    public function sendWelcomeEmail(string $toEmail): void;
    
    /**
     * Envoie un email générique
     */
    public function send(string $to, string $subject, string $message): void;
}`}</CodeCard>

                <Heading level={4}>2. Implémentation SMTP réelle</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/SmtpEmailService.php

class SmtpEmailService implements EmailSenderInterface
{
    private string $fromEmail;
    private string $fromName;
    
    public function __construct(
        string $fromEmail = 'noreply@example.com',
        string $fromName = 'Mon Application'
    ) {
        $this->fromEmail = $fromEmail;
        $this->fromName = $fromName;
    }
    
    public function sendWelcomeEmail(string $toEmail): void
    {
        $subject = "Bienvenue sur notre plateforme";
        $message = "Bonjour,\\n\\nMerci de vous être inscrit !";
        
        $this->send($toEmail, $subject, $message);
    }
    
    public function send(string $to, string $subject, string $message): void
    {
        // Utilise la fonction mail() native PHP
        $headers = [
            'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
            'Content-Type: text/plain; charset=UTF-8'
        ];
        
        mail($to, $subject, $message, implode("\\r\\n", $headers));
    }
}`}</CodeCard>
                <Heading level={4}>3. Implémentation FAKE pour les tests</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/FakeEmailService.php

class FakeEmailService implements EmailSenderInterface
{
    private array $sentEmails = [];
    
    public function sendWelcomeEmail(string $toEmail): void
    {
        $this->send($toEmail, "Bienvenue", "Message de bienvenue");
    }
    
    public function send(string $to, string $subject, string $message): void
    {
        // N'envoie pas réellement, stocke juste en mémoire
        $this->sentEmails[] = [
            'to' => $to,
            'subject' => $subject,
            'message' => $message,
            'sent_at' => date('Y-m-d H:i:s')
        ];
    }
    
    /**
     * Méthode pour les tests : vérifier qu'un email a été envoyé
     */
    public function hasEmailBeenSent(string $to): bool
    {
        foreach ($this->sentEmails as $email) {
            if ($email['to'] === $to) {
                return true;
            }
        }
        return false;
    }
    
    public function getSentEmails(): array
    {
        return $this->sentEmails;
    }
}`}</CodeCard>

                <Heading level={4}>4. UserService modifié pour utiliser l&apos;interface</Heading>
                <CodeCard language="php">
                    {`<?php
// app/services/UserService.php

class UserService
{
    private UserRepository $userRepo;
    private ValidationService $validator;
    private EmailSenderInterface $emailSender;  // ✅ Interface, pas implémentation
    private AuditService $auditService;
    
    public function __construct(
        UserRepository $userRepo,
        ValidationService $validator,
        EmailSenderInterface $emailSender,  // ✅ On accepte n'importe quelle implémentation
        AuditService $auditService
    ) {
        $this->userRepo = $userRepo;
        $this->validator = $validator;
        $this->emailSender = $emailSender;
        $this->auditService = $auditService;
    }
    
    public function register(string $email, string $password): int
    {
        $this->validator->validateEmail($email);
        $this->validator->validatePassword($password);
        
        if ($this->userRepo->existsByEmail($email)) {
            throw new DomainException("Utilisateur existant");
        }
        
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $userId = $this->userRepo->create([
            'email' => $email,
            'password' => $hashedPassword
        ]);
        
        // ✅ Le service ne sait pas quelle implémentation est utilisée
        $this->emailSender->sendWelcomeEmail($email);
        
        $this->auditService->logUserRegistration($email, $userId);
        
        return $userId;
    }
}`}</CodeCard>

                <Heading level={4}>5. Point d&apos;entrée avec choix d&apos;implémentation</Heading>
                <CodeCard language="php">
                    {`<?php
// public/register.php

require_once '../config/database.php';
require_once '../app/repositories/UserRepository.php';
require_once '../app/services/ValidationService.php';
require_once '../app/interfaces/EmailSenderInterface.php';
require_once '../app/services/SmtpEmailService.php';
require_once '../app/services/FakeEmailService.php';
require_once '../app/services/AuditService.php';
require_once '../app/services/UserService.php';
require_once '../app/controllers/UserController.php';

// Configuration de la connexion
$pdo = getDatabase();

// ✅ En PRODUCTION : utilise le vrai service SMTP
$emailService = new SmtpEmailService();

// ✅ En DEV/TEST : on pourrait utiliser le fake
// $emailService = new FakeEmailService();

// Injection des dépendances
$userRepo = new UserRepository($pdo);
$validator = new ValidationService();
$auditService = new AuditService();

$userService = new UserService(
    $userRepo,
    $validator,
    $emailService,    // ✅ N'importe quelle implémentation d'EmailSenderInterface
    $auditService
);

$controller = new UserController($userService);
$controller->register();`}</CodeCard>


                <Heading level={3}>2. Avantages du Dependency Inversion</Heading>
                <List>
                    <ListItem><strong>Flexibilité</strong> : on peut changer d&apos;implémentation sans toucher
                        UserService</ListItem>
                    <ListItem><strong>Tests facilités</strong> : on peut injecter FakeEmailService dans les
                        tests</ListItem>
                    <ListItem><strong>Découplage</strong> : UserService ne dépend plus d&apos;une classe
                        concrète</ListItem>
                    <ListItem><strong>Open/Closed</strong> : ouvert à l&apos;extension (nouvelles implémentations),
                        fermé à la modification</ListItem>
                </List>

                <Heading level={4}>Exemple de test unitaire</Heading>
                <CodeCard language="php" className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs">
                    {`<?php
// tests/UserServiceTest.php

class UserServiceTest extends TestCase
{
    public function testUserRegistrationSendsEmail()
    {
        // Arrange : on utilise le FakeEmailService
        $pdo = $this->createMockPDO();
        $userRepo = new UserRepository($pdo);
        $validator = new ValidationService();
        $fakeEmailService = new FakeEmailService();  // ✅ Fake pour tester
        $auditService = new AuditService();
        
        $userService = new UserService(
            $userRepo, 
            $validator, 
            $fakeEmailService,  // ✅ Injection du fake
            $auditService
        );
        
        // Act
        $userService->register('test@example.com', 'Password123');
        
        // Assert
        $this->assertTrue(
            $fakeEmailService->hasEmailBeenSent('test@example.com')
        );
    }
}`}</CodeCard>
            </section>

            {/* Étape 5 : Architecture en couches */}
            <section>
                <Heading level={2}>H- Vision Clean Architecture</Heading>

                <Heading level={3}>1. Objectif</Heading>
                <Text className="text-blue-800">
                    Comprendre comment notre refactoring s&apos;inscrit dans une <strong>Clean Architecture</strong> où
                    les dépendances pointent toujours vers le cœur métier.
                </Text>

                <DiagramCard chart={chartMVCAvance}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                    <BaseCard
                        header={<Text className="text-white">Couche Domaine (Cœur)</Text>}
                        withLed={false}
                        withHover={false}
                        content={<> <Text className="text-sm">
                            Contient la logique métier pure, indépendante de toute infrastructure
                        </Text>
                            <List>
                                <ListItem><Code>User</Code> (entité)</ListItem>
                                <ListItem><Code>ValidationService</Code></ListItem>
                                <ListItem><Code>UserService</Code></ListItem>
                                <ListItem>Exceptions métier</ListItem>
                            </List>
                            <Text className="text-xs text-yellow-700 mt-3 italic">
                                Aucune dépendance externe (DB, framework, etc.)
                            </Text></>}/>

                    <BaseCard
                        header={<Text className="text-white">Couche Application</Text>}
                        withLed={false}
                        withHover={false}
                        content={<> <Text className="text-sm">
                            Orchestre les cas d&apos;usage en coordonnant le domaine
                        </Text>
                            <List>
                                <ListItem><Code>UserService</Code></ListItem>
                                <ListItem>Interfaces (ports)</ListItem>
                                <ListItem>DTOs si nécessaire</ListItem>
                            </List>
                            <Text className="text-xs text-yellow-700 mt-3 italic">
                                Définit les interfaces, ne dépend pas des implémentations
                            </Text></>}/>

                    <BaseCard
                        header={<Text className="text-white">Couche Infrastructure</Text>}
                        withLed={false}
                        withHover={false}
                        content={<> <Text className="text-sm">
                            Implémente les détails techniques (DB, email, logs)
                        </Text>
                            <List>
                                <ListItem><Code>UserRepository</Code></ListItem>
                                <ListItem><Code>SmtpEmailService</Code></ListItem>
                                <ListItem><Code>AuditService</Code></ListItem>
                                <ListItem>Configuration DB</ListItem>
                            </List>
                            <Text className="text-xs text-yellow-700 mt-3 italic">
                                Dépend des interfaces du domaine
                            </Text></>}/>

                    <BaseCard
                        header={<Text className="text-white"> Couche Présentation</Text>}
                        withLed={false}
                        withHover={false}
                        content={<> <Text className="text-sm">
                            Gère l&apos;interaction avec l&apos;utilisateur (HTTP, CLI, API)
                        </Text>
                            <List>
                                <ListItem><Code>UserController</Code></ListItem>
                                <ListItem>Vues (templates)</ListItem>
                                <ListItem>Routes</ListItem>
                                <ListItem>Validation formulaires</ListItem>
                            </List>
                            <Text className="text-xs text-yellow-700 mt-3 italic">
                                Dépend de la couche Application
                            </Text></>}/>
                </div>

                <Heading level={4} className="mt-5">Principe fondamental de Clean Architecture</Heading>
                <List>
                    <ListItem>
                        <span>Les <strong>dépendances pointent toujours vers l&apos;intérieur</strong> (vers le domaine)</span>
                    </ListItem>
                    <ListItem>
                        <span>Le <strong>cœur métier ne connaît RIEN</strong> de l&apos;infrastructure</span>
                    </ListItem>
                    <ListItem>
                        <span>On peut <strong>changer la DB, le framework, l&apos;UI</strong> sans toucher au métier</span>
                    </ListItem>
                    <ListItem>
                        <span>Les <strong>tests du domaine</strong> sont indépendants de toute infrastructure</span>
                    </ListItem>
                </List>
            </section>

            {/* Récapitulatif SOLID */}
            <section className="px-4 md:px-8 lg:px-16 py-8">
                <Heading level={2} className="text-2xl md:text-3xl font-bold mb-6 text-center">
                    I- Récapitulatif : Application des principes SOLID
                </Heading>

                <div className="mb-8">
                    <DiagramCard chart={chartSOLID}/>
                </div>

                {/* Conteneur responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {/* S - Single Responsibility */}
                    <div className="p-4 md:p-6 border-php border-2 rounded-lg">
                        <Heading level={3}>S - Single Responsibility</Heading>
                        <Text className="mb-3">
                            <strong>Appliqué</strong> : Chaque classe a une seule responsabilité
                        </Text>
                        <List className="text-sm space-y-1">
                            <ListItem><Code>UserController</Code> : gère HTTP uniquement</ListItem>
                            <ListItem><Code>UserService</Code> : logique métier d’inscription</ListItem>
                            <ListItem><Code>ValidationService</Code> : validation uniquement</ListItem>
                            <ListItem><Code>UserRepository</Code> : accès données uniquement</ListItem>
                            <ListItem><Code>EmailService</Code> : envoi emails uniquement</ListItem>
                            <ListItem><Code>AuditService</Code> : logging uniquement</ListItem>
                        </List>
                    </div>

                    {/* O - Open/Closed */}
                    <div className="p-4 md:p-6 border-php border-2 rounded-lg">
                        <Heading level={3}>O - Open/Closed</Heading>
                        <Text className="mb-3">
                            <strong>Appliqué</strong> : Ouvert à l’extension, fermé à la modification
                        </Text>
                        <List className="text-sm space-y-1">
                            <ListItem>On peut ajouter <Code>MailgunEmailService</Code> sans modifier le code
                                existant</ListItem>
                            <ListItem>On peut ajouter <Code>DatabaseAuditService</Code> sans
                                toucher <Code>UserService</Code></ListItem>
                            <ListItem>Les interfaces permettent l’extensibilité</ListItem>
                        </List>
                    </div>

                    {/* L - Liskov Substitution */}
                    <div className="p-4 md:p-6 border-php border-2 rounded-lg">
                        <Heading level={3}>L - Liskov Substitution</Heading>
                        <Text className="mb-3">
                            <strong>Appliqué</strong> : Les implémentations sont interchangeables
                        </Text>
                        <List className="text-sm space-y-1">
                            <ListItem><Code>FakeEmailService</Code> peut
                                remplacer <Code>SmtpEmailService</Code></ListItem>
                            <ListItem>Le comportement respecte le contrat de l’interface</ListItem>
                            <ListItem>Aucune surprise lors du remplacement</ListItem>
                        </List>
                    </div>

                    {/* I - Interface Segregation */}
                    <div className="p-4 md:p-6 border-php border-2 rounded-lg">
                        <Heading level={3}>I - Interface Segregation</Heading>
                        <Text className="mb-3">
                            <strong>Appliqué</strong> : Interfaces spécifiques et ciblées
                        </Text>
                        <List className="text-sm space-y-1">
                            <ListItem><Code>EmailSenderInterface</Code> : uniquement l’envoi d’emails</ListItem>
                            <ListItem>Pas d’interface &quot;fourre-tout&quot; avec 20 méthodes</ListItem>
                            <ListItem>Chaque implémentation n’a que ce dont elle a besoin</ListItem>
                        </List>
                    </div>

                    {/* D - Dependency Inversion */}
                    <div className="p-4 md:p-6 border-php border-2 rounded-lg">
                        <Heading level={3}>D- Dependency Inversion</Heading>
                        <Text className="mb-3">
                            <strong>Appliqué</strong> : Dépendance sur abstractions, pas sur implémentations
                        </Text>
                        <List className="text-sm space-y-1">
                            <ListItem><Code>UserService</Code> dépend de <Code>EmailSenderInterface</Code>, pas
                                de <Code>SmtpEmailService</Code></ListItem>
                            <ListItem>Injection de dépendances dans les constructeurs</ListItem>
                            <ListItem>Couplage faible, flexibilité maximale</ListItem>
                        </List>
                    </div>

                </div>
            </section>

            {/* Comparaison avant/après */}
            <section>
                <Heading level={2}>
                    J- Comparaison : Avant vs Après
                </Heading>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Heading level={3} className="text-xl font-bold text-red-900 mb-4">AVANT (Code
                            initial)</Heading>
                        <List className="space-y-3">
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>1 fichier</strong> de 120 lignes</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>0 tests</strong> possibles</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>0 réutilisabilité</strong></span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>HTML</strong> dans le contrôleur</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>SQL</strong> dans le contrôleur</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Logique métier</strong> dans le contrôleur</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Email</strong> dans le contrôleur</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Logs</strong> dans le contrôleur</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Modification = <strong>risque de tout casser</strong></span>
                            </ListItem>
                        </List>
                    </div>

                    <div>
                        <Heading level={3} className="text-xl font-bold text-green-900 mb-4">APRÈS (Architecture
                            propre)</Heading>
                        <List className="space-y-3">
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>10 fichiers</strong> bien organisés</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Tests unitaires</strong> possibles partout</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Réutilisabilité</strong> totale (API, CLI, Web)</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>HTML</strong> dans les vues</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>SQL</strong> dans le repository</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Logique métier</strong> dans UserService</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Email</strong> dans EmailService</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span><strong>Logs</strong> dans AuditService</span>
                            </ListItem>
                            <ListItem className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Modification = <strong>impact limité et contrôlé</strong></span>
                            </ListItem>
                        </List>
                    </div>
                </div>
            </section>

            {/* Organisation finale */}
            <section>
                <Heading level={2}>
                    K- Organisation finale du projet
                </Heading>

                <CodeCard language="php">
                    {`project_tp/
 │
 ├── public/                           ← Seul dossier accessible
 │   ├── register.php                  ← Point d'entrée
 │   └── css/style.css
 │
 ├── app/
 │   │
 │   ├── controllers/                  ← Couche Présentation
 │   │   └── UserController.php        (40 lignes, ultra-simple)
 │   │
 │   ├── services/                     ← Couche Application + Domaine
 │   │   ├── UserService.php           (logique métier principale)
 │   │   ├── ValidationService.php     (validation des règles)
 │   │   ├── SmtpEmailService.php      (implémentation email réelle)
 │   │   ├── FakeEmailService.php      (implémentation pour tests)
 │   │   └── AuditService.php          (logging)
 │   │
 │   ├── repositories/                 ← Couche Infrastructure (Données)
 │   │   └── UserRepository.php
 │   │
 │   ├── entities/                     ← Couche Domaine (Objets métier)
 │   │   └── User.php
 │   │
 │   ├── interfaces/                   ← Contrats (Dependency Inversion)
 │   │   └── EmailSenderInterface.php
 │   │
 │   ├── exceptions/                   ← Exceptions métier
 │   │   ├── ValidationException.php
 │   │   ├── DomainException.php
 │   │   └── NotFoundException.php
 │   │
 │   ├── views/                        ← Templates d'affichage
 │   │   └── users/
 │   │       ├── register.php
 │   │       └── success.php
 │   │
 │   └── core/                         ← Classes de base
 │       └── Controller.php
 │
 ├── config/
 │   └── database.php                  ← Configuration
 │
 ├── logs/
 │   └── audit.log                     ← Fichiers de log
 │
 └── tests/                            ← Tests unitaires
     └── UserServiceTest.php`}</CodeCard>

                <div>
                    <Heading level={3} className="font-bold text-blue-900 mb-3">1. Avantages de cette structure</Heading>
                    <List>
                        <ListItem><strong>Séparation claire</strong> des responsabilités par dossier</ListItem>
                        <ListItem><strong>Navigabilité</strong> : on sait immédiatement où chercher</ListItem>
                        <ListItem><strong>Évolutivité</strong> : facile d&apos;ajouter de nouvelles
                            fonctionnalités</ListItem>
                        <ListItem><strong>Testabilité</strong> : chaque composant peut être testé isolément</ListItem>
                        <ListItem><strong>Collaboration</strong> : plusieurs développeurs peuvent travailler en
                            parallèle</ListItem>
                    </List>
                </div>
            </section>
        </article>
    );
}