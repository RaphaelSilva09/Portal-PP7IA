"use client";

import { BookOpen, MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// "theme-sepia" (nunca "sepia"): a string vira classe no <html> e "sepia"
// colide com a utility de filtro do Tailwind, tingindo a página inteira.
export const THEME_CYCLE = ["light", "theme-sepia", "dark"] as const;
export type ThemeName = (typeof THEME_CYCLE)[number];

export const THEME_LABEL: Record<ThemeName, string> = {
    light: "Claro",
    "theme-sepia": "Sépia",
    dark: "Escuro",
};

export const THEME_ICONS: Record<ThemeName, typeof SunMedium> = {
    light: SunMedium,
    "theme-sepia": BookOpen,
    dark: MoonStar,
};

function normalizeTheme(theme: string | undefined): ThemeName {
    return THEME_CYCLE.includes(theme as ThemeName) ? (theme as ThemeName) : "light";
}

/** Estado e ação compartilhados entre o toggle de header e o item do dropdown mobile. */
export function useThemeCycle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const current = normalizeTheme(mounted ? resolvedTheme ?? theme : "light");
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length];

    const cycleTheme = () => setTheme(next);

    return { current, next, cycleTheme, mounted };
}
