import Heading from "@/components/ui/Heading";
import CodeCard from "@/components/Cards/CodeCard";
import Code from "@/components/ui/Code";
import {Text} from "@/components/ui/Text";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import DiagramCard from "@/components/Cards/DiagramCard";

export default function Cours() {
    const chartCreateCategory = `sequenceDiagram
    participant User as Utilisateur
    participant Browser as Navigateur
    participant Entry as Point d'entrée<br/>category.php
    participant Controller as CategoryController
    participant Repository as CategoryRepository
    participant DB as Base de données
    participant View as Vue<br/>categories_form.php
    
    User->>Browser: Accède à category.php?action=create
    Browser->>Entry: Requête GET
    Entry->>Controller: Appel de create()
    Controller->>View: Affichage du formulaire vide
    View-->>Browser: HTML du formulaire
    Browser-->>User: Affiche le formulaire
    
    User->>Browser: Saisit "Électronique" et soumet
    Browser->>Entry: Requête POST avec données
    Entry->>Controller: Appel de create() avec POST
    Controller->>Controller: Validation des données
    Controller->>Controller: new Category(0, "Électronique")
    Controller->>Repository: create($category)
    Repository->>DB: INSERT INTO category... RETURNING id
    DB-->>Repository: ID généré (42)
    Repository-->>Controller: Retourne 42
    Controller->>Browser: Redirection vers show&id=42
    Browser->>Entry: Requête GET show&id=42
    Entry->>Controller: Appel de show(42)
    Controller-->>User: Affiche la catégorie créée
  `;

    const chartUpdateCategory = `sequenceDiagram
    participant User as Utilisateur
    participant Browser as Navigateur
    participant Entry as Point d'entrée<br/>category.php
    participant Controller as CategoryController
    participant Repository as CategoryRepository
    participant DB as Base de données
    participant View as Vue<br/>categories_form.php
    
    User->>Browser: Accède à category.php?action=update&id=42
    Browser->>Entry: Requête GET
    Entry->>Controller: Appel de update()
    Controller->>Repository: findById(42)
    Repository->>DB: SELECT * FROM category WHERE id=42
    DB-->>Repository: Données de la catégorie
    Repository-->>Controller: Objet Category
    Controller->>View: Affichage du formulaire pré-rempli
    View-->>Browser: HTML avec données existantes
    Browser-->>User: Affiche le formulaire
    
    User->>Browser: Modifie en "Électronique Pro" et soumet
    Browser->>Entry: Requête POST avec nouvelles données
    Entry->>Controller: Appel de update() avec POST
    Controller->>Controller: Validation des données
    Controller->>Controller: $category->setName("Électronique Pro")
    Controller->>Repository: update($category)
    Repository->>DB: UPDATE category SET name=... WHERE id=42
    DB-->>Repository: true (succès)
    Repository-->>Controller: true
    Controller->>Browser: Redirection vers show&id=42
    Browser->>Entry: Requête GET show&id=42
    Entry->>Controller: Appel de show(42)
    Controller-->>User: Affiche la catégorie modifiée
  `;

    return (
        <article>
            {/* SECTION 1 : INTRODUCTION */}
            <section>
                <Heading level={2}>Introduction</Heading>
                <Text>
                    Dans ce cours, nous allons voir comment <strong>créer</strong> et <strong>modifier</strong> des
                    données en base de données via des formulaires HTML. Nous travaillerons avec l'entité <Code>Category</Code>
                    pour illustrer les opérations d'insertion (<Code>INSERT</Code>) et de mise à jour (<Code>UPDATE</Code>).
                </Text>
            </section>

            {/* SECTION 2 : REPOSITORY */}
            <section>
                <Heading level={2}>Les méthodes du Repository</Heading>

                <Heading level={3}>Méthode create()</Heading>
                <Text>
                    La méthode <Code>create()</Code> insère une nouvelle catégorie en base de données et
                    retourne l'<strong>ID généré automatiquement</strong> par PostgreSQL grâce à la clause <Code>RETURNING</Code>.
                    Elle prend en paramètre un objet <Code>Category</Code>.
                </Text>

                <CodeCard language="php">
                    {`<?php
// app/repositories/CategoryRepository.php

public function create(Category $category): ?Category
{
    // Requête préparée pour l'insertion avec RETURNING
    $stmt = $this->pdo->prepare(<<<SQL
        INSERT INTO category (name)
        VALUES (:name)
        RETURNING id
    SQL);
    
    // Exécution avec le paramètre récupéré de l'objet
    $stmt->execute(['name' => $category->getName()]);
    
    // Récupération de l'ID généré via RETURNING
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $category->setId($row['id'] ?? null);
    
    return $category;
}`}
                </CodeCard>

                <Heading level={3}>Méthode update()</Heading>
                <Text>
                    La méthode <Code>update()</Code> modifie une catégorie existante. Elle prend en paramètre
                    un objet <Code>Category</Code> contenant l'ID et les nouvelles valeurs.
                </Text>

                <CodeCard language="php">
                    {`<?php
// app/repositories/CategoryRepository.php

public function update(Category $category): bool
{
    // Requête préparée pour la mise à jour
    $stmt = $this->pdo->prepare(<<<SQL
        UPDATE category
        SET name = :name
        WHERE id = :id
    SQL);
    
    // Exécution avec les paramètres récupérés de l'objet
    return $stmt->execute([
        'id' => $category->getId(),
        'name' => $category->getName()
    ]);
}`}
                </CodeCard>

                <Text>
                    La méthode retourne <Code>true</Code> si la mise à jour a réussi, <Code>false</Code> sinon.
                </Text>
            </section>

            {/* SECTION 3 : VUE COMMUNE */}
            <section>
                <Heading level={2}>Vue unique pour créer et modifier</Heading>

                <Text>
                    Nous utilisons une seule vue <Code>categories_form.php</Code> qui s'adapte selon le contexte
                    (création ou modification). La variable <Code>$category</Code> permet de distinguer les deux cas.
                </Text>

                <CodeCard language="html">
                    {`<!-- app/views/categories_form.php -->

<h1><?= isset($category) ? 'Modifier' : 'Créer' ?> une catégorie</h1>

<?php if (!empty($error)): ?>
    <div class="error">
        <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
    </div>
<?php endif; ?>

<div class="form">
    <label for="name">Nom de la catégorie :</label>
    <input type="text" 
           id="name" 
           name="name" 
           value="<?= $category?->getName() ?? '' ?>"
           required 
           minlength="2"
           maxlength="100"
           placeholder="Nom de la catégorie">
</div>

<div class="form-actions">
    <button type="submit">
        <?= isset($category) ? 'Mettre à jour' : 'Créer' ?>
    </button>
    <a href="category.php<?= isset($category) ? '?action=show&id=' . $category->getId() : '' ?>" 
       class="button-secondary">
        Annuler
    </a>
</div>`}
                </CodeCard>

                <Alert>
                    <AlertTitle>Explication :</AlertTitle>
                   <AlertDescription>
                       <Text>La condition <Code>isset($category)</Code> permet de savoir si on est
                    en mode modification (la variable existe) ou en mode création (la variable n'existe pas).
                    L'opérateur <Code>?-&gt;</Code> (nullsafe operator) évite les erreurs si <Code>$category</Code> est <Code>null</Code>.
                       </Text>
                   </AlertDescription>
                </Alert>
            </section>

            {/* SECTION 4 : CONTRÔLEUR CREATE */}
            <section>
                <Heading level={2}>Contrôleur : Créer une catégorie</Heading>

                <CodeCard language="php">
                    {`<?php
// app/controllers/CategoryController.php

public function create(): void
{
    // Si le formulaire est soumis (méthode POST)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Récupération et sécurisation du nom
        $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
        $name = trim($name); // Suppression des espaces inutiles
        
         // Création d'un objet Category
        $category = new Category(0, $name); // ID à 0 car non encore généré
        
        // Validation côté serveur
        if (empty($name)) {
            $this->view('categories_form', 'Créer une catégorie', [
                'error' => 'Le nom est obligatoire',
                'name' => $name
            ]);
            return;
        }
        
        if (strlen($name) < 2) {
            $this->view('categories_form', 'Créer une catégorie', [
                'error' => 'Le nom doit contenir au moins 2 caractères',
               'category' => $category
            ]);
            return;
        }
        
        if (strlen($name) > 100) {
            $this->view('categories_form', 'Créer une catégorie', [
                'error' => 'Le nom ne peut pas dépasser 100 caractères',
                'category' => $category
            ]);
            return;
        }
        
        // Insertion en base de données via le repository
        $category = $this->categoryRepository->create($category);
        
        // Vérification du succès
        if ($category) {
            // Redirection vers la page de détail de la catégorie créée
            $this->redirectTo("category.php?action=show&id=$category->getId()");
        } else {
            $this->view('categories_form', 'Créer une catégorie', [
                'error' => 'Erreur lors de la création de la catégorie',
                'name' => $name
            ]);
        }
    } else {
        // Affichage du formulaire vide (méthode GET)
        $this->view('categories_form', 'Créer une catégorie');
    }
}`}
                </CodeCard>

                <Alert>
                    <AlertTitle>Validation importante :</AlertTitle>
                    <AlertDescription><Text><strong>Validation importante :</strong> Même si le formulaire HTML contient des attributs
                    de validation (<Code>required</Code>, <Code>minlength</Code>, <Code>maxlength</Code>),
                    il est <strong>impératif</strong> de valider côté serveur. Un utilisateur malveillant peut
                        contourner la validation HTML.</Text></AlertDescription>
                </Alert>
            </section>

            {/* SECTION 5 : CONTRÔLEUR UPDATE */}
            <section>
                <Heading level={2}>Contrôleur : Modifier une catégorie</Heading>

                <CodeCard language="php">
                    {`<?php
// app/controllers/CategoryController.php

public function update(): void
{
    // Récupération de l'ID depuis l'URL
    $id = (int) ($_GET['id'] ?? 0);
    
    // Vérification de la validité de l'ID
    if ($id <= 0) {
        $this->redirectTo('category.php');
        return;
    }
    
    // Récupération de la catégorie existante
    $category = $this->categoryRepository->findById($id);
    
    // Si la catégorie n'existe pas
    if (!$category) {
        $this->view('errors/404', 'Catégorie non trouvée', [], 404);
        return;
    }
    
    // Si le formulaire est soumis (méthode POST)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Récupération et sécurisation du nouveau nom
        $name = htmlspecialchars($_POST['name'] ?? '', ENT_QUOTES, 'UTF-8');
        $name = trim($name);
        
        // Validation côté serveur
        if (empty($name)) {
            $this->view('categories_form', 'Modifier la catégorie', [
                'category' => $category,
                'error' => 'Le nom est obligatoire'
            ]);
            return;
        }
        
        if (strlen($name) < 2) {
            $this->view('categories_form', 'Modifier la catégorie', [
                'category' => $category,
                'error' => 'Le nom doit contenir au moins 2 caractères'
            ]);
            return;
        }
        
        if (strlen($name) > 100) {
            $this->view('categories_form', 'Modifier la catégorie', [
                'category' => $category,
                'error' => 'Le nom ne peut pas dépasser 100 caractères'
            ]);
            return;
        }
        
        // Mise à jour de l'objet Category avec le nouveau nom
        $category->setName($name);
        
        // Mise à jour en base de données via le repository
        $success = $this->categoryRepository->update($category);
        
        // Vérification du succès
        if ($success) {
            // Redirection vers la page de détail
            $this->redirectTo("category.php?action=show&id=$id");
        } else {
            $this->view('categories_form', 'Modifier la catégorie', [
                'category' => $category,
                'error' => 'Erreur lors de la modification'
            ]);
        }
    } else {
        // Affichage du formulaire pré-rempli (méthode GET)
        $this->view('categories_form', 'Modifier la catégorie', [
            'category' => $category
        ]);
    }
}`}
                </CodeCard>
            </section>

            {/* SECTION 6 : FLUX COMPLET */}
            <section>
                <Heading level={2}>Flux complet d'une opération d'écriture</Heading>

                <Heading level={3}>Création d'une catégorie</Heading>

                <DiagramCard chart={chartCreateCategory} />

                <Heading level={3}>Modification d'une catégorie</Heading>

                <DiagramCard chart={chartUpdateCategory} />
            </section>
        </article>
    );
}