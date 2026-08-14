# T13 — Marcar para ler depois (favoritos)

## Requisito (PP7I-260811-1800, item 3.1 do backlog priorizado)

"O leitor salva artigos numa fila pessoal para ler depois. Tipo 'favoritos' organizados. Benefício: aumenta retorno ao portal. Prioridade: MÉDIA. Responsáveis: Davi (frontend) + Raphael (backend)."

## Critérios de aceite

1. Leitor logado vê um botão "Ler depois" (toggle, com estado "Salvo") nas páginas de conteúdo (`/view/[type]/[slug]`), ao lado dos botões existentes (compartilhar, exportar PDF, reações).
2. Leitor deslogado vê o mesmo botão; ao clicar, abre o modal de cadastro/login (mesmo padrão de `ContentReactions`), sem salvar nada até logar.
3. Nova página `/salvos` lista os conteúdos salvos do leitor logado, mais recentes primeiro, com título, bloco de origem (cor) e link para abrir.
4. Remover da lista funciona tanto pelo botão na página de conteúdo quanto por um botão "Remover" na própria lista.
5. Um mesmo conteúdo não pode ser salvo duas vezes pelo mesmo usuário (idempotente).
6. Testes unitários do repositório e da rota; `pnpm test` e `pnpm lint` passam em `frontend/`.

## Design técnico

- Modelo de dados (Raphael): nova tabela `saved_content`, no mesmo molde de `content_reactions` (`db/migrations/0014_content_reactions.sql`):
  ```sql
  CREATE TABLE IF NOT EXISTS public.saved_content (
    id           SERIAL PRIMARY KEY,
    user_id      UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id   TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, content_type, content_id)
  );
  CREATE INDEX IF NOT EXISTS idx_saved_content_user ON public.saved_content(user_id, created_at DESC);
  ```
- Domain/infra (Raphael): `domain/entities/SavedContent.ts` (análogo a `ContentReaction.ts`), `domain/repositories/ISavedContentRepository.ts` com `toggle(userId, contentType, contentId)`, `isSaved(userId, contentType, contentId)`, `listByUser(userId)`; implementação `infrastructure/repositories/PostgresSavedContentRepository.ts`. `listByUser` retorna as linhas de `saved_content`; para título/link, cruzar cada uma com `DIContainer.getContentRepository().getById(contentType, Number(contentId))` (mesmo padrão já usado para montar a home) — escopo limitado aos 7 `ContentType` existentes (`newsletter`, `mini-livro`, `biblioteca`, `especial-semana`, `radar_oportunidades`, `estudar`, `ebook`); tipos fora desse conjunto (`book`, `mini-livro-section`) ficam fora da v1.
- API (Raphael): `POST /api/saved-content` (toggle, body `{contentType, contentId}`, exige login) e `GET /api/saved-content/[type]/[id]` (retorna `{ saved: boolean }` para o estado do botão) — espelham exatamente `app/api/reactions/route.ts` e `app/api/reactions/[type]/[id]/route.ts`. Nova rota `GET /api/saved-content` (sem params) lista os itens do usuário logado, já hidratados com título/href, para a página `/salvos`.
- Interface (Davi): novo componente `components/SaveForLaterButton.tsx` (`"use client"`), no mesmo padrão de `components/ContentReactions.tsx` — busca estado inicial no mount, toggle otimista, `useAuthModal()` quando deslogado. Montado em `ViewContentFrame.tsx` ao lado de `ShareButton`/`ExportPdfButton`.
- Interface (Davi): nova página `app/salvos/page.tsx` + `SalvosClient.tsx` (padrão de `app/faq/page.tsx`: server component com `Navbar`/`Footer` + client component de conteúdo), consumindo `GET /api/saved-content`, com estado vazio ("Você ainda não salvou nada") e botão remover por item.
- Entrada de navegação (Davi): link "Salvos" no dropdown do perfil (`components/Header`, mesmo lugar do alternador de tema), visível só para usuário logado.

## Fora de escopo

- Cruzar salvos com tipos fora de `ContentType` (`book`, `mini-livro-section`, `home-recomendacoes`) — v2, se pedido depois.
- Ordenar a fila manualmente (drag-and-drop) — o pedido é "fila"; ordenação por data de salvamento (mais recente primeiro) atende ao critério.
- Notificar o leitor por e-mail sobre itens salvos e esquecidos — não pedido no documento.
