# Weekly Email Digest

The weekly digest sends pending items from `public.content_digest_queue` to users who:

- have `"emailVerified" = true`
- have `accept_email_updates = true`

## Schedule

Recommended send time: **Wednesday, 10:00 America/Sao_Paulo**.

Railway cron expression in UTC:

```txt
0 13 * * 3
```

Why this slot:

- Wednesday is strong for click-through engagement in multiple benchmarks.
- 10:00 BRT aligns with the common morning engagement peak and avoids the early inbox rush.
- Revisit after 10-15 campaigns with local open/click data; test 10:00 vs 16:00 if clicks become the main KPI.

## Railway Setup

Create a second Railway service from the same repo:

- Root directory: `/frontend`
- Build command: `pnpm run build`
- Start command: `pnpm run digest:send`
- Cron schedule: `0 13 * * 3`
- Environment: `production`

Automatic runs are enabled only when Railway reports `RAILWAY_ENVIRONMENT_NAME=production|prod`
or `RAILWAY_GIT_BRANCH=main|master`. On `develop`/`development`, the job exits as `skipped`
unless it is manually forced with `DIGEST_FORCE=1`.

Required variables:

- `DATABASE_URL`
- `RESEND_API_KEY` or `INVITE_EMAIL_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_SITE_URL`

Optional variables:

- `DIGEST_DRY_RUN=1` logs recipients without sending.
- `DIGEST_FORCE=1` allows a manual run outside Wednesday.
- `DIGEST_MAX_ITEMS=20` controls the maximum queued content items included in one digest.
- `DIGEST_SEND_INTERVAL_MS=125` spaces provider sends to stay under Resend rate limits.
- `DIGEST_RATE_LIMIT_RETRY_MS=1200` controls the delay before retrying provider rate-limit responses.

## Manual Run

From the frontend directory:

```bash
pnpm run digest:send
```

Dry run:

```bash
DIGEST_DRY_RUN=1 DIGEST_FORCE=1 pnpm run digest:send
```

## Idempotency

Each weekly run creates one row in `public.email_digest_runs` keyed by the local Wednesday date.
Recipients are tracked in `public.email_digest_deliveries`.

If the job is retried in the same week, users already marked as `sent` are skipped.
The queue rows are marked with `sent_at` only after all pending deliveries succeed.

## Queue Rollover

The job reads the oldest supported pending rows first and defaults to 20 items per digest.
If more than `DIGEST_MAX_ITEMS` rows are pending, the remainder stay in `content_digest_queue`
for the next successful digest run.
