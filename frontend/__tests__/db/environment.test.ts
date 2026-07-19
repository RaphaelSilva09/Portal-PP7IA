import { describe, expect, it } from "vitest";

import { isRailwayPrEnvironment } from "@/db/environment";

describe("Railway database environment", () => {
    it.each([
        "Portal-PP7IA-pr-103",
        "portal-pp7ia-PR-7",
        "pr-42",
    ])("recognizes ephemeral PR environment %s", (environmentName) => {
        expect(isRailwayPrEnvironment(environmentName)).toBe(true);
    });

    it.each(["development", "production", "portal-pr-preview"])(
        "keeps migrations enabled for persistent environment %s",
        (environmentName) => {
            expect(isRailwayPrEnvironment(environmentName)).toBe(false);
        },
    );
});
