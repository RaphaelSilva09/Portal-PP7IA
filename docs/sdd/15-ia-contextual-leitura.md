# T15 — Inteligência artificial contextual na leitura

## Requisito (PP7I-260811-1800, item 3.3 do backlog priorizado)

"O chat do portal passa a 'saber' qual artigo está aberto e responde sobre ele especificamente. Benefício: evolução natural do chat; aumenta valor percebido; retenção de leitores. Prioridade: BAIXA. Responsáveis: Raphael (RAG) + Davi (interface)."

## Critérios de aceite

1. Ao abrir uma página de conteúdo (`/view/[type]/[slug]`) logado, o chat (bolha + painel) fica disponível também ali — hoje só existe na home.
2. Perguntas feitas com o chat aberto a partir de uma página de conteúdo priorizam trechos daquele conteúdo específico nas respostas, sem o leitor precisar mencionar o título.
3. O leitor ainda pode perguntar sobre qualquer outro conteúdo do portal na mesma janela — o contexto do artigo aberto prioriza, não restringe.
4. A saudação inicial do chat muda quando aberto a partir de uma página de conteúdo (menciona que pode responder sobre "este conteúdo").
5. O comportamento na home permanece exatamente igual ao atual (sem contexto de artigo).
6. Testes unitários da nova lógica de priorização por contexto; `pnpm test` e `pnpm lint` passam em `frontend/`.

## Design técnico

- Já existe um RAG chat completo e funcional (`app/api/chat/message/route.ts`, `lib/chat/ragSelection.ts`, `lib/chat/ragSources.ts`), hoje só site-wide (busca semântica em todos os `RAG_SOURCES` em paralelo) e montado só na home (`<ChatBubble />`, `app/page.tsx:1,643`, atrás do flag `NEXT_PUBLIC_CHAT_ENABLED`). Já existe inclusive um precedente do mecanismo necessário aqui: o regex de mini-livro em `app/api/chat/message/route.ts:88-93`, que chama `chunkRepo.findBySlug(sourceType, slug)` para pular a busca semântica geral quando a pergunta menciona "mini-livro N". Esta tarefa é o mesmo mecanismo, acionado pela página aberta em vez de por regex na pergunta.
- Interface (Davi): montar `<ChatBubble />` também em `ViewContentFrame.tsx` (hoje só em `app/page.tsx`), passando `contentType`/`slug` (já disponíveis nas props do componente) como um novo `articleContext` opcional até `useChat()` → `sendMessage()`. Ajustar a constante `GREETING` em `presentation/chat/useChat.ts` para uma variante condicional quando `articleContext` está presente.
- Contrato novo (Davi + Raphael alinham a assinatura): `sendMessage({ messages, articleContext?: { sourceType: string; slug: string }, signal, onEvent })` em `presentation/chat/sseClient.ts`, incluindo `articleContext` no corpo do `fetch("/api/chat/message")`.
- Backend (Raphael): em `app/api/chat/message/route.ts`, se `articleContext` vier no body (novo campo opcional validado no `BodySchema` via Zod), buscar `chunkRepo.findBySlug(articleContext.sourceType, articleContext.slug)` e tratar esses chunks com prioridade — incluí-los sempre como `citableCandidates` (sem o corte por `RAG_MIN_SIMILARITY`, já que a relevância vem da página aberta, não da similaridade textual) e ainda rodar a busca semântica geral em paralelo para as demais fontes, unindo os dois resultados antes de `selectRagContext`.
- Prompt (Raphael): `SYSTEM_PROMPT`/`buildPrompt` (`lib/chat/promptBuilder.ts`) ganha uma linha condicional quando há `articleContext`, orientando o modelo a priorizar esse conteúdo em perguntas genéricas ("resuma isso", "o que esse texto diz sobre X").
- Autenticação: o chat já exige login (`getUser()`); nenhuma mudança necessária — leitor deslogado numa página de conteúdo simplesmente não vê o botão do chat, igual hoje na home.

## Fora de escopo

- Restringir o chat a responder só sobre o artigo aberto — o documento pede que ele "saiba" o artigo, não que vire um chat fechado por página.
- Mudar o algoritmo de embeddings/reranking geral — o ajuste é só de priorização por contexto; a infraestrutura de RAG (Gemini embeddings, pgvector) não muda.
- Histórico do chat sobreviver entre páginas (abrir num artigo, navegar para outro, manter a conversa) — v1 mantém o estado do chat local ao componente, resetando por navegação, como já acontece hoje.
