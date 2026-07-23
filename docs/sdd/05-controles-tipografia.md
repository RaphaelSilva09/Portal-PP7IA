# T5 — Controles de tipografia na leitura

## Requisito (PDF 5.2)

"O leitor pode ajustar tamanho da fonte, peso (regular/médio) e espaçamento entre linhas direto na interface, sem mexer nas configurações do navegador. A preferência é salva no perfil."

## Critérios de aceite

1. Nas páginas de leitura (`/view/[type]/[slug]`), existe um controle visível com: tamanho da fonte (mín. 3 passos), peso (regular/médio) e espaçamento entre linhas (mín. 3 passos).
2. Os ajustes afetam o conteúdo em leitura imediatamente, sem reload.
3. A preferência persiste entre sessões e se aplica a qualquer conteúdo aberto depois.
4. Botão de reset para o padrão.
5. Testes unitários do helper de preferências; `pnpm test` e `pnpm lint` passam.

## Design técnico

- O conteúdo é um HTML servido em iframe **same-origin** (`/api/proxy-html/...`) — dá para injetar um `<style>` no documento do iframe após o load.
- Novo helper `frontend/lib/readingPrefs.ts`: tipo `ReadingPrefs { fontScale: number; weight: "regular" | "medium"; lineHeight: number }`, `loadReadingPrefs()/saveReadingPrefs()` sobre `localStorage` (chave `pp7ias.reading-prefs`), com defaults e sanitização.
- Novo componente client `ReadingPrefsControl` montado no `ViewContentFrame`, que:
  - renderiza toolbar compacta (A−/A+, peso, espaçamento, reset);
  - aplica as prefs injetando/atualizando um `<style id="pp7ias-reading-prefs">` no `document` do iframe (`font-size` percentual no `html`, `font-weight` e `line-height` no `body`), re-aplicado a cada load do iframe.
- Sem mudança nas camadas domain/application (feature puramente de apresentação nesta v1).

**Desvio declarado**: persistência em `localStorage`, não no perfil do usuário. Salvar no perfil exige coluna/tabela nova (migração de banco = alto risco, precisa de aprovação explícita — AGENTS.md). Migração sugerida para v2: tabela `user_preferences (user_id, reading_prefs jsonb)` + endpoint. A interface do helper já isola o storage para facilitar a troca.

## Fora de escopo

- Persistência no perfil/banco (v2, ver desvio).
- Controles de tipografia fora das páginas de leitura (ex.: cards, home).
