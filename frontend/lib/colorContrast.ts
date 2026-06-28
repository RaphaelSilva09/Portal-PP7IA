function toLinear(c: number): number {
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
    const h = hex.replace("#", "");
    const r = toLinear(parseInt(h.slice(0, 2), 16) / 255);
    const g = toLinear(parseInt(h.slice(2, 4), 16) / 255);
    const b = toLinear(parseInt(h.slice(4, 6), 16) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastColor(hex: string): "#000000" | "#ffffff" {
    return luminance(hex) > 0.179 ? "#000000" : "#ffffff";
}
