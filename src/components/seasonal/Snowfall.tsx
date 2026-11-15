import type {CSSProperties} from "react";

const FLAKE_COUNT = 36;

// Générateur pseudo-aléatoire à graine fixe : serveur et client produisent les
// mêmes flocons, donc pas d'écart d'hydratation, et le composant reste serveur.
function seeded(seed: number): () => number {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

type Flake = {
    left: number;
    size: number;
    duration: number;
    delay: number;
    sway: number;
    opacity: number;
};

function buildFlakes(): Flake[] {
    const rand = seeded(2512);
    return Array.from({length: FLAKE_COUNT}, () => ({
        left: rand() * 100,
        size: 2 + rand() * 4,
        duration: 7 + rand() * 8,
        // Délai négatif : la neige est déjà répartie à l'écran au chargement.
        delay: -rand() * 24,
        sway: 12 + rand() * 30,
        opacity: 0.3 + rand() * 0.45,
    }));
}

const FLAKES = buildFlakes();

/**
 * Neige décorative du hero, visible seulement sous le thème de Noël (classe
 * `theme-noel` sur <html>) et sans réduction des animations : tout est réglé
 * en CSS (`.noel-snow` dans globals.css), le composant ne fait que poser les flocons.
 */
export default function Snowfall() {
    return (
        <div aria-hidden="true" className="noel-snow">
            {FLAKES.map((flake, i) => (
                <span
                    key={i}
                    className="noel-flake"
                    style={{
                        left: `${flake.left}%`,
                        width: `${flake.size}px`,
                        opacity: flake.opacity,
                        animationDuration: `${flake.duration}s, ${flake.duration / 3}s`,
                        animationDelay: `${flake.delay}s, ${flake.delay}s`,
                        "--noel-sway": `${flake.sway}px`,
                    } as CSSProperties & Record<`--${string}`, string>}
                />
            ))}
        </div>
    );
}
