# 🚀 Sistema de Autenticação - Portal PP7IA

Sistema de autenticação robusto seguindo **Clean Architecture**, **Domain-Driven Design (DDD)** e **SOLID principles**.

## ✨ Características

-   ✅ Clean Architecture (4 camadas bem definidas)
-   ✅ Domain-Driven Design (DDD)
-   ✅ SOLID Principles aplicados rigorosamente
-   ✅ Type-safe com TypeScript
-   ✅ Dependency Injection Container
-   ✅ Tratamento de erros robusto
-   ✅ Row Level Security (RLS) no Supabase
-   ✅ Validações em múltiplas camadas
-   ✅ Formulários com feedback visual

## 🏛️ Arquitetura

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

## 📁 Estrutura de Pastas

```
portal/frontend/
│
├── domain/                          # 🎯 CAMADA DE DOMÍNIO
│   ├── entities/
│   │   └── User.ts                 # Entidade User (DDD)
│   ├── errors/
│   │   └── AuthError.ts            # Erros de domínio
│   ├── repositories/
│   │   └── IAuthRepository.ts      # Interface (DIP)
│   └── index.ts
│
├── application/                     # 🔄 CAMADA DE APLICAÇÃO
│   ├── usecases/
│   │   ├── SignUpUseCase.ts        # Caso de uso: Cadastro
│   │   ├── SignInUseCase.ts        # Caso de uso: Login
│   │   ├── SignOutUseCase.ts       # Caso de uso: Logout
│   │   └── GetCurrentUserUseCase.ts # Caso de uso: Usuário atual
│   └── index.ts
│
├── infrastructure/                  # 🔧 CAMADA DE INFRAESTRUTURA
│   ├── config/
│   │   └── supabase.ts             # Cliente Supabase
│   ├── repositories/
│   │   └── SupabaseAuthRepository.ts # Implementação concreta
│   ├── di/
│   │   └── container.ts            # Dependency Injection
│   └── index.ts
│
├── presentation/                    # 🎨 CAMADA DE APRESENTAÇÃO
│   ├── hooks/
│   │   └── useAuth.ts              # Hook React
│   └── index.ts
│
├── components/
│   └── AuthModal.tsx               # Componente UI
│
└── docs/
    └── AUTHENTICATION.md           # Documentação completa
```

## 🚦 Quick Start

### 1. Configuração Inicial

```bash
# Instalar dependências
cd portal/frontend
npm install

# Copiar template de variáveis de ambiente
cp .env.example .env.local
```

### 2. Configurar Supabase

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Executar Migrations

No dashboard do Supabase → SQL Editor:

```sql
-- Execute: portal/supabase/migrations/001_auth_schema.sql
```

### 4. Iniciar Aplicação

```bash
npm run dev
```

## 💡 Uso

### Componente com Hook

```tsx
import { useAuth } from "@/presentation/hooks/useAuth";

function MyComponent() {
    const { signUp, signIn, user, isLoading, error } = useAuth();

    const handleSignUp = async () => {
        await signUp({
            email: "user@example.com",
            password: "senha123",
            nome: "João Silva",
            celular: "(11) 98765-4321",
            acceptEmailUpdates: true,
            acceptWhatsAppUpdates: false,
        });
    };

    if (isLoading) return <p>Carregando...</p>;
    if (error) return <p>Erro: {error}</p>;

    return user ? <p>Olá, {user.nome}!</p> : <button onClick={handleSignUp}>Cadastrar</button>;
}
```

### Modal de Autenticação

```tsx
import AuthModal from "@/components/AuthModal";

<AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} initialMode="signup" />;
```

## 🎯 Princípios Implementados

### Clean Architecture

| Princípio                       | Implementação                     |
| ------------------------------- | --------------------------------- |
| **Independência de Frameworks** | Core não depende de React/Next.js |
| **Testabilidade**               | Cada camada isolada e testável    |
| **Independência de UI**         | Lógica de negócio separada        |
| **Independência de DB**         | Repository pattern com interfaces |
| **Regra de Dependência**        | Sempre aponta para o centro       |

### SOLID

| Princípio                 | Exemplo                             |
| ------------------------- | ----------------------------------- |
| **S**ingle Responsibility | `SignUpUseCase` - apenas cadastro   |
| **O**pen-Closed           | Extensível via novos Use Cases      |
| **L**iskov Substitution   | `IAuthRepository` → implementações  |
| **I**nterface Segregation | Interfaces específicas por contexto |
| **D**ependency Inversion  | Use Cases → Interface ← Repository  |

### DDD

-   **Entities**: `User` com validações de negócio
-   **Use Cases**: Orquestração de regras
-   **Repository Pattern**: Abstração de persistência
-   **Domain Errors**: Erros expressivos do negócio
-   **Ubiquitous Language**: Nomenclatura consistente

## 🔒 Segurança

### Row Level Security (RLS)

```sql
-- Usuários só acessam seus próprios dados
CREATE POLICY "Users can read own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);
```

### Validações em 3 Camadas

1. **Frontend** (UX): Feedback imediato
2. **Domain** (Negócio): Regras de negócio
3. **Database** (Integridade): Constraints e checks

### Tratamento de Erros

```typescript
try {
    await signUp(data);
} catch (error) {
    if (error instanceof UserAlreadyExistsError) {
        // Email já cadastrado
    } else if (error instanceof WeakPasswordError) {
        // Senha fraca
    }
}
```

## 📚 Documentação Completa

Veja [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) para:

-   Arquitetura detalhada
-   Guia de setup passo a passo
-   Exemplos de uso
-   Padrões de código
-   Referências e recursos

## 🧪 Próximos Passos

-   [ ] Implementar testes unitários
-   [ ] Implementar testes de integração
-   [ ] Adicionar recuperação de senha
-   [ ] Implementar refresh token automático
-   [ ] Adicionar autenticação social (Google, GitHub)
-   [ ] Implementar MFA (Multi-Factor Authentication)

## 🤝 Contribuindo

Mantenha os princípios:

1. **Domínio primeiro** - Defina entidades e regras
2. **Use Cases** - Implemente lógica de aplicação
3. **Infraestrutura** - Crie adaptadores necessários
4. **Apresentação** - Conecte UI aos casos de uso
5. **Teste** - Garanta cobertura adequada

## 📖 Referências

-   [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/)
-   [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
-   [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**🏛️ Construído com sabedoria. Refatorado com coragem. Testado com disciplina.**
