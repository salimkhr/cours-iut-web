// app/tp/page.tsx
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
import MilgramModalContent from "@/cours/javascript/4-fetch/MilgramModalContent";
import {AlertTriangle, CheckCircle2, Info, Target} from "lucide-react";
import CodeCard from "@/components/Cards/CodeCard";
import {List, ListItem} from "@/components/ui/List";
import Link from "next/link";

export default function TP() {
    return (
        <article className="space-y-8">
            <section className="space-y-4">
                <Heading level={2}>L'expérience de Milgram</Heading>
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
                                <DialogTitle>L'Expérience de Milgram et ses prolongements</DialogTitle>
                                <DialogDescription>
                                    Une étude sur l'obéissance à l'autorité (1961-1963)
                                </DialogDescription>
                            </DialogHeader>
                            <MilgramModalContent/>
                        </DialogContent>
                    </Dialog>
                    {" "}menée par Stanley Milgram à l'Université de Yale (1961-1963),
                    cette expérience cherche à comprendre comment des individus ordinaires
                    ont pu participer aux atrocités nazies.
                </Text>
                <Text>
                    Dans ce TP, vous allez créer une simulation interactive où l'utilisateur
                    joue le rôle de l'enseignant et doit répondre aux instructions d'un expérimentateur.
                    Vous utiliserez l'API Fetch pour communiquer avec un serveur backend qui gère
                    la logique de l'expérience.
                </Text>
            </section>

            <section className="space-y-4">
                <Heading level={3}>Installation du backend</Heading>
                <Text>
                    Le backend de ce TP est fourni sous forme d'un serveur Node.js.
                    Pour l'installer et le lancer :
                </Text>

                <CodeCard language="bash">
                    {`# Cloner le dépôt
git clone https://github.com/votre-repo/milgram-backend.git
cd milgram-backend

# Installer les dépendances
npm install

# Lancer le serveur
npm start

# Le serveur démarre sur http://localhost:3001`}
                </CodeCard>

                <Alert>
                    <Info className="h-4 w-4"/>
                    <AlertTitle>Note importante</AlertTitle>
                    <AlertDescription>
                        <Text>Assurez-vous que le serveur backend tourne avant de commencer le TP.
                            Vous pouvez vérifier qu'il fonctionne en accédant à
                            <Link href="http://localhost:3001/health" target="_blank"
                                  className="bg-muted px-1 rounded">http://localhost:3001/health</Link></Text>
                    </AlertDescription>
                </Alert>

                <div className="space-y-3">
                    <Text className="font-semibold">Endpoints disponibles :</Text>
                    <List ordered={false}>
                        <ListItem>
                            <code className="bg-muted px-2 py-1 rounded text-sm">POST /api/session</code>
                            {" "}- Créer une nouvelle session
                        </ListItem>
                        <ListItem>
                            <code className="bg-muted px-2 py-1 rounded text-sm">GET /api/question/:sessionId</code>
                            {" "}- Obtenir la question courante
                        </ListItem>
                        <ListItem>
                            <code className="bg-muted px-2 py-1 rounded text-sm">POST /api/answer</code>
                            {" "}- Soumettre une réponse
                        </ListItem>
                        <ListItem>
                            <code className="bg-muted px-2 py-1 rounded text-sm">POST /api/shock</code>
                            {" "}- Administrer un choc électrique
                        </ListItem>
                        <ListItem>
                            <code className="bg-muted px-2 py-1 rounded text-sm">GET /api/stats/:sessionId</code>
                            {" "}- Obtenir les statistiques
                        </ListItem>
                    </List>
                </div>
            </section>

            <section className="space-y-4">
                <Heading level={3}>Connexion au backend</Heading>
                <Text>
                    Commencez par créer une fonction utilitaire pour gérer les requêtes API.
                    Créez un fichier <code className="bg-muted px-2 py-1 rounded">src/lib/api.js</code> :
                </Text>

                <CodeCard language="javascript">
                    {`const API_BASE_URL = 'http://localhost:3001/api';

export async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur API');
  }

  return response.json();
}

// Créer une nouvelle session
export async function createSession() {
  return fetchAPI('/session', {
    method: 'POST',
    body: JSON.stringify({
      participantName: 'Anonymous',
      timestamp: new Date().toISOString(),
    }),
  });
}

// Obtenir la question courante
export async function getQuestion(sessionId) {
  return fetchAPI(\`/question/\${sessionId}\`);
}

// Soumettre une réponse
export async function submitAnswer(sessionId, answer) {
  return fetchAPI('/answer', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      answer,
      timestamp: new Date().toISOString(),
    }),
  });
}

// Administrer un choc
export async function administerShock(sessionId, voltage) {
  return fetchAPI('/shock', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      voltage,
      timestamp: new Date().toISOString(),
    }),
  });
}`}
                </CodeCard>

                <Alert>
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertTitle>Exercice</AlertTitle>
                    <AlertDescription>
                        Testez la connexion en créant une session et en affichant le résultat
                        dans la console. Que contient l'objet de réponse ?
                    </AlertDescription>
                </Alert>
            </section>

            <section className="space-y-4">
                <Heading level={3}>Initialisation des sessions et réponses aux questions</Heading>
                <Text>
                    Créez maintenant le composant principal de l'expérience.
                    Voici la structure de base :
                </Text>

                <CodeCard language="jsx">
                    {`'use client';

import { useState, useEffect } from 'react';
import { createSession, getQuestion, submitAnswer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MilgramExperience() {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialiser la session au montage du composant
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const session = await createSession();
        setSessionId(session.id);
        
        // Charger la première question
        const question = await getQuestion(session.id);
        setCurrentQuestion(question);
      } catch (error) {
        console.error('Erreur initialisation:', error);
      } finally {
        setLoading(false);
      }
    }
    
    init();
  }, []);

  // Soumettre la réponse
  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setLoading(true);
      const result = await submitAnswer(sessionId, userAnswer);
      
      // TODO: Gérer la réponse (correcte/incorrecte)
      console.log('Résultat:', result);
      
      // Charger la question suivante
      const nextQuestion = await getQuestion(sessionId);
      setCurrentQuestion(nextQuestion);
      setUserAnswer('');
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !currentQuestion) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold">
          Question {currentQuestion?.number}
        </h2>
        
        <p className="text-lg">{currentQuestion?.text}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Votre réponse..."
            disabled={loading}
          />
          
          <Button
            type="submit"
            disabled={loading || !userAnswer.trim()}
            className="w-full"
          >
            {loading ? 'Envoi...' : 'Soumettre'}
          </Button>
        </form>
      </div>
    </div>
  );
}`}
                </CodeCard>

                <Alert>
                    <CheckCircle2 className="h-4 w-4"/>
                    <AlertTitle>Exercice</AlertTitle>
                    <AlertDescription>
                        <Text className="mb-2">Améliorez le composant en ajoutant :</Text>
                        <List ordered={false}>
                            <ListItem>Un affichage du nombre de questions restantes</ListItem>
                            <ListItem>Un feedback visuel (vert/rouge) pour indiquer si la réponse est
                                correcte</ListItem>
                            <ListItem>Un historique des réponses précédentes</ListItem>
                        </List>
                    </AlertDescription>
                </Alert>
            </section>

            <section className="space-y-4">
                <Heading level={3}>Gestion des chocs électriques</Heading>
                <Text>
                    Lorsque l'élève donne une mauvaise réponse, l'expérimentateur ordonne
                    d'administrer un choc électrique. Le voltage augmente à chaque erreur.
                </Text>

                <CodeCard language="jsx">
                    {`// Ajouter au composant MilgramExperience
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

const [voltage, setVoltage] = useState(15); // Commence à 15V
const [shockHistory, setShockHistory] = useState([]);

async function handleShock() {
  try {
    setLoading(true);
    
    // Envoyer le choc au backend
    const result = await administerShock(sessionId, voltage);
    
    // Enregistrer dans l'historique
    setShockHistory([...shockHistory, {
      voltage,
      timestamp: new Date(),
      victimReaction: result.victimReaction,
    }]);
    
    // Augmenter le voltage de 15V
    setVoltage(prev => prev + 15);
    
    // Afficher la réaction de la victime
    alert(result.victimReaction);
    
  } catch (error) {
    console.error('Erreur choc:', error);
  } finally {
    setLoading(false);
  }
}

// Dans le JSX, ajouter un bouton pour administrer le choc
<Button
  onClick={handleShock}
  disabled={loading}
  variant={voltage >= 375 ? 'destructive' : 'default'}
  className="w-full"
>
  Administrer le choc ({voltage}V)
</Button>

// Afficher le niveau de danger
<Alert>
  <AlertDescription>
    <p className="font-semibold mb-2">
      Niveau actuel : {
        voltage < 60 ? 'Choc léger' :
        voltage < 120 ? 'Choc modéré' :
        voltage < 180 ? 'Choc fort' :
        voltage < 240 ? 'Choc intense' :
        voltage < 300 ? 'Choc très intense' :
        voltage < 375 ? 'Choc extrêmement intense' :
        voltage < 420 ? 'Attention : choc dangereux' :
        'XXX'
      }
    </p>
    <Progress value={(voltage / 450) * 100} className="h-2" />
  </AlertDescription>
</Alert>`}
                </CodeCard>

                <Alert variant="destructive">
                    <Target className="h-4 w-4"/>
                    <AlertTitle>Exercice final</AlertTitle>
                    <AlertDescription className="space-y-3">
                        <Text>Implémentez les fonctionnalités suivantes :</Text>
                        <List ordered={true}>
                            <ListItem>
                                Ajoutez 4 injonctions de l'expérimentateur qui apparaissent
                                progressivement si l'utilisateur hésite
                            </ListItem>
                            <ListItem>
                                Créez une page de résultats finale avec les statistiques :
                                <List ordered={false} className="mt-2 ml-4">
                                    <ListItem>Voltage maximal atteint</ListItem>
                                    <ListItem>Nombre de chocs administrés</ListItem>
                                    <ListItem>Pourcentage de réponses correctes</ListItem>
                                    <ListItem>Comparaison avec les résultats de Milgram (65%)</ListItem>
                                </List>
                            </ListItem>
                            <ListItem>
                                Ajoutez un système de sons (optionnel) : cris de douleur simulés,
                                bip du générateur de chocs
                            </ListItem>
                            <ListItem>
                                Permettez à l'utilisateur de refuser de continuer à tout moment
                                et enregistrez à quel voltage il s'est arrêté
                            </ListItem>
                        </List>
                    </AlertDescription>
                </Alert>

                <div className="border-l-4 border-purple-500 bg-purple-50 p-4 space-y-2">
                    <Text className="font-semibold text-purple-900">
                        Réflexion éthique
                    </Text>
                    <Text className="text-purple-800">
                        Une fois le TP terminé, prenez un moment pour réfléchir : Comment vous
                        êtes-vous senti en créant cette simulation ? Pensez-vous qu'il soit
                        éthique de recréer cette expérience, même de manière virtuelle ?
                        Discutez-en avec vos camarades.
                    </Text>
                </div>
            </section>
        </article>
    );
}