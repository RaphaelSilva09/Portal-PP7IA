# T4 — Tema sépia (fundo amarelado)

## Requisito (PDF 5.1)

"O fundo da plataforma assume um tom levemente amarelado para reduzir a fadiga visual em sessões longas de leitura, especialmente em ambientes com pouca luz."

## Critérios de aceite

1. Existe um terceiro tema `sepia` registrado no `next-themes` (`Providers.tsx`).
2. `globals.css` define bloco `.sepia` com paleta quente/amarelada (fundo, cards, bordas, texto) coerente com o design system existente (mesmas variáveis que `:root`/`.dark` redefinem).
3. `ThemeToggle` cicla claro → sépia → escuro, com ícone e `aria-label` distintos por estado.
4. Preferência persiste entre sessões (mecanismo nativo do next-themes).
5. Teste de `ThemeToggle` atualizado; `pnpm test` e `pnpm lint` passam.

## Design técnico

- `Providers.tsx`: `themes={["light", "sepia", "dark"]}` (mantém `defaultTheme="light"` e `enableSystem`).
- `globals.css`: `.sepia { color-scheme: light; --bg-primary: #f6efe0; --bg-secondary: #efe6d2; --text-primary: #3d3425; ... }` — redefinir o mesmo conjunto de variáveis que `.dark` redefine, com tons quentes de baixo contraste azul. Sépia é variante clara: componentes com `dark:` do Tailwind continuam no visual claro.
- `ThemeToggle.tsx`: troca o toggle binário por ciclo de 3 estados (`light → sepia → dark → light`), ícones `SunMedium` / `BookOpen` (ou `Coffee`) / `MoonStar`.
- Interação com site-bg do admin: o painel admin injeta `--bg-primary` para light/dark via `SiteBg`; verificar ponto de injeção para que o tema sépia não seja sobrescrito (sépia usa sua própria variável, sem override do admin nesta v1).

## Fora de escopo

- Painel admin para personalizar as cores do tema sépia (SiteBg cobre só light/dark).
- Modo sépia dentro do HTML dos conteúdos servidos por proxy (iframe tem estilo próprio).
