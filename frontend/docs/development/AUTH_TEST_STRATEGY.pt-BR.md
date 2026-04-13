# Estrategia de Testes de Autenticacao

## Objetivo

Cobrir o fluxo de autenticacao em camadas, com prioridade para confiabilidade e reproducibilidade:

- cadastro
- login
- confirmacao de email
- bootstrap de sessao
- refresh de token
- logout
- sessoes antigas, incompletas ou invalidas

## Camadas recomendadas

### 1. Vitest - unidade e integracao deterministica

Usar Vitest para a maior parte da matriz de auth porque:

- roda rapido
- e deterministico
- permite simular estados raros do Supabase
- cobre melhor corridas e falhas que sao dificeis de reproduzir manualmente

Cobertura prioritaria nesta camada:

- `SignUpUseCase`, `SignInUseCase`, `SignOutUseCase`
- `SupabaseAuthRepository`
- `SessionContext`
- `AuthModal`
- `proxy.ts`
- `app/auth/confirm/route.ts`

### 2. Playwright - regressao browser-level

Playwright e viavel e recomendado, mas apenas como segunda camada.

Ele agrega valor para detectar problemas reais de navegador que Vitest nao enxerga bem:

- cookies e storage reais
- navegacao SSR + client hydration
- reload
- restore via back/forward cache
- variacoes de viewport e timing
- fluxo vindo de link externo de confirmacao

## Quando Playwright vale a pena

Playwright e a melhor escolha para reproduzir bugs como:

- usuario com cookie de sessao antigo
- `localStorage` com token desatualizado
- sessao parcialmente persistida
- callback de confirmacao que autentica no servidor mas chega no cliente em estado intermediario
- usuario que precisa de reload para sair do loading
- usuario completamente novo, sem cookie, sem `localStorage` e sem `sessionStorage`

## Quando Playwright fica fragil

Sem um ambiente de auth controlado, os testes ficam flaky.

Sinais de risco:

- usar projeto Supabase compartilhado com pessoas reais
- depender de email real para confirmacao
- reaproveitar usuarios fixos entre execucoes
- depender de timing natural do provedor de email

## Pre-requisitos para Playwright confiavel

Para uma suite E2E de auth realmente confiavel, o ideal e ter um destes cenarios:

1. Supabase local via CLI + Mailpit
2. Projeto Supabase exclusivo de testes

Em ambos os casos, a suite deve:

- criar usuarios descartaveis por execucao
- limpar usuarios e sessoes ao final
- nao depender de caixa de email humana
- conseguir confirmar usuario por API/admin quando necessario

Observacao do estado atual do repositorio:

- existe configuracao local de Supabase no workspace
- o arquivo `supabase/config.toml` ja esta preparado com `auth.email.enable_confirmations = true`
- a URL `http://127.0.0.1:3000/auth/confirm` ja foi adicionada como redirect local permitido

## Matriz minima de E2E com Playwright

### Fluxos felizes

1. cadastro com confirmacao obrigatoria
2. login com credenciais validas
3. logout e bloqueio de rota protegida
4. callback de confirmacao redirecionando para `/home`

### Estados de sessao suspeitos

1. cookie ausente + storage presente
2. cookie presente + storage ausente
3. token expirado no storage
4. sessao valida restaurada apos reload
5. sessao restaurada apos `pageshow`/bfcache
6. navegador totalmente limpo antes do primeiro acesso

### Falhas e bordas

1. credenciais invalidas
2. email nao confirmado
3. callback com `code` invalido
4. callback com `token_hash` invalido
5. usuario autenticado sem perfil em `public.users`
6. refresh de token retornando erro

## Mitigacoes recomendadas

### Mitigacoes de codigo

- rota server-side dedicada para confirmacao (`/auth/confirm`)
- validacao SSR no `proxy` com `getUser()`
- fallback defensivo no bootstrap de sessao
- safety timers em login/logout
- fallback seguro para URL invalida de redirect no signup

### Mitigacoes de teste

- separar testes deterministas de testes browser-level
- nao validar email real em ambiente compartilhado
- usar fixtures para storage/cookies invalidos
- logar claramente eventos de auth em modo debug
- executar Playwright serialmente nos fluxos que criam usuario

## Estado atual da suite

Hoje a cobertura automatizada de auth esta concentrada em Vitest e cobre:

- regras de cadastro/login
- callback de confirmacao
- protecao de rotas no `proxy`
- UI do modal de auth
- bootstrap e recuperacao de sessao no `SessionContext`

## Proximo passo recomendado

Se a equipe quiser capturar bugs de sessao antiga ou inconsistente em navegador real, o proximo passo recomendado e:

1. preparar Supabase local ou ambiente dedicado de testes
2. adicionar Playwright
3. escrever primeiro os cenarios de storage/cookie stale
4. depois incluir cadastro/login/confirmacao reais
