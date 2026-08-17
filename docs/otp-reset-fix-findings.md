# Password reset OTP fix — investigation notes (2026-08-15)

Context: fixed a bug where the password-reset flow accepted any OTP code and
advanced to the "new password" screen without validating it
(`fix/reset-password-otp-validation`). This document records issues found
along the way that are **not** part of that fix and remain open.

## Root cause of the fixed bug

`BetterAuthRepository.verifyPasswordResetOTP`
(`frontend/infrastructure/repositories/BetterAuthRepository.ts`) cached the
email/code locally and returned successfully unconditionally — it never
called better-auth to validate the OTP. Real validation only happened later,
inside `resetPasswordWithOTP`, after the UI had already moved the user to
the new-password step. Fixed by calling better-auth's non-consuming
`authClient.emailOtp.checkVerificationOtp` endpoint at the verify step.

## Unrelated issues found (not fixed here)

### 1. `TOO_MANY_ATTEMPTS` has no dedicated error mapping

`BetterAuthRepository.mapError` now maps better-auth's `INVALID_OTP` and
`OTP_EXPIRED` codes to `InvalidOTPError` / `OTPExpiredError`, but not
`TOO_MANY_ATTEMPTS` (thrown by better-auth's `emailOTP` plugin after 3 failed
attempts). It falls through to the generic `UnknownAuthError` ("Ocorreu um
erro inesperado. Tente novamente"), which is misleading — the user hit a rate
limit, not an unexpected error. Worth adding a dedicated
`TooManyOTPAttemptsError` with a message like "Muitas tentativas. Solicite um
novo código." in a follow-up.

### 2. Legacy `/reset-password` page is past its removal date

`frontend/app/reset-password/page.tsx` carries:

```
// TODO: Remove this page after 2026-04-22 (60 days post-migration)
```

Today is 2026-08-15 — this is ~4 months past the planned removal date and
the page (with its `isLegacyLink` deprecation-notice branch for old
`resetToken`/`access_token`/`refresh_token` links) is still in the codebase.
Worth confirming no legacy links are still in circulation and removing it.

### 3. Pre-existing lint issues (46 problems: 14 errors, 32 warnings)

Confirmed via `git stash` that these exist identically before and after this
fix — none introduced by it. Full list from `pnpm lint`:

**Errors (`@typescript-eslint/no-explicit-any`, `react/no-unescaped-entities`)**
- `app/axioma/upload/page.tsx:31,59`
- `components/axioma/AudioAnswerButton.tsx:17,22(x2),32,50,92,102` — plus two
  `react/no-unescaped-entities` at `172:20`, `172:30`
- `components/axioma/QuestionnaireFlow.tsx:114`
- `components/axioma/ReportView.tsx:57`
- `lib/axioma/pdf-utils.ts:195`

**Warnings (`@typescript-eslint/no-unused-vars` unless noted)**
- `__tests__/chat/answerWithMarkers.test.ts:8`
- `app/explorar/ExplorarClient.tsx:490`
- `app/explorar/blocks.tsx:579,666,888` — `@next/next/no-img-element`
- `app/layout.tsx:80` — `@next/next/no-css-tags`
- `app/page.tsx:36,53,55` — plus `136:29` `@next/next/no-img-element`
- `app/user/page.tsx:19,20,23`
- `components/AnnouncementBar.tsx:72` — `@typescript-eslint/no-unused-expressions`
- `components/BentoGridIAS.tsx:3,13(x2)`
- `components/BentoGridMiniLivros.tsx:409` — `@next/next/no-img-element`
- `components/BookCard.tsx:44` — `@next/next/no-img-element`
- `components/SearchModal.tsx:623` — `jsx-a11y/role-has-required-aria-props`
- `components/admin/AdminMiniLivroSections.tsx:30,35`
- `components/axioma/QuestionnaireFlow.tsx:52` — unused eslint-disable
- `components/home/NewsletterForm.tsx:9`
- `context/FirstVisitModalContext.tsx:28`
- `infrastructure/chat/GroqProvider.ts:9,12,13`
- `infrastructure/repositories/BetterAuthRepository.ts:149` —
  `_newPassword` unused param on the deprecated `resetPasswordWithToken`
  stub (predates this fix)
- `infrastructure/repositories/PostgresUserManagementRepository.ts:151`

None of these block `pnpm test` or `pnpm run build` today, but they're a
growing pile worth a dedicated lint-cleanup pass.

### 4. Stale `.next/types` cause spurious `tsc --noEmit` errors

Running `pnpm exec tsc --noEmit` directly reports `TS2307: Cannot find
module` for `.next/types/app/api/admin/content-options/route.ts`,
`.next/types/app/api/email/unsubscribe/route.ts`, and
`.next/types/app/descadastro/page.ts`. These are generated Next.js route
type files pointing at build output that isn't present outside a full
`next build`; they are not real type errors in the source and disappear
after a clean build. Confirmed pre-existing (present with and without this
fix's changes). Only worth investigating if it starts tripping up CI.

## Pre-production gate closure (2026-08-16)

Ran the two gates flagged as outstanding in PR #117: the throttle's atomic
guarantees against real PostgreSQL (not just `getTestInstance`'s SQLite
backend), and the production rate limiter's IP resolution against Railway's
actual proxy topology. Both against the Railway `development` environment
(isolated Postgres instance, separate from `production`), never against
production data; all test rows used the `password-recovery-test-*@example.test`
pattern and were deleted afterward (confirmed zero remaining).

**Verdict: `APPROVED_WITH_NON_BLOCKING_NOTES`** (downgraded from an initial
`APPROVED_FOR_PRODUCTION` read — B8 below is only partially conclusive, so the
verdict is worded to match exactly what was empirically shown, not more).

Validated against real PostgreSQL 18.3 under concurrency (2+ rounds each,
20 concurrent operations where applicable): migration schema/idempotency,
atomic increment (no lost update), cross-challenge streak survival across
resend, protection after a fresh OTP is issued, mutex across independent
`pg.Pool` connections, per-identifier lock isolation, TTL self-recovery,
lock release on exception, 24h streak-age boundary (23:59:59 vs 24:00:01),
OTP encrypted at rest (`storeOTP:"encrypted"` compatible with
`resendStrategy:"reuse"`), single-use redemption, no-double-success under
concurrent correct-OTP redemption, and no cross-user contamination of
streak/lock/OTP state. No defect found — no code changes were needed.

Validated against the real Cloudflare → Railway edge → app topology on
`develop.pp7ias-portal.com.br`: rotating a spoofed `X-Forwarded-For` on every
request did not achieve reliable rate-limit bypass (a controlled back-to-back
A/B loop — same forged IP repeated 15x stayed unblocked, a different forged
IP on every one of 15 requests still got blocked once — is the opposite of
what a trusted, spoofable header would produce), and Railway's own HTTP
access log (`srcIp`) recorded the same real connecting IP regardless of what
`X-Forwarded-For` value was sent. The real rate limit (`X-Retry-After`
44–60s) was exercised and confirmed live.

### Follow-up 1 — Proxy/IP trust hardening (MEDIUM, before any proxy/infra topology change)

`lib/auth.ts` sets no `advanced.ipAddress`, so better-auth 1.6.9 falls back
to its default IP resolution: reads only `x-forwarded-for`, takes
`split(",")[0]` (the leftmost, client-suppliable entry), with no
trusted-proxy-count validation at all. The current safety against spoofing
comes from Railway sanitizing/replacing that header before the app sees it —
an implicit platform behavior, not something this codebase asserts. If the
app is ever moved behind a different proxy that passes the client's header
through unmodified, the same code becomes exploitable with no local test able
to catch it. Before changing proxy topology or migrating infrastructure: make
the trust chain explicit via better-auth's supported IP-resolution
configuration, then re-run the spoofing + multi-proxy-chain tests with at
least two genuinely distinct real client origins (this session only had one
real egress IP available).

### Follow-up 2 — Distributed rate limiter before scale-out (MEDIUM, before running >1 replica)

The generic per-IP rate limiter (`rateLimit.customRules` in `lib/auth.ts`)
uses in-memory storage — confirmed by the absence of any `rateLimit` table in
Postgres. Fine for the current single-replica deployment, but independent
in-memory counters per instance would silently weaken the 5-req/60s budget
under horizontal scale-out. Before running multiple replicas: move the
relevant rate-limit state to shared/distributed storage (or the equivalent
better-auth-supported mechanism), and prove that alternating between
instances doesn't refill the budget.

### Follow-up 3 — Migration numbering collision (LOW, before merging to develop)

This branch's `0021_password_recovery_throttle.sql` collides in numeric
prefix with `develop`'s own `0021_sync_homepage_texts.sql` (which already has
`0022`–`0024` after it). Filenames are unique so `_migrations` tracking isn't
affected, but the sequential-numbering convention breaks once both land in
the same directory. Renumber to follow the target branch's real sequence at
merge time; don't touch the SQL itself just to renumber.

### Follow-up 4 — `password_recovery_attempts` retention (LOW, housekeeping)

One row per email that has ever gone through recovery, no TTL/cleanup by
design. Not a correctness issue (expired `blocked_until`/`in_flight_until`
self-neutralize on next access), just unbounded growth with no cron
attached. Revisit retention/cleanup once real production volume makes it
worth doing — no need to add a job preemptively.

### Known, accepted (not open issues)

`same_password` isn't distinguished as its own error by better-auth in this
recovery flow; the specific per-endpoint rate-limit numbers are a product
decision, not a defect; IPv6 client resolution wasn't exercised (no IPv6
egress path available in this sandbox); Gate B8 (two genuinely distinct real
client IPs, not just spoofed headers) is only partially conclusive for the
same reason. Revisit if infrastructure or requirements change — none of
these block the current approval.
