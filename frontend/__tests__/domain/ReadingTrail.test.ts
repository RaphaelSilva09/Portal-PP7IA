import { describe, expect, it } from "vitest";
import { completedStepCount, findTrailStepNavigation, nextUnreadStepIndex } from "@/domain/entities/ReadingTrail";
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

describe("findTrailStepNavigation", () => {
    const trail = { slug: "entenda-ia", title: "Entenda IA em 3 leituras", steps: [step(0, true), step(1, true), step(2, false)] };

    it("returns null when the content is not part of the trail", () => {
        expect(findTrailStepNavigation(trail, "newsletter", "999")).toBeNull();
    });

    it("has no previous on the first step, and a next with the trail context preserved", () => {
        const nav = findTrailStepNavigation(trail, "newsletter", "0");
        expect(nav?.position).toBe(1);
        expect(nav?.total).toBe(3);
        expect(nav?.previous).toBeNull();
        expect(nav?.next).toEqual({ href: "/view/newsletter/1?trilha=entenda-ia", title: "Passo 1" });
    });

    it("has both previous and next on a middle step", () => {
        const nav = findTrailStepNavigation(trail, "newsletter", "1");
        expect(nav?.position).toBe(2);
        expect(nav?.previous).toEqual({ href: "/view/newsletter/0?trilha=entenda-ia", title: "Passo 0" });
        expect(nav?.next).toEqual({ href: "/view/newsletter/2?trilha=entenda-ia", title: "Passo 2" });
    });

    it("has no next on the last step", () => {
        const nav = findTrailStepNavigation(trail, "newsletter", "2");
        expect(nav?.position).toBe(3);
        expect(nav?.next).toBeNull();
    });

    it("matches by content_type + content_id, not by array index", () => {
        const mixed = { slug: "s", title: "T", steps: [
            { contentType: "newsletter", contentId: "10", position: 0, title: "A", href: "/view/newsletter/10", completed: false },
            { contentType: "mini-livro", contentId: "10", position: 1, title: "B", href: "/view/mini-livro/10", completed: false },
        ] };
        expect(findTrailStepNavigation(mixed, "mini-livro", "10")?.position).toBe(2);
    });
});
