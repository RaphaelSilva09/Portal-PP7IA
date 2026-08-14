# T12 — Botão do card "Curadoria Semanal"

## Requisito (PP7I-260811-1800, item 1.3)

"Atual: botão 'Assinar'. Novo: botão 'Ler'."

## Critérios de aceite

1. O botão do card "Curadoria Semanal" na hero da home mostra "Ler →" (mantendo a seta, por consistência visual com o card do livro, que já usa "Ler →").
2. O fallback inline do componente e o default da entidade passam a usar o mesmo texto novo — hoje os dois já divergem entre si (ver Design técnico), e esta correção também resolve essa inconsistência interna.
3. O link/destino do card (`/explorar?b=newsletter`) não muda — só o texto do botão.
4. `pnpm test` e `pnpm lint` passam em `frontend/`.

## Design técnico

- **Achado importante**: o texto atual ao vivo no banco de **dev** é `"Acessar →"`, não `"Assinar"` como descrito no documento. Os dois fallbacks de código já divergem entre si:
  - `app/page.tsx:201` — `t(s, "newsletterCard_cta", "Acessar →")` (fallback usado quando a seção existe no banco mas falta essa chave).
  - `domain/entities/HomepageConfig.ts:117` — `newsletterCard_cta: "Assinar →"` (default usado só se a leitura do banco falhar por completo).
  - Isso sugere que o texto já foi trocado de "Assinar" para "Acessar" em algum momento sem atualizar o default da entidade — ou que o "atual" do documento reflete um estado anterior ao que está em dev hoje.
  - **Antes de aplicar**: confirmar o valor salvo em produção (pode ser "Assinar →", "Acessar →" ou outro) — este ambiente só tem acesso ao banco de dev.
- Correção proposta, independente de qual seja o valor atual: definir os dois pontos de código para `"Ler →"` e, se o banco (dev e/ou produção) tiver um valor salvo diferente, rodar um `UPDATE` direto em `homepage_config` fixando `newsletterCard_cta` para `"Ler →"` — aqui não é uma correção em lote com vários valores antigos possíveis (como em `sync_homepage_texts.sql`), é 1 campo com 1 valor final desejado, então o `UPDATE` pode ser incondicional nesse campo específico.

## Fora de escopo

- O botão "Inscrever" do formulário real de newsletter (`components/home/NewsletterForm.tsx:105`) — é um controle diferente (submit de formulário), o documento não pediu mudança nele.
- Investigar por que os dois fallbacks de código divergiram — fica registrado aqui como achado, mas a causa raiz não faz parte deste pedido.
