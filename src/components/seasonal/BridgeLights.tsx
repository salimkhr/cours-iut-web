import {useId} from "react";

/**
 * Pont illuminé, pour le thème de Noël en mode sombre uniquement.
 *
 * Même calage que la neige (SnowBank.tsx) : le SVG reprend le repère exact de
 * l'illustration (1782 × 883) posée en `bg-cover bg-right-bottom`. Repères
 * mesurés sur pont-dark.png : bord haut du tablier en perspective, de
 * (1080, 750) à (1290, 699) puis pente de −0,427 jusqu'à (1770, 494) ; sommets
 * des pylônes en (1138, 603) et (1575, 113). Lumière fixe : pas de
 * scintillement.
 */

/** Bord haut du tablier, en coordonnées de l'image. */
function deckTop(x: number): number {
    return x <= 1290 ? 699 + (1290 - x) * 0.243 : 699 - (x - 1290) * 0.427;
}

/** Ampoules le long du tablier : plus petites et plus serrées au loin (à gauche). */
const BULBS = Array.from({length: 22}, (_, i) => {
    const t = i / 21;
    const x = 1085 + (1772 - 1085) * Math.pow(t, 0.9);
    return {x, y: deckTop(x) - 4, r: 2.2 + t * 2.6};
});

const BEACONS = [
    {x: 1138, y: 600, r: 3.6},
    {x: 1575, y: 109, r: 5},
];

export default function BridgeLights() {
    const glowId = `noel-glow-${useId().replace(/:/g, "")}`;

    return (
        <div aria-hidden="true" className="noel-bridge-lights">
            <svg viewBox="0 0 1782 883" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="5"/>
                    </filter>
                </defs>

                {/* Halo, flouté sous les ampoules */}
                <g filter={`url(#${glowId})`} className="noel-bridge-glow">
                    {BULBS.map(({x, y, r}) => <circle key={`g${x}`} cx={x} cy={y} r={r * 2.4}/>)}
                    {BEACONS.map(({x, y, r}) => <circle key={`gb${x}`} cx={x} cy={y} r={r * 3} className="noel-bridge-beacon"/>)}
                </g>

                {/* Fil de la guirlande, qui pend légèrement entre les ampoules */}
                <path
                    className="noel-bridge-wire"
                    d={BULBS.reduce((d, {x, y}, i) => {
                        if (i === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
                        const prev = BULBS[i - 1];
                        const mx = (prev.x + x) / 2;
                        const my = (prev.y + y) / 2 + 3 + i * 0.12;
                        return `${d} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }, "")}
                    fill="none"
                />

                {BULBS.map(({x, y, r}) => <circle key={x} cx={x} cy={y} r={r} className="noel-bridge-bulb"/>)}
                {BEACONS.map(({x, y, r}) => <circle key={`b${x}`} cx={x} cy={y} r={r} className="noel-bridge-beacon"/>)}
            </svg>
        </div>
    );
}
