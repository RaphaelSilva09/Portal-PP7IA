# T16 - Popular Biblioteca de Prompts

## Pedido

Popular a Biblioteca de Prompts do tema `Biblioteca > Prompts` com prompts modernos, principalmente para iniciantes em IA, respeitando as opções atuais da seção: IA, titulo, caso de uso, corpo do prompt, tags, restricao para leitores cadastrados e ordem.

## Pesquisa usada

- OpenAI recomenda prompts claros, especificos, com contexto suficiente, tom desejado e refinamento iterativo.
- OpenAI tambem recomenda colocar instrucoes no inicio, separar contexto com delimitadores e declarar resultado, tamanho, formato e estilo.
- Google recomenda instrucoes especificas, exemplos, decompor tarefas em passos e pedir o formato de saida desejado; em prompts multimodais, orientar qual parte da imagem/video/documento deve ser usada.
- Anthropic recomenda tratar prompting como ciclo de melhoria com criterios de sucesso definidos e, em casos avancados, usar exemplos, formato de saida e avaliacoes.
- Para analise de dados, OpenAI recomenda dados com cabecalhos claros, um registro por linha e instrucao explicita sobre colunas, calculos, agrupamentos e graficos.

Fontes:

- https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt
- https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api
- https://ai.google.dev/gemini-api/docs/generate-content/files
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
- https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt

## Estrategia editorial

1. Cobrir as 7 IAs ja definidas em `AI_TOOLS`: Claude, ChatGPT, Gemini, Adapta, Perplexity, Grok e Manus.
2. Publicar 21 prompts: 3 por IA.
3. Priorizar iniciantes: pelo menos 14 prompts com tag `Iniciante`.
4. Incluir camada avancada: pelo menos 7 prompts com tag `Avancado`, focados em decisao, pesquisa, automacao, dados e avaliacao critica.
5. Deixar 7 prompts iniciais abertos (`is_gated = false`), um por IA, para reduzir friccao e mostrar valor antes do cadastro.
6. Manter os demais prompts restritos (`is_gated = true`) como beneficio para leitores cadastrados.
7. Usar tags sugeridas quando possivel e tags livres apenas para nivel/forma de uso: `Iniciante`, `Avancado`, `Pesquisa`, `Multimodal`, `Automacao`.

## Catalogo a inserir

### ChatGPT

**1. Primeiro prompt bem-feito**

- `ai_tool`: ChatGPT
- `use_case`: Para transformar uma pergunta vaga em um pedido claro, com contexto, formato e tom.
- `is_gated`: false
- `sort_order`: 10
- `tags`: `{"Iniciante","Produtividade","Comunicação e Redação"}`
- `prompt_body`:

```text
Quero sua ajuda para transformar uma ideia vaga em um prompt melhor.

Meu objetivo:
[descreva o que voce quer conseguir]

Contexto:
[explique para quem e, por que importa e qualquer restricao]

Antes de responder, faca ate 3 perguntas se faltar informacao importante. Se ja houver informacao suficiente, entregue:
1. uma versao simples do prompt;
2. uma versao mais completa;
3. uma explicacao curta do que cada parte do prompt esta fazendo.

Use linguagem clara, sem jargoes, para alguem iniciante em IA.
```

**2. Explicar um assunto dificil com exemplos**

- `ai_tool`: ChatGPT
- `use_case`: Para aprender um conceito novo sem se perder em termos tecnicos.
- `is_gated`: true
- `sort_order`: 20
- `tags`: `{"Iniciante","Desenvolvimento Pessoal","Comunicação e Redação"}`
- `prompt_body`:

```text
Explique o assunto abaixo como se eu estivesse vendo isso pela primeira vez.

Assunto:
[tema]

Meu nivel atual:
[iniciante/intermediario/avancado]

Quero que voce responda nesta estrutura:
1. explicacao em linguagem simples;
2. analogia cotidiana;
3. exemplo pratico;
4. erros comuns de entendimento;
5. 5 perguntas para testar se eu entendi.

Se houver termos tecnicos inevitaveis, defina cada um em uma frase curta.
```

**3. Plano de 30 dias para aprender IA na pratica**

- `ai_tool`: ChatGPT
- `use_case`: Para criar uma trilha de aprendizado realista, com pequenas tarefas semanais.
- `is_gated`: true
- `sort_order`: 30
- `tags`: `{"Iniciante","Produtividade","Desenvolvimento Pessoal"}`
- `prompt_body`:

```text
Monte um plano de 30 dias para eu aprender a usar IA no meu trabalho.

Meu contexto profissional:
[cargo, area, rotina e principais desafios]

Tempo disponivel:
[minutos por dia ou dias por semana]

Ferramentas que tenho acesso:
[ChatGPT, Claude, Gemini, Perplexity, outras]

Entregue:
1. objetivo de cada semana;
2. tarefa pratica de cada dia;
3. exemplo de prompt para cada tarefa;
4. criterio simples para eu saber se melhorei;
5. uma versao reduzida caso eu tenha apenas metade do tempo.
```

### Claude

**4. Revisar texto com criterio e gentileza**

- `ai_tool`: Claude
- `use_case`: Para melhorar e-mails, comunicados, propostas e textos sensiveis sem perder a intencao original.
- `is_gated`: false
- `sort_order`: 40
- `tags`: `{"Iniciante","Comunicação e Redação","Gestão de Pessoas"}`
- `prompt_body`:

```text
Revise o texto abaixo preservando minha intencao, mas melhorando clareza, tom e estrutura.

Publico:
[quem vai ler]

Tom desejado:
[direto, acolhedor, executivo, firme, didatico]

Texto:
"""
[cole o texto]
"""

Entregue:
1. versao revisada;
2. principais mudancas feitas;
3. pontos que ainda podem gerar mal-entendido;
4. uma versao 20% mais curta.
```

**5. Conselho critico antes de uma decisao**

- `ai_tool`: Claude
- `use_case`: Para avaliar uma decisao importante com criterios, riscos e alternativas.
- `is_gated`: true
- `sort_order`: 50
- `tags`: `{"Avancado","Estratégia e Decisão","Liderança"}`
- `prompt_body`:

```text
Atue como um conselho critico e construtivo para a decisao abaixo.

Decisao a tomar:
[descreva]

Contexto:
[objetivo, restricoes, prazo, pessoas afetadas, dados disponiveis]

Avalie em cinco blocos:
1. o que parece solido;
2. suposicoes frageis;
3. riscos de segunda ordem;
4. alternativas que eu deveria considerar;
5. recomendacao final com nivel de confianca de 0 a 100.

Nao seja agradavel por padrao. Seja util, especifico e justo.
```

**6. Transformar reuniao em proximos passos**

- `ai_tool`: Claude
- `use_case`: Para converter notas baguncadas de reuniao em responsabilidades, decisoes e pendencias.
- `is_gated`: true
- `sort_order`: 60
- `tags`: `{"Iniciante","Reuniões e Feedback","Produtividade"}`
- `prompt_body`:

```text
Organize as notas de reuniao abaixo em um resumo acionavel.

Notas:
"""
[cole as notas]
"""

Quero a saida em markdown com:
1. resumo em ate 5 linhas;
2. decisoes tomadas;
3. tarefas com responsavel, prazo e prioridade;
4. perguntas em aberto;
5. mensagem curta que eu possa enviar ao grupo.

Se alguma tarefa nao tiver responsavel ou prazo, marque como "a definir" em vez de inventar.
```

### Gemini

**7. Resumir material com perguntas de estudo**

- `ai_tool`: Gemini
- `use_case`: Para estudar documentos, videos ou imagens e sair com resumo, conceitos e perguntas.
- `is_gated`: false
- `sort_order`: 70
- `tags`: `{"Iniciante","Desenvolvimento Pessoal","Multimodal"}`
- `prompt_body`:

```text
Analise o material anexado ou colado abaixo e me ajude a estudar.

Foco do estudo:
[o que quero aprender ou decidir]

Material:
[cole o texto ou anexe arquivo/imagem/video quando a ferramenta permitir]

Entregue:
1. resumo em linguagem simples;
2. 7 pontos principais;
3. conceitos que preciso entender;
4. 5 perguntas e respostas para revisar;
5. o que o material nao responde com clareza.

Use apenas informacoes do material quando eu pedir resumo fiel. Se inferir algo, diga que e inferencia.
```

**8. Matriz de comparacao para escolher melhor**

- `ai_tool`: Gemini
- `use_case`: Para comparar opcoes com criterios claros e uma recomendacao final.
- `is_gated`: true
- `sort_order`: 80
- `tags`: `{"Iniciante","Estratégia e Decisão","Análise e Dados"}`
- `prompt_body`:

```text
Compare as opcoes abaixo usando uma matriz de decisao.

Objetivo da escolha:
[objetivo]

Opcoes:
[liste as opcoes]

Criterios importantes:
[custo, tempo, risco, impacto, facilidade, qualidade, outros]

Entregue:
1. tabela com nota de 1 a 5 por criterio;
2. justificativa curta de cada nota;
3. recomendacao principal;
4. quando a recomendacao mudaria;
5. informacoes que faltam para decidir com mais seguranca.
```

**9. Roteiro visual para apresentacao**

- `ai_tool`: Gemini
- `use_case`: Para transformar uma ideia em narrativa visual de slides ou apresentacao.
- `is_gated`: true
- `sort_order`: 90
- `tags`: `{"Iniciante","Avancado","Comunicação e Redação","Estratégia e Decisão"}`
- `prompt_body`:

```text
Crie um roteiro visual para uma apresentacao.

Tema:
[tema]

Publico:
[quem vai assistir]

Objetivo:
[informar, convencer, vender, alinhar, treinar]

Duracao:
[tempo]

Entregue uma tabela com:
- numero do slide;
- titulo;
- mensagem principal;
- visual sugerido;
- dados ou evidencias necessarias;
- fala do apresentador em 2 ou 3 frases.

Depois, liste 3 formas de tornar a apresentacao mais memoravel sem exagerar no design.
```

### Adapta

**10. Adaptar mensagem para o publico certo**

- `ai_tool`: Adapta
- `use_case`: Para reescrever uma mensagem mudando publico, tom e nivel de detalhe.
- `is_gated`: false
- `sort_order`: 100
- `tags`: `{"Iniciante","Comunicação e Redação","Gestão de Pessoas"}`
- `prompt_body`:

```text
Adapte a mensagem abaixo para o publico indicado.

Mensagem original:
"""
[cole a mensagem]
"""

Publico de destino:
[ex.: equipe operacional, lideranca, cliente, candidato, diretoria]

Tom:
[ex.: claro, acolhedor, executivo, firme, motivador]

Restrições:
[ex.: maximo 120 palavras, sem jargoes, incluir chamada para acao]

Entregue:
1. versao adaptada;
2. versao mais curta;
3. explicacao das escolhas de tom;
4. alerta de qualquer trecho que possa soar ambiguo ou inadequado.
```

**11. Transformar conteudo tecnico em plano de acao**

- `ai_tool`: Adapta
- `use_case`: Para converter relatorios, textos tecnicos ou insights em passos praticos.
- `is_gated`: true
- `sort_order`: 110
- `tags`: `{"Iniciante","Estratégia e Decisão","Produtividade"}`
- `prompt_body`:

```text
Transforme o conteudo abaixo em um plano de acao pratico.

Conteudo:
"""
[cole o texto]
"""

Meu papel:
[cargo ou responsabilidade]

Prazo:
[quando preciso agir]

Entregue:
1. resumo executivo;
2. 5 acoes recomendadas;
3. primeiro passo para cada acao;
4. riscos de nao agir;
5. indicadores simples para acompanhar progresso.

Nao use frases genericas. Cada acao deve ser observavel e executavel.
```

**12. Personalizar feedback sem perder firmeza**

- `ai_tool`: Adapta
- `use_case`: Para preparar feedback individual com respeito, clareza e orientacao de melhoria.
- `is_gated`: true
- `sort_order`: 120
- `tags`: `{"Avancado","Gestão de Pessoas","Reuniões e Feedback"}`
- `prompt_body`:

```text
Ajude-me a preparar um feedback individual.

Situacao:
[o que aconteceu, com fatos observaveis]

Impacto:
[impacto no time, cliente, prazo ou qualidade]

Objetivo da conversa:
[corrigir, reconhecer, alinhar expectativa, desenvolver]

Perfil da pessoa:
[o que devo considerar sobre estilo, senioridade ou contexto]

Entregue:
1. abertura da conversa;
2. feedback em formato situacao-impacto-expectativa;
3. perguntas para ouvir a pessoa;
4. acordo de proximos passos;
5. versao mais direta, caso o tempo seja curto.
```

### Perplexity

**13. Pesquisa rapida com fontes e ressalvas**

- `ai_tool`: Perplexity
- `use_case`: Para pesquisar um tema atual com fontes, datas e nivel de confianca.
- `is_gated`: false
- `sort_order`: 130
- `tags`: `{"Iniciante","Pesquisa","Estratégia e Decisão"}`
- `prompt_body`:

```text
Pesquise o tema abaixo usando fontes recentes e confiaveis.

Tema:
[tema]

Contexto da minha pergunta:
[por que isso importa para mim]

Entregue:
1. resposta curta em ate 8 linhas;
2. principais fatos com fontes;
3. datas importantes;
4. pontos ainda incertos ou divergentes;
5. o que eu deveria verificar antes de agir.

Priorize fontes primarias, dados oficiais e publicacoes reconhecidas. Se uma informacao puder ter mudado recentemente, destaque isso.
```

**14. Mapa de controversia**

- `ai_tool`: Perplexity
- `use_case`: Para entender um tema com opinioes conflitantes sem cair em resposta simplista.
- `is_gated`: true
- `sort_order`: 140
- `tags`: `{"Avancado","Pesquisa","Comunicação e Redação"}`
- `prompt_body`:

```text
Mapeie a controversia sobre o tema abaixo.

Tema:
[tema]

Quero entender:
[decisao, debate, risco, oportunidade]

Entregue:
1. resumo neutro do debate;
2. argumento do lado A com fontes;
3. argumento do lado B com fontes;
4. pontos de consenso;
5. pontos realmente incertos;
6. minha melhor pergunta de proxima pesquisa.

Separe fatos, interpretacoes e opinioes. Inclua links das fontes usadas.
```

**15. Radar semanal de sinais**

- `ai_tool`: Perplexity
- `use_case`: Para acompanhar tendencias e separar ruido de sinais relevantes.
- `is_gated`: true
- `sort_order`: 150
- `tags`: `{"Avancado","Pesquisa","Estratégia e Decisão"}`
- `prompt_body`:

```text
Monte um radar de sinais recentes sobre:
[tema ou setor]

Periodo:
[ultimos 7 dias, 30 dias, trimestre]

Meu interesse:
[oportunidades, riscos, concorrentes, tecnologia, regulacao]

Entregue:
1. 5 sinais relevantes;
2. por que cada sinal importa;
3. fonte e data;
4. impacto provavel: baixo, medio ou alto;
5. acao recomendada para acompanhar ou testar.

Nao liste noticias soltas. Agrupe sinais em padroes quando fizer sentido.
```

### Grok

**16. Desafiar minha ideia sem perder leveza**

- `ai_tool`: Grok
- `use_case`: Para testar uma ideia com contrapontos diretos antes de apresenta-la.
- `is_gated`: false
- `sort_order`: 160
- `tags`: `{"Iniciante","Estratégia e Decisão","Liderança"}`
- `prompt_body`:

```text
Quero que voce desafie minha ideia de forma direta, inteligente e com leveza.

Ideia:
[descreva]

Contexto:
[quem sera impactado, objetivo, restricoes]

Responda com:
1. o melhor argumento a favor;
2. os 5 furos mais provaveis;
3. perguntas que um critico faria;
4. como eu poderia fortalecer a ideia;
5. uma versao mais simples e convincente da proposta.

Se usar humor, mantenha profissional. O foco e melhorar a ideia, nao ridicularizar.
```

**17. Brainstorm amplo e selecao rigorosa**

- `ai_tool`: Grok
- `use_case`: Para gerar muitas ideias e depois escolher as melhores com criterio.
- `is_gated`: true
- `sort_order`: 170
- `tags`: `{"Iniciante","Produtividade","Comunicação e Redação"}`
- `prompt_body`:

```text
Faca um brainstorm sobre o desafio abaixo.

Desafio:
[descreva]

Limites:
[orcamento, prazo, publico, formato, canal]

Primeiro, gere 20 ideias variadas. Depois selecione as 5 melhores usando estes criterios:
1. impacto;
2. facilidade;
3. originalidade;
4. risco;
5. alinhamento com o publico.

Para cada uma das 5 melhores, entregue um primeiro experimento que eu possa fazer em ate 48 horas.
```

**18. Leitura critica de percepcao publica**

- `ai_tool`: Grok
- `use_case`: Para analisar percepcao publica, linguagem de audiencia e possiveis reacoes.
- `is_gated`: true
- `sort_order`: 180
- `tags`: `{"Avancado","Comunicação e Redação","Estratégia e Decisão"}`
- `prompt_body`:

```text
Analise a percepcao publica provavel sobre a mensagem, produto ou decisao abaixo.

Material:
"""
[cole texto, proposta ou resumo]
"""

Publico:
[quem vai reagir]

Contexto cultural ou de mercado:
[se houver]

Entregue:
1. leitura provavel da audiencia;
2. trechos que podem gerar resistencia;
3. argumentos que podem funcionar melhor;
4. riscos de interpretacao;
5. versao alternativa mais clara e menos vulneravel a ma interpretacao.
```

### Manus

**19. Delegar uma tarefa completa para um agente**

- `ai_tool`: Manus
- `use_case`: Para transformar um objetivo em briefing executavel, com etapas, entregaveis e verificacao.
- `is_gated`: false
- `sort_order`: 190
- `tags`: `{"Iniciante","Automacao","Produtividade"}`
- `prompt_body`:

```text
Quero delegar a tarefa abaixo para um agente de IA.

Objetivo:
[resultado final esperado]

Contexto:
[informacoes de fundo, publico, restricoes e exemplos]

Recursos disponiveis:
[links, arquivos, ferramentas, dados]

Prazo ou profundidade desejada:
[rapido, detalhado, pronto para publicar, apenas rascunho]

Antes de executar, transforme isso em:
1. checklist de etapas;
2. perguntas de esclarecimento essenciais;
3. criterios de sucesso;
4. riscos ou dependencias;
5. formato exato do entregavel final.

Depois, execute a primeira versao apenas se as informacoes forem suficientes.
```

**20. Pesquisa com planilha e relatorio**

- `ai_tool`: Manus
- `use_case`: Para coletar informacoes, estruturar dados e entregar sintese executiva.
- `is_gated`: true
- `sort_order`: 200
- `tags`: `{"Avancado","Automacao","Análise e Dados"}`
- `prompt_body`:

```text
Execute uma pesquisa estruturada sobre:
[tema, empresas, ferramentas ou mercado]

Crie uma tabela com estas colunas:
[colunas desejadas]

Criterios de busca:
[fontes, periodo, regiao, tipo de evidencia]

Entregue:
1. tabela preenchida;
2. resumo executivo;
3. principais padroes encontrados;
4. lacunas ou dados incertos;
5. recomendacao de proximo passo.

Registre a fonte de cada linha. Nao misture dados confirmados com inferencias.
```

**21. Auditoria de processo repetitivo**

- `ai_tool`: Manus
- `use_case`: Para encontrar tarefas automatizaveis e propor fluxo de automacao seguro.
- `is_gated`: true
- `sort_order`: 210
- `tags`: `{"Avancado","Automacao","Produtividade"}`
- `prompt_body`:

```text
Audite o processo repetitivo abaixo e proponha uma automacao.

Processo atual:
[passo a passo atual]

Ferramentas usadas:
[sistemas, planilhas, e-mails, documentos]

Frequencia:
[diaria, semanal, mensal]

Problemas atuais:
[erros, retrabalho, demora, falta de padrao]

Entregue:
1. mapa do processo atual;
2. etapas que podem ser automatizadas;
3. etapas que devem continuar humanas;
4. riscos de automacao;
5. fluxo recomendado;
6. primeiro teste pequeno para validar sem afetar usuarios.
```

## Criterios de aceite

- A biblioteca passa a ter 21 prompts, 3 por IA.
- Todos os itens usam `ai_tool` igual a uma das 7 opcoes existentes.
- Todos os itens tem `title`, `use_case`, `prompt_body`, `sort_order`, `is_gated` e pelo menos duas tags.
- Pelo menos 7 prompts ficam abertos para visitantes anonimos.
- Pelo menos 14 prompts incluem a tag `Iniciante`.
- Pelo menos 7 prompts incluem a tag `Avancado`.
- A migracao deve ser idempotente e nao pode apagar prompts criados manualmente no admin.
- A UI publica continua filtrando por IA e por tag.
- Leitores anonimos continuam vendo teaser quando `is_gated = true`.
