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
                <Heading level={2} netflex>A – Formulaire de login</Heading>
                <Text>
                    Lorsqu&apos;un utilisateur soumet le formulaire de connexion, nous vérifions si le
                    login et le mot de passe sont valides en les comparant aux données en base. En cas de succès, nous
                    créons une session en stockant l&apos;objet utilisateur sérialisé dans <Code>$_SESSION</Code>.
                </Text>

                <List ordered>
                    <ListItem>
                        Ajouter au <Code>AccountRepository</Code> une méthode <Code>findByEmail(string
                        $email):?Account</Code> permettant de récupérer les informations d&apos;un utilisateur à partir de
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
            $row['password'], // colonne DB "password"
            $row['birthdate'] ?? null,
            new DateTime($row['created_at']),
            new DateTime($row['updated_at'])
        );
    }`}
                        </CodeCard>
                    </ListItem>
                    <ListItem>
                        Modifier le <Code>LoginController()</Code> pour faire en sorte qu&apos;il
                        appelle <Code>AccountRepository#findByEmail</Code> avec l&apos;email saisi pour l&apos;utilisateur.
                    </ListItem>
                    <ListItem>
                       Si un <Code>Accounts</Code> est retourné utiliser la fonction <Link
                        href="https://www.php.net/manual/fr/function.password-verify.php"><Code
                        className="text-php">password_verify</Code></Link> pour verifier si le mot de passe est valide.
                    </ListItem>
                    <ListItem>
                        Si le formulaire est valide, ajouter dans <Code>$_SESSION['account']</Code> l'objet <Code>Account</Code> créer precedent
                    </ListItem>
                </List>
            </section>
        </article>
    );
}