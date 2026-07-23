# T2 — Cadência da newsletter 2x/semana

## Requisito (PDF 3.2.1)

7 notícias, 2 dias por semana:
- **Segundas**: notícias dos últimos 7 dias sobre as 7 IAs (novas versões, funções, dicas).
- **Quartas**: notícias sobre startups, com foco nas que trabalham com IA.

Formato (3.2.2): textos curtos, máximo 4–5 linhas por notícia, com link para detalhes. Curadoria (3.2.3): prioridade pró-Brasil.

## Critérios de aceite

1. `frontend/constants/homeBlocks.ts` — descrição do bloco newsletter fala em duas edições semanais (segundas: 7 IAs; quartas: startups).
2. `frontend/components/admin/ContentForm.tsx` — `typeGuidance.newsletter` orienta a cadência 2x/semana, 7 notícias, 4–5 linhas por notícia, curadoria pró-Brasil.
3. Fallbacks de copy da home (`frontend/app/page.tsx`, chaves `newsletterCard_*` e seção "quarta") não contradizem a nova cadência.
4. `frontend/sql/home_block_descriptions.sql` (seed de descrições) atualizado na mesma direção.
5. `pnpm test` e `pnpm lint` passam.

## Design técnico

Só copy — nenhum modelo de dados muda. As descrições da home podem ter override no banco (`HomepageConfig`); aqui se atualizam os **fallbacks/default**. Quem administra o portal pode sobrescrever via admin depois.

Atenção: strings da home são consumidas via `t(s, chave, fallback)` — atualizar apenas fallbacks mantém compatibilidade com overrides existentes no banco.

## Fora de escopo

- Validação programática de "7 notícias" ou "4–5 linhas" (a newsletter é um HTML único enviado pelo admin; não há estrutura de itens para validar — ver PP7IAS-STATUS.md §3).
- Agendamento/travas de publicação por dia da semana.
