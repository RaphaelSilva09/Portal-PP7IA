-- Application-level brute-force throttle for the password recovery (OTP) flow.
--
-- better-auth's emailOTP plugin (allowedAttempts) budgets attempts PER OTP
-- challenge (the `verification` row), not cumulatively across a recovery
-- process. Empirically (see frontend/__tests__/integration/passwordRecoverySecurity.test.ts,
-- Contract 1 Scenario B), resendStrategy:"reuse" does not close the loophole
-- where a user who has already exhausted a challenge's attempts (without ever
-- submitting the differentiating call that crosses TOO_MANY_ATTEMPTS and
-- deletes the row) can resend and silently receive a brand-new 0-attempt
-- budget. This table tracks a cumulative, rolling-window budget keyed only by
-- the recovery identity (normalized email) — independent of any single OTP
-- challenge's lifecycle, so resending/rotating the code cannot reset it.
--
-- Also used as an atomic single-slot claim (in_flight_until) to serialize
-- concurrent redemption attempts for the same email, since better-auth's own
-- atomicVerifyOTP (delete-then-verify) is not actually safe under concurrent
-- requests (Contract 12: two simultaneous correct-OTP redemptions can both
-- succeed against the raw library).
CREATE TABLE IF NOT EXISTS public.password_recovery_attempts (
  email             TEXT PRIMARY KEY,
  attempt_count     INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until     TIMESTAMPTZ,
  in_flight_until   TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
