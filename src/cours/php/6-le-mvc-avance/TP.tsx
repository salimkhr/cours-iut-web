import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import {Text} from "@/components/ui/Text";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2} netflex>A- Utilisation des services</Heading>
                <Text>
                    Créez le fichier <Code>ImageService.php</Code> dans le répertoire <Code>App/services</Code> avec le contenu suivant :
                </Text>
                <CodeCard language="php" filename="ImageService.php">
                    {`<?php

class ImageService
{
    private string $uploadDir;

    public function __construct(string $uploadDir = 'uploads/series/')
    {
        $this->uploadDir = $uploadDir;
        
        // Créer le dossier s'il n'existe pas
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    public function uploadFile(string $path, string $name): bool
    {
        // Vérifier que le fichier source existe
        if (!file_exists($path)) {
            return false;
        }

        // Chemin de destination
        $destination = $this->uploadDir . $name;

        // Copier le fichier
        return copy($path, $destination);
    }
       
    public function getFile(string $name): void
    {
        $filePath = $this->uploadDir . $name;

        // Vérifier que le fichier existe
        if (!file_exists($filePath)) {
            http_response_code(404);
            echo "Image non trouvée";
            return;
        }

        // Déterminer le type MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        // Envoyer les headers appropriés
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));

        // Afficher le contenu du fichier
        readfile($filePath);
    }
}`}
                </CodeCard>

                <Text>Implémentez ensuite les fonctionnalités suivantes :</Text>

                <List ordered>
                    <ListItem>
                        Créez la méthode <Code>SerieController::image()</Code> et son point d&apos;entrée public dans le fichier <Code>serie_image.php</Code>
                    </ListItem>
                    <ListItem>
                        Dans ce contrôleur, récupérez l&apos;ID de la série depuis les paramètres GET et utilisez <Code>ImageService::getFile($name)</Code> pour retourner l&apos;image correspondante. Le paramètre <Code>$name</Code> correspond à l&apos;attribut <Code>$image</Code> de la classe <Code>Serie</Code>. <strong>Attention :</strong> pour cette méthode, retournez directement ce que renvoie le service, sans utiliser <Code>$this-&gt;view</Code>
                    </ListItem>
                    <ListItem>
                        Mettez à jour les attributs <Code>src</Code> des images dans les vues <Code>home.html.php</Code> et <Code>series.html.php</Code> pour pointer vers <Code>serie_image.php?id=...</Code>
                    </ListItem>
                </List>
            </section>

            <section>
                <Heading level={2} netflex>B- Administration</Heading>

                <Heading level={3}>1/ Templates d&apos;administration</Heading>

                <Heading level={4}>Création du header admin</Heading>
                <Text>
                    Dans le dossier <Code>views/_template/</Code>, créez le fichier <Code>header_admin.html.php</Code> :
                </Text>
                <CodeCard language="php" filename="header_admin.html.php" collapsible>
                    {`<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title><?= $title ?? 'Administration' ?> - Netflex Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&family=Spline+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet"/>
</head>
<body class="bg-dark">
    <!-- HEADER ADMIN -->
    <header class="bg-black border-bottom border-danger px-4 py-3">
        <div class="container-fluid">
            <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-4">
                    <h1 class="logo m-0">
                        <a href="index.php" class="text-decoration-none text-white">NETFLEX</a>
                        <span class="badge bg-danger ms-2">ADMIN</span>
                    </h1>
                    <nav class="d-none d-md-flex gap-3">
                        <a class="text-white text-decoration-none" href="admin_series.php">
                            <i class="fas fa-tv me-1"></i> Séries
                        </a>
                        <a class="text-white text-decoration-none" href="#">
                            <i class="fas fa-film me-1"></i> Films
                        </a>
                        <a class="text-white text-decoration-none" href="#">
                            <i class="fas fa-users me-1"></i> Utilisateurs
                        </a>
                    </nav>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <a href="index.php" class="btn btn-outline-light btn-sm">
                        <i class="fas fa-arrow-left me-1"></i> Retour au site
                    </a>
                    <i class="fa-regular fa-circle-user fa-2xl text-white"></i>
                </div>
            </div>
        </div>
    </header>`}
                </CodeCard>

                <Heading level={4}>Création du footer admin</Heading>
                <Text>
                    Dans le dossier <Code>views/_template/</Code>, créez le fichier <Code>footer_admin.html.php</Code> :
                </Text>
                <CodeCard language="php" filename="footer_admin.html.php">
                    {`    <footer class="bg-black text-white py-4 mt-5">
        <div class="container-fluid text-center">
            <p class="mb-0">
                © 2025 Netflex Admin - 
                <a href="#" class="text-danger text-decoration-none">Documentation</a> | 
                <a href="#" class="text-danger text-decoration-none">Support</a>
            </p>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`}
                </CodeCard>

                <Heading level={3}>2/ Affichage des comptes utilisateurs</Heading>
                <Text>
                    Créez une page d&apos;administration permettant de lister tous les comptes utilisateurs. Cette fonctionnalité utilisera l&apos;architecture Service/Repository pour accéder aux données.
                </Text>

                <Text>Structure de la table <Code>accounts</Code> déja crée lord du dernier TP :</Text>
                <CodeCard language="sql" filename="schema.sql">
                    {`CREATE TABLE accounts
(
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);`}
                </CodeCard>

                <Text>Implémentez l&apos;architecture suivante :</Text>

                <List ordered>
                    <ListItem>
                        Créez la classe <Code>Account</Code> dans <Code>App/models</Code> avec les propriétés correspondant aux colonnes de la table (id, username, email, password_hash, created_at, updated_at)
                    </ListItem>
                    <ListItem>
                        Créez le fichier <Code>admin_user.php</Code> dans le dossier <Code>public</Code> qui appellera la méthode <Code>AdminUserController::list()</Code>
                    </ListItem>
                    <ListItem>
                        Dans <Code>AdminUserController::list()</Code>, instanciez un <Code>AccountService</Code> et utilisez sa méthode <Code>getAll()</Code> pour récupérer tous les comptes
                    </ListItem>
                    <ListItem>
                        Créez <Code>AccountService</Code> dans <Code>App/services</Code> avec une méthode <Code>getAll()</Code> qui délègue la récupération des données à <Code>AccountRepository</Code>
                    </ListItem>
                    <ListItem>
                        Créez <Code>AccountRepository</Code> dans <Code>App/repositories</Code> avec une méthode <Code>findAll()</Code> qui exécute la requête SQL et retourne un tableau d&apos;objets <Code>Account</Code>
                    </ListItem>
                    <ListItem>
                        Affichez les comptes dans une vue <Code>admin_users.html.php</Code> sous forme de tableau avec les colonnes : ID, Username, Email, Date de création.<CodeCard language="php" filename="admin_users.html.php" collapsible>
                        {`<?php require_once __DIR__ . '/../_template/header_admin.html.php'; ?>
<main class="container-fluid py-4">
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h2 class="text-white mb-2">
                        <i class="fas fa-users text-danger me-2"></i>
                        Gestion des utilisateurs
                    </h2>
                    <p class="text-muted mb-0">
                        <?= 0 ?> utilisateur(s) au total
                    </p>
                </div>
                <a href="admin_user.php?action=create" class="btn btn-danger">
                    <i class="fas fa-plus me-2"></i>
                    Ajouter un utilisateur
                </a>
            </div>
        </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="card bg-dark text-white border-secondary">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-dark table-hover mb-0">
                    <thead class="border-bottom border-danger">
                        <tr>
                            <th style="width: 60px;">ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th style="width: 180px;">Date de création</th>
                            <th style="width: 180px;">Dernière mise à jour</th>
                            <th style="width: 150px;" class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
<!-- Liste des utilisateurs 
Ajouter <td class="align-middle text-end">
                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="admin_user.php?action=edit&id=<?= ID ?>"
                                       class="btn btn-outline-warning"
                                       title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a href="admin_user.php?action=delete&id=<?= ID ?>"
                                       class="btn btn-outline-danger"
                                       title="Supprimer"
                                       <i class="fas fa-trash"></i>
                                    </a>
                                </div>
                            </td> a chaque ligne -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>
<?php require_once __DIR__ . '/../_template/footer_admin.html.php'; ?>`}
                    </CodeCard>
                    </ListItem>
                </List>

                <Heading level={3}>3/ Affichage des saisons / épisodes</Heading>
            </section>
        </article>
    );
}