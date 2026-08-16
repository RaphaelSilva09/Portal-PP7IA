// @vitest-environment node
/**
 * INTEGRATION TIER — real better-auth + real SQLite via `getTestInstance()`.
 *
 * These tests exercise the ACTUAL better-auth@1.6.9 plugin route handlers
 * (dist/plugins/email-otp/routes.mjs, otp-token.mjs) against a real relational
 * database (in-memory SQLite via node:sqlite). Nothing about the OTP/attempts/
 * rate-limit logic under test is mocked — only the outbound email transport
 * (`sendVerificationOTP` callback) is stubbed, exactly the way `lib/auth.ts`
 * would call Resend in production.
 *
 * The `emailOTP` and top-level `rateLimit` config passed to `getTestInstance`
 * below is copied verbatim from `frontend/lib/auth.ts` (as it exists at the time
 * of writing) so that behavior observed here matches production. If `lib/auth.ts`
 * changes, this config must be re-synced — see `buildInstance()`.
 *
 * Unit-tier tests for the pure client-side state machine
 * (`hooks/usePasswordRecovery.ts`) live in a separate file:
 * `__tests__/hooks/usePasswordRecoveryRaces.test.ts`.
 *
 * better-auth version under test: 1.6.9 (resolved via frontend/node_modules/.pnpm).
 */

import { describe, it, expect } from "vitest";
import { getTestInstance } from "better-auth/test";
import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { emailOTP } from "better-auth/plugins";
import { createInMemoryRecoveryAttemptStore, passwordRecoveryThrottlePlugin } from "@/lib/passwordRecoveryThrottle";

type SentEmail = { email: string; otp: string; type: string };
type TestDb = Awaited<ReturnType<typeof getTestInstance>>["db"];
type VerificationRow = { identifier: string; value: string; expiresAt: Date | string };

/** Every real customRules entry from frontend/lib/auth.ts's top-level `rateLimit` block. */
const PRODUCTION_TOP_LEVEL_CUSTOM_RULES = {
    "/get-session": { window: 60, max: 240 },
    "/sign-in/email": { window: 60, max: 10 },
    "/sign-up/email": { window: 60, max: 10 },
    "/forget-password": { window: 60, max: 5 },
    "/reset-password": { window: 60, max: 10 },
    "/email-otp/send-verification-otp": { window: 60, max: 5 },
};

/**
 * Mirrors the exact emailOTP + rateLimit config in frontend/lib/auth.ts.
 * `checkRateLimitMax` lets a handful of tests bump ONLY the plugin's own
 * per-endpoint rate limit ceiling, to isolate the allowedAttempts-exhaustion
 * mechanism from the (real, production) coincidence that
 * `emailOTP.rateLimit.max === allowedAttempts === 10`, which otherwise makes
 * the generic 429 fire before the domain TOO_MANY_ATTEMPTS branch is ever
 * reached within a single 60s window. Tests that use this override say so
 * explicitly in a comment and are paired with a test using the REAL numbers.
 */
async function buildInstance(opts?: { checkRateLimitMax?: number }) {
    const sentEmails: SentEmail[] = [];
    const instance = await getTestInstance({
        emailAndPassword: { enabled: true, minPasswordLength: 6 },
        rateLimit: {
            enabled: true,
            window: 60,
            max: 60,
            customRules: PRODUCTION_TOP_LEVEL_CUSTOM_RULES,
        },
        plugins: [
            emailOTP({
                otpLength: 8,
                expiresIn: 60 * 10,
                allowedAttempts: 10,
                resendStrategy: "reuse",
                rateLimit: { window: 60, max: opts?.checkRateLimitMax ?? 10 },
                sendVerificationOnSignUp: false,
                async sendVerificationOTP({ email, otp, type }) {
                    sentEmails.push({ email, otp, type });
                },
            }),
            // No real Postgres reachable in this sandbox (confirmed: DATABASE_URL unset, no
            // local postgres, docker daemon not running) — the in-memory store gives the same
            // atomicity guarantee for a single Node process (no `await` inside its critical
            // sections, so concurrent calls can't interleave), which is what these tests need
            // to observe. Production uses createPostgresRecoveryAttemptStore (see lib/auth.ts)
            // for cross-instance durability.
            passwordRecoveryThrottlePlugin(createInMemoryRecoveryAttemptStore()),
        ],
    }, {
        // Registers the emailOtp.* methods on the typed client — without this
        // the base test client only has correct types for endpoints that ship
        // with getTestInstance's own default plugins (bearer), even though the
        // untyped calls work fine at runtime since better-auth builds the
        // client's method table dynamically from the live server schema.
        clientOptions: { plugins: [emailOTPClient()] },
    });
    return { ...instance, sentEmails };
}

/** Every test gets its own x-forwarded-for so the module-level in-memory
 *  rate-limit store (a singleton Map shared by ALL getTestInstance() calls in
 *  this worker/file — confirmed by reading dist/api/rate-limiter/index.mjs)
 *  doesn't leak attempts/requests across unrelated tests. getIp() falls back
 *  to a fixed 127.0.0.1 in test/dev unless x-forwarded-for is set, so without
 *  this every test in this file would silently share one rate-limit bucket
 *  per path. */
let ipCounter = 0;
function freshIp() {
    ipCounter += 1;
    return `10.77.${Math.floor(ipCounter / 250)}.${ipCounter % 250 || 1}`;
}
function withIp(ip: string) {
    return { headers: { "x-forwarded-for": ip } };
}

function latestOtpFor(sentEmails: SentEmail[], email: string, type = "forget-password") {
    const matches = sentEmails.filter((e) => e.email === email && e.type === type);
    return matches[matches.length - 1]?.otp;
}

async function readVerificationRow(db: TestDb, email: string, type = "forget-password") {
    const rows = await db.findMany<VerificationRow>({
        model: "verification",
        where: [{ field: "identifier", value: `${type}-otp-${email}` }],
    });
    return rows[0] ?? null;
}

describe("Password recovery OTP security — real better-auth 1.6.9 + real SQLite", () => {
    // ------------------------------------------------------------------
    // Contract 2 — OTP storage
    // ------------------------------------------------------------------
    describe("Contract 2: OTP storage", () => {
        it("[REGRESSION GUARD, not a description of current production behavior] storeOTP left unset -> better-auth default 'plain' -> the persisted verification row literally contains the plaintext OTP", async () => {
            // NOTE (post Fase B): lib/auth.ts no longer leaves storeOTP unset — it
            // now sets storeOTP:"encrypted" (the Problema 2 fix). buildInstance()'s
            // shared config here intentionally still omits storeOTP (i.e. still
            // exercises the 'plain' default) rather than being re-synced to
            // "encrypted", because Contract 2's whole point is to pin down what
            // 'plain' actually persists — re-syncing this shared instance to
            // "encrypted" would silently break that assertion instead of amending
            // it deliberately. Direct verification that the ACTUAL current
            // production setting (storeOTP:"encrypted") round-trips correctly and
            // is NOT plaintext lives in
            // __tests__/integration/passwordRecoveryThrottleAdversarial.test.ts
            // ("[re-verify Problema 2]"), which builds its own instance with
            // storeOTP:"encrypted" explicitly.
            const { client, db, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();

            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const plainOtp = latestOtpFor(sentEmails, testUser.email);
            expect(plainOtp).toBeTruthy();

            const row = await readVerificationRow(db, testUser.email);
            expect(row).not.toBeNull();

            // FINDING: the persisted value is `${otp}:${attempts}` in PLAINTEXT
            // when storeOTP is left unset — this remains true and is exactly why
            // Fase B changed lib/auth.ts to storeOTP:"encrypted".
            expect(row.value).toBe(`${plainOtp}:0`);
            expect(row.value.startsWith(plainOtp)).toBe(true);
        });
    });

    // ------------------------------------------------------------------
    // Contract 1 — exhaust-and-resend budget (the core suspected bug) + Contract 6 boundary
    // ------------------------------------------------------------------
    describe("Contract 1 & 6: exhaust-and-resend budget / boundary attempts", () => {
        it("[Problema 1 - Scenario B, DIAGNOSTIC ONLY] 10 wrong guesses WITHOUT ever crossing the TOO_MANY_ATTEMPTS branch, then immediate resend -> better-auth's OWN internal verification.value resets attempts to 0 for the new challenge", async () => {
            // NOT a pass/fail gate on the fix. This documents an unpatched fact
            // about better-auth 1.6.9's own internal bookkeeping (resendStrategy:
            // "reuse" mints a fresh 0-attempt row once the old challenge's
            // internal counter >= allowedAttempts) that remains true even after
            // Phase 2's fix, because the fix deliberately does NOT reach into
            // ctx.context.internalAdapter / the verification table's own
            // "otp:attempts" string to rewrite it in place — doing so would mean
            // depending on and mutating an internal, non-public string encoding
            // of a third-party library, which is the same category of anti-
            // pattern as homebrew crypto, just applied to internal state instead.
            // The actual required security property — that the cumulative guess
            // budget survives this resend — is asserted independently, at the
            // externally observable/reachable level, in the next test below.
            const { client, db, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();

            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpA = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 10; i++) {
                const r = await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
                expect(r.error?.code).toBe("INVALID_OTP");
            }

            const rowBeforeResend = await readVerificationRow(db, testUser.email);
            expect(rowBeforeResend).not.toBeNull(); // NOT deleted — TOO_MANY_ATTEMPTS branch never ran
            expect(rowBeforeResend.value).toBe(`${otpA}:10`);

            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpB = latestOtpFor(sentEmails, testUser.email);
            expect(otpB).not.toBe(otpA);

            const rowAfterResend = await readVerificationRow(db, testUser.email);
            console.log(
                "[Contract 1 Scenario B, diagnostic] better-auth's own internal row after resend:",
                rowAfterResend?.value,
                "(expected to read ':0' — this is the library's own mechanism, unpatched by design; see the required-property test below for what actually gates the fix)",
            );
        });

        it("[Problema 1 - Scenario B, REQUIRED PROPERTY] the cumulative guess budget must survive a resend that never crossed better-auth's own TOO_MANY_ATTEMPTS branch — asserted at the externally reachable response level, not by reading better-auth's internal row", async () => {
            // This is the actual pass/fail gate for the Scenario B fix. It is
            // deliberately mechanism-agnostic: it does not assume WHICH
            // officially-supported mechanism Phase 2 uses (an independent
            // email-keyed table gated via the plugin's `hooks.before`/`hooks.after`
            // is one legitimate option among possibly others) — it only requires
            // that, from the caller's point of view, a wrong guess against a
            // freshly-resent OTP is NOT treated as "attempt 1 of a fresh 10" when
            // the underlying recovery session already burned its budget against
            // the previous OTP. Any rejection whose error code differs from the
            // ordinary in-budget INVALID_OTP satisfies this — the exact shape
            // (a new domain error code, a 403, a generic-looking 429, etc.) is
            // Phase 2's call.
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

            // Resend without ever crossing TOO_MANY_ATTEMPTS — resend itself must
            // still functionally work (this is not a "block all resends" fix).
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpB = latestOtpFor(sentEmails, testUser.email);
            expect(otpB).not.toBe(otpA);

            // THE REQUIRED ASSERTION: a wrong guess against the freshly-resent
            // otpB must be rejected by the cumulative mechanism, not accepted as
            // an ordinary in-budget guess. Currently FAILS against better-auth
            // 1.6.9 + no Phase 2 fix (the response today is plain INVALID_OTP,
            // code === "INVALID_OTP") — that's the point; it must pass once the
            // cumulative throttle is wired in.
            const guessAgainstFreshChallenge = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: "00000000", type: "forget-password" },
                withIp(ip),
            );
            expect(guessAgainstFreshChallenge.error).not.toBeNull();
            expect(guessAgainstFreshChallenge.error?.code).not.toBe("INVALID_OTP");
        });

        it("[Problema 1 - Scenario A] 10 wrong guesses THEN one more redemption attempt that crosses TOO_MANY_ATTEMPTS (deletes the row), then resend -> legitimately fresh 0-attempt challenge (this scenario is NOT a bug)", async () => {
            const { client, db, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();

            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpA = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 10; i++) {
                await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            // The 11th "differentiating" call: the actual redemption endpoint
            // (/email-otp/reset-password) is a SEPARATE rate-limit bucket from
            // check-verification-otp, so this call is not itself preempted by the
            // generic 429 — it reaches atomicVerifyOTP, which re-reads the SAME
            // verification row (attempts=10 >= allowedAttempts=10) and throws
            // TOO_MANY_ATTEMPTS, deleting the row — even though the OTP passed
            // here (otpA) is objectively CORRECT.
            const eleventh = await client.emailOtp.resetPassword(
                { email: testUser.email, otp: otpA, password: "brandNewPassw0rd" },
                withIp(ip),
            );
            expect(eleventh.error?.code).toBe("TOO_MANY_ATTEMPTS");
            expect(eleventh.error?.status).toBe(403);

            const rowAfterExhaustion = await readVerificationRow(db, testUser.email);
            expect(rowAfterExhaustion).toBeNull(); // genuinely deleted this time

            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpB = latestOtpFor(sentEmails, testUser.email);
            const rowAfterResend = await readVerificationRow(db, testUser.email);
            expect(rowAfterResend.value).toBe(`${otpB}:0`);
            // This IS correct/expected: the old challenge was actually retired,
            // so a resend legitimately starting a new one at 0 is not a loophole.
        });

        it("Contract 6 boundary: exactly 9 wrong + correct OTP on the real redemption endpoint succeeds", async () => {
            const { client, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otp = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 9; i++) {
                await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            const result = await client.emailOtp.resetPassword(
                { email: testUser.email, otp, password: "brandNewPassw0rd" },
                withIp(ip),
            );
            expect(result.error).toBeNull();
            expect(result.data?.success).toBe(true);
        });

        it("Contract 6 boundary: exactly 10 wrong + correct OTP submitted as the 11th call is rejected as exhausted, even though the code is correct", async () => {
            const { client, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otp = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 10; i++) {
                await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            const result = await client.emailOtp.resetPassword(
                { email: testUser.email, otp, password: "brandNewPassw0rd" },
                withIp(ip),
            );
            expect(result.error?.code).toBe("TOO_MANY_ATTEMPTS");
        });

        it("FINDING (supplementary, isolated rate limit): with the domain TOO_MANY_ATTEMPTS branch isolated from the coincidental rate-limit cap, checkVerificationOtp itself also rejects the 11th call as exhausted even mid-endpoint", async () => {
            // Real production config makes emailOTP.rateLimit.max === allowedAttempts
            // === 10 on /email-otp/check-verification-otp, so the 11th call to THAT
            // endpoint is preempted by a generic 429 before the handler runs (see
            // the "Rate limiting reality check" describe block below for direct
            // proof). This test bumps ONLY the plugin rate limit ceiling to 50 to
            // observe the pure attempts-exhaustion logic in isolation.
            const { client, testUser, sentEmails } = await buildInstance({ checkRateLimitMax: 50 });
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otp = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 10; i++) {
                await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            const eleventh = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp, type: "forget-password" }, // now submitting the CORRECT otp
                withIp(ip),
            );
            expect(eleventh.error?.code).toBe("TOO_MANY_ATTEMPTS");
            expect(eleventh.error?.status).toBe(403);
        });
    });

    // ------------------------------------------------------------------
    // Contract 3 — resend before exhaustion
    // ------------------------------------------------------------------
    describe("Contract 3: resend before exhaustion", () => {
        it("resend after a few wrong guesses reuses the SAME otp and preserves the attempts count", async () => {
            const { client, db, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpA = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 3; i++) {
                await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            const rowBeforeResend = await readVerificationRow(db, testUser.email);
            expect(rowBeforeResend.value).toBe(`${otpA}:3`);

            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpAfterResend = latestOtpFor(sentEmails, testUser.email);
            expect(otpAfterResend).toBe(otpA); // reused, not a new otp

            const rowAfterResend = await readVerificationRow(db, testUser.email);
            expect(rowAfterResend.value).toBe(`${otpA}:3`); // attempts preserved, not reset

            // otpA still works after resend (it IS the resent otp)
            const result = await client.emailOtp.resetPassword(
                { email: testUser.email, otp: otpA, password: "brandNewPassw0rd" },
                withIp(ip),
            );
            expect(result.error).toBeNull();
        });
    });

    // ------------------------------------------------------------------
    // Contract 4 — concurrent resend
    // ------------------------------------------------------------------
    describe("Contract 4: concurrent resend", () => {
        it("N concurrent resend requests do not corrupt the verification row / all resolve, and DB ends in a consistent single-row state", async () => {
            const { client, db, testUser } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

            const N = 5;
            const results = await Promise.all(
                Array.from({ length: N }, () =>
                    client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip)),
                ),
            );
            const failureCount = results.filter((r) => r.error).length;
            console.log(
                `[Contract 4] concurrent resend results: ${failureCount}/${N} rate-limited,`,
                JSON.stringify(results.map((r) => ({ ok: !r.error, status: r.error?.status }))),
            );
            // All within the send-verification-otp budget (max=5, we already used
            // 1 + these 5 -> the 6th total may or may not 429 depending on timing;
            // that's expected rate-limiter behavior, not a data-integrity issue).
            const rows = await db.findMany<VerificationRow>({
                model: "verification",
                where: [{ field: "identifier", value: `forget-password-otp-${testUser.email}` }],
            });
            // The important assertion: no duplicate/orphaned rows for the same
            // identifier — createVerificationValue's .catch() fallback (delete +
            // recreate) exists precisely to guard against a unique-constraint
            // collision under concurrent inserts; we verify it actually holds.
            expect(rows.length).toBeLessThanOrEqual(1);
        });
    });

    // ------------------------------------------------------------------
    // Contract 5 — concurrent verification
    // ------------------------------------------------------------------
    describe("Contract 5: concurrent verification (lost-update race on the attempts counter)", () => {
        it("[DIAGNOSTIC ONLY] firing concurrent wrong guesses against better-auth's own internal verification.value undercounts (lost update)", async () => {
            // NOT a pass/fail gate on the fix, for the same reason as the
            // Contract 1 Scenario B diagnostic above: checkVerificationOTP's
            // plain findOne-then-update on the verification table is internal
            // to better-auth 1.6.9 and is not patched by Phase 2's fix. This
            // documents that the underlying library-level race is real and
            // still present; the actual required property is asserted
            // independently below, against an isolated cumulative mechanism
            // that does not depend on this field being accurate.
            const { client, db, testUser } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

            const N = 5;
            await Promise.all(
                Array.from({ length: N }, () =>
                    client.emailOtp.checkVerificationOtp(
                        { email: testUser.email, otp: "00000000", type: "forget-password" },
                        withIp(ip),
                    ),
                ),
            );

            const row = await readVerificationRow(db, testUser.email);
            const [, attempts] = row.value.split(":");
            console.log(
                `[Contract 5, diagnostic] fired ${N} concurrent wrong guesses, better-auth's own internal attempts field recorded = ${attempts} (undercount expected — this is the library's own mechanism, unpatched by design)`,
            );
        });

        it("[REQUIRED PROPERTY] more concurrent wrong guesses than allowedAttempts must not all be treated as ordinary in-budget guesses — some cumulative/atomic mechanism must reject the overflow", async () => {
            // Mechanism-agnostic on purpose: does not assume the fix's exact
            // response shape, only that it exists and is distinguishable from
            // the plain per-OTP INVALID_OTP response used for a guess that is
            // still within budget.
            //
            // Isolated from the PRE-EXISTING, unrelated per-endpoint rate
            // limiter (see Contract 9: emailOTP.rateLimit.max=10/60s on
            // check-verification-otp) by raising its ceiling well above N here
            // — otherwise firing N=15 concurrent calls would produce some
            // generic 429s regardless of whether the cumulative-attempts fix
            // exists at all, which would make this assertion pass for the
            // wrong reason (false negative) both before and after the fix.
            const { client, testUser } = await buildInstance({ checkRateLimitMax: 100 });
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

            const N = 15; // deliberately > allowedAttempts (10)
            const results = await Promise.all(
                Array.from({ length: N }, () =>
                    client.emailOtp.checkVerificationOtp(
                        { email: testUser.email, otp: "00000000", type: "forget-password" },
                        withIp(ip),
                    ),
                ),
            );
            const plainInvalidOtpCount = results.filter((r) => r.error?.code === "INVALID_OTP").length;
            const otherRejectionCount = results.filter((r) => r.error && r.error.code !== "INVALID_OTP").length;
            console.log(
                `[Contract 5, required property] of ${N} concurrent guesses: ${plainInvalidOtpCount} treated as ordinary in-budget INVALID_OTP, ${otherRejectionCount} rejected by some other mechanism`,
            );

            // Currently FAILS against better-auth 1.6.9 + no Phase 2 fix — today
            // all N are typically accepted as plain INVALID_OTP because the
            // library's own internal counter loses updates under concurrency
            // (see the diagnostic test above). Must pass once a genuinely
            // atomic cumulative mechanism caps in-budget guesses at 10.
            expect(plainInvalidOtpCount).toBeLessThanOrEqual(10);
        });
    });

    // ------------------------------------------------------------------
    // Contract 7 — expired OTP replaced by a new one
    // ------------------------------------------------------------------
    describe("Contract 7: expired OTP replaced by new one", () => {
        it("an expired OTP is rejected as OTP_EXPIRED (not INVALID_OTP), is deleted, and a fresh request afterwards works independently", async () => {
            const { client, db, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpA = latestOtpFor(sentEmails, testUser.email);

            // Simulate expiry by rewriting expiresAt directly on OUR OWN test
            // instance's db (never touching lib/auth.ts or expiresIn there).
            await db.updateMany({
                model: "verification",
                where: [{ field: "identifier", value: `forget-password-otp-${testUser.email}` }],
                update: { expiresAt: new Date(Date.now() - 1000) },
            });

            const expiredAttempt = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: otpA, type: "forget-password" },
                withIp(ip),
            );
            expect(expiredAttempt.error?.code).toBe("OTP_EXPIRED");
            expect(expiredAttempt.error?.code).not.toBe("INVALID_OTP");

            const rowAfterExpiry = await readVerificationRow(db, testUser.email);
            expect(rowAfterExpiry).toBeNull(); // expired row deleted by the handler

            // Fresh request afterwards is a clean, independent 0-attempt challenge.
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otpB = latestOtpFor(sentEmails, testUser.email);
            expect(otpB).not.toBe(otpA);
            const rowB = await readVerificationRow(db, testUser.email);
            expect(rowB.value).toBe(`${otpB}:0`);

            // The old, now-deleted otpA must not work even by coincidence.
            const oldOtpRetry = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: otpA, type: "forget-password" },
                withIp(ip),
            );
            expect(oldOtpRetry.error).not.toBeNull();
        });
    });

    // ------------------------------------------------------------------
    // Contract 8 — refresh doesn't restore server budget
    // ------------------------------------------------------------------
    describe("Contract 8: refresh doesn't restore server-side budget", () => {
        it("attempts are cumulative across two independent client instances with zero shared JS state (simulating a page refresh)", async () => {
            const { customFetchImpl, testUser, db, client: clientA } = await buildInstance();
            const ip = freshIp();
            await clientA.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

            // clientB is a totally separate authClient instance — no shared module
            // state, no shared closures with clientA — pointed at the same
            // customFetchImpl (i.e. the same live server), the closest in-process
            // analogue to "the user refreshed the page and the browser tab's JS
            // heap was thrown away."
            const clientB = createAuthClient({
                baseURL: "http://localhost:3000/api/auth",
                fetchOptions: { customFetchImpl },
                plugins: [emailOTPClient()],
            });

            for (let i = 0; i < 4; i++) {
                await clientA.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            let row = await readVerificationRow(db, testUser.email);
            expect(row.value.endsWith(":4")).toBe(true);

            // "Refresh": switch to clientB entirely.
            for (let i = 0; i < 4; i++) {
                await clientB.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            row = await readVerificationRow(db, testUser.email);
            expect(row.value.endsWith(":8")).toBe(true); // cumulative, not reset by the "refresh"
        });
    });

    // ------------------------------------------------------------------
    // Contract 9 — rate limiting reality check
    // ------------------------------------------------------------------
    describe("Contract 9: rate limiting reality check", () => {
        it("a legitimate user CAN complete all 10 allowed check-verification-otp attempts within the window without hitting 429 prematurely", async () => {
            const { client, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otp = latestOtpFor(sentEmails, testUser.email);

            for (let i = 0; i < 9; i++) {
                const r = await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
                expect(r.error?.status).not.toBe(429);
            }
            const tenth = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp, type: "forget-password" },
                withIp(ip),
            );
            expect(tenth.error?.status).not.toBe(429);
            expect(tenth.error).toBeNull(); // 10th call, correct code -> succeeds
        });

        it("FINDING: the 11th call to check-verification-otp within the same 60s window hits the generic rate limiter (429), NOT the domain TOO_MANY_ATTEMPTS error — because emailOTP.rateLimit.max (10) coincidentally equals allowedAttempts (10)", async () => {
            const { client, testUser } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));

            for (let i = 0; i < 10; i++) {
                await client.emailOtp.checkVerificationOtp(
                    { email: testUser.email, otp: "00000000", type: "forget-password" },
                    withIp(ip),
                );
            }
            const eleventh = await client.emailOtp.checkVerificationOtp(
                { email: testUser.email, otp: "00000000", type: "forget-password" },
                withIp(ip),
            );
            expect(eleventh.error?.status).toBe(429);
            expect(eleventh.error?.code).toBeUndefined(); // generic rate limiter has no `code` field
        });

        it("FINDING: /email-otp/send-verification-otp is capped at 5/60s in practice, NOT 10 — the top-level rateLimit.customRules entry silently overrides the plugin's own rateLimit:{max:10} for this one path (dist/api/rate-limiter/index.mjs resolveRateLimitConfig applies plugin rules first, then unconditionally re-applies any matching top-level customRule on top)", async () => {
            const { client, testUser } = await buildInstance();
            const ip = freshIp();
            const statuses: number[] = [];
            for (let i = 0; i < 7; i++) {
                const r = await client.emailOtp.sendVerificationOtp(
                    { email: testUser.email, type: "forget-password" },
                    withIp(ip),
                );
                statuses.push(r.error?.status ?? 200);
            }
            expect(statuses).toEqual([200, 200, 200, 200, 200, 429, 429]);
        });

        it("a 429 response carries a real X-Retry-After header matching the window", async () => {
            const { client, testUser } = await buildInstance();
            const ip = freshIp();
            let retryAfterHeader: string | null = null;
            for (let i = 0; i < 6; i++) {
                await client.emailOtp.sendVerificationOtp(
                    { email: testUser.email, type: "forget-password" },
                    {
                        headers: { "x-forwarded-for": ip },
                        onError(ctx: { response: Response }) {
                            retryAfterHeader = ctx.response.headers.get("X-Retry-After");
                        },
                    },
                );
            }
            expect(retryAfterHeader).toBe("60");
        });

        it("check-verification-otp is NOT collided by any top-level customRule (only send-verification-otp is) — confirms the plugin's max=10 is the sole ceiling for that path", async () => {
            const pathsInCustomRules = Object.keys(PRODUCTION_TOP_LEVEL_CUSTOM_RULES);
            expect(pathsInCustomRules).not.toContain("/email-otp/check-verification-otp");
            expect(pathsInCustomRules).not.toContain("/email-otp/reset-password");
            expect(pathsInCustomRules).toContain("/email-otp/send-verification-otp");
        });
    });

    // ------------------------------------------------------------------
    // Contract 10 — account enumeration
    // ------------------------------------------------------------------
    describe("Contract 10: account enumeration", () => {
        it("request-reset for an existing vs. a nonexistent email returns the same status and response shape", async () => {
            const { client, testUser } = await buildInstance();
            const ipReal = freshIp();
            const ipFake = freshIp();

            const t0 = Date.now();
            const real = await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ipReal));
            const t1 = Date.now();
            const fake = await client.emailOtp.sendVerificationOtp(
                { email: "definitely-does-not-exist-9182@test.com", type: "forget-password" },
                withIp(ipFake),
            );
            const t2 = Date.now();

            expect(real.error).toBeNull();
            expect(fake.error).toBeNull();
            expect(real.data).toEqual(fake.data); // both {success:true}

            console.log(
                `[Contract 10] timing order-of-magnitude: real=${t1 - t0}ms fake=${t2 - t1}ms (not asserted, informational only)`,
            );
        });
    });

    // ------------------------------------------------------------------
    // Contract 12 — single-use consumption
    // ------------------------------------------------------------------
    describe("Contract 12: single-use consumption", () => {
        it("redeeming a correct OTP succeeds once; redeeming the SAME OTP again for another password change fails", async () => {
            const { client, testUser, sentEmails } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otp = latestOtpFor(sentEmails, testUser.email);

            const first = await client.emailOtp.resetPassword(
                { email: testUser.email, otp, password: "firstNewPassw0rd" },
                withIp(ip),
            );
            expect(first.error).toBeNull();

            const second = await client.emailOtp.resetPassword(
                { email: testUser.email, otp, password: "secondNewPassw0rd" },
                withIp(ip),
            );
            expect(second.error).not.toBeNull();
            expect(second.error?.code).toBe("INVALID_OTP"); // row was deleted on success
        });

        it("two concurrent redemption attempts with the correct OTP -- at most one succeeds", async () => {
            const { client, testUser, sentEmails, db } = await buildInstance();
            const ip = freshIp();
            await client.emailOtp.sendVerificationOtp({ email: testUser.email, type: "forget-password" }, withIp(ip));
            const otp = latestOtpFor(sentEmails, testUser.email);

            const [a, b] = await Promise.all([
                client.emailOtp.resetPassword({ email: testUser.email, otp, password: "concurrentPassw0rdA" }, withIp(ip)),
                client.emailOtp.resetPassword({ email: testUser.email, otp, password: "concurrentPassw0rdB" }, withIp(ip)),
            ]);
            const successes = [a, b].filter((r) => !r.error);
            console.log(
                "[Contract 12] concurrent redemption results:",
                JSON.stringify([a, b].map((r) => ({ ok: !r.error, code: r.error?.code }))),
            );
            // REQUIRED: exactly one of the two concurrent redemptions may succeed.
            // atomicVerifyOTP does findVerificationValue() then, unconditionally,
            // deleteVerificationByIdentifier() before verifying — if both concurrent
            // calls read the row before either deletes it, both could pass and
            // BOTH accounts could end up "successfully" changing the password from
            // the same single-use code. This test is written to the required
            // invariant, not the observed one.
            expect(successes.length).toBeLessThanOrEqual(1);

            const rowAfter = await readVerificationRow(db, testUser.email);
            expect(rowAfter).toBeNull();
        });
    });
});
