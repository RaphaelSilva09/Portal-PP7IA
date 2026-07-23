# T1 — Lista de fontes da newsletter

## Requisito (PDF 3.2.4 + Anexo)

Criar e consultar a lista de fontes, atualizando de tempos em tempos e mantendo-a num anexo. Mínimo de 50 fontes fixas; o PDF entrega 70 no anexo. A Luiza complementa e mantém a lista atualizada.

## Critérios de aceite

1. Existe `docs/newsletter/FONTES.md` com as 70 fontes do anexo, numeradas, com links clicáveis.
2. As seções A–F do anexo são preservadas (Fontes oficiais, Newsletters globais, Mídia tech, Startups & Venture, Brasil, Criadores LinkedIn).
3. As marcações `[lista PP]` e as notas "busca p/ confirmar" são preservadas para a Luiza saber o que confirmar (itens 20, 35, 43, 44, 49, 70).
4. As observações de curadoria (priorização A/B para segunda, D/E para quarta, peso pró-Brasil na seção E) constam no documento.
5. Documento referenciado a partir de `docs/README.md`.

## Design técnico

Documento Markdown estático em `docs/newsletter/FONTES.md`. Sem código. A manutenção é da Luiza via PR. Uma tabela no banco só se justificaria se houver painel de curadoria — não pedido.

## Fora de escopo

- UI de gestão de fontes no painel admin.
- Automação de consulta às fontes (pertence ao agente da Luiza, 3.2.5, fora do repo).
