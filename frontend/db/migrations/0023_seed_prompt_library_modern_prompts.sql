WITH seed(ai_tool, title, prompt_body, use_case, is_gated, sort_order, tags) AS (
    VALUES
        ('ChatGPT', 'Primeiro prompt bem-feito', $prompt$Quero sua ajuda para transformar uma ideia vaga em um prompt melhor.

Meu objetivo:
[descreva o que voce quer conseguir]

Contexto:
[explique para quem e, por que importa e qualquer restricao]

Antes de responder, faca ate 3 perguntas se faltar informacao importante. Se ja houver informacao suficiente, entregue:
1. uma versao simples do prompt;
2. uma versao mais completa;
3. uma explicacao curta do que cada parte do prompt esta fazendo.

Use linguagem clara, sem jargoes, para alguem iniciante em IA.$prompt$, 'Para transformar uma pergunta vaga em um pedido claro, com contexto, formato e tom.', false, 10, ARRAY['Iniciante', 'Produtividade', 'Comunicação e Redação']::text[]),
        ('ChatGPT', 'Explicar um assunto dificil com exemplos', $prompt$Explique o assunto abaixo como se eu estivesse vendo isso pela primeira vez.

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

Se houver termos tecnicos inevitaveis, defina cada um em uma frase curta.$prompt$, 'Para aprender um conceito novo sem se perder em termos tecnicos.', true, 20, ARRAY['Iniciante', 'Desenvolvimento Pessoal', 'Comunicação e Redação']::text[]),
        ('ChatGPT', 'Plano de 30 dias para aprender IA na pratica', $prompt$Monte um plano de 30 dias para eu aprender a usar IA no meu trabalho.

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
5. uma versao reduzida caso eu tenha apenas metade do tempo.$prompt$, 'Para criar uma trilha de aprendizado realista, com pequenas tarefas semanais.', true, 30, ARRAY['Iniciante', 'Produtividade', 'Desenvolvimento Pessoal']::text[]),
        ('Claude', 'Revisar texto com criterio e gentileza', $prompt$Revise o texto abaixo preservando minha intencao, mas melhorando clareza, tom e estrutura.

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
4. uma versao 20% mais curta.$prompt$, 'Para melhorar e-mails, comunicados, propostas e textos sensiveis sem perder a intencao original.', false, 40, ARRAY['Iniciante', 'Comunicação e Redação', 'Gestão de Pessoas']::text[]),
        ('Claude', 'Conselho critico antes de uma decisao', $prompt$Atue como um conselho critico e construtivo para a decisao abaixo.

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

Nao seja agradavel por padrao. Seja util, especifico e justo.$prompt$, 'Para avaliar uma decisao importante com criterios, riscos e alternativas.', true, 50, ARRAY['Avancado', 'Estratégia e Decisão', 'Liderança']::text[]),
        ('Claude', 'Transformar reuniao em proximos passos', $prompt$Organize as notas de reuniao abaixo em um resumo acionavel.

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

Se alguma tarefa nao tiver responsavel ou prazo, marque como "a definir" em vez de inventar.$prompt$, 'Para converter notas baguncadas de reuniao em responsabilidades, decisoes e pendencias.', true, 60, ARRAY['Iniciante', 'Reuniões e Feedback', 'Produtividade']::text[]),
        ('Gemini', 'Resumir material com perguntas de estudo', $prompt$Analise o material anexado ou colado abaixo e me ajude a estudar.

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

Use apenas informacoes do material quando eu pedir resumo fiel. Se inferir algo, diga que e inferencia.$prompt$, 'Para estudar documentos, videos ou imagens e sair com resumo, conceitos e perguntas.', false, 70, ARRAY['Iniciante', 'Desenvolvimento Pessoal', 'Multimodal']::text[]),
        ('Gemini', 'Matriz de comparacao para escolher melhor', $prompt$Compare as opcoes abaixo usando uma matriz de decisao.

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
5. informacoes que faltam para decidir com mais seguranca.$prompt$, 'Para comparar opcoes com criterios claros e uma recomendacao final.', true, 80, ARRAY['Iniciante', 'Estratégia e Decisão', 'Análise e Dados']::text[]),
        ('Gemini', 'Roteiro visual para apresentacao', $prompt$Crie um roteiro visual para uma apresentacao.

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

Depois, liste 3 formas de tornar a apresentacao mais memoravel sem exagerar no design.$prompt$, 'Para transformar uma ideia em narrativa visual de slides ou apresentacao.', true, 90, ARRAY['Iniciante', 'Avancado', 'Comunicação e Redação', 'Estratégia e Decisão']::text[]),
        ('Adapta', 'Adaptar mensagem para o publico certo', $prompt$Adapte a mensagem abaixo para o publico indicado.

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
4. alerta de qualquer trecho que possa soar ambiguo ou inadequado.$prompt$, 'Para reescrever uma mensagem mudando publico, tom e nivel de detalhe.', false, 100, ARRAY['Iniciante', 'Comunicação e Redação', 'Gestão de Pessoas']::text[]),
        ('Adapta', 'Transformar conteudo tecnico em plano de acao', $prompt$Transforme o conteudo abaixo em um plano de acao pratico.

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

Nao use frases genericas. Cada acao deve ser observavel e executavel.$prompt$, 'Para converter relatorios, textos tecnicos ou insights em passos praticos.', true, 110, ARRAY['Iniciante', 'Estratégia e Decisão', 'Produtividade']::text[]),
        ('Adapta', 'Personalizar feedback sem perder firmeza', $prompt$Ajude-me a preparar um feedback individual.

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
5. versao mais direta, caso o tempo seja curto.$prompt$, 'Para preparar feedback individual com respeito, clareza e orientacao de melhoria.', true, 120, ARRAY['Avancado', 'Gestão de Pessoas', 'Reuniões e Feedback']::text[]),
        ('Perplexity', 'Pesquisa rapida com fontes e ressalvas', $prompt$Pesquise o tema abaixo usando fontes recentes e confiaveis.

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

Priorize fontes primarias, dados oficiais e publicacoes reconhecidas. Se uma informacao puder ter mudado recentemente, destaque isso.$prompt$, 'Para pesquisar um tema atual com fontes, datas e nivel de confianca.', false, 130, ARRAY['Iniciante', 'Pesquisa', 'Estratégia e Decisão']::text[]),
        ('Perplexity', 'Mapa de controversia', $prompt$Mapeie a controversia sobre o tema abaixo.

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

Separe fatos, interpretacoes e opinioes. Inclua links das fontes usadas.$prompt$, 'Para entender um tema com opinioes conflitantes sem cair em resposta simplista.', true, 140, ARRAY['Avancado', 'Pesquisa', 'Comunicação e Redação']::text[]),
        ('Perplexity', 'Radar semanal de sinais', $prompt$Monte um radar de sinais recentes sobre:
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

Nao liste noticias soltas. Agrupe sinais em padroes quando fizer sentido.$prompt$, 'Para acompanhar tendencias e separar ruido de sinais relevantes.', true, 150, ARRAY['Avancado', 'Pesquisa', 'Estratégia e Decisão']::text[]),
        ('Grok', 'Desafiar minha ideia sem perder leveza', $prompt$Quero que voce desafie minha ideia de forma direta, inteligente e com leveza.

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

Se usar humor, mantenha profissional. O foco e melhorar a ideia, nao ridicularizar.$prompt$, 'Para testar uma ideia com contrapontos diretos antes de apresenta-la.', false, 160, ARRAY['Iniciante', 'Estratégia e Decisão', 'Liderança']::text[]),
        ('Grok', 'Brainstorm amplo e selecao rigorosa', $prompt$Faca um brainstorm sobre o desafio abaixo.

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

Para cada uma das 5 melhores, entregue um primeiro experimento que eu possa fazer em ate 48 horas.$prompt$, 'Para gerar muitas ideias e depois escolher as melhores com criterio.', true, 170, ARRAY['Iniciante', 'Produtividade', 'Comunicação e Redação']::text[]),
        ('Grok', 'Leitura critica de percepcao publica', $prompt$Analise a percepcao publica provavel sobre a mensagem, produto ou decisao abaixo.

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
5. versao alternativa mais clara e menos vulneravel a ma interpretacao.$prompt$, 'Para analisar percepcao publica, linguagem de audiencia e possiveis reacoes.', true, 180, ARRAY['Avancado', 'Comunicação e Redação', 'Estratégia e Decisão']::text[]),
        ('Manus', 'Delegar uma tarefa completa para um agente', $prompt$Quero delegar a tarefa abaixo para um agente de IA.

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

Depois, execute a primeira versao apenas se as informacoes forem suficientes.$prompt$, 'Para transformar um objetivo em briefing executavel, com etapas, entregaveis e verificacao.', false, 190, ARRAY['Iniciante', 'Automacao', 'Produtividade']::text[]),
        ('Manus', 'Pesquisa com planilha e relatorio', $prompt$Execute uma pesquisa estruturada sobre:
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

Registre a fonte de cada linha. Nao misture dados confirmados com inferencias.$prompt$, 'Para coletar informacoes, estruturar dados e entregar sintese executiva.', true, 200, ARRAY['Avancado', 'Automacao', 'Análise e Dados']::text[]),
        ('Manus', 'Auditoria de processo repetitivo', $prompt$Audite o processo repetitivo abaixo e proponha uma automacao.

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
6. primeiro teste pequeno para validar sem afetar usuarios.$prompt$, 'Para encontrar tarefas automatizaveis e propor fluxo de automacao seguro.', true, 210, ARRAY['Avancado', 'Automacao', 'Produtividade']::text[])
),
updated AS (
    UPDATE public.prompt_library target
    SET
        prompt_body = seed.prompt_body,
        use_case = seed.use_case,
        is_gated = seed.is_gated,
        sort_order = seed.sort_order,
        tags = seed.tags
    FROM seed
    WHERE target.ai_tool = seed.ai_tool
      AND target.title = seed.title
    RETURNING target.ai_tool, target.title
)
INSERT INTO public.prompt_library (ai_tool, title, prompt_body, use_case, is_gated, sort_order, tags)
SELECT seed.ai_tool, seed.title, seed.prompt_body, seed.use_case, seed.is_gated, seed.sort_order, seed.tags
FROM seed
WHERE NOT EXISTS (
    SELECT 1
    FROM updated
    WHERE updated.ai_tool = seed.ai_tool
      AND updated.title = seed.title
);
