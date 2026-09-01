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
 *   - avec un bg solide qui matche le start du gradient (bridge-50 / bridge-800)
 *     pour éviter les fuites pendant le hover scale.
 */
export default function CardBridgeBackground() {
    const isDark = useIsDark();
    const src = isDark
        ? "/images/card/pont-dark.png"
        : "/images/card/pont-light.png";

    return (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            {/* Boîte plus petite qu'avant que le fond soit devenu transparent :
                en pleine card (inset-0 + object-cover), l'image n'avait plus
                son fond opaque pour s'estomper dans les coins vides, et le
                pont se lisait bien plus grand qu'un simple décor de fond. */}
            <div className="absolute bottom-0 right-0 h-full w-[62%]">
                <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 62vw, (max-width: 1024px) 31vw, 20vw"
                    // object-right-bottom : même point d'ancrage que le hero
                    // de la home.
                    className="object-contain object-right-bottom transition-transform duration-700 group-hover:scale-105 dark:saturate-[0.86] dark:contrast-110"
                />
            </div>
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    // from-* : la zone gauche reste 100% opaque, garantie
                    // identiques d'une card à l'autre quelle que soit la
                    // hauteur (donc quel que soit le crop du pont).
                    isDark
                        ? "from-bridge-800 from-44% via-bridge-800/88 via-78% to-bridge-800/45"
                        : "from-bridge-50 from-30% via-bridge-50/60 via-70% to-transparent",
                )}
            />
        </div>
    );
}
