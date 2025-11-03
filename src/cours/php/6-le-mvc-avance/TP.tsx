import Heading from "@/components/ui/Heading";
import Code from "@/components/ui/Code";
import {Text} from "@/components/ui/Text";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2} netflex>A- Utilisation des services</Heading>
                <Heading level={3}>1. Correction des données</Heading>
                <Text>Executer le script SQL suivant pour ajouter les données manquantes :</Text>
                <CodeCard language="sql" collapsible>
                    {`UPDATE series
SET description = 'Chronique de la ville de Baltimore, explorant les relations entre police, trafiquants et habitants.',
    quality = 'HD',
    audio = 'EN',
    image = 'the_wire.jpg',
    updated_at = NOW()
WHERE id = 1;

UPDATE series
SET description = 'Un politicien impitoyable use de manipulation et de trahison pour accéder au pouvoir à Washington.',
    quality = 'HD',
    audio = 'EN',
    image = 'house_of_cards.jpg',
    updated_at = NOW()
WHERE id = 2;

UPDATE series
SET description = 'Reconstitution des événements de la catastrophe nucléaire de Tchernobyl en 1986.',
    quality = '4K',
    audio = 'EN',
    image = 'chernobyl.jpg',
    updated_at = NOW()
WHERE id = 3;

UPDATE series
SET description = 'Un professeur de chimie atteint d’un cancer se lance dans la fabrication de méthamphétamine.',
    quality = '4K',
    audio = 'EN',
    image = 'breaking_bad.jpg',
    updated_at = NOW()
WHERE id = 4;

UPDATE series
SET description = 'Comédie décrivant le quotidien absurde des employés d’une entreprise de papier en Pennsylvanie.',
    quality = 'HD',
    audio = 'EN',
    image = 'the_office.jpg',
    updated_at = NOW()
WHERE id = 5;

UPDATE series
SET description = 'Une jeune prodige des échecs lutte contre la dépendance et la solitude dans les années 60.',
    quality = '4K',
    audio = 'EN',
    image = 'the_queens_gambit.jpg',
    updated_at = NOW()
WHERE id = 6;

UPDATE series
SET description = 'Dans un futur totalitaire, une femme tente de survivre sous un régime patriarcal oppressif.',
    quality = '4K',
    audio = 'EN',
    image = 'the_handmaids_tale.jpg',
    updated_at = NOW()
WHERE id = 7;

UPDATE series
SET description = 'Dans un monde divisé entre riches et pauvres, des jeunes tentent de rejoindre les 3% privilégiés.',
    quality = 'HD',
    audio = 'PT',
    image = '3_percent.jpg',
    updated_at = NOW()
WHERE id = 8;

UPDATE series
SET description = 'La jeune Wednesday Addams est envoyée dans une école spéciale où elle explore ses pouvoirs psychiques.',
    quality = '4K',
    audio = 'EN',
    image = 'wednesday.jpg',
    updated_at = NOW()
WHERE id = 9;

UPDATE series
SET description = 'Un homme obsessionnel et dangereux s’éprend de plusieurs femmes, menant à des drames meurtriers.',
    quality = 'HD',
    audio = 'EN',
    image = 'you.jpg',
    updated_at = NOW()
WHERE id = 10;

UPDATE series
SET description = 'Un groupe d’enfants découvre des forces surnaturelles inquiétantes dans leur petite ville des années 80.',
    quality = '4K',
    audio = 'EN',
    image = 'stranger_things.jpg',
    updated_at = NOW()
WHERE id = 11;`}
                </CodeCard>
                <Text>Ajouter <Link href="/download/php/uploads.zip" download>les images suivantes</Link> dans le dossier <Code>uploads/series/</Code> a la racine du projet</Text>
                <Heading level={3}>2. Affichage des images</Heading>
                <Text>
                    Créez le fichier <Code>ImageService.php</Code> dans le répertoire <Code>App/services</Code> avec le contenu suivant :
                </Text>
                <CodeCard language="php" filename="ImageService.php" collapsible>
                    {`<?php

/**
 * Class ImageService
 *
 * Service responsable de la gestion des fichiers image :
 * - Upload de fichiers (via $_FILES)
 * - Lecture et affichage d’un fichier
 * - Suppression d’un fichier
 *
 * Note :
 * Cette classe gère uniquement les fichiers du système local (pas de cloud storage).
 * Elle crée automatiquement le dossier d’upload s’il n’existe pas.
 */
class ImageService
{
    /**
     * @var string $uploadDir Chemin vers le répertoire de stockage des images.
     */
    private string $uploadDir;

    /**
     * Constructeur du service d’images.
     *
     * @param string $uploadDir Répertoire d’upload (par défaut : "uploads/series/").
     */
    public function __construct(string $uploadDir = 'uploads/series/')
    {
        // Nettoie le chemin et ajoute un slash final
        $this->uploadDir = rtrim($uploadDir, '/') . '/';
        
        // Crée le dossier s'il n'existe pas
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }

    /**
     * Upload un fichier directement depuis $_FILES.
     *
     * @param array $file Le tableau issu de $_FILES['nom_du_champ'].
     * 
     * @return string|false Le nom unique du fichier sauvegardé, ou false en cas d’échec.
     *
     * Étapes :
     * - Vérifie les erreurs d’upload.
     * - Vérifie qu’il s’agit bien d’un fichier uploadé.
     * - Vérifie l’extension (jpg, jpeg, png, gif, webp).
     * - Génère un nom unique.
     * - Déplace le fichier vers le dossier d’upload.
     */
    public function uploadFile(array $file): string|false
    {
        // Vérifie l’absence d’erreur d’upload
        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            return false;
        }

        // Vérifie que c’est bien un fichier HTTP uploadé
        if (!is_uploaded_file($file['tmp_name'])) {
            return false;
        }

        // Récupère et nettoie l’extension du fichier
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        // Vérifie si l’extension est autorisée
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($extension, $allowedExtensions, true)) {
            return false;
        }

        // Génère un nom de fichier unique (ex : img_654a1b5d8e89f3.12345678.jpg)
        $uniqueName = uniqid('img_', true) . '.' . $extension;

        // Détermine le chemin complet du fichier de destination
        $destination = $this->uploadDir . $uniqueName;

        // Déplace le fichier depuis le répertoire temporaire PHP
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            return $uniqueName; // ✅ Succès → retourne le nom unique
        }

        // Échec → retourne false
        return false;
    }

    /**
     * Sert une image au navigateur en envoyant les bons headers HTTP.
     *
     * @param string $name Le nom du fichier à récupérer (ex : "img_123abc.jpg").
     * 
     * @return void
     * 
     * @throws RuntimeException Si le fichier n’existe pas ou n’est pas accessible.
     *
     * Fonctionnement :
     * - Vérifie l’existence du fichier dans le dossier d’upload.
     * - Détermine le type MIME (ex : image/jpeg).
     * - Envoie les headers HTTP nécessaires.
     * - Envoie le contenu binaire du fichier avec \`readfile()\`.
     *
     * Important :
     * Cette méthode écrit directement dans la réponse HTTP.
     * Elle doit être appelée avant tout affichage ou sortie (echo, var_dump, etc.).
     */
    public function getFile(string $name): void
    {
        // Chemin complet du fichier
        $filePath = $this->uploadDir . $name;

        // Vérifie que le fichier existe
        if (!file_exists($filePath)) {
            http_response_code(404);
            echo "Image non trouvée";
            return;
        }

        // Détermine le type MIME du fichier
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $filePath);
        finfo_close($finfo);

        // Envoie les en-têtes HTTP appropriés
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . filesize($filePath));

        // Envoie le contenu binaire du fichier
        readfile($filePath);
    }

    /**
     * Supprime un fichier du dossier d’upload.
     *
     * @param string $name Nom du fichier à supprimer.
     * 
     * @return bool True si le fichier a été supprimé, sinon false.
     *
     * Exemple :
     * \`\`\`php
     * $imageService->deleteFile('img_123abc.jpg');
     * \`\`\`
     */
    public function deleteFile(string $name): bool
    {
        $filePath = $this->uploadDir . $name;

        // Vérifie que le fichier existe avant de tenter la suppression
        return file_exists($filePath) ? unlink($filePath) : false;
    }
}
`}
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

                <Heading level={3}>1. Templates d&apos;administration</Heading>

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
                <Text>Pourquoi header_admin.php et footer_admin.php ?
                    Pour éviter de répéter le même code HTML sur chaque page d’administration (principe <strong>“Don’t Repeat Yourself”</strong> <em>(Ne te répète pas)</em>).
                    Un seul fichier pour le header et le footer = maintenance plus simple et design cohérent, distinct du site public.</Text>

                <Heading level={3}>2. Affichage des saisons / épisodes</Heading>
            </section>

            {/*<section>
                <Heading level={2} netflex>B- Administration</Heading>

                <Heading level={3}>1. Templates d&apos;administration</Heading>

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

                <Heading level={3}>2. Affichage des saisons / épisodes</Heading>

                <Text>
                    Créez une page d&apos;administration permettant d&apos;afficher toutes les séries avec leurs saisons et épisodes organisés dans des accordéons Bootstrap.
                </Text>

                <Text>
                    <strong>Note :</strong> Les Repository et classes <Code>Episode</Code> / <Code>Serie</Code> existent déjà.
                </Text>

                <Heading level={4}>Étape 1 : Préparer la classe Serie</Heading>

                <Text>
                    Ajoutez à la classe <Code>Serie</Code> (<Code>App/models/Serie.php</Code>) :
                </Text>

                <List>
                    <ListItem>Une propriété publique : <Code>public array $episodes = [];</Code></ListItem>
                    <ListItem>
                        Une méthode <Code>getEpisodesBySeason(): array</Code> qui :
                        <List>
                            <ListItem>Parcourt le tableau <Code>$this-&gt;episodes</Code></ListItem>
                            <ListItem>Regroupe les épisodes par saison : <Code>$episodesBySeason[$episode-&gt;getSeason()][] = $episode;</Code></ListItem>
                            <ListItem>Trie les saisons avec <Code>ksort($episodesBySeason)</Code></ListItem>
                            <ListItem>Trie les épisodes de chaque saison par numéro avec <Code>usort()</Code></ListItem>
                            <ListItem>Retourne le tableau <Code>$episodesBySeason</Code></ListItem>
                        </List>
                    </ListItem>
                </List>

                <Text><strong>Test de l&apos;étape 1 :</strong></Text>
                <Text>Créez un fichier de test pour vérifier que la méthode fonctionne correctement :</Text>
                <CodeCard language="php">
                    {`// Créer une série avec des épisodes
$serie = new Serie();
$serie->episodes = [
    new Episode(1, 1, 2, 'Episode 2'),
    new Episode(1, 1, 1, 'Episode 1'),
    new Episode(1, 2, 1, 'Episode S2'),
];

// Tester le regroupement
$grouped = $serie->getEpisodesBySeason();
var_dump($grouped); // Doit afficher les épisodes groupés par saison et triés`}
                </CodeCard>

                <Heading level={4}>Étape 2 : Créer EpisodeService</Heading>

                <Text>
                    Créez le service <Code>EpisodeService</Code> (<Code>App/services/EpisodeService.php</Code>) avec les méthodes suivantes :
                </Text>

                <List>
                    <ListItem><Code>getBySerieId(int $serieId): array</Code> - Retourne tous les épisodes d&apos;une série via <Code>EpisodeRepository::findBySerieId()</Code></ListItem>
                    <ListItem><Code>getById(int $id): ?Episode</Code> - Retourne un épisode spécifique</ListItem>
                    <ListItem><Code>getAll(): array</Code> - Retourne tous les épisodes</ListItem>
                </List>

                <Text><strong>Test de l&apos;étape 2 :</strong></Text>
                <Text>Testez le service en récupérant les épisodes d&apos;une série existante :</Text>
                <CodeCard language="php">
                    {`$episodeService = new EpisodeService();
$episodes = $episodeService->getBySerieId(1);
var_dump(count($episodes)); // Doit afficher le nombre d'épisodes de la série 1`}
                </CodeCard>

                <Heading level={4}>Étape 3 : Créer SerieService avec getAllWithEpisodes()</Heading>

                <Text>
                    Créez le service <Code>SerieService</Code> (<Code>App/services/SerieService.php</Code>) avec une méthode <Code>getAllWithEpisodes()</Code> qui :
                </Text>

                <List ordered>
                    <ListItem>Récupère toutes les séries via <Code>SerieRepository::findAll()</Code></ListItem>
                    <ListItem>Pour chaque série, récupère ses épisodes via <Code>EpisodeService::getBySerieId()</Code></ListItem>
                    <ListItem>Stocke les épisodes dans <Code>$serie-&gt;episodes</Code></ListItem>
                    <ListItem>Retourne le tableau de séries</ListItem>
                </List>

                <Text><strong>Test de l&apos;étape 3 :</strong></Text>
                <Text>Testez que les séries contiennent bien leurs épisodes :</Text>
                <CodeCard language="php">
                    {`$serieService = new SerieService();
$series = $serieService->getAllWithEpisodes();

foreach ($series as $serie) {
    echo $serie->getTitle() . ' : ' . count($serie->episodes) . ' épisodes<br>';
    $episodesBySeason = $serie->getEpisodesBySeason();
    echo 'Nombre de saisons : ' . count($episodesBySeason) . '<br>';
}`}
                </CodeCard>

                <Heading level={4}>Étape 4 : Créer AdminSerieController</Heading>

                <Text>
                    Créez le contrôleur <Code>AdminSerieController</Code> (<Code>App/controllers/AdminSerieController.php</Code>) avec :
                </Text>

                <List>
                    <ListItem>Une méthode <Code>list()</Code> qui instancie <Code>SerieService</Code></ListItem>
                    <ListItem>Appelle <Code>getAllWithEpisodes()</Code></ListItem>
                    <ListItem>Passe les séries à la vue <Code>admin/admin_series</Code> dans une variable <Code>$series</Code></ListItem>
                    <ListItem>Une méthode privée <Code>view()</Code> pour afficher les vues</ListItem>
                </List>

                <Text>
                    Créez également le point d&apos;entrée <Code>public/admin_series.php</Code> qui instancie le contrôleur et appelle <Code>list()</Code>.
                </Text>

                <Text><strong>Test de l&apos;étape 4 :</strong></Text>
                <Text>
                    Créez une vue temporaire simple pour tester que les données arrivent bien :
                </Text>
                <CodeCard language="php" filename="App/views/admin/admin_series.html.php">
                    {`<?php require_once __DIR__ . '/../_template/header_admin.html.php'; ?>
<main class="container-fluid py-4">
    <h2 class="text-white">Test - Séries avec épisodes</h2>
    <?php foreach ($series as $serie): ?>
        <div class="text-white mb-3">
            <h3><?= $serie->getTitle() ?></h3>
            <p>Nombre d'épisodes : <?= count($serie->episodes) ?></p>
            <?php
            $episodesBySeason = $serie->getEpisodesBySeason();
            foreach ($episodesBySeason as $season => $episodes) {
                echo "<p>Saison $season : " . count($episodes) . " épisodes</p>";
            }
            ?>
        </div>
    <?php endforeach; ?>
</main>
<?php require_once __DIR__ . '/../_template/footer_admin.html.php'; ?>`}
                </CodeCard>

                <Text>Accédez à <Code>http://localhost/admin_series.php</Code> pour vérifier que les données s&apos;affichent correctement.</Text>

                <Heading level={4}>Étape 5 : Créer la vue avec accordéons</Heading>

                <Text>
                    Maintenant que tout fonctionne, créez la vue finale <Code>App/views/admin/admin_series.html.php</Code> avec :
                </Text>

                <List>
                    <ListItem>Un en-tête affichant le nombre de séries</ListItem>
                    <ListItem>Un accordéon Bootstrap pour chaque série avec :
                        <List>
                            <ListItem>L&apos;image de la série (<Code>serie_image.php?id=...</Code>)</ListItem>
                            <ListItem>Le titre, nombre de saisons/épisodes, année</ListItem>
                            <ListItem>Dans le corps : description, boutons d&apos;action</ListItem>
                        </List>
                    </ListItem>
                    <ListItem>Un accordéon imbriqué pour les saisons avec :
                        <List>
                            <ListItem>Un en-tête "Saison X" avec le nombre d&apos;épisodes</ListItem>
                            <ListItem>Un tableau des épisodes (numéro S01E01, titre, durée, actions)</ListItem>
                        </List>
                    </ListItem>
                </List>

                <Heading level={4}>Indications pour la vue</Heading>

                <Text>Pour récupérer les épisodes groupés par saison :</Text>
                <CodeCard language="php">
                    {`<?php
$episodesBySeason = $serie->getEpisodesBySeason();
$totalEpisodes = array_sum(array_map('count', $episodesBySeason));
?>`}
                </CodeCard>

                <Text>Pour le formatage des numéros d&apos;épisodes (S01E01) :</Text>
                <CodeCard language="php">
                    {`S<?= str_pad($seasonNumber, 2, '0', STR_PAD_LEFT) ?>E<?= str_pad($episode->getEpisodeNumber(), 2, '0', STR_PAD_LEFT) ?>`}
                </CodeCard>

                <Text>Structure de base des accordéons :</Text>
                <CodeCard language="html" collapsible>
                    {`<!-- Accordéon parent (séries) -->
<div class="accordion" id="seriesAccordion">
    <?php foreach ($series as $index => $serie): ?>
        <?php $episodesBySeason = $serie->getEpisodesBySeason(); ?>
        
        <div class="accordion-item bg-dark border-secondary mb-3">
            <h2 class="accordion-header">
                <button class="accordion-button <?= $index !== 0 ? 'collapsed' : '' ?>" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse<?= $serie->getId() ?>">
                    <!-- Contenu du bouton : image, titre, infos -->
                </button>
            </h2>
            
            <div id="collapse<?= $serie->getId() ?>" 
                 class="accordion-collapse collapse <?= $index === 0 ? 'show' : '' ?>">
                <div class="accordion-body">
                    <!-- Description et boutons -->
                    
                    <!-- Accordéon des saisons -->
                    <div class="accordion" id="seasonsAccordion<?= $serie->getId() ?>">
                        <?php foreach ($episodesBySeason as $seasonNumber => $episodes): ?>
                            <div class="accordion-item bg-dark border-secondary mb-2">
                                <h3 class="accordion-header">
                                    <button class="accordion-button collapsed" 
                                            data-bs-toggle="collapse" 
                                            data-bs-target="#season<?= $serie->getId() ?>-<?= $seasonNumber ?>">
                                        Saison <?= $seasonNumber ?>
                                    </button>
                                </h3>
                                <div id="season<?= $serie->getId() ?>-<?= $seasonNumber ?>" 
                                     class="accordion-collapse collapse">
                                    <div class="accordion-body">
                                        <!-- Tableau des épisodes -->
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>`}
                </CodeCard>

                <Heading level={4}>Résumé des fichiers créés</Heading>

                <List ordered>
                    <ListItem><Code>App/models/Serie.php</Code> - Ajout de la propriété <Code>episodes</Code> et de la méthode <Code>getEpisodesBySeason()</Code></ListItem>
                    <ListItem><Code>App/services/EpisodeService.php</Code></ListItem>
                    <ListItem><Code>App/services/SerieService.php</Code></ListItem>
                    <ListItem><Code>App/controllers/AdminSerieController.php</Code></ListItem>
                    <ListItem><Code>App/views/admin/admin_series.html.php</Code></ListItem>
                    <ListItem><Code>public/admin_series.php</Code></ListItem>
                </List>
            </section>*/}
        </article>
    );
}