# Política preventiva de audiodescrição — PP7+IAS

Status: **vigente, preventiva**. Nenhuma implementação de player, storage, schema ou pipeline
de produção existe ou é necessária hoje. Este documento define regras para o **primeiro
conteúdo audiovisual futuro** — não descreve infraestrutura já construída, e **não é uma
declaração de conformidade integral do portal nem parecer jurídico**. É um registro técnico
de estado e um conjunto de regras preventivas.

Owner: equipe editorial (aprovação de publicação) + engenharia (gate técnico, quando existir).
**Responsável pela reavaliação:** o autor/aprovador de publicação de qualquer conteúdo
audiovisual futuro deve, antes de publicar, reexecutar a busca da seção 1 e o checklist da
seção 5 — esta política não se reavalia sozinha.

## 1. Baseline — estado atual do portal

Auditado em: **2026-08-30**, branch `feat/libras-integration`, commit `7f831c1`
(`7f831c12ecb8162ea6663aaab1754ce13187a6e4`).

**Escopo da busca:** código-fonte em `frontend/app/`, `frontend/components/`, `frontend/lib/`,
`frontend/domain/`, `frontend/application/`, `frontend/infrastructure/`,
`frontend/presentation/`, mais a amostra local de conteúdo em `frontend/data/materiais/`.
Não cobre: conteúdo real no Railway Volume de produção (não acessível a partir deste
ambiente), nem histórico de commits anteriores.

**Não existe conteúdo audiovisual pré-gravado identificável no escopo auditado.** Esta é uma
constatação do estado em 2026-08-30, **não uma dispensa permanente** — vale apenas até o
próximo conteúdo audiovisual ser criado, incorporado ou planejado (seção 6), e deve ser
reconfirmada por quem for publicar esse conteúdo, executando novamente a busca desta seção.

Evidência da busca (frente de auditoria, Fase 0):

- Nenhuma tag `<video>` ou `<audio>` em `app/`, `components/`, `lib/`, `domain/`,
  `application/`, `infrastructure/`, `presentation/` (busca por `rg`/`grep`, sem resultados).
- Nenhuma referência a YouTube, Vimeo, `.mp4`, `.webm`, `.mp3`, `.wav`, `.m3u8` no código-fonte.
- `STORAGE_CONFIG` (`frontend/lib/contentStorage.ts`) só reconhece arquivos `.html` como tipo
  de conteúdo servível (`newsletter`, `mini-livro`, `biblioteca`, `editorial`,
  `radar_oportunidades`, `especial-semana`, `estudar`, `home-recomendacoes`, `ebook`, `book`,
  `mini-livro-section`). Não existe tipo de conteúdo audiovisual no domínio.
- O único `iframe` do app é `ViewIframe.tsx`, que renderiza o próprio HTML curado do portal
  (não incorpora vídeo de terceiros).
- Na amostra local de conteúdo (`frontend/data/materiais/`), o único `iframe` encontrado dentro
  de um HTML curado é um script de desafio anti-bot do Cloudflare — não é mídia.

**Registro formal:** todo o catálogo atual é classificado como **`not_applicable`** para
audiodescrição, com justificativa "nenhum ativo audiovisual pré-gravado existe no domínio
ou no storage servido pelo portal". Esta classificação reflete o estado do repositório em
2026-08-30 (commit `7f831c1`) — **não é uma dispensa permanente do requisito**, e deve ser
revalidada sempre que a condição de reabertura (seção 6) ocorrer.

## 2. O que é e o que não é audiodescrição (referência rápida)

Audiodescrição é a narração adicional, sincronizada, de informação visual relevante que a
trilha sonora original não comunica. Ela **não é** substituída por: `alt` text, leitor de
tela, "ouvir página"/TTS de texto existente, transcrição simples, legendas ou Libras — cada
um atende uma necessidade diferente. Ver tabela completa na seção 1.2 do plano de origem
(`PP7IAS_Plano_de_Audiodescricao_com_Subagentes.md`, mantido fora do repositório).

Classificação por tipo de conteúdo, aplicável a qualquer item futuro:

| Tipo | Exige audiodescrição? |
| --- | --- |
| Imagem estática (capa, foto, gráfico) | Não — trate com `alt` adequado (WCAG 1.1.1, fora desta política) |
| Animação sem áudio e sem informação essencial | Avaliar caso a caso; normalmente não |
| iframe técnico (desafio anti-bot, widget de terceiro sem conteúdo próprio) | Não |
| Áudio only (podcast) | Não — exige transcrição, não audiodescrição |
| Vídeo sem áudio | Sim — alternativa textual completa ou faixa de áudio equivalente (nível A, WCAG 1.2.1) |
| Vídeo com áudio cuja trilha já verbaliza toda informação visual relevante | Não é necessária faixa adicional — **registrar justificativa e testar** |
| Vídeo com áudio e informação visual relevante não verbalizada | Sim — audiodescrição (nível AA, WCAG 1.2.5) ou alternativa completa (nível A, WCAG 1.2.3) |
| Vídeo com pouco espaço entre falas para descrição padrão | Avaliar audiodescrição estendida (nível AAA, WCAG 1.2.7) — não é gate obrigatório de AA |

## 3. Meta normativa

- **WCAG 2.2 nível AA** para conteúdo audiovisual pré-gravado é a meta de conformidade.
  Critérios de sucesso diretamente aplicáveis:
  - **1.2.3 — Audiodescrição ou alternativa para mídia, pré-gravada (nível A):** para vídeo
    sincronizado pré-gravado, oferecer audiodescrição **ou** uma alternativa completa
    baseada em texto.
  - **1.2.5 — Audiodescrição, pré-gravada (nível AA):** oferecer audiodescrição para toda
    informação visual relevante em vídeo pré-gravado sincronizado. Transcrição isolada não
    satisfaz este critério.
  - **1.1.1 — Conteúdo não textual (nível A):** imagens estáticas precisam de alternativa
    textual adequada ao propósito. Este critério **não é audiodescrição** e não é tratado
    por esta política — ver seção 7 e a issue recomendada na seção 8.
- ABNT NBR 17225:2025 (acessibilidade em conteúdo e aplicações web) e ABNT NBR 16452:2016
  (produção de audiodescrição) são referências brasileiras a consultar na edição vigente
  no momento da implementação — nenhuma cláusula específica é presumida ou reproduzida aqui.
- Lei 13.146/2015 (LBI) é referência legal geral; qualificação jurídica específica (ex.
  vídeo publicitário, conteúdo de comercialização) exige revisão jurídica própria, fora do
  escopo desta política técnica.

## 4. Regras para o primeiro conteúdo audiovisual futuro

Estas regras passam a valer no momento em que **qualquer** vídeo ou áudio pré-gravado for
criado, incorporado ou planejado para publicação no portal — mesmo em rascunho.

1. **Avaliação editorial obrigatória antes da publicação.** Nenhum vídeo pré-gravado é
   publicado sem que alguém responda: (a) há informação visual relevante? (b) o áudio
   original já a comunica integralmente? (c) qual tratamento é necessário?
2. **`not_applicable` só é aceito com justificativa registrada e revisável** — nunca como
   valor padrão silencioso. Justificativa deve nomear por que a informação visual não é
   relevante ou já está no áudio.
3. **Quando o áudio original já for suficiente**, registrar essa conclusão explicitamente
   (o que foi verificado, por quem, quando) em vez de omitir o item do controle.
4. **Quando houver informação visual relevante não verbalizada**, audiodescrição (ou
   alternativa textual completa equivalente) é obrigatória antes da publicação — não é
   opcional nem pode ser adiada para "depois".
5. **Direitos autorais e de imagem.** Nenhuma versão derivada (dublagem, faixa adicional,
   edição, síntese de voz sobre o vídeo) é criada sem confirmação de que o portal detém ou
   tem licença para produzir obra derivada daquele master.
6. **IA não publica sozinha.** Modelos de IA podem ajudar a rascunhar roteiro, sugerir
   timecodes ou extrair texto de tela, mas toda descrição precisa de revisão humana
   editorial antes de qualquer publicação. É proibido publicar audiodescrição gerada por
   IA sem revisão e aprovação humana registradas.
7. **Nenhum autoplay com som ou audiodescrição.**
8. **Infraestrutura é projetada apenas quando houver caso real.** Esta política
   deliberadamente **não** define schema de CMS, gate técnico de publicação, arquitetura
   de player (faixa selecionável, vídeo alternativo, VTT) ou pipeline de produção de áudio.
   Construir isso agora seria infraestrutura especulativa, sem conteúdo real para validar
   as decisões. Essas peças são desenhadas no momento em que o primeiro item audiovisual
   real existir, com base nas restrições reais desse item (provedor, formato, direitos).

## 5. Checklist de avaliação (a aplicar por item, quando existir)

- [ ] Master do vídeo/áudio identificado e versão congelada.
- [ ] Tipo classificado: vídeo sem áudio / vídeo com áudio / áudio only / animação / iframe técnico.
- [ ] Informação visual relevante listada (ou ausência justificada).
- [ ] Verificado se a trilha original já comunica essa informação.
- [ ] Direitos confirmados para obra derivada, se aplicável.
- [ ] Tratamento decidido: audiodescrição / alternativa textual completa / `not_applicable` com justificativa.
- [ ] Se audiodescrição: roteiro revisado por responsável editorial antes da produção.
- [ ] Revisão humana da descrição final (IA não aprova nem publica sozinha).
- [ ] Evidência registrada (quem avaliou, quando, decisão, justificativa).
- [ ] Aprovação de publicação por responsável nomeado.

**Responsável pela avaliação:** a definir por item, papel editorial responsável pela
publicação daquele conteúdo (não um cargo fixo, pois não há pipeline hoje).

**Evidência mínima a registrar por item:** classificação, justificativa, revisores,
data, decisão final. Formato de registro (planilha, issue, campo de CMS) é decidido no
momento em que o primeiro item real existir — não presumido aqui.

## 6. Condição de reabertura desta frente

Reabrir este trabalho — e só então desenhar schema, gate de CMS, player e pipeline de
produção — quando **qualquer** um destes eventos ocorrer:

- criação de um vídeo ou áudio pré-gravado para publicação no portal (mesmo em rascunho);
- incorporação de vídeo de terceiro (ex. YouTube, Vimeo) em qualquer página do portal;
- planejamento formal (briefing, contrato, roteiro) de conteúdo audiovisual futuro.

Quando isso ocorrer, aplicar o checklist da seção 5 ao primeiro item real e, só então,
decidir arquitetura de player, modelo de dados, gate de publicação e pipeline de produção
com base nas restrições concretas desse item — não antes.

## 7. Fora de escopo desta política

- Auditoria de `alt` text em imagens estáticas (WCAG 1.1.1). **Não pertence a esta frente.**
  Recomendado como issue separada — ver seção 8.
- Legendas, transcrição de podcast, Libras: necessidades distintas, com critérios WCAG
  próprios, não tratadas aqui.
- Qualquer implementação de player, storage, schema ou pipeline de produção de áudio.

## 8. Issue recomendada (fora desta frente)

**Título sugerido:** "Auditoria de `alt` text em imagens do portal (WCAG 1.1.1)"

**Escopo:** revisar capas de mini-livro, imagens de newsletters/biblioteca e gráficos em
HTML curado quanto a `alt` adequado (funcional, conciso, vazio quando decorativo).
Não depende desta política e não requer produção de áudio. Requer autorização própria
antes de execução.
