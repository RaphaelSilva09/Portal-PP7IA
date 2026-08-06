# Status PP7+IAS — Requisitos do plano de julho vs. repositório

> Baseado em `PP7IAS.pdf` (PP7IAS-260630-0942-C-V01) e na análise do código em `develop` nesta data (2026-07-07).
> Legenda: ✅ feito · 🟡 parcial · ❌ não iniciado · ℹ️ nota/observação
>
> **Atualização 2026-07-07**: as lacunas viáveis foram implementadas via SDD (specs em `docs/sdd/`).
> A tabela abaixo reflete o estado **após** essa rodada; o texto detalhado das seções seguintes descreve o estado **anterior** (mantido como registro da análise).

---

## Resumo executivo (atualizado pós-execução SDD)

| # | Item (prioridade do doc) | Status |
|---|---|---|
| 3.1 | Reestruturar blocos 2/3 → seções "Inteligência Artificial" e "Editoriais e Artigos" | ✅ Feito (já existia) |
| 3.2 | Cadência da newsletter (7 notícias, 2x/semana) + curadoria pró-Brasil | 🟡 Copy e orientação do admin atualizadas para 2x/semana; estrutura de "7 itens" segue não validada; agente de curadoria da Luiza é externo |
| 3.3 | Limite de 3–4 artigos por publicação editorial | 🟡 Diretriz editorial no admin (sem validação programática — publicação é HTML único) |
| 3.4 | Otimização mobile (iPhone) + botão claro/escuro | 🟡 Tema ✅ (agora com 3 modos), legibilidade mobile dedicada segue pendente |
| 3.5 | E-mail semanal de quarta (Raphael) + publicação diária | ✅ Rota `/api/cron/weekly-digest` + cron Vercel de quarta (requer `CRON_SECRET` e `WEEKLY_DIGEST_RECIPIENTS` em produção) |
| 3.6 | Incluir Gustavo Colombini, Sabrina Ai Kato, Cristiano como colaboradores | ✅ Feito (dados de contato do Cristiano ainda pendentes — 3.7.3) |
| 3.7.2 | Carrossel na home (livro, guia, newsletters, itens fixos) | ✅ `HomeCarousel` (scroll-snap, 6 itens, sem dependência nova) |
| 5.1 | Fundo amarelado/sépia para leitura | ✅ Tema "sépia" no ciclo claro → sépia → escuro |
| 5.2 | Controles de tipografia (tamanho, peso, espaçamento) salvos no perfil | 🟡 Implementado nas páginas de leitura com persistência em localStorage; perfil = v2 (exige migração) |
| 5.3 | Indicador de tempo de leitura por contagem de palavras | 🟡 `readTime` agora visível ao leitor nos cards; valor segue manual (contagem automática = melhoria futura no upload) |
| 5.4 | "Continue de onde parou" no mini-livro | ✅ Registro local do último capítulo + link no card do livro na home |
| 5.5 | Alerta de atualização em conteúdo já lido | ✅ Badge "Atualizado" nos cards + fix de `updated_at` no update de conteúdo |
| Anexo | Lista de 50–70 fontes para newsletter | ✅ `docs/newsletter/FONTES.md` (70 fontes, pendências de confirmação marcadas) |

---

## 1. Organização e equipe (seção 2 do PDF)

Itens organizacionais (papéis de Lucas, Luiza, Davi, Raphael, Cristiano) não são código — não há o que auditar no repositório. Ficam registrados aqui só como contexto: Davi segue com prioridade em frontend/design; Raphael segue coordenando a parte técnica.

---

## 2. Reestruturação das seções (3.1) — ✅ Feito

Ao contrário da premissa do documento ("blocos 2 e 3 hoje sem conteúdo"), o código já tem as duas seções novas totalmente implementadas, com tipo de conteúdo próprio, entidade de domínio, repositório e CRUD no admin:

- **Inteligência Artificial** (slug `especial-semana`) — `frontend/domain/entities/EspecialSemana.ts`, rota `/especial-semana` → redireciona para `/explorar?b=inteligencia-artificial`.
- **Editoriais e Artigos** (slug `radar_oportunidades`) — `frontend/domain/entities/RadarOportunidades.ts`, rota `/radar-oportunidades` → `/explorar?b=editoriais-artigos`.
- Configuração central dos 7 blocos: `frontend/constants/homeBlocks.ts` e `frontend/constants/sections.ts`.
- Commit relevante: `969ee5c feat: reestrutura secoes editoriais do portal` (28/06).

**O único bloco realmente vazio/placeholder é o 7º ("Ensinar")** — não mencionado no PDF — com `defaultDescription: "A ser implementado"` e link âncora (`#newsletter`) sem rota própria.

**Pendência real**: migrar conteúdo antigo pertinente para as novas seções (item 3.1.5, "o Davi vai migrando conteúdos já existentes") — isso é trabalho editorial/de conteúdo, não dá para confirmar via grep; perguntar ao Davi o status.

---

## 3. Newsletter (3.2) — 🟡 Parcial

O que existe:
- Entidade `frontend/domain/entities/Newsletter.ts`, repositório `PostgresNewsletterRepository.ts`, tabela `public.newsletters`.
- CRUD via admin (`ContentForm.tsx`) — cada edição é **um título + um arquivo HTML + um PDF**, igual a todos os outros tipos de conteúdo.
- Existe um texto de orientação mostrado ao admin ao criar: *"publique 7 notícias curtas por semana, com link para aprofundamento e prioridade para o que importa ao Brasil"* — mas isso é só um texto de ajuda, **nada valida quantidade, tamanho de linha ou formato**.

O que falta:
- **Cadência 2x/semana**: hoje a cópia do site diz *"Publicação semanal com 7 itens"* / *"toda quarta"* (`frontend/app/page.tsx:186`, `homeBlocks.ts:20`) — é 1x/semana, não a segunda (7 IAs) + quarta (startups) pedida no novo plano.
- **Lista de fontes** (50–70, curadoria, consulta aleatória semanal) — não existe em lugar nenhum do repo (nem `docs/`, nem `frontend/data/`, nem tabela no banco). O anexo do PDF é a primeira entrega dessa lista — precisa ser persistido em algum lugar (arquivo em `docs/` ou tabela) para a Luiza manter.
- **Automação (agente da Luiza)**: não existe nenhum script, cron, GitHub Action ou função serverless dedicada que gere rascunho de newsletter e entregue por e-mail às quartas/sextas. Os únicos scripts em `frontend/scripts/` são do RAG/chat (`ingest-rag.ts`, `generate-meta-chunks.ts` etc.), sem relação.
- Limite de 4–5 linhas por notícia: não há validação de tamanho de texto em nenhuma camada.

---

## 4. Artigos e editoriais (3.3) — 🟡 Parcial

Mesma estrutura genérica de conteúdo (`RadarOportunidades`), sem agrupamento de "publicação" nem contagem de itens. Existe apenas texto de orientação ao admin (*"mantenha editoriais e artigos curtos... 3 a 4 textos por publicação"*) em `ContentForm.tsx`, sem nenhuma validação de limite no código. Ou seja, o limite de 3-4 artigos é hoje uma diretriz editorial, não uma regra do sistema — cumprimento depende de quem publica.

---

## 5. Experiência mobile e tema (3.4)

- **Botão claro/escuro (3.4.2)** — ✅ Feito. `frontend/components/ThemeToggle.tsx` usa `next-themes`, integrado no `Header.tsx` (desktop e mobile), com dois temas registrados (`light`/`dark`) e persistência automática.
- **Legibilidade mobile/iPhone (3.4.1)** — 🟡 Parcial. Há suporte a safe-area do iOS (`.safe-area-top` em `globals.css`) e um breakpoint de nav customizado (1108px), além de testes E2E rodando em perfil "iPhone 13" (`playwright.config.ts`, script `pnpm test:e2e:mobile`) — mas esses testes cobrem fluxo de auth/menu, não legibilidade de leitura. Não há trabalho dedicado de tipografia/espaçamento para mobile além das classes responsivas padrão do Tailwind.

---

## 6. Publicação e automação de e-mail (3.5)

- **3.5.2 (publicar diariamente, não esperar quarta)** — ✅ Já é assim hoje por natureza: o CRUD de conteúdo permite publicar a qualquer momento (não há processo em lote nem trava semanal). Nenhuma mudança de código necessária aqui, é mais um combinado de processo com a equipe.
- **3.5.1 (e-mail semanal de quarta, responsável Raphael)** — ❌ Não automatizado. O Resend (`frontend/lib/email/resend.ts`) hoje só é usado para convites, recuperação de senha e verificação de e-mail (confirmado em `AGENTS.md`: *"Resend (invite emails)"*). Não há cron configurado (`frontend/vercel.json` só tem build/dev/install; não há `.github/workflows` nem função dedicada). Esse aviso semanal, se está saindo, está sendo feito manualmente pelo Raphael fora do sistema.

---

## 7. Colaboradores (3.6) — ✅ Feito (quase)

`frontend/constants/team.ts` já lista Gustavo Colombini e Sabrina Ai Kato ("Artes da página") e Cristiano Benite ("Apoio técnico e revisão"), renderizados em `/quem-somos` (`frontend/app/quem-somos/page.tsx`) como grid de cards com papel + nome + descrição.

**Pendência (3.7.3)**: os dados de contato do Cristiano (e-mail/telefone) ainda não estão confirmados no PDF — e mesmo quando confirmados, hoje o site só expõe nome/papel/descrição publicamente, não e-mail/telefone (o que é razoável; e-mail e telefone de Gustavo e Sabrina no PDF parecem ser só para uso interno da equipe, não para exibição pública — vale confirmar essa intenção antes de decidir se isso vira campo no site).

ℹ️ Nota: existem dois componentes órfãos (`frontend/components/Equipe.tsx` e `QuemSomosEquipe.tsx`) com listas de nomes hardcoded, não importados em nenhum lugar do app — código morto de uma iteração de design anterior. Não confundir com o padrão vivo (`constants/team.ts`); candidato a limpeza futura.

---

## 8. Pendências gerais (3.7)

- **3.7.1 (lista de sugestões, "a maior é a do Davi")** — ❌ Essa lista não existe dentro deste repositório (verificado `docs/`, `AGENTS.md`, `README.md`, todo o índice de documentação). É externa (Notion/doc/WhatsApp) ou ainda não foi formalizada em nenhum lugar rastreável — vale pedir ao Davi para linkar/colar aqui se quiser que fique versionada com o código.
- **3.7.2 (carrossel na home)** — ❌ Não iniciado. Não existe nenhuma biblioteca de carrossel instalada (`embla`, `swiper`, `keen-slider` — nenhuma) nem componente próprio. A home hoje (`frontend/app/page.tsx`) é um hero estático com dois cards laterais (livro + newsletter) e uma seção de lista ("Cada cor é um caminho"), sem nada rotativo.
- **3.7.3 (dados do Cristiano)** — ver seção 7 acima.

ℹ️ Nota lateral (achado incidental, não pedido): `docs/README.md` referencia `docs/00-GETTING-STARTED.md`, que não existe no repo — link quebrado na documentação.

---

## 9. Prioridades do Davi (seção 5 do PDF)

| Item | Descrição | Status | Onde olhar |
|---|---|---|---|
| 5.1 | Fundo amarelado/sépia para reduzir fadiga visual | ❌ Não iniciado | Existe `frontend/domain/entities/SiteBg.ts`, mas é uma paleta de cores **global controlada pelo admin** (light/dark do site todo), não um modo de leitura sépia por usuário — não atende ao requisito como está. |
| 5.2 | Controles de tipografia (tamanho, peso, espaçamento), salvos no perfil | ❌ Não iniciado | `User.ts` não tem nenhum campo de preferência; nenhuma UI de ajuste de fonte encontrada. |
| 5.3 | Indicador de tempo de leitura (contagem de palavras) | 🟡 Parcial | Campo `readTime` existe em **todas** as entidades de conteúdo (Newsletter, RadarOportunidades, EspecialSemana, MiniLivro, Estudar, BibliotecaItem, Ebook), mas é **digitado manualmente pelo admin** (não calculado por contagem de palavras) e **só aparece no painel admin** (`ContentTable.tsx`, `SortableContentTable.tsx`) — nunca é exibido ao leitor final antes de abrir um conteúdo. Único texto visível hoje é um valor estático ("Tempo de leitura entre 7 e 21 min") em `BentoGridIAS.tsx`, não dinâmico por item. |
| 5.4 | "Continue de onde parou" (livro "Enquanto é Tempo") | ❌ Não iniciado | Nenhum campo de progresso de leitura por usuário em nenhuma migração/tabela. O contador "X de Y capítulos" na home é uma contagem global de capítulos publicados, não posição de leitura do usuário. |
| 5.5 | Alerta de atualização em conteúdo já lido | ❌ Não iniciado | Nenhum mecanismo de "já lido"/"atualizado desde a última leitura" encontrado. |
| 6 | "Item 6 inteiro da lista do Davi" | ❓ Desconhecido | O PDF não detalha o conteúdo do item 6 — só referencia que foi aprovado. Não há como confirmar/mapear sem o texto original da lista do Davi (ver 3.7.1). |

---

## 10. Anexo — Lista de 70 fontes da newsletter (seção 6 do PDF)

❌ Ainda não persistida em nenhum lugar do repositório. Recomendação: criar `docs/newsletter-fontes.md` (ou uma tabela no banco, se a Luiza for mantê-la por um painel) com as 70 fontes do anexo, marcando as que vieram da lista original do PP e as que precisam de confirmação de canal (`[lista PP] busca p/ confirmar` — itens 20, 35, 43, 44, 70).

---

## 11. Observações fora do escopo do PDF (achados durante a análise)

- Há um volume grande e recente de trabalho em um **chat com RAG** (busca semântica sobre o conteúdo do portal, citações inline, multi-fonte) — não mencionado no PDF, mas representa boa parte dos commits mais recentes (`feat(rag-chat)`, `feat(rag)`...). Vale alinhar se isso deve continuar sendo prioridade em julho junto com os itens do plano.
- A pasta `estudar/` na raiz do repositório (fora de `frontend/`) parece ser um projeto separado (gerado via Lovable/Vite) ligado à seção "Estudar" do portal, mas hoje só contém `.env` e `node_modules` no disco — sem código-fonte. Vale confirmar com quem está cuidando dela se é um projeto ainda em andamento em outro lugar ou se os arquivos foram removidos por engano.

---

## Sugestão de próximos passos (cruzando priorização do PDF com o estado real)

1. **Ajustar cadência da newsletter** (copy + processo) para 2x/semana conforme 3.2.1 — trabalho pequeno de conteúdo/copy, já que a infra de publicação existe.
2. **Persistir a lista de 70 fontes** em `docs/` para a Luiza manter (rápido, desbloqueia a curadoria).
3. **Expôr `readTime` no front-end público** (já existe o dado, falta só renderizar nos cards/páginas de conteúdo) — ganho rápido para 5.3.
4. **Automação de e-mail** (newsletter da Luiza + aviso semanal do Raphael) — maior esforço técnico (precisa de cron/Edge Function + Resend), tratar como item médio conforme o próprio PDF já sugere (3.8.4).
5. Itens de leitura do Davi (5.1 sépia, 5.2 tipografia, 5.4 continuar de onde parou, 5.5 alerta de atualização) e o **carrossel da home** (3.7.2) são as maiores lacunas de produto — nenhum tem qualquer implementação hoje. Recomendo pedir ao Davi para priorizar entre eles, já que a lista completa dele (item 6) não está disponível neste repositório.
