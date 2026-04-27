# RAG Chat — Design Spec

**Branch:** `feat/RAGChat`
**Author:** PP7IA team
**Date:** 2026-04-24
**Status:** Pending user review. **No production deploy** until manually tested in local/dev environment.

---

## 1. Goal

Add an AI chat assistant to the Portal-PP7IA homepage that answers user questions about the mini-livros collection ("Enquanto é Tempo") using Retrieval-Augmented Generation (RAG) over the mini-livros corpus.

The assistant must:

- Be available on the homepage (`/`) only for v1, expandable to other pages later via configuration.
- Be visible to all visitors (logged in or not) but only call the RAG pipeline for authenticated users.
- Show a friendly Portuguese-language login prompt to unauthenticated users instead of making LLM/embedding API calls.
- Cite the specific volume + chapter that backs each answer.
- Run on a swappable LLM provider (Gemini default, Groq adapter as a stub, OpenRouter / Claude / etc. addable later) without UI changes.
- Use Postgres + `pgvector` for the vector store (portable to self-hosted Postgres in the future).

## 2. Non-goals (v1)

- Indexing other content sources (biblioteca, portal_news, editorial, PDFs/HTMLs in `frontend/public`). Schema is designed to support these, but no adapters ship in v1.
- Persistent chat history. Schema (`chat_sessions`, `chat_messages`) lives behind a feature flag; the migration is held back until the flag is enabled.
- User-facing model selector. Provider is env-driven only.
- Admin analytics dashboard for chat usage. Lightweight `console.log` events to Vercel logs are sufficient for v1.
- Any production deploy. Implementation must be tested locally by the project owner before going live.

## 3. Architecture

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Browser (/)    │     │  Next.js route handlers  │     │  Postgres +     │
│                 │     │  (frontend/app/api/chat) │     │  pgvector       │
│  ChatBubble ────┼─────┤                          │     │                 │
│  ChatPanel      │     │  POST /api/chat/message  │────▶│  rag_chunks     │
│  (bubble-       │     │   1. auth check          │     │  rag_usage      │
│   anchored)     │◀────┤   2. rate-limit check    │◀────┤  (chat_messages │
│                 │ SSE │   3. embed query         │     │   flagged off)  │
│                 │     │   4. SELECT top-K chunks │     │                 │
│                 │     │   5. stream LLM answer   │     └─────────────────┘
│                 │     │      via LLMProvider     │
│                 │     │      adapter             │     ┌─────────────────┐
│                 │     │                          │     │  Gemini API     │
│                 │     │  POST /api/chat/reindex  │────▶│  - embeddings   │
│                 │     │   (admin only)           │     │  - generation   │
│                 │     │                          │     │  (Groq via env) │
│                 │     └──────────────────────────┘     └─────────────────┘
```

### 3.1 Layer responsibilities

| Layer | Path | Responsibility |
|---|---|---|
| UI | `frontend/components/chat/` | `ChatBubble`, `ChatPanel`, message components, citations, error states |
| Presentation | `frontend/presentation/chat/` | `useChat` hook, SSE consumer, message state |
| API | `frontend/app/api/chat/` | Route handlers: `message` (POST, SSE), `reindex` (POST, admin) |
| Domain | `frontend/domain/chat/` | `LLMProvider`, `EmbeddingProvider`, `ContentSource` interfaces; `Message`, `RagAnswer`, `Chunk` types |
| Infrastructure | `frontend/infrastructure/chat/` | `GeminiProvider`, `GroqProvider` (stub), `MiniLivrosContentSource`, `HtmlChunker`, `RagChunkRepository`, `RateLimitRepository` |
| Auth abstraction | `frontend/infrastructure/auth/getUser.ts` | Single point of access to the authenticated user — isolates `@supabase/ssr` so swap is one file |

This mirrors the existing `domain/`, `infrastructure/`, `presentation/` split already in the codebase.

## 4. Data model

### 4.1 v1 migration (applied immediately)

`supabase/migrations/20260424000000_rag_chat.sql`

```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Indexed corpus chunks (corpus is mini_livros for v1; schema supports more sources)
CREATE TABLE rag_chunks (
  id           bigserial PRIMARY KEY,
  source_type  text NOT NULL,        -- 'mini_livro' (v1)
  source_id    uuid NOT NULL,        -- references mini_livros.id (no FK constraint to keep schema portable)
  chunk_index  int  NOT NULL,        -- 0-based order within source
  content      text NOT NULL,        -- raw chunk text
  embedding    vector(3072) NOT NULL,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
                                     -- { heading_path, slug, title, char_start, char_end }
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX rag_chunks_embedding_hnsw
  ON rag_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX rag_chunks_source ON rag_chunks (source_type, source_id);

-- Per-user daily rate limit
CREATE TABLE rag_usage (
  user_id    uuid NOT NULL,
  usage_date date NOT NULL DEFAULT current_date,
  count      int  NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

-- RLS (Supabase-only, ignored on self-hosted)
ALTER TABLE rag_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY rag_usage_self ON rag_usage FOR ALL USING (user_id = auth.uid());
-- rag_chunks: no RLS — admin-managed corpus, world-readable for any logged-in user via API
```

### 4.2 Held-back history migration (NOT applied in v1)

A second migration file `20260424000001_rag_chat_history.sql` is committed to the repo but **omitted from the v1 migration apply step** until the feature flag `NEXT_PUBLIC_CHAT_HISTORY=true` is enabled. Practical handling: keep the file under `supabase/migrations/` with a leading `_` prefix or in a `pending/` subdirectory so the Supabase CLI does not pick it up automatically — the exact mechanism is decided at implementation time. It adds:

```sql
CREATE TABLE chat_sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE chat_messages (
  id         bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('user','assistant')),
  content    text NOT NULL,
  citations  jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_session ON chat_messages (session_id, created_at);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_sessions_self ON chat_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY chat_messages_self ON chat_messages FOR ALL
  USING (session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid()));
```

### 4.3 Embedding model

- **Model:** `gemini-embedding-001` (Google AI Studio).
- **Dimension:** 3072 (full, not truncated). Mini-livros corpus is small enough that storage and HNSW build cost are trivial; full dimension preserves retrieval quality.
- **Why over `text-embedding-004`:** newer Google model, top of MTEB multilingual leaderboard, better PT-BR performance, same API key as the LLM (single Gemini key for embed + generate = simpler ops).
- **Why over OpenAI / Cohere:** no second vendor, no extra API key, free tier on Gemini covers educational portal scale.

## 5. Indexing pipeline

### 5.1 Trigger

Manual only. Admin user clicks "Reindexar mini-livros" in `/painel-admin`. The button POSTs to `/api/chat/reindex`. Synchronous response (corpus is small; expected duration < 30s).

### 5.2 Flow

1. Fetch all rows from `mini_livros` (id, title, slug, content_html or storage_url).
2. For each row:
   - Strip HTML to clean text. Use `cheerio` to parse and walk the DOM (small dep, robust against malformed HTML — preferred over hand-rolled regex). Collect a `heading_path` stack as we descend (h1 → h2 → h3).
   - Chunk by heading boundaries. Each h2/h3 starts a new chunk. If a chunk exceeds 800 tokens, split with 100-token overlap. If a chunk is under 100 tokens, merge with the next.
   - Output: `[{ source_id, chunk_index, content, metadata: { heading_path, slug, title, char_start, char_end } }]`.
3. Batch-embed: 100 chunks per Gemini API call (embedding API supports batching).
4. In a single transaction:
   - `DELETE FROM rag_chunks WHERE source_type='mini_livro';`
   - `INSERT` all new chunks.
5. Return `{ chunks_indexed, books_processed, duration_ms }`.

### 5.3 Why DELETE-then-INSERT (instead of upsert by content hash)

- Simpler. Mini-livros corpus is small; full re-embedding takes seconds.
- Avoids stale chunks when content shrinks (a hash-based upsert leaves orphaned chunks behind).
- Wrapped in a transaction, so torn state is impossible.

### 5.4 Failure handling

- API timeout or rate limit: return 503, transaction rolls back, no partial write.
- Bad HTML in one mini-livro: log the failure, skip that row, continue indexing the others, report skips in the response payload.

### 5.5 Files

```
frontend/app/api/chat/reindex/route.ts
frontend/domain/chat/ContentSource.ts
frontend/domain/chat/Chunk.ts
frontend/infrastructure/chat/MiniLivrosContentSource.ts
frontend/infrastructure/chat/HtmlChunker.ts
frontend/infrastructure/chat/EmbeddingProvider.ts
frontend/infrastructure/chat/GeminiEmbeddingProvider.ts
frontend/infrastructure/chat/RagChunkRepository.ts
frontend/components/admin/ReindexButton.tsx
```

## 6. Retrieval + generation

### 6.1 Endpoint

`POST /api/chat/message`

Request body:
```json
{ "messages": [{ "role": "user|assistant", "content": "..." }, ...] }
```
Client sends only the last 6 messages of the current session.

Response: `text/event-stream` (SSE).

SSE event types:
- `{ "type": "token", "content": "..." }` — streamed answer fragment
- `{ "type": "done", "citations": [{ slug, title, heading_path, similarity }] }` — final event with structured citations
- `{ "type": "error", "code": "auth_required|rate_limit|server_error", "message": "<PT-BR text>" }`

### 6.2 Flow

1. **Auth gate.** Read user via `getUser()`. If absent, send `{ type: "error", code: "auth_required", message: "Por favor, faça login para utilizar o chat." }` and close. **Zero embedding/LLM calls — costs nothing.**
2. **Rate limit.** `SELECT count FROM rag_usage WHERE user_id=$1 AND usage_date=current_date`. If `count >= 30`, send `{ type: "error", code: "rate_limit", message: "Limite diário atingido (30 mensagens). Volte amanhã." }` and close.
3. **Embed query.** Take the last user message. Call Gemini embedding API.
4. **Retrieve top-K.**
   ```sql
   SELECT id, content, metadata,
          1 - (embedding <=> $1::vector) AS similarity
   FROM rag_chunks
   WHERE source_type = 'mini_livro'
   ORDER BY embedding <=> $1::vector
   LIMIT 6;
   ```
   Filter chunks with `similarity < 0.55`. If zero pass, stream a short "no-match" answer and close (no LLM call). The no-match text is fixed: `"Não encontrei isso nos mini-livros. Tente reformular ou explore a biblioteca completa."`
5. **Build prompt.** System + context + history + question (see 6.4).
6. **Stream generation** via `LLMProvider.streamGenerate(...)`. Yield tokens as SSE `token` events.
7. **On stream complete**, send `done` event with citations and (asynchronously, fire-and-forget) increment `rag_usage`:
   ```sql
   INSERT INTO rag_usage (user_id, usage_date, count) VALUES ($1, current_date, 1)
   ON CONFLICT (user_id, usage_date) DO UPDATE SET count = rag_usage.count + 1;
   ```

### 6.3 LLMProvider interface

```ts
// frontend/domain/chat/LLMProvider.ts
export interface LLMProvider {
  streamGenerate(input: {
    system: string;
    context: string;
    history: Message[];
    question: string;
  }): AsyncIterable<string>;  // yields token chunks
}
```

Implementations:
- `GeminiProvider` — `gemini-2.5-flash` via `@google/generative-ai` SDK. Default.
- `GroqProvider` — stub written but disabled by default. Selected via `LLM_PROVIDER=groq`.

Selection helper:
```ts
function getLLMProvider(): LLMProvider {
  return process.env.LLM_PROVIDER === 'groq'
    ? new GroqProvider(process.env.GROQ_API_KEY!)
    : new GeminiProvider(process.env.GEMINI_API_KEY!);
}
```

### 6.4 Prompt template

```
SYSTEM:
Você é assistente do Portal-PP7IA. Responda APENAS com base nos trechos
fornecidos do livro 'Enquanto é Tempo'. Se a resposta não estiver nos
trechos, diga que não encontrou. Sempre cite o capítulo. Responda em
português brasileiro.

CONTEXT:
[Trecho 1 — Capítulo X — Seção Y]
<chunk content>
---
[Trecho 2 — ...]
<chunk content>
---
...

HISTORY:
user: <prev question>
assistant: <prev answer>
... (last 5 turns max)

USER:
<current question>
```

### 6.5 Why a similarity threshold of 0.55

- Cosine similarity below ~0.55 typically means the chunk is not really about the question.
- Without the threshold, retrieval always returns *something*, leading the LLM to hallucinate from irrelevant context.
- Tuned for Gemini embeddings; adjustable via env var `RAG_MIN_SIMILARITY`.

### 6.6 Citations format

Returned in the `done` SSE event as an array of structured citations. UI renders them as a bullet list under the assistant message:

```
📖 Fontes:
  • Capítulo 2 — Tipos de IA          → /mini-livros/<slug>#tipos-de-ia
  • Capítulo 1 — O que é IA           → /mini-livros/<slug>#o-que-e-ia
```

Each link jumps to the specific heading anchor inside the mini-livro page.

### 6.7 Files

```
frontend/app/api/chat/message/route.ts
frontend/domain/chat/LLMProvider.ts
frontend/domain/chat/Message.ts
frontend/domain/chat/RagAnswer.ts
frontend/infrastructure/chat/GeminiProvider.ts
frontend/infrastructure/chat/GroqProvider.ts        # stub, ships disabled
frontend/infrastructure/chat/RateLimitRepository.ts
frontend/infrastructure/auth/getUser.ts             # auth abstraction
frontend/lib/sse.ts                                  # SSE helpers
```

## 7. UI

### 7.1 Mounting

`frontend/app/page.tsx` renders `<ChatBubble />` via `next/dynamic({ ssr: false })`. Chat is client-only, no need to ship in SSR HTML. Other pages do not mount it in v1.

### 7.2 Component tree

```
<ChatBubble>                          # floating button bottom-right
  ├─ pulses subtly (decorative ring); LocalStorage flag dismisses initial pulse after first open
  ├─ click → toggles ChatPanel
  └─ <ChatPanel open={open}>          # bubble-anchored, ~380px wide × 480px tall
        ├─ <ChatHeader>               # avatar + "Assistente PP7IA" + status pill + close X
        ├─ <ChatMessages>             # scrollable, auto-scroll on new
        │     ├─ <MessageBubble bot>  # greeting (initial)
        │     ├─ <MessageBubble user>
        │     ├─ <MessageBubble bot>  # streaming dots → tokens → citations
        │     │     └─ <Citations citations={...} />
        │     └─ <ErrorBubble>        # auth/rate-limit errors
        ├─ <ChatInput>                # textarea + send button
        │     └─ disabled while streaming
        └─ <Disclaimer>               # "Respostas baseadas no livro · X/30 mensagens hoje"
```

### 7.3 State (`useChat` hook)

```ts
const {
  messages,        // Message[] in current session, ephemeral
  isStreaming,     // true while SSE is active
  error,           // 401/429/network — shown as ErrorBubble
  send,            // (text) => starts SSE, appends user msg + streaming bot msg
  reset,           // clears messages, resets to greeting
  isOpen, toggle,  // panel open state
} = useChat();
```

- `messages` lives in component state. **No persistence in v1.** Refresh = fresh session.
- `send()` calls `fetch('/api/chat/message', { method: 'POST', body: { messages: last6 } })`, reads the ReadableStream, parses SSE events, mutates the streaming bot message in place per token.
- On `auth_required` error, `ErrorBubble` renders an "Entrar" button that opens the existing `AuthModal` from `context/ModalsProvider`.

### 7.4 Visual style

Pulled from `frontend/app/globals.css` (PP7IA design system v3.0 "Menos ruído. Mais clareza."):

- **Default mode:** light. Dark mode supported via existing `next-themes` integration.
- **Brand palette:** blue gradient (`--brand-blue` `#1d4ed8`, `--brand-blue-2` `#3b82f6`) for the bubble, user message background, and send button. Glass surfaces (`--surface-glass` `rgba(255,255,255,0.82)`) for the panel and bot messages. Navy text (`--text-primary` `#162338`).
- **Bubble:** 56×56 px, gradient background, soft pulse ring (CSS animation), `lucide-react` `MessageCircle` icon, white border for "lifted" feel.
- **Panel:** `--radius-card` (24px) outer, `--radius-lg` (16px) message corners, `--shadow-xl` for depth, `backdrop-filter: blur(12px)`. Max 380 px wide on desktop; full-width minus 16 px on mobile (< sm).
- **Messages:** user = right-aligned blue gradient bubble with subtle blue glow; bot = left-aligned white card with border. Streaming = trailing animated cursor `▍`.
- **Open animation:** scale + fade + translate from bubble corner. Plain CSS transform (no Framer Motion — not in deps).
- **Mobile:** below `sm` breakpoint, panel becomes near-fullscreen sheet (top-12 to bottom-16, left/right-2). Bubble stays anchored.

### 7.5 Accessibility

- Bubble: `<button aria-label="Abrir chat assistente">`.
- Panel: `<dialog>` (or div with `role="dialog"`), focus trap, Esc closes, focus returns to bubble on close.
- Message list: `role="log" aria-live="polite"` so screen readers announce streamed tokens.
- Input: `<textarea>` with submit on Enter, Shift+Enter for newline.

### 7.6 Files

```
frontend/components/chat/ChatBubble.tsx
frontend/components/chat/ChatPanel.tsx
frontend/components/chat/ChatHeader.tsx
frontend/components/chat/ChatMessages.tsx
frontend/components/chat/MessageBubble.tsx
frontend/components/chat/Citations.tsx
frontend/components/chat/ErrorBubble.tsx
frontend/components/chat/ChatInput.tsx
frontend/components/chat/Disclaimer.tsx
frontend/components/chat/index.ts
frontend/presentation/chat/useChat.ts
frontend/presentation/chat/sseClient.ts
frontend/lib/chat/messages.ts                      # Message type + helpers
```

## 8. Configuration

### 8.1 Environment variables

Added to `.env.example` and a section in `docs/setup/`:

```bash
# === RAG Chat ===
# Provider selection: 'gemini' (default) | 'groq'
LLM_PROVIDER=gemini

# Gemini API key (used for embeddings + generation)
# Get at: https://aistudio.google.com/apikey
GEMINI_API_KEY=

# Groq API key (only required if LLM_PROVIDER=groq)
# Get at: https://console.groq.com/keys
GROQ_API_KEY=

# Model overrides (optional, defaults applied in code)
GEMINI_GENERATION_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001

# Retrieval tuning
RAG_TOP_K=6
RAG_MIN_SIMILARITY=0.55

# Rate limit
RAG_DAILY_LIMIT=30

# History feature flag (off until table migration applied)
NEXT_PUBLIC_CHAT_HISTORY=false

# Master switch for the whole feature (rollback toggle)
NEXT_PUBLIC_CHAT_ENABLED=true
```

### 8.2 Vercel function config

```ts
// frontend/app/api/chat/message/route.ts
export const runtime = 'nodejs';   // pgvector queries need Node runtime
export const maxDuration = 30;     // SSE streams can run up to 30s
```

### 8.3 Admin gate for reindex

`/api/chat/reindex/route.ts` reuses the auth/role-check pattern already in use under `app/api/admin/users/`. Do not invent a new pattern — copy the existing one.

## 9. Observability

Lightweight v1 only:

- `console.log` JSON-shaped events in route handlers:
  ```json
  {"event":"chat.message","user_id":"...","ms":1240,"tokens_in":1320,"tokens_out":210,"top_k":6,"min_sim":0.62,"status":"ok"}
  {"event":"chat.reindex","books":7,"chunks":142,"ms":4200,"status":"ok"}
  ```
- Vercel logs only. No Datadog, no Sentry. Add when an actual incident demands it.

## 10. Cost ceiling

- Gemini Flash free tier: 250 requests/day per key. 30 msg/user × 8 active users/day = 240 → safely within free tier.
- If exceeded: paid pricing is ~$0.075/M input tokens, ~$0.30/M output. Even at 50k requests/day, total stays under ~$5/month.
- Embedding API is only called on reindex (~once per week or less). Free tier covers easily.

## 11. Testing

Existing test layers per `TESTES.md`:

- **Vitest unit tests:**
  - `HtmlChunker` — heading-based split correctness, oversize splitting with overlap, undersize merging.
  - Prompt builder — context formatting, history truncation, system message injection.
  - Similarity threshold filter — chunks above/below cutoff handled correctly.
- **Vitest integration tests:**
  - `RagChunkRepository` against a local Postgres + pgvector (use Supabase local CLI to bring up a test database).
  - `RateLimitRepository` ON CONFLICT increment behavior.
- **Playwright e2e** (existing project, add new spec file):
  - Happy path: logged in user → opens chat → asks question → sees streamed answer → sees citations linking to real `/mini-livros/<slug>` pages.
  - Auth path: anonymous user → opens chat → sends message → sees PT-BR login prompt → clicks "Entrar" → `AuthModal` opens.
  - Rate limit path (mockable): user at 30/30 → sends message → sees daily-limit message.
- Skip mobile e2e for v1; add later if needed.

## 12. Dev validation plan (no production deploy)

Validation runs against a **separate Supabase dev project** (`pp7ia-dev`), not local Docker Supabase and not prod. The dev project mirrors prod schema + a copy of the `mini_livros` content. The local Next.js app (`pnpm dev` from `frontend/`) points at the dev project via `frontend/.env.local`.

### 12.1 Dev project bring-up (one-time)

1. Create `pp7ia-dev` Supabase project. Note the project ref (16-char ID from `https://supabase.com/dashboard/project/<REF>`).
2. From repo root: `cd supabase && supabase link --project-ref <DEV_REF>`.
3. **Sync schema to dev** — choose one path:
   - **Clean migration path (preferred long-term):** `supabase db reset --linked` wipes dev and applies all 16 repo migrations from scratch. Includes all GRANTs and RLS policies correctly.
   - **Quick dump path (used initially):** `pg_dump --data-only --table=public.mini_livros` from prod, restore via `psql` to dev. Faster, but `pg_dump` schema-only restore can omit schema-level grants on newer Supabase projects (2024+ default lock down `public` for `anon`).
4. **If quick dump path was used and "permission denied for schema public" appears** in the app, re-grant manually in dev SQL Editor:
   ```sql
   GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
   ```
   Verify policies transferred: `SELECT count(*) FROM pg_policies WHERE schemaname='public'` should match prod policy count.
5. Create test users via Supabase Studio → Authentication → Users:
   - `admin@test.local` — grant admin role using whatever pattern `app/api/admin/users/` already enforces.
   - `user@test.local` — normal user.
6. Wire `frontend/.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<dev URL>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<dev anon>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<dev anon>
   SUPABASE_SERVICE_ROLE_KEY=<dev service role>
   GEMINI_API_KEY=<your Gemini key>
   ```
7. From `frontend/` dir (not repo root — root has no scripts): `pnpm install && pnpm dev`. App boots at `http://localhost:3000`, hits dev DB.

### 12.2 RAG validation flow (per branch / per change)

1. Apply the new RAG migration to dev: `cd supabase && supabase db push` (paste DB password). Adds `rag_chunks` + `rag_usage` to dev only.
2. Sign in as `admin@test.local`.
3. Visit `/painel-admin` → click "Reindexar mini-livros" → verify the response payload reports correct chunk counts, and that `rag_chunks` is populated (`SELECT count(*), source_type FROM rag_chunks GROUP BY source_type` from dev SQL Editor).
4. Visit `/` while logged in as the admin or normal user. Open chat → ask 3 representative questions → verify:
   - Tokens stream visibly.
   - Citations appear and links resolve to real `/mini-livros/<slug>` pages with correct anchors.
   - Counter in disclaimer updates after each message.
5. Sign out. Open chat → send a message → confirm:
   - PT-BR login prompt appears.
   - "Entrar" button opens `AuthModal`.
   - Server logs show no embedding or LLM API call was made (the auth gate cut it off before any external request).
6. Hit rate limit by sending 30 messages as one user → confirm 31st returns the friendly limit message and no LLM call occurred.
7. Run `pnpm test` and `pnpm test:e2e` from `frontend/` and verify they pass.
8. Hand off for project owner review before any prod deploy.

**Production deploy is explicitly out of scope of this spec.** When approved, prod deploy steps (apply migration to prod Supabase, add env vars to Vercel, merge PR, run reindex) will be handled as a separate change with its own checklist.

### 12.3 Prod deploy ordering (when authorized later)

Apply schema before code, never the reverse — reverse order means brief window where deployed app references tables that don't exist yet → 500s for users.

1. Apply `20260424000000_rag_chat.sql` to prod Supabase via `supabase db push --linked` (linked to prod project at that moment). Tables created, unused, harmless.
2. Add prod env vars to Vercel project settings (`GEMINI_API_KEY`, etc.) with `NEXT_PUBLIC_CHAT_ENABLED=false` initially.
3. Merge `feat/RAGChat` → main → Vercel deploys. `<ChatBubble />` hidden via flag.
4. Login to prod as admin → `/painel-admin` → click "Reindexar mini-livros". Verify chunk counts.
5. Smoke test by toggling flag to `true` for one session (incognito) — confirm chat works on prod.
6. Flip `NEXT_PUBLIC_CHAT_ENABLED=true` permanently. Trigger Vercel redeploy.

## 13. Rollback

Set `NEXT_PUBLIC_CHAT_ENABLED=false` in Vercel project settings → `<ChatBubble />` returns `null`. Schema stays in place; no destructive rollback required. The next time the feature is re-enabled, no re-indexing is needed unless the corpus changed.

## 14. Future expansion (v2+, out of scope here)

- Add `BibliotecaContentSource`, `PortalNewsContentSource`, etc. — register them and re-run reindex. No schema change.
- Enable `NEXT_PUBLIC_CHAT_HISTORY=true` and apply `20260424000001_rag_chat_history.sql`. UI gains "Recent conversations" pane.
- Mount `<ChatBubble />` on additional routes by adding it to the corresponding page components or to the root `layout.tsx` with a route allowlist.
- Add `GroqProvider` wiring + maybe an admin-only model picker for A/B testing answer quality.
