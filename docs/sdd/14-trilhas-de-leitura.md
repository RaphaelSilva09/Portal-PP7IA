# T14 — Trilhas de leitura guiadas

## Requisito (PP7I-260811-1800, item 3.2 do backlog priorizado)

"Roteiros editoriais tipo 'Entenda IA em 5 leituras': sequência ordenada com progresso visual. Benefício: transforma acervo disperso em percursos com objetivo. Prioridade: MÉDIA. Responsáveis: Davi (interface) + Raphael (dados/progresso)."

## Critérios de aceite

1. Existe um novo tipo de conteúdo editorial "trilha", com título, descrição curta e uma lista ordenada de conteúdos já existentes (cada item aponta para um `ContentType` + id já publicado — não duplica conteúdo).
2. O painel admin permite criar/editar uma trilha: título, descrição, e montar a sequência escolhendo conteúdos já existentes (busca por título/tipo), reordenando por posição.
3. Página pública `/trilhas` lista as trilhas publicadas (capa, título, descrição, "N leituras").
4. Página de uma trilha (`/trilhas/[slug]`) mostra os passos em ordem, cada um com título + link, e indica visualmente quais o leitor logado já abriu — usa histórico real de leitura, não uma estimativa.
5. Leitor deslogado vê a trilha e os links normalmente, mas sem indicação de progresso (sem conta, não há o que rastrear).
6. Um CTA "Continuar trilha" leva direto ao primeiro passo ainda não lido.
7. Testes unitários do repositório de trilhas e do cálculo de progresso; `pnpm test` e `pnpm lint` passam em `frontend/`.

## Design técnico

- **Achado importante**: hoje não existe nenhuma tabela de progresso de leitura por usuário. O "continue de onde parou" do livro e o "já visto" (`lib/seenContent.ts`) vivem só em `localStorage`, por dispositivo. `/api/content-views` (`db/migrations/0017_user_activity_and_onboarding.sql`) só grava um booleano "já viu algum conteúdo alguma vez" no usuário, não progresso por item. Esta trilha é o primeiro caso do produto que precisa de progresso por-item persistido no servidor — vale alinhar esse escopo com o Raphael antes de começar, porque é maior que uma feature de UI simples.
- Modelo de dados (Raphael):
  - `reading_trails` (id, slug, title, description, cover_image_path, published, created_at, updated_at).
  - `reading_trail_items` (id, trail_id FK, content_type, content_id, position) — sequência ordenada; mesmo par `content_type`/`content_id` de `saved_content` (T13) e `content_reactions`, para reaproveitar `DIContainer.getContentRepository().getById()` na hidratação.
  - `reading_trail_progress` (user_id FK, trail_id FK, content_type, content_id, completed_at, UNIQUE(user_id, trail_id, content_type, content_id)) — 1 linha por passo concluído; "concluído" = o leitor abriu `/view/[type]/[slug]` daquele item estando logado (reaproveita o hook que já roda em toda página de conteúdo, `components/ContentViewTracker.tsx`).
- Backend (Raphael): `application/usecases/GetReadingTrailUseCase.ts` monta a trilha com os itens hidratados + quais o usuário logado já completou; `POST /api/reading-trails/[slug]/progress` chamado por `ContentViewTracker` quando a página aberta pertence a alguma trilha (checagem simples: o par `content_type`/`content_id` da página existe em `reading_trail_items`); CRUD admin em `app/admin` + `app/api/admin/reading-trails`, seguindo o padrão de outras entidades administráveis do projeto (ex.: `prompt_library`).
- Interface (Davi): `app/trilhas/page.tsx` (listagem, padrão de `app/faq/page.tsx`) e `app/trilhas/[slug]/page.tsx` (detalhe) — passos numerados com estado visual "concluído" (check) / "atual" (destaque) / "pendente", barra de progresso (`concluídos / total`), e CTA "Continuar trilha" apontando para o primeiro passo com `completed_at IS NULL`. Sem dependência nova — barra de progresso é `<div>` com `width: %`, mesmo espírito do carrossel em CSS puro (T8).
- Entrada de navegação: onde a trilha aparece na navegação principal não é especificado no documento — decisão de produto em aberto. Sugestão: card na home abaixo do carrossel, ou entrada dedicada no menu "Explorar".

## Fora de escopo

- Trilhas com conteúdo exclusivo/gerado especificamente para a trilha — v1 só referencia conteúdo já publicado nos blocos existentes.
- Gamificação (badges, certificado ao concluir) — não pedido no documento.
- Progresso sincronizado para leitor deslogado — sem conta, não há o que persistir (mesma decisão já tomada para o "continue de onde parou" do livro).
