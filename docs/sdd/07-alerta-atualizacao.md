# T7 — Alerta de atualização em conteúdo já lido

## Requisito (PDF 5.5)

"Quando um artigo já acessado é modificado ou ganha uma perspectiva nova, uma marcação discreta indica que houve alteração desde a última leitura."

## Viabilidade confirmada (sem migração)

- Todas as tabelas de conteúdo (`newsletters`, `especial_semana`, `radar_oportunidades`, `mini_livros`, `biblioteca`, `estudar`, `ebooks`) têm coluna `updated_at DEFAULT now()`.
- Porém **apenas `newsletters` tem trigger** de auto-atualização (`trg_newsletters_updated_at`). Para os demais tipos, `updated_at` não muda em UPDATE hoje.
- Correção app-level (sem migração): `SupabaseContentRepository.update()` passa a incluir `updated_at = NOW()` no SET — cobre todos os tipos daqui em diante.

## Critérios de aceite

1. `SupabaseContentRepository.update()` seta `updated_at = NOW()` em todo update de conteúdo.
2. Entidades de conteúdo listadas no explorar expõem `updatedAt` (props + getter), fluindo do banco até o card.
3. Abrir um conteúdo em `/view/...` registra a visita localmente (mapa `pathname → timestamp`).
4. Card no explorar exibe marcação discreta ("Atualizado") quando `updatedAt` do item > timestamp da última visita registrada.
5. Sem visita registrada, nenhuma marcação (conteúdo nunca lido não é "atualizado desde a última leitura").
6. Testes do helper de visitas; `pnpm test` e `pnpm lint` passam.

## Design técnico

- **Registro de visita**: reutiliza o tracker client do T6 (`ViewContentFrame`), gravando também em `pp7ias.seen-content` (`Record<pathname, iso>`), para qualquer tipo de conteúdo. Helper `frontend/lib/seenContent.ts` com `markSeen(pathname)` / `getSeenAt(pathname)`.
- **updatedAt nas entidades**: adicionar `updatedAt: Date | null` aos props de `Newsletter`, `EspecialSemana`, `RadarOportunidades`, `MiniLivro`, `BibliotecaItem`, `Estudar` + mapeamento `updated_at` nos respectivos repositórios de leitura. A serialização da API (`props` → JSON) e a rehidratação nos hooks propagam automaticamente (rehidratar `updatedAt` como `Date`).
- **Badge**: em `ItemCard`/`FeaturedCard` (blocks.tsx), componente client pequeno que compara `updatedAt` vs `getSeenAt(hrefPathname)` e renderiza um dot/label discreto.

## Limitações declaradas

- Sinal por dispositivo (localStorage), coerente com T5/T6; v2 = perfil.
- Para tipos sem trigger, alterações feitas **antes** desta task não marcam `updated_at` corretamente — o sinal vale para edições a partir do deploy.
- Trigger de banco para os demais tipos seria mais robusto, mas exige migração (aprovação explícita) — proposto como follow-up.

## Fora de escopo

- Distinção entre "modificado" e "ganhou perspectiva nova" (um único sinal de atualização).
- Notificação ativa (e-mail/push).
