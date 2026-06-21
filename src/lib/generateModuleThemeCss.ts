import type Module from "@/types/Module";

const PATH_RE = /^[a-z0-9-]+$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

type ThemeModule = Pick<Module, "path" | "colorLight" | "colorDark">;

/**
 * Génère un CSS qui override `--color-{path}` (light) et `.dark --color-{path}` (dark)
 * depuis les couleurs en base. Sanitize strictement `path` et chaque couleur pour
 * empêcher toute injection CSS. Un champ non conforme est ignoré.
 */
export function generateModuleThemeCss(modules: ThemeModule[]): string {
    const light: string[] = [];
    const dark: string[] = [];

    for (const m of modules) {
        if (!m.path || !PATH_RE.test(m.path)) continue;
        if (m.colorLight && HEX_RE.test(m.colorLight)) {
            light.push(`--color-${m.path}:${m.colorLight}`);
        }
        if (m.colorDark && HEX_RE.test(m.colorDark)) {
            dark.push(`--color-${m.path}:${m.colorDark}`);
        }
    }

    let css = "";
    if (light.length) css += `:root{${light.join(";")}}`;
    if (dark.length) css += `.dark{${dark.join(";")}}`;
    return css;
}
