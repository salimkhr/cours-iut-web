import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Code from "@/components/ui/Code";
import CodeCard from "@/components/Cards/CodeCard";
import CoursePrerequisites from "@/components/CoursePrerequisites";

export default function Cours() {
    return (
        <article>
            <CoursePrerequisites>
                <Text><strong>Architecture MVC avancée</strong> — couche service entre le contrôleur et le repository, injection des dépendances dans le constructeur.</Text>
                <Text><strong>Sessions PHP</strong> — <Code>session_start()</Code> active la session, <Code>$_SESSION</Code> stocke les données côté serveur entre les requêtes.</Text>
                <CodeCard language="php" title="Sessions PHP">
                    {`session_start();
$_SESSION['user_id'] = 42;
// Requête suivante :
session_start();
echo $_SESSION['user_id']; // 42`}
                </CodeCard>
                <Text><strong>PDO et repositories</strong> — entités PHP, requêtes préparées SELECT/INSERT/UPDATE/DELETE, pattern repository pour isoler l&apos;accès aux données.</Text>
                <Text><strong>Principes SOLID</strong> — SRP (une classe = une responsabilité), DIP (dépendre d&apos;abstractions), OCP (ouvert à l&apos;extension, fermé à la modification).</Text>
            </CoursePrerequisites>
            <section>
                <Heading level={2}>cours</Heading>
            </section>
        </article>
    );
}
