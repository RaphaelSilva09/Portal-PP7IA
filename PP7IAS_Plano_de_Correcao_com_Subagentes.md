# PP7+IAS — Plano executável de correção com subagentes

Data de consolidação: 28/08/2026. Destinatário: agente de desenvolvimento com acesso ao repositório do portal.

## 0. Instrução de execução

Você é o agente coordenador responsável por investigar, implementar e verificar as correções deste plano no portal https://pp7ias-portal.com.br/. Execute com subagentes de escopo delimitado. Este documento é autossuficiente: não presuma acesso à conversa que o originou.

O produto é um portal editorial de tecnologia, IA e liderança, com notícias/curadoria, newsletters, biblioteca, mini-livros do autor, login e funcionalidades de conta. Preserve identidade visual, conteúdo editorial, URLs públicas e funcionamento dos materiais. A meta é corrigir causas reais e impedir regressões, não apenas aumentar notas de scanners.

Primeiro leia as instruções do repositório, descubra a implementação e reproduza o baseline. Depois execute mudanças locais reversíveis e testes sem pedir confirmação a cada pequeno ajuste. Pare somente a frente afetada quando faltar acesso, decisão editorial/jurídica, autorização de produção ou aprovação de mudança arquitetural relevante. Continue as frentes independentes.

Não faça push, publicação, alterações em DNS/Cloudflare, migrações em produção, alterações de conteúdo publicado ou disparos de e-mails reais sem autorização específica do responsável. Ter credenciais disponíveis não equivale a autorização para essas ações. Apresente o patch/runbook e a evidência do bloqueio quando necessário.

## 1. Evidências e limites

### 1.1 Arquivos de origem

Os seguintes anexos foram lidos na preparação deste plano. Procure cópias no workspace do executor; não presuma que os caminhos da sessão original existirão:

- `PageSpeed Insights Mobile.pdf`, 7 páginas.
- `PageSpeed Insights PC.pdf`, 7 páginas.
- `RelatorioAvaliacao.pdf`, 3 páginas, relatório ASES.
- `Scan results - HTTP Observatory | MDN.pdf`, 4 páginas.
- Quatro arquivos `SSL Server Test: pp7ias-portal.com.br (Powered by Qualys SSL Labs).pdf`, incluindo variantes `_1`, `_2` e `_3`, 5 páginas cada.
- Dez imagens `WhatsApp Image 2026-08-28 at 17.49.55*.jpeg`, mostrando as ocorrências 1 a 10 de contraste no axe.

Se os arquivos não estiverem disponíveis, use a transcrição abaixo como baseline histórico e gere relatórios novos. Não invente detalhes de auditorias recolhidas, seletores ocultos ou recursos não expandidos nos PDFs. Registre versão da ferramenta, commit e diferenças de estado entre execuções.

### 1.2 PageSpeed: home pública, não o portal inteiro

Fonte: PDFs Mobile e PC, páginas 1–4; execução em 28/08/2026, 17:30 BRT, Lighthouse 13.4.1.

| Indicador | Celular | Computador |
| --- | ---: | ---: |
| Desempenho | 65 | 95 |
| Acessibilidade | 95 | 95 |
| Práticas recomendadas | 100 | 100 |
| SEO | 100 | 100 |
| FCP | 3,1 s | 0,3 s |
| LCP | 7,1 s | 1,1 s |
| TBT | 60 ms | 60 ms |
| CLS | 0,001 | 0,109 |
| Speed Index | 6,6 s | 0,9 s |
| Economia estimada em imagens | 726 KiB | 730 KiB |
| JavaScript não utilizado estimado | 276 KiB | 255 KiB |

Também aparecem: imagens sem dimensões explícitas, bloqueio de renderização (estimativa 150 ms mobile/180 ms desktop), cache (13 KiB), JavaScript legado (12 KiB), duas tarefas longas, três elementos com animações não compostas, contraste e ordem de headings.

Ambos dizem “Nenhum dado” de experiência real. São métricas de laboratório: não existe INP de campo nesses anexos; TBT não é INP. Não declarar Core Web Vitals reais aprovados. Não somar economias estimadas como ganho garantido. Nota 100 de SEO não prova indexação; nota 100 de boas práticas não prova segurança. [Dados do PageSpeed](https://developers.google.com/speed/docs/insights/v5/about).

### 1.3 Dez ocorrências de contraste

Fonte: screenshots do axe, 28/08/2026, aproximadamente 17:42. Uma regra (`color-contrast`), dez ocorrências, impacto indicado como `serious`. Não são necessariamente dez causas distintas. As cores de primeiro plano reportadas podem já refletir composição de transparência.

| ID | Elemento/localização observada | Frente | Fundo | Contraste | Mínimo reportado |
| --- | --- | --- | --- | ---: | ---: |
| C01 | Palavra animada “clareza”, `.inline-block > em`, cor `--block-radar`, 72 px | `#06b6d4` | `#eef4ff` | 2,19:1 | 3:1 |
| C02 | Rótulo “Biblioteca · Viagens”, carrossel, 10 px, `--block-biblioteca` | `#14b8a6` | `#fcfdff` | 2,44:1 | 4,5:1 |
| C03 | Rótulo “Portal”, card `/explorar`, 10 px, `--block-radar` | `#06b6d4` | `#fcfdff` | 2,38:1 | 4,5:1 |
| C04 | Rótulo “PP7+IAS”, card `/quem-somos`, 10 px, `--block-ensinar` | `#ec4899` | `#fcfdff` | 3,46:1 | 4,5:1 |
| C05 | Número 01, `/explorar?b=newsletter`, 30 px | `#caddfd` | `#3b82f6` | 2,67:1 | 3:1 |
| C06 | Número 02, token `--block-reportagem`, 30 px; confirmar categoria no código | `#f0dad0` | `#f97316` | 2,08:1 | 3:1 |
| C07 | Número 03, `/explorar?b=editoriais-artigos`, 30 px | `#c0e8f6` | `#06b6d4` | 1,86:1 | 3:1 |
| C08 | Número 04, `/explorar?b=livro`, 30 px | `#efe3ce` | `#f59e0b` | 1,69:1 | 3:1 |
| C09 | Número 05, `/explorar?b=biblioteca`, 30 px | `#c2e8ed` | `#14b8a6` | 1,90:1 | 3:1 |
| C10 | Número 07, `/explorar?b=ensinar`, 30 px | `#eed2eb` | `#ec4899` | 2,52:1 | 3:1 |

Nos números, a classe observada é `font-serif text-3xl text-background/80` em um bloco colorido. Nos rótulos, `text-[10px] font-semibold` com cor de acento. Esses fragmentos são pistas de busca, não seletores de teste definitivos. O número 06 não aparece entre os dez alertas; deve ser verificado também, sem presumir aprovação.

### 1.4 ASES

Fonte: `RelatorioAvaliacao.pdf`, páginas 1–3, 28/08/2026 17:46:50.

Pontuação 88,55%; **85 ocorrências classificadas como erros críticos pelo ASES e 395 avisos**:

| Grupo/regra eMAG | Erros | Avisos |
| --- | ---: | ---: |
| 1.1 Padrões Web | 79 | 164 |
| 1.2 Organização lógica e semântica | 0 | 194 |
| 1.3 Níveis de cabeçalho | 1 | 0 |
| 1.4 Ordem de leitura e tabulação | 0 | 8 |
| 1.5 Âncoras para blocos de conteúdo | 1 | 0 |
| 1.7 Links adjacentes | 3 | 0 |
| 2.2 Objetos programáveis acessíveis | 1 | 28 |
| 6.7 Agrupamento de campos | 0 | 1 |

O PDF aponta repetidamente “linha 1”; não permite localizar 79 causas de HTML. A classificação da ferramenta não equivale à criticidade de segurança nem comprova automaticamente falha WCAG. Reproduza, agrupe por causa e use HTML servido, DOM renderizado, Nu HTML Checker, axe e testes humanos. Investigue diferenças de versão, parsing e regras eMAG; não descarte o relatório nem faça alterações sem sentido só para zerar a nota.

### 1.5 HTTP Observatory e SSL Labs

Fonte: Observatory, páginas 1–3: **C, 55/100, 8/10 testes aprovados**; CSP ausente (-25), HSTS ausente (-20). `nosniff`, `SAMEORIGIN`, Referrer-Policy e redirecionamento HTTPS estão presentes/aprovados. Não foram detectados cookies nessa requisição anônima; isso não prova ausência de cookies, armazenamento local ou rastreadores após interação/login. SRI/CORP são itens de análise, não prova de falha explorável.

Fonte: quatro PDFs SSL Labs, páginas 1–5: **B em todos os endpoints**, com indicação explícita de limite por suporte a TLS 1.0/1.1. TLS 1.2/1.3 também disponíveis; SSL 2/3 desabilitados. Cadeia sem problemas reportados; suites CBC marcadas `WEAK`, HSTS ausente. BEAST aparece como não mitigado no servidor para TLS 1.0. Não há razão nesses resultados para trocar de certificado por ICP-Brasil.

| Arquivo | Endereço avaliado |
| --- | --- |
| Sem sufixo | `2606:4700:3032::ac43:88da` |
| `_1` | `172.67.136.218` |
| `_2` | `104.21.94.142` |
| `_3` | `2606:4700:3035::6815:5e8e` |

São evidências da borda pública Cloudflare, não uma auditoria da conexão Cloudflare→origem. Os IPs podem mudar; registrar DNS atual e usar hostname/SNI nos retestes. Não tentar acessar diretamente a origem sem autorização.

### 1.6 Observações anteriores que precisam ser reproduzidas

- Home: abrir “Entrar” e pressionar `Tab` levou ao botão “Quero fazer parte”, fora do diálogo; `Esc` fechou. Existiam `role="dialog"` e `aria-modal="true"`, insuficientes por si sós.
- Rota `/view/mini-livro/027`: o leitor externo usou “Mini-Livro - 027” e o documento incorporado se identificou como ML20. O documento abriu anonimamente e estava em `iframe`.
- Home: publicação de newsletter “segunda e quarta” versus inscrição “toda quarta”. Pode ser diferença legítima entre publicação e envio; confirmar.
- FAQ terminou em “Nenhuma pergunta publicada ainda”. Distinguir coleção vazia de falha de API/permissão.
- `/declaracoes` afirma não haver compartilhamento com terceiros e promete exclusão em até 48 horas úteis. Confrontar com tratamento real e capacidade operacional; não publicar novas promessas sem aprovação.
- Conteúdo do catálogo apareceu no navegador após carregamento dinâmico, embora não constasse integralmente na extração textual inicial. Isso justifica investigar renderização/indexação, não concluir que o Google não indexa.
- Tentativas anteriores de obter `sitemap.xml` fora do navegador receberam bloqueio/erro. Isso não comprova sitemap inexistente ou indisponível para Googlebot.

## 2. Organização dos subagentes

Use **um coordenador e seis subagentes**, no máximo sete agentes simultâneos. Se o executor tiver menos vagas, mantenha os papéis e execute em ondas. Não simule delegação quando não houver suporte: registre a limitação e execute os mesmos contratos sequencialmente.

| Agente | Missão | Propriedade principal | Entrega |
| --- | --- | --- | --- |
| Coordenador | Baseline, contratos, integração, decisões e release | Arquivos compartilhados e configuração final | Plano atualizado, decisões, integração e relatório final |
| A — Visual | Contraste e comportamento visual acessível | Tokens de cores, estilos dos componentes atribuídos, animações | Correção C01–C10, mapa de cores e evidências por tema |
| B — Semântica e login | ASES/HTML, headings, navegação, modal e regressão de autenticação | Primitives de diálogo, componentes semânticos atribuídos e fluxo de auth | Triagem ASES, correções e testes de interação |
| C — Segurança | CSP, HSTS, TLS, políticas de recursos e isolamento | Proposta de cabeçalhos, runbook Cloudflare e revisão do proxy/iframe | Política testada, configurações propostas e riscos residuais |
| D — Desempenho | LCP mobile, CLS desktop, imagens, fontes e carregamento | Assets e componentes de desempenho atribuídos | Traces, diagnóstico, otimização e comparação reproduzível |
| E — Conteúdo e leitor | Número editorial, SEO, leitura, FAQ, newsletter e revisão factual da privacidade | Modelo/apresentação editorial e páginas de conteúdo atribuídas | Contrato de conteúdo, correções e decisões pendentes |
| F — QA independente | Baseline, testes integrados, acessibilidade e revisão adversarial das soluções | Harness de testes, fixtures, relatórios e checklist de release | Evidências independentes e parecer por gate |

### Regras de colaboração

1. Após descoberta, atribua caminhos reais a cada agente em um mapa de propriedade. Os nomes acima não são caminhos garantidos.
2. Um único escritor por arquivo em cada fase. Arquivos como CSS global, layout raiz, configuração Next.js, manifesto/lockfile, middleware/proxy, CI e componente do leitor são compartilhados: o coordenador integra alterações propostas em sequência ou transfere explicitamente a propriedade.
3. A e D não devem editar a mesma home simultaneamente. B identifica problemas de headings na home e envia patch ao dono. C define contrato de isolamento; E implementa mudanças do leitor; F revisa o conjunto.
4. Se usar worktrees, cada subagente trabalha em branch própria derivada do mesmo baseline, sem commits/pushes em branches alheias. Se usar workspace compartilhado, use propriedade exclusiva e integração sequencial; não há isolamento automático.
5. F pode preparar baseline e fixtures enquanto A–E investigam. Não execute benchmarks durante builds/testes concorrentes que disputem CPU/rede.
6. Cada agente entrega: achados reproduzidos, arquivos, causa, decisão, patch, comandos reais, resultado, riscos e bloqueios. O coordenador não trata mensagem “concluído” como prova.

## 3. Fases e dependências

### Fase 0 — Descoberta e baseline (coordenador + F)

- Ler `AGENTS.md` e instruções aplicáveis; inspecionar `git status`, branch, remotes e SHA sem expor segredos. Não sobrescrever trabalho existente.
- Descobrir stack e versões, gerenciador pelo lockfile, scripts de build/lint/typecheck/teste, estratégia de renderização e CI. Há indícios de Next.js/Cloudflare/Railway nos headers; confirme no repositório. Supabase pode fazer parte da stack, mas verificar antes de prescrever APIs ou migrações.
- Mapear ambientes: URLs, branch, origem, banco, storage, e-mail e configuração por ambiente. Não presumir que develop usa a mesma infraestrutura de produção.
- Localizar home, tokens, carrossel, auth, leitor, proxy de HTML/PDF, metadados, consultas de catálogo, FAQ e job de newsletter. Começar por `rg`/`rg --files`; exemplos de termos: `text-background/80`, `--block-radar`, `authModal`, `Enquanto`, `frame-ancestors`, `Content-Security-Policy`, `newsletter`.
- Rodar checks existentes antes das alterações; classificar falhas preexistentes. Testar build de produção local/preview; não medir desempenho de servidor de desenvolvimento.
- Criar matriz de evidências com ambiente, SHA/deploy, URL, sessão, tema, viewport, navegador, horário/fuso, ferramenta/versão, comando, resultado e artefato.
- Capturar páginas/estados da seção 5. Obter HTML e cabeçalhos finais, sem publicar cookies, tokens, HARs sensíveis ou dados de usuários.
- Criar fixture editorial estável, contas sintéticas e caixa de e-mail de teste isolada quando houver autorização. Nunca reaproveitar dados reais de leitores.

**Gate G0:** baseline utilizável, ambiente seguro, propriedade definida, falhas classificadas e plano de testes acordado. Se só houver acesso público, entregar diagnóstico/runbooks; não fingir implementação no repo.

### Fase 1 — Investigação paralela e contratos (A–E; F prepara verificação)

Antes de modificar arquivos compartilhados, acordar quatro contratos:

- **Cores:** separar acento decorativo, texto sobre superfície e texto sobre fundo colorido, com valores por tema.
- **Leitor:** origem/trust dos documentos, sandbox, comunicação com o pai, exportação e política de cabeçalhos por rota.
- **Renderização/CSP/cache:** preservar páginas públicas cacheáveis quando viável, sem servir nonce reutilizado ou dados autenticados a outros visitantes.
- **Conteúdo:** distinção entre ID técnico, slug, capítulo/número editorial, parte, ordenação e título; cadências de publicação e envio.

Cada agente deve propor a menor mudança suficiente. Não iniciar migração global de autenticação, novo design system, nova plataforma de analytics ou reescrita geral do leitor por conveniência.

**Gate G1:** causas prioritárias reproduzidas e contratos que impedem conflitos. Confirmar os budgets de desempenho propostos com o responsável; qualquer ajuste deve ser explícito e justificado, não feito após o teste para conseguir aprovação. Decisões de negócio sem evidência vão para perguntas específicas ao responsável.

### Fase 2 — Implementação em ondas

**Onda 2A:** A implementa tokens/contraste; B corrige modal e estrutura; C prepara política/runbook e valida fluxos; D implementa otimizações em arquivos exclusivos; E corrige metadados/numeração e estados vazios comprovados. F amplia cobertura faltante.

**Onda 2B:** coordenador integra tokens, estrutura e assets; E ajusta leitor conforme contrato de C; D mede de novo com as decisões reais de CSP/renderização; B retesta auth sob CSP; F executa regressão do conjunto.

**Gate G2:** build/checks aprovados, causas corrigidas no ambiente testado, evidência antes/depois e revisão independente. Código implementado com dependência externa ainda pendente deve ser marcado assim.

### Fase 3 — Homologação e release

- Subir preview/staging somente com autorização aplicável, sem produção como ambiente de teste.
- Verificar novamente o artefato publicado, origens permitidas, conteúdo dinâmico e fluxos reais com contas controladas.
- Coordenador apresenta alterações de infraestrutura, custos possíveis, compatibilidade, rollback e autorização necessária.
- Somente após aprovação, aplicar mudanças de produção em etapas e repetir testes públicos e funcionais autorizados.
- Não misturar ativação de CSP, HSTS, alteração TLS e mudanças de cache num passo opaco. Registrar hora e configuração de cada etapa.

**Gate G3:** homologação aprovada. **Gate G4:** produção verificada após deploy/configuração. Sem autorização, parar em G2/G3 e registrar “pronto para publicação”, nunca “corrigido em produção”.

## 4. Contratos detalhados dos subagentes

### A — Contraste, temas e movimento

**Investigar e corrigir**

- Localizar os componentes de C01–C10 e todos os usos equivalentes dos tokens. Confirmar temas reais (claro, sépia, escuro, se disponíveis), fundos herdados, gradientes, opacidade de ancestrais, hover/focus/selected e transições.
- Medir cores efetivamente renderizadas. Não usar exclusivamente a cor CSS declarada quando há transparência. Reproduzir o estado original antes de escolher correção.
- Criar/reaproveitar tokens semânticos distintos para fundo/acento, texto colorido em superfície clara/escura e texto sobre blocos coloridos. Nomes propostos são exemplos, não imposição: `--block-*-accent`, `--block-*-text`, `--block-*-on-accent`.
- Não escurecer todos os fundos indiscriminadamente: preservar reconhecimento dos sete blocos. Não assumir que branco puro resolve `text-background/80`; medir cada combinação.
- Corrigir palavras animadas em todos os estados, não só “clareza”. Reduzir/retirar transições que criem períodos de leitura insuficiente; respeitar preferência de movimento reduzido. Investigar clones do carrossel para não duplicar tabulação/anúncios.
- Não ocultar texto, remover a regra do axe, tornar informação decorativa artificialmente ou aumentar fonte apenas para escapar do limite. `aria-hidden` não corrige contraste para quem enxerga.

**Aceite**

- Texto normal ≥4,5:1; texto grande ≥3:1. Grande: pelo menos 18 pt (24 CSS px) regular ou 14 pt (~18,67 CSS px) em negrito. Os rótulos de 10 px exigem 4,5:1; `font-semibold` não os torna texto grande. Não arredondar uma medição abaixo do mínimo para aprovação. [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
- Os dez IDs têm evidência individual antes/depois e todos os sete blocos são cobertos em cada tema suportado.
- Ícones, limites necessários dos controles e foco são revisados também, não apenas texto. Registrar exceções normativas reais separadamente.
- Testes automatizados em navegador real com axe e verificação visual; não usar JSDOM como prova de contraste/layout.

### B — ASES, estrutura HTML e modal de login

**ASES e HTML**

- Reexecutar ASES e Nu HTML Checker na página pública e comparar HTML servido com DOM hidratado. Quando o parser só aponta linha 1, extrair mensagens detalhadas e mapear para componentes; não contar cada repetição como correção separada.
- Resolver markup inválido reproduzido, IDs duplicados, elementos interativos aninhados, headings incoerentes e links sem nome. Heading deve expressar hierarquia; mantenha estilo via CSS, não via nível semântico errado.
- Testar de fato “Pular para o conteúdo”: visível ao foco, destino único existente, foco/contexto de navegação corretos e sem ficar oculto pelo cabeçalho fixo.
- Investigar os três alertas de links adjacentes. Não inserir separadores falados desnecessários nem alterar nomes úteis só para agradar uma regra antiga.
- Triar 395 avisos por regra/causa/estado: confirmado, não aplicável, falso positivo com evidência, limitação do avaliador ou pendente. A ferramenta não substitui decisão técnica rastreável.

**Modal e auth**

- Reutilizar a primitive acessível já instalada se existir; evitar focus trap artesanal redundante.
- Ao abrir por clique/teclado, foco dentro do diálogo; `Tab` e `Shift+Tab` ciclam dentro; fundo indisponível à interação; `Esc` fecha; foco volta ao disparador existente. Não aplicar `aria-hidden` a um ancestral que contém o próprio diálogo.
- Testar mudança login↔cadastro↔recuperação, mensagens de erro, estado de envio, mostrar senha e fechamento. Erros devem se associar aos campos e ser anunciados de forma adequada.
- Verificar retorno ao conteúdo original após login; validar parâmetros `next` contra redirecionamento externo. Usar contas de teste e não mudar o provedor/modelo de sessão sem causa comprovada.
- Cobrir reabertura, expiração de sessão, logout e recuperação com e-mail de teste. Não reportar fluxo completo aprovado quando só o formulário foi exercitado.

**Aceite:** regressão de foco reproduzida antes e eliminada depois; matriz manual de teclado/leitor de tela preenchida; nenhuma ocorrência ASES fica sem classificação. A11y real é gate, não meta arbitrária de 100% eMAG. [Padrão de modal W3C](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Nu HTML Checker](https://validator.w3.org/nu/), [ASES](https://asesweb.governoeletronico.gov.br/).

### C — TLS, HSTS, CSP e isolamento de documentos

**TLS / Cloudflare**

- Confirmar que o domínio está atrás de Cloudflare e quem administra a zona. Separar visitante→borda e borda→origem. Alterar Node/Next.js não necessariamente muda TLS negociado na borda.
- Propor **TLS mínimo 1.2**, preservando TLS 1.3. Registrar incompatibilidade intencional com clientes antigos e verificar necessidade de negócio; não habilitar somente 1.3 para obter nota.
- Inventariar suites CBC restantes após a mudança. Desativar TLS 1.0/1.1 não garante remover CBC de TLS 1.2. Preferir suites modernas disponíveis no plano; se customização exigir custo, apresentar limite/opção sem contratar nada.
- Registrar configuração efetiva, propagação e resultado em IPv4/IPv6 disponíveis. Testes locais de handshake antigo precisam de cliente capaz: falha por algoritmo desabilitado no próprio cliente não prova rejeição pelo servidor.
- Validar certificado/hostname/renovação, sem substituir certificado válido apenas para alterar nota. Não tratar ausência de HPKP ou falha de clientes obsoletos como defeitos a “corrigir”. [TLS mínimo](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/), [suites Cloudflare](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/cipher-suites/).

**HSTS**

- Escolher um proprietário da política: aplicação/origem ou borda. Inspecionar resposta pública final para detectar ausência, duplicação ou sobreposição.
- Verificar HTTPS estável e certificados antes da ativação. Fazer rollout gradual do `max-age` com valores suportados pelo mecanismo escolhido; curto primeiro, depois aumentar mediante evidência e aprovação.
- Não ativar `includeSubDomains` ou `preload` por padrão. Exigem inventário de subdomínios, disponibilidade de HTTPS e autorização explícita.
- Documentar que remover header não limpa políticas já armazenadas. `max-age=0` precisa chegar por HTTPS válido e não apaga imediatamente o estado de todos os clientes. [HSTS Cloudflare](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/).

**CSP e leitor**

- Inventariar recursos de home, auth, editoriais, iframe, exportação, imagens, fontes, chat e serviços externos. Distinguir política da página pai da política dos documentos servidos pelo proxy.
- Registrar política proposta por classe de rota: `default-src`, `script-src`, `style-src`, `img-src`, `font-src`, `connect-src`, `frame-src`, `frame-ancestors`, `object-src`, `base-uri`, `form-action` e demais diretivas somente conforme necessidade.
- `frame-src` define o que pode ser incorporado; `frame-ancestors` define quem pode incorporar a resposta. Não aplicar `frame-ancestors 'none'` indiscriminadamente aos documentos que o próprio portal precisa embutir.
- Analisar confiança dos HTMLs publicados, scripts inline, origem, `sandbox` e `postMessage`. Validar `origin`/`source` e formato das mensagens. HTML não confiável na mesma origem com `allow-scripts` e `allow-same-origin` não deve ser tratado como isolado.
- Propor a menor solução segura compatível com leitura/exportação; isolamento em outra origem, quando necessário, é decisão arquitetural e pode exigir aprovação. Não trocar iframe por `dangerouslySetInnerHTML` para contornar erros.
- Começar por Report-Only, revisar violações com dados minimizados e testar enforcement em staging. **Report-Only não encerra o item CSP.** Bloquear scripts inesperados sem quebrar recursos legítimos.
- Incluir testes negativos em fixtures locais/staging: script ou recurso fora da política deve ser bloqueado; documento classificado como não confiável não deve conseguir ler estado sensível sintético do pai. Não usar dados reais, exfiltração ou testes invasivos em produção. Ausência de violações legítimas sozinha não comprova enforcement ou isolamento.
- Não resolver com `*`, `unsafe-eval`, desativação global do sandbox ou CORS amplo. Exceções inevitáveis de estilos/scripts precisam de justificativa por rota, prazo e revisão independente.
- Conferir versão/router do Next.js antes de escolher hashes/nonces. Nonces por requisição podem exigir renderização dinâmica; não torná-la global nem reutilizar nonce em HTML cacheado sem análise. Coordenar com D custo de renderização e cache. [CSP Next.js](https://nextjs.org/docs/app/guides/content-security-policy), [CSP MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP).
- Revisar `X-XSS-Protection` legado, preservando proteções modernas; não acrescentar COOP/COEP/Trusted Types/SRI automaticamente porque aparecem no Lighthouse. Avaliar necessidade, suporte, popups de auth, frames e recursos dinâmicos. [X-XSS-Protection MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-XSS-Protection).

**Aceite:** TLS 1.0/1.1 rejeitados na borda verificada; 1.2/1.3 funcionais; HSTS conforme rollout aprovado; CSP em enforcement no ambiente aceito, sem violações legítimas nos fluxos exercitados; nenhuma ampliação indevida de acesso; riscos residuais explicitados. Meta operacional SSL Labs ≥A e Observatory ≥A é indicativa e não substitui controles. Se custo/acesso impedir suite customizada, registrar bloqueio/risco, não mudar infraestrutura sem autorização.

### D — LCP mobile e CLS desktop

- Reproduzir três execuções antes/depois com build de produção, mesma versão, viewport, throttling, sessão, localização e perfil de cache; guardar cada resultado e a mediana. Perfis cold/warm separados. Não selecionar apenas a melhor execução.
- Identificar o elemento LCP em trace/filmstrip de cada viewport. Não presumir que é a capa do livro: pode ser texto/fonte. Separar TTFB, descoberta/espera do recurso, download e atraso de renderização. [Otimização de LCP](https://web.dev/articles/optimize-lcp).
- Investigar imagens superdimensionadas, formatos, compressão, `srcset`/`sizes`, otimização existente, dimensões/aspect-ratio e carregamento. Não lazy-load o recurso LCP; não pre-carregar todos os assets.
- Investigar fontes/variações usadas, subconjuntos, origem e estratégia de exibição; verificar fidelidade tipográfica e mudança de layout após troca de fonte.
- Rastrear as causas do CLS 0,109 no desktop: fontes, aviso inserido após hidratação, imagens, áreas editoriais dinâmicas e animações são hipóteses, não fatos confirmados. Reservar espaço onde o trace indicar; não esconder conteúdo para melhorar nota.
- Mapear chunks não utilizados e terceiras partes; adiar componentes realmente não críticos sem atrasar login, conteúdo ou acessibilidade. Não remover funcionalidade para atingir score.
- Não aplicar cache público genérico em auth, conta, respostas personalizadas ou recursos protegidos. Assets versionados e conteúdo editorial público podem ter políticas próprias; verificar publicação, invalidação e atualização de materiais para não servir versões antigas.
- Usar três execuções adicionais quando a variação impedir uma conclusão. Se duas iterações de otimização não avançarem, entregar trace e gargalo remanescente; não baixar a meta silenciosamente.

**Aceite proposto de laboratório:** na home, mediana mobile ≥90, desktop ≥95; LCP ≤2,5 s, CLS ≤0,1, TBT ≤200 ms; preservar o bom TBT atual e CLS mobile. São metas do projeto, não prova de CWV de campo. Aplicar LCP/CLS também às páginas representativas, documentando limitações de medição do texto dentro de iframe. Avaliar trecho até leitura utilizável separadamente quando o LCP da página pai não representar a experiência.

Para dados reais futuros, LCP ≤2,5 s, INP ≤200 ms e CLS ≤0,1 no p75 por dispositivo são referências; ausência de amostra deve continuar “sem dados”. Não implantar analytics/coleta nova sem revisão de privacidade. [Core Web Vitals](https://web.dev/articles/vitals).

### E — Conteúdo, leitor, SEO, FAQ e privacidade

**Número e metadados**

- Mapear ID `027` ao conteúdo ML20 a partir de banco/catálogo/fonte editorial. Não renomear chaves, arquivos e URLs supondo que ID técnico seja capítulo.
- Usar título/número editorial no leitor, listagem, `<title>`, descrição e compartilhamento. Preservar rota e favoritos; se mudança de URL for necessária, propor redirecionamento e migração compatível.
- Se não existir campo confiável, identificar menor mudança de esquema com backfill verificável e rollback. Não aplicar migração em produção sem aprovação. Não extrair números de títulos frágeis como regra permanente.
- Revisar canonical, indexabilidade e dados estruturados coerentes com a natureza real da publicação. Não marcar toda página como `NewsArticle` apenas por ser um portal.
- Inspecionar HTML servido e renderizado da publicação, não somente da home; checar sitemap/robots reais. Search Console pode exigir acesso do proprietário: entregar instruções e pendência, não afirmar indexação aprovada. [JavaScript e SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

**Leitor e documentos**

- Auditar página pai e documentos HTML incorporados: nome acessível do iframe, idioma, headings, ordem de leitura, controles, links legais, contraste, zoom e teclado.
- Testar largura equivalente a 320 CSS px, zoom 200% e reflow 400% no contexto adequado; verificar clipping, sobreposição por cabeçalhos e rolagens concorrentes. Exceções de conteúdo bidimensional devem ser justificadas. [Reflow WCAG](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Testar ajustes de leitura, tema, compartilhamento, PDF e salvamento quando existentes. Não exigir login para leitura que hoje é pública sem decisão do produto.
- Corrigir o template/origem de geração quando o erro se repete entre documentos; gerar lista dos materiais antigos afetados. Correção do template não atualiza automaticamente HTML/PDF já publicado.
- Quando houver PDFs, verificar amostra de texto selecionável, ordem, tags/idioma e links com ferramenta apropriada; não declarar PDF acessível porque o HTML passou no axe. Não repaginar ou reescrever obra do autor sem aprovação.

**FAQ, cadência e privacidade**

- FAQ: separar loading, erro e vazio. Não mascarar erro de backend como ausência de perguntas. Para vazio real, ocultar bloco promocional ou usar estado vazio útil; novas respostas editoriais precisam de aprovação.
- Newsletter: conferir agendamento real, timezone e distinção entre publicar e enviar; centralizar texto/configuração para evitar divergência. Se publicação ocorrer segunda/quarta e envio só quarta, explicar ambas sem alterar job.
- Não inscrever usuários retroativamente, alterar consentimento ou enviar campanha para testar copy. Cadastro de conta e assinatura são decisões distintas.
- Testar inscrição/cancelamento, persistência e respeito ao estado no job apenas com destinatários controlados, sandbox ou modo de teste.
- Inventariar dados, finalidades, responsáveis/operadores, fornecedores, retenção, compartilhamentos, cookies/armazenamento e direitos; evidenciar por configuração e comportamento. Não presumir ferramentas só porque foram usadas no passado.
- Produzir minuta factual de privacidade e lista de decisões, especialmente “sem compartilhamento” e prazo de exclusão. Publicação de texto jurídico/promessas exige validação do responsável. Não inventar base legal, consentimento, prazos ou certificação LGPD. [Guia ANPD de cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf).

**Aceite:** identidade editorial consistente sem quebrar links; leitura funcional na matriz; estados de FAQ corretos; cadência coerente com evidência; nenhuma alteração indevida de consentimento; política revisada ou explicitamente pendente, nunca presumida aprovada.

### F — QA independente e regressão

- Reutilizar suíte/fixtures existentes e ampliar lacunas reais. Cada implementador adiciona testes de sua mudança; F valida comportamento integrado e cenários adversos, sem simplesmente repetir asserts.
- Integrar axe ao navegador e exercitar componentes depois de renderizados. Testar estados abertos: modal, menus, tabs, erros e preferências. Registrar `incomplete`/needs-review; não tratá-los como aprovação. [Playwright e acessibilidade](https://playwright.dev/docs/accessibility-testing).
- Confirmar cobertura do iframe pelo harness; se não houver, executar avaliação apropriada no documento separadamente, sem contornar sandbox/CSP ou remover a política para “passar”.
- Preservar as regras relevantes do axe; qualquer exclusão pontual exige justificativa e revisão. Não usar snapshot visual aprovado automaticamente como prova de usabilidade.
- Capturar antes/depois, traces e resultados com dados minimizados. Guardar estado autenticado fora do Git; sanitizar relatórios e não anexar tokens/senhas/PII.
- Fazer revisão cruzada de segurança/cache: uma melhoria de LCP não pode vazar dados; CSP não pode quebrar auth ou leitor; contraste de um tema não pode piorar os demais.
- O parecer deve indicar: passou, falhou, bloqueado ou não executado por cenário. Testes ignorados não são sucesso.

## 5. Matriz mínima de verificação

Defina URLs de fixture estáveis para uma newsletter recente, uma antiga, um mini-livro com PDF e um sem PDF, e um material da biblioteca. As rotas abaixo são ponto de partida, não garantia de dados imutáveis.

| Superfície | Estados obrigatórios | Verificação |
| --- | --- | --- |
| `/` | Todos os temas; carrossel; palavra animada; FAQ loading/erro/vazio/preenchido; newsletter | axe, teclado, contraste, screenshot, Lighthouse |
| `/explorar` | Recentes; cada bloco; filtro vazio; erro de consulta | Semântica, tabs/teclado, links, responsividade |
| `/view/mini-livro/027` ou fixture equivalente | Anônimo; leitura; ajustes; capítulo editorial; iframe | Identidade, acessibilidade pai/documento, CSP, reflow |
| Newsletter e biblioteca | Conteúdo curto/longo; assets; links/fontes; PDF se houver | Metadados, carregamento, leitura e integridade |
| Login/cadastro/recuperação | Abertura por teclado; erro; envio; troca de modo; sucesso com fixture | Foco, anúncios, retorno, ausência de regressão |
| Conta e materiais salvos | Sessão válida/expirada; reload/reabertura; logout; controle entre duas contas | Autorização, persistência, privacidade de cache |
| `/declaracoes` e rodapés | Links de entrada e texto consistente | Acesso, fatos e revisão pendente |
| HTML/PDF/assets servidos por proxy | Público/protegido conforme regra existente; 404/erro | Content-Type, políticas, cache e isolamento |

**Cobertura:** Chromium, Firefox e WebKit para fluxos essenciais; visão mobile de referência 390×844 e desktop 1440×900; 320 CSS px para reflow; todos os temas reais. Valores de viewport são cenários propostos, não reprodução exata do Moto G do PSI. Baselines de desempenho devem usar o perfil original ou perfil comparável explicitamente documentado. Quando possível testar Safari/iPhone e Android físicos; emulação WebKit não comprova teste em aparelho real. Um leitor de tela compatível deve ser usado para fluxo essencial; indisponibilidade fica registrada.

Não exija o produto cartesiano completo em todos os navegadores para cada cenário secundário. Rode o cruzamento completo de temas/contraste no navegador principal e smoke de leitura/auth nos três engines; amplie onde surgir divergência.

## 6. Critérios de encerramento e evidências

| Área | Critério | Prova exigida |
| --- | --- | --- |
| Contraste | C01–C10 resolvidos, sem novos erros pertinentes nos componentes alterados | Relação antes/depois por tema, regra e elemento |
| ASES | 85 erros e 395 avisos reconciliados por causa/ocorrência; problemas reais corrigidos | Tabela de triagem, novo relatório e justificativas |
| Modal | Foco inicial, ciclo, fundo inerte, Esc e retorno aprovados | Testes reais de interação, inclusive troca de modo |
| Performance | Metas de laboratório da seção D ou bloqueio explícito | Todas as execuções, medianas, traces e condições |
| TLS | Rejeição 1.0/1.1; funcionamento 1.2/1.3 na borda | Scan novo e handshake/SNI válido por endpoint disponível |
| HSTS/CSP | Configuração efetiva aprovada sem quebrar funcionalidades | Headers finais, violações revisadas, regressão integrada |
| Conteúdo/SEO | Número editorial e metadados coerentes; URLs preservadas | Mapeamento editorial confirmado, incluindo investigação de `027`/ML20, links, HTML e inspeção disponível |
| Privacidade/newsletter | Comportamento conforme configuração e escolhas; texto factual revisado | Testes controlados, inventário e aceite do responsável quando exigido |
| Regressão | Checks existentes e novos relevantes passam | Comandos, versões, exit codes e logs sanitizados |
| Produção | Resultado verificado após release autorizado | SHA/deploy, horário, configuração e smoke pós-publicação |

Sem evidência de correção, manter o item aberto. “Não reproduzido” é uma classificação com condições, não fechamento automático. Aceitação de risco residual exige responsável e prazo; não pode ser assinada pelo próprio agente para encerrar a tarefa.

## 7. Entregáveis do agente executor

Adaptar ao padrão do repositório, sem criar documentação redundante. Sugestão de pasta `docs/quality/pp7ias/`:

- `BASELINE.md`: fontes históricas versus medições novas; ambientes e commit.
- `FINDINGS.md`: ID, fonte, regra, evidência, causa, prioridade, dono, status e vínculo ao teste.
- `DECISIONS.md`: contratos de cor/CSP/cache/leitor, decisões editoriais e alternativas recusadas.
- `VALIDATION.md`: matriz executada, comandos e resultados; links a artefatos de CI.
- `RUNBOOK_RELEASE.md`: passos por ambiente, permissões, responsáveis, observação e rollback.
- `FINAL_REPORT.md`: resolvido/verificado, implementado pendente de ambiente, não reproduzido e bloqueado.

Relatórios volumosos e traces podem ficar nos artefatos de CI; não colocar binários enormes no Git sem necessidade. Código e testes ficam no repositório existente. Não persistir credenciais, `.env`, estado autenticado, logs com dados pessoais ou dumps de usuários.

### Formato obrigatório de devolutiva de cada subagente

```text
Agente / escopo:
Baseline (SHA, ambiente, ferramenta):
Achados reproduzidos e fontes:
Causas confirmadas versus hipóteses:
Arquivos e contratos afetados:
Mudanças realizadas:
Testes e comandos realmente executados:
Resultados e evidências antes/depois:
Riscos e rollback:
Pendências de acesso, decisão ou produção:
Próximo passo recomendado:
```

### Condições de parada

Parar a frente, preservar evidências e perguntar especificamente quando: repositório/ambiente não identificado; teste afetaria usuários reais; acesso negado; custo adicional; necessidade de alterar autenticação/arquitetura do leitor; migração destrutiva; inconsistência de dados editoriais; decisão jurídica; alteração de infraestrutura/produção sem autorização.

Não trocar metas por notas mais fáceis, alterar testes para mascarar falhas, desabilitar WAF para scanners, criar acessos especiais para robôs, remover segurança para carregar assets ou declarar conformidade integral WCAG/LGPD a partir de notas. Os resultados das ferramentas têm escopos distintos. [Limitações dos avaliadores W3C](https://www.w3.org/WAI/test-evaluate/tools/selecting/), [limitações do Observatory](https://developer.mozilla.org/en-US/observatory/docs/faq).

## 8. Mensagem inicial sugerida ao coordenador

> Execute este plano no repositório do PP7+IAS. Primeiro descubra o projeto, leia as instruções aplicáveis e reproduza o baseline. Organize os seis subagentes definidos, atribua propriedade exclusiva dos arquivos e registre os quatro contratos técnicos antes de integrar mudanças. Corrija causas confirmadas, preserve conteúdo/identidade/URLs e exija verificação independente. Não altere produção, configurações externas, consentimentos ou conteúdo jurídico/editorial sem a autorização indicada. Prossiga até os gates possíveis com os acessos existentes e entregue evidências; não pare somente em diagnóstico e não declare sucesso sobre o que não foi testado.
