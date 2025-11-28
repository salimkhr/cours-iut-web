import Heading from "@/components/ui/Heading";
import {Text} from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";
import CodeCard from "@/components/Cards/CodeCard";

export default function TP() {
    return (
        <article>
            <section>
                <Heading level={2} netflex>A – Préparation de la base de données</Heading>
                <Text>
                    Avant de commencer, nous devons ajouter la colonne <Code>is_admin</Code> à la
                    table <Code>accounts</Code> pour gérer les droits d&apos;administration.
                </Text>

                <List ordered>
                    <ListItem>
                        Exécuter le script SQL suivant pour ajouter la colonne <Code>is_admin</Code> :
                        <CodeCard language="sql">
                            {`ALTER TABLE accounts
                                ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Modifier la classe <Code>Account</Code> pour ajouter l&apos;attribut <Code>isAdmin</Code>
                    </ListItem>
                </List>
            </section>

            <section className="mt-8">
                <Heading level={2} netflex>B – Formulaire de login</Heading>
                <Heading level={3}>1. Vérification du mot de passe</Heading>
                <Text>
                    Lorsqu&apos;un utilisateur soumet le formulaire de connexion, nous vérifions si le
                    login et le mot de passe sont valides en les comparant aux données en base. En cas de succès, nous
                    créons une session en stockant l&apos;objet utilisateur sérialisé dans <Code>$_SESSION</Code>.
                </Text>

                <List ordered>
                    <ListItem>
                        Ajouter au <Code>AccountRepository</Code> une méthode <Code>findByEmail(string
                        $email):?Account</Code> permettant de récupérer les informations d&apos;un utilisateur à partir
                        de
                        son email.
                        <CodeCard language="php">
                            {`/**
     * Find account by email
     */
    public function findByEmail(string $email): ?Account
    {
        $stmt = $this->pdo->prepare("
            SELECT *
            FROM accounts
            WHERE email = :email
        ");

        $stmt->execute(['email' => $email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->createAccountFromRow($row) : null;
    }


    /**
     * Find account by id
     */
    public function findById(int $id): ?Account
    {
        $stmt = $this->pdo->prepare("
            SELECT *
            FROM accounts
            WHERE id = :id
        ");

        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ? $this->createAccountFromRow($row) : null;
    }


    /**
     * Convert DB row to Account object
     */
    public function createAccountFromRow(array $row): Account
    {
        return new Account(
            isset($row['id']) ? (int)$row['id'] : null,
            $row['username'],
            $row['email'],
            $row['password_hash'], // colonne DB "password"
            $row['birthdate'] ?? null,
            new DateTime($row['created_at']),
            new DateTime($row['updated_at']),
            isset($row['is_admin']) ? (bool)$row['is_admin'] : false
        );
    }`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Modifier le <Code>LoginController()</Code> pour faire en sorte qu&apos;il
                        appelle <Code>AccountRepository#findByEmail</Code> avec l&apos;email saisi pour
                        l&apos;utilisateur.
                    </ListItem>
                    <ListItem>
                        Si un <Code>Accounts</Code> est retourné utiliser la fonction <Link
                        href="https://www.php.net/manual/fr/function.password-verify.php"><Code
                        className="text-php">password_verify</Code></Link> pour verifier si le mot de passe est valide.
                    </ListItem>
                    <ListItem>
                        Si le formulaire est valide, ajouter
                        dans <Code>$_SESSION['account']</Code> l'objet <Code>Account</Code> créer precedent
                    </ListItem>
                    <ListItem>En implementant les fonctions <Link target="_blank"
                                                                  href="https://www.php.net/manual/fr/language.oop5.serialization.php"><Code>serialize()</Code> et <Code>unserialize()</Code></Link> faite
                        en sorte que l'objet Account sois
                        sérialisé sans stocker le mot de passe</ListItem>
                </List>

                <Heading level={3} className="mt-4">2. Sécurisation de l&apos;AdminSeriesController</Heading>

                <List ordered>
                    <ListItem>
                        Dans le <Code>AdminSeriesController</Code>, créer une méthode privée <Code>checkAdminAccess():
                        void</Code> qui :
                        <List>
                            <ListItem>Vérifie si un utilisateur est présent
                                dans <Code>$_SESSION['account']</Code></ListItem>
                            <ListItem>Si aucun utilisateur n&apos;est connecté, redirige
                                vers <Code>login.php</Code></ListItem>
                            <ListItem>Récupère l&apos;objet <Code>Account</Code> depuis la session</ListItem>
                            <ListItem>Vérifie si l&apos;utilisateur est administrateur avec la
                                méthode <Code>isAdmin()</Code></ListItem>
                            <ListItem>Si l&apos;utilisateur n&apos;est pas admin, redirige
                                vers <Code>home.php</Code></ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Appeler la méthode <Code>checkAdminAccess()</Code> au début de chaque méthode du contrôleur
                        : <Code>list()</Code>, <Code>create()</Code>, <Code>edit()</Code> et <Code>delete()</Code>.
                    </ListItem>
                </List>
            </section>
            <section className="mt-8">
                <Heading level={2} netflex>C – Historique de navigation</Heading>
                <Text>
                    Nous allons implémenter un système d&apos;historique pour tracer les séries consultées par
                    l&apos;utilisateur.
                </Text>

                <List ordered>
                    <ListItem>
                        Dans le <Code>SerieController</Code>, méthode <Code>show()</Code>, après avoir récupéré
                        la série depuis la base de données :
                        <List>
                            <ListItem>Vérifier qu&apos;un utilisateur est connecté
                                (<Code>$_SESSION['account']</Code>)</ListItem>
                            <ListItem>Initialiser <Code>$_SESSION['history']</Code> comme un tableau vide s&apos;il
                                n&apos;existe pas</ListItem>
                            <ListItem>Créer un tableau associatif <Code>$historyItem</Code> contenant :
                                <List>
                                    <ListItem><Code>id</Code> : récupérer
                                        via <Code>$series-&gt;getId()</Code></ListItem>
                                    <ListItem><Code>title</Code> : récupérer
                                        via <Code>$series-&gt;getTitle()</Code></ListItem>
                                    <ListItem><Code>image</Code> : récupérer
                                        via <Code>$series-&gt;getImage()</Code></ListItem>
                                    <ListItem><Code>viewed_at</Code> : la date et heure actuelles (format <Code>Y-m-d
                                        H:i:s</Code>)</ListItem>
                                </List>
                            </ListItem>
                            <ListItem>Supprimer de <Code>$_SESSION['history']</Code> les entrées ayant le
                                même <Code>id</Code> que la série actuelle (pour éviter les doublons)</ListItem>
                            <ListItem>Ajouter <Code>$historyItem</Code> au début du tableau
                                avec <Code>array_unshift()</Code></ListItem>
                            <ListItem>Limiter l&apos;historique aux 20 dernières consultations
                                avec <Code>array_slice()</Code></ListItem>
                        </List>
                    </ListItem>
                    <ListItem>
                        Créer un fichier <Code>views/partials/history-modal.php</Code> pour afficher la modal Bootstrap
                        :
                        <CodeCard language="php">
                            {`<!-- Modal Historique -->
<div class="modal fade" id="historyModal" tabindex="-1" aria-labelledby="historyModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="historyModalLabel">
                    <i class="bi bi-clock-history"></i> Historique de navigation
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <?php 
                // TODO: Vérifier si $_SESSION['history'] existe et n'est pas vide
                // Si oui, afficher la liste, sinon afficher le message d'historique vide
                ?>
                
                    <div class="list-group">
                        <?php 
                        // TODO: Boucler sur $_SESSION['history']
                        // Pour chaque élément, afficher un lien avec l'image, le titre et la date
                        ?>
                            <a href="/serie/<?= /* TODO: afficher l'id */ ?>" class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 align-items-center">
                                    <img src="<?= /* TODO: afficher l'image avec htmlspecialchars */ ?>" 
                                         alt="<?= /* TODO: afficher le title avec htmlspecialchars */ ?>"
                                         class="me-3"
                                         style="width: 50px; height: 75px; object-fit: cover;">
                                    <div class="flex-grow-1">
                                        <h6 class="mb-1"><?= /* TODO: afficher le title avec htmlspecialchars */ ?></h6>
                                        <small class="text-muted">
                                            Consulté le <?= /* TODO: afficher viewed_at formaté avec date('d/m/Y à H:i', strtotime(...)) */ ?>
                                        </small>
                                    </div>
                                </div>
                            </a>
                        <?php /* TODO: fin de la boucle */ ?>
                    </div>
                
                    <div class="alert alert-info" role="alert">
                        <i class="bi bi-info-circle"></i> Votre historique est vide. 
                        Consultez des séries pour qu'elles apparaissent ici !
                    </div>
                
            </div>
            <div class="modal-footer">
                <?php 
                // TODO: Afficher le bouton "Vider l'historique" seulement si l'historique n'est pas vide
                ?>
                    <form method="POST" action="history.php">
                        <button type="submit" class="btn btn-danger">
                            <i class="bi bi-trash"></i> Vider l'historique
                        </button>
                    </form>
                
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
            </div>
        </div>
    </div>
</div>`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Dans <Code>views/home.html.php</Code>, modifier la navbar pour ajouter le bouton
                        d&apos;historique :
                        <CodeCard language="php">
                            {`<div class="d-flex align-items-center gap-3">
    <nav class="d-none d-md-flex gap-3">
        <a class="text-white text-decoration-none" href="#">Home</a>
        <a class="text-white text-decoration-none" href="#">Series</a>
        <a class="text-white text-decoration-none" href="#">Movies</a>
        <a class="text-white text-decoration-none" href="#">New & Popular</a>
        <a class="text-white text-decoration-none" href="#">My List</a>
    </nav>
    
    <?php 
    // TODO: Vérifier si un utilisateur est connecté ($_SESSION['account'])
    // Si oui, afficher le bouton ci-dessous
    ?>
        <button type="button" 
                class="btn btn-outline-light btn-sm" 
                data-bs-toggle="modal" 
                data-bs-target="#historyModal">
            <i class="bi bi-clock-history"></i> Historique
            <?php 
            // TODO: Si l'historique existe et contient des éléments, afficher un badge avec le nombre d'éléments
            ?>
                <span class="badge bg-danger"><?= /* TODO: afficher count($_SESSION['history']) */ ?></span>
            
        </button>
    
</div>`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Inclure la modal avant la fermeture
                        du <Code>&lt;body&gt;</Code> dans <Code>views/home.html.php</Code> :
                        <CodeCard language="php">
                            {`<!-- Avant la fermeture du body -->
<?php 
// TODO: Vérifier si un utilisateur est connecté
// Si oui, inclure la modal avec require_once __DIR__ . '/partials/history-modal.php'
?>

</body>
</html>`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Créer un <Code>HistoryController</Code> avec une méthode <Code>clear()</Code> qui :
                        <List>
                            <ListItem>Vérifie qu&apos;un utilisateur est connecté, sinon redirige
                                vers <Code>login.php</Code></ListItem>
                            <ListItem>Réinitialise <Code>$_SESSION['history']</Code> à un tableau vide</ListItem>
                            <ListItem>Redirige vers <Code>home.php</Code> par défaut</ListItem>
                        </List>
                    </ListItem>
                </List>
            </section>
        </article>
    );
}