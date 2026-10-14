import Image from "next/image";
import ResourcesList from "@/components/page/ResourcesList";
import type {Resource} from "@/types/Resource";

/** Illustration de l'escalier dans la bande. `false` : section sans bande colorée ni image, sur le fond de page. */
const SHOW_STAIRCASE = true;

/**
 * Veille partagée par l'enseignant : liens vers articles, vidéos, recherches, outils.
 *
 * Composition (lg et plus) : une bande pleine largeur, sans marge ni arrondi, dont le fond est exactement la
 * couleur du ciel de l'illustration. L'escalier occupe le tiers droit sur toute la hauteur ; un masque le fait
 * sortir de la bande à gauche, sans couture puisque les teintes sont identiques. Le contenu (titre, filtres,
 * carte, sommaire) occupe les deux tiers gauche.
 * Sous `lg` : pas de bande colorée ni d'image, le contenu est en pleine largeur (accordéon).
 */
export default function ResourcesSection({resources}: {resources: Resource[]}) {
    if (resources.length === 0) return null;

    return (
        <section
            id="veille"
            aria-labelledby="veille-title"
            className={
                SHOW_STAIRCASE
                    ? [
                          "relative isolate w-full overflow-hidden",
                          // Teinte du ciel de chaque illustration (échantillonnée sur le fichier source).
                          "[--veille-sky:#eed6bb] dark:[--veille-sky:#161511]",
                          // Filet en haut seulement : en bas, la bande est posée sur le footer, un filet y ferait une ligne claire.
                          "lg:border-t lg:border-bridge-500/35 lg:bg-(--veille-sky) dark:lg:border-bridge-500/30",
                      ].join(" ")
                    : "relative w-full"
            }
        >
            {SHOW_STAIRCASE && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[44%] select-none lg:block"
                    style={{
                        // Le bord gauche de l'image se fond dans la bande (même teinte : aucune couture).
                        maskImage: "linear-gradient(to right, transparent 0%, black 42%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 42%)",
                    }}
                >
                    <Image
                        src="/images/header/escalier-light.png"
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 44vw, 0px"
                        className="object-cover object-right dark:hidden"
                    />
                    <Image
                        src="/images/header/escalier-dark.png"
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 44vw, 0px"
                        className="hidden object-cover object-right dark:block"
                    />
                </div>
            )}

            <div
                className={
                    SHOW_STAIRCASE
                        ? "relative z-10 px-6 pb-12 lg:w-[64%] lg:py-14 lg:pl-12 lg:pr-10"
                        : "relative z-10 px-6 pb-12 lg:py-14 lg:pl-12 lg:pr-6"
                }
            >
                {/* Le titre est rendu ici (serveur) et passé à la liste, qui le place sur la même ligne
                    que les filtres (état client). */}
                <ResourcesList
                    resources={resources}
                    heading={
                        <div className="flex flex-col items-start">
                            <h2
                                id="veille-title"
                                className="text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-brand-light"
                            >
                                À lire, à voir
                            </h2>
                            <span aria-hidden="true" className="block w-16 h-1 bg-brand-primary rounded-full mt-3"/>
                        </div>
                    }
                />
            </div>
        </section>
    );
}
