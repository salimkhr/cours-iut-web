import {Metadata} from "next";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import PageFooter from "@/components/page/PageFooter";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Politique de confidentialité — Cours Web",
    noIndex: true,
});

export default function PolitiqueConfidentialitePage() {
    return (
        <main className="flex flex-col w-full min-h-screen bg-brand-light dark:bg-brand-dark">
            <div className="mx-auto max-w-3xl w-full px-6 lg:px-12 py-16 flex-1">
                <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light mb-2">
                    Politique de confidentialité
                </h1>
                <p className="text-sm text-brand-dark/50 dark:text-brand-light/50 mb-10">
                    Conformément au RGPD (UE 2016/679) et à la loi Informatique et Libertés.
                </p>

                <section className="space-y-8 text-brand-dark/80 dark:text-brand-light/80 text-sm leading-relaxed">
                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            1. Responsable du traitement
                        </h2>
                        <p>
                            Salim Khraimeche —{" "}
                            <Link href="mailto:salimkhr@gmail.com"
                                  className="underline hover:text-brand-accent transition-colors">
                                salimkhr@gmail.com
                            </Link>
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            2. Données collectées
                        </h2>
                        <p className="mb-3">
                            L&apos;accès aux contenus nécessite un compte utilisateur. Les données suivantes
                            sont collectées :
                        </p>
                        <table className="w-full text-xs border-collapse">
                            <thead>
                            <tr className="border-b border-brand-dark/20 dark:border-brand-light/20">
                                <th className="text-left py-2 pr-4 font-semibold">Donnée</th>
                                <th className="text-left py-2 pr-4 font-semibold">Finalité</th>
                                <th className="text-left py-2 font-semibold">Base légale</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-dark/10 dark:divide-brand-light/10">
                            <tr>
                                <td className="py-2 pr-4">Adresse e-mail</td>
                                <td className="py-2 pr-4">Identification, récupération de compte</td>
                                <td className="py-2">Exécution du contrat</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">Mot de passe (haché)</td>
                                <td className="py-2 pr-4">Authentification sécurisée</td>
                                <td className="py-2">Exécution du contrat</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">Photo de profil (optionnelle)</td>
                                <td className="py-2 pr-4">Personnalisation du compte</td>
                                <td className="py-2">Consentement</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">Rôle utilisateur</td>
                                <td className="py-2 pr-4">Contrôle d&apos;accès</td>
                                <td className="py-2">Intérêt légitime</td>
                            </tr>
                            </tbody>
                        </table>
                        <p className="mt-4">
                            Des cookies de session strictement nécessaires sont utilisés pour maintenir la
                            connexion. Aucun cookie publicitaire ou de traçage n&apos;est déposé.
                        </p>
                        <p className="mt-2">
                            Le formulaire de contact (e-mail) ne collecte que les informations
                            volontairement transmises (nom, e-mail, message).
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            3. Services tiers
                        </h2>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>
                                <strong>Cloudflare Turnstile</strong> — anti-bot sur les formulaires ;
                                peut collecter des données techniques (IP, empreinte navigateur).
                                Voir la{" "}
                                <Link href="https://www.cloudflare.com/privacypolicy/"
                                      target="_blank" rel="noopener noreferrer"
                                      className="underline hover:text-brand-accent transition-colors">
                                    politique Cloudflare
                                </Link>.
                            </li>
                            <li>
                                <strong>[NOM_SERVICE_IA]</strong> — les messages du chat pédagogique
                                transitent vers ce service pour générer les réponses.
                            </li>
                            <li>
                                <strong>[NOM_DE_L_HEBERGEUR]</strong> — hébergement et stockage des données.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            4. Durée de conservation
                        </h2>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Données de compte : jusqu&apos;à suppression du compte</li>
                            <li>Cookies de session : expiration automatique en fin de session</li>
                            <li>Journaux serveur : 90 jours maximum</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            5. Vos droits (RGPD)
                        </h2>
                        <p className="mb-2">
                            Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement,
                            de limitation, de portabilité et d&apos;opposition. Pour les exercer, contactez&nbsp;:{" "}
                            <Link href="mailto:salimkhr@gmail.com"
                                  className="underline hover:text-brand-accent transition-colors">
                                salimkhr@gmail.com
                            </Link>.
                        </p>
                        <p>
                            Vous pouvez également introduire une réclamation auprès de la{" "}
                            <Link href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer"
                                  className="underline hover:text-brand-accent transition-colors">
                                CNIL
                            </Link>.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            6. Sécurité
                        </h2>
                        <p>
                            Les mots de passe sont hachés (bcrypt). Les communications sont chiffrées
                            via HTTPS. L&apos;accès aux données est contrôlé par un système de rôles.
                        </p>
                    </div>
                </section>
            </div>

            <PageFooter/>
        </main>
    );
}
