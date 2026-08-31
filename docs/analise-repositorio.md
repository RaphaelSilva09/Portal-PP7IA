# Análise do repositório

Gerado em: 2026-08-28

## Estrutura de pastas

Nível raiz:

- `frontend/` — aplicação Next.js principal (16.1.1), onde vive praticamente todo o código do
  produto.
- `estudar/` — projeto separado, contém apenas `package-lock.json` e `node_modules/`; sem código
  próprio identificado.
- `docs/` — documentação do projeto (specs de SDD, setup, newsletter, superpowers, achados de
  bugs, tarefas).
- `.claude/` — configuração do Claude Code: agentes, comandos, hooks, regras, skills.
- `auditoria-screenshots/` — capturas de tela de auditorias de UI feitas em sessões anteriores.
- `templates/` — templates soltos (`confirm_email.html`).
- `.vercel/` — configuração de deploy Vercel.
- Arquivos soltos na raiz: `package.json` (mínimo, só `@dnd-kit/*`), `AGENTS.md`, `CLAUDE.md`,
  `README.md`, `checklist.md`, `relatorio-uiux.md`, `template.html`.

Dentro de `frontend/`, por camada/pasta:

| Pasta | Conteúdo |
|---|---|
| `app/` | Rotas do App Router: páginas públicas (home, biblioteca, declaracoes, explorar, axioma, etc.) e todas as rotas de API em `app/api/` |
| `application/usecases/` | 45 casos de uso (orquestram regra de negócio, chamam repositórios via DI) |
| `domain/` | Entidades (27 arquivos), interfaces de repositório (29), submódulos `axioma/` e `chat/`, erros de domínio |
| `infrastructure/` | Implementações Postgres dos repositórios (30 arquivos), auth (BetterAuth), providers de IA (Gemini, Groq), storage em filesystem, container de DI |
| `presentation/` | Hooks de apresentação (23 arquivos, um por feature) e client de chat (SSE) |
| `components/` | Componentes React por feature: admin, axioma, biblioteca, chat, explorar, home, onboarding, ui |
| `context/` | Contexts React: Auth, Session, Onboarding, UserActions, e modais (Auth, ForgotPassword, Invite, Search, ContentLocked) |
| `hooks/` | Hooks utilitários soltos: `useThemeCycle`, `useBodyScrollLock`, `useBookProgress`, `usePasswordRecovery`, etc. |
| `lib/` | Utilitários: auth, email, chat/axioma, `readingPrefs.ts`, `colorContrast.ts`, `portalTypography.ts`, `db.ts` |
| `constants/` | Dados constantes (`editorials.ts`, `homeBlocks.ts`, `onboarding.ts`, `sections.ts`, `team.ts`) |
| `data/` | Dados estáticos (`materiais/`, `content.ts`, `porque7.ts`) |
| `db/` | `migrations/` (24 arquivos SQL numerados), `migrate.ts`, `environment.ts` |
| `sql/` | Queries SQL soltas (descrições de blocos de home, sync de metadados) |
| `scripts/` | Scripts utilitários (ingestão RAG, geração de chunks de meta, envio de digest semanal) |
| `e2e/` | Testes Playwright (auth, mobile, resiliência de sessão, recuperação de senha) |
| `__tests__/` | Testes unitários/integração, espelhando as camadas (`domain/`, `application/`, `infrastructure/`, `context/`, `hooks/`, `components/`) |
| `docs/` | Documentação técnica interna: `development/`, `pdf/`, `prompt/`, spec de navegação de conteúdo |
| `public/` | Assets públicos: PDFs, HTML de visão, logos |
| `assets/` | Imagens estáticas (capas de livro, ícones SVG) |
| `.next/`, `coverage/`, `playwright-report/`, `test-results/` | Saídas de build/teste, não versionadas |

## Código-fonte

### Rotas e API

Páginas públicas principais: `/`, `/home`, `/biblioteca`, `/declaracoes`, `/especial-semana`,
`/estudar`, `/mini-livros`, `/newsletter`, `/axioma` (+ `/desafio`, `/perfil`, `/tecnico`,
`/upload`), `/explorar`, `/faq`, `/salvos`, `/trilhas` (+ `/trilhas/[slug]`), `/por-que-7`,
`/radar-oportunidades`, `/quem-somos`, `/view/[type]/[slug]` (visualizador de conteúdo genérico),
`/user`, `/reset-password`, `/unsubscribe/weekly-news`, `/painel-admin`.

API routes (~95 endpoints em `app/api/`), por domínio:

- **Auth**: `/api/auth/[...all]` (catch-all BetterAuth).
- **Usuário**: `/api/user/activity`, `/api/user/onboarding`, `/api/user/preferences/weekly-news`.
- **Conteúdo (leitura)**: `/api/content/[type]`, `/api/content/book/active`, `/api/content/ebook`,
  `/api/content/editorials`, `/api/content/faq`, `/api/content/mini-livro-sections`,
  `/api/content/portal-news`, `/api/content/prompt-library`, `/api/content/home-*`.
- **Admin (CRUD)**: `/api/admin/content/[type]/[id]` (+ `reorder`, `move`),
  `/api/admin/editorials`, `/api/admin/mini-livro-sections`, `/api/admin/faq`,
  `/api/admin/reader-questions`, `/api/admin/portal-news`, `/api/admin/prompt-library`,
  `/api/admin/home-*`, `/api/admin/users/*` (CRUD + promote/demote), `/api/admin/stats`,
  `/api/admin/site-bg`, `/api/admin/block-colors`, `/api/admin/explorar-config`.
- **Leitura e progresso**: `/api/reading-trails` (+ `[slug]`, `/progress`),
  `/api/content-views`, `/api/saved-content` (+ `[type]/[id]`).
- **Reações e feedback**: `/api/reactions` (+ `[type]/[id]`), `/api/reader-questions`,
  `/api/content-reactions`.
- **Chat/RAG**: `/api/chat/message` (streaming SSE), `/api/chat/reindex*`.
- **Axioma (IA)**: `/api/axioma/analyze`, `/api/axioma/challenge`.
- **Email**: `/api/email/unsubscribe/weekly-news` (+ `/confirm`).
- **Utilitários**: `/api/search`, `/api/invite`, `/api/referrals/attribute`,
  `/api/export-pdf/[type]/[slug]`, `/api/proxy-html/[type]/[slug]`, `/api/files/[...path]`,
  `/api/theme-css`, `/api/explorar-config`.

### Camadas (arquitetura em camadas)

- **Domain**: entidades TypeScript puras (User, ContentItem, ReadingTrail, MiniLivro, etc.),
  interfaces de repositório, submódulo `axioma/` (`Axioma.ts`, `IAxiomaAIProvider.ts`,
  `AxiomaError.ts`) e submódulo `chat/` (`Message.ts`, `Chunk.ts`, `RagAnswer.ts`,
  `LLMProvider.ts`, `EmbeddingProvider.ts`).
- **Application**: 45 casos de uso em `usecases/`, cada um seguindo entrada → validação →
  chamada a repositório → resultado tipado (ex: `SignUpUseCase`, `GetReadingTrailUseCase`,
  `DeleteUserAndDataUseCase`).
- **Infrastructure**: 30 implementações `PostgresXxxRepository.ts`, `BetterAuthRepository.ts`,
  providers de IA (`GeminiAxiomaProvider`, `GeminiProvider`, `GroqProvider`,
  `GeminiEmbeddingProvider`), content sources por seção (Biblioteca, EspecialSemana, Estudar,
  MiniLivros, Newsletter, Radar), `RagChunkRepository`, `RateLimitRepository`,
  `FilesystemStorageRepository`, `container.ts` (injeção de dependência centralizada).
- **Presentation**: 23 hooks (`useAuth`, `useBook`, `useSearch`, `useMiniLivros`,
  `useReadingTrails`, `useSavedContent`, `useSectionBrowse`, etc.), usando React Query
  (`useQuery`/`useMutation`); `useChat.ts` + `sseClient.ts` para streaming de chat.

### Banco de dados

Postgres com migrations SQL manuais (sem ORM completo, `drizzle-orm` está nas dependências mas a
execução é via `db/migrate.ts` + tabela `_migrations`). 24 migrations numeradas em
`frontend/db/migrations/`.

Tabelas identificadas pelos nomes de migration: `user`, `session`, `account`, `verification`
(BetterAuth); `editorial`; `mini_livro_sections`, `mini_livro_section_meta`; `homepage_config`,
`home_block_descriptions`, `home_recomendacoes_paulo`; `block_colors`, `explorar_config`,
`site_bg`; `faq_items`, `portal_news`; `prompt_library`, `prompt_library_tags`;
`email_digest_runs`, `email_digest_deliveries`, `content_digest_queue`; `content_views`,
`content_reactions`, `reader_questions`, `saved_content`; `reading_trails`,
`reading_trail_items`, `reading_trail_progress`; `referrals`; `axioma_usage`;
`password_recovery_attempts`; `communication_preferences`. View materializada:
`mv_admin_dashboard_stats`. Trigger `set_updated_at()` em várias tabelas.

`frontend/environment.ts` detecta ambientes de PR no Railway para pular migration em preview.

### Lib

Auth (`auth.ts`, `auth-client.ts`), email (`resend.ts`, templates de verificação/reset,
`weekly-digest.ts`, `unsubscribeToken.ts`), chat/axioma (`promptBuilder.ts`, `ragSelection.ts`,
`citationLink.ts`, `answerWithMarkers.ts`), conteúdo (`contentStorage.ts`, `savedContent.ts`,
`seenContent.ts`, `slug.ts`), UI/UX (`readingPrefs.ts`, `portalTypography.ts`,
`colorContrast.ts`), segurança (`passwordRecoveryThrottle.ts`, `referralCapture.ts`), genéricos
(`formatters.ts`, `validators.ts`, `utils.ts`, `uid.ts`, `db.ts`, `baseUrl.ts`).

### Tema e preferências (relevante a pedidos de acessibilidade)

- Tema via `next-themes`: hook `hooks/useThemeCycle.ts` cicla entre `light`, `theme-sepia` e
  `dark` (nome `theme-sepia` é literal, para não colidir com utility do Tailwind). Provider em
  `components/Providers.tsx` (`ThemeProvider attribute="class"`, `enableSystem`).
- `frontend/lib/readingPrefs.ts` (~5.8K) — módulo de preferências de leitura; não ficou claro,
  só pela exploração feita, se cobre tamanho de fonte, espaçamento de linha e/ou contraste, ou
  outra coisa (ver Lacunas).
- `checklist.md` (auditoria de 2026-07-19) registra explicitamente que preferências de leitura
  hoje ficam em `localStorage`, não em perfil de usuário — ressalva marcada como pendência
  conhecida no próprio documento.
- `context/SessionContext.tsx` (~9.1K) e `context/UserActionsContext.tsx` (~7.0K) existem como
  candidatos a guardar estado de sessão/preferência, mas o conteúdo não foi lido em detalhe nesta
  varredura.

## Documentação existente

- `AGENTS.md` (raiz): mapa técnico do projeto — stack (Next.js 16.1.1, React 19, TypeScript
  strict, Tailwind v4, BetterAuth, Postgres no Railway, pnpm 10.33.0), arquitetura em camadas,
  diretórios principais, comandos de dev/teste, padrões de teste por camada, variáveis sensíveis,
  workflow de agentes.
- `README.md` (raiz): descrição do produto (portal colaborativo de conteúdo sobre IA),
  funcionalidades, instalação em 5 passos, links para docs detalhadas.
- `frontend/TESTES.md`: documentação minuciosa dos testes unitários — 89 testes em 13 arquivos,
  configuração Vitest+jsdom, padrão de mock por camada, especificação linha a linha de cenários.
- `docs/README.md`: índice da documentação (Getting Started, Setup, Architecture, Newsletter,
  SDD, Frontend Development/Design System).
- `docs/sdd/` (24 specs, T1–T15): uma spec por tarefa, formato Requisito → Critérios de aceite →
  Design técnico → Fora de escopo (ex: `01-fontes-newsletter.md`, `09-digest-semanal.md`,
  `14-trilhas-de-leitura.md`).
- `frontend/docs/`: `DESIGN_SYSTEM.md` e `CONTENT_HTML_NAVIGATION_SPEC.md` (~15.8K, spec de
  navegação entre conteúdos).
- `checklist.md`: auditoria de 18 itens (2026-07-19, testado via Playwright em dev local) — 15
  ok, 3 com ressalva, 1 não iniciado.
- `relatorio-uiux.md`: auditoria de UI/UX de 2026-07-08 (Playwright Chromium, viewports 375/768/
  1440px), mapa de telas e achados de UX.
- `docs/tasks-davi-260811.md`: tarefas prioritárias (origem: documento Word PP7I-260811-1800),
  T10–T15.
- `docs/otp-reset-fix-findings.md`: investigação de 2026-08-15 sobre bug de reset de senha via
  OTP, causa raiz e pendências relacionadas não corrigidas.
- `docs/aprendizados.md`: registro de correções/aprendizados do time (mecanismo descrito em
  `.claude/rules/aprendizado-continuo.md`).

## Configuração e dependências

- Package manager: pnpm 10.33.0. Node `>=22 <26`.
- Next.js 16.1.1, React 19.2.3 (fixado via `pnpm.overrides`).
- Scripts principais (`frontend/package.json`): `dev` (webpack), `build`, `start`, `lint`,
  `test`/`test:watch`/`test:coverage` (Vitest), `test:e2e*` (Playwright, incl. variantes mobile/
  postgres), `db:migrate`, `digest:send`.
- Dependências principais: `better-auth` (auth), `@node-rs/argon2` + `bcrypt` (hash de senha),
  `drizzle-orm` + `pg` (Postgres), `@tanstack/react-query`, `@tiptap/react` (editor rich-text),
  `resend` (email), `pdfjs-dist` + `jspdf` (PDF), `puppeteer-core` + `@sparticuz/chromium`
  (geração server-side), `@google/generative-ai` (Gemini), `zod`, `next-themes`, `cheerio`,
  `isomorphic-dompurify`, `@dnd-kit/*`.
- Dev dependencies: `@playwright/test` (`^1.55.0`, resolvido em `1.59.1` no lockfile), `vitest`
  3.x, `@testing-library/react`, `jsdom`, Tailwind v4, TypeScript 5, ESLint 9.
- `package.json` da raiz só declara `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- `.gitignore` (raiz e `frontend/`) cobre `node_modules`, `.env*` (com exceção de `.env.example`
  implícita), build output, coverage, `.vercel`; raiz também ignora `.claude/`, `CLAUDE.md`,
  `AGENTS.md`, `.superpowers/`, `docs/superpowers/`.
- Arquivos `.env*` existentes (não lidos): raiz (`.env`, `.env.local`, `.env copy.local`,
  `.env copy 2.local`, `.env.example`), `frontend/` (`.env`, `.env.local`), `estudar/` (`.env`).
- Nenhum CI configurado em `.github/workflows/`; deploy aparenta ser via Vercel (`.vercel/`
  presente).

### Configuração do Claude Code (`.claude/`)

- **Agentes**: `planejador` (plano sem editar), `resumidor` (condensa conteúdo, roda em Haiku),
  `revisor-critico` (revisa em contexto novo).
- **Comandos**: `/analisar-repositorio`, `/planejar`, `/resumir`, `/pipeline-rapido`,
  `/pipeline-validado`.
- **Hooks**: `verificar-analise-inicial` (confere se esta análise já rodou),
  `filtrar-saida-verbosa`, `lembrete-humanizacao` (injeta checklist de PT no
  `UserPromptSubmit`).
- **Regras**: `postura-critica`, `aprendizado-continuo`, `dados-grandes`.
- **Skills**: `humanizacao-pt`, `otimizacao-tokens`.

## Testes

- **Unitário/integração** (`frontend/__tests__/`): 74 arquivos de teste, documentados em
  `frontend/TESTES.md` como 89 testes em 13 arquivos-alvo (0 falhas na última execução
  registrada). Distribuídos por camada: `domain/` (2 arquivos), `application/` (6+, cobrindo
  casos de uso como SignIn/SignUp/SignOut, reset de senha, navegação de conteúdo, Axioma,
  trilhas), `infrastructure/` (2), `context/` (1), `hooks/` (1), `components/` (7+). Framework:
  Vitest 3.x + jsdom + Testing Library, `vitest.setup.ts` roda `cleanup()` após cada teste.
  Padrão de mock varia por camada (domain sem mock, application com mock manual de interface,
  infra com mock via construtor). Sem threshold de cobertura configurado; relatório de cobertura
  (v8) disponível em `frontend/coverage/`.
- **E2E** (`frontend/e2e/`): 8 arquivos — 5 specs de auth (entrypoints, mobile, pristine-state,
  login-flow, session-resilience), 1 de reset de senha via OTP, `global-setup.ts` (cria usuário
  BetterAuth de teste direto no Postgres), `utils/env.ts`. Framework: Playwright, com projetos
  para desktop Chrome, Android Chrome e iOS Touch (WebKit real via flag separada). Configs
  separados para execução padrão e com Postgres isolado
  (`playwright.postgres.config.ts`).

## Dados e credenciais referenciados (schemas/nomes, sem valores reais)

Nenhum valor de credencial, chave de API, token ou dado de usuário real foi lido ou reproduzido
nesta análise — só nomes de variável e de campo.

Variáveis de ambiente encontradas via grep por `process.env.`:

- Sensíveis/servidor: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`,
  `INVITE_EMAIL_API_KEY`, `UNSUBSCRIBE_TOKEN_SECRET` (+ `_PREVIOUS`).
- IA/LLM: `GEMINI_API_KEY`, `GEMINI_EMBEDDING_MODEL`, `GEMINI_GENERATION_MODEL`,
  `GEMINI_LLM_MODEL`, `GROQ_API_KEY`, `LLM_PROVIDER`, `AXIOMA_DAILY_LIMIT`, `RAG_DAILY_LIMIT`,
  `RAG_MIN_SIMILARITY`, `RAG_META_FALLBACK_MIN_SIMILARITY`.
- Públicas: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`.
- Infra/outras: `STORAGE_ROOT`, `PUBLIC_FILES_BASE_URL`, `EMAIL_FROM`, `DIGEST_MAX_ITEMS`,
  `PORT`, `NODE_ENV`, `RAILWAY_ENVIRONMENT_NAME`, `RAILWAY_GIT_BRANCH`.

Schema de usuário (`frontend/domain/entities/User.ts`, `UserProps`): `id`, `email`, `nome`,
`celular`, `acceptEmailUpdates` (bool), `acceptWhatsAppUpdates` (bool), `createdAt`, `role`
(`"user" | "admin"`). Validação embutida na entidade (email via regex, celular 10–11 dígitos,
pelo menos um canal de comunicação aceito).

`IUserManagementRepository.ts` define `UserListItem`, `UpdateUserParams`, `GetUsersParams`,
`PaginatedUsersResult` para o painel admin (CRUD + paginação).

BetterAuth gerencia autenticação sobre as tabelas `user`, `session`, `account`, `verification`
(schema não lido em detalhe); reset de senha via OTP, roles administradas no banco.

## Lacunas de informação

- Não ficou claro, só pela exploração feita, o que exatamente `frontend/lib/readingPrefs.ts`
  cobre — se inclui tamanho de fonte, espaçamento de linha, contraste, tema, ou outra
  combinação. Precisa leitura direta do arquivo antes de qualquer tarefa que dependa dele.
- Não ficou claro se as preferências de leitura hoje persistem só em `localStorage` (como
  `checklist.md` de 2026-07-19 registra) ou se algo mudou desde então — o arquivo é anterior à
  data desta análise.
- Não foi lido o conteúdo de `context/SessionContext.tsx` e `context/UserActionsContext.tsx` em
  detalhe, então não está confirmado se algum dos dois já guarda ou poderia guardar preferência
  de usuário vinculada à sessão/conta.
- Não foi confirmado se `estudar/` (só com `package-lock.json` e `node_modules/`) tem alguma
  relação de dependência ou deploy com `frontend/`, ou se é isolado.
- Schema exato das tabelas do BetterAuth (`user`, `session`, `account`, `verification`) não foi
  lido a partir da migration `0001_better_auth_init.sql`, só inferido do nome.
- Não foi verificado se há distinção de user-agent/viewport (mobile vs. não-mobile) já tratada em
  algum hook ou componente existente — relevante para qualquer tarefa futura que precise
  diferenciar dispositivo.
