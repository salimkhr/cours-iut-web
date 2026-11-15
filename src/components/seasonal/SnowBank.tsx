import {useId} from "react";

/**
 * Neige au pied du pont, pour le thème de Noël.
 *
 * L'illustration du pont (1782 × 883) est posée en `bg-cover bg-right-bottom`.
 * Le SVG reprend son repère exact : il est calé en bas à droite et dimensionné
 * comme l'image (`.noel-snowbank` dans globals.css), donc la neige tombe sur la
 * bande de sol et contre chaque pied de pylône, quelle que soit la taille de
 * l'écran. À poser AVANT le voile dégradé du conteneur : la neige s'estompe
 * alors exactement comme le pont. Masquée hors saison, en CSS.
 *
 * Repères mesurés sur l'image : sol de (877, 883) à (984, 853) puis plat à
 * y = 853 ; pieds du petit pylône x 1102–1137 et 1206–1223, du grand pylône
 * x 1410–1468 et 1698–1761.
 */
const CREST =
    "M877 883 Q925 864 984 849 Q1040 841 1086 846 Q1120 824 1158 845 " +
    "Q1180 849 1195 846 Q1214 830 1238 846 Q1310 840 1386 845 Q1440 814 1497 844 " +
    "Q1590 849 1676 843 Q1730 812 1782 824";
const SNOW = `${CREST} L1782 883 Z`;

export default function SnowBank() {
    // Identifiant unique : plusieurs décors peuvent coexister (deck de slides).
    const gradientId = `noel-snow-${useId().replace(/:/g, "")}`;

    return (
        <div aria-hidden="true" className="noel-snowbank">
            <svg viewBox="0 0 1782 883" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Modelé : blanc en crête, gris-bleu à la base */}
                    <linearGradient id={gradientId} x1="0" y1="812" x2="0" y2="883" gradientUnits="userSpaceOnUse">
                        <stop offset="0" className="noel-snowbank-top"/>
                        <stop offset="1" className="noel-snowbank-base"/>
                    </linearGradient>
                </defs>
                <path d={SNOW} fill={`url(#${gradientId})`}/>
                {/* Liseré sur la crête seule, pas sur les bords du calque */}
                <path className="noel-snowbank-crest" d={CREST} fill="none"/>
                {/* Reflets sur le haut des congères */}
                <path
                    className="noel-snowbank-shine"
                    d="M1100 845 Q1120 836 1140 843 M1408 841 Q1440 826 1474 839 M1694 840 Q1730 824 1768 832"
                    fill="none"
                />
            </svg>
        </div>
    );
}
