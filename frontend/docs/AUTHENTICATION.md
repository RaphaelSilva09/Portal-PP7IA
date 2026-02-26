# Sistema de Autenticação - Portal PP7IA

## 📋 Visão Geral

Sistema de autenticação completo seguindo **Clean Architecture** e **Domain-Driven Design (DDD)**.
### Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                          │
│  (components/, presentation/hooks/)                      │
│  • AuthModal.tsx                                         │
│  • useAuth.ts                                            │
└────────────────┬────────────────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────────────────┐
│                    APPLICATION                           │
│  (application/usecases/)                                 │
│  • SignUpUseCase                                         │
│  • SignInUseCase                                         │
│  • SignOutUseCase                                        │
│  • GetCurrentUserUseCase                                 │
└────────────────┬────────────────────────────────────────┘
                 │ depends on
┌────────────────▼────────────────────────────────────────┐
│                     DOMAIN                               │
│  (domain/)                                               │
│  • entities/User.ts                                      │
│  • errors/AuthError.ts                                   │
│  • repositories/IAuthRepository.ts (interface)           │
└─────────────────────────────────────────────────────────┘
                 ▲
                 │ implements
┌────────────────┴────────────────────────────────────────┐
│                  INFRASTRUCTURE                          │
│  (infrastructure/)                                       │
│  • repositories/SupabaseAuthRepository.ts                │
│  • config/supabase.ts                                    │
│  • di/container.ts                                       │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Setup

### 1. Variáveis de Ambiente

Crie ou edite o arquivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> ⚠️ **Importante**: Nunca commite essas chaves no repositório!

### 2. Configuração do Supabase

#### 2.1 Execute as Migrations

No dashboard do Supabase, vá em **SQL Editor** e execute:

```bash
portal/supabase/migrations/001_auth_schema.sql
```

Ou via CLI:

```bash
cd portal/supabase
supabase db push
```

#### 2.2 Configure o Email Provider

1. Vá em **Authentication > Providers**
2. Configure **Email** provider
3. Personalize templates de email (opcional)

### 3. Instale as Dependências

```bash
cd portal/frontend
npm install
```

### 4. Execute o Projeto

```bash
npm run dev
```

## 🏗️ Estrutura de Pastas

```
portal/frontend/
├── domain/                      # Camada de Domínio (núcleo)
│   ├── entities/
│   │   └── User.ts             # Entidade User (DDD)
│   ├── errors/
│   │   └── AuthError.ts        # Erros de domínio
│   └── repositories/
│       └── IAuthRepository.ts  # Interface do repositório (DIP)
│
├── application/                 # Camada de Aplicação
│   └── usecases/
│       ├── SignUpUseCase.ts
│       ├── SignInUseCase.ts
│       ├── SignOutUseCase.ts
│       └── GetCurrentUserUseCase.ts
│
├── infrastructure/              # Camada de Infraestrutura
│   ├── config/
│   │   └── supabase.ts         # Cliente Supabase
│   ├── repositories/
│   │   └── SupabaseAuthRepository.ts  # Implementação concreta
│   └── di/
│       └── container.ts        # Dependency Injection
│
├── presentation/                # Camada de Apresentação
│   └── hooks/
│       └── useAuth.ts          # Hook React
│
└── components/
    └── AuthModal.tsx           # Componente UI
```

## 📝 Uso

### No Componente React

```tsx
import { useAuth } from "@/presentation/hooks/useAuth";

function MyComponent() {
    const { signUp, signIn, signOut, user, isLoading, error } = useAuth();

    const handleSignUp = async () => {
        try {
            await signUp({
                email: "user@example.com",
                password: "senha123",
                nome: "Nome Completo",
                celular: "(11) 98765-4321",
                acceptEmailUpdates: true,
                acceptWhatsAppUpdates: false,
            });
            // Sucesso!
        } catch (err) {
            // Erro já está em 'error'
        }
    };

    return <div>{user ? <p>Olá, {user.nome}!</p> : <button onClick={handleSignUp}>Cadastrar</button>}</div>;
}
```

### Modal de Autenticação

```tsx
import AuthModal from "@/components/AuthModal";

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsModalOpen(true)}>Login</button>

            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialMode="login" />
        </>
    );
}
```

## 🎯 Princípios Aplicados

### Clean Architecture

-   **Independência de Frameworks**: Core não depende de React ou Supabase
-   **Testabilidade**: Cada camada pode ser testada isoladamente
-   **Independência de UI**: Lógica de negócio separada da apresentação
-   **Independência de Banco**: Fácil trocar Supabase por outro provider

### SOLID

-   **SRP**: Cada classe/função tem uma responsabilidade única
-   **OCP**: Aberto para extensão, fechado para modificação
-   **LSP**: Contratos respeitados (User entity, interfaces)
-   **ISP**: Interfaces segregadas (IAuthRepository)
-   **DIP**: Dependências invertidas (casos de uso → interface ← implementação)

### DDD

-   **Entities**: User entity com validações de negócio
-   **Use Cases**: Orquestração de regras de negócio
-   **Repository Pattern**: Abstração para persistência
-   **Domain Errors**: Erros expressam conceitos do negócio
-   **Ubiquitous Language**: Nomenclatura consistente

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

-   Usuários só podem ler/atualizar seus próprios dados
-   Inserções feitas via `service_role` (servidor)
-   Políticas de segurança aplicadas automaticamente

### Validações

-   **Frontend**: Validação de UX (imediata)
-   **Domain**: Validação de regras de negócio (User entity)
-   **Database**: Constraints e checks (última linha de defesa)

### Tratamento de Erros

```typescript
try {
    await signUp(data);
} catch (error) {
    if (error instanceof UserAlreadyExistsError) {
        // Usuário já existe
    } else if (error instanceof WeakPasswordError) {
        // Senha fraca
    } else {
        // Erro genérico
    }
}
```

## 🧪 Testes (TODO)

```typescript
// Exemplo de teste unitário
describe("SignUpUseCase", () => {
    it("should create user successfully", async () => {
        const mockRepo = new MockAuthRepository();
        const useCase = new SignUpUseCase(mockRepo);

        const result = await useCase.execute({
            email: "test@test.com",
            password: "senha123",
            nome: "Test User",
            celular: "11987654321",
            acceptEmailUpdates: true,
            acceptWhatsAppUpdates: false,
        });

        expect(result.user.email).toBe("test@test.com");
    });
});
```

## 📚 Referências

-   [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/)
-   [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
-   [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

## 🤝 Contribuindo

Ao adicionar novas funcionalidades:

1. **Domínio primeiro**: Defina entidades e interfaces
2. **Use Cases**: Implemente a lógica de aplicação
3. **Infraestrutura**: Crie adaptadores necessários
4. **Apresentação**: Conecte UI aos casos de uso
5. **Testes**: Garanta cobertura adequada

---

**Construído com sabedoria. Refatorado com coragem. Testado com disciplina.**
