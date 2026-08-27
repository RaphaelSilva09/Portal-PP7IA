# T9 — Digest semanal por e-mail (quartas)

> **Superseded (2026-08-26)**: a implementação descrita abaixo (rota `GET /api/cron/weekly-digest`,
> cron da Vercel, lista estática `WEEKLY_DIGEST_RECIPIENTS`) foi removida — não havia mais projeto
> Vercel ativo consumindo esse cron. O job real em produção é o serviço Railway dedicado descrito em
> `docs/setup/WEEKLY_EMAIL_DIGEST.md` (`pnpm run digest:send`, `frontend/lib/email/weekly-digest.ts`),
> que envia para inscritos reais via `communication_preferences` (ver
> `docs/setup/WEEKLY_NEWS_UNSUBSCRIBE.md`). Mantido aqui apenas como registro histórico do desenho
> original (v1, lista curada manualmente, sem inscrição pública).

## Requisito (PDF 3.5.1 / 3.8.4)

"Aviso semanal por e-mail às quartas-feiras, consolidando tudo que subiu na semana (responsável: Raphael)." O PDF classifica como prioridade MÉDIA e nota que o e-mail deve sair até as 19h (após a newsletter das 16h da Luiza).

## Critérios de aceite

1. Rota `GET /api/cron/weekly-digest` protegida por `Authorization: Bearer ${CRON_SECRET}` (401 sem/errado; 503 sem `CRON_SECRET` configurado).
2. A rota coleta conteúdo criado nos últimos 7 dias em todos os tipos públicos (newsletter, especial-semana, radar, mini-livros, biblioteca, estudar) e monta um HTML simples agrupado por seção.
3. Com `WEEKLY_DIGEST_RECIPIENTS` (lista separada por vírgula) e Resend configurados, envia o e-mail; sem destinatários, responde com o digest em JSON (dry-run) — permite ao Raphael validar antes de ativar.
4. Semana sem conteúdo → não envia (responde `{ sent: false, reason: "empty" }`).
5. `frontend/vercel.json` ganha `crons` para quarta 19h BRT (22h UTC — margem antes das 19h BRT considerando fuso; ajustável).
6. Builder do digest coberto por teste unitário puro; `.env.example` documenta `CRON_SECRET` e `WEEKLY_DIGEST_RECIPIENTS`; `pnpm test` e `pnpm lint` passam.

## Design técnico

- Builder puro `frontend/lib/email/weeklyDigest.ts`: `buildWeeklyDigest(items: DigestItem[], now: Date): { subject, html } | null` — testável sem I/O.
- Rota `frontend/app/api/cron/weekly-digest/route.ts`: auth por bearer → busca via repositórios existentes (DIContainer) filtrando `createdAt >= now-7d` → builder → envio via `resend`/`EMAIL_FROM` existentes (`frontend/lib/email/resend.ts`).
- Cron Vercel: `{ "path": "/api/cron/weekly-digest", "schedule": "0 22 * * 3" }`. A Vercel envia `Authorization: Bearer ${CRON_SECRET}` automaticamente quando a env existe.

## Dependências operacionais (fora do código)

- Configurar `CRON_SECRET` e `WEEKLY_DIGEST_RECIPIENTS` no projeto Vercel (produção). Sem isso a rota fica inerte (503/dry-run) — seguro por padrão.
- Lista de destinatários é do Raphael/equipe; não há inscrição pública de leitores nesta v1.

## Fora de escopo

- Newsletter automatizada da Luiza (3.2.5) — pipeline externo de curadoria, não este repositório.
- Envio para base de leitores/inscritos (exigiria gestão de lista, unsubscribe, LGPD — v2).
