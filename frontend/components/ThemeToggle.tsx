"use client";

import { Button } from "./ui/button";
import { THEME_ICONS, THEME_LABEL, useThemeCycle } from "../hooks/useThemeCycle";

export default function ThemeToggle() {
    const { current, next, cycleTheme } = useThemeCycle();
    const Icon = THEME_ICONS[current];
    const label = `Tema atual: ${THEME_LABEL[current].toLowerCase()}. Ativar modo ${THEME_LABEL[next].toLowerCase()}`;

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative min-h-11 min-w-11 rounded-full border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur-md"
            onClick={cycleTheme}
            aria-label={label}
            title={label}
            suppressHydrationWarning
        >
            <Icon className="h-4 w-4" />
        </Button>
    );
}
