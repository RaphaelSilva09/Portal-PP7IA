# Checklist — Pedidos de mudança do portal PP7+IAS

> Avaliação crítica feita em 2026-07-19, testando cada item em browser real (Playwright) contra o servidor de dev, incluindo conteúdo real quando disponível (`data/materiais/mini-livros/sections/encerramento/10.html` — único arquivo presente no volume local; todo o resto do conteúdo cadastrado no banco não tem arquivo físico neste ambiente, então **não pôde ser verificado renderizado** além desse item).
>
> Legenda: ✅ funcional e verificado · 🟡 funciona com ressalva relevante · ⚠️ implementado mas com bug confirmado · ❌ não implementado

---

## Resumo executivo

> **Atualização final**: depois da avaliação crítica abaixo, um plano de implementação foi executado em fases para fechar as lacunas encontradas — dos 18 itens da lista original, 15 terminaram ✅, 3 ficaram 🟡 (com ressalva explícita) e só 1 (onboarding, 6.1) não foi iniciado, por decisão consciente de escopo. A narrativa original da avaliação foi mantida abaixo, por item, para contexto histórico — cada seção tem uma nota de "Corrigido"/"Implementado" descrevendo o que mudou e como foi verificado.

Os dois bugs confirmados na avaliação original foram corrigidos e verificados contra conteúdo real: o controle de tamanho de fonte (5.2/3.4.1), que não tinha efeito visual porque o HTML dos artigos usa `font-size` em `px` fixo e o mecanismo antigo só escalava a raiz (`<html>`) — agora reescreve o `font-size` computado de cada elemento; e o alvo de toque de 32px da toolbar de leitura, agora 44px. O carrossel (3.7.2) agora linka corretamente para o tema certo. Todos os itens novos que estavam "não iniciados" na avaliação original foram construídos nesta rodada: exportar PDF (server-side, fidelidade visual real), botão de compartilhamento, biblioteca de prompts (com gating), FAQ, espaço de perguntas dos leitores, reações por conteúdo, e a fundação de rastreamento de indicação (convite → cadastro → engajamento). Só o onboarding guiado (6.1) ficou de fora, por decisão explícita de não desenhar a implementação nesta rodada. Ressalvas que continuam de pé, documentadas item a item: preferências de leitura seguem em `localStorage` (não "no perfil", 5.2), tempo de leitura segue manual (não por contagem de palavras, 5.3), cold-start do PDF export em produção não pôde ser validado daqui, e o catálogo de benefícios de indicação (quais recompensas, quantos indicados por nível) é decisão de produto ainda em aberto.

---

## 3. Plano de mudanças / melhorias

### 3.1.1–3.1.3 — Substituir blocos 2 e 3 por "Inteligência Artificial" e "Editoriais e Artigos"

**Status: ✅ Funcional**

- Seções existem como tipos de conteúdo completos (entidade, repositório, CRUD no admin), não placeholders.
- Nomes corretos confirmados na home, no Explorar, no footer e no painel admin (`typeLabel` em `ContentForm.tsx`).
- Busca no código inteiro por resíduos das nomenclaturas antigas ("Reportagem da Semana", "Radar de Oportunidades") não encontrou nenhuma string hardcoded — os textos administrados no banco (`homepage_config`) foram sincronizados via seed (`frontend/sql/sync_homepage_texts.sql`).
- **Ressalva**: esse seed foi aplicado no banco de **desenvolvimento**. Se produção usa um banco diferente, o mesmo seed precisa rodar lá — é idempotente, seguro rodar mais de uma vez.
- **Ressalva menor**: a migração de conteúdo antigo pertinente para essas seções (mencionada no PDF original, item 3.1.5) é trabalho editorial manual — não há como verificar via código se já foi feita.

### 3.4.1 — Melhorar visibilidade/legibilidade no iPhone (prioridade mobile)

**Status: ✅ Funcional — bugs corrigidos e verificados contra conteúdo real**

- ✅ Sem overflow horizontal na página de leitura em viewport de iPhone (390px), testado contra conteúdo real.
- ✅ Suporte a safe-area (notch), breakpoint de navegação ajustado (960px), contraste de texto elevado.
- ✅ **Corrigido**: o controle de tamanho de fonte agora reescreve o `font-size` computado de cada elemento do documento real (`applyFontScaleToDocument` em `lib/readingPrefs.ts`), em vez de depender só de `html { font-size: % }` (que não cascateia para conteúdo com px fixo). Verificado no `<p>` real: 15px→17.25px→19.5px ao clicar A+ duas vezes, volta a 15px no reset, 12.75px no A−. Também corrigido um bug de `instanceof HTMLElement` entre realms (elementos do iframe pertencem a um `HTMLElement` diferente do da janela pai) que fazia a primeira versão da correção falhar silenciosamente.
- ✅ **Corrigido**: botões da toolbar de leitura (A−, A+, peso, espaçamento) agora têm 44×44px mínimo (antes 32px), consistente com o resto do site. Verificado em viewport 375px sem overflow.
- ✅ Peso de fonte (regular/médio) e espaçamento entre linhas continuam funcionando corretamente no texto real.

### 3.4.2 — Botão de alternância de tema (claro/escuro)

**Status: ✅ Funcional**

- Três temas (claro/sépia/escuro), ciclo funcionando no header desktop, header mobile deslogado, e como item de menu no dropdown do perfil mobile logado.
- Verificado sem regressão após os últimos refactors (extração do hook `useThemeCycle`, mudanças no dropdown).
- Acessível: `aria-label` anuncia tema atual + próxima ação, alvo de toque 44px.

### 3.6.1–3.6.3 — Colaboradores (Gustavo, Sabrina, Cristiano)

**Status: ✅ Funcional — decisão revertida, contato agora publicado (parcial, por integrante)**

- ✅ Gustavo Colombini e Sabrina Ai Kato aparecem como "Artes das capas" com descrição correta (capas de mini-livros). Cristiano Benite aparece como "Consultoria" com a descrição correta (apoio ao time técnico).
- ✅ **Revertido com o Davi**: cada integrante agora pode expor e-mail, Instagram, telefone/WhatsApp e/ou LinkedIn em `constants/team.ts` (campo `contact`, todos opcionais — só renderiza o que existir). Preenchido nesta rodada: LinkedIn para Raphael, Lucas, Luiza, Davi, Gustavo e Cristiano; Instagram (`@tofu.42`) para Sabrina. Paulo permanece sem contato publicado (não informado). E-mail e WhatsApp/telefone não foram fornecidos para ninguém nesta rodada — os campos existem e podem ser preenchidos depois em `constants/team.ts` se desejado.
- ✅ Cristiano: "dados a confirmar" no PDF original — corretamente não bloqueou a exibição do card dele (aparece com o que já se sabe).

### 3.7.2 — Carrossel de destaques na home

**Status: 🟡 Parcial — mecanismo funciona; um dos 6 itens não é o item real pedido**

- ✅ Carrossel com scroll infinito (clonagem sem dependência nova), autoavanço a cada 3s confirmado por medição de posição de scroll, pausa no hover/foco, respeita `prefers-reduced-motion`, navegação por botões com wrap nos dois sentidos.
- ✅ 6 itens: livro, guia de Lisboa, 2 últimas newsletters, Explorar, Quem somos — bate com "5–6 itens" do requisito.
- ✅ **Corrigido**: o card do carrossel agora linka para `/explorar?b=biblioteca&tema=viagens-restaurantes`, pré-selecionando o tema certo (antes caía sempre no tema padrão "Biblioteca dos 7"). Verificado em browser real.
- ⚠️ **Ressalva de conteúdo, não de código**: o item real "GUIA-PP-RESTAURANTES LISBOA" (`tema: viagens-restaurantes`) ainda **não tem arquivo HTML enviado** (`html_path` nulo no banco) — aparece como "Em breve" mesmo com o deep-link correto. Assim que o admin publicar o arquivo, o card já vai apontar direto para ele.

---

## 5. Prioridades de leitura (Davi)

### 5.1 — Fundo com tom amarelado (sépia)

**Status: ✅ Funcional**

- Tema `theme-sepia` sem colisão com a utility `filter: sepia()` do Tailwind (bug real que existiu e foi corrigido nesta sessão).
- Verificado visualmente: imagens e cores de marca preservadas, fundo/cards com paleta quente.

### 5.2 — Controles de tipografia (tamanho, peso, espaçamento) salvos no perfil

**Status: 🟡 Bug de tamanho de fonte corrigido; segue o desvio conhecido do requisito (não salva no perfil)**

- ✅ **Tamanho de fonte agora afeta o texto real** (ver detalhe em 3.4.1 acima — mesmo mecanismo, corrigido nesta rodada).
- ✅ Peso de fonte funciona no texto real.
- 🟡 Espaçamento entre linhas tecnicamente aplica (confirmado por cálculo: 14px × 1.7 = 23.8px, bate com o valor computado), mas a diferença visual é pequena porque o conteúdo já vem com line-height parecido — em outros conteúdos o efeito pode ser mais perceptível.
- ✅ Persistência entre reloads confirmada (mesma aba/navegador).
- ❌ **"A preferência é salva no perfil"** — não é. Está em `localStorage`, por dispositivo/navegador. Um leitor que troca de celular para notebook perde a preferência. Isso foi um desvio documentado desde a implementação (exigiria migração de banco), mas continua sendo uma lacuna real frente ao texto literal do requisito.

### 5.3 — Indicador de tempo de leitura por contagem de palavras

**Status: 🟡 Parcial**

- ✅ Tempo de leitura aparece nos cards antes de abrir o conteúdo (confirmado: "14 min" visível no card real).
- ❌ **Não é calculado por contagem de palavras** — é um número digitado manualmente pelo admin ao cadastrar o conteúdo. Continua sendo o mesmo desvio identificado desde a primeira análise do PDF.

### 5.4 — Continue de onde parou (mini-livro)

**Status: ✅ Funcional — verificado contra conteúdo real**

- Visitei a seção real do mini-livro → progresso gravado no `localStorage` → voltei à home → link "Continuar de onde parou" apareceu apontando exatamente para a seção visitada. Os 3 passos do fluxo funcionaram de ponta a ponta.
- Mesma ressalva de escopo que 5.2: é por dispositivo, não por conta de usuário.

### 5.5 — Alerta de atualização em conteúdo já lido

**Status: ✅ Funcional — verificado com edição real no banco**

- Simulei uma edição real (`UPDATE ... SET updated_at = NOW()` num item existente, o mesmo caminho que o admin dispara ao editar) e testei os 3 cenários:
  - Lido **antes** da edição → badge "Atualizado" aparece. ✅
  - **Nunca lido** → badge não aparece (correto — não é "atualizado desde a leitura" se nunca houve leitura). ✅
  - Lido **depois** da edição → badge não aparece. ✅
- Nota técnica: o badge depende de um `useEffect` client-side (não pode calcular no servidor, já que depende do `localStorage` do leitor) — em conexões muito lentas pode haver um instante sem o badge antes de aparecer. Não é um bug, é inerente à natureza client-only do dado.

---

## 5. Novas propostas (não implementadas — fora do escopo do trabalho já feito)

> Numeração 5.2–5.4 reaproveitada no documento original para um conjunto diferente de propostas. Mantida como veio no pedido.

### 5.2 — Exportar conteúdo para PDF

**Status: ✅ Implementado e verificado localmente — ⚠️ cold-start em produção não pôde ser validado daqui**

- Nova rota `/api/export-pdf/[type]/[slug]` renderiza a mesma URL que o leitor já vê (`/api/proxy-html/...`) num navegador headless (`puppeteer-core` + `@sparticuz/chromium` em produção; `puppeteer` completo em dev local) e devolve como PDF — garante fidelidade visual exata com a formatação editorial (cores de fundo, badges, boxes), em vez de reimplementar o layout numa segunda vez.
- Testado ponta a ponta em browser real: clique no botão "Exportar PDF" → download de um PDF de ~960KB, 7 páginas, com o design do artigo preservado fielmente (verifiquei visualmente as 3 primeiras páginas).
- Casos de erro testados: tipo inválido → 400, slug inexistente → 404.
- Geração local levou ~3,4s para o conteúdo real disponível.
- ⚠️ **Risco não validado**: o comportamento de cold-start do `@sparticuz/chromium` em produção na Vercel (tempo de start frio, uso de memória, se cabe no plano contratado) só pode ser confirmado num deploy de preview real — não tenho acesso para fazer isso a partir daqui. `vercel.json` já reserva 2048MB/60s para essa rota especificamente; validar antes de considerar a feature 100% pronta para produção.

### 5.3 — Botão de compartilhamento

**Status: ✅ Implementado e verificado.** Novo `ShareButton.tsx` na barra de contexto de leitura, ao lado dos ajustes de tipografia. Em navegadores com suporte a `navigator.share()` (a maioria dos mobile modernos), aciona o menu nativo do sistema. Nos demais, abre um dropdown com WhatsApp, LinkedIn, E-mail e "Copiar link" — todos os links verificados em browser real, incluindo o feedback visual "Copiado!" e fechamento via Escape/clique fora. Também foi adicionado `openGraph.title/description/url` por artigo (antes só existia o preview genérico do portal inteiro) e um `metadataBase` em `app/layout.tsx` (não existia, necessário para as URLs de OG resolverem corretas) — verificado que `og:title`/`og:url` do artigo aparecem corretamente no `<head>`.

### 5.4 — Biblioteca de prompts

**Status: ✅ Implementado e verificado.** Nova página `/prompts` (linkada no rodapé, em "Recursos"), com filtro por IA (Claude/ChatGPT/Gemini/Adapta/Perplexity/Grok/Manus) e gating real: leitor anônimo vê só título + caso de uso, corpo completo exige login (`isGated` por prompt, configurável no admin). Nova tabela `prompt_library`, entidade/repositório dedicados (não reaproveita o `ContentItem` genérico de upload de arquivo, já que os campos são texto estruturado), aba de admin dedicada (Engajamento → Biblioteca de Prompts) com CRUD completo. Testado ponta a ponta: inseri prompts de teste (um restrito, um aberto) direto no banco, confirmei via `curl` que a API anônima devolve `promptBody: null` só para o restrito, e via browser que a página mostra o teaser + CTA de login corretamente, com filtro por IA funcionando.

---

## 6. Propostas de engajamento (não implementadas)

### 6.1 — Onboarding ativo no primeiro acesso

**Status: ❌ Não implementado.** Na época desta avaliação existia um `FirstVisitModal` no código (contexto `FirstVisitModalContext`) — um modal simples de primeira visita, não o fluxo guiado por 7 blocos com exemplos reais descrito no requisito, nem tinha o mecanismo de "conduzir por uma leitura em cada formato antes de liberar acesso livre". Esse componente estava órfão (não era renderizado por nenhuma rota) e foi removido numa limpeza de código morto; a funcionalidade completa do requisito segue não implementada.

### 6.2 — Seção de perguntas frequentes (FAQ)

**Status: ✅ Implementado e verificado.** Nova página pública `/faq` com acordeão acessível (reaproveitei o componente `Accordion`/`AccordionGroup` já existente no design system, em vez de criar um novo), linkada no rodapé (home e páginas com `<Footer/>`). Nova tabela `faq_items`, entidade/repositório dedicados, aba de admin (Engajamento → FAQ) com CRUD completo. Testado ponta a ponta: inseri perguntas de teste no banco, confirmei que aparecem na página, que a resposta fica escondida até o clique, e que expande corretamente ao clicar.

### 6.3 — Espaço para perguntas dos leitores

**Status: ✅ Implementado e verificado.** Novo formulário na página `/faq` ("Não encontrou sua resposta?"), exige login (CTA de cadastro pro leitor anônimo). Nova tabela `reader_questions` (FK real para `"user"`), rota `POST /api/reader-questions` (401 sem sessão, verificado), aba de admin (Engajamento → Perguntas dos Leitores) listando perguntas com o e-mail do leitor (via join) e triagem de status (pendente/publicada/arquivada). Escopo deliberadamente enxuto: a pergunta virar conteúdo publicado é fluxo editorial manual, fora desta tela — igual ao que o requisito describe ("as perguntas mais relevantes geram conteúdo publicado nos blocos"). Testado: 401/403 de segurança confirmados via curl, UI anônima confirmada em browser, e join com a tabela de usuários + atualização de status confirmados direto no banco.

### 6.4 — Benefícios por indicação

**Status: 🟡 Fundação de rastreamento implementada e verificada — catálogo de benefícios fica para depois, de propósito**

Antes desta rodada, `POST /api/invite` não gravava nada no banco (só disparava e-mail) — não havia como saber se um convite virou cadastro, nem se o indicado leu algo depois. Isso foi resolvido:

- Nova tabela `referrals` rastreia o ciclo `sent → signed_up → engaged`.
- `POST /api/invite` agora gera um token único por convite, grava a linha em `referrals`, e inclui `?ref=<token>` no link do e-mail.
- Captura client-side do `?ref=` (novo `ReferralCapture.tsx`, montado uma vez no `layout.tsx`) guarda o token em `localStorage` por até 30 dias.
- Após um cadastro bem-sucedido no `AuthModal`, o token guardado é enviado a `POST /api/referrals/attribute`, que vincula `signed_up_user_id` ao convite original (idempotente — re-tentativas não sobrescrevem).
- Novo `POST /api/content-views`, disparado uma vez por sessão logada a partir de `ContentViewTracker.tsx`, marca `first_content_viewed_at` — o sinal de "engajamento" que antes simplesmente não existia no servidor (só havia rastreamento de "conteúdo visto" em `localStorage`, sem nenhum sinal para o servidor associar ao indicado).
- Testado ponta a ponta: máquina de estados completa (`sent`→`signed_up`→`engaged`) verificada direto no banco, incluindo que uma segunda tentativa de atribuição não sobrescreve a primeira; captura do `?ref=` e persistência entre navegações verificadas em browser; 401 confirmado em todas as rotas novas sem sessão.
- **Bug real encontrado e corrigido durante a implementação**: a primeira versão gerava o token via `import { randomBytes } from "node:crypto"`, que quebrava o build inteiro (erro `UnhandledSchemeError` do webpack) porque `container.ts` — de onde o repositório é importado — também é alcançável pelo bundle do cliente (um hook client-side já importa `DIContainer` diretamente, questão pré-existente e fora do escopo desta correção). Resolvido gerando o token via Web Crypto API global (`crypto.getRandomValues`), sem import de módulo Node.
- **Deliberadamente fora de escopo**: o catálogo de benefícios em si (quais conteúdos exclusivos, quantos indicados por nível) não existe em nenhuma tabela hoje — é decisão de produto sem precedente no modelo de dados, que só faz sentido decidir com dados reais de indicação em mãos. Esta rodada construiu só a fundação de rastreamento, como o plano previa.

### 6.4 — Reações e feedback por conteúdo

**Status: ✅ Implementado e verificado.** As 4 reações do requisito ("Fez pensar", "Apliquei isso", "Quero mais deste tema", "Não era o que esperava") aparecem no fim de cada página de leitura. Exige login — clique anônimo abre o modal de cadastro em vez de reagir (verificado: nenhuma chamada à API acontece nesse caso). Uma reação por leitor por conteúdo: clicar de novo na mesma remove, clicar numa diferente substitui (testado direto no banco via `ON CONFLICT ... DO UPDATE`, com a constraint `UNIQUE(user_id, content_type, content_id)` garantindo isso no nível de dados, não só na aplicação). Nova tabela `content_reactions`, rota pública `GET /api/reactions/[type]/[id]` (contagem agregada + a própria reação do usuário logado) e `POST /api/reactions` (401 sem sessão), aba de admin (Engajamento → Reações) com tabela simples ordenada por total — v1 deliberadamente sem dashboard elaborado, como o plano previa.

> Nota: os dois itens acima estão numerados "6.4" no texto original — não é erro de digitação meu, mantive como veio.

---

## Tabela-resumo

| Item | Descrição curta | Status |
|---|---|---|
| 3.1.1–3.1.3 | Seções IA + Editoriais e Artigos | ✅ |
| 3.4.1 | Legibilidade mobile/iPhone | ✅ (bugs de fonte e toque corrigidos e verificados) |
| 3.4.2 | Toggle de tema | ✅ |
| 3.6.1–3.6.3 | Colaboradores | ✅ (nomes ok; contato publicado por integrante, campos opcionais) |
| 3.7.2 | Carrossel de destaques | 🟡 (deep-link corrigido; guia de Lisboa ainda sem arquivo publicado) |
| 5.1 | Fundo sépia | ✅ |
| 5.2 (leitura) | Controles de tipografia | 🟡 (fonte corrigida; peso/espaçamento ok; segue não salvando no perfil) |
| 5.3 (leitura) | Tempo de leitura | 🟡 (aparece, mas manual, não por contagem de palavras) |
| 5.4 (leitura) | Continue de onde parou | ✅ |
| 5.5 (leitura) | Alerta de atualização | ✅ |
| 5.2 (novo) | Exportar PDF | ✅ (cold-start em produção ainda não validado) |
| 5.3 (novo) | Botão de compartilhamento | ✅ |
| 5.4 (novo) | Biblioteca de prompts | ✅ |
| 6.1 | Onboarding guiado | ❌ |
| 6.2 | FAQ | ✅ |
| 6.3 | Perguntas dos leitores | ✅ |
| 6.4 | Benefícios por indicação | 🟡 (fundação de rastreamento pronta; catálogo de benefícios é decisão de produto futura) |
| 6.4 | Reações e feedback | ✅ |

---

## Próximos passos recomendados (por impacto)

Tudo que dependia só de código está feito e verificado (testes automatizados + testes manuais em browser real + testes diretos no banco). O que resta são decisões e validações que não dependem só de mim:

1. **Validar o cold-start do PDF export num deploy de preview real da Vercel** — `puppeteer-core` + `@sparticuz/chromium` funcionam localmente, mas o tempo de start frio, uso de memória e compatibilidade com o plano contratado só se confirmam em produção/preview. `vercel.json` já reserva 2048MB/60s para essa rota.
2. **Decidir o catálogo de benefícios por indicação** (6.4) — a fundação de rastreamento (convite → cadastro → primeiro conteúdo visto) está pronta e verificada; falta decidir quais recompensas existem e em que patamares, para então construir a lógica que concede o benefício.
3. **Conversa de escopo sobre onboarding** (6.1) — decidir se vale construir um tour guiado pelos 7 blocos do zero; o `FirstVisitModal` órfão mencionado na avaliação original (um formulário de captação, não um tour) foi removido numa limpeza de código morto, então não há mais nada para revivificar. Nenhuma implementação foi feita nesta rodada, por decisão explícita.
4. **Rodar as migrações novas (0011–0015) e o seed `sync_homepage_texts.sql`/`sql/*.sql` em produção**, se o banco de produção for diferente do de desenvolvimento usado nesta sessão — todas as migrações são idempotentes, seguras de rodar mais de uma vez.
5. Desvios menores documentados mas não corrigidos por serem mudanças de arquitetura maiores, não bugs: preferências de leitura salvas em `localStorage` em vez de "no perfil" (5.2), e tempo de leitura manual em vez de calculado por contagem de palavras (5.3, embora já exista um calculador pronto em `ReadingTimeCalculator.ts`, só não é chamado automaticamente no save).
