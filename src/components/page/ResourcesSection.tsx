import type {CSSProperties} from "react";
import Image from "next/image";
import ResourcesList from "@/components/page/ResourcesList";
import type {Resource} from "@/types/Resource";

/**
 * Veille partagée par l'enseignant : liens vers articles, vidéos, recherches, outils.
 * Liste compacte à gauche sur l'illustration de l'escalier, positionnée comme dans l'ancienne
 * `AboutSection` : `cover` ancré à droite, fondu vers le fond de page (voile quasi opaque sur mobile).
 */
export default function ResourcesSection({resources}: {resources: Resource[]}) {
    if (resources.length === 0) return null;

    return (
        <section
            id="veille"
            aria-labelledby="veille-title"
            // Largeur de la colonne de texte : 100 % sur mobile, ~62 % de l'écran ensuite, bornée à 72 rem. L'image et son voile ne dépendent pas de cette largeur.
            style={{"--veille-w": "min(100%, max(62%, 34rem), 72rem)"} as CSSProperties}
            className="relative min-h-[clamp(260px,30vw,440px)] w-full overflow-hidden border-t border-bridge-500/25"
        >
            <div aria-hidden="true" className="absolute inset-0 z-0 select-none pointer-events-none">
                <Image
                    src="/images/header/escalier-light.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-right dark:hidden"
                />
                <Image
                    src="/images/header/escalier-dark.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="hidden object-cover object-right dark:block"
                />
                {/* Même voile que l'ancienne AboutSection : plein jusqu'à 55 %, à moitié à 75 %, transparent à 90 %. */}
                <div className="absolute inset-0 bg-gradient-to-r from-background from-55% via-background/55 via-75% to-transparent to-90%"/>
                <div className="absolute inset-0 bg-background/90 sm:hidden"/>
            </div>

            <div className="relative z-10 w-(--veille-w) px-6 py-10 lg:py-14 lg:pl-12 lg:pr-6">
                <div className="flex flex-col items-start mb-6 lg:mb-8">
                    <h2
                        id="veille-title"
                        className="text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-dark dark:text-brand-light"
                    >
                        À lire, à voir
                    </h2>
                    <span aria-hidden="true" className="block w-16 h-1 bg-brand-primary rounded-full mt-3"/>
                </div>

                <ResourcesList resources={resources}/>
            </div>
        </section>
    );
}
