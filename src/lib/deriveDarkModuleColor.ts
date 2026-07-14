const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const DARK_TINT_TARGET = "#F7EBD9";
const LIGHT_COLOR_WEIGHT = 0.48;

function hexToRgb(hex: string): [number, number, number] {
    return [0, 2, 4].map((offset) => parseInt(hex.slice(1 + offset, 3 + offset), 16)) as [number, number, number];
}

function toHex(value: number): string {
    return value.toString(16).padStart(2, "0").toUpperCase();
}

export function deriveDarkModuleColor(colorLight?: string): string | undefined {
    if (!colorLight || !HEX_RE.test(colorLight)) return undefined;

    const source = hexToRgb(colorLight);
    const target = hexToRgb(DARK_TINT_TARGET);
    const mixed = source.map((channel, index) =>
        Math.round(channel * LIGHT_COLOR_WEIGHT + target[index] * (1 - LIGHT_COLOR_WEIGHT))
    );

    return `#${mixed.map(toHex).join("")}`;
}
