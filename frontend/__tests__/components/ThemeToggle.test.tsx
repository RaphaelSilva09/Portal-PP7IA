import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

vi.mock("next-themes", () => ({
    useTheme: vi.fn(),
}));

function mockTheme(theme: string) {
    vi.mocked(useTheme).mockReturnValue({
        theme,
        resolvedTheme: theme,
        themes: ["light", "theme-sepia", "dark"],
        setTheme,
    } as ReturnType<typeof useTheme>);
}

const setTheme = vi.fn();

describe("ThemeToggle", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("cycles from light to sepia", () => {
        mockTheme("light");

        render(<ThemeToggle />);

        fireEvent.click(screen.getByRole("button", { name: /ativar modo sépia/i }));

        expect(setTheme).toHaveBeenCalledWith("theme-sepia");
    });

    it("cycles from sepia to dark", () => {
        mockTheme("theme-sepia");

        render(<ThemeToggle />);

        fireEvent.click(screen.getByRole("button", { name: /ativar modo escuro/i }));

        expect(setTheme).toHaveBeenCalledWith("dark");
    });

    it("cycles from dark back to light", () => {
        mockTheme("dark");

        render(<ThemeToggle />);

        fireEvent.click(screen.getByRole("button", { name: /ativar modo claro/i }));

        expect(setTheme).toHaveBeenCalledWith("light");
    });

    it("announces the current theme in the accessible name", () => {
        mockTheme("theme-sepia");

        render(<ThemeToggle />);

        expect(screen.getByRole("button", { name: /tema atual: sépia/i })).toBeTruthy();
    });

    it("treats unknown themes as light", () => {
        mockTheme("system");

        render(<ThemeToggle />);

        fireEvent.click(screen.getByRole("button", { name: /ativar modo sépia/i }));

        expect(setTheme).toHaveBeenCalledWith("theme-sepia");
    });
});
