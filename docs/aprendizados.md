# Aprendizados

Índice vivo de correções do usuário e erros identificados pelo próprio Claude. Uma linha por
item, mais recente no topo. Se o motivo de um item precisar de mais espaço que uma linha, criar
um arquivo em `docs/aprendizados/` e linkar daqui, este índice deve ficar sempre curto o
suficiente para ser lido de uma vez.

Formato de cada linha:
`- AAAA-MM-DD · [tipo: correção-usuário | erro-detectado] · resumo em uma frase · o que muda daqui pra frente`

Quando um item se repete pela segunda vez, ele vira regra em `CLAUDE.md`/`AGENTS.md` ou em
`.claude/rules/`, e some deste índice (a regra formal substitui o registro solto).

---

<!-- As pipelines /pipeline-rapido e /pipeline-validado adicionam entradas aqui automaticamente
     quando aplicável. Não apagar este comentário; ele documenta o formato para humanos que
     abrirem o arquivo direto. -->

- 2026-08-28 · erro-detectado · componente `AccessibilityPreferencesSync` gateava a sincronização inicial só por um ref "já sincronizei este id de usuário", sem resetar no logout, então relogin do mesmo usuário sem reload de página pulava a resincronização · ao usar um ref de "já feito" para gatear side-effect ligado a auth, resetar explicitamente quando o estado vira deslogado, não só quando o id muda.
- 2026-08-28 · erro-detectado · aplicar por cima do estado local editável um valor assíncrono vindo do servidor, sem checar se houve edição local na janela entre o disparo do fetch e a resposta, perdia silenciosamente a escolha do usuário · ao sincronizar estado editável com servidor, rastrear edição local concorrente durante a janela assíncrona e priorizá-la sobre o valor remoto quando ela existir.
- 2026-08-30 · erro-detectado · implementei checagem de acesso a conteúdo só em `/api/proxy-html`, assumindo (como o próprio plano dizia) que era "o único lugar que serve o HTML" — mas `/api/files/[...path]` serve o mesmo arquivo físico sem checagem nenhuma, contornando todo o bloqueio; achado pelo revisor-critico, não por mim · antes de tratar uma rota como "o único ponto de verdade" de um recurso servido por arquivo, procurar por outras rotas genéricas de arquivo estático que possam alcançar o mesmo caminho no disco.
- 2026-08-30 · erro-detectado · `GetContentAccessRulesForListingUseCase` (selo de bloqueio nas listagens) mostrava a regra pra qualquer um baseado só em "existe regra pra este slug", sem considerar quem estava pedindo — leitor logado via card de "exige login" como se fosse anônimo, porque o enriquecimento da listagem nunca chamava `getUser()`; achado pelo usuário testando, não pela minha própria revisão nem pela do revisor-critico anterior · ao construir um sinal de "isso está bloqueado" pra exibição, sempre avaliar contra quem está vendo (`strategy.evaluate`), não só a existência da regra — reservar a visão "regra existe, independente de quem vê" só pra telas de gerenciamento (admin), nunca pra listagem voltada ao leitor.
