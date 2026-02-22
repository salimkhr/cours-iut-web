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
                <Heading level={2}>A- L'expérience de Milgram</Heading>
                <Text>
                    Ce TP est inspiré de{" "}
                    <Dialog>
                        <DialogTrigger asChild>
                            <a href="#" className="text-blue-600 hover:underline">
                                l'expérience de Milgram
                            </a>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>L'expérience de Milgram et ses prolongements</DialogTitle>
                                <DialogDescription>
                                    Une étude sur l'obéissance à l'autorité (1961-1963)
                                </DialogDescription>
                            </DialogHeader>
                            <MilgramModalContent />
                        </DialogContent>
                    </Dialog>{" "}
                    menée par Stanley Milgram à l'Université de Yale, cette expérience cherche à comprendre comment des individus ordinaires ont pu participer aux atrocités nazies.
                </Text>
                <Text>
                    Dans ce TP, vous allez créer une simulation interactive où l'utilisateur joue le rôle de l'enseignant et doit répondre aux instructions d'un expérimentateur.
                    Vous utiliserez l'API Fetch pour communiquer avec un serveur backend qui gère la logique de l'expérience.
                </Text>
            </section>

            {/* Installation du backend */}
            <section className="space-y-4">
                <Heading level={3}>1/ Installation du backend</Heading>
                <Text>
                    Le backend de ce TP est fourni sous forme d'un serveur Node.js. Pour l'installer et le lancer :
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
                            <Code className="bg-muted px-2 py-1 rounded text-sm">GET /api/sessions/:sessionId</Code> - Obtenir la question courante et l’état de la session
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
                <Heading level={3}>2/ Création de la session</Heading>
                <Text>
                    Dans le fichier <Code>milgram.js</Code>, lors de l'événement <Code>load</Code> de la page, votre script devra appeler l'API pour créer une nouvelle session (<Code> POST /api/sessions</Code>.
                    L'identifiant de la session retourné par l'API devra être stocké dans le <Code>sessionStorage</Code> afin de pouvoir l'utiliser pour toutes les requêtes suivantes (questions, réponses, chocs simulés, statistiques).
                </Text>
                <List ordered>
                    <ListItem>Modifier le <Code>#stimulus</Code> pour afficher le premier stimulus.</ListItem>
                    <ListItem>Modifier le <Code>#status</Code> pour afficher le statut de la session.</ListItem>
                    <ListItem>Modifier le <Code>#NextVoltage</Code> pour afficher le voltage actuel.</ListItem>
                    <ListItem>Appeller la fonction <Code>generateSwitches()</Code> pour générer les boutons de réponse selon le voltage.</ListItem>
                </List>
            </section>

            {/* Envoi et gestion des réponses */}
            <section className="space-y-4">
                <Heading level={3}>3/ Gestion des réponses</Heading>
                <Text>
                    Implémentez un gestionnaire d’événement sur le bouton <Code>#validateResponse</Code> afin d’appeler la route <Code>POST /api/sessions/:id</Code> en lui transmettant la valeur saisie dans l’input <Code>#response</Code>.
                </Text>
                <List ordered>
                    <ListItem>
                        Selon la valeur de <Code>correct</Code>, utiliser{" "}
                        <Code>addChatMessage(correct, response)</Code> pour afficher
                        un message vert (si <Code>true</Code>) ou rouge (si <Code>false</Code>).
                    </ListItem>

                    <ListItem>
                        Ensuite, dans <strong>tous les cas</strong>, récupérer l’état courant via{" "}
                        <Code>GET /api/sessions/:sessionId</Code> puis :
                        <List>
                            <ListItem>Mettre à jour <Code>#stimulus</Code>.</ListItem>
                            <ListItem>Mettre à jour <Code>#status</Code>.</ListItem>
                            <ListItem>Mettre à jour <Code>#NextVoltage</Code>.</ListItem>
                            <ListItem>Rappeler <Code>generateSwitches()</Code>.</ListItem>
                        </List>
                    </ListItem>
                </List>
            </section>

            <section className="space-y-4">
                <Heading level={3}>4/ Administration des chocs</Heading>
                <Text>
                    Lorsque l'utilisateur clique sur un switch, un choc peut être administré. Tous les boutons ont un attribut <Code>data-voltage</Code>.
                </Text>

                <List ordered>
                    <ListItem>
                        Dans <Code>handleShock(voltage)</Code>, votre objectif est :
                        <List>
                            <ListItem>
                                Envoyer un POST au backend pour administrer le choc (référez-vous à la documentation de l'API pour les détails).
                            </ListItem>
                            <ListItem>
                                Utiliser la fonction utilitaire <Code>addShockMessage(level, reaction)</Code> pour ajouter un message dans le chat avec le niveau du choc et la réaction du sujet.
                            </ListItem>
                            <ListItem>
                                Mettre à jour le voltage affiché et rappeler <Code>generateSwitches()</Code> avec le voltage courant.
                            </ListItem>
                        </List>
                    </ListItem>
                </List>
            </section>

        </article>
    );
}
