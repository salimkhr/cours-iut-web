import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import MilgramModalContent from "@/cours/javascript/4-fetch/modal/MilgramModalContent";
import {Info} from "lucide-react";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";
import Code from "@/components/ui/Code";

export default function TP() {
    return (
        <article className="space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
                <Heading level={2}>A- L&apos;expérience de Milgram</Heading>
                <Text>
                    Ce TP est inspiré de{" "}
                    <Dialog>
                        <DialogTrigger asChild>
                            <a href="#" className="text-blue-600 hover:underline">
                                l&apos;expérience de Milgram
                            </a>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>L&apos;expérience de Milgram et ses prolongements</DialogTitle>
                                <DialogDescription>
                                    Une étude sur l&apos;obéissance à l&apos;autorité (1961-1963)
                                </DialogDescription>
                            </DialogHeader>
                            <MilgramModalContent />
                        </DialogContent>
                    </Dialog>{" "}
                    menée par Stanley Milgram à l&apos;Université de Yale, cette expérience cherche à
                    comprendre comment des individus ordinaires ont pu participer aux atrocités nazies.
                </Text>
                <Text>
                    Dans ce TP, vous allez créer une simulation interactive où l&apos;utilisateur joue le
                    rôle de l&apos;enseignant et doit répondre aux instructions d&apos;un expérimentateur.
                    Vous utiliserez l&apos;API Fetch pour communiquer avec un serveur backend qui gère la
                    logique de l&apos;expérience.
                </Text>
            </section>

            {/* Installation du backend */}
            <section className="space-y-4">
                <Heading level={2}>B- Installation du backend</Heading>
                <Text>
                    Le backend de ce TP est fourni sous forme d&apos;un serveur Node.js. Pour l&apos;installer
                    et le lancer :
                </Text>
                <CodeCard language="bash">
                    {`# Cloner le dépôt
git clone https://gitlab.com/iut3334332/javascript/milgram.git
cd milgram/backend

# Installer les dépendances
npm install

# Lancer le build
npm run build

# Lancer le serveur
npm run start

# Le serveur démarre sur http://localhost:3000`}
                </CodeCard>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Note importante</AlertTitle>
                    <AlertDescription>
                        <Text>
                            Assurez-vous que le serveur backend tourne avant de commencer le TP. Vous pouvez vérifier son état en accédant à{" "}
                            <Link href="http://localhost:3000/health" target="_blank" className="bg-muted px-1 rounded">
                                http://localhost:3000/health
                            </Link>
                        </Text>
                    </AlertDescription>
                </Alert>

                <div className="space-y-3">
                    <Text className="font-semibold">Endpoints disponibles :</Text>
                    <List ordered={false}>
                        <ListItem>
                            <Code className="bg-muted px-2 py-1 rounded text-sm">POST /api/sessions</Code> - Créer une nouvelle session
                        </ListItem>
                        <ListItem>
                            <Code className="bg-muted px-2 py-1 rounded text-sm">GET /api/sessions/:sessionId</Code> - Obtenir la question courante et l&rsquo;état de la session
                        </ListItem>
                        <ListItem>
                            <Code className="bg-muted px-2 py-1 rounded text-sm">POST /api/sessions/:sessionId</Code> - Soumettre une réponse
                        </ListItem>
                        <ListItem>
                            <Code className="bg-muted px-2 py-1 rounded text-sm">POST /api/sessions/:sessionId/simulated-shock</Code> - Administrer un choc
                        </ListItem>
                        <ListItem>
                            <Code className="bg-muted px-2 py-1 rounded text-sm">DELETE /api/sessions/:sessionId</Code> - Terminer la session et obtenir les résultats finaux
                        </ListItem>
                    </List>
                    <Text className="text-sm text-muted-foreground">
                        La documentation complète est disponible dans le <strong>README.md</strong> du projet.
                    </Text>
                </div>
            </section>

            {/* Création de la session */}
            <section className="space-y-4">
                <Heading level={2}>C- Création de la session</Heading>
                <Text>
                    Dans le fichier <Code>milgram.js</Code>, lors de l&apos;événement <Code>load</Code> de la
                    page, votre script doit appeler l&apos;API pour créer une nouvelle session
                    (<Code>POST /api/sessions</Code>). L&apos;identifiant de la session retourné par
                    l&apos;API doit être stocké dans le <Code>sessionStorage</Code> afin de pouvoir
                    l&apos;utiliser pour toutes les requêtes suivantes (questions, réponses, chocs simulés,
                    statistiques).
                </Text>
                <List ordered>
                    <ListItem>Modifiez le <Code>#stimulus</Code> pour afficher le premier stimulus.</ListItem>
                    <ListItem>Modifiez le <Code>#status</Code> pour afficher le statut de la session.</ListItem>
                    <ListItem>Modifiez le <Code>#NextVoltage</Code> pour afficher le voltage actuel.</ListItem>
                    <ListItem>
                        Appelez la fonction <Code>generateSwitches()</Code> pour générer les boutons de
                        réponse selon le voltage.
                    </ListItem>
                </List>
            </section>

            {/* Envoi et gestion des réponses */}
            <section className="space-y-4">
                <Heading level={2}>D- Gestion des réponses</Heading>
                <Text>
                    Implémentez un gestionnaire d&rsquo;événement sur le bouton <Code>#validateResponse</Code>{" "}
                    afin d&rsquo;appeler la route <Code>POST /api/sessions/:id</Code> en lui transmettant la
                    valeur saisie dans l&rsquo;input <Code>#response</Code>.
                </Text>
                <List ordered>
                    <ListItem>
                        Selon la valeur de <Code>correct</Code>, utilisez{" "}
                        <Code>addChatMessage(correct, response)</Code> pour afficher un message vert (si{" "}
                        <Code>true</Code>) ou rouge (si <Code>false</Code>).
                    </ListItem>

                    <ListItem>
                        Ensuite, dans <strong>tous les cas</strong>, récupérez l&rsquo;état courant via{" "}
                        <Code>GET /api/sessions/:sessionId</Code> puis :
                        <List>
                            <ListItem>Mettez à jour <Code>#stimulus</Code>.</ListItem>
                            <ListItem>Mettez à jour <Code>#status</Code>.</ListItem>
                            <ListItem>Mettez à jour <Code>#NextVoltage</Code>.</ListItem>
                            <ListItem>Rappelez <Code>generateSwitches()</Code>.</ListItem>
                        </List>
                    </ListItem>
                </List>
            </section>

            <section className="space-y-4">
                <Heading level={2}>E- Administration des chocs</Heading>
                <Text>
                    Lorsque l&apos;utilisateur clique sur un switch, un choc peut être administré. Tous les
                    boutons ont un attribut <Code>data-voltage</Code>.
                </Text>

                <List ordered>
                    <ListItem>
                        Dans <Code>handleShock(voltage)</Code>, votre objectif est :
                        <List>
                            <ListItem>
                                Envoyez un POST au backend pour administrer le choc (référez-vous à la
                                documentation de l&apos;API pour les détails).
                            </ListItem>
                            <ListItem>
                                Utilisez la fonction utilitaire <Code>addShockMessage(level, reaction)</Code>{" "}
                                pour ajouter un message dans le chat avec le niveau du choc et la réaction du
                                sujet.
                            </ListItem>
                            <ListItem>
                                Mettez à jour le voltage affiché et rappelez <Code>generateSwitches()</Code>{" "}
                                avec le voltage courant.
                            </ListItem>
                        </List>
                    </ListItem>
                </List>
            </section>

        </article>
    );
}
