"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const isDark = (resolvedTheme ?? theme ?? "light") === "dark";

    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative rounded-full border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur-md"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            title={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
            suppressHydrationWarning
        >
            <SunMedium className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonStar className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    );
}
