# Documentação de Testes — Portal Frontend

> **89 testes · 13 arquivos · 0 falhas**
> Stack: [Vitest 3.x](https://vitest.dev) · [@testing-library/react 16.x](https://testing-library.com) · jsdom

---

## Sumário

| Camada | Arquivos | Testes |
|---|---|---|
| [Domínio](#1-domínio) | 2 | 29 |
| [Application — Use Cases](#2-application--use-cases) | 6 | 31 |
| [Infraestrutura](#3-infraestrutura) | 2 | 12 |
| [Context](#4-context) | 1 | 6 |
| [Hooks](#5-hooks) | 1 | 6 |
| [Componentes](#6-componentes) | 1 | 5 |
| **Total** | **13** | **89** |

---

## Configuração

### `vitest.config.ts`
```ts
plugins: [react(), tsconfigPaths()]
environment: 'jsdom'
globals: true
setupFiles: ['./vitest.setup.ts']
```

### `vitest.setup.ts`
Executa `cleanup()` após cada teste para desmontar árvores React e evitar vazamento de estado entre testes.

### Scripts disponíveis
```bash
npm test               # executa todos os testes uma vez
npm run test:watch     # modo watch (re-executa ao salvar)
npm run test:coverage  # relatório de cobertura via v8
```

---

## 1. Domínio

Testes **puros**, sem mocks, sem I/O. Validam as regras de negócio que vivem independentemente de qualquer framework ou banco de dados.

---

### `__tests__/domain/User.test.ts`

**Arquivo de origem:** `domain/entities/User.ts`
**Tipo:** Unit test puro
**Dependências externas mockadas:** nenhuma

#### `User.create()`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Props válidas fornecidas | Cria instância; getters `id`, `email`, `nome`, `celular`, `acceptEmailUpdates`, `acceptWhatsAppUpdates` e `role` retornam os valores passados |
| 2 | Email no formato `not-an-email` | Lança `Error('Email inválido')` |
| 3 | Email vazio (`''`) | Lança `Error('Email inválido')` |
| 4 | Nome vazio (`''`) | Lança `Error('Nome é obrigatório')` |
| 5 | Nome somente espaços (`'   '`) | Lança `Error('Nome é obrigatório')` — valida que `trim()` é aplicado |
| 6 | Celular com 9 dígitos (`'999999999'`) | Lança `Error('Celular inválido')` — mínimo é 10 dígitos numéricos |
| 7 | Celular formatado com 10 dígitos (`'(11) 9999-9999'`) | Cria instância — caracteres não-numéricos são ignorados na validação |
| 8 | Celular formatado com 11 dígitos (`'(11) 99999-9999'`) | Cria instância |
| 9 | `acceptEmailUpdates=false` e `acceptWhatsAppUpdates=false` | Lança erro com mensagem contendo `"pelo menos uma forma de comunicação"` |

#### `isAdmin`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 10 | `role='admin'` | `user.isAdmin === true` |
| 11 | `role='user'` | `user.isAdmin === false` |

#### `toObject()`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 12 | Instância criada com props válidas | Retorna objeto plano com igualdade profunda aos props originais, mas **referência diferente** (cópia defensiva) |

---

### `__tests__/domain/AuthError.test.ts`

**Arquivo de origem:** `domain/errors/AuthError.ts`
**Tipo:** Unit test puro
**Dependências externas mockadas:** nenhuma

Valida a hierarquia de erros de domínio e as mensagens em português exibidas ao usuário.

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | `new InvalidCredentialsError()` | É `instanceof AuthError` e `instanceof Error` |
| 2 | `InvalidCredentialsError().message` | `'Email ou senha inválidos'` |
| 3 | `new UserAlreadyExistsError()` | É `instanceof AuthError` |
| 4 | `UserAlreadyExistsError().message` | `'Já existe uma conta com este email'` |
| 5 | `new WeakPasswordError()` | É `instanceof AuthError` |
| 6 | `WeakPasswordError().message` (sem argumento) | `'A senha não atende aos requisitos de segurança'` |
| 7 | `new WeakPasswordError('Senha muito curta')` | `.message === 'Senha muito curta'` — aceita mensagem customizada |
| 8 | `new NetworkError()` | É `instanceof AuthError` |
| 9 | `NetworkError().message` | Contém a palavra `"conexão"` |
| 10 | `new UnknownAuthError()` | É `instanceof AuthError` |
| 11 | `UnknownAuthError().message` | Contém `"erro inesperado"` (case-insensitive) |
| 12 | `new EmailNotConfirmedError()` | É `instanceof AuthError` |
| 13 | `EmailNotConfirmedError().message` | Contém `"confirme seu email"` (case-insensitive) |
| 14 | `new PasswordResetRequestError()` | É `instanceof AuthError` |
| 15 | `new InvalidResetTokenError()` | É `instanceof AuthError` |
| 16 | `InvalidResetTokenError().message` | Contém `"inválido"` ou `"expirado"` (case-insensitive) |
| 17 | `.name` nos três subtipos principais | Cada `err.name` é igual ao nome da classe (`'InvalidCredentialsError'`, `'UserAlreadyExistsError'`, `'NetworkError'`) — necessário para `instanceof` cross-realm |

---

## 2. Application — Use Cases

Testes de **orquestração de lógica de negócio**. Cada use case recebe um repositório mockado via interface (`IAuthRepository`), permitindo isolar completamente a camada de infraestrutura.

**Padrão de mock utilizado:**
```ts
const mockRepo = {
    signIn: vi.fn(),
} satisfies Partial<IAuthRepository>;
const useCase = new SignInUseCase(mockRepo as IAuthRepository);
```

---

### `__tests__/application/SignInUseCase.test.ts`

**Arquivo de origem:** `application/usecases/SignInUseCase.ts`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Email vazio | Lança `'Email e senha são obrigatórios'`; `repo.signIn` **não** é chamado |
| 2 | Senha vazia | Lança `'Email e senha são obrigatórios'`; `repo.signIn` **não** é chamado |
| 3 | Email em uppercase (`'TEST@EXAMPLE.COM'`) | `repo.signIn` recebe `{ email: 'test@example.com', ... }` — normalização para lowercase aplicada |
| 4 | Repo retorna usuário e session | Output contém `user` e `accessToken` corretos |
| 5 | Repo retorna `session: null` | `accessToken` no output é `null` |
| 6 | Repo lança `InvalidCredentialsError` | Erro repassado sem transformação — use case não intercepta nem envolve em outro tipo |

---

### `__tests__/application/SignUpUseCase.test.ts`

**Arquivo de origem:** `application/usecases/SignUpUseCase.ts`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Email vazio | Lança erro com `"campos obrigatórios"`; `repo.signUp` **não** é chamado |
| 2 | Nome vazio | Lança erro com `"campos obrigatórios"` |
| 3 | Password vazio | Lança erro com `"campos obrigatórios"` |
| 4 | Celular vazio | Lança erro com `"campos obrigatórios"` |
| 5 | `acceptEmailUpdates=false` e `acceptWhatsAppUpdates=false` | Lança `'Aceite pelo menos uma forma'`; `repo.signUp` **não** é chamado |
| 6 | Email com espaços e uppercase, nome com espaços | `repo.signUp` recebe `email: 'test@example.com'` e `nome: 'Test User'` — `trim()` + `toLowerCase()` aplicados |
| 7 | Repo retorna `emailConfirmationRequired: true` | Output: `emailConfirmationRequired === true` e `accessToken === null` |
| 8 | Repo retorna `session` sem `emailConfirmationRequired` | `result.emailConfirmationRequired` é `undefined` |

---

### `__tests__/application/SignOutUseCase.test.ts`

**Arquivo de origem:** `application/usecases/SignOutUseCase.ts`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Execução normal | `repo.signOut()` chamado exatamente uma vez |
| 2 | Repo lança erro | Erro repassado diretamente para o chamador |

---

### `__tests__/application/VerifyPasswordResetOTPUseCase.test.ts`

**Arquivo de origem:** `application/usecases/VerifyPasswordResetOTPUseCase.ts`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | OTP com 7 dígitos (`'1234567'`) | Lança erro com `"8 dígitos numéricos"`; repo **não** é chamado |
| 2 | OTP com 9 dígitos (`'123456789'`) | Lança erro com `"8 dígitos numéricos"` |
| 3 | OTP alfanumérico (`'1234567a'`) | Lança erro com `"8 dígitos numéricos"` |
| 4 | Email inválido com OTP válido | Lança `'Email inválido'`; repo **não** é chamado |
| 5 | Email com espaços/uppercase + OTP com espaços | Repo recebe `{ email: 'test@example.com', token: '12345678' }` — `trim()` + `toLowerCase()` |
| 6 | Input completamente válido | Resolve sem lançar (`undefined`) |

---

### `__tests__/application/SendPasswordResetUseCase.test.ts`

**Arquivo de origem:** `application/usecases/SendPasswordResetUseCase.ts`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Email no formato inválido | Lança `'Email inválido'`; `repo.sendPasswordReset` **não** é chamado |
| 2 | Email vazio | Lança erro com `"obrigatório"`; repo **não** é chamado |
| 3 | Email válido | Resolve sem lançar; `repo.sendPasswordReset('test@example.com')` chamado |
| 4 | Email em uppercase | Repo recebe email normalizado em lowercase |

---

### `__tests__/application/ResetPasswordWithTokenUseCase.test.ts`

**Arquivo de origem:** `application/usecases/ResetPasswordWithTokenUseCase.ts`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | `newPassword` e `confirmPassword` diferentes | Lança `'As senhas não coincidem'`; repo **não** é chamado |
| 2 | Senha nova vazia | Lança erro com `"obrigatória"` |
| 3 | Senha com menos de 6 caracteres (`'12345'`) | Lança erro com `"mínimo"`; repo **não** é chamado |
| 4 | Senhas válidas e iguais | `repo.resetPasswordWithToken('novaSenha123')` chamado com a nova senha |
| 5 | Repo lança erro | Erro repassado diretamente |

---

## 3. Infraestrutura

Testes da camada mais externa: adaptadores que traduzem entre a interface de domínio e o cliente Supabase.

---

### `__tests__/infrastructure/SupabaseAuthRepository.test.ts`

**Arquivo de origem:** `infrastructure/repositories/SupabaseAuthRepository.ts`
**Tipo:** Integração com Supabase mockado
**Estratégia de mock:** O repositório aceita um `SupabaseClient` no construtor — um objeto fake é criado por `createMockSupabaseClient()` com `vi.fn()` para cada método, evitando qualquer chamada real de rede ou variável de ambiente.

```ts
// Mock do builder pattern: supabase.from('users').select('*').eq('id', id).single()
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
repo = new SupabaseAuthRepository(mockClient as any);
```

#### `signIn`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | `signInWithPassword` retorna user + session válidos | `AuthResult` com `user.email` correto e `session.accessToken === 'at'` |
| 2 | Supabase retorna `{ message: 'invalid login credentials' }` | Lança `InvalidCredentialsError` |
| 3 | Supabase retorna `{ message: 'email not confirmed' }` | Lança `EmailNotConfirmedError` |
| 4 | Supabase retorna `{ code: 'NETWORK_ERROR' }` | Lança `NetworkError` |

#### `signUp`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 5 | `identities: []` no retorno (email já existe no Supabase) | Lança `UserAlreadyExistsError` — detecta o comportamento silencioso do Supabase quando `email confirmation` está habilitado |

#### `getCurrentUser`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 6 | `getUser()` retorna `user: null` (sem sessão) | Retorna `null` |

#### `verifyPasswordResetOTP`

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 7 | `verifyOtp` retorna `{ message: 'Invalid OTP token' }` | Lança `UnknownAuthError` |
| 8 | `verifyOtp` retorna `{ message: 'Token has expired' }` | Lança `UnknownAuthError` com `.message` contendo `"expirado"` |

---

### `__tests__/infrastructure/DIContainer.test.ts`

**Arquivo de origem:** `infrastructure/di/container.ts`
**Tipo:** Smoke test do container de injeção de dependências
**Estratégia de mock:** `vi.mock('@/infrastructure/config/supabase', ...)` substitui o módulo inteiro antes de qualquer import — impede que `createSupabaseClient()` rode no boot e valide variáveis de ambiente ausentes.

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | `DIContainer.getAuthRepository()` | Retorna instância de `SupabaseAuthRepository` |
| 2 | `DIContainer.getSignInUseCase()` | Retorna instância de `SignInUseCase` |
| 3 | Duas chamadas a `getAuthRepository()` | Retornam **a mesma referência** (padrão Singleton) |
| 4 | `getAuthRepository()` → `reset()` → `getAuthRepository()` | Retorna instância **diferente** da primeira (Singleton limpo) |

---

## 4. Context

Testes do `SessionContext`, responsável por gerenciar o estado de autenticação em toda a aplicação React. Por ser um Provider que integra diretamente com o Supabase Auth e o DI Container, exige dois níveis de mock.

---

### `__tests__/context/SessionContext.test.tsx`

**Arquivo de origem:** `context/SessionContext.tsx`
**Tipo:** Teste de integração React (renderização + estado)
**Dependências mockadas:**
- `@/infrastructure/config/supabase` — captura o callback registrado em `onAuthStateChange` via `vi.hoisted()` (necessário porque `vi.mock` é hoistado antes de `let`/`const`)
- `@/infrastructure/di/container` — fornece mock de `getUserFromSession`, `getSignInUseCase`, etc.

**Padrão de verificação:** Um componente auxiliar (`SessionConsumer`) lê o contexto e expõe `data-testid` para asserções.

```tsx
// Captura do callback de auth (técnica vi.hoisted)
const { capturedCallback } = vi.hoisted(() => ({
    capturedCallback: { value: null },
}));
vi.mock('@/infrastructure/config/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn((cb) => { capturedCallback.value = cb; ... }),
        },
    },
}));
```

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | `INITIAL_SESSION` disparado com sessão válida | `user.email` exibido no DOM; `isLoading === false` |
| 2 | `INITIAL_SESSION` disparado sem sessão (`null`) | `user` permanece `null`; `isLoading === false` |
| 3 | `SIGNED_OUT` após usuário logado | `user` volta para `null` |
| 4 | `TOKEN_REFRESHED` com novo dado de usuário | `user` atualizado com email do novo objeto retornado por `getUserFromSession` |
| 5 | `visibilitychange` para `visible` (aba em foco) | `supabase.auth.getSession()` é chamado novamente (re-verificação de sessão em background) |
| 6 | `signIn` lança `InvalidCredentialsError` | `isLoading` volta para `false`; `error` recebe `'Email ou senha inválidos'` |

---

## 5. Hooks

---

### `__tests__/hooks/useSearch.test.tsx`

**Arquivo de origem:** `presentation/hooks/useSearch.ts`
**Tipo:** Teste de hook customizado com timers controlados
**Dependências mockadas:** `@/infrastructure/di/container` (retorna `{ execute: mockExecute }`)
**Configuração especial:** `vi.useFakeTimers()` em cada teste para controlar o debounce de 300ms sem aguardar tempo real

> **Nota técnica:** `waitFor` do Testing Library usa `setTimeout` internamente, o que conflita com fake timers. Por isso, todos os testes assíncronos usam `vi.runAllTimersAsync()` dentro de `act()` para avançar timers e esvaziar a fila de microtasks em um único passo.

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Query com 1 caractere (`'a'`) | `results=[]`, `isLoading=false`, `error=null` — debounce não inicia |
| 2 | Query vazia (`''`) | `results=[]`, `isLoading=false` |
| 3 | Query com 2+ caracteres, antes dos 300ms | `isLoading=true` imediatamente após a renderização |
| 4 | Query com 2+ chars, depois dos 300ms | `mockExecute` chamado 1 vez; `results` preenchidos; `isLoading=false` |
| 5 | Query muda antes de 300ms (ex: `'te'` → `'tes'`) | `mockExecute` chamado **1 vez** (timer da primeira query cancelado pelo cleanup do `useEffect`); resultados correspondem à segunda query |
| 6 | `mockExecute` rejeita com erro | `error` recebe a mensagem do erro; `results=[]`; `isLoading=false` |

---

## 6. Componentes

---

### `__tests__/components/PortalNewsWidget.test.tsx`

**Arquivo de origem:** `components/PortalNewsWidget.tsx`
**Tipo:** Teste de renderização de componente React
**Dependências mockadas:**
- `@/presentation/hooks/usePortalNews` — controla os dados exibidos sem disparar queries reais
- `next/navigation` — fornece `useRouter` mock para evitar erros de contexto do Next.js

**Helper:** `makeItem(overrides)` cria instâncias reais de `PortalNewsItem` com valores padrão, garantindo que todos os getters da entidade funcionem corretamente.

| # | Cenário testado | Resultado esperado |
|---|---|---|
| 1 | Hook retorna 2 items, `isLoading=false` | Textos `'Item 1'` e `'Item 2'` presentes no DOM |
| 2 | `isLoading=true` | Nenhum `role="button"` no DOM (skeletons exibidos em vez dos items) |
| 3 | Item com `linkType='newsletter'` e `linkItemId=42` | Elemento com `role="button"` presente (item clicável) |
| 4 | Item com `linkType=null` e `linkItemId=null` | Nenhum `role="button"` no DOM (item não clicável) |
| 5 | Lista de items vazia, `isLoading=false` | Texto `"nenhuma novidade"` (case-insensitive) presente no DOM |

---

## Arquitetura dos Mocks

### Por que cada camada exige uma estratégia diferente

```
┌─────────────────────────────────────────────────────────────────┐
│  Componentes / Context / Hooks                                  │
│  → vi.mock() módulos inteiros (hooks, next/navigation, supabase)│
├─────────────────────────────────────────────────────────────────┤
│  Use Cases (Application)                                        │
│  → Mock manual via interface: { signIn: vi.fn() }               │
│    Sem vi.mock() — não importam infraestrutura                  │
├─────────────────────────────────────────────────────────────────┤
│  Repositório (Infrastructure)                                   │
│  → Mock do SupabaseClient via construtor                        │
│    Sem vi.mock() — cliente injetado diretamente                 │
├─────────────────────────────────────────────────────────────────┤
│  DI Container                                                   │
│  → vi.mock('@/infrastructure/config/supabase') obrigatório      │
│    (módulo roda createSupabaseClient() no topo do arquivo)      │
├─────────────────────────────────────────────────────────────────┤
│  Domínio                                                        │
│  → Sem mocks — lógica pura, sem dependências externas           │
└─────────────────────────────────────────────────────────────────┘
```

### `vi.hoisted()` no SessionContext

`vi.mock()` é **hoistado** pelo Vitest para antes de qualquer `import` ou declaração de variável. Variáveis definidas com `let`/`const` no topo do arquivo ainda não existem quando o factory do mock executa. `vi.hoisted()` resolve isso declarando as variáveis dentro de uma closure que também é hoistada:

```ts
// Correto: ambos são hoistados juntos
const { capturedCallback } = vi.hoisted(() => ({
    capturedCallback: { value: null },
}));
vi.mock('@/infrastructure/config/supabase', () => ({
    supabase: { auth: { onAuthStateChange: (cb) => { capturedCallback.value = cb; ... } } },
}));
```

### `vi.runAllTimersAsync()` no useSearch

`vi.useFakeTimers()` substitui `setTimeout`/`setInterval` globais, incluindo os usados internamente pelo `waitFor` do Testing Library. Chamar `waitFor` com timers falsos trava o teste indefinidamente. A solução é substituir `waitFor` por `vi.runAllTimersAsync()` dentro de `act()`:

```ts
// ✗ Trava: waitFor usa setTimeout internamente (que está falso)
await waitFor(() => expect(result.current.isLoading).toBe(false));

// ✓ Correto: avança todos os timers E esvazia microtasks
await act(async () => {
    await vi.runAllTimersAsync();
});
expect(result.current.isLoading).toBe(false);
```

---

## Estrutura de Arquivos

```
frontend/
├── vitest.config.ts                          # configuração do Vitest
├── vitest.setup.ts                           # cleanup após cada teste
└── __tests__/
    ├── domain/
    │   ├── User.test.ts                      # 12 testes
    │   └── AuthError.test.ts                 # 17 testes
    ├── application/
    │   ├── SignInUseCase.test.ts             # 6 testes
    │   ├── SignUpUseCase.test.ts             # 8 testes
    │   ├── SignOutUseCase.test.ts            # 2 testes
    │   ├── VerifyPasswordResetOTPUseCase.test.ts  # 6 testes
    │   ├── SendPasswordResetUseCase.test.ts  # 4 testes
    │   └── ResetPasswordWithTokenUseCase.test.ts  # 5 testes
    ├── infrastructure/
    │   ├── SupabaseAuthRepository.test.ts    # 8 testes
    │   └── DIContainer.test.ts               # 4 testes
    ├── context/
    │   └── SessionContext.test.tsx           # 6 testes
    ├── hooks/
    │   └── useSearch.test.tsx                # 6 testes
    └── components/
        └── PortalNewsWidget.test.tsx         # 5 testes
```
