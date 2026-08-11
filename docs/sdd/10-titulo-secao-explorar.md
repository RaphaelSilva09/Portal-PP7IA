# T10 — Título/CTA da seção "Explorar" na home

## Requisito (PP7I-260811-1800, item 1.1)

"Atual: 'Explorar os sete blocos'. Novo: 'Índice do conteúdo publicado'."

## Critérios de aceite

1. O botão principal do hero (`/`) mostra "Índice do conteúdo publicado" no lugar de "Explorar os 7 blocos", com o mesmo destino (`/explorar`).
2. O slide "Explorar" do carrossel da home (T8) mostra o mesmo texto novo.
3. O link de volta ao Explorar na página 404 mostra o mesmo texto novo — mesma âncora, mesmo destino, por consistência.
4. Ambientes onde o admin nunca configurou esse campo (fallback puro) também mostram o texto novo — corrigir o default na entidade, não só o valor salvo no banco.
5. `pnpm test` e `pnpm lint` passam em `frontend/`.

## Design técnico

- Campo administrável: seção "Hero", campo `btn1` (label no admin: "Botão principal") — pode ser editado direto em `/admin` → Configuração da Home, sem deploy. Mas o mesmo texto também vive hardcoded em 2 lugares fora do `homepage_config`, então o ajuste completo exige código:
  - Fallback do campo: `app/page.tsx:104` — trocar o 3º argumento de `t(s, "btn1", "Explorar os 7 blocos")` para `"Índice do conteúdo publicado"`.
  - Default da entidade (usado só se a leitura do banco falhar por completo): `domain/entities/HomepageConfig.ts:111` (`btn1: "Explorar os 7 blocos"`).
  - Slide do carrossel (hardcoded, não vem do `homepage_config`): `app/page.tsx:553` (`title: "Explorar os 7 blocos"`).
  - Link da página 404: `app/not-found.tsx:36`.
- Valor hoje salvo no banco de **dev** (`homepage_config.sections[hero].texts.btn1`) já é `"Explorar os 7 blocos"` — igual ao fallback, confirmado por leitura direta do banco nesta análise. Se produção já tiver sido customizada pelo admin para outro texto, esse valor prevalece sobre o fallback e precisa ser corrigido à parte — via `/admin` ou um `UPDATE` pontual em `homepage_config`, no mesmo padrão idempotente de `frontend/sql/sync_homepage_texts.sql` (só substitui se o valor salvo ainda for o texto antigo conhecido).
- Escopo ampliado das 1 ocorrência citada no documento para as 3 ocorrências reais do mesmo texto (`btn1`, carrossel, 404) — decisão de manter a cópia consistente em toda a home; vale confirmar com Davi/Paulo se algum desses lugares deveria manter o texto antigo.

## Fora de escopo

- Renomear a rota `/explorar` em si, ou o `<title>` da página (`app/explorar/page.tsx:7`) — o pedido é sobre o texto do CTA na home, não da página de destino.
- Sincronizar o banco de produção automaticamente — exige acesso que este ambiente não tem; confirmar valor atual em produção antes de aplicar.
