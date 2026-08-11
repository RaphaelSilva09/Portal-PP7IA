import { describe, expect, it } from "vitest";
import { completedStepCount, nextUnreadStepIndex } from "@/domain/entities/ReadingTrail";
import type { ReadingTrailStep } from "@/domain/entities/ReadingTrail";

function step(position: number, completed: boolean): ReadingTrailStep {
    return { contentType: "newsletter", contentId: String(position), position, title: `Passo ${position}`, href: `/view/newsletter/${position}`, completed };
}

describe("nextUnreadStepIndex", () => {
    it("returns the index of the first uncompleted step", () => {
        const steps = [step(0, true), step(1, false), step(2, false)];
        expect(nextUnreadStepIndex(steps)).toBe(1);
    });

    it("returns null when every step is completed", () => {
        const steps = [step(0, true), step(1, true)];
        expect(nextUnreadStepIndex(steps)).toBeNull();
    });

    it("returns null for an empty trail", () => {
        expect(nextUnreadStepIndex([])).toBeNull();
    });

    it("returns 0 when nothing has been read yet", () => {
        const steps = [step(0, false), step(1, false)];
        expect(nextUnreadStepIndex(steps)).toBe(0);
    });
});

describe("completedStepCount", () => {
    it("counts only completed steps", () => {
        const steps = [step(0, true), step(1, false), step(2, true)];
        expect(completedStepCount(steps)).toBe(2);
    });

    it("returns 0 for an empty trail", () => {
        expect(completedStepCount([])).toBe(0);
    });
});
