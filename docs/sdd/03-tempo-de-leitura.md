# T3 — Tempo de leitura visível ao leitor

## Requisito (PDF 5.3)

"Cada artigo exibe, antes de ser aberto, o tempo estimado de leitura com base na contagem de palavras."

## Estado atual

`readTime` (minutos) já existe em todas as entidades de conteúdo e no banco (`read_time`), editável no admin — mas só é exibido no painel admin, nunca ao leitor (`Item` de `explorar/blocks.tsx` nem inclui o campo).

## Critérios de aceite

1. Cards de conteúdo em `/explorar` (`ItemCard` e `FeaturedCard`) exibem "X min" quando `readTime` disponível.
2. O campo flui da entidade até o card (interface `Item` ganha `readTime`).
3. Sem regressão nos cards de itens sem `readTime` (campo opcional, sem badge).
4. `pnpm test` e `pnpm lint` passam.

## Design técnico

- `interface Item` em `frontend/app/explorar/blocks.tsx` ganha `readTime?: number`.
- Verificar o ponto de mapeamento entidade→Item (fetch em `ExplorarClient`/API de conteúdo) e propagar `readTime`.
- Badge com ícone `Clock` (lucide) ao lado da data no rodapé do card.

**Desvio declarado do requisito**: o valor exibido é o `readTime` cadastrado pelo admin, não uma contagem automática de palavras. O conteúdo é um HTML opaco servido por proxy — contagem de palavras exigiria parse do HTML no build/ingest. Se a contagem automática for exigida, tratar como melhoria futura no pipeline de upload (calcular no momento do upload do HTML e preencher `read_time` automaticamente).

## Fora de escopo

- Cálculo automático por contagem de palavras (ver desvio acima).
- Exibição dentro do próprio HTML do conteúdo.
