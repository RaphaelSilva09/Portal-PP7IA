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
