import { NextResponse } from "next/server";
import { BLOCK_IDS, DEFAULT_BLOCK_COLORS } from "@/domain/entities/BlockColors";
import type { BlockColors } from "@/domain/entities/BlockColors";
import { DEFAULT_SITE_BG } from "@/domain/entities/SiteBg";
import type { SiteBg } from "@/domain/entities/SiteBg";
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

function darkenHex(hex: string, factor = 0.05): string {
    const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return hex;
    const darken = (c: number) => Math.max(0, Math.round(c * (1 - factor)));
    return `#${[m[1], m[2], m[3]].map(h => darken(parseInt(h, 16)).toString(16).padStart(2, "0")).join("")}`;
}

function buildCss(colors: BlockColors, bg: SiteBg): string {
    const blockRoot = BLOCK_IDS.map(id =>
        `  --block-${id}: ${colors[id]};\n  --block-${id}-soft: ${hexToRgba(colors[id], 0.18)};`
    ).join("\n");
    const blockDark = BLOCK_IDS.map(id => {
        const dark = lightenHex(colors[id]);
        return `  --block-${id}: ${dark};\n  --block-${id}-soft: ${hexToRgba(dark, 0.18)};`;
    }).join("\n");

    const bgSecondaryLight = darkenHex(bg.light, 0.05);
    const bgSecondaryDark  = lightenHex(bg.dark, 0.06);

    const heroVars = [
        `  --hero-book-card-bg: ${bg.bookCardBg};`,
        `  --hero-book-card-title: ${bg.bookCardTitleColor};`,
        `  --hero-book-card-label: ${bg.bookCardLabelColor};`,
        `  --hero-book-card-subtitle: ${bg.bookCardSubtitleColor};`,
        `  --hero-book-card-cta: ${bg.bookCardCtaColor};`,
        `  --hero-book-card-progress-bg: ${bg.bookCardProgressBgColor};`,
        `  --hero-book-card-progress-fill: ${bg.bookCardProgressFillColor};`,
        `  --hero-newsletter-card-bg: ${bg.newsletterCardBg};`,
        `  --hero-newsletter-sidebar-number: ${bg.newsletterSidebarNumberColor};`,
        `  --hero-newsletter-sidebar-label: ${bg.newsletterSidebarLabelColor};`,
    ].join("\n");

    return `:root {\n${blockRoot}\n  --bg-primary: ${bg.light};\n  --bg-secondary: ${bgSecondaryLight};\n${heroVars}\n}\n.dark {\n${blockDark}\n  --bg-primary: ${bg.dark};\n  --bg-secondary: ${bgSecondaryDark};\n${heroVars}\n}`;
}

export async function GET() {
    const [colors, bg] = await Promise.all([
        DIContainer.getBlockColorsUseCase().execute().catch(() => ({ ...DEFAULT_BLOCK_COLORS })),
        DIContainer.getSiteBgUseCase().execute().catch(() => ({ ...DEFAULT_SITE_BG })),
    ]);
    const css = buildCss(colors, bg);
    return new NextResponse(css, {
        headers: {
            "Content-Type": "text/css; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
