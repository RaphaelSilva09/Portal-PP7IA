# Relatório de Auditoria de UI/UX — Portal PP7+IAS — 2026-07-08

> Auditoria heurística conduzida em ambiente local (`http://localhost:3000`, branch `develop`) com navegador real (Chromium via Playwright), sem leitura prévia de código para inferir comportamento. Viewports testadas: **375px (mobile)**, **768px (tablet)** e **1440px (desktop)**. Screenshots em `auditoria-screenshots/`.
>
> **Limitações do ambiente**: (1) os arquivos HTML de conteúdo não existem no volume local — todo `/view/*` responde 404 no proxy, o que impediu avaliar a experiência de leitura em si, mas expôs o estado de erro real (ver UX-001); (2) o caminho feliz de login/cadastro não foi executado por falta de credenciais válidas — foram testados os caminhos de erro; (3) o painel admin não foi auditado (rota redireciona deslogado, comportamento correto).

---

## 1. Mapa de telas e fluxos testados

### Páginas públicas

| Tela | Rota | Evidência |
|---|---|---|
| Home (hero, carrossel "Comece por aqui", 7 blocos, editorial "Por onde começar", 7 IAs, manifesto, newsletter, footer) | `/` | `recon-home-desktop.png`, `10-home-mobile.png`, `22-home-tablet.png` |
| Home — tema sépia | `/` + toggle | `08-home-sepia-desktop.png` |
| Home — tema escuro | `/` + toggle ×2 | `09-home-dark-desktop.png` |
| Explorar — "Recentes" (40 cards, todos os blocos) | `/explorar` | `02-explorar-recentes-desktop.png`, `23-explorar-tablet.png`, `24-explorar-mobile.png` |
| Explorar — aba Newsletter | `/explorar?b=newsletter` | `03-explorar-newsletter-desktop.png` |
| Explorar — aba Ensinar (estado vazio) | `/explorar?b=ensinar` | `04-explorar-ensinar-vazio.png` |
| Explorar — deep-link com slug antigo | `/explorar?b=reportagem` → normaliza para aba "Inteligência Artificial" | (verificado via DOM) |
| Leitura de conteúdo | `/view/newsletter/011` | `05-view-newsletter-desktop.png`, `07-view-newsletter-mobile.png` |
| Leitura — controles de tipografia (A−/A+/peso/espaçamento) | idem | `06-view-newsletter-fonte-maior.png` |
| Quem somos | `/quem-somos` | `recon-quem-somos-desktop.png` |
| O autor | `/autor` | `recon-autor-desktop.png` |
| Por que 7 | `/por-que-7` | `recon-por-que-7-desktop.png` |
| Disclosures legais | `/declaracoes` | `recon-declaracoes-desktop.png` |
| 404 custom (rota inexistente) | `/rota-que-nao-existe` | `recon-rota-inexistente-desktop.png` |
| 404 default do Next (tipo de view inválido) | `/view/tipo-invalido/999` | `recon-view-invalido-desktop.png` |

### Fluxos e estados interativos

| Fluxo | Caminho feliz | Caminho de erro/borda testado | Evidência |
|---|---|---|---|
| Login (overlay "Entrar") | não testado (sem credenciais) | submit vazio; credenciais inválidas; Esc para fechar | `15-login-modal.png`, `16-login-vazio.png`, `17-login-erro.png` |
| Cadastro ("Quero fazer parte") | inspeção de campos | — | `20-cadastro-modal.png` |
| Inscrição na newsletter (form da home) | não submetido (evitar escrita no banco) | submit vazio; e-mail malformado | `13-newsletter-form-vazio.png`, `14-newsletter-form-invalido.png` |
| Chat "Assistente" | abertura do painel, saudação | — | `18-chat-aberto.png` |
| Carrossel "Comece por aqui" | 6 slides, prev/next, estado disabled | início da lista (prev desabilitado ✓) | `21-carrossel-desktop.png` |
| Menu mobile (hamburguer) | abrir | — | `11-home-mobile-menu.png` |
| Barra de anúncios rotativa (5 itens, prev/next) | navegação | — | visível em `24-explorar-mobile.png` |
| Rotas protegidas deslogado | — | `/user`, `/painel-admin`, `/reset-password` → redirect silencioso para `/` | `recon-user-desktop.png`, `recon-painel-admin-desktop.png` |
| Navegação por teclado (home) | 10 primeiros Tab stops + visibilidade de foco | — | (dados via DOM) |
| Temas claro → sépia → escuro | ciclo completo | — | `08`/`09` |

**Estados cobertos**: vazio (aba Ensinar ✓, "Por onde começar" com cards "EM BREVE"), carregando (skeletons no Explorar ✓; pill de loading no header ✗ — ver UX-016), erro (view 404 ✗ — ver UX-001; login ✓ com ressalva — ver UX-002), sucesso (não observável nos fluxos testáveis).

---

## 2. Resumo executivo

A base visual do portal é forte — identidade editorial consistente, dark mode sólido, skeletons de carregamento, foco de teclado visível e deep-links com normalização de slugs antigos. Porém, a experiência quebra exatamente nos momentos de maior valor: **a página de leitura (o produto principal) exibe JSON cru quando o arquivo não existe**, o overlay de login não é um diálogo de verdade (sem `role="dialog"`, sem Esc, erro em inglês), e há **inconsistências de conteúdo visíveis entre telas** ("Reportagem da Semana" vs. "Inteligência Artificial"; "Toda quarta" vs. "segunda e quarta") porque textos administrados no banco ficaram dessincronizados dos novos padrões. O tema sépia recém-lançado tem um bug de colisão de classe que aplica filtro `sepia()` na página inteira, tingindo imagens e degradando contraste. Os temas recorrentes são três: **estados de erro/feedback negligenciados, semântica de acessibilidade ausente nos overlays, e governança de conteúdo (copy do banco vs. código) sem processo de sincronização**.

---

## 3. Problemas encontrados

### UX-001 — Página de leitura exibe JSON cru quando o conteúdo não existe
- **Tela/fluxo**: `/view/[tipo]/[slug]` (ex.: `/view/newsletter/011`) — jornada principal do produto
- **Severidade**: **Crítica**
- **Categoria**: Usabilidade
- **Descrição**: quando o arquivo HTML não é encontrado, o iframe renderiza a resposta bruta da API — `{"error":"Arquivo não encontrado"}` — com o visual de JSON viewer do navegador ("Pretty-print"). O leitor clica num card, chega à tela de leitura e vê código. Não há mensagem amigável, ação de retorno, nem sugestão de conteúdo alternativo. A toolbar de tipografia continua ativa sobre o erro, reforçando a sensação de tela quebrada. No ambiente local **todos** os conteúdos caem nesse estado; em produção, qualquer item com arquivo ausente/renomeado cai nele também.
- **Evidência**: `07-view-newsletter-mobile.png`, `05-view-newsletter-desktop.png`; `GET /api/proxy-html/newsletter/011` → 404 com corpo JSON.
- **Solução proposta**: o componente que hospeda o iframe deve verificar o status da resposta (HEAD/fetch prévio ou `onload` + inspeção) e, em falha, renderizar um estado de erro do design system no lugar do iframe: ícone, "Não encontramos este conteúdo", botão "Voltar ao Explorar" e link de suporte. Adicionalmente, a rota proxy deveria responder erro em HTML mínimo estilizado (não JSON) quando o `Accept` é de navegação. Padrão de referência: página de erro inline do Medium/Notion ("This page doesn't exist… Back to home").
- **Esforço estimado**: Baixo

### UX-002 — Mensagem de erro do login em inglês
- **Tela/fluxo**: overlay de login → credenciais inválidas
- **Severidade**: Alta
- **Categoria**: Conteúdo / Usabilidade
- **Descrição**: toda a interface é em pt-BR, mas o erro exibido é **"Invalid email or password"** — a string crua do backend de auth vazou para a UI. Quebra o idioma, o tom editorial e a confiança ("parece bug"). O mesmo padrão provavelmente vale para outros erros do provedor (rate limit, e-mail não verificado etc.).
- **Evidência**: `17-login-erro.png`.
- **Solução proposta**: camada de tradução de erros no cliente de auth — mapear códigos conhecidos (`INVALID_EMAIL_OR_PASSWORD`, `USER_NOT_FOUND`, rate limit…) para mensagens pt-BR consistentes ("E-mail ou senha incorretos. Tente novamente ou recupere sua senha."), com fallback genérico em português + log do código original.
- **Esforço estimado**: Baixo

### UX-003 — Overlays de login/cadastro não são diálogos acessíveis
- **Tela/fluxo**: "Entrar" e "Quero fazer parte" (todas as páginas)
- **Severidade**: Alta
- **Categoria**: Acessibilidade
- **Descrição**: o overlay é uma `div fixed inset-0 z-[9999]` **sem** `role="dialog"`, **sem** `aria-modal="true"`, e **Esc não fecha**. Não há indício de focus-trap; leitores de tela não anunciam a abertura e o conteúdo de fundo continua navegável por AT. O usuário de teclado que abre o login por engano precisa achar o "X" com Tab para sair.
- **Evidência**: inspeção DOM (`role: (sem role)`, `aria-modal: (sem aria-modal)`); teste de Esc → overlay permanece aberto; `15-login-modal.png`.
- **Solução proposta**: trocar o container por um primitivo de diálogo acessível (Radix `Dialog`, já comum no ecossistema do projeto) que entrega `role`, `aria-modal`, focus-trap, retorno de foco ao trigger e fechamento por Esc/click-fora de graça. Aplicar o mesmo aos overlays de cadastro e recuperar senha.
- **Esforço estimado**: Médio

### UX-004 — Tema sépia aplica filtro `sepia()` na página inteira (imagens tingidas)
- **Tela/fluxo**: qualquer página com tema sépia ativo
- **Severidade**: Alta
- **Categoria**: Visual / Acessibilidade
- **Descrição**: além da paleta quente esperada, **todas as imagens** (capa do livro, avatares, fotos) ficam lavadas em tom sépia e os cards coloridos perdem identidade — sintoma de um `filter: sepia()` global. A causa é colisão de nome: a classe `sepia` que o gerenciador de temas aplica ao `<html>` é também uma utility do Tailwind (`filter: sepia(100%)`), que o build gerou por encontrar a string no código. Resultado: contraste degradado em cascata (ex.: card "Curadoria Semanal" com label marrom-sobre-marrom) e marca visual destruída no modo que existe justamente para longas sessões de leitura.
- **Evidência**: `08-home-sepia-desktop.png` (comparar capa do livro e card indigo com `09-home-dark-desktop.png`).
- **Solução proposta**: renomear o valor do tema para algo sem colisão (`theme-sepia`) e ajustar o seletor CSS correspondente — ou, no mínimo, sobrescrever `html.sepia { filter: none }`. Renomear é a correção limpa. Revalidar contraste dos cards de hero no tema sépia depois do fix (eles usam cores administradas pensadas para claro/escuro; definir fallbacks sépia).
- **Esforço estimado**: Baixo

### UX-005 — Nomenclatura e cadência inconsistentes entre telas (conteúdo do banco desatualizado)
- **Tela/fluxo**: Home (seção "Cada cor é um caminho" e seção final de newsletter) vs. Explorar/footer
- **Severidade**: Alta
- **Categoria**: Consistência / Conteúdo
- **Descrição**: a home exibe o bloco 02 como **"Reportagem da Semana"**, enquanto o Explorar, o footer e o admin chamam a mesma seção de **"Inteligência Artificial"**. A seção final da home diz **"Toda quarta. Direto no inbox."** enquanto o card do hero diz **"O melhor da IA, segunda e quarta."** — duas promessas de cadência diferentes na mesma página. Causa: esses textos têm override armazenado no banco (editável no admin) que ficou para trás quando os padrões do código mudaram; não há processo que avise sobre a divergência.
- **Evidência**: `10-home-mobile.png` (bloco "02 Reportagem da Semana" e seção "Toda quarta." na mesma página em que o hero diz "segunda e quarta").
- **Solução proposta**: (1) correção imediata: atualizar os textos via painel admin (ou seed SQL) para "Inteligência Artificial" e "Toda segunda e quarta"; (2) correção estrutural: no painel admin, exibir aviso quando um override armazenado diverge do default atual do código (diff simples), ou versionar os defaults e invalidar overrides órfãos.
- **Esforço estimado**: Baixo (correção) / Médio (governança)

### UX-006 — Rotas protegidas redirecionam em silêncio
- **Tela/fluxo**: `/user`, `/painel-admin`, `/reset-password` deslogado
- **Severidade**: Média
- **Categoria**: Usabilidade
- **Descrição**: acessar qualquer rota protegida sem sessão devolve o usuário à home **sem nenhuma explicação** — nem toast, nem abertura do modal de login, nem `?redirect=`. Quem clicou num link de perfil salvo nos favoritos não entende o que aconteceu; após logar, não volta para onde queria ir.
- **Evidência**: recon — `/user` → 200 com redirect para `/` e conteúdo idêntico à home.
- **Solução proposta**: ao interceptar rota protegida sem sessão, abrir o modal de login por cima da home com mensagem "Entre para acessar seu perfil" e preservar a URL de destino para redirect pós-login (`/login?next=/user` é o padrão consagrado).
- **Esforço estimado**: Médio

### UX-007 — Dois 404 diferentes; o do fluxo de leitura é o default sem marca do Next
- **Tela/fluxo**: `/rota-que-nao-existe` (404 custom) vs. `/view/tipo-invalido/999` (404 default)
- **Severidade**: Média
- **Categoria**: Consistência
- **Descrição**: rotas inexistentes de topo caem num 404 com a identidade do portal, mas URLs de conteúdo inválidas — justamente as mais prováveis de circular quebradas (compartilhadas por e-mail/WhatsApp) — caem no 404 branco default do Next ("404 | This page could not be found."), em inglês e sem navegação de volta.
- **Evidência**: `recon-rota-inexistente-desktop.png` vs. `recon-view-invalido-desktop.png`; `<title>` "404: This page could not be found."
- **Solução proposta**: garantir que o `notFound()` do segmento `/view` resolva para o mesmo `not-found` custom global (adicionar `not-found.tsx` no nível adequado do App Router), com links "Explorar conteúdos" e busca.
- **Esforço estimado**: Baixo

### UX-008 — Formulário de newsletter: sem label, sem feedback próprio, placeholder como rótulo
- **Tela/fluxo**: home, seção "Toda quarta. Direto no inbox."
- **Severidade**: Média
- **Categoria**: Acessibilidade / Usabilidade
- **Descrição**: o campo de e-mail não tem `<label>` nem `aria-label` (leitores de tela anunciam só "editar texto"); o placeholder **"ceo@empresa.com"** faz papel de rótulo (some ao digitar) e soa desalinhado do público declarado. A validação é apenas a nativa do browser (tooltip efêmero, idioma do navegador — em en-US aparece "Please include an '@'…"). Não há estado de sucesso/erro visível na própria seção para inscrição concluída/duplicada.
- **Evidência**: inspeção DOM (`labelled: false`, `ariaLabel: null`); `14-newsletter-form-invalido.png`.
- **Solução proposta**: label visível ("Seu e-mail") ou `aria-label`; validação inline em pt-BR no blur/submit com mensagem sob o campo; após submit, substituir o form por confirmação ("Pronto! Verifique sua caixa de entrada.") e tratar e-mail já inscrito com mensagem específica. Placeholder neutro ("nome@email.com").
- **Esforço estimado**: Baixo

### UX-009 — Erro de hidratação React na home
- **Tela/fluxo**: `/` (todas as visitas)
- **Severidade**: Média
- **Categoria**: Usabilidade (saúde técnica com impacto de UX)
- **Descrição**: o console reporta "A tree hydrated but some attributes of the server rendered HTML didn't match the client properties" em toda carga da home (overlay "1 Issue" no dev). Hidratação descartada significa flash/re-render perceptível no primeiro paint, custo extra de CPU no mobile e risco de divergências visuais SSR/cliente (frequentemente ligado a tema/`suppressHydrationWarning` incompleto ou a conteúdo dependente de `Date`/`localStorage`).
- **Evidência**: console log da recon; badge "1 Issue" visível em `17-login-erro.png` (canto inferior esquerdo).
- **Solução proposta**: identificar o atributo divergente com o diff que o React imprime em dev (provável candidato: classe/atributo de tema no `<html>` ou o título animado do hero) e corrigir na origem — `suppressHydrationWarning` pontual só onde o mismatch é legítimo.
- **Esforço estimado**: Médio

### UX-010 — Página de leitura sem rota de fuga ("voltar") nem contexto
- **Tela/fluxo**: `/view/*`
- **Severidade**: Média
- **Categoria**: Usabilidade
- **Descrição**: dentro da leitura não há breadcrumb, título visível da seção, nem link "← Voltar" — só a navbar global e, no rodapé, "Próximo". Quem chega por link direto não sabe em que seção está; o botão de voltar do browser é a única saída (Nielsen: controle e liberdade do usuário).
- **Evidência**: `05-view-newsletter-desktop.png`; varredura de links da página (nenhum match para voltar/←).
- **Solução proposta**: barra de contexto acima do conteúdo com "← [Nome da seção]" (ex.: "← Newsletter") linkando para `/explorar?b=…`, + título do item. O padrão das outras páginas internas (ex.: `/quem-somos` tem "← Portal") já existe — replicá-lo aqui.
- **Esforço estimado**: Baixo

### UX-011 — Home mobile com ~7.400px de altura e seções "EM BREVE" em posição nobre
- **Tela/fluxo**: `/` em 375px
- **Severidade**: Média
- **Categoria**: Usabilidade / Conteúdo
- **Descrição**: a home mobile equivale a ~19 telas de rolagem. Logo após o hero, a seção editorial "Por onde começar." exibe dois cards grandes marcados **"EM BREVE"** — conteúdo placeholder ocupando a segunda dobra, empurrando para muito longe seções com valor real (7 IAs, manifesto, newsletter). Carga cognitiva alta e desperdício do espaço de maior atenção.
- **Evidência**: `10-home-mobile.png`.
- **Solução proposta**: ocultar cards "EM BREVE" até existir conteúdo (a config de visibilidade por seção já existe no admin); reordenar para que blocos com CTA acionável subam; meta: home mobile ≤ 8 telas.
- **Esforço estimado**: Baixo

### UX-012 — Barra de anúncios: copy fora do padrão editorial e 4 linhas no mobile
- **Tela/fluxo**: todas as páginas (barra rotativa 1/5)
- **Severidade**: Média
- **Categoria**: Conteúdo / Visual
- **Descrição**: o anúncio ativo — `LEIA LIVRO :ENQUANTO É TEMPO"- 20-Mini-livros-publicados". novo formato, e vc pode ler escuro ou claro.` — tem pontuação quebrada, aspas desbalanceadas, "vc" informal e CAIXA mista, destoando do tom sóbrio do portal ("Menos ruído. Mais clareza."). No mobile ocupa 4 linhas + controles, empurrando o conteúdo. São 5 barras navegáveis manualmente — ninguém pagina anúncios à mão.
- **Evidência**: `24-explorar-mobile.png` (topo).
- **Solução proposta**: guia de estilo mínimo para anúncios (1 linha, ≤ 80 caracteres, sem abreviações) aplicado no admin com contador/preview mobile; limitar a 1–2 barras ativas; truncar com reticências + link em vez de quebrar em 4 linhas.
- **Esforço estimado**: Baixo

### UX-013 — Tab bar do Explorar sem affordance de rolagem no mobile
- **Tela/fluxo**: `/explorar` em 375px
- **Severidade**: Baixa
- **Categoria**: Usabilidade
- **Descrição**: as abas dos 7 blocos rolam horizontalmente, mas o corte é seco ("02 Ir…") sem gradiente/fade ou seta indicando que existem mais abas à direita — usuário pode nunca descobrir os blocos 03–07 pela tab bar.
- **Evidência**: `24-explorar-mobile.png`.
- **Solução proposta**: máscara de fade nas bordas roláveis (`mask-image: linear-gradient`) e/ou última aba parcialmente visível por design (peek). Padrão: tabs do Material 3 / App Store.
- **Esforço estimado**: Baixo

### UX-014 — Sem skip-link; landmarks duplicados na home
- **Tela/fluxo**: todas as páginas (foco em `/`)
- **Severidade**: Baixa
- **Categoria**: Acessibilidade
- **Descrição**: não há link "Pular para o conteúdo" — usuário de teclado atravessa logo, nav, tema, auth e os controles da barra de anúncios (2 Tab stops) antes de qualquer conteúdo. A home expõe **2 `<footer>`** e **2 `<nav>`** sem `aria-label` distintivo, poluindo a navegação por landmarks de leitores de tela.
- **Evidência**: varredura DOM (`footer:2 nav:2`, skip-link: 0); sequência de Tab registrada.
- **Solução proposta**: skip-link clássico (visível no foco) para `#main`; unificar/rotular landmarks (`aria-label="principal"` / `"rodapé do portal"`), remover o footer duplicado da home.
- **Esforço estimado**: Baixo

### UX-015 — Contrastes borderline em textos pequenos e no subtítulo do hero
- **Tela/fluxo**: geral (light); subtítulo "Leia Enquanto é Tempo" (light e dark)
- **Severidade**: Baixa
- **Categoria**: Acessibilidade
- **Descrição**: o cinza `#64748b` (muted) sobre fundo claro rende ≈ **4,7:1** — passa AA por margem mínima, mas é usado até em textos de **11px** (descrições do Explorar), onde a legibilidade real sofre. O subtítulo do hero usa opacidade 50% sobre o fundo, ficando visivelmente apagado no dark (`09-home-dark-desktop.png`) — é a frase que nomeia o produto ("Leia Enquanto é Tempo").
- **Evidência**: amostras de cor computadas; `09-home-dark-desktop.png`.
- **Solução proposta**: piso de 12–13px para texto com cor muted; subir o muted um passo (ex.: `#57657a`) ou reservar o tom atual para ≥ 14px; subtítulo do hero para opacidade ≥ 70% ou cor sólida secundária.
- **Esforço estimado**: Baixo

### UX-016 — Header exibe "pill" cinza de carregamento de auth sem resolução visual
- **Tela/fluxo**: header em qualquer página durante o check de sessão
- **Severidade**: Baixa
- **Categoria**: Visual
- **Descrição**: enquanto a sessão é verificada, o lugar dos botões Entrar/Cadastrar mostra um retângulo cinza estático (sem shimmer), que ficou visível na captura de tablet — em conexões lentas parece elemento quebrado.
- **Evidência**: `22-home-tablet.png` (pill ao lado do toggle de tema).
- **Solução proposta**: skeleton com animação de pulso no mesmo tamanho do botão final, ou reservar o espaço e revelar com fade — nunca bloco cinza estático.
- **Esforço estimado**: Baixo

### UX-017 — Faixa tablet (768–1108px) usa menu hamburguer com espaço de sobra; menu mobile sem backdrop
- **Tela/fluxo**: header em 768px; menu aberto em 375px
- **Severidade**: Baixa
- **Categoria**: Usabilidade / Visual
- **Descrição**: o breakpoint do nav é 1108px, então tablets em retrato — com espaço para os 4 links — recebem hamburguer, escondendo navegação primária sem necessidade. No mobile, o menu aberto é um painel de meia-largura **sem backdrop/scrim**: o conteúdo atrás segue visível e clicável, sem convenção clara de como fechar (fora o X).
- **Evidência**: `22-home-tablet.png`, `11-home-mobile-menu.png`.
- **Solução proposta**: baixar o breakpoint do nav completo para ~820px (os 4 links + ações cabem) e, no menu mobile, adicionar scrim escurecido com fechamento por clique-fora e Esc (padrão drawer).
- **Esforço estimado**: Baixo/Médio

### UX-018 — Títulos de conteúdo com formatação suja aparecem na navegação
- **Tela/fluxo**: `/view/*` (navegação Anterior/Próximo), cards do Explorar
- **Severidade**: Baixa
- **Categoria**: Conteúdo
- **Descrição**: títulos cadastrados chegam à UI com hifenização e capitalização erráticas — ex.: "PP-News #06-Open ai, Google e Perplexity-reescrevem a…". Num produto cuja promessa é curadoria impecável, títulos sujos minam a percepção de qualidade.
- **Evidência**: link "Próximo" em `/view/newsletter/011`.
- **Solução proposta**: guia de estilo de títulos no admin (preview + validações leves: sem hífens duplos, capitalização de marcas) e revisão em lote dos itens existentes.
- **Esforço estimado**: Baixo (contínuo)

### UX-019 — Link "Ensinar" do footer aponta para a âncora da newsletter
- **Tela/fluxo**: footer da home, lista "Os 7 blocos"
- **Severidade**: Baixa
- **Categoria**: Usabilidade / Consistência
- **Descrição**: seis blocos do footer levam às suas seções; "Ensinar" leva a `#newsletter` — clicar rola para o formulário de inscrição sem explicação. O Explorar já tem um empty state honesto para Ensinar ("Em construção") que seria o destino correto.
- **Evidência**: inventário de links da home (`#newsletter` na posição do Ensinar).
- **Solução proposta**: apontar para `/explorar?b=ensinar` (mesmo destino dos demais), deixando o empty state comunicar o status; opcionalmente badge "em breve" no próprio footer.
- **Esforço estimado**: Baixo

### UX-020 — Alvo de toque do toggle de tema abaixo de 44px
- **Tela/fluxo**: header mobile
- **Severidade**: Baixa
- **Categoria**: Acessibilidade
- **Descrição**: o botão de tema mede 40×40px (recomendação Apple/WCAG 2.5.8: ≥ 44×44). O botão de menu (44×44) e "Entrar" (75×37) estão no limite. Com três estados de tema agora no ciclo, o botão também não comunica qual tema está ativo antes do clique — só o próximo ("Ativar modo sépia").
- **Evidência**: medidas DOM do header mobile.
- **Solução proposta**: área de toque de 44px (padding mantendo o ícone); considerar tooltip/`title` indicando o tema atual além do próximo, ou menu de seleção com os três estados nomeados (padrão de theme-switcher de docs modernas: claro/sépia/escuro/sistema explícitos).
- **Esforço estimado**: Baixo

---

## 4. Priorização (impacto × esforço)

| Ordem | ID | Problema | Impacto | Esforço | Tipo |
|---|---|---|---|---|---|
| 1 | UX-001 | Estado de erro da leitura (JSON cru) | Muito alto | Baixo | **Quick win crítico** |
| 2 | UX-004 | Filtro sépia global tingindo imagens | Alto | Baixo | Quick win |
| 3 | UX-005 | Nomenclatura/cadência dessincronizadas (banco) | Alto | Baixo | Quick win (conteúdo) |
| 4 | UX-002 | Erro de login em inglês | Alto | Baixo | Quick win |
| 5 | UX-007 | 404 default do Next no fluxo de leitura | Médio | Baixo | Quick win |
| 6 | UX-010 | Leitura sem "voltar"/contexto | Médio | Baixo | Quick win |
| 7 | UX-011 | Home mobile ~19 telas + "EM BREVE" na 2ª dobra | Médio | Baixo | Quick win (config) |
| 8 | UX-008 | Form newsletter sem label/feedback | Médio | Baixo | Quick win |
| 9 | UX-012 | Copy da barra de anúncios | Médio | Baixo | Quick win (processo) |
| 10 | UX-019 | Footer "Ensinar" → #newsletter | Baixo | Baixo | Quick win |
| 11 | UX-013 | Fade nas tabs roláveis | Baixo | Baixo | Quick win |
| 12 | UX-015 | Contrastes borderline / subtítulo hero | Médio | Baixo | Quick win |
| 13 | UX-016 | Pill de loading do header | Baixo | Baixo | Quick win |
| 14 | UX-020 | Alvo de toque do tema | Baixo | Baixo | Quick win |
| 15 | UX-003 | Overlays sem semântica de diálogo | Alto | Médio | **Estrutural** |
| 16 | UX-006 | Redirect silencioso + retorno pós-login | Médio | Médio | Estrutural |
| 17 | UX-009 | Hidratação React na home | Médio | Médio | Estrutural |
| 18 | UX-017 | Breakpoint do nav + scrim do menu | Baixo | Médio | Estrutural |
| 19 | UX-014 | Skip-link + landmarks | Médio | Baixo | Quick win (a11y) |
| 20 | UX-018 | Higiene de títulos | Médio | Contínuo | Processo |
| — | UX-005b | Governança código↔banco de copy (aviso de divergência no admin) | Alto | Médio | Estrutural |

**Leitura sugerida**: os itens 1–14 cabem num único ciclo curto de polimento e removem praticamente todos os momentos "quebrados" percebidos pelo usuário. Os estruturais (15–18) definem o salto de qualidade para nível "referência": diálogos acessíveis, fluxo de auth com contexto e saúde de renderização.

---

## 5. Padrões positivos observados

- **Skeletons de carregamento no Explorar** — placeholders com formas fiéis ao layout final; nenhum "flash" de tela vazia.
- **Foco de teclado visível em toda a navegação** — outline presente nos 10 primeiros tab stops testados, incluindo botões de ícone.
- **Estado vazio honesto no bloco Ensinar** ("Em construção. Este bloco ainda está sendo preparado.") — replicar esse padrão no estado de erro da leitura (UX-001).
- **Deep-links robustos no Explorar** — `?b=` com normalização de slugs antigos (`?b=reportagem` ainda funciona), preservando links compartilhados após o rebranding das seções.
- **Dark mode consistente e bonito** — paleta, cards do hero e ilustrações mantêm identidade e contraste (`09-home-dark-desktop.png`).
- **Badges de tempo de leitura em 100% dos cards** (40/40 no teste) com ícone e formato uniforme.
- **Carrossel "Comece por aqui" acessível** — `aria-roledescription="carousel"`, botões nomeados, estado `disabled` correto nos extremos, scroll-snap suave.
- **Cadastro com labels reais, autocomplete correto e toggle de senha** — o formulário mais completo do site é também o mais bem construído (login herda `autocomplete="email"/"current-password"`).
- **Sem overflow horizontal em nenhuma página testada** nos três viewports (0px de scroll lateral em home, explorar e leitura).
- **Sistema cromático dos 7 blocos** aplicado com disciplina em cards, badges, tabs e footer — forte âncora de reconhecimento (Nielsen: reconhecimento > memorização).

---

## 6. Status pós-correção (2026-07-08)

Todos os problemas viáveis foram corrigidos e verificados end-to-end com browser real (16/16 checks automatizados, screenshots `fix-01`…`fix-08` em `auditoria-screenshots/`):

| ID | Status | Verificação |
|---|---|---|
| UX-001 | ✅ Corrigido | View checa disponibilidade (HEAD) e renderiza estado de erro do design system com "Voltar para [seção]" + "Explorar conteúdos"; skeleton de carregamento adicionado |
| UX-002 | ✅ Corrigido | `mapError` agora casa `INVALID_EMAIL_OR_PASSWORD` → "Email ou senha inválidos"; fallback nunca vaza mensagem crua do provedor |
| UX-003 | ✅ Corrigido | `role="dialog"` + `aria-modal` + focus-trap + Esc + devolução de foco (hook `useDialogA11y`) em AuthModal e ForgotPasswordModal; erro com `role="alert"` |
| UX-004 | ✅ Corrigido | Tema renomeado para `theme-sepia` (sem colisão com utility do Tailwind); `filter: none` confirmado; imagens e cores de marca intactas |
| UX-005 | ✅ Corrigido | Seed guardado por valor antigo (`frontend/sql/sync_homepage_texts.sql`) aplicado ao banco de desenvolvimento: bloco 02 "Reportagem da Semana"→"Inteligência Artificial", bloco 03 "Radar"→"Editoriais e Artigos", cadências e slugs atualizados (screenshot `fix-09-blocos-renomeados.png`). **Rodar o mesmo seed no banco de produção no deploy** — é idempotente e preserva personalizações divergentes |
| UX-006 | ✅ Corrigido | `proxy.ts` envia `next=`; ModalsProvider abre o login com aviso "Entre para acessar a página…"; pós-login retorna ao destino |
| UX-007 | ✅ Corrigido | `app/not-found.tsx` brandado cobre rotas e `/view/*`; título correto |
| UX-008 | ✅ Corrigido | Label associada, validação inline pt-BR, `aria-invalid`/`aria-describedby`, placeholder neutro |
| UX-009 | ✅ Resolvido | 3 cargas limpas sem erro de hidratação (verificado pós-mudanças) |
| UX-010 | ✅ Corrigido | Barra de contexto sticky com "← [Seção]" + ajustes de leitura à direita |
| UX-011 | ✅ Corrigido | Cards "Em breve" não renderizam; seção editorial oculta sem conteúdo real (home ~46% mais curta) |
| UX-012 | ✅ Mitigado | Mensagem com `line-clamp-2`; admin com guia de estilo + contador âmbar >80 chars; `role="region"` no lugar de `alert` |
| UX-013 | ✅ Corrigido | Máscara de fade nas bordas da tab bar rolável |
| UX-014 | ✅ Corrigido | Skip-link "Pular para o conteúdo" (1º Tab) + `id="conteudo"` nas mains principais |
| UX-015 | ✅ Corrigido | `--muted-foreground` #56657b (≈5,4:1) no claro e #6b5f48 no sépia; subtítulo hero a 70% |
| UX-016 | ✅ Já conforme | Skeletons já tinham `animate-pulse` (screenshot capturou frame de opacidade baixa) |
| UX-017 | ✅ Corrigido | Breakpoint do nav 1108→960px (media queries sem sobreposição); scrim + clique-fora + Esc no menu mobile; `aria-expanded` |
| UX-018 | ✅ Mitigado | Guia de títulos no formulário do admin (marcas capitalizadas, sem hífens por espaços) |
| UX-019 | ✅ Corrigido | Footer e hero "Ensinar" → `/explorar?b=ensinar` |
| UX-020 | ✅ Corrigido | Toggle 44×44px; aria-label anuncia tema atual + próximo |

Gates: 240 testes unitários passando, 0 erros de lint, build de produção verde.

**Pendência operacional**: se o banco de produção for distinto do de desenvolvimento, executar `frontend/sql/sync_homepage_texts.sql` também em produção no próximo deploy (idempotente; só corrige valores que ainda estão com o texto antigo).

---

*Auditoria executada com Chromium headless (Playwright). Screenshots em `auditoria-screenshots/`.*
