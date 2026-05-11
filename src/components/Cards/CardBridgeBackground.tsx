"use client";

import Image from "next/image";
import {useIsDark} from "@/hook/useIsDark";
import {cn} from "@/lib/utils";

/**
 * Décor de fond partagé entre ModuleCard et SectionCard :
 * image du pont (variante light/dark) + gradient overlay solide à gauche
 * fondu vers transparent à droite.
 *
 * Le parent doit être :
 *   - `relative`
 *   - `group` (pour le zoom au hover)
 *   - `overflow-hidden` (pour clipper le zoom)
 *   - avec un bg solide qui matche le start du gradient (#f7ebd9 / #13110d)
 *     pour éviter les fuites pendant le hover scale.
 */
export default function CardBridgeBackground() {
    const isDark = useIsDark();
    const src = isDark
        ? "/images/card/pont-dark.png"
        : "/images/card/pont-light.png";

    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                // object-right-bottom : même point d'ancrage que le hero
                // de la home. Évite que des hauteurs de card différentes
                // (descriptions de tailles variables) recadrent le pont
                // différemment d'une card à l'autre.
                className="object-cover object-right-bottom transition-transform duration-700 group-hover:scale-105"
            />
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    // from-30% : les 30% gauche restent 100% opaques, garantis
                    // identiques d'une card à l'autre quelle que soit la
                    // hauteur (donc quel que soit le crop du pont).
                    "from-[#f7ebd9] from-30% via-[#f7ebd9]/60 via-70% to-transparent",
                    "dark:from-[#13110d] dark:via-[#13110d]/70 dark:to-transparent",
                )}
            />
        </div>
    );
}
