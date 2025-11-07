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
                      SET description = 'À Baltimore, policiers, trafiquants, journalistes et habitants se croisent dans une fresque réaliste et percutante. Chaque saison explore un pan de la ville, dévoilant un système corrompu, des destins brisés et une humanité en quête de justice et de rédemption.',
                          quality = 'HD',
                          audio = 'EN',
                          image = 'the_wire.jpg',
                          updated_at = NOW()
                      WHERE id = 1;

                    UPDATE series
                    SET description = 'Frank Underwood, politicien manipulateur et ambitieux, déploie un plan machiavélique pour conquérir le pouvoir à Washington. Avec sa femme Claire, il tisse un réseau de trahisons et de mensonges dans une lutte froide pour la domination politique.',
                        quality = 'HD',
                        audio = 'EN',
                        image = 'house_of_cards.jpg',
                        updated_at = NOW()
                    WHERE id = 2;

                    UPDATE series
                    SET description = 'Reconstitution poignante de la catastrophe nucléaire de Tchernobyl. Des scientifiques et des civils se battent contre le mensonge d’État et le danger invisible, au péril de leur vie. Une œuvre saisissante sur le courage, la vérité et le prix de la responsabilité.',
                        quality = '4K',
                        audio = 'EN',
                        image = 'chernobyl.jpg',
                        updated_at = NOW()
                    WHERE id = 3;

                    UPDATE series
                    SET description = 'Walter White, professeur de chimie atteint d’un cancer, décide de fabriquer de la méthamphétamine pour subvenir aux besoins de sa famille. De victime en héros sombre, il plonge dans un monde de violence, de pouvoir et de destruction morale.',
                        quality = '4K',
                        audio = 'EN',
                        image = 'breaking_bad.jpg',
                        updated_at = NOW()
                    WHERE id = 4;

                    UPDATE series
                    SET description = 'Bienvenue chez Dunder Mifflin, une entreprise de papier en Pennsylvanie où le quotidien se transforme en comédie absurde. Entre un patron maladroit, des employés déjantés et des moments touchants, The Office mêle humour, ironie et humanité avec brio.',
                        quality = 'HD',
                        audio = 'EN',
                        image = 'the_office.jpg',
                        updated_at = NOW()
                    WHERE id = 5;

                    UPDATE series
                    SET description = 'Beth Harmon, orpheline et prodige des échecs, gravit les échelons d’un monde masculin dans l’Amérique des années 60. Entre génie, addiction et solitude, elle tente de trouver un équilibre entre sa passion et sa santé mentale.',
                        quality = '4K',
                        audio = 'EN',
                        image = 'the_queens_gambit.jpg',
                        updated_at = NOW()
                    WHERE id = 6;

                    UPDATE series
                    SET description = 'Dans un futur totalitaire, les femmes fertiles sont réduites à la servitude sous le régime de Gilead. Offred, prisonnière d’un système patriarcal brutal, lutte pour survivre et retrouver sa liberté. Un récit de résistance et d’espoir face à l’oppression.',
                        quality = '4K',
                        audio = 'EN',
                        image = 'the_handmaids_tale.jpg',
                        updated_at = NOW()
                    WHERE id = 7;

                    UPDATE series
                    SET description = 'Dans un monde divisé entre riches et pauvres, des jeunes affrontent une série d’épreuves pour rejoindre les 3% privilégiés vivant dans une société utopique. Chaque test révèle la vraie nature des candidats et le prix du mérite dans une société inégale.',
                        quality = 'HD',
                        audio = 'PT',
                        image = '3_percent.jpg',
                        updated_at = NOW()
                    WHERE id = 8;

                    UPDATE series
                    SET description = 'Wednesday Addams, jeune fille brillante et sombre, rejoint la Nevermore Academy, une école pour marginaux dotés de pouvoirs. Entre mystères, meurtres et humour noir, elle explore son héritage familial et découvre sa véritable identité.',
                        quality = '4K',
                        audio = 'EN',
                        image = 'wednesday.jpg',
                        updated_at = NOW()
                    WHERE id = 9;

                    UPDATE series
                    SET description = 'Joe Goldberg, libraire cultivé et charmant, cache une obsession dangereuse. Derrière ses histoires d’amour se dissimule une spirale de manipulation, de jalousie et de meurtres. Une exploration troublante de la passion toxique et du contrôle.',
                        quality = 'HD',
                        audio = 'EN',
                        image = 'you.jpg',
                        updated_at = NOW()
                    WHERE id = 10;

                    UPDATE series
                    SET description = 'Dans une petite ville des années 80, un garçon disparaît mystérieusement. Ses amis, aidés d’une fillette aux pouvoirs psychiques, découvrent un monde parallèle terrifiant appelé l’Envers. Aventure, amitié et mystère dans un hommage vibrant à la pop culture.',
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
    public function __construct(string $uploadDir = '../uploads/series/')
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
            echo "Image " . $filePath . " non trouvée";
            return;
        }

        // Détermine le type MIME du fichier manuellement
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        $mimeTypes = [
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'webp' => 'image/webp',
            'svg'  => 'image/svg+xml',
            'bmp'  => 'image/bmp',
            'ico'  => 'image/x-icon',
        ];

        $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

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
}`}
                </CodeCard>


                <Text>Implémentez ensuite les fonctionnalités suivantes :</Text>

                <List ordered>
                    <ListItem>
                        Créez la méthode <Code>SeriesController::image()</Code> et son point d&apos;entrée public dans le fichier <Code>series_image.php</Code>
                    </ListItem>
                    <ListItem>
                        Dans ce contrôleur, récupérez l&apos;ID de la série depuis les paramètres GET et utilisez <Code>ImageService::getFile($name)</Code> pour retourner l&apos;image correspondante. Le paramètre <Code>$name</Code> correspond à l&apos;attribut <Code>$image</Code> de la classe <Code>Serie</Code>.
                        <strong>Attention :</strong> pour cette méthode, retournez directement ce que renvoie le service, sans utiliser <Code>$this-&gt;view</Code>
                    </ListItem>
                    <ListItem>
                        Mettez à jour les attributs <Code>src</Code> des images dans les vues <Code>home.html.php</Code> et <Code>series.html.php</Code> pour pointer vers <Code>serie_image.php?id=...</Code>
                    </ListItem>
                </List>
            </section>
            <section>
                <Heading level={2}>Gestion des épisodes dans les séries</Heading>

                <Text>Enrichir la classe <Code>Serie</Code> avec la gestion des épisodes :</Text>
                <List>
                    <ListItem>Ajouter une propriété `array $episodes`</ListItem>
                    <ListItem>Créer les méthodes <Code>getEpisodes()</Code> et <Code>setEpisodes(array $episodes)</Code></ListItem>
                    <ListItem>Implémenter une méthode <Code>getEpisodesBySeason(): array</Code> qui retourne les épisodes organisés par saison</ListItem>
                </List>
                <CodeCard language="php">{`public function getEpisodesBySeason(): array {
    $episodesBySeason = [];
    foreach ($this->episodes as $episode) {
        $episodesBySeason[$episode->getSeason()][] = $episode;
    }
    return $episodesBySeason;
}`}</CodeCard>

                <Heading level={2}>Création et implémentation du SerieService</Heading>

                <Text>Dans le dossier <Code>app/services</Code>, créer une nouvelle classe <Code>SerieService</Code> avec :</Text>
                <List>
                    <ListItem>Une méthode publique <Code>getServiceByIdWithEpisode(int $id): Serie</Code></ListItem>
                    <ListItem>Une méthode publique <Code>getAllServiceWithEpisode(): array</Code></ListItem>
                </List>
                <Text>Ces méthodes seront complétées dans les étapes suivantes.</Text>

                <Text className="mt-5">Ajouter une méthode privée <Code>addEpisodeToSerie(Serie $serie)</Code> qui doit :</Text>
                <List>
                    <ListItem>Utiliser <Code>EpisodeRepository::findBySeriesId()</Code> pour récupérer les épisodes</ListItem>
                    <ListItem>Associer ces épisodes à la série passée en paramètre</ListItem>
                </List>

                <Text className="mt-5">Compléter ensuite la méthode <Code>getServiceByIdWithEpisode</Code> :</Text>
                <List>
                    <ListItem>Récupérer la série via <Code>SeriesRepository::findById()</Code></ListItem>
                    <ListItem>Enrichir cette série avec ses épisodes via <Code>SerieService::addEpisodeToSerie()</Code></ListItem>
                    <ListItem>Retourner la série complète avec ses épisodes</ListItem>
                </List>

                <Heading level={2}>Mise à jour du contrôleur et de la vue</Heading>

                <Text className="mt-5">Modifier la méthode <Code>show()</Code> du contrôleur <Code>SeriesController</Code> :</Text>
                <List>
                    <ListItem>Remplacer l&apos;appel direct aux repositories par <Code>SerieService::getServiceByIdWithEpisode()</Code></ListItem>
                </List>

                <Text className="mt-5">Modifier le fichier <Code>series.html.php</Code> :</Text>
                <List>
                    <ListItem>Utiliser la méthode <Code>Serie::getEpisodesBySeason()</Code> pour afficher les épisodes</ListItem>
                </List>
            </section>
            <section>
                <Heading level={2} netflex>C- Administration</Heading>

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
                <CodeCard language="php" filename="footer_admin.html.php" collapsible>
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
                <Text>Pourquoi <Code>header_admin.php</Code> et <Code>footer_admin.php</Code> ?
                    Pour éviter de répéter le même code HTML sur chaque page d’administration (principe <strong>“Don’t Repeat Yourself”</strong> <em>(Ne te répète pas)</em>).
                    Un seul fichier pour le header et le footer = maintenance plus simple et design cohérent, distinct du site public.</Text>

                <Heading level={3}>2. Liste des saisons</Heading>

                <Text>
                    Dans cette partie, nous allons créer un panneau d'administration pour les <strong>Saisons</strong>.
                    Ce panneau permettra, dans un prochain TP, de créer, modifier et supprimer des saisons.
                </Text>

                <List ordered>
                    <ListItem>
                        Créer la méthode <Code>AdminSaisonController::list()</Code>, son appel dans <Code>admin.php</Code>,
                        et la vue correspondante <Code>saison_list.html.php</Code>.
                        <br />
                        <CodeCard language="php" filename="saison_list.html.php" collapsible>
                            {`<?php require_once __DIR__ . '/../_template/header_admin.html.php'; ?>

<main class="container-fluid py-4">
    <h2 class="text-white mb-3"><i class="fas fa-calendar-alt text-danger me-2"></i>Liste des saisons</h2>

    <div class="card bg-dark text-white border-secondary">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-dark table-hover mb-0">
                    <thead class="border-bottom border-danger">
                        <tr>
                            <th style="width: 60px;">ID</th>
                            <th>Titre</th>
                            <th>Description</th>
                            <th style="width: 120px;">Année début</th>
                            <th style="width: 120px;">Année fin</th>
                            <th style="width: 100px;">Saison actuelle</th>
                            <th style="width: 100px;">Qualité</th>
                            <th style="width: 100px;">Audio</th>
                            <th>Tags</th>
                            <th style="width: 150px;">Nombre de saisons</th>
                            <th style="width: 150px;" class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($saisons as $saison): ?>
                        <tr>
                            
                            <td class="align-middle text-end">
                                <div class="btn-group btn-group-sm" role="group">
                                    <a href="admin.php?action=edit&id="
                                       class="btn btn-outline-warning"
                                       title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </a>
                                    <a href="admin.php?action=delete&id="
                                       class="btn btn-outline-danger"
                                       title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</main>

<?php require_once __DIR__ . '/../_template/footer_admin.html.php'; ?>`}
                        </CodeCard>
                    </ListItem>

                    <ListItem>
                        Compléter la méthode <Code>getAllServiceWithEpisode(): array</Code> afin de récupérer l'ensemble des saisons avec leurs épisodes associés.
                    </ListItem>

                    <ListItem>
                        Utiliser la méthode <Code>getAllServiceWithEpisode(): array</Code> dans <Code>AdminSaisonController::list()</Code>
                        pour transmettre la liste des saisons à la vue.
                    </ListItem>

                    <ListItem>
                        Compléter la vue <Code>saison_list.html.php</Code> afin que le tableau affiche la liste des saisons,
                        et que les boutons d'action redirigent vers les pages appropriées en incluant l'identifiant (<Code>id</Code>) dans l'URL.
                    </ListItem>
                </List>
                <Heading level={3}>2. Liste des épisodes</Heading>

                <Text>
                    En reprenant la logique présentée ci-dessus, créez une liste des épisodes de la série passée en paramètre.
                    Le point d'entrée devra être le fichier <Code>admin_episode.php</Code>.
                    Dans cette vue, le tableau affichera la liste des épisodes, et ne comportera que les boutons d'action <strong>Modifier</strong> et <strong>Supprimer</strong>.
                    La vue affichera les colonnes suivantes :</Text>
                    <CodeCard language="html">
                        {`<thead class="border-bottom border-secondary">
    <tr>
        <th style="width: 60px;">ID</th>
        <th>Titre</th>
        <th style="width: 80px;">Saison</th>
        <th style="width: 80px;">Épisode N°</th>
        <th style="width: 120px;">Durée</th>
        <th style="width: 150px;">Date de sortie</th>
        <th style="width: 150px;">Créé le</th>
        <th style="width: 150px;">Mis à jour</th>
        <th style="width: 150px;" class="text-end">Actions</th>
    </tr>
</thead>`}
                    </CodeCard>
            </section>

            <section>
                <Heading level={2}>C- API (optionnel)</Heading>

                <Text>
                    Dans cette partie, nous allons créer une première route d’API permettant de récupérer les séries ainsi que leurs saisons et épisodes associés.
                </Text>

                <List ordered>
                    <ListItem>
                        Créer un contrôleur <Code>ApiController</Code> contenant une méthode <Code>index()</Code>.
                        Cette méthode aura pour rôle d’appeler le service <Code>SerieService::getAllServiceWithEpisode()</Code>
                        afin de récupérer l’ensemble des données nécessaires.
                    </ListItem>

                    <ListItem>
                        Créer un point d’entrée <Code>api.php</Code> qui appellera la méthode <Code>ApiController::index()</Code>.
                        Ce fichier jouera le même rôle que <Code>admin.php</Code> ou <Code>index.php</Code>, mais dédié aux appels API.
                    </ListItem>

                    <ListItem>
                        Dans la méthode <Code>index()</Code>, au lieu d’utiliser une vue avec <Code>view()</Code>, vous utiliserez la méthode <Code>json($data)</Code> permettant d’envoyer les données au format JSON.
                    </ListItem>

                    <ListItem>
                        <Text>
                            Pour que vos objets <Code>Series</Code> et <Code>Episode</Code> soient sérialisables en JSON, vous devez soit :
                        </Text>
                        <List>
                            <ListItem>
                                Implémenter l’interface <Code>JsonSerializable</Code> dans les classes <Code>Series</Code> et <Code>Episode</Code>.
                                Par exemple :
                                <CodeCard language="php">
                                    {`class Series implements JsonSerializable {
    public function jsonSerialize(): array {
        return [
            'id' => $this->getId(),
            'title' => $this->getTitle(),
            'description' => $this->getDescription(),
            'releaseYearStart' => $this->getReleaseYearStart(),
            'releaseYearEnd' => $this->getReleaseYearEnd(),
            'currentSeason' => $this->getCurrentSeason(),
            'quality' => $this->getQuality(),
            'audio' => $this->getAudio(),
            'image' => $this->getImage(),
            'tags' => $this->getTags(),
            'createdAt' => $this->getCreatedAt()->format(DATE_ATOM),
            'updatedAt' => $this->getUpdatedAt()->format(DATE_ATOM),
            'episodes' => array_map(fn($ep) => $ep->jsonSerialize(), $this->getEpisodes() ?? []),
        ];
    }
}`}
                                </CodeCard>
                            </ListItem>

                            <ListItem>
                                De la même manière, dans <Code>Episode</Code> :
                                <CodeCard language="php">
                                    {`class Episode implements JsonSerializable {
    public function jsonSerialize(): array {
        return [
            'id' => $this->getId(),
            'seriesId' => $this->getSeriesId(),
            'title' => $this->getTitle(),
            'season' => $this->getSeason(),
            'episodeNumber' => $this->getEpisodeNumber(),
            'duration' => $this->getDuration(),
            'releaseDate' => $this->getReleaseDate()?->format(DATE_ATOM),
            'createdAt' => $this->getCreatedAt()->format(DATE_ATOM),
            'updatedAt' => $this->getUpdatedAt()->format(DATE_ATOM),
        ];
    }
}`}
                                </CodeCard>
                            </ListItem>
                        </List>
                    </ListItem>
                </List>
                <Text>Vous pourrez tester via <Link href="localhost:8000/api.php" target="_blank">localhost:8000/api.php</Link></Text>
            </section>

        </article>
    );
}