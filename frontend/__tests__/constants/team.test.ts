import { describe, expect, it } from "vitest";

import { TEAM_MEMBERS } from "@/constants/team";

describe("TEAM_MEMBERS", () => {
    it("includes the confirmed collaborators with names and functions only", () => {
        expect(TEAM_MEMBERS).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Gustavo Colombini",
                    role: "Artes da página",
                    kind: "arts",
                }),
                expect.objectContaining({
                    name: "Sabrina Ai Kato",
                    role: "Artes da página",
                    kind: "arts",
                }),
                expect.objectContaining({
                    name: "Cristiano Benite",
                    role: "Apoio técnico e revisão",
                    kind: "review",
                }),
            ]),
        );
    });

    it("does not expose personal contact fields", () => {
        for (const member of TEAM_MEMBERS) {
            expect("email" in member).toBe(false);
            expect("phone" in member).toBe(false);
            expect("instagram" in member).toBe(false);
        }
    });
});
