import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

vi.mock("next-themes", () => ({
    useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
    const setTheme = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("switches from light to dark", () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: "light",
            resolvedTheme: "light",
            themes: ["light", "dark"],
            setTheme,
        } as ReturnType<typeof useTheme>);

        render(<ThemeToggle />);

        fireEvent.click(screen.getByRole("button", { name: /ativar modo escuro/i }));

        expect(setTheme).toHaveBeenCalledWith("dark");
    });

    it("switches from dark to light", () => {
        vi.mocked(useTheme).mockReturnValue({
            theme: "dark",
            resolvedTheme: "dark",
            themes: ["light", "dark"],
            setTheme,
        } as ReturnType<typeof useTheme>);

        render(<ThemeToggle />);

        fireEvent.click(screen.getByRole("button", { name: /ativar modo claro/i }));

        expect(setTheme).toHaveBeenCalledWith("light");
    });
});
