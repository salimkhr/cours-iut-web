import {Metadata} from "next";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import PageFooter from "@/components/page/PageFooter";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Conditions d'utilisation — Cours Web",
    noIndex: true,
});

export default function ConditionsUtilisationPage() {
    return (
        <main className="flex flex-col w-full min-h-screen bg-brand-light dark:bg-brand-dark">
            <div className="mx-auto max-w-3xl w-full px-6 lg:px-12 py-16 flex-1">
                <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light mb-2">
                    Conditions d&apos;utilisation
                </h1>
                <p className="text-sm text-brand-dark/50 dark:text-brand-light/50 mb-10">
                    En accédant à ce site, vous acceptez les présentes conditions.
                </p>

                <section className="space-y-8 text-brand-dark/80 dark:text-brand-light/80 text-sm leading-relaxed">
                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            1. Objet
                        </h2>
                        <p>
                            Ce site met à disposition des étudiants du BUT Informatique des supports pédagogiques
                            numériques&nbsp;: cours, travaux pratiques (TP), diagrammes, exemples de code et
                            sujets d&apos;examens. L&apos;accès est réservé aux personnes disposant d&apos;un
                            compte valide.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            2. Accès au service
                        </h2>
                        <p>
                            L&apos;accès aux contenus est conditionné à la création d&apos;un compte utilisateur.
                            L&apos;éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de
                            non-respect des présentes conditions, sans préavis.
                        </p>
                        <p className="mt-2">
                            Chaque utilisateur est responsable de la confidentialité de ses identifiants et de
                            toute activité effectuée depuis son compte.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            3. Utilisation des contenus pédagogiques
                        </h2>
                        <p className="mb-2">
                            Les documents disponibles sont fournis <strong>exclusivement à des fins
                            pédagogiques</strong>, dans le cadre de la formation dispensée à l&apos;IUT.
                        </p>
                        <p className="mb-2">Il est <strong>strictement interdit</strong> de&nbsp;:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>reproduire, diffuser ou publier ces documents sans autorisation écrite préalable,</li>
                            <li>utiliser ces contenus à des fins commerciales ou lucratives,</li>
                            <li>présenter ces documents comme étant de sa propre création,</li>
                            <li>partager ses identifiants de connexion avec des tiers.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            4. Exactitude des contenus
                        </h2>
                        <p>
                            Les contenus sont rédigés avec soin, mais l&apos;éditeur ne garantit pas leur
                            exhaustivité ni leur exactitude absolue. Les technologies évoluant rapidement,
                            certains exemples peuvent devenir partiellement obsolètes entre deux mises à jour.
                            Toute erreur peut être signalée à{" "}
                            <strong>salimkhr@gmail.com</strong>.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            5. Disponibilité du service
                        </h2>
                        <p>
                            L&apos;éditeur s&apos;efforce d&apos;assurer la continuité de l&apos;accès, mais ne
                            peut garantir une disponibilité permanente. Il se réserve le droit de modifier,
                            retirer ou suspendre tout contenu ou fonctionnalité sans préavis.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            6. Assistant IA pédagogique
                        </h2>
                        <p>
                            Le site propose un assistant conversationnel alimenté par une intelligence
                            artificielle. Les réponses générées sont fournies à titre indicatif et ne
                            constituent pas un avis académique officiel. L&apos;éditeur décline toute
                            responsabilité en cas d&apos;erreur dans les réponses produites.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            7. Droit applicable
                        </h2>
                        <p>
                            Les présentes conditions sont régies par le droit français. En cas de litige,
                            et à défaut de résolution amiable, les juridictions françaises compétentes
                            seront saisies.
                        </p>
                    </div>
                </section>
            </div>

            <PageFooter/>
        </main>
    );
}
