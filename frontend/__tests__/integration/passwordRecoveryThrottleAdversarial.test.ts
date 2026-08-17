// @vitest-environment node
/**
 * FASE C — ADVERSARIAL RE-TEST. Independent, new probes against the wired
 * `passwordRecoveryThrottlePlugin` (lib/passwordRecoveryThrottle.ts) + real
 * better-auth 1.6.9, targeting the coordinator's own 5 questions plus
 * additional angles found while reading the plugin/router source. This file
 * does NOT modify passwordRecoverySecurity.test.ts's frozen assertions — it
 * is a separate, additive probe set, exactly like Contract-level "FINDING"
 * tests in the frozen file.
 */
import { describe, it, expect, vi } from "vitest";
import { getTestInstance } from "better-auth/test";
import { emailOTPClient } from "better-auth/client/plugins";
import { emailOTP } from "better-auth/plugins";
import { createInMemoryRecoveryAttemptStore, passwordRecoveryThrottlePlugin } from "@/lib/passwordRecoveryThrottle";

type SentEmail = { email: string; otp: string; type: string };

async function buildInstance(storeOTPValue: "plain" | "encrypted" = "encrypted") {
    const sentEmails: SentEmail[] = [];
    const instance = await getTestInstance({
        emailAndPassword: { enabled: true, minPasswordLength: 6 },
        rateLimit: {
            enabled: true,
            window: 60,
            max: 60,
            customRules: {
                "/get-session": { window: 60, max: 240 },
                "/sign-in/email": { window: 60, max: 10 },
                "/sign-up/email": { window: 60, max: 10 },
                "/forget-password": { window: 60, max: 5 },
                "/reset-password": { window: 60, max: 10 },
                "/email-otp/send-verification-otp": { window: 60, max: 5 },
            },
        },
        plugins: [
            emailOTP({
                otpLength: 8,
                expiresIn: 60 * 10,
                allowedAttempts: 10,
                resendStrategy: "reuse",
                rateLimit: { window: 60, max: 10 },
                storeOTP: storeOTPValue,
                sendVerificationOnSignUp: false,
                async sendVerificationOTP({ email, otp, type }) {
                    sentEmails.push({ email, otp, type });
                },
            }),
            passwordRecoveryThrottlePlugin(createInMemoryRecoveryAttemptStore()),
        ],
    }, {
        clientOptions: { plugins: [emailOTPClient()] },
    });
    return { ...instance, sentEmails };
}

let ipCounter = 0;
function freshIp() {
    ipCounter += 1;
    return `10.88.${Math.floor(ipCounter / 250)}.${ipCounter % 250 || 1}`;
}
function withIp(ip: string) {
    return { headers: { "x-forwarded-for": ip } };
}
function latestOtpFor(sentEmails: SentEmail[], email: string, type = "forget-password") {
    const matches = sentEmails.filter((e) => e.email === email && e.type === type);
    return matches[matches.length - 1]?.otp;
}

describe("Fase C adversarial: re-verify the core claims through the wired plugin", () => {
    it("[re-verify] Scenario B is genuinely fixed end-to-end: resend-after-silent-exhaustion no longer grants a usable fresh budget", async () => {
        // Rotate IP for the differentiating final call — otherwise this collides
        // with the PRE-EXISTING, unrelated generic per-IP rate limiter on
        // check-verification-otp (max=10/60s, same confound as Contract 9's
        // "FINDING"), which would intercept the 11th same-IP call with a plain
        // 429 (no `code`) BEFORE the new email-keyed throttle plugin's own
        // before-hook ever runs — masking whether the new mechanism itself
        // works. Rotating IP isolates the two mechanisms: it defeats the old
        // IP-keyed limiter (trivially, as any real attacker could) while
        // leaving the new email-keyed mechanism fully exposed to the attack.
        const { client, testUser, sentEmails } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otpA = latestOtpFor(sentEmails, testUser.email);

        for (let i = 0; i < 10; i++) {
            await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: "00000000", type: "forget-password" },
                withIp(ip),
            );
        }
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otpB = latestOtpFor(sentEmails, testUser.email);
        expect(otpB).not.toBe(otpA); // resend still functionally works

        const rotatedIp = freshIp();
        const guess = await client.emailOtp.checkVerificationOtp(
            { email: testUser.email, otp: "00000000", type: "forget-password" },
            withIp(rotatedIp),
        );
        expect(guess.error).not.toBeNull();
        expect(guess.error?.code).toBe("RECOVERY_THROTTLED");
        expect(guess.error?.status).toBe(429);
    });

    it("FINDING: with the REAL production rate-limit numbers and the SAME IP throughout (no rotation), the 11th call collides with the pre-existing generic per-IP rate limiter (plain 429, no `code`) instead of the new RECOVERY_THROTTLED mechanism — the request is still blocked (no regression), but via a different, uninstrumented mechanism", async () => {
        const { client, testUser, sentEmails } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        for (let i = 0; i < 10; i++) {
            await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: "00000000", type: "forget-password" },
                withIp(ip),
            );
        }
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otpB = latestOtpFor(sentEmails, testUser.email);
        expect(otpB).toBeTruthy();

        const guessSameIp = await client.emailOtp.checkVerificationOtp(
            { email: testUser.email, otp: "00000000", type: "forget-password" },
            withIp(ip), // same IP as all 10 prior guesses — no rotation
        );
        console.log("[cross-mechanism finding] same-IP 11th call:", JSON.stringify(guessSameIp.error));
        // Still blocked either way (no security regression) — but NOT by our
        // new mechanism for this exact attack shape.
        expect(guessSameIp.error).not.toBeNull();
        expect(guessSameIp.error?.status).toBe(429);
        expect(guessSameIp.error?.code).not.toBe("RECOVERY_THROTTLED");
    });

    it("[re-verify] more concurrent wrong guesses than allowedAttempts are correctly capped (Contract 5 property) through the wired plugin", async () => {
        const { client, testUser } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

        const N = 15;
        const results = await Promise.all(
            Array.from({ length: N }, () =>
                client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                ),
            ),
        );
        const plainInvalidOtpCount = results.filter((r) => r.error?.code === "INVALID_OTP").length;
        const throttledCount = results.filter((r) => r.error?.code === "RECOVERY_THROTTLED").length;
        console.log(`[re-verify Contract 5] ${plainInvalidOtpCount} INVALID_OTP, ${throttledCount} RECOVERY_THROTTLED of ${N}`);
        expect(plainInvalidOtpCount).toBeLessThanOrEqual(10);
        expect(throttledCount).toBeGreaterThan(0);
    });

    it("[re-verify] concurrent correct-OTP redemption: at most one succeeds (Contract 12) through the wired plugin", async () => {
        const { client, testUser, sentEmails } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otp = latestOtpFor(sentEmails, testUser.email);

        const [a, b] = await Promise.all([
            client.emailOtp.resetPassword({ email: testUser.email, otp, password: "concurrentPassw0rdA" }, withIp(ip)),
            client.emailOtp.resetPassword({ email: testUser.email, otp, password: "concurrentPassw0rdB" }, withIp(ip)),
        ]);
        const successes = [a, b].filter((r) => !r.error);
        console.log("[re-verify Contract 12]", JSON.stringify([a, b].map((r) => ({ ok: !r.error, code: r.error?.code }))));
        expect(successes.length).toBeLessThanOrEqual(1);
    });

    it("[re-verify Problema 2] storeOTP:'encrypted' (the actual production setting) round-trips correctly and the persisted row is NOT plaintext", async () => {
        const { client, db, testUser, sentEmails } = await buildInstance("encrypted");
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const plainOtp = latestOtpFor(sentEmails, testUser.email);

        const rows = await db.findMany<{ value: string }>({
            model: "verification",
            where: [{ field: "identifier", value: `forget-password-otp-${testUser.email}` }],
        });
        expect(rows[0].value).not.toContain(plainOtp);
        console.log(`[re-verify Problema 2] plaintext otp=${plainOtp}, persisted value=${rows[0].value}`);

        // And it must still actually work end-to-end (encrypted storage decrypts correctly).
        const result = await client.emailOtp.checkVerificationOtp(
            { email: testUser.email, otp: plainOtp, type: "forget-password" },
            withIp(ip),
        );
        expect(result.error).toBeNull();
    });
});

describe("Fase C adversarial: Q1 — mutex fail-fast false positives on legitimate sequential use", () => {
    it("genuinely sequential (awaited) guesses never collide with the mutex", async () => {
        const { client, testUser } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

        for (let i = 0; i < 5; i++) {
            const r = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: "00000000", type: "forget-password" },
                withIp(ip),
            );
            expect(r.error?.code).not.toBe("RECOVERY_THROTTLED");
        }
    });

    it("FINDING: a genuine network-retry-shaped double-fire (two calls issued back-to-back with no await between them) DOES get one call wrongly rejected as RECOVERY_THROTTLED, not treated as the same logical attempt", async () => {
        // This is the accepted trade-off the coordinator named (fail-fast over
        // queuing) — confirmed here concretely so it's not just theoretical.
        // Not a security bug (fail-closed is the safe direction), but a real
        // UX edge: a flaky-network retry of the SAME logical guess can consume
        // the user's mutex slot and come back as "try again" instead of
        // silently deduplicating.
        const { client, testUser } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

        const [a, b] = await Promise.all([
            client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: "00000000", type: "forget-password" }, withIp(ip)),
            client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: "00000000", type: "forget-password" }, withIp(ip)),
        ]);
        const throttled = [a, b].filter((r) => r.error?.code === "RECOVERY_THROTTLED");
        expect(throttled.length).toBe(1); // exactly one of the two "identical" calls is rejected
    });
});

describe("Fase C adversarial: Q2 — onChallengeIssued reset-vs-cooldown branch", () => {
    it("legitimate early resend (streak well under budget) still gets a clean slate through the wired plugin", async () => {
        const { client, testUser, sentEmails } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        for (let i = 0; i < 3; i++) {
            await client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: "00000000", type: "forget-password" }, withIp(ip));
        }
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otpB = latestOtpFor(sentEmails, testUser.email);
        const r = await client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: otpB, type: "forget-password" }, withIp(ip));
        expect(r.error).toBeNull(); // not throttled — legitimate reset worked
    });

    it("FINDING: onChallengeIssued's cooldown branch has no staleness check of its own — an exhausted streak from a MONTH ago still triggers a fresh 15-minute lockout on the user's very first guess after resending", async () => {
        vi.useFakeTimers();
        try {
            const { client, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            for (let i = 0; i < 10; i++) {
                await client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: "00000000", type: "forget-password" }, withIp(ip));
            }
            // User abandons the flow for a month — no calls at all in between.
            await vi.advanceTimersByTimeAsync(31 * 24 * 60 * 60 * 1000);

            // A month later, legitimately tries again: requests a brand new code.
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const freshOtp = latestOtpFor(sentEmails, testUser.email);
            expect(freshOtp).toBeTruthy();

            // Their very FIRST guess against the brand new code — with the CORRECT
            // OTP this time — should not be penalized for a month-old, long-since-
            // irrelevant streak. REQUIRED: this should succeed or at least not be
            // RECOVERY_THROTTLED. Currently FAILS: onChallengeIssued only compares
            // attemptCount >= ALLOWED_ATTEMPTS with no reference to how old that
            // count is, so it unconditionally starts a fresh 15-minute cooldown.
            const guess = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: freshOtp, type: "forget-password" },
                withIp(ip),
            );
            console.log("[Q2 finding] guess against fresh OTP after a month-old exhausted streak:", JSON.stringify(guess.error));
            expect(guess.error?.code).not.toBe("RECOVERY_THROTTLED");
        } finally {
            vi.useRealTimers();
        }
    });
});

describe("Fase C adversarial: Q3 — cross-endpoint interaction", () => {
    it("redeeming without ever calling check-verification-otp first works and correctly resets the throttle on success", async () => {
        const { client, testUser, sentEmails } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otp = latestOtpFor(sentEmails, testUser.email);

        const result = await client.emailOtp.resetPassword(
            { email: testUser.email, otp, password: "directRedeemPassw0rd" },
            withIp(ip),
        );
        expect(result.error).toBeNull();
    });

    it("a WRONG redemption attempt (skip check, guess wrong on reset-password directly) still counts toward the cumulative streak and does NOT trigger resetOnSuccess", async () => {
        const { client, testUser, sentEmails } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const otp = latestOtpFor(sentEmails, testUser.email);

        for (let i = 0; i < 9; i++) {
            const r = await client.emailOtp.resetPassword(
                { email: testUser.email, otp: "00000000", password: "wrongGuessPassw0rd" },
                withIp(ip),
            );
            expect(r.error?.code).not.toBe("RECOVERY_THROTTLED");
        }
        // 10th call: correct otp this time. If the wrong redemption attempts above
        // were NOT counted toward the same cumulative streak as check-verification-otp,
        // this would still succeed; if they share the streak (as GUESS_PATHS implies),
        // this is the legitimate 10th call and should still be allowed (boundary,
        // not over it), then reset the throttle on success.
        const finalTry = await client.emailOtp.resetPassword(
            { email: testUser.email, otp, password: "correctPassw0rd" },
            withIp(ip),
        );
        console.log("[Q3] 10th call (correct otp) result:", JSON.stringify(finalTry.error));
        expect(finalTry.error).toBeNull();
    });
});

describe("Fase C adversarial: Q4/Q5 — hook guarantees and error-code plumbing", () => {
    it("RECOVERY_THROTTLED resolves to HTTP 429 (confirms BetterAuthRepository.mapError's status===429 branch also catches this, not just better-auth's generic limiter)", async () => {
        const { client, testUser } = await buildInstance();
        const ip = freshIp();
        await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
        const [a, b] = await Promise.all([
            client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: "00000000", type: "forget-password" }, withIp(ip)),
            client.emailOtp.checkVerificationOtp({ email: testUser.email, otp: "00000000", type: "forget-password" }, withIp(ip)),
        ]);
        const throttled = [a, b].find((r) => r.error?.code === "RECOVERY_THROTTLED");
        expect(throttled?.error?.status).toBe(429);
    });
});

describe("Fase C adversarial: mutex must not leak on a genuine (non-APIError) crash inside the store", () => {
    it("REQUIRED PROPERTY, now fixed: if store.recordGuess throws a non-APIError (e.g. a DB fault), the mutex claim must NOT leak — a subsequent call must reach better-auth's own logic, not be short-circuited by a stale RECOVERY_THROTTLED", async () => {
        // History: originally written to assert the bug (the immediately-following
        // call WAS wrongly RECOVERY_THROTTLED, because better-auth's own
        // runBeforeHooks re-throws unconditionally and before-hooks never reach a
        // paired after-hook run on their own thrown errors, so nothing released
        // the claim). The plugin's before-hook now wraps store.recordGuess in its
        // own try/catch and releases the claim before re-throwing on ANY error,
        // not just the `!result.allowed` path — confirmed by reading the diff in
        // lib/passwordRecoveryThrottle.ts. This test was updated (not the
        // assertion softened to fit old behavior) to check the actually-required
        // property once the fix landed: the second call must NOT be preempted by
        // the mutex — whatever better-auth's own handler decides from there is a
        // separate concern.
        const { createInMemoryRecoveryAttemptStore: freshStoreFactory } = await import("@/lib/passwordRecoveryThrottle");
        const realStore = freshStoreFactory();
        let crashNext = true;
        const faultyStore = {
            ...realStore,
            async recordGuess(e: string) {
                if (crashNext) {
                    crashNext = false;
                    throw new Error("simulated DB fault inside recordGuess");
                }
                return realStore.recordGuess(e);
            },
        };
        const { passwordRecoveryThrottlePlugin } = await import("@/lib/passwordRecoveryThrottle");
        const instance = await getTestInstance({
            emailAndPassword: { enabled: true, minPasswordLength: 6 },
            plugins: [
                emailOTP({
                    otpLength: 8,
                    expiresIn: 60 * 10,
                    allowedAttempts: 10,
                    resendStrategy: "reuse",
                    storeOTP: "encrypted",
                    sendVerificationOnSignUp: false,
                    async sendVerificationOTP() {},
                }),
                passwordRecoveryThrottlePlugin(faultyStore),
            ],
        }, { clientOptions: { plugins: [emailOTPClient()] } });
        // Use the harness's own seeded, real signed-up user (not a synthetic
        // never-registered email) so the second call's result is unambiguous:
        // an unrelated USER_NOT_FOUND would also prove "not RECOVERY_THROTTLED"
        // but is a noisier signal than a clean INVALID_OTP from actually reaching
        // better-auth's real OTP-checking logic.
        const email = instance.testUser.email;

        await instance.client.emailOtp.sendVerificationOtp({ email, type: "forget-password" }, withIp(freshIp()));

        // First guess: recordGuess crashes with a raw Error (not APIError) after
        // claimInFlight already succeeded (claimed the mutex).
        const first = await instance.client.emailOtp.checkVerificationOtp(
            { email, otp: "00000000", type: "forget-password" },
            withIp(freshIp()),
        );
        console.log("[mutex leak, fixed] first (crashing) call result:", JSON.stringify(first.error), first.data);

        // Immediately after — must NOT be short-circuited by the mutex anymore.
        const secondImmediately = await instance.client.emailOtp.checkVerificationOtp(
            { email, otp: "00000000", type: "forget-password" },
            withIp(freshIp()),
        );
        console.log("[mutex leak, fixed] second (immediately after crash) call result:", JSON.stringify(secondImmediately.error));
        expect(secondImmediately.error?.code).not.toBe("RECOVERY_THROTTLED");
        // Reached better-auth's real handler and got a real, expected outcome for
        // a wrong guess against a real user — proof the mutex was actually released.
        expect(secondImmediately.error?.code).toBe("INVALID_OTP");
    });
});
