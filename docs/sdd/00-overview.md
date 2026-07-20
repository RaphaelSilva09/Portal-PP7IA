# SDD — Plano de execução PP7+IAS (julho/2026)

Specs derivados de `PP7IAS.pdf` (PP7IAS-260630-0942-C-V01) cruzados com o gap analysis de `PP7IAS-STATUS.md`. Cada spec segue o formato: **Requisito** (referência do PDF) → **Critérios de aceite** → **Design técnico** → **Fora de escopo**.

## Ordem de execução

| Tarefa | Spec | Requisito PDF | Esforço |
|---|---|---|---|
| T1 | [01-fontes-newsletter.md](01-fontes-newsletter.md) | 3.2.4 + Anexo | Pequeno |
| T2 | [02-cadencia-newsletter.md](02-cadencia-newsletter.md) | 3.2.1 | Pequeno |
| T3 | [03-tempo-de-leitura.md](03-tempo-de-leitura.md) | 5.3 | Pequeno |
| T4 | [04-tema-sepia.md](04-tema-sepia.md) | 5.1 | Médio |
| T5 | [05-controles-tipografia.md](05-controles-tipografia.md) | 5.2 | Médio |
| T6 | [06-continue-leitura.md](06-continue-leitura.md) | 5.4 | Médio |
| T7 | [07-alerta-atualizacao.md](07-alerta-atualizacao.md) | 5.5 | Médio (pode bloquear) |
| T8 | [08-carrossel-home.md](08-carrossel-home.md) | 3.7.2 | Médio |
| T9 | [09-digest-semanal.md](09-digest-semanal.md) | 3.5.1 / 3.8.4 | Médio |

## Itens do PDF já concluídos (sem tarefa)

- 3.1 Reestruturação das seções — feito (commit `969ee5c`).
- 3.4.2 Botão claro/escuro — feito (`ThemeToggle.tsx`).
- 3.6 Colaboradores — feito (`constants/team.ts`), pendente apenas dado de contato do Cristiano (3.7.3, depende de terceiro).

## Fora de escopo global

- **3.2.5 (agente da Luiza)** — pipeline externo de curadoria por IA que entrega rascunho por e-mail; não pertence a este repositório (é ferramenta/automação operada pela Luiza). T9 cobre apenas o aviso semanal de quarta (3.5.1).
- **3.1.5 (migração de conteúdo antigo)** — trabalho editorial manual do Davi, não codificável.
- **Persistência de preferências no perfil (5.2)** — exige migração de banco; adiada (ver spec T5). v1 usa `localStorage`.
- **Item 6 da lista do Davi** — conteúdo desconhecido (lista não está no repo; ver PP7IAS-STATUS.md §3.7.1).

## Regras de execução (AGENTS.md)

- Verificação após cada tarefa: `pnpm test` (ou subset relevante) + `pnpm lint` em `frontend/`.
- Sem dependências novas.
- Sem migrações de banco sem aprovação explícita.
- Sem commits/pushes automáticos.
