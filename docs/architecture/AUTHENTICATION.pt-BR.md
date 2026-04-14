# 🔐 Sistema de Autenticação - Portal PP7+IA

> **[English Version](AUTHENTICATION.md)** | Versão em Português

Documentação completa do sistema de autenticação do Portal PP7+IA construído com **Clean Architecture**, **Domain-Driven Design (DDD)** e **princípios SOLID**.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Configuração Rápida](#configuração-rápida)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Conceitos Principais](#conceitos-principais)
- [Uso](#uso)
- [Segurança](#segurança)
- [Evolução da Arquitetura](#evolução-da-arquitetura)
- [Solucionando Problemas](#solucionando-problemas)
- [Referências](#referências)

## Visão Geral

O sistema de autenticação fornece:

- ✅ Registro e login de usuários
- ✅ Verificação de email
- ✅ Recuperação de senha
- ✅ Gerenciamento de sessão
- ✅ Gerenciamento de perfil de usuário
- ✅ Exclusão de conta
- ✅ Row Level Security (RLS)
- ✅ Clean Architecture (4 camadas)
- ✅ Type-safe com TypeScript

### Stack Tecnológica

- **Frontend**: React 19 + Next.js 16
- **Provedor de Auth**: Supabase Auth
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Linguagem**: TypeScript

## Arquitetura

O sistema segue **Clean Architecture** com clara separação de responsabilidades:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│         (components/, presentation/)                     │
│  ┌──────────────┐         ┌──────────────┐             │
│  │ AuthModal.tsx│────────▶│  useAuth.ts  │             │
│  └──────────────┘         └──────┬───────┘             │
└──────────────────────────────────┼──────────────────────┘
                                   │
┌──────────────────────────────────▼──────────────────────┐
│                    APPLICATION                           │
│              (application/usecases/)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │SignUpUseCase │  │SignInUseCase │  │SignOutUseCase│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────┐
│                      DOMAIN                              │
│                    (domain/)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     User     │  │  AuthErrors  │  │IAuthRepository│  │
│  │   (Entity)   │  │   (Errors)   │  │  (Interface) │  │
│  └──────────────┘  └──────────────┘  └──────▲───────┘  │
└─────────────────────────────────────────────┼──────────┘
                                              │
┌─────────────────────────────────────────────┼──────────┐
│                  INFRASTRUCTURE                         │
│              (infrastructure/)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Supabase   │  │SupabaseAuth  │  │ DIContainer  │  │
│  │   Client     │  │  Repository  │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Responsabilidades das Camadas

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **Domain** | Entidades e regras de negócio | Entidade `User`, interface `IAuthRepository` |
| **Application** | Casos de uso e lógica de negócio | `SignUpUseCase`, `SignInUseCase` |
| **Infrastructure** | Serviços externos e implementações | `SupabaseAuthRepository`, cliente DB |
| **Presentation** | Componentes UI e hooks | `AuthModal`, hook `useAuth` |

## Configuração Rápida

> **Instruções detalhadas**: [Guia de Setup do Supabase](../setup/SUPABASE.md) | [Início Rápido](../setup/QUICKSTART.pt-BR.md)

### 1. Variáveis de Ambiente

Crie `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 2. Execute as Migrations

No Supabase Dashboard → SQL Editor, execute:

```bash
supabase/migrations/001_auth_schema.sql
supabase/migrations/002_auto_create_profile.sql
```

### 3. Inicie a Aplicação

```bash
cd frontend
pnpm run dev
```

## Estrutura de Pastas

```
frontend/
├── domain/                          # 🎯 CAMADA DE DOMÍNIO
│   ├── entities/
│   │   └── User.ts                 # Entidade User (DDD)
│   ├── errors/
│   │   └── AuthError.ts            # Erros de domínio
│   ├── repositories/
│   │   └── IAuthRepository.ts      # Interface do repositório (DIP)
│   └── index.ts
│
├── application/                     # 🔄 CAMADA DE APLICAÇÃO
│   ├── usecases/
│   │   ├── SignUpUseCase.ts        # Caso de uso de registro
│   │   ├── SignInUseCase.ts        # Caso de uso de login
│   │   ├── SignOutUseCase.ts       # Caso de uso de logout
│   │   └── GetCurrentUserUseCase.ts # Obter usuário atual
│   └── index.ts
│
├── infrastructure/                  # 🔧 CAMADA DE INFRAESTRUTURA
│   ├── config/
│   │   └── supabase.ts             # Cliente Supabase
│   ├── repositories/
│   │   └── SupabaseAuthRepository.ts # Implementação concreta
│   ├── di/
│   │   └── container.ts            # Injeção de Dependência
│   └── index.ts
│
├── presentation/                    # 🎨 CAMADA DE APRESENTAÇÃO
│   ├── hooks/
│   │   └── useAuth.ts              # Hook React
│   └── index.ts
│
├── context/                         # Contextos React
│   ├── SessionContext.tsx          # Gerenciamento de estado de sessão
│   ├── UserActionsContext.tsx      # Ações do usuário (perfil, senha)
│   └── AuthContext.tsx             # Facade (compatibilidade retroativa)
│
├── components/
│   └── AuthModal.tsx               # Componente UI
│
└── hooks/
    └── usePasswordRecovery.ts      # Hook de recuperação de senha
```

## Conceitos Principais

### Princípios de Clean Architecture

| Princípio | Implementação |
|-----------|---------------|
| **Independência de Frameworks** | Core não depende de React/Next.js |
| **Testabilidade** | Cada camada isolada e testável |
| **Independência de UI** | Lógica de negócio separada da apresentação |
| **Independência de DB** | Padrão Repository com interfaces |
| **Regra de Dependência** | Dependências sempre apontam para dentro |

### Princípios SOLID

| Princípio | Exemplo |
|-----------|---------|
| **S**ingle Responsibility | `SignUpUseCase` - apenas cuida do registro |
| **O**pen-Closed | Extensível via novos Use Cases |
| **L**iskov Substitution | `IAuthRepository` → implementações |
| **I**nterface Segregation | Interfaces específicas por contexto |
| **D**ependency Inversion | Use Cases → Interface ← Repository |

### Domain-Driven Design

- **Entidades**: Entidade `User` com validações de negócio
- **Casos de Uso**: Orquestram regras de negócio
- **Padrão Repository**: Abstrai persistência
- **Erros de Domínio**: Erros expressivos de negócio
- **Linguagem Ubíqua**: Nomenclatura consistente

## Uso

### Autenticação Básica

```tsx
import { useAuth } from "@/presentation/hooks/useAuth";

function MeuComponente() {
    const { signUp, signIn, signOut, user, isLoading, error } = useAuth();

    const handleCadastro = async () => {
        try {
            await signUp({
                email: "usuario@exemplo.com",
                password: "SenhaSegura123!",
                nome: "João Silva",
                celular: "(11) 98765-4321",
                acceptEmailUpdates: true,
                acceptWhatsAppUpdates: false,
            });
            // Sucesso! Usuário criado
        } catch (err) {
            // Erro tratado automaticamente
            console.error(error);
        }
    };

    if (isLoading) return <p>Carregando...</p>;
    
    return user ? (
        <div>
            <p>Bem-vindo, {user.nome}!</p>
            <button onClick={signOut}>Sair</button>
        </div>
    ) : (
        <button onClick={handleCadastro}>Cadastrar</button>
    );
}
```

### Usando Session Context (Otimizado)

Para componentes que precisam apenas de dados de sessão:

```tsx
import { useSession } from "@/context/SessionContext";

function PerfilUsuario() {
    const { user, isLoading } = useSession(); // Só re-renderiza em mudanças de sessão
    
    if (isLoading) return <p>Carregando...</p>;
    if (!user) return <p>Por favor, faça login</p>;
    
    return <h1>Olá, {user.nome}!</h1>;
}
```

### Usando User Actions Context

Para componentes que precisam atualizar dados do usuário:

```tsx
import { useUserActions } from "@/context/UserActionsContext";

function ConfiguracoesPerfil() {
    const { updateEmail, updatePassword, isLoading, error } = useUserActions();
    
    const handleAtualizarEmail = async (novoEmail: string) => {
        await updateEmail(novoEmail);
    };
    
    return (
        <div>
            {error && <p>Erro: {error}</p>}
            <button onClick={() => handleAtualizarEmail("novo@email.com")} disabled={isLoading}>
                Atualizar Email
            </button>
        </div>
    );
}
```

### Recuperação de Senha

```tsx
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";

function PaginaResetarSenha() {
    const { resetPassword, recoveryStatus, isLoading, recoveryError } = usePasswordRecovery();
    
    const handleReset = async () => {
        const sucesso = await resetPassword("NovaSenhaSegura123!", "NovaSenhaSegura123!");
        
        if (sucesso) {
            // Redirecionar para login
            router.push("/");
        }
    };
    
    if (recoveryStatus === "loading") return <p>Validando token...</p>;
    if (recoveryStatus === "error") return <p>Token inválido ou expirado</p>;
    
    return <button onClick={handleReset} disabled={isLoading}>Resetar Senha</button>;
}
```

### Modal de Autenticação

```tsx
import AuthModal from "@/components/AuthModal";

function App() {
    const [modalAberto, setModalAberto] = useState(false);

    return (
        <>
            <button onClick={() => setModalAberto(true)}>Login</button>
            
            <AuthModal 
                isOpen={modalAberto} 
                onClose={() => setModalAberto(false)} 
                initialMode="login"  // ou "signup"
            />
        </>
    );
}
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

```sql
-- Usuários podem ler apenas seus próprios dados
CREATE POLICY "Users can read own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);
```

### Validação em Múltiplas Camadas

1. **Frontend** (UX): Feedback imediato
2. **Domínio** (Negócio): Validações de entidade
3. **Banco de Dados** (Integridade): Constraints e RLS

### Tratamento de Erros

```typescript
import { UserAlreadyExistsError, WeakPasswordError } from "@/domain/errors/AuthError";

try {
    await signUp(dadosUsuario);
} catch (error) {
    if (error instanceof UserAlreadyExistsError) {
        // Tratar email duplicado
    } else if (error instanceof WeakPasswordError) {
        // Tratar senha fraca
    } else {
        // Erro genérico
    }
}
```

## Evolução da Arquitetura

### De God Object para Contextos Modulares

O sistema de autenticação foi refatorado de um único "God Object" (AuthContext com 9 responsabilidades) para uma arquitetura modular:

#### Antes (Anti-padrão)

```typescript
// AuthContext - Contexto único com TODAS as responsabilidades
interface AuthContextType {
    user, isLoading, error;                    // Estado de sessão
    emailConfirmationRequired;                 // Confirmação de email
    isRecoveryReady;                           // Recuperação de senha
    signUp, signIn, signOut;                   // Operações de auth
    updateEmail, updatePassword, deleteAccount; // Operações de usuário
    sendPasswordReset, resetPasswordWithToken;  // Operações de recuperação
}
```

**Problemas:**
- ❌ Viola SRP (Single Responsibility Principle)
- ❌ Força re-renders de todos componentes mesmo se apenas um valor muda
- ❌ Difícil de testar (9 mocks necessários)
- ❌ Difícil de estender sem quebrar código existente

#### Depois (Modular)

```
┌─────────────────────────────────────┐
│      AuthContext (Facade)           │
│  Camada de compatibilidade          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐    ┌─────▼──────┐
   │Session │    │UserActions │
   │Context │    │  Context   │
   └────────┘    └────────────┘
       │                │
   ┌───▼─────────────────▼────┐
   │ usePasswordRecovery Hook  │
   │  (Estado temporário de UI)│
   └───────────────────────────┘
```

**Benefícios:**
- ✅ Cada contexto tem uma única responsabilidade
- ✅ Componentes só re-renderizam quando seus dados específicos mudam
- ✅ Mais fácil de testar (2-4 mocks por contexto)
- ✅ Extensível sem modificar contextos existentes
- ✅ Zero breaking changes (compatível com código anterior)

### Lições Aprendidas

1. **Separação de Responsabilidades**: Mantenha estado temporário de UI (como fluxo de recuperação) separado do estado global
2. **Padrão Facade**: Mantenha compatibilidade retroativa enquanto refatora
3. **Evento INITIAL_SESSION**: Use o evento INITIAL_SESSION do Supabase ao invés de checkInitialSession paralelo para evitar race conditions
4. **Dependências do useEffect**: Cuidado com dependências de função no useEffect para evitar re-renders desnecessários

## Solucionando Problemas

### "useSession must be used within SessionProvider"

**Causa**: Componente usando `useSession()` está fora da árvore de providers

**Solução**: Envolva sua app com providers em `layout.tsx`:

```tsx
// app/layout.tsx
<AuthProvider>
  <SuaApp />  {/* ✅ Pode usar useAuth/useSession/useUserActions */}
</AuthProvider>
```

### isLoading sempre true

**Causa**: Usando `useAuth().isLoading` que combina ambos contextos

**Solução**: Use hook específico

```tsx
// ❌ Evite (combina loading de todos contextos)
const { isLoading } = useAuth();

// ✅ Use específico
const { isLoading } = useSession(); // Apenas loading de sessão
// ou
const { isLoading } = useUserActions(); // Apenas loading de ações
```

### Token inválido ou expirado na recuperação de senha

**Causa**: Token na URL expirou ou é inválido

**Solução**:
1. Solicite um novo email de reset de senha
2. Use o link dentro de 1 hora
3. Não recarregue a página após clicar no link do email

### Confirmação de email não funciona

**Soluções**:
1. Verifique pasta de spam
2. Verifique templates de email em Supabase Dashboard → Authentication → Email Templates
3. Certifique-se que redirect URLs estão configuradas em Supabase → Authentication → URL Configuration

### "new row violates row-level security policy"

**Causa**: Políticas RLS não configuradas corretamente

**Solução**: Verifique políticas no SQL Editor do Supabase:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Re-execute as migrations se políticas estiverem faltando.

## Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/)
- [Princípios SOLID](https://en.wikipedia.org/wiki/SOLID)
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

## Documentação Adicional

- [**Exemplos de Uso**](../../frontend/docs/USAGE_EXAMPLES.md) - Exemplos práticos de código
- [**Diagramas de Arquitetura**](../../frontend/docs/ARCHITECTURE_DIAGRAMS.md) - Documentação visual
- [**Setup do Supabase**](../setup/SUPABASE.md) - Guia detalhado de configuração
- [**Início Rápido**](../setup/QUICKSTART.pt-BR.md) - Guia de setup de 5 minutos

---

**Construído com sabedoria. Refatorado com coragem. Testado com disciplina.**
