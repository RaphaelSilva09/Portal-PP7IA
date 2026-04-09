# SDD - Correcao do Fluxo de Confirmacao de Conta

## Contexto

Ao confirmar a conta pelo link enviado por email, o usuario chega a pagina inicial com um estado de loading de autenticacao que pode ficar preso ate um reload manual.

O problema mais provavel e um handoff incompleto entre:

- validacao de autenticacao no servidor (`proxy.ts`)
- persistencia de sessao do Supabase
- hidratacao e resolucao de sessao no cliente (`SessionContext`)

Hoje o projeto nao possui uma rota dedicada para finalizar o callback de confirmacao do Supabase antes de renderizar a aplicacao normal.

## Objetivo

Garantir que, ao clicar no link de confirmacao de conta:

- a sessao seja finalizada corretamente no servidor
- os cookies sejam persistidos antes do redirect final
- o usuario entre em `/home` sem precisar recarregar a pagina
- o fluxo continue compativel com SSR e rotas protegidas

## Escopo

Incluido:

- criar rota server-side para confirmacao de conta
- ajustar a validacao de autenticacao no proxy
- adicionar testes de regressao do fluxo
- documentar dependencia de configuracao no Supabase

Fora de escopo:

- refatorar toda a arquitetura de auth
- trocar `SessionContext`
- introduzir ferramenta nova de E2E neste ciclo

## Hipotese de Causa Raiz

1. O usuario clica no link de confirmacao.
2. O fluxo atual cai direto em uma rota comum da app.
3. O servidor tenta decidir autenticacao antes de a sessao ter sido finalizada de forma consistente para SSR.
4. O cliente entra num estado transitorio em que `isLoading` pode ficar visualmente preso.
5. No reload, a sessao ja foi persistida e o app passa a funcionar.

## Solucao Proposta

### Etapa 1 - Criar rota dedicada de confirmacao

Criar `app/auth/confirm/route.ts`.

Responsabilidades:

- receber `token_hash` e `type` da URL
- criar um `createServerClient(...)` por request
- ler cookies da request e escrever cookies na response
- chamar `supabase.auth.verifyOtp({ token_hash, type })`
- redirecionar para `/home` em caso de sucesso
- redirecionar para `/` em caso de falha ou parametros invalidos

Observacoes:

- a rota precisa encerrar o handshake antes de mandar o usuario para uma pagina normal da app
- o redirect final deve acontecer so depois da escrita dos cookies da sessao

### Etapa 2 - Ajustar o link de confirmacao enviado pelo Supabase

Necessario configurar o template de email de confirmacao no Supabase para apontar para a rota nova.

Exemplo de link esperado no template:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">
  Confirmar conta
</a>
```

Tambem sera necessario:

- garantir que a URL da aplicacao esteja correta em `Site URL`
- garantir que `/auth/confirm` esteja na allowlist de redirects

### Etapa 3 - Endurecer a validacao do proxy

Arquivo alvo: `proxy.ts`

Trocar a estrategia atual baseada em `supabase.auth.getSession()` por uma estrategia server-safe:

- preferencia 1: `supabase.auth.getClaims()`
- preferencia 2: `supabase.auth.getUser()`

Motivo:

- `getSession()` nao e a melhor fonte de verdade no servidor para proteger rota
- o proprio guia do Supabase recomenda nao confiar nele em codigo SSR para autorizacao

### Etapa 4 - Validar se o `SessionContext` ainda precisa de ajuste

Arquivo alvo: `context/SessionContext.tsx`

A principio, nao mexer aqui antes de concluir as etapas 1 a 3.

So intervir se, apos a correcao do callback server-side, ainda houver algum loading preso.

Se ainda houver sintoma residual, avaliar:

- timeout defensivo para resolucao inicial especifica de callback
- tratamento mais explicito de falha em `getUserFromSession`
- logs adicionais temporarios para auth

## Design Tecnico

### Rota `app/auth/confirm/route.ts`

Entradas esperadas:

- `token_hash`
- `type`
- opcionalmente `next`

Fluxo:

1. Ler `searchParams` da request.
2. Validar se `token_hash` e `type` existem.
3. Criar `NextResponse.redirect(...)` com destino default.
4. Criar `createServerClient(...)` com adaptador de cookies.
5. Chamar `verifyOtp`.
6. Em sucesso, redirecionar para `/home`.
7. Em erro, redirecionar para `/`.

Regras de seguranca:

- se `next` existir, aceitar apenas paths internas que comecem com `/`
- nao permitir open redirect para dominios externos

### Proxy

Regras desejadas apos a mudanca:

- `/home`: exige usuario autenticado validado por metodo server-safe
- `/user`: exige usuario autenticado validado por metodo server-safe
- `/painel-admin`: exige usuario autenticado e role admin no JWT validado
- `/`: usuario autenticado continua sendo redirecionado para `/home`

## Estrategia de Testes

Usar a stack ja existente no projeto:

- Vitest
- jsdom para testes de contexto/componentes
- mocks manuais para route handlers e Supabase client

### Testes 1 - Rota de confirmacao

Novo arquivo:

- `__tests__/app/auth/confirm/route.test.ts`

Cenarios minimos:

1. `token_hash` e `type=email` validos:
   - chama `verifyOtp`
   - retorna redirect para `/home`
   - escreve cookies na resposta
2. parametros ausentes:
   - retorna redirect para `/`
   - nao chama `verifyOtp`
3. erro no `verifyOtp`:
   - retorna redirect para `/`
4. `next` interno valido:
   - redireciona para o path interno informado
5. `next` externo invalido:
   - ignora valor e redireciona para `/home`

### Testes 2 - Proxy

Novo arquivo:

- `__tests__/proxy.test.ts`

Cenarios minimos:

1. usuario autenticado acessa `/home`:
   - requisicao passa
2. usuario anonimo acessa `/home`:
   - redirect para `/`
3. usuario anonimo acessa `/user`:
   - redirect para `/?authModal=login`
4. usuario autenticado acessa `/`:
   - redirect para `/home`
5. usuario sem role admin acessa `/painel-admin`:
   - redirect para `/home`
6. usuario admin acessa `/painel-admin`:
   - requisicao passa

### Testes 3 - Repositorio de auth

Arquivo existente:

- `__tests__/infrastructure/SupabaseAuthRepository.test.ts`

Adicionar se a implementacao passar a controlar redirect no `signUp`:

1. `signUp` envia `options.emailRedirectTo` corretamente
2. o redirect de confirmacao aponta para `/auth/confirm`

### Testes 4 - Regressao de sessao

Arquivo existente:

- `__tests__/context/SessionContext.test.tsx`

Adicionar caso de regressao focado em UX:

1. apos autenticacao inicial valida, `isLoading` precisa resolver para `false`
2. se a carga do perfil falhar, o contexto nao pode permanecer preso em loading

## Passos de Implementacao

### Fase A - Base do callback

1. Criar `app/auth/confirm/route.ts`.
2. Implementar integracao com `createServerClient` e cookies.
3. Redirecionar sucesso para `/home` e falha para `/`.
4. Cobrir com testes da rota.

### Fase B - Proxy

1. Atualizar `proxy.ts` para validacao server-safe.
2. Cobrir o comportamento com `__tests__/proxy.test.ts`.

### Fase C - Ajustes do Supabase

1. Atualizar template de email de confirmacao no painel do Supabase.
2. Confirmar allowlist de redirect URLs.
3. Validar manualmente o link gerado no email.

### Fase D - Regressao

1. Rodar `npm test`.
2. Rodar `npm run build`.
3. Validar fluxo manual:
   - cadastrar conta nova
   - abrir email
   - clicar no link
   - confirmar entrada direta em `/home` sem reload

## Criterios de Aceite

- o clique no link de confirmacao nao exige reload manual
- o usuario entra autenticado de primeira apos confirmar o email
- `/home` e `/user` continuam protegidas
- `/painel-admin` continua respeitando role admin
- testes novos e existentes passam
- build de producao continua funcionando

## Riscos e Dependencias

### Dependencias externas

- acesso ao painel do Supabase para editar template e redirect URLs

### Riscos tecnicos

- se o template de email continuar usando o fluxo padrao antigo, a rota server-side nao sera acionada
- se houver defasagem na criacao do registro em `public.users`, pode restar um sintoma secundario apos a confirmacao

## Plano de Rollback

Se a nova rota causar regressao:

- reverter o uso do template novo no Supabase
- remover a rota `app/auth/confirm/route.ts`
- restaurar o comportamento anterior do `proxy.ts`

## Definicao de Pronto

Esta correcao sera considerada pronta quando:

- a rota de confirmacao existir e estiver testada
- o proxy estiver validando auth de forma server-safe
- o template de email estiver apontando para `/auth/confirm`
- o fluxo real de confirmacao funcionar sem reload manual
