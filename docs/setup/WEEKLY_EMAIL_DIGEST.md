# Weekly Email Digest

The weekly digest sends pending items from `public.content_digest_queue` to users who:

- have `"emailVerified" = true`
- have an enabled `weekly_news` row in `public.communication_preferences`

Users who previously opted into `accept_email_updates` were backfilled into
`communication_preferences` by migration `0022_communication_preferences.sql`.
After that migration, `communication_preferences` is the source of truth for
weekly digest delivery; `accept_email_updates` is only the legacy consent signal
used for the initial backfill.

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
or `RAILWAY_GIT_BRANCH=main|master`. Delivery is always disabled on explicit non-production
Railway targets, including when `DIGEST_FORCE=1`; only a forced dry-run is allowed there.

The migration runner exits successfully in Railway environments named `*-pr-<number>` because
a fresh PR database does not contain the legacy content-table baseline. The digest start command
also exits as `skipped` there. Prefer Railway Focused PR Environments to avoid building the cron
service when a PR does not change it.

Required variables:

- `DATABASE_URL`
- `RESEND_API_KEY` or `INVITE_EMAIL_API_KEY`
- `EMAIL_FROM`
- `NEXT_PUBLIC_SITE_URL`

Optional variables:

- `DIGEST_DRY_RUN=1` logs recipients without sending.
- `DIGEST_FORCE=1` allows a manual run outside Wednesday; outside production it must be combined with `DIGEST_DRY_RUN=1`.
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

When the database uses Railway private networking, do not use `railway run`
alone: it injects variables but still executes locally. Open a tunnel to the
Postgres service, then run the dry-run with `DATABASE_URL` pointing to the
local tunnel.

```bash
railway connect Postgres \
  --project 821e127a-e7ce-4cc8-9c34-ba99d189ed59 \
  --environment development \
  --tunnel-only \
  --port 15432
```

In another terminal, use the printed tunnel credentials to run:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@127.0.0.1:15432/DB?sslmode=disable" \
DIGEST_DRY_RUN=1 \
DIGEST_FORCE=1 \
pnpm run digest:send
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
