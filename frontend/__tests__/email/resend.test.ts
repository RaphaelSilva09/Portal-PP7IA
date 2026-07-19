import { afterEach, describe, expect, it, vi } from "vitest";

const originalResendApiKey = process.env.RESEND_API_KEY;
const originalInviteEmailApiKey = process.env.INVITE_EMAIL_API_KEY;

afterEach(() => {
    vi.resetModules();
    process.env.RESEND_API_KEY = originalResendApiKey;
    process.env.INVITE_EMAIL_API_KEY = originalInviteEmailApiKey;
});

describe("resend email configuration", () => {
    it("allows module import with blank env keys so dry-run jobs can start", async () => {
        process.env.RESEND_API_KEY = "";
        process.env.INVITE_EMAIL_API_KEY = "";
        vi.resetModules();

        const emailModule = await import("@/lib/email/resend");

        expect(emailModule.resend).toBeTruthy();
        expect(() => emailModule.assertEmailConfigured()).toThrow(/RESEND_API_KEY/);
    });
});
