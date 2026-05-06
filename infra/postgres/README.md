# Portal-PP7IA Postgres Image

Custom Postgres 16 + pgvector image for Railway deployment.

## What's inside

- **Base:** `pgvector/pgvector:pg16` (official upstream Postgres 16 + pgvector)
- **Locale:** `pt_BR.UTF-8` (proper accent sort/compare)
- **Timezone:** `America/Sao_Paulo` (server clock matches PT-BR ops)
- **Auto-installed extensions** on first boot:
  - `vector` — embeddings (RAG)
  - `pg_trgm` — fuzzy text search
  - `unaccent` — accent-insensitive search
- **Healthcheck:** `pg_isready` every 10s

`gen_random_uuid()` lives in Postgres 16 core — no `pgcrypto` needed.

## Layout

```
docker/
├── Dockerfile
├── README.md           ← this file
└── init/
    └── 00-extensions.sql   ← runs once on first boot via /docker-entrypoint-initdb.d/
```

## Deploy on Railway

### Path A — Railway builds from GitHub repo (recommended)

1. Push `infra/postgres/` to GitHub (already in the Portal-PP7IA repo).
2. Railway → New Service → "Deploy from GitHub repo" → select `Portal-PP7IA`.
3. Settings → "Root Directory" → `infra/postgres`
4. Settings → "Builder" → "Dockerfile"
5. **Variables** tab:
   ```
   POSTGRES_USER=portal
   POSTGRES_PASSWORD=<paste random — generate w/ openssl rand -base64 32>
   POSTGRES_DB=portal
   PGDATA=/var/lib/postgresql/data/pgdata
   ```
6. **Volumes** tab → New Volume:
   - Mount path: `/var/lib/postgresql/data`
   - Size: 5 GB (grow later w/o data loss)
7. **Networking** tab:
   - Private domain: enabled by default for service-to-service
   - **TCP Proxy:** enable on port 5432 — needed for `psql` from your laptop during migrations
8. Deploy. Wait green status.
9. Connection test:
   ```bash
   railway variables   # to see TCP_PROXY_DOMAIN + RAILWAY_TCP_PROXY_PORT
   psql "postgresql://portal:<password>@<TCP_PROXY_DOMAIN>:<TCP_PROXY_PORT>/portal?sslmode=require"
   \dx                 # confirm vector, pg_trgm, unaccent listed
   ```
10. Add to `frontend/.env.local`:
    ```
    DATABASE_URL=postgresql://portal:<password>@<TCP_PROXY_DOMAIN>:<TCP_PROXY_PORT>/portal?sslmode=require
    ```
    (For the Next.js app running on Railway, use the **private** hostname instead — no TCP proxy overhead.)

### Path B — Build locally + push to GHCR

```bash
cd infra/postgres
docker build -t ghcr.io/<your-gh-user>/portal-pg:1.0 .
docker push ghcr.io/<your-gh-user>/portal-pg:1.0
```

Then Railway → New Service → "Docker Image" → `ghcr.io/<your-gh-user>/portal-pg:1.0`.

Same env vars + volume + networking as Path A.

Path A is simpler: edit Dockerfile → push → Railway rebuilds. No registry juggling.

## Local dev (optional)

```bash
docker build -t portal-pg .
docker run --rm -d \
  -e POSTGRES_USER=portal \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=portal \
  -p 5432:5432 \
  -v portal-pgdata:/var/lib/postgresql/data \
  --name portal-pg \
  portal-pg

psql "postgresql://portal:devpass@localhost:5432/portal" -c '\dx'
```

## Upgrades

Bump `FROM pgvector/pgvector:pg16` to `pg17` when ready. Major-version Postgres upgrades require dump/restore — don't do casually.

For pgvector-only updates: bump tag (e.g. `pg16-0.8.0`), rebuild. Extension data files migrate automatically on `ALTER EXTENSION vector UPDATE;`.

## What auto-runs vs not

`/docker-entrypoint-initdb.d/*.sql` files run **only when data dir is empty** (first boot). After that, schema migrations come from `db/migrations/` via the app deploy. Don't add app schema here — keep this layer pure infra (extensions + locale).
