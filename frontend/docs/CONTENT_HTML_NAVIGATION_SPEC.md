# Spec - Navegacao Entre Conteudos HTML

## 1.1 Contexto & Objetivo

O portal hoje exibe conteudos HTML por meio da rota `/view/[type]/[slug]`, renderizada em um `iframe` que consome o proxy `/api/proxy-html/[type]/[slug]`. Nessa experiencia, o usuario consegue abrir um conteudo especifico, mas nao consegue seguir linearmente para o item anterior ou proximo da mesma secao sem voltar para a listagem.

Esta spec define a adicao de navegacao contextual ao final da experiencia de leitura, com botoes minimalistas e consistentes com o design system do portal, sem modificar o HTML armazenado no Postgres Storage. A navegacao deve ser resolvida pelo shell da pagina `/view`, preservando o conteudo original dos arquivos `.html` e reduzindo risco de quebra visual ou estrutural.

O que resolve:
- Permite leitura sequencial entre materiais relacionados da mesma secao.
- Reduz friccao de navegacao para usuarios em consumo continuo.
- Mantem o conteudo HTML desacoplado da navegacao do portal.

Para quem:
- Usuarios da area publica e autenticada que leem newsletters, mini-livros, biblioteca, especiais, radar, estudar e introducoes de ebooks.

Por que agora:
- A rota `/view` ja centraliza a exibicao dos HTMLs e e o ponto mais seguro para adicionar navegacao sem alterar os arquivos hospedados.
- O portal ja possui regras editoriais de ordenacao por `index`, `order`, `tema` e `part_order`, que podem ser reutilizadas para a navegacao contextual.

Critérios de sucesso mensuráveis:
- Em conteudos com mais de um item navegavel no mesmo grupo, a pagina exibe pelo menos um botao de navegacao ao final.
- Em conteudos no inicio da sequencia, apenas o botao de proximo e exibido.
- Em conteudos no fim da sequencia, apenas o botao de anterior e exibido.
- Em conteudos sem vizinhos no mesmo grupo, nenhum botao e exibido.
- A navegacao respeita a ordenacao editorial vigente por tipo, com desempate deterministico.
- O HTML servido pelo proxy continua intacto, sem injecao de markup de navegacao no arquivo remoto.

## 1.2 Escopo

Esta incluso:
- Adicionar navegacao anterior/proximo na pagina `/view/[type]/[slug]`.
- Manter os botoes fora do HTML remoto, no shell da pagina Next.js.
- Exibir os botoes com estilo minimalista aderente ao design system atual.
- Calcular os vizinhos com base no conjunto correto por tipo.
- Restringir a navegacao apenas a itens que possuem HTML disponivel.
- Suportar os tipos `newsletter`, `mini-livro`, `biblioteca`, `especial-semana`, `radar_oportunidades`, `estudar` e `ebook`.
- Tratar `book` como sem navegacao, por ser singleton.

O que nao esta incluso:
- Alterar o conteudo interno dos arquivos HTML armazenados no Postgres.
- Criar ou modificar schema de banco, migrations ou colunas.
- Reordenar conteudos existentes no admin.
- Alterar regras editoriais de listagem publica fora da pagina `/view`.
- Adicionar breadcrumbs, indice lateral, autoplay de navegacao ou atalhos de teclado.
- Criar fluxo de navegacao entre tipos diferentes.

Edge cases identificados:
- Itens com `index` repetido devem usar desempate estavel por `id` ascendente.
- `biblioteca` deve navegar apenas entre itens do mesmo `tema`.
- `mini-livro` deve navegar apenas entre itens da mesma `part_order`.
- `ebook` nao usa `index`; a ordem deve seguir a coluna `order`, com desempate por `id` ascendente se necessario.
- Itens sem `htmlPath` valido nao devem entrar na sequencia navegavel.
- Se o `slug` da URL nao corresponder a nenhum item navegavel do grupo, a pagina deve manter o comportamento atual de erro ou ausencia de navegacao, sem fallback silencioso incorreto.
- Se houver apenas um item navegavel no grupo filtrado, nenhum botao deve ser exibido.

## 1.3 Stack & Restrições Técnicas

Tecnologias obrigatorias:
- Next.js App Router.
- React 19 com TypeScript strict.
- Tailwind CSS v4 e variaveis do design system em `app/globals.css`.
- Clean Architecture com separacao entre domain, application, infrastructure e presentation.
- Dependency Injection via `infrastructure/di/container.ts`.

Tecnologias ou abordagens proibidas neste escopo:
- Injetar os botoes diretamente no HTML remoto servido pelo proxy.
- Duplicar consultas e regras de ordenacao em componentes sem encapsulamento minimo.
- Criar dependencia de estado global para um problema restrito a pagina `/view`.

Padroes arquiteturais a seguir:
- SRP: a pagina `/view` deve orquestrar exibicao, enquanto a regra de descoberta de vizinhos deve ficar em unidade dedicada e testavel.
- DIP: consumo via interfaces/repositorios ja existentes no container, evitando acoplamento direto a detalhes do Postgres dentro da camada de apresentacao quando houver alternativa adequada.
- Adapter/Facade existentes devem ser respeitados, reaproveitando repositorios e entidades ja presentes.

Restricoes de performance:
- A resolucao da navegacao deve fazer somente leitura dos itens do tipo atual.
- A solucao nao deve alterar o fluxo de carregamento do `iframe` nem aumentar o risco de layout shift perceptivel.

Restricoes de seguranca:
- Nenhuma mudanca deve enfraquecer as validacoes do proxy HTML.
- Nenhum dado de navegacao deve permitir path traversal ou construir URLs externas arbitrarias.

Restricoes de compatibilidade:
- A pagina deve funcionar em desktop e mobile.
- A navegacao deve respeitar tema claro/escuro ja usado no shell da aplicacao.

## 1.4 Interface de Contrato

Contrato funcional esperado:

### Entrada principal

- Rota: `/view/[type]/[slug]`
- Parametros:
- `type`: tipo de conteudo suportado pela pagina de visualizacao.
- `slug`: identificador derivado do nome do arquivo HTML ou da estrutura de pasta do ebook.

### Saida esperada da pagina

- Renderizacao do `iframe` com o HTML atual.
- Renderizacao condicional de um bloco de navegacao no final da pagina contendo:
- zero botoes, quando nao houver vizinhos validos;
- um botao de anterior ou de proximo, quando houver apenas um vizinho;
- dois botoes, quando houver vizinho anterior e proximo.

### Estrutura de dados esperada para navegacao

Uma estrutura interna equivalente a:

```ts
type ViewNavigationType =
  | "newsletter"
  | "mini-livro"
  | "biblioteca"
  | "especial-semana"
  | "radar_oportunidades"
  | "estudar"
  | "ebook"
  | "book";

interface NavigationItem {
  id: number;
  title: string;
  url: string;
  slug: string;
  index?: number;
  order?: number;
  tema?: string | null;
  partOrder?: number | null;
}

interface NavigationContext {
  current: NavigationItem | null;
  previous: NavigationItem | null;
  next: NavigationItem | null;
}
```

Regras de agrupamento por tipo:
- `newsletter`: todos os itens HTML do tipo, ordenados por `index`, depois `id`.
- `especial-semana`: todos os itens HTML do tipo, ordenados por `index`, depois `id`.
- `radar_oportunidades`: todos os itens HTML do tipo, ordenados por `index`, depois `id`.
- `estudar`: todos os itens HTML do tipo, ordenados por `index`, depois `id`.
- `biblioteca`: apenas itens HTML com o mesmo `tema` do item atual, ordenados por `index`, depois `id`.
- `mini-livro`: todos os itens HTML do tipo, ordenados por `part_order`, depois `index`, depois `id`.
- `ebook`: todos os itens HTML do tipo, ordenados por `order`, depois `id`.
- `book`: sem contexto de navegacao; sempre retorna `previous = null` e `next = null`.

Comportamento em erro:
- `type` invalido: manter comportamento atual de `notFound` ou resposta equivalente, sem renderizar navegacao.
- `slug` sem correspondencia ao item atual: nao inferir vizinhos por aproximacao; retornar ausencia de navegacao e preservar o comportamento atual da pagina.
- Falha ao buscar lista do tipo: nao quebrar a renderizacao do `iframe`; omitir o bloco de navegacao.
- Dados inconsistentes, como item sem URL navegavel: excluir o item da sequencia e seguir com os demais validos.

## 1.5 Critérios de Aceitação

- Dado um conteudo `newsletter` com tres itens HTML ordenados por `index`, quando o usuario abrir o item do meio, entao a pagina deve exibir os botoes de anterior e proximo apontando para os vizinhos corretos.
- Dado um conteudo no inicio da sequencia do seu grupo, quando a pagina for carregada, entao apenas o botao de proximo deve aparecer.
- Dado um conteudo no fim da sequencia do seu grupo, quando a pagina for carregada, entao apenas o botao de anterior deve aparecer.
- Dado um grupo com apenas um item HTML navegavel, quando a pagina for carregada, entao nenhum botao de navegacao deve ser exibido.
- Dado dois ou mais itens com o mesmo `index`, quando a sequencia for calculada, entao o desempate deve seguir `id` ascendente de forma deterministica.
- Dado um item da `biblioteca`, quando a navegacao for calculada, entao somente itens com o mesmo `tema` podem ser considerados anterior ou proximo.
- Dado um `mini-livro`, quando a navegacao chegar ao fim de uma `part_order`, entao o proximo item deve continuar na `part_order` seguinte, respeitando `part_order`, `index` e `id`.
- Dado um `ebook`, quando a navegacao for calculada, entao a sequencia deve seguir a coluna `order`, nao `index`.
- Dado um item sem vizinho anterior ou proximo, quando a navegacao for resolvida, entao nenhum link invalido, quebrado ou placeholder deve ser renderizado.
- Dado que o HTML remoto possua estrutura ou estilos proprios, quando a navegacao for exibida, entao o conteudo do `iframe` deve permanecer inalterado.
- Dado falha na leitura dos dados de navegacao, quando a pagina ainda conseguir montar o `iframe`, entao o conteudo principal deve continuar acessivel sem erro fatal.

O que constitui "pronto":
- A spec esta aprovada.
- A implementacao futura respeita o shell da pagina `/view` como ponto de extensao.
- A regra de sequenciamento por tipo esta explicitamente definida e testavel.
- A navegacao nao altera o HTML remoto nem introduz regressao visual evidente na pagina de leitura.

## 2.1 Arquitetura de Alto Nível

Diagrama textual:

```text
URL /view/[type]/[slug]
        |
        v
app/view/[type]/[slug]/page.tsx  (Server Component)
        |
        |-- resolve metadata atual
        |-- chama GetContentViewNavigationUseCase
        |        |
        |        v
        |   IContentRepository (via DIContainer)
        |        |
        |        v
        |   PostgresContentRepository.getAll(type)
        |
        |-- monta htmlPath -> /api/proxy-html/[type]/[slug]
        |
        +--> ViewIframe (Client Component)
        |        |
        |        v
        |   iframe same-origin com altura sincronizada ao conteudo
        |
        +--> ViewContentNavigation (UI Component)
                 |
                 v
            Links anterior / proximo
```

Fluxo de dados:
- A rota `/view/[type]/[slug]` continua sendo o ponto unico de exibicao do HTML.
- A page server-side resolve os vizinhos do item atual antes da renderizacao da pagina.
- O `iframe` continua carregando o HTML via proxy interno, mas deixa de ser apenas um viewport fixo quando necessario para permitir que o fim da leitura revele a navegacao externa.
- O bloco de navegacao recebe apenas dados prontos para UI: `previous`, `current`, `next`.

Decisões de design com justificativa:
- Escolhi manter a navegacao fora do HTML remoto porque isso preserva integralmente os arquivos armazenados e reduz o risco de quebrar estilos, scripts ou estrutura dos materiais.
- Escolhi centralizar a regra de descoberta de vizinhos em um use case dedicado porque a ordenacao por tipo, filtro por `tema` e filtro por `part_order` e regra de negocio, nao de layout.
- Escolhi reutilizar `PostgresContentRepository` para os tipos navegaveis porque ele ja agrega os campos necessarios (`id`, `htmlPath`, `index`, `tema`, `partOrder`, `ebookOrder`) e evita duplicacao de consultas entre multiplos repositorios especificos.
- Escolhi tratar `book` como excecao explicita na borda da pagina porque ele e singleton e nao precisa contaminar a regra geral com ramificacoes desnecessarias.
- Escolhi ajustar o comportamento do `iframe` para permitir que o usuario alcance a navegacao no fim da leitura, porque botoes fora do HTML remoto nao seriam descobriveis se o scroll permanecesse preso ao interior de um `iframe` de altura fixa.

## 2.2 Tasks Ordenadas

[ ] Task 1 - Criar o caso de uso de navegacao por conteudo
Objetivo: encapsular a resolucao de `current`, `previous` e `next` a partir de `type` e `slug`, com regras especificas por tabela e desempate deterministico.
Arquivos afetados: `frontend/application/usecases/GetContentViewNavigationUseCase.ts`, `frontend/application/index.ts`, `frontend/infrastructure/di/container.ts`, `frontend/__tests__/application/GetContentViewNavigationUseCase.test.ts`
Depende de: nenhuma
Teste de verificação: executar os testes unitarios do use case cobrindo `newsletter`, `biblioteca`, `mini-livro`, `ebook`, empate por `index`, caso sem vizinhos e caso sem correspondencia de `slug`.

[ ] Task 2 - Adaptar o shell de `/view` para suportar navegacao ao final da leitura
Objetivo: mudar a composicao da pagina `/view/[type]/[slug]` para renderizar `iframe` e bloco de navegacao no mesmo fluxo visual, mantendo o HTML remoto intacto.
Arquivos afetados: `frontend/app/view/[type]/[slug]/page.tsx`, `frontend/components/ViewIframe.tsx`
Depende de: Task 1
Teste de verificação: abrir manualmente uma pagina `/view/...` e confirmar que o conteudo continua carregando normalmente e que a pagina do portal consegue revelar a area abaixo do conteudo.

[ ] Task 3 - Implementar o componente visual de anterior/proximo
Objetivo: criar a UI minimalista dos botoes, responsiva e aderente ao design system, exibida de forma condicional conforme o contexto retornado pelo use case.
Arquivos afetados: `frontend/components/ViewContentNavigation.tsx`, `frontend/app/view/[type]/[slug]/page.tsx`, opcionalmente `frontend/__tests__/components/ViewContentNavigation.test.tsx`
Depende de: Task 2
Teste de verificação: validar manualmente os quatro cenarios visuais principais: item unico, primeiro item, item intermediario e ultimo item, em desktop e mobile.

[ ] Task 4 - Cobrir integracao minima e regressao da experiencia de leitura
Objetivo: garantir que a navegacao nao introduza regressao funcional no shell da visualizacao e que falhas na resolucao dos vizinhos nao derrubem o conteudo principal.
Arquivos afetados: `frontend/__tests__/components/ViewIframe.test.tsx`, `frontend/__tests__/components/ViewContentNavigation.test.tsx`, ou ajuste equivalente no pacote de testes existente
Depende de: Task 3
Teste de verificação: rodar `pnpm test` ou escopo equivalente com foco nos novos testes e validar que a renderizacao do `iframe` continua ocorrendo mesmo sem contexto de navegacao.

## 2.3 Pontos de Atenção

Onde a implementacao pode falhar:
- O `iframe` hoje ocupa a altura total da viewport; se a estrategia de altura nao for ajustada corretamente, os botoes podem existir mas continuar inalcançaveis para o usuario.
- A extracao de `slug` precisa respeitar dois formatos distintos: arquivo simples `.../slug.html` e ebook com pasta `.../ebook/{slug}/introducao_{slug}.html`.
- Se a ordenacao for recalculada de forma divergente da regra aprovada, a navegacao pode apontar para itens inconsistentes com a expectativa editorial.
- `biblioteca` e `mini-livro` exigem filtro contextual antes de calcular vizinhos; aplicar a ordenacao antes do filtro pode gerar navegacao incorreta.
- Registros legados com `index = 0` podem exigir cuidado extra, pois o comportamento atual do portal ja possui tratamento especial para esse caso nos repositorios.

O que precisa de review humano obrigatório:
- Aparencia final dos botoes em tema claro e escuro.
- Espacamento e respiracao visual da area de navegacao ao final da leitura.
- Experiencia mobile, especialmente quando o conteudo HTML tiver largura ou altura muito grandes.

Débito técnico consciente:
- Se a sincronizacao de altura do `iframe` depender de observacao do `document` interno, pode ser necessario refinamento posterior para materiais com scripts que alterem o DOM apos o carregamento inicial.
- A regra de navegacao ficara baseada no `slug` derivado de `htmlPath`; se no futuro surgirem novos formatos de armazenamento, a extracao precisara ser expandida de forma centralizada.
