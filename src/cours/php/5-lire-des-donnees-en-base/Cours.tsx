import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import Text from "@/components/ui/Text";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";

export default function Cours() {
    return (
        <article>
            <section>
                <Heading level={2}>Rappel du MVC</Heading>
                <Text>
                    Le pattern <strong>MVC (Modèle-Vue-Contrôleur)</strong> est une architecture logicielle
                    qui sépare une application en trois composants distincts :
                </Text>
                <List>
                    <ListItem>
                        <strong>Le Modèle</strong> : gère les données et la logique métier (entités, repositories,
                        règles de validation)
                    </ListItem>
                    <ListItem>
                        <strong>La Vue</strong> : se concentre exclusivement sur l&apos;affichage des données
                    </ListItem>
                    <ListItem>
                        <strong>Le Contrôleur</strong> : fait le lien entre le Modèle et la Vue, orchestre
                        le traitement des requêtes
                    </ListItem>
                </List>
                
            </section>

            <section>
                <Heading level={2}>Le Modèle</Heading>
                <Text>
                    Le Modèle représente la couche métier de l&apos;application. Il se compose de deux types
                    de classes complémentaires :
                </Text>
                <List>
                    <ListItem>
                        <strong>Les Entités</strong> : objets qui représentent les données métier
                    </ListItem>
                    <ListItem>
                        <strong>Les Repositories</strong> : classes qui gèrent la persistance des entités
                        en base de données
                    </ListItem>
                </List>

                <Heading level={3}>Les Entités</Heading>
                <Text>
                    Une entité est une classe qui représente un objet métier avec ses propriétés et
                    ses méthodes. Elle encapsule les données et fournit des getters/setters pour y accéder.
                </Text>

                <CodeCard language="php">
                    {`<?php
// app/entities/Category.php

class Category
{
    public function __construct(private int $id, private string $name)
    {}

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }
}`}
                </CodeCard>
                
                <Heading level={3}>Les Repositories</Heading>
                <Text>
                    La classe <Code>Repository</Code> sert de base pour gérer la connexion à la base de données. Elle
                    utilise le design pattern Singleton pour garantir qu&apos;une seule connexion est établie tout au
                    long de l&apos;exécution de l&apos;application.
                </Text>

                <Heading level={4}>Le Design Pattern Singleton</Heading>
                <Text>
                    Le Singleton est un design pattern qui garantit qu&apos;une classe ne peut avoir qu&apos;une seule
                    instance. Cela permet de centraliser la gestion de certaines ressources, comme la connexion à la
                    base de données, et d&apos;éviter des ouvertures répétées de connexions inutiles.
                    La méthode <Code>getInstance()</Code> crée une seule fois l&apos;instance
                    de <Code>Repository</Code> et la réutilise tout au long de l&apos;exécution.
                </Text>

                <Heading level={4}>Exemple de Repository : CategoryRepository</Heading>
                <Text>
                    La classe <Code>CategoryRepository</Code> permet de gérer les opérations CRUD (Create / Read / Update / Delete) pour les catégories.
                    Elle utilise la classe <Code>Repository</Code> pour obtenir la connexion à la base de données via PDO.
                </Text>

                <CodeCard language="php">
                    {`<?php
require_once '../app/core/Repository.php';
require_once '../app/entities/Category.php';

class CategoryRepository
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = Repository::getInstance()->getPDO();
    }
}`}
                </CodeCard>

                <Heading level={3}>Méthodes de la Classe Repository</Heading>
                <List>
                    <ListItem>
                        <strong>createCategoryFromRow</strong> : Convertit une ligne de la base de données en objet <Code>Category</Code>.
                        <CodeCard language={"php"}>
                            {`private function createCategoryFromRow(array $row): Category
{
    return new Category(
        (int) $row['id'],
        $row['name']
    );
}`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        <strong>findAll</strong> : Récupère toutes les catégories.
                        <CodeCard language={"php"}>
                            {`public function findAll(): array
{
    $stmt = $this->pdo->query(<<<SQL
        SELECT *
        FROM category
    SQL);

    $categories = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categories[] = $this->createCategoryFromRow($row);
    }

    return $categories;
}`}
                        </CodeCard>
                    </ListItem>
                </List>

                <Heading level={3}>Les Requêtes Préparées</Heading>
                <Text>
                    Les requêtes préparées sont essentielles pour sécuriser les interactions avec la base de données.
                    Elles permettent de séparer la logique de la requête des valeurs des paramètres, empêchant ainsi les
                    attaques par injection SQL. Elles sont aussi plus efficaces, car la requête est analysée et compilée
                    une seule fois.
                </Text>
                <Text>
                    <strong>Le Binding de Paramètres :</strong> Le &quot;binding&quot; consiste à associer des valeurs spécifiques
                    aux paramètres d&apos;une requête préparée avant son exécution. Cela permet de s&apos;assurer que
                    les données insérées ou sélectionnées sont traitées de manière sécurisée.
                </Text>

                <Heading level={4}>Exemple avec un Entier (int)</Heading>
                <Text>
                    Cet exemple montre comment utiliser un entier comme paramètre pour sélectionner une catégorie par son ID.
                </Text>
                <CodeCard language={'php'}>
                    {`$stmt = $this->pdo->prepare(<<<SQL
    SELECT *
    FROM category
    WHERE id = :id
SQL);

$stmt->execute(['id' => $id]);`}
                </CodeCard>

                <Text>
                    Ici, le paramètre <Code>:id</Code> est directement lié à la valeur fournie.
                </Text>

                <Heading level={4}>Exemple avec une Chaîne de Caractères (string)</Heading>
                <Text>
                    Cet exemple montre comment utiliser une chaîne de caractères pour rechercher une catégorie par son nom.
                </Text>
                <CodeCard language={'php'}>
                    {`$stmt = $this->pdo->prepare(<<<SQL
    SELECT *
    FROM category
    WHERE name = :name
SQL);

$stmt->execute(['name' => $categoryName]);`}
                </CodeCard>

                <Text>
                    Dans cet exemple, le paramètre <Code>:name</Code> est lié directement à la valeur fournie pour <Code>$categoryName</Code>.
                </Text>

                <Heading level={4}>Exemple avec Plusieurs Paramètres</Heading>
                <Text>
                    Lorsqu&apos;on doit passer plusieurs paramètres, on utilise un tableau associatif.
                </Text>
                <CodeCard language={'php'}>
                    {`$stmt = $this->pdo->prepare(<<<SQL
    SELECT *
    FROM category
    WHERE name ILIKE :name
      AND is_active = :is_active
      AND created_at >= :created_after
SQL);

$stmt->execute([
    'name' => '%' . $searchName . '%',
    'is_active' => $isActive,
    'created_after' => $createdAfter
]);`}
                </CodeCard>
                <Text>Dans cet exemple,</Text>
                <List>
                    <ListItem>
                        Le paramètre <Code>:name</Code> est lié à <Code>$searchName</Code>. Le caractère <Code>%</Code> permet une recherche partielle, donc toutes les catégories contenant la chaîne <Code>$searchName</Code> seront récupérées.
                    </ListItem>
                    <ListItem>
                        Le paramètre <Code>:is_active</Code> filtre les catégories selon leur statut actif ou inactif, en utilisant la valeur booléenne <Code>$isActive</Code>.
                    </ListItem>
                    <ListItem>
                        Le paramètre <Code>:created_after</Code> ne récupère que les catégories créées après la date spécifiée dans <Code>$createdAfter</Code>.
                    </ListItem>
                    <ListItem>
                        L&apos;utilisation de requêtes préparées avec ces paramètres assure une <strong>protection contre les injections SQL</strong> et une exécution plus sécurisée et optimisée de la requête.
                    </ListItem>
                </List>
                <Heading level={3}>Méthodes de la Classe Repository</Heading>
                <List>
                    <ListItem>
                        <strong>findById</strong> : Récupère une catégorie par son ID.
                        <CodeCard language={"php"}>
                            {`public function findById(int $id): ?Category
{
    $stmt = $this->pdo->prepare(<<<SQL
        SELECT *
        FROM category
        WHERE id = :id
    SQL);

    $stmt->execute(['id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        return $this->createCategoryFromRow($row);
    }

    return null;
}`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        <strong>findByName</strong> : Récupère les catégories par le nom.
                        <CodeCard language={"php"}>
                            {`public function findByName(string $name): array
{
    $stmt = $this->pdo->prepare(<<<SQL
        SELECT *
        FROM category
        WHERE name = :name
    SQL);

    $stmt->execute(['name' => $name]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $categories = [];
    foreach ($rows as $row) {
        $categories[] = $this->createCategoryFromRow($row);
    }

    return $categories;
}`}
                        </CodeCard>
                    </ListItem>
                </List>
                {/* <List>
                    <ListItem>
                        <strong>create</strong> : Crée une nouvelle catégorie.
                        <CodeCard language={"php"}>
                            {`public function create(string $name): ?int
{
    $stmt = $this->pdo->prepare("INSERT INTO category (name) VALUES (:name)");
    $stmt->execute(['name' => $name]);
    return (int) $this->pdo->lastInsertId();
}`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        <strong>update</strong> : Met à jour une catégorie existante.
                        <CodeCard language={"php"}>
                            {`public function update(int $id, string $name): bool
{
    $stmt = $this->pdo->prepare("UPDATE category SET name = :name WHERE id = :id");
    return $stmt->execute(['id' => $id, 'name' => $name]);
}`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        <strong>delete</strong> : Supprime une catégorie.
                        <CodeCard language={"php"}>
                            {`public function delete(int $id): bool
{
    $stmt = $this->pdo->prepare("DELETE FROM category WHERE id = :id");
    return $stmt->execute(['id' => $id]);
}`}
                        </CodeCard>
                    </ListItem>
                </List>*/}{/* <List>
                    <ListItem>
                        <strong>create</strong> : Crée une nouvelle catégorie.
                        <CodeCard language={"php"}>
                            {`public function create(string $name): ?int
{
    $stmt = $this->pdo->prepare("INSERT INTO category (name) VALUES (:name)");
    $stmt->execute(['name' => $name]);
    return (int) $this->pdo->lastInsertId();
}`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        <strong>update</strong> : Met à jour une catégorie existante.
                        <CodeCard language={"php"}>
                            {`public function update(int $id, string $name): bool
{
    $stmt = $this->pdo->prepare("UPDATE category SET name = :name WHERE id = :id");
    return $stmt->execute(['id' => $id, 'name' => $name]);
}`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        <strong>delete</strong> : Supprime une catégorie.
                        <CodeCard language={"php"}>
                            {`public function delete(int $id): bool
{
    $stmt = $this->pdo->prepare("DELETE FROM category WHERE id = :id");
    return $stmt->execute(['id' => $id]);
}`}
                        </CodeCard>
                    </ListItem>
                </List>*/}


                <Heading level={3}>Utilisation des Repositories dans les Contrôleurs</Heading>
                <Text>
                    Le Contrôleur utilise les Repositories pour accéder aux données. Il ne contient jamais
                    de requêtes SQL directes. Voici comment intégrer les Repositories dans un Contrôleur.
                </Text>

                <Heading level={4}>Exemple : CategoryController</Heading>
                <CodeCard language="php">
                    {`<?php
require_once '../app/core/Controller.php';
require_once '../app/repositories/CategoryRepository.php';

class CategoryController extends Controller
{
    private CategoryRepository $categoryRepository;

    public function __construct()
    {
        // Instanciation du repository dans le constructeur
        $this->categoryRepository = new CategoryRepository();
    }

    // Affiche la liste de toutes les catégories
    public function index(): void
    {
        // Récupération des catégories via le repository
        $categories = $this->categoryRepository->findAll();
        
        // Transmission des données à la vue
        $this->view('categories_list', 'Liste des catégories', [
            'categories' => $categories
        ]);
    }

    // Affiche une catégorie spécifique
    public function show(): void
    {
        $id = (int) ($_GET['id'] ?? 0);
        
        // Récupération de la catégorie via le repository
        $category = $this->categoryRepository->findById($id);
        
        if (!$category) {
            $this->view('errors/404', 'Catégorie non trouvée', [], 404);
            return;
        }
        
        $this->view('categories_show', $category->getName(), [
            'category' => $category
        ]);
    }
}`}
                </CodeCard>

{/*                // Crée une nouvelle catégorie
                public function create(): void
                {
                    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $name = trim($_POST['name'] ?? '');

                    if (empty($name)) {
                    $this->view('categories/create', 'Créer une catégorie', [
                    'error' => 'Le nom est obligatoire'
                    ]);
                    return;
                }

                    // Création via le repository
                    $categoryId = $this->categoryRepository->create($name);

                    if ($categoryId) {
                    $this->redirectTo("category.php?action=show&id=$categoryId");
                } else {
                    $this->view('categories/create', 'Créer une catégorie', [
                    'error' => 'Erreur lors de la création'
                    ]);
                }
                } else {
                    // Affichage du formulaire
                    $this->view('categories/create', 'Créer une catégorie');
                }
                }

                // Met à jour une catégorie
                public function update(): void
                {
                    $id = (int) ($_GET['id'] ?? 0);

                    if ($id <= 0) {
                    $this->redirectTo('category.php');
                    return;
                }

                    $category = $this->categoryRepository->findById($id);

                    if (!$category) {
                    $this->view('errors/404', 'Catégorie non trouvée', [], 404);
                    return;
                }

                    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $name = trim($_POST['name'] ?? '');

                    if (empty($name)) {
                    $this->view('categories/edit', 'Modifier la catégorie', [
                    'category' => $category,
                    'error' => 'Le nom est obligatoire'
                    ]);
                    return;
                }

                    // Mise à jour via le repository
                    $success = $this->categoryRepository->update($id, $name);

                    if ($success) {
                    $this->redirectTo("category.php?action=show&id=$id");
                } else {
                    $this->view('categories/edit', 'Modifier la catégorie', [
                    'category' => $category,
                    'error' => 'Erreur lors de la modification'
                    ]);
                }
                } else {
                    $this->view('categories/edit', 'Modifier la catégorie', [
                    'category' => $category
                    ]);
                }
                }

                // Supprime une catégorie
                public function delete(): void
                {
                    $id = (int) ($_GET['id'] ?? 0);

                    if ($id <= 0) {
                    $this->redirectTo('category.php');
                    return;
                }

                    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $success = $this->categoryRepository->delete($id);

                    if ($success) {
                    $this->redirectTo('category.php');
                } else {
                    $this->view('errors/500', 'Erreur', [
                    'message' => 'Impossible de supprimer la catégorie'
                    ], 500);
                }
                } else {
                    $category = $this->categoryRepository->findById($id);

                    if (!$category) {
                    $this->view('errors/404', 'Catégorie non trouvée', [], 404);
                    return;
                }

                    $this->view('categories/delete', 'Supprimer la catégorie', [
                    'category' => $category
                    ]);
                }
                }

                // Retourne les catégories en JSON
                public function indexJson(): void
                {
                    $categories = $this->categoryRepository->findAll();

                    // Conversion des objets Category en tableaux
                    $categoriesData = array_map(function($category) {
                    return [
                    'id' => $category->getId(),
                    'name' => $category->getName()
                    ];
                }, $categories);

                    $this->json(['categories' => $categoriesData]);
                }*/}
                
                <Heading level={4}>Exemple de Vue utilisant les Entités</Heading>
                <Text>
                    Voici comment la Vue affiche les catégories reçues du Contrôleur :
                </Text>
                <CodeCard language="php">
                    {`
<h1>Liste des catégories</h1>

<?php if (!empty($categories)): ?>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nom</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($categories as $category): ?>
                <tr>
                    <td><?= $category->getId() ?></td>
                    <td><?= $category->getName() ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
<?php else: ?>
    <p>Aucune catégorie disponible.</p>
<?php endif; ?>`}
                </CodeCard>

                <Text>
                    La Vue utilise les méthodes getter des objets <Code>Category</Code>
                    (<Code>getId()</Code>, <Code>getName()</Code>) pour afficher les données.
                    Elle n&apos;accède jamais directement à la base de données.
                </Text>
            </section>
        </article>
    );
}