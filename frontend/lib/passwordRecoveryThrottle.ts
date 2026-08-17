/**
 * Cross-challenge brute-force throttle for the password recovery (OTP) flow.
 *
 * better-auth's emailOTP plugin (`allowedAttempts`) already correctly budgets
 * guesses WITHIN a single, never-resent OTP challenge — proven by
 * __tests__/integration/passwordRecoverySecurity.test.ts's Contract 6 /
 * Scenario A tests, which pass against the raw library with no fix at all.
 * There are exactly two gaps this module closes, deliberately narrow so it
 * never second-guesses the case the library already gets right:
 *
 * 1. Resend-after-exhaustion (Problema 1 / Contract 1 Scenario B): if a
 *    challenge has already burned `allowedAttempts` guesses but was never
 *    redeemed with the one extra call that crosses TOO_MANY_ATTEMPTS (which
 *    is what actually deletes the row), resendStrategy:"reuse" can't reuse
 *    it (attempts >= allowedAttempts), so better-auth mints a fresh
 *    0-attempt challenge instead — silently resetting the budget. This is
 *    detected purely from OUR OWN guess counter (never by reading
 *    better-auth's internal `verification` row) at the moment of resend: if
 *    our counter already reached `allowedAttempts`, the resend is still
 *    allowed to succeed (so it isn't distinguishable from a legitimate
 *    resend), but every subsequent guess against the new challenge is
 *    rejected until a cooldown elapses.
 * 2. Concurrent guesses (Contract 5) and concurrent redemptions (Contract
 *    12): better-auth's own attempts-counter update and its
 *    delete-then-verify redemption are both plain read-then-write with no
 *    lock/transaction, so concurrent requests can race each other. A
 *    per-email mutual-exclusion claim serializes guess/redeem calls so at
 *    most one is ever in flight against better-auth at a time — this also
 *    fixes the race, it doesn't just detect it, since better-auth's own
 *    sequential logic is already correct once calls stop overlapping.
 *
 * Wired into better-auth via `hooks.before`/`hooks.after` (an
 * officially-supported plugin extension point — see
 * passwordRecoveryThrottlePlugin below) so it applies regardless of which
 * client calls the endpoint, not just calls routed through this app's own
 * repository layer.
 */

import type { Pool } from "pg";
import { APIError, createAuthMiddleware } from "better-auth/api";

/** Must match `allowedAttempts` in lib/auth.ts's emailOTP plugin config. */
const ALLOWED_ATTEMPTS = 10;
/** A guess streak this old is treated as an abandoned process, not a live threat. */
const STREAK_MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** Temporary, never permanent — an attacker can't lock the real owner out forever. */
const COOLDOWN_MS = 15 * 60 * 1000;
const IN_FLIGHT_MS = 5 * 1000;

export interface RecoveryThrottleResult {
    allowed: boolean;
    retryAfterSeconds: number | null;
}

export interface RecoveryAttemptStore {
    /** Records one guess (right or wrong) and reports whether it's currently blocked. */
    recordGuess(email: string): Promise<RecoveryThrottleResult>;
    /**
     * Called on every resend/send. If the guess streak already reached
     * ALLOWED_ATTEMPTS, starts a cooldown (the resend itself still succeeds —
     * only subsequent guesses are blocked). Otherwise clears the streak: an
     * early, legitimate resend gets a clean slate, matching
     * resendStrategy:"reuse"'s own intent.
     */
    onChallengeIssued(email: string): Promise<void>;
    /** Atomically claims a short-lived mutual-exclusion slot; false if already held. */
    claimInFlight(email: string): Promise<boolean>;
    releaseInFlight(email: string): Promise<void>;
    /** Clears all throttle state once the recovery legitimately completes. */
    resetOnSuccess(email: string): Promise<void>;
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/** Production store: atomic counters in Postgres, shared across app instances. */
export function createPostgresRecoveryAttemptStore(pool: Pool): RecoveryAttemptStore {
    async function ensureRow(email: string): Promise<void> {
        await pool.query(
            `INSERT INTO public.password_recovery_attempts (email, attempt_count, window_started_at, updated_at)
             VALUES ($1, 0, now(), now())
             ON CONFLICT (email) DO NOTHING`,
            [email],
        );
    }

    return {
        async recordGuess(email) {
            const normalized = normalizeEmail(email);
            await ensureRow(normalized);
            // A single atomic UPDATE ... RETURNING — no separate read-then-write, so
            // concurrent callers can't lose an update the way better-auth's own
            // checkVerificationOTP (findOne then update) can.
            const { rows } = await pool.query<{ attempt_count: number; blocked_until: Date | null }>(
                `UPDATE public.password_recovery_attempts
                 SET attempt_count = CASE WHEN window_started_at <= now() - interval '24 hours'
                                      THEN 1 ELSE attempt_count + 1 END,
                     window_started_at = CASE WHEN window_started_at <= now() - interval '24 hours'
                                          THEN now() ELSE window_started_at END,
                     blocked_until = CASE WHEN blocked_until IS NOT NULL AND blocked_until <= now()
                                     THEN NULL ELSE blocked_until END,
                     updated_at = now()
                 WHERE email = $1
                 RETURNING attempt_count, blocked_until`,
                [normalized],
            );
            const row = rows[0];
            const blockedUntilMs = row.blocked_until ? new Date(row.blocked_until).getTime() : null;
            if (blockedUntilMs && blockedUntilMs > Date.now()) {
                return { allowed: false, retryAfterSeconds: Math.ceil((blockedUntilMs - Date.now()) / 1000) };
            }
            return { allowed: true, retryAfterSeconds: null };
        },

        async onChallengeIssued(email) {
            const normalized = normalizeEmail(email);
            await ensureRow(normalized);
            // A streak is only "exhausted" if it's both >= ALLOWED_ATTEMPTS AND still
            // fresh (within STREAK_MAX_AGE_MS) — otherwise a user who abandoned recovery
            // after burning their budget once, then legitimately returns much later, would
            // get an immediate cooldown on their very first guess against a brand-new OTP.
            // Found by Fase C adversarial review (Q2): confirmed with a simulated 31-day gap.
            await pool.query(
                `UPDATE public.password_recovery_attempts
                 SET blocked_until = CASE
                       WHEN attempt_count >= ${ALLOWED_ATTEMPTS} AND window_started_at > now() - interval '${STREAK_MAX_AGE_MS / 1000} seconds'
                       THEN now() + interval '15 minutes'
                       ELSE NULL
                     END,
                     attempt_count = CASE
                       WHEN attempt_count >= ${ALLOWED_ATTEMPTS} AND window_started_at > now() - interval '${STREAK_MAX_AGE_MS / 1000} seconds'
                       THEN attempt_count ELSE 0
                     END,
                     window_started_at = CASE
                       WHEN attempt_count >= ${ALLOWED_ATTEMPTS} AND window_started_at > now() - interval '${STREAK_MAX_AGE_MS / 1000} seconds'
                       THEN window_started_at ELSE now()
                     END,
                     updated_at = now()
                 WHERE email = $1`,
                [normalized],
            );
        },

        async claimInFlight(email) {
            const normalized = normalizeEmail(email);
            await ensureRow(normalized);
            const { rows } = await pool.query(
                `UPDATE public.password_recovery_attempts
                 SET in_flight_until = now() + interval '5 seconds', updated_at = now()
                 WHERE email = $1 AND (in_flight_until IS NULL OR in_flight_until < now())
                 RETURNING email`,
                [normalized],
            );
            return rows.length > 0;
        },

        async releaseInFlight(email) {
            await pool.query(
                `UPDATE public.password_recovery_attempts SET in_flight_until = NULL, updated_at = now() WHERE email = $1`,
                [normalizeEmail(email)],
            );
        },

        async resetOnSuccess(email) {
            await pool.query(
                `UPDATE public.password_recovery_attempts
                 SET attempt_count = 0, blocked_until = NULL, in_flight_until = NULL, updated_at = now()
                 WHERE email = $1`,
                [normalizeEmail(email)],
            );
        },
    };
}

/**
 * In-process store for tests (no real Postgres reachable in this sandbox — see
 * __tests__/integration/passwordRecoverySecurity.test.ts). Node.js has no true
 * thread-level parallelism, and none of these functions `await` between reading
 * and writing the Map, so each one runs its whole critical section synchronously
 * before any other queued call can interleave — genuinely atomic for a single
 * process, the same guarantee the Postgres version gets from row-level locking.
 * NOT safe across multiple app instances — production must use the Postgres store.
 */
export function createInMemoryRecoveryAttemptStore(): RecoveryAttemptStore {
    interface Row {
        attemptCount: number;
        windowStartedAt: number;
        blockedUntil: number | null;
        inFlightUntil: number | null;
    }
    const rows = new Map<string, Row>();

    function getOrCreate(email: string): Row {
        const key = normalizeEmail(email);
        let row = rows.get(key);
        if (!row) {
            row = { attemptCount: 0, windowStartedAt: Date.now(), blockedUntil: null, inFlightUntil: null };
            rows.set(key, row);
        }
        return row;
    }

    return {
        async recordGuess(email) {
            const row = getOrCreate(email);
            const now = Date.now();
            if (now - row.windowStartedAt > STREAK_MAX_AGE_MS) {
                row.attemptCount = 0;
                row.windowStartedAt = now;
            }
            if (row.blockedUntil && row.blockedUntil <= now) row.blockedUntil = null;
            row.attemptCount += 1;
            if (row.blockedUntil && row.blockedUntil > now) {
                return { allowed: false, retryAfterSeconds: Math.ceil((row.blockedUntil - now) / 1000) };
            }
            return { allowed: true, retryAfterSeconds: null };
        },
        async onChallengeIssued(email) {
            const row = getOrCreate(email);
            const now = Date.now();
            // See the matching comment in createPostgresRecoveryAttemptStore — a streak is
            // only "exhausted" if it's both at the cap AND still fresh.
            const streakIsFreshAndExhausted =
                row.attemptCount >= ALLOWED_ATTEMPTS && now - row.windowStartedAt <= STREAK_MAX_AGE_MS;
            if (streakIsFreshAndExhausted) {
                row.blockedUntil = now + COOLDOWN_MS;
            } else {
                row.attemptCount = 0;
                row.windowStartedAt = now;
                row.blockedUntil = null;
            }
        },
        async claimInFlight(email) {
            const row = getOrCreate(email);
            const now = Date.now();
            if (row.inFlightUntil && row.inFlightUntil > now) return false;
            row.inFlightUntil = now + IN_FLIGHT_MS;
            return true;
        },
        async releaseInFlight(email) {
            const row = rows.get(normalizeEmail(email));
            if (row) row.inFlightUntil = null;
        },
        async resetOnSuccess(email) {
            const row = rows.get(normalizeEmail(email));
            if (row) {
                row.attemptCount = 0;
                row.blockedUntil = null;
                row.inFlightUntil = null;
            }
        },
    };
}

const GUESS_PATHS = new Set(["/email-otp/check-verification-otp", "/email-otp/reset-password"]);
const REDEMPTION_PATH = "/email-otp/reset-password";
const ISSUE_PATH = "/email-otp/send-verification-otp";

function extractEmail(body: unknown): string | null {
    if (body && typeof body === "object" && "email" in body && typeof (body as { email: unknown }).email === "string") {
        return (body as { email: string }).email;
    }
    return null;
}

/**
 * A minimal better-auth plugin — no endpoints of its own, just `hooks` — that
 * gates the OTP-guessing endpoints through a RecoveryAttemptStore before
 * better-auth's own handler runs. See module doc comment for why this can't
 * live inside BetterAuthRepository (it must apply to any caller, not just
 * calls routed through this app's own repository).
 */
export function passwordRecoveryThrottlePlugin(store: RecoveryAttemptStore) {
    return {
        id: "password-recovery-throttle",
        hooks: {
            before: [
                {
                    matcher: (ctx: { path?: string }) => ctx.path === ISSUE_PATH,
                    handler: createAuthMiddleware(async ctx => {
                        const email = extractEmail(ctx.body);
                        if (email) await store.onChallengeIssued(email);
                    }),
                },
                {
                    matcher: (ctx: { path?: string }) => GUESS_PATHS.has(ctx.path ?? ""),
                    handler: createAuthMiddleware(async ctx => {
                        const email = extractEmail(ctx.body);
                        if (!email) return;

                        // Mutual exclusion first: at most one guess/redemption per email may
                        // reach better-auth at a time, closing the concurrency races (Contract
                        // 5, Contract 12) at the source instead of trying to out-count them.
                        const claimed = await store.claimInFlight(email);
                        if (!claimed) {
                            throw new APIError("TOO_MANY_REQUESTS", {
                                code: "RECOVERY_THROTTLED",
                                message: "Outra verificação já está em andamento para este email. Aguarde e tente novamente.",
                                retryAfterSeconds: Math.ceil(IN_FLIGHT_MS / 1000),
                            });
                        }

                        // better-auth's own runBeforeHooks re-throws unconditionally and
                        // before-hooks never reach an `after` counterpart on their own thrown
                        // errors — so a raw (non-APIError) fault here, e.g. a DB outage, would
                        // otherwise leak this claim until its 5s TTL. Release explicitly on any
                        // unexpected throw. Found by Fase C adversarial review, confirmed with a
                        // fault-injecting store.
                        let result: RecoveryThrottleResult;
                        try {
                            result = await store.recordGuess(email);
                        } catch (err) {
                            await store.releaseInFlight(email);
                            throw err;
                        }
                        if (!result.allowed) {
                            await store.releaseInFlight(email);
                            throw new APIError("TOO_MANY_REQUESTS", {
                                code: "RECOVERY_THROTTLED",
                                message: "Muitas tentativas de recuperação de senha. Tente novamente mais tarde.",
                                retryAfterSeconds: result.retryAfterSeconds,
                            });
                        }
                    }),
                },
            ],
            after: [
                {
                    matcher: (ctx: { path?: string }) => GUESS_PATHS.has(ctx.path ?? ""),
                    handler: createAuthMiddleware(async ctx => {
                        const email = extractEmail(ctx.body);
                        if (!email) return;
                        // The in-flight TTL is also a safety net, so releasing here (or not,
                        // if this hook doesn't run on every error path) never leaves a
                        // permanent lock.
                        await store.releaseInFlight(email);

                        if (ctx.path === REDEMPTION_PATH) {
                            const returned = ctx.context?.returned as { success?: boolean } | undefined;
                            if (returned?.success) {
                                // The recovery genuinely completed — clear the throttle so a
                                // legitimate returning user isn't left blocked by their own
                                // earlier failed guesses.
                                await store.resetOnSuccess(email);
                            }
                        }
                    }),
                },
            ],
        },
    };
}
