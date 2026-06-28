# AGENTS.md

## Project context

Portal-PP7IA is a Next.js web portal for AI content (mini-livros, newsletters, biblioteca, editorial).
Frontend-only repo with Supabase as backend/auth and Vercel for hosting.
Clean architecture: domain → application → infrastructure → presentation → components.

## Tech stack

- Next.js 16.1.1 + React 19 + TypeScript (strict)
- Tailwind CSS v4, Lucide React, Tiptap v3, @dnd-kit
- Supabase (auth + PostgreSQL), @supabase/ssr
- TanStack React Query v5
- Resend (invite emails), Vercel Analytics
- Vercel (deploy via GitHub Actions webhook on push/PR merge)
- pnpm@10.33.0

## Important directories

All commands run from `frontend/`.

- `frontend/app/` — Next.js App Router pages and API routes (`/api/admin/*`, `/api/invite`, `/api/proxy-html/*`)
- `frontend/components/` — reusable React components
- `frontend/context/` — React contexts (auth, modals, session)
- `frontend/domain/` — entities, errors, repository interfaces (pure, no framework dependencies)
- `frontend/application/` — use cases (orchestration only, no I/O)
- `frontend/infrastructure/` — DI container, Supabase client, repositories
- `frontend/presentation/` — hooks and presentation logic
- `frontend/__tests__/` — Vitest unit/integration tests (organized by architecture layer)
- `frontend/e2e/` — Playwright E2E tests (auth flows)
- `supabase/migrations/` — PostgreSQL migrations (timestamp-prefixed)
- `docs/` — architecture docs, setup guides, RPC integration

## Commands

```bash
# install (from frontend/)
pnpm install

# development server
pnpm run dev

# production build (also runs TypeScript typecheck)
pnpm run build

# lint (ESLint — Next.js core-web-vitals + TypeScript)
pnpm lint

# unit + integration tests
pnpm test

# tests in watch mode
pnpm run test:watch

# coverage report (v8)
pnpm run test:coverage

# E2E tests (starts dev server automatically)
pnpm run test:e2e

# E2E mobile (Android Chrome + iOS Touch)
pnpm run test:e2e:mobile
```

## Architecture

Dependency direction is strictly outer → inner:

```
app pages / components
      ↓
presentation (hooks, UI logic)
      ↓
application (use cases — no I/O, orchestration only)
      ↓
domain (entities, errors, interfaces — pure TypeScript)
      ↑
infrastructure (Supabase, DI container, repositories — implements domain interfaces)
```

Never import `infrastructure` directly in UI components. Use application use cases via the DI container.

## Code style

- TypeScript strict mode — never suppress errors or use `as any` without a comment explaining why.
- Path alias `@/*` maps to `frontend/*`.
- Components: PascalCase. Hooks: `use` prefix. Files: match export name.
- No comments unless the WHY is non-obvious (hidden constraint, subtle invariant, workaround).

## Testing guidance

- **Unit/integration** (Vitest + jsdom): `__tests__/` organized by layer.
- **E2E** (Playwright): `e2e/` covering auth flows — Desktop Chrome, Android Chrome, iOS Touch.
- Domain: pure tests, zero mocks.
- Use cases: mock via interface (`satisfies Partial<IRepository>`), no `vi.mock()`.
- Infrastructure: inject mock Supabase client via constructor.
- Components/context/hooks: `vi.mock()` for external modules only.
- With `vi.useFakeTimers()`, use `vi.runAllTimersAsync()` inside `act()` — do not use `waitFor` (conflicts with fake timers).
- No coverage threshold configured.
- E2E base URL: `http://127.0.0.1:3000`; dev server starts automatically unless already running.
- E2E globalSetup (`e2e/global-setup.ts`) cria o perfil em `public.users` para o usuário de teste se ele não existir.
- `@example.com` e `@mailtest.dev` são rejeitados pelo Supabase como inválidos — usar `@test.com` para dominios de email de teste.
- **Testes de confirmação de email** (`auth-email-confirmation.spec.ts`) requerem Supabase local (`supabase start` com URL `http://127.0.0.1:54321`) porque o Mailpit local (`127.0.0.1:54324`) não recebe emails do Supabase cloud. Com Supabase cloud os 4 testes são pulados automaticamente (`test.skip`).

## Supabase rate limits (ambiente de desenvolvimento)

Limites do projeto Supabase de desenvolvimento — respeitar em testes E2E e scripts exclusivamente para banco remoto (desconsiderar para supabase local):

| Recurso | Limite |
|---|---|
| Envio de emails | **2 por hora** |
| Envio de SMS | 30 por hora |
| Refresh de tokens | 150 req / 5 min (1 800/h) |
| Verificação de tokens | 30 req / 5 min (360/h) |
| Usuários anônimos | 30 por hora |
| Sign-ups e sign-ins | 30 req / 5 min (360/h) |
| Sign-ups/ins Web3 | 30 req / 5 min |

**Impacto nos testes E2E:** com Supabase remoto (informações presentes no .env.local) os testes de confirmação de email enviam 2 emails por execução completa (1 do describe E2E + 1 do beforeAll cross-context). Não rodar múltiplas vezes na mesma hora.

Para testes com supabase local, tal limitação não se aplica e deve ser desconsiderada.

## Database and migrations

- Schema changes go in `supabase/migrations/` with timestamp prefix.
- Do not reset or rewrite existing migrations.
- Auth, RLS, permissions, and `SUPABASE_SERVICE_ROLE_KEY` are high-risk — test carefully.

## Security

- `SUPABASE_SERVICE_ROLE_KEY` and `INVITE_EMAIL_API_KEY` are server-side only — never expose in client code.
- Admin routes (`/api/admin/*`) use the service role key — treat as high-risk.
- HTML proxy route (`/api/proxy-html/*`) sanitizes HTML via `isomorphic-dompurify` — preserve sanitization.
- Never print, commit, or log secrets.

## Working principles

- Inspect existing patterns before writing new code.
- Keep changes small and focused.
- Do not add dependencies without clear justification.
- Do not remove existing behavior unless explicitly requested.
- Never silence TypeScript errors, lint warnings, or test failures — fix the root cause.
- Do not create premature abstractions.
- Summarize changed files and verification results at the end of each task.

## Planning workflow

For non-trivial tasks:

1. Read relevant files in the affected layer(s).
2. Identify which layer owns the change and check for existing patterns.
3. Write a short plan respecting layer boundaries.
4. Implement incrementally.
5. Run `pnpm test` and `pnpm lint` from `frontend/`.
6. Review the diff.
7. Report what changed and what was verified.

## Git workflow

- `main` → production Vercel. `develop` → preview environment.
- Check `git status` before making changes.
- Do not overwrite uncommitted user changes.
- Do not commit, push, reset, or checkout unless explicitly asked.

## Agent workflow

Use agents by scope:

- `codebase-auditor` — audits **pre-existing issues** in files already inspected or directly relevant to the current task (surrounding code, architecture, security risks, weak tests, maintainability). Does not scan the whole repository without explicit request.
- `code-reviewer` — reviews the **diff produced by the current task**: correctness, security, regressions, scope, and alignment with repository patterns.

When a task warrants both agents, follow this order:

1. Invoke `codebase-auditor` before or during planning if the task touches complex, risky, legacy, auth, admin, database, API, integration, testing, or cross-layer code.
2. Add audit findings to the current plan only when required to complete the task correctly or safely. Defer the rest as backlog candidates.
3. Implement the task.
4. Run the smallest relevant verification command (`pnpm test`, `pnpm lint`).
5. Invoke `code-reviewer` after non-trivial code changes to review the final diff.
6. Fix blocking reviewer findings before finalizing.

For `/loop` sessions, follow `.Codex/loop.md`.

## Autonomous iteration protocol

For non-trivial tasks, iterate autonomously but with explicit stop conditions.

Workflow:

1. Clarify the requested outcome from the prompt and existing project context.
2. Inspect relevant files before editing.
3. Create a short task list with concrete acceptance criteria.
4. Work on one task at a time.
5. After each meaningful change, run the smallest relevant verification command (`pnpm test`, `pnpm lint`).
6. If verification fails, investigate the root cause and attempt a focused fix.
7. Use subagents when they reduce context or risk — follow the agent workflow above.
8. Fix blocking findings before finalizing.
9. Stop when acceptance criteria pass or a stop condition is reached.

Stop conditions:

- The requested behavior is implemented and verified.
- The same issue fails twice after focused fixes.
- Required information is missing and cannot be inferred from the repository.
- The task requires destructive actions, production changes, secrets, deploys, commits, pushes, or database migrations not explicitly approved.
- The diff grows beyond the original scope.
- Verification is blocked by environment, dependency, credential, or infrastructure limitations.

Do not continue indefinitely. Report current state, evidence, verification results, and the smallest next action nedded
