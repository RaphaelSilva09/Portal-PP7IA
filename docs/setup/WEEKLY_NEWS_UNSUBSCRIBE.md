# Weekly News: Preferences & Unsubscribe

Source of truth, endpoints, headers, migration and operational notes for the
`weekly_news` communication preference — the "Novidades da semana" digest
(see `docs/setup/WEEKLY_EMAIL_DIGEST.md` for the send job itself).

## Model

`public.communication_preferences` (migration `0022_communication_preferences.sql`):

| column | meaning |
|---|---|
| `user_id` | FK to `"user"(id)`, `ON DELETE CASCADE` |
| `communication_type` | `'weekly_news'` today; `CHECK` constraint, extend when a second type is added |
| `enabled` | current subscription state — this is the only thing the job reads |
| `subscribed_at` / `unsubscribed_at` | set on the transition that caused them, never on a repeated no-op call |
| `last_changed_at` | bumped on every write, including no-op idempotent calls |
| `source` | `profile` \| `email_body` \| `email_header` \| `legacy_signup_migration` |

`UNIQUE (user_id, communication_type)`. **Absence of a row means "not
subscribed"** — rows are only created on an actual subscribe/unsubscribe
action or the migration backfill, never as placeholder negatives.

This table is deliberately independent of `"user".accept_email_updates` /
`accept_whatsapp_updates` (the general marketing-consent flags collected at
signup, still coupled to a "pick at least one channel" rule). Those are
untouched by this feature.

No Postgres RLS: this codebase has none (plain `pg` Pool, no Supabase). Every
route below authorizes in the handler — session-derived user id only, never
client-supplied.

## Migration of existing users

Users with `accept_email_updates = true` (an unchecked-by-default checkbox at
signup — real, explicit prior consent) were migrated to `weekly_news`
subscribed, `source = 'legacy_signup_migration'`. `subscribed_at` is left
`NULL` — the original consent timestamp was never recorded, and inventing one
would misrepresent the audit trail. `last_changed_at` records when the
migration ran. Everyone else starts unsubscribed (no row). Email verification
is **not** treated as a consent signal — it's applied separately as a
send-time eligibility filter in the job's recipient query.

## Endpoints

- `GET /api/user/preferences/weekly-news` — current state for the logged-in
  user. 401 without a session.
- `POST /api/user/preferences/weekly-news` `{ enabled: boolean }` —
  subscribe/unsubscribe, `source = 'profile'`. User id comes from the
  session; the request body cannot target another user.
- `POST /api/email/unsubscribe/weekly-news?token=...` — RFC 8058 one-click.
  No auth, no redirect, idempotent, `source = 'email_header'`. Requires
  `Content-Type: application/x-www-form-urlencoded` body
  `List-Unsubscribe=One-Click`; anything else is rejected without touching
  data. No `GET` handler exists on this route.
- `POST /api/email/unsubscribe/weekly-news/confirm` `{ token }` — the visible
  footer link's confirm action, `source = 'email_body'`. No auth.
- `GET /unsubscribe/weekly-news?token=...` — confirmation page. Rendering it
  **never** mutates anything; only the button's `POST` to `/confirm` does.
  This is intentional — anti-phishing scanners that prefetch links in emails
  must not be able to unsubscribe anyone by visiting a `GET` URL.

All three unsubscribe paths only ever set `enabled = false`. None of them can
subscribe or reactivate — that requires an authenticated `POST` to
`/api/user/preferences/weekly-news` from the profile.

## Token

`lib/email/unsubscribeToken.ts` — HMAC-SHA256, not a JWT. Payload is
`version.userId.communicationType`, base64url-encoded; signature appended.
No email address anywhere in the token. No expiry, by design — a digest
sitting unread in an inbox for months must still be able to unsubscribe.

Env vars:

- `UNSUBSCRIBE_TOKEN_SECRET` — required. The job refuses to send (and the
  unsubscribe endpoints refuse to verify) without it.
- `UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS` — optional. During secret rotation, set
  the old value here temporarily so tokens signed before rotation keep
  verifying; verification tries the current secret first, then this one.

## Job (`frontend/lib/email/weekly-digest.ts`)

Recipient query joins `communication_preferences` on
`communication_type = 'weekly_news' AND enabled = true`, filtered further by
`"emailVerified" = true`. Right before sending to each recipient (not just
once at the start of the run), the preference is re-checked — a cancel that
lands mid-run is honored instead of racing the send. A recipient who
unsubscribed between run-start and send-time is recorded as a failed
delivery with the message `"Cancelado antes do envio"`, which is what marks
the digest queue not-fully-sent and lets the same content roll into next
week's run — the same conservative retry behavior the job already had for
actual send failures.

Every outgoing email carries a per-recipient token, embedded both in the
visible footer link (HTML + plain text) and in the `List-Unsubscribe` /
`List-Unsubscribe-Post` headers.

## Removed: legacy Vercel cron route

`GET /api/cron/weekly-digest`, `frontend/vercel.json`, and
`lib/email/weeklyDigest.ts` (camelCase) were deleted — that was a pre-Railway
mechanism sending to a static `WEEKLY_DIGEST_RECIPIENTS` env-var list with no
preference check at all, and there is no longer an active Vercel deployment
of this project. `docs/sdd/09-digest-semanal.md` is kept as a historical
record with a superseded note at the top.

## Known gaps / deliberately out of scope

- **No Resend webhook / suppression handling.** Bounce and complaint events
  aren't processed anywhere in this codebase yet. Building that is a
  separate, clearly-scoped follow-up — don't bolt it onto this feature.
- **No dedicated marketing subdomain.** `EMAIL_FROM` is shared between
  transactional and the weekly digest today. Worth separating for
  deliverability/reputation isolation, but out of scope here since it wasn't
  broken by this change.
- SPF/DKIM/DMARC status was not independently re-verified as part of this
  change (see manual verification notes for what was and wasn't checked).
