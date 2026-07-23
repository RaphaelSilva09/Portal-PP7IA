import { describe, expect, it } from "vitest";

import { getTeamMemberContactLinks, TEAM_MEMBERS } from "@/constants/team";

describe("TEAM_MEMBERS", () => {
    it("includes the confirmed collaborators with names and functions only", () => {
        expect(TEAM_MEMBERS).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    name: "Gustavo Colombini",
                    role: "Artes das capas",
                    kind: "arts",
                }),
                expect.objectContaining({
                    name: "Sabrina Ai Kato",
                    role: "Artes das capas",
                    kind: "arts",
                }),
                expect.objectContaining({
                    name: "Cristiano Benite",
                    role: "Consultoria",
                    kind: "review",
                }),
            ]),
        );
    });

    it("gives every member a brief description", () => {
        for (const member of TEAM_MEMBERS) {
            expect(member.description, `descrição de ${member.name}`).toBeTruthy();
        }
    });

    it("only exposes contact fields the member actually provided", () => {
        const paulo = TEAM_MEMBERS.find(member => member.name === "Paulo Periquito");
        expect(paulo?.contact).toBeUndefined();

        const sabrina = TEAM_MEMBERS.find(member => member.name === "Sabrina Ai Kato");
        expect(sabrina?.contact).toEqual({ instagram: "tofu.42" });
    });

    it("keeps linkedin contacts pointing at a real profile URL", () => {
        for (const member of TEAM_MEMBERS) {
            if (member.contact?.linkedin) {
                expect(member.contact.linkedin, member.name).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
            }
        }
    });
});

describe("getTeamMemberContactLinks", () => {
    it("returns an empty list when there is no contact info", () => {
        expect(getTeamMemberContactLinks(undefined)).toEqual([]);
        expect(getTeamMemberContactLinks({})).toEqual([]);
    });

    it("builds one link per provided channel, in a stable order", () => {
        const links = getTeamMemberContactLinks({
            email: "ana@example.com",
            instagram: "@ana.dev",
            whatsapp: "+55 (11) 99999-0000",
            linkedin: "https://www.linkedin.com/in/ana/",
            github: "@ana-dev",
        });

        expect(links).toEqual([
            { kind: "email", href: "mailto:ana@example.com", label: "E-mail: ana@example.com" },
            { kind: "instagram", href: "https://instagram.com/ana.dev", label: "Instagram: @ana.dev" },
            { kind: "whatsapp", href: "https://wa.me/5511999990000", label: "WhatsApp" },
            { kind: "linkedin", href: "https://www.linkedin.com/in/ana/", label: "LinkedIn" },
            { kind: "github", href: "https://github.com/ana-dev", label: "GitHub: @ana-dev" },
        ]);
    });

    it("only includes channels that were actually provided", () => {
        expect(getTeamMemberContactLinks({ linkedin: "https://www.linkedin.com/in/ana/" })).toEqual([
            { kind: "linkedin", href: "https://www.linkedin.com/in/ana/", label: "LinkedIn" },
        ]);
    });
});
