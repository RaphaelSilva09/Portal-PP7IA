# T6 — "Continue de onde parou" (Enquanto é Tempo)

## Requisito (PDF 5.4)

"Para o livro 'Enquanto é Tempo', um botão que leva o leitor automaticamente ao último capítulo acessado."

## Critérios de aceite

1. Ao abrir qualquer conteúdo do universo do livro (`/view/book/*`, `/view/mini-livro/*`, `/view/ebook/*`, `/view/mini-livro-section/*`), a visita é registrada localmente (URL + título + timestamp).
2. O card do livro na home exibe "Continuar de onde parou" apontando para o último item acessado, quando existir registro.
3. Sem registro, o card mantém o comportamento atual (CTA "Ler").
4. Testes unitários do helper de progresso; `pnpm test` e `pnpm lint` passam.

## Design técnico

- Novo helper `frontend/lib/bookProgress.ts`: `saveBookProgress({ href, title, type })` / `loadBookProgress()` sobre `localStorage` (chave `pp7ias.book-progress`), com validação de shape ao ler.
- Registro: componente client mínimo (`BookProgressTracker`) montado pelo `ViewContentFrame` quando `type` pertence ao conjunto do livro — grava no mount. `ViewPage` passa o `type` adiante.
- Exibição: componente client `ContinueReadingLink` no card do livro da home (`app/page.tsx`), lê o progresso no mount (evita mismatch de hidratação) e renderiza o link quando há registro.
- Persistência local por dispositivo; racional idêntico ao T5 (perfil = migração, v2).

## Fora de escopo

- Sincronização entre dispositivos/perfil (v2, junto com a migração de preferências do T5).
- Posição de rolagem dentro do capítulo (v1 = capítulo/seção, não offset).
