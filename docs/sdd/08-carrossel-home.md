# T8 — Carrossel de destaques na home

## Requisito (PDF 3.7.2)

"Avaliar a possibilidade de, ao abrir o portal, ter um carrossel com alguns conteúdos iniciais (atualizável de vez em quando), com pelo menos 5–6 itens. Ex.: o livro; guia de restaurantes de Lisboa; as duas últimas newsletters da semana; e mais 2 ou 3 itens fixos que deveriam estar sempre lá."

## Critérios de aceite

1. A home exibe um carrossel horizontal com ≥ 5 itens: o livro (Enquanto é Tempo), o guia de restaurantes de Lisboa (Biblioteca/Viagens), as 2 últimas newsletters, e 2 itens fixos (Explorar os 7 blocos; Quem somos).
2. Navegação por arrasto/scroll com snap + botões prev/next; acessível por teclado.
3. Responsivo (1 card e pico no mobile, ~3 no desktop); sem scroll horizontal da página.
4. Sem dependência nova (CSS scroll-snap, não biblioteca de carrossel).
5. Itens dinâmicos (newsletters) vêm dos dados já buscados/renderizados server-side na home; falha de dados degrada para os itens fixos.
6. `pnpm test` e `pnpm lint` passam.

## Design técnico

- Novo componente client `frontend/components/home/HomeCarousel.tsx`: `<div>` com `overflow-x-auto`, `scroll-snap-type: x mandatory`, cards `scroll-snap-align: start`; botões prev/next via `scrollBy` (escondidos quando não aplicáveis); `aria-roledescription="carousel"`.
- Server component da home (`app/page.tsx`) monta a lista de slides a partir dos dados que já busca (livro/config + newsletters) e passa como props serializáveis (título, descrição curta, href, cor/etiqueta do bloco).
- Guia de Lisboa: link para a Biblioteca tema Viagens (`/explorar?b=biblioteca` / subseção viagens) — sem hardcode de id de material (o item específico pode mudar; o link da categoria é estável). Se existir slug direto estável do guia, usar.
- Posição: logo abaixo do hero, antes das seções editoriais.

## Fora de escopo

- Gestão dos slides via painel admin (v2 — hoje os "itens fixos" são constantes no código, como os demais textos da home têm fallback).
- Autoplay (evitado por acessibilidade; PDF não pede).
