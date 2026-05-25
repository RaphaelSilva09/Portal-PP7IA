import { NextResponse } from "next/server";
import { BLOCK_IDS, DEFAULT_BLOCK_COLORS } from "@/domain/entities/BlockColors";
import type { BlockColors } from "@/domain/entities/BlockColors";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

function hexToRgba(hex: string, alpha: number): string {
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return hex;
    return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

function lightenHex(hex: string, factor = 0.35): string {
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return hex;
    const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * factor));
    return `#${[m[1], m[2], m[3]].map(h => lighten(parseInt(h, 16)).toString(16).padStart(2, "0")).join("")}`;
}

function buildCss(colors: BlockColors): string {
    const rootVars = BLOCK_IDS.map(id =>
        `  --block-${id}: ${colors[id]};\n  --block-${id}-soft: ${hexToRgba(colors[id], 0.18)};`
    ).join("\n");
    const darkVars = BLOCK_IDS.map(id => {
        const dark = lightenHex(colors[id]);
        return `  --block-${id}: ${dark};\n  --block-${id}-soft: ${hexToRgba(dark, 0.18)};`;
    }).join("\n");
    return `:root {\n${rootVars}\n}\n.dark {\n${darkVars}\n}`;
}

export async function GET() {
    const colors = await DIContainer.getBlockColorsUseCase().execute().catch(() => ({ ...DEFAULT_BLOCK_COLORS }));
    const css = buildCss(colors);
    return new NextResponse(css, {
        headers: {
            "Content-Type": "text/css; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
