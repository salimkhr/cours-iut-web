// components/MilgramModalContent.tsx
'use client';

import {ComparisonChart, MainChart, VariantesChart} from './MilgramCharts';
import Link from "next/link";
import {AlertTriangle} from "lucide-react";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import {List, ListItem} from "@/components/ui/List";

export default function MilgramModalContent() {
    return (
        <div className="space-y-6">
            <section className="space-y-3">
                <Heading level={3}>Contexte historique</Heading>
               <Text>
                    Menée par Stanley Milgram à l'Université de Yale (1961-1963), cette expérience cherche
                    à comprendre comment des individus ordinaires ont pu participer aux atrocités nazies.
                    Suite au procès d'Adolf Eichmann (1961), où ce dernier s'est défendu en affirmant avoir
                    "simplement obéi aux ordres", Milgram veut tester expérimentalement cette justification.
               </Text>
               <Text>
                    <strong>Question centrale :</strong> Jusqu'où un individu peut-il aller dans l'obéissance
                    à une autorité ?
               </Text>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Le protocole expérimental</Heading>
               <Text>
                    Des participants recrutés par petites annonces (rémunération : 4,50$) pensent participer
                    à une étude sur l'apprentissage et la mémoire. Chaque participant joue le rôle d'un
                    "enseignant" qui doit infliger des chocs électriques à un "élève" (en réalité un complice,
                    M. Wallace, comptable de 47 ans) à chaque mauvaise réponse.
               </Text>
               <Text>
                    L'intensité des chocs augmente progressivement de 15 à 450 volts par paliers de 15 volts.
                    Les interrupteurs sont étiquetés de "Choc léger" (15-60V) à "Attention : choc dangereux"
                    (375-420V) jusqu'à "XXX" (435-450V).
               </Text>
               <Text>
                    Un expérimentateur en blouse grise ordonne au participant de continuer malgré les
                    protestations de l'élève, en utilisant quatre injonctions standardisées :
               </Text>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 ml-4">
                    <ListItem>"Veuillez continuer"</ListItem>
                    <ListItem>"L'expérience exige que vous continuiez"</ListItem>
                    <ListItem>"Il est absolument indispensable que vous continuiez"</ListItem>
                    <ListItem>"Vous n'avez pas le choix, vous devez continuer"</ListItem>
                </ol>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Résultats de l'expérience de base</Heading>
                <div className="my-4">
                    <MainChart/>
                </div>
                <List>
                    <ListItem><strong>65% des participants</strong> (26 sur 40) vont jusqu'à 450 volts</ListItem>
                    <ListItem><strong>100%</strong> atteignent au moins 300 volts</ListItem>
                    <ListItem><strong>35%</strong> refusent entre 300 et 375 volts</ListItem>
                    <ListItem>Aucun ne s'arrête avant 300 volts</ListItem>
                </List>

                <h4 className="text-md font-semibold mt-4">Réactions observées</h4>
                <List>
                    <ListItem>Forte tension nerveuse : tremblements, sudation, rires nerveux</ListItem>
                    <ListItem>14 participants ont eu des rires nerveux incontrôlables</ListItem>
                    <ListItem>3 participants ont eu des crises convulsives (expérience arrêtée)</ListItem>
                    <ListItem>Beaucoup expriment leur malaise tout en continuant : "Je ne veux pas être responsable
                        si quelque chose lui arrive"
                    </ListItem>
                </List>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Les 18 variantes (facteurs d'influence)</Heading>
                <div className="my-4">
                    <VariantesChart/>
                </div>

                <h4 className="text-md font-semibold mt-4">Facteurs augmentant l'obéissance</h4>
                <List>
                    <ListItem>Proximité et prestige de l'autorité (65% à Yale vs 47,5% à Bridgeport)</ListItem>
                    <ListItem>Distance avec la victime (62,5% voix seule vs 30% contact tactile)</ListItem>
                    <ListItem>Pression du groupe : pairs obéissants → 92,5%</ListItem>
                    <ListItem>Cadre institutionnel légitime</ListItem>
                </List>

                <h4 className="text-md font-semibold mt-4">Facteurs diminuant l'obéissance</h4>
                <List>
                    <ListItem>Proximité avec la victime (voir, toucher)</ListItem>
                    <ListItem>Distance avec l'autorité (20,5% par téléphone)</ListItem>
                    <ListItem>Présence de pairs désobéissants → 10%</ListItem>
                    <ListItem>Libre choix du voltage → 2,5% seulement</ListItem>
                </List>

                <Text className="text-sm text-gray-700 mt-3">
                    <strong>Observation importante :</strong> Le genre, l'âge, la profession et le niveau
                    d'éducation n'ont pas d'impact significatif sur l'obéissance.
               </Text>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Le Jeu de la mort (2010) - Réplique télévisée</Heading>
               <Text>
                    Christophe Nick et France Télévisions créent une fausse émission de télé-réalité
                    "La Zone Xtrême" avec 80 candidats, une animatrice (Tania Young), et un public
                    de 200 personnes encourageant à continuer.
               </Text>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-3 my-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5"/>
                        <div className="space-y-1">
                            <Text className="text-sm font-semibold text-amber-900">
                                Avertissement
                           </Text>
                            <Text className="text-xs text-amber-800">
                                La bande-annonce ci-dessous contient des images de personnes en détresse psychologique
                                intense (cris, pleurs, tremblements). Ces images peuvent être choquantes ou
                                perturbantes.
                           </Text>
                        </div>
                    </div>
                </div>

               <Text>
                    <Link
                        href="https://www.dailymotion.com/video/xcn88h"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Voir la bande-annonce (Dailymotion) ↗
                    </Link>
               </Text>

                <div className="my-4">
                    <ComparisonChart/>
                </div>

                <h4 className="text-md font-semibold mt-4">Résultats</h4>
                <List>
                    <ListItem><strong>81% vont jusqu'au bout</strong> (460V) vs 65% chez Milgram</ListItem>
                    <ListItem>Hommes : 72,5% | Femmes : 82,5%</ListItem>
                    <ListItem>19% refusent de continuer (16 personnes sur 80)</ListItem>
                </List>

                <h4 className="text-md font-semibold mt-4">Enseignements</h4>
               <Text>
                    Le contexte télévisuel amplifie l'obéissance. Justifications fréquentes : "C'est pour
                    la télé", "C'est juste un jeu". La pression d'un public de 200 personnes est encore
                    plus efficace qu'un seul expérimentateur. "Faire pour la télé" devient une justification
                    aussi puissante que "faire pour la science".
               </Text>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Hannah Arendt et la "banalité du mal"</Heading>
               <Text>
                    En 1961, la philosophe Hannah Arendt assiste au procès d'Adolf Eichmann à Jérusalem,
                    ancien SS-Obersturmbannführer responsable de la logistique de la déportation des Juifs.
                    Elle s'attendait à rencontrer un monstre mais découvre un bureaucrate ordinaire, médiocre.
               </Text>

                <blockquote className="border-l-4 border-gray-400 pl-4 italic text-sm text-gray-600 my-3">
                    "Le mal peut être radical, mais il n'est jamais extrême, il n'a ni profondeur ni dimension
                    démoniaque. Il peut tout envahir et ravager le monde précisément parce qu'il se répand comme
                    un champignon à la surface."
                </blockquote>

                <h4 className="text-md font-semibold mt-4">Caractéristiques d'Eichmann selon Arendt</h4>
                <List>
                    <ListItem><strong>Absence de pensée critique :</strong> Incapacité à penser par lui-même,
                        à se mettre à la place des victimes
                    </ListItem>
                    <ListItem><strong>Obéissance aveugle :</strong> Respect absolu de la hiérarchie</ListItem>
                    <ListItem><strong>Langage bureaucratique :</strong> Euphémismes ("solution finale", "traitement spécial")
                        pour se distancier de la réalité
                    </ListItem>
                    <ListItem><strong>Conformisme :</strong> Désir d'être "un bon rouage" dans la machine administrative</ListItem>
                    <ListItem><strong>Déresponsabilisation :</strong> "Je ne faisais qu'obéir aux ordres"</ListItem>
                </List>

                <h4 className="text-md font-semibold mt-4">Le lien avec Milgram - L'état agentique</h4>
               <Text>
                    Milgram développe le concept d'"état agentique" : l'individu se perçoit comme l'agent
                    exécutif d'une volonté étrangère et cesse de se considérer comme acteur autonome.
                    Caractéristiques :
               </Text>
                <List>
                    <ListItem>Transfert de responsabilité vers l'autorité</ListItem>
                    <ListItem>Redéfinition de la situation ("contribuer à la science" vs "infliger la douleur")</ListItem>
                    <ListItem>Focalisation sur les aspects techniques</ListItem>
                    <ListItem>Anxiété morale mais poursuite de l'action</ListItem>
                </List>

                <Text>
                    Les participants de Milgram, comme Eichmann, transfèrent la responsabilité :
                    "C'est l'expérimentateur qui est responsable", "Je ne fais que suivre le protocole".
               </Text>

                <h4 className="text-md font-semibold mt-4">Controverse</h4>
               <Text>
                    Des historiens (Cesarani, Lipstadt) ont critiqué Arendt : Eichmann était un antisémite
                    convaincu et non un simple bureaucrate. Les archives révèlent qu'il a souvent dépassé
                    ses ordres. Cependant, la thèse reste pertinente pour comprendre comment des systèmes
                    transforment des individus ordinaires en rouages de la violence.
               </Text>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Limites et critiques</Heading>
                <List>
                    <ListItem><strong>Éthique :</strong> Stress psychologique important. Milgram a été critiqué
                        par l'APA. Ce protocole est interdit aujourd'hui
                    </ListItem>
                    <ListItem><strong>Validité écologique :</strong> Contexte de laboratoire ≠ situations réelles.
                        Les participants savaient être dans une expérience
                    </ListItem>
                    <ListItem><strong>Biais de demande :</strong> Certains auraient pu deviner que les chocs
                        n'étaient pas réels (Orne & Holland, 1968)
                    </ListItem>
                    <ListItem><strong>Interprétation alternative :</strong> Haslam & Reicher (2012) : les participants
                        s'identifient à la mission scientifique ("engaged followership") plutôt qu'obéissance passive
                    </ListItem>
                    <ListItem><strong>Variations culturelles importantes :</strong> De 20% à 90% selon les contextes</ListItem>
                </List>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Implications contemporaines</Heading>
               <Text>
                    Ces travaux éclairent de nombreuses situations actuelles :
               </Text>
                <List>
                    <ListItem><strong>Violences institutionnelles :</strong> Obéissance aux ordres illégitimes
                        (Abu Ghraib, bavures policières)
                    </ListItem>
                    <ListItem><strong>Scandales d'entreprise :</strong> Compliance malgré les dérives (Enron,
                        Volkswagen, lanceurs d'alerte)
                    </ListItem>
                    <ListItem><strong>Manipulation médiatique :</strong> Fake news, désinformation, autorité des médias</ListItem>
                    <ListItem><strong>Dérives de la télé-réalité :</strong> Humiliation publique "pour la télé"</ListItem>
                    <ListItem><strong>Systèmes bureaucratiques :</strong> Dilution de la responsabilité</ListItem>
                    <ListItem><strong>Cyberharcèlement :</strong> Obéissance aux normes de groupe en ligne</ListItem>
                </List>

                <Text>
                    <strong>Leçons :</strong> Importance de l'esprit critique, du courage de la désobéissance
                    légitime, de la responsabilité personnelle face à l'autorité, et de la protection des
                    lanceurs d'alerte.
               </Text>
            </section>

            <section className="space-y-3">
                <Heading level={3}>Bibliographie</Heading>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 ml-4">
                    <ListItem>Milgram, S. (1974). <em>Soumission à l'autorité</em>. Paris : Calmann-Lévy.</ListItem>

                    <ListItem>Arendt, H. (1963/1966). <em>Eichmann à Jérusalem : Rapport sur la banalité du mal</em>.
                        Paris : Gallimard.
                    </ListItem>

                    <ListItem>Nick, C. (réalisateur). (2010). <em>Le Jeu de la mort</em> [Documentaire].
                        France Télévisions.
                    </ListItem>

                    <ListItem>Beauvois, J.-L., & Joule, R.-V. (1981). <em>Soumission et idéologies :
                        Psychosociologie de la rationalisation</em>. Paris : PUF.
                    </ListItem>

                    <ListItem>Beauvois, J.-L. (2005). Illusions libérales et absolutisme de la soumission.
                        <em>Revue internationale de psychologie sociale</em>, 18(4), 135-173.
                    </ListItem>

                    <ListItem>Burger, J. M. (2009). Replicating Milgram: Would people still obey today?
                        <em>American Psychologist, 64</em>(1), 1-11.
                    </ListItem>

                    <ListItem>Haslam, S. A., & Reicher, S. D. (2012). Contesting the "Nature" of Conformity:
                        What Milgram and Zimbardo's Studies Really Show. <em>PLoS Biology, 10</em>(11), e1001426.
                    </ListItem>

                    <ListItem>Cesarani, D. (2006). <em>Adolf Eichmann</em>. Paris : Tallandier (édition française 2010).</ListItem>

                    <ListItem>Zimbardo, P. (2008). <em>L'effet Lucifer : Comprendre comment de bonnes personnes
                        se transforment en bourreaux</em>. Paris : CNRS Éditions.
                    </ListItem>

                    <ListItem>Doliński, D., et al. (2017). Would you deliver an electric shock in 2015?
                        <em>Social Psychological and Personality Science, 8</em>(8), 927-933.
                    </ListItem>
                </ol>

                <h4 className="text-md font-semibold mt-4">Ressources complémentaires</h4>
                <List>
                    <ListItem>Archives INA : Interviews de Stanley Milgram (sous-titrées)</ListItem>
                    <ListItem>Dossier pédagogique "Le Jeu de la mort" - France Télévisions</ListItem>
                    <ListItem>Cours en ligne - Université Paris Descartes et Grenoble</ListItem>
                    <ListItem>Podcast "Les Chemins de la philosophie" (France Culture) sur Hannah Arendt</ListItem>
                    <ListItem>Mémorial de la Shoah : ressources sur le procès Eichmann</ListItem>
                </List>
            </section>
        </div>
    );
}