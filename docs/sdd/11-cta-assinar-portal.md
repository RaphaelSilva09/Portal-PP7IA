# T11 — CTA de assinatura do hero

## Requisito (PP7I-260811-1800, item 1.2)

"Atual: 'Receber a newsletter'. Novo: 'Assinar o portal'."

## Critérios de aceite

1. O botão secundário do hero mostra "Assinar o portal" em vez de "Receber a newsletter", mantendo o link `#newsletter` (rola até a seção de assinatura real).
2. O fallback/default da entidade também é atualizado, para ambientes sem configuração salva no banco.
3. `pnpm test` e `pnpm lint` passam em `frontend/`.

## Design técnico

- Só 2 pontos de código, ambos parte do mesmo campo administrável (`btn2`, seção "Hero", label no admin: "Botão secundário") — mais simples que T10/T12, sem outras réplicas hardcoded do mesmo texto no site:
  - `app/page.tsx:113` — `t(s, "btn2", "Receber a newsletter")`.
  - `domain/entities/HomepageConfig.ts:112` — default da entidade (`btn2: "Receber a newsletter"`).
- Confirmado por leitura direta do banco de dev: `homepage_config.sections[hero].texts.btn2` = `"Receber a newsletter"` — igual ao fallback, sem customização prévia do admin a considerar em dev.
- Caminho sem deploy: editar direto em `/admin` → Configuração da Home → Hero → "Botão secundário". De qualquer forma, atualizar os 2 pontos de código para manter os defaults corretos em ambientes novos/resetados.

## Fora de escopo

- Mudar o destino do botão (`href="#newsletter"`) ou o comportamento do formulário de assinatura (`components/home/NewsletterForm.tsx`) — só o texto do CTA muda, não o fluxo.
- Sincronizar produção — mesma ressalva do T10 (confirmar o valor salvo lá antes de assumir que é igual ao de dev).
