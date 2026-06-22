import { MODULE_COLOR_PALETTE, type ModuleColorPair } from "@/lib/moduleColorPalette";

/**
 * Choisit une paire de couleurs pour un nouveau module.
 * Privilégie une paire dont le `colorLight` n'est pas déjà utilisé ;
 * si toutes sont prises, tire au hasard dans la palette complète.
 * `rng` est injectable pour les tests (défaut: Math.random).
 */
export function assignModuleColor(
    used: { colorLight?: string }[],
    rng: () => number = Math.random,
): ModuleColorPair {
    const usedLights = new Set(
        used.map((m) => m.colorLight).filter((c): c is string => !!c),
    );
    const free = MODULE_COLOR_PALETTE.filter((p) => !usedLights.has(p.colorLight));
    const pool = free.length > 0 ? free : MODULE_COLOR_PALETTE;
    // rng ∈ [0, 1) → index toujours dans [0, pool.length - 1]
    const index = Math.floor(rng() * pool.length);
    return pool[index];
}
