import type Module from "@/types/Module";

/**
 * Retourne la valeur CSS de la couleur du module (light ou dark).
 * - Si colorLight/colorDark est défini en base → utilisé tel quel.
 * - Sinon → var(--color-{path}) qui est défini dans globals.css pour les
 *   modules préexistants (html-css, javascript, php, brainfuck) et géré
 *   automatiquement en dark par la règle .dark { --color-... }.
 */
export function moduleColor(mod: Pick<Module, "path" | "colorLight" | "colorDark">, mode: "light" | "dark" = "light"): string {
    if (mode === "dark") return mod.colorDark ?? mod.colorLight ?? `var(--color-${mod.path})`;
    return mod.colorLight ?? `var(--color-${mod.path})`;
}
