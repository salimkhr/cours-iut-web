import {Metadata} from "next";
import {generatePageMetadata} from "@/lib/generatePageMetadata";
import PageFooter from "@/components/page/PageFooter";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
    defaultTitle: "Mentions légales — Cours Web",
    noIndex: true,
});

export default function MentionsLegalesPage() {
    return (
        <main className="flex flex-col w-full min-h-screen bg-brand-light dark:bg-brand-dark">
            <div className="mx-auto max-w-3xl w-full px-6 lg:px-12 py-16 flex-1">
                <h1 className="text-3xl font-bold text-brand-dark dark:text-brand-light mb-2">
                    Mentions légales
                </h1>
                <p className="text-sm text-brand-dark/50 dark:text-brand-light/50 mb-10">
                    Conformément aux articles 6-III et 19 de la Loi n°&nbsp;2004-575 du 21 juin 2004 (LCEN).
                </p>

                <section className="space-y-8 text-brand-dark/80 dark:text-brand-light/80 text-sm leading-relaxed">
                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            1. Éditeur du site
                        </h2>
                        <p>Ce site est édité par :</p>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li><strong>Nom&nbsp;:</strong> Salim Khraimeche</li>
                            <li><strong>Établissement&nbsp;:</strong> IUT — BUT Informatique</li>
                            <li><strong>Qualité&nbsp;:</strong> Étudiant / Chargé de contenu pédagogique</li>
                            <li>
                                <strong>Contact&nbsp;:</strong>{" "}
                                <Link href="mailto:salimkhr@gmail.com"
                                      className="underline hover:text-brand-accent transition-colors">
                                    salimkhr@gmail.com
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            2. Hébergement
                        </h2>
                        <p>
                            Ce site est hébergé par&nbsp;: <strong>[NOM_DE_L_HEBERGEUR]</strong><br/>
                            Adresse&nbsp;: [ADRESSE_HEBERGEUR]
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            3. Propriété intellectuelle
                        </h2>
                        <p>
                            L&apos;ensemble des contenus présents sur ce site — cours, travaux pratiques, sujets
                            d&apos;examens, diagrammes et exemples de code — est la propriété exclusive de
                            l&apos;éditeur, sauf mention contraire. Ces contenus sont protégés par le droit
                            d&apos;auteur (Code de la propriété intellectuelle, art. L.335-2 et suivants).
                        </p>
                        <p className="mt-2">
                            Toute reproduction, représentation ou utilisation non autorisée, partielle ou totale,
                            est interdite sans accord préalable et écrit de l&apos;éditeur.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            4. Limitation de responsabilité
                        </h2>
                        <p>
                            Les contenus sont fournis à titre indicatif et pédagogique. L&apos;éditeur ne peut
                            garantir leur exactitude ou exhaustivité absolue et se réserve le droit de les modifier
                            ou supprimer sans préavis. Il ne saurait être tenu responsable des dommages directs ou
                            indirects résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y
                            accéder.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-brand-dark dark:text-brand-light mb-2">
                            5. Droit applicable
                        </h2>
                        <p>
                            Ce site est soumis au droit français. Tout litige relève de la compétence exclusive
                            des juridictions françaises compétentes.
                        </p>
                    </div>
                </section>
            </div>

            <PageFooter/>
        </main>
    );
}
