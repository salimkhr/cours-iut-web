import type Module from "@/types/Module";
import {deriveDarkModuleColor} from "@/lib/deriveDarkModuleColor";

/**
 * Retourne la valeur CSS de la couleur du module (light ou dark).
 * - En light, colorLight est utilisé tel quel.
 * - En dark, la couleur est dérivée de colorLight pour garder une palette cohérente.
 * - Sinon, var(--color-{path}) reste le fallback défini dans globals.css.
 */
export function moduleColor(mod: Pick<Module, "path" | "colorLight" | "colorDark">, mode: "light" | "dark" = "light"): string {
    if (mode === "dark") return deriveDarkModuleColor(mod.colorLight) ?? `var(--color-${mod.path})`;
    return mod.colorLight ?? `var(--color-${mod.path})`;
}
