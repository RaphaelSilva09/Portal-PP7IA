# C — TLS, HSTS, CSP e isolamento de documentos

Agente: C — Segurança. Escopo conforme `PP7IAS_Plano_de_Correcao_com_Subagentes.md`, seção 4.
Baseline: branch `develop`, worktree `agent-af431701345db4657`, commit `1613234e7155e8eade40a076c4c431f4b681f4f6`.
Ferramentas locais: `pnpm build` (Next 16.1.1, webpack), `pnpm start -p 3811`, `curl -D -`, `pnpm lint`, `pnpm test`.

## 1. Achados confirmados no repositório

- `frontend/next.config.ts` define `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`,
  `X-XSS-Protection` e `Referrer-Policy`, mas **não define `Content-Security-Policy` nem
  `Strict-Transport-Security`** — confirmado por grep antes desta mudança. Bate com o achado do
  HTTP Observatory (CSP ausente, HSTS ausente).
- `frontend/components/ViewIframe.tsx` usa
  `sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"`.
  `allow-scripts` + `allow-same-origin` juntos no mesmo `sandbox`, servindo conteúdo pela mesma
  origem (`/api/proxy-html/[type]/[slug]`), **não constituem isolamento real**: um HTML publicado que
  execute script malicioso teria acesso de leitura/escrita ao próprio documento do iframe como se
  não houvesse sandbox (o sandbox só reforça a política de origem quando a origem do conteúdo é
  realmente separada). Hoje o conteúdo é "curado pelo admin", não é entrada de usuário anônimo — o
  risco real é admin comprometido ou HTML de terceiros colado sem revisão, não usuário final.
- `frontend/app/api/proxy-html/[type]/[slug]/route.ts` já define `X-Frame-Options: SAMEORIGIN`,
  `X-Content-Type-Options`, `X-XSS-Protection` e `Cache-Control: no-store` por rota — não tem CSP
  própria, herda apenas o header do `next.config.ts` (mesmo esquema para app pages e proxy).
- Domínio está atrás de **Cloudflare** (confirmado no plano/anexos; não verificável a partir deste
  worktree — nenhum acesso a DNS/painel Cloudflare disponível a este agente).
- Inventário de origens externas usadas pelo app (grep em `app/`, `components/`, `lib/`):
  - `next/font/google` (Inter, Instrument Serif, Lora): self-hosted em build-time — **sem** chamada
    de runtime a `fonts.googleapis.com`/`fonts.gstatic.com`.
  - `@vercel/analytics/next`: carregado condicionalmente
    (`NODE_ENV=production && NEXT_PUBLIC_VERCEL_ANALYTICS=true`); em hosts fora da Vercel (aqui:
    Railway) o pacote injeta script e beacon apontando para
    `https://va.vercel-scripts.com` / `https://vitals.vercel-insights.com` — não confirmado em
    runtime local (flag desligada neste build), listado como origem a validar na fase Report-Only.
  - `cdn.jsdelivr.net/npm/eruda@3/eruda.js`: console de debug mobile, carregado **apenas** quando
    `NEXT_PUBLIC_AUTH_DEBUG=true` (`frontend/app/layout.tsx`). Não deveria estar ligado em produção;
    mantido na política porque a env pode ser ligada em qualquer ambiente sem novo deploy.
  - Nenhum outro `fetch()` a domínio externo, nenhum outro `<iframe>` além de `ViewIframe.tsx`,
    nenhum `next.config.ts` `images.remotePatterns` configurado (sem imagens remotas via
    `next/image`), nenhum WebSocket/EventSource client-side.
  - `GEMINI_API_KEY`/Gemini (RAG/chat) e Resend são chamados **apenas no servidor**
    (`lib/email/weekly-digest.ts`, infra de chat) — não aparecem em `connect-src` do navegador.
- Renderização: `pnpm build` mostra páginas de conteúdo como estáticas (`○`) com
  `x-nextjs-prerender: 1` / cache HIT observado em `curl` local. Isso confirma o alerta do plano:
  nonce de CSP por requisição exigiria tornar essas rotas dinâmicas, o que é uma decisão de
  arquitetura/custo que não me cabe tomar sozinho (afeta D — performance/cache).
- HTML renderizado (`curl http://127.0.0.1:3811/` após `pnpm build && pnpm start`) contém:
  - ~26 `<script>` inline sem `src` por carga de página (payload RSC do App Router e o script de
    tema anti-flash de `next-themes`) — **sem nonce/hash**.
  - Múltiplos atributos `style="..."` inline (React inline styles) em quase todo componente.
  Isso significa que `script-src 'self'` **sem** `'unsafe-inline'` ou nonce **quebraria a
  hidratação de toda página** sob enforcement, e `style-src 'self'` sem `'unsafe-inline'` quebraria
  qualquer componente com estilo inline. Este é um limite conhecido do Next.js App Router, não um
  bug deste repositório.

## 2. Política CSP proposta (Report-Only) por classe de rota

Implementada em `frontend/next.config.ts` como **`Content-Security-Policy-Report-Only`**, aplicada
a `/:path*` (mesmo escopo dos demais headers de segurança já existentes). **Não está em
enforcement** — apenas observa e loga violações no console do navegador (sem endpoint de relatório
configurado; adicionar `report-to`/`report-uri` é o próximo passo, ver seção 5).

```
default-src 'self';
script-src 'self' https://cdn.jsdelivr.net https://va.vercel-scripts.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com;
frame-src 'self';
frame-ancestors 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

Justificativa por diretiva:

- **`script-src` sem `'unsafe-inline'`**: proposital. O objetivo do Report-Only é medir exatamente
  quantas violações a hidratação do App Router gera (ver seção 1) antes de decidir entre
  `'unsafe-inline'` (mais simples, mais fraco) ou nonce + renderização dinâmica (mais forte, custo
  de cache/latência a coordenar com D). Não pré-decidi isso porque é uma troca arquitetural, não uma
  correção de bug.
- **`style-src 'self' 'unsafe-inline'`**: aceito com `'unsafe-inline'` desde já porque o app usa
  estilo inline do React em praticamente todo componente (Tailwind + estilos computados dinâmicos,
  ex. `ViewIframe`/`ReadingPrefsControl`); nonce de estilo teria o mesmo problema de cache que o de
  script. Risco residual: CSS injection teórica teria uma via a menos de mitigação; risco considerado
  baixo frente ao ganho de não quebrar a app, mas fica registrado como pendência de endurecimento.
- **`frame-src 'self'` e `frame-ancestors 'self'`**: o próprio portal embute
  `/api/proxy-html/{type}/{slug}` dentro de si mesmo (`/view/[type]/[slug]`) — por isso `'self'`, não
  `'none'`, em ambas as diretivas, conforme a distinção que o plano exige (quem pode ser embutido vs.
  quem pode embutir).
- **`connect-src`/`script-src` com domínios Vercel**: hipótese a confirmar em staging com
  `NEXT_PUBLIC_VERCEL_ANALYTICS=true` ligado — se o Report-Only não registrar violação nesses
  domínios, ficam confirmados; se registrar em domínio diferente, ajustar antes do enforcement.
- **`cdn.jsdelivr.net` em `script-src`**: exclusivo do eruda (debug). Se a decisão do responsável for
  "eruda nunca deve rodar em produção", a alternativa mais segura é remover esse domínio da política
  e também impedir a env `NEXT_PUBLIC_AUTH_DEBUG` de ligar em produção (mudança de infraestrutura,
  fora do meu escopo de arquivo).
- **`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`**: sem uso de plugins/objects e sem
  necessidade de submeter formulários para fora do domínio — seguro por padrão, sem evidência de
  quebra.
- **`upgrade-insecure-requests`**: inofensivo dado que o site já é HTTPS-only via Cloudflare; não
  substitui HSTS.
- Nada de `*`, `unsafe-eval` ou CORS amplo foi usado, conforme vedado pelo plano.

### O que falta antes de qualquer enforcement

1. Rodar em staging com tráfego real (inclusive fluxos de auth, `/view/*`, `/painel-admin`,
   exportação) coletando violações reais (idealmente com `report-to` configurado — endpoint próprio
   não existe hoje).
2. Decisão do responsável: `'unsafe-inline'` em `script-src` (rápido, mais fraco) vs. nonce +
   renderização dinâmica nas páginas afetadas (mais forte, custo de performance/cache a medir com D).
3. Confirmar os domínios reais do Vercel Analytics em produção (ou removê-los da política se a
   decisão for desligar analytics).
4. Só depois disso: `Content-Security-Policy` (enforcement) em staging, depois produção, em etapa
   isolada de HSTS/TLS (ver seção 4).

## 3. `X-XSS-Protection`

Mantido como está (`1; mode=block`). É um header legado (ignorado por navegadores modernos, mas
inofensivo) e removê-lo não muda a superfície de ataque real hoje protegida pelo CSP proposto; não
há indicação de popup/frame quebrando por causa dele. Não recomendo mexer sem motivo — o plano pede
para "revisar", não necessariamente remover.

## 4. Runbook — TLS e HSTS na borda Cloudflare (NÃO EXECUTADO — requer autorização e acesso ao painel)

Este agente não tem e não deve obter acesso a DNS/Cloudflare. Os passos abaixo são para o
responsável pela zona executar manualmente, em etapas separadas, cada uma testada antes da próxima.

### Pré-requisitos

- Confirmar que o certificado da borda é válido, cobre o hostname público e renova automaticamente
  (Cloudflare Universal SSL ou custom cert).
- Confirmar HTTPS estável hoje (sem downtime recorrente) antes de mexer em TLS mínimo.

### Passo 1 — TLS mínimo 1.2

1. Painel Cloudflare → domínio → **SSL/TLS → Edge Certificates → Minimum TLS Version**.
2. Selecionar **TLS 1.2** (mantém 1.2 e 1.3; desativa 1.0/1.1).
   Referência: https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/
3. Aguardar propagação (minutos) e então testar com um cliente capaz de negociar TLS 1.0/1.1
   propositalmente (ex.: `openssl s_client -connect <host>:443 -tls1` deve **falhar**;
   `-tls1_2` e um cliente TLS1.3 devem funcionar). Testar IPv4 e IPv6 se ambos publicados.
4. Registrar horário, configuração aplicada e resultado do teste.

### Passo 2 — Cipher suites (avaliação, não ação automática)

1. Painel Cloudflare → **SSL/TLS → Edge Certificates → Cipher Suites** (recurso pode exigir plano
   pago para customização — verificar disponibilidade antes de prometer).
2. Inventariar suites CBC restantes em TLS 1.2 após o passo 1 (desativar 1.0/1.1 não remove CBC de
   1.2). Se customização não estiver disponível no plano atual, registrar como risco aceito/bloqueado
   por custo — não contratar upgrade sem aprovação.
   Referência: https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/

### Passo 3 — HSTS (rollout gradual, dono da política a decidir: borda ou origem)

1. Decidir **onde** o header `Strict-Transport-Security` será emitido: Cloudflare
   (SSL/TLS → Edge Certificates → HTTP Strict Transport Security) ou na origem (`next.config.ts`).
   Não configurar nos dois lugares com valores divergentes.
2. Rollout sugerido, com aprovação em cada etapa e evidência de HTTPS estável antes de subir o
   `max-age`:
   - Etapa 1: `max-age=300` (5 min) — validar por alguns dias que nenhum fluxo HTTPS quebra.
   - Etapa 2: `max-age=86400` (1 dia).
   - Etapa 3: `max-age=15552000` (180 dias) — só depois de confirmar que não há necessidade de voltar
     para HTTP em nenhum subdomínio.
3. **Não ativar `includeSubDomains` nem `preload` por padrão.** Isso exige inventariar todos os
   subdomínios do domínio raiz e confirmar que **todos** servem HTTPS válido — decisão do
   responsável, não deste agente.
   Referência: https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/
4. Documentar que remover o header depois não limpa o estado já salvo nos navegadores dos visitantes
   (`max-age=0` precisa ser servido por HTTPS válido e não é instantâneo para todos os clientes).

### Se a decisão for emitir HSTS pela origem (Next.js) em vez da borda

Adicionar ao mesmo bloco de headers em `frontend/next.config.ts` (não implementado nesta tarefa —
aguardando decisão do dono da política, ver passo 1):

```ts
{
    key: "Strict-Transport-Security",
    value: "max-age=300", // subir gradualmente conforme passo 3; nunca começar em 180 dias
},
```

Não incluir `includeSubDomains`/`preload` sem o inventário de subdomínios do passo 3.3.

## 5. Isolamento de documentos (`ViewIframe` / `proxy-html`) — proposta, não implementada

Não alterei `frontend/components/ViewIframe.tsx` nesta tarefa: o plano classifica isolamento de
origem como decisão arquitetural que pode exigir aprovação, e o conteúdo hoje é HTML curado por
admin (não input de usuário anônimo), reduzindo a urgência frente ao risco de quebrar exportação/
leitura em produção sem teste em staging. Registrado como pendência com duas opções:

- **Opção mínima (sem mudar arquitetura):** manter `allow-same-origin` + `allow-scripts` (ambos são
  necessários hoje: o código lê `iframe.contentDocument` para aplicar preferências de leitura,
  calcular altura e reescrever links — isso exige `allow-same-origin`; o HTML publicado pode conter
  `<script>` do editor de conteúdo, o que exige `allow-scripts`). Reduzir o risco por outra via: CSP
  própria na resposta de `/api/proxy-html/*` (`frame-ancestors 'self'`, já coberto pela política
  proposta) e continuar sem sanitização automática — mas reforçar processo editorial (revisão humana
  do HTML antes de publicar), que é controle de processo, não de código.
- **Opção forte (fora de escopo desta tarefa):** servir `/api/proxy-html/*` a partir de uma origem
  separada (subdomínio dedicado, ex. `content.pp7ias-portal.com.br`), o que faria `allow-same-origin`
  deixar de equivaler a "mesma origem que o portal" de fato. Isso exige DNS/certificado novo
  (Cloudflare) e pode quebrar `postMessage`/leitura de `contentDocument` do jeito que o componente
  usa hoje — precisaria de novo contrato de comunicação pai/iframe. Decisão do responsável.

## 6. Mudança implementada nesta tarefa

- `frontend/next.config.ts`: adicionado `Content-Security-Policy-Report-Only` (ver política acima)
  ao bloco de headers já existente. Nenhuma outra diretiva/mudança de comportamento.
- Nenhuma mudança em `ViewIframe.tsx`, `proxy-html/route.ts`, TLS, HSTS, DNS, Cloudflare ou produção.

## 7. Verificação executada

- `pnpm build` (Next 16.1.1, webpack) — sucesso, sem erros novos.
- `pnpm start -p 3811` + `curl -D -` em `/`, `/home`, `/newsletter`, `/api/proxy-html/newsletter/xxx`
  — `Content-Security-Policy-Report-Only` presente em todas as respostas testadas (200, 307, 404),
  demais headers de segurança preservados sem alteração.
- Inspeção do HTML renderizado confirmou scripts/estilos inline do próprio Next.js (ver seção 1) —
  usado para justificar a política acima, não para "passar" um scanner.
- `pnpm lint`: 14 erros / 32 avisos pré-existentes em arquivos não tocados por esta tarefa (ex.
  `axioma/*`, `GroqProvider.ts`); nenhum erro em `next.config.ts`. Não corrigidos aqui — fora do
  escopo C (auth modal, front-end, etc. pertencem a outros agentes).
- `pnpm test`: 70 arquivos, 478 testes, todos passando.
