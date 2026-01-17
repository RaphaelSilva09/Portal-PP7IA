# 🏗️ Diagramas de Arquitetura - Sistema de Autenticação

## 📐 Arquitetura em Camadas

```mermaid
graph TB
    subgraph "PRESENTATION LAYER"
        AuthModal[AuthModal.tsx]
        useAuth[useAuth Hook]
    end

    subgraph "APPLICATION LAYER"
        SignUp[SignUpUseCase]
        SignIn[SignInUseCase]
        SignOut[SignOutUseCase]
        GetUser[GetCurrentUserUseCase]
    end

    subgraph "DOMAIN LAYER"
        User[User Entity]
        Errors[Auth Errors]
        IRepo[IAuthRepository Interface]
    end

    subgraph "INFRASTRUCTURE LAYER"
        SupaRepo[SupabaseAuthRepository]
        SupaClient[Supabase Client]
        DI[DI Container]
    end

    AuthModal --> useAuth
    useAuth --> SignUp
    useAuth --> SignIn
    useAuth --> SignOut
    useAuth --> GetUser

    SignUp --> IRepo
    SignIn --> IRepo
    SignOut --> IRepo
    GetUser --> IRepo

    SignUp --> User
    SignIn --> User
    GetUser --> User

    SignUp -.uses.-> Errors
    SignIn -.uses.-> Errors

    IRepo <|.. SupaRepo
    SupaRepo --> SupaClient
    SupaRepo --> User
    SupaRepo --> Errors

    DI --> SignUp
    DI --> SignIn
    DI --> SignOut
    DI --> GetUser
    DI --> SupaRepo

    style AuthModal fill:#e1f5ff
    style useAuth fill:#e1f5ff
    style SignUp fill:#fff4e1
    style SignIn fill:#fff4e1
    style SignOut fill:#fff4e1
    style GetUser fill:#fff4e1
    style User fill:#e8f5e9
    style Errors fill:#e8f5e9
    style IRepo fill:#e8f5e9
    style SupaRepo fill:#fce4ec
    style SupaClient fill:#fce4ec
    style DI fill:#fce4ec
```

## 🔄 Fluxo de Cadastro (SignUp)

```mermaid
sequenceDiagram
    actor User
    participant Modal as AuthModal
    participant Hook as useAuth
    participant UC as SignUpUseCase
    participant Repo as SupabaseAuthRepository
    participant Supa as Supabase
    participant DB as Database

    User->>Modal: Preenche formulário
    User->>Modal: Clica "Cadastrar"
    Modal->>Modal: Valida campos
    Modal->>Hook: signUp(data)
    Hook->>UC: execute(input)
    UC->>UC: Valida entrada
    UC->>Repo: signUp(params)
    Repo->>Supa: auth.signUp()
    Supa->>DB: INSERT INTO auth.users
    DB-->>Supa: Success
    Supa-->>Repo: authData
    Repo->>Supa: from('users').insert()
    Supa->>DB: INSERT INTO users
    DB-->>Supa: Success
    Supa-->>Repo: userData
    Repo->>Repo: mapToUser()
    Repo-->>UC: AuthResult
    UC-->>Hook: SignUpOutput
    Hook->>Hook: setUser(user)
    Hook-->>Modal: Success
    Modal->>Modal: onClose()
```

## 🔐 Fluxo de Login (SignIn)

```mermaid
sequenceDiagram
    actor User
    participant Modal as AuthModal
    participant Hook as useAuth
    participant UC as SignInUseCase
    participant Repo as SupabaseAuthRepository
    participant Supa as Supabase
    participant DB as Database

    User->>Modal: Preenche email/senha
    User->>Modal: Clica "Entrar"
    Modal->>Modal: Valida campos
    Modal->>Hook: signIn(data)
    Hook->>UC: execute(input)
    UC->>UC: Valida entrada
    UC->>Repo: signIn(params)
    Repo->>Supa: auth.signInWithPassword()
    Supa->>DB: Valida credenciais

    alt Credenciais válidas
        DB-->>Supa: User + Session
        Supa-->>Repo: authData
        Repo->>Supa: from('users').select()
        Supa->>DB: SELECT FROM users
        DB-->>Supa: userData
        Supa-->>Repo: userData
        Repo->>Repo: mapToUser()
        Repo-->>UC: AuthResult
        UC-->>Hook: SignInOutput
        Hook->>Hook: setUser(user)
        Hook-->>Modal: Success
        Modal->>Modal: onClose()
    else Credenciais inválidas
        DB-->>Supa: Error
        Supa-->>Repo: AuthError
        Repo->>Repo: mapSupabaseError()
        Repo-->>UC: InvalidCredentialsError
        UC-->>Hook: Error
        Hook->>Hook: setError(message)
        Hook-->>Modal: Error
        Modal->>Modal: Exibe mensagem
    end
```

## 🎯 Princípio de Dependência (DIP)

```mermaid
graph LR
    subgraph "High Level"
        UC[Use Cases]
    end

    subgraph "Abstraction"
        IRepo[IAuthRepository]
    end

    subgraph "Low Level"
        Impl[SupabaseAuthRepository]
    end

    UC -->|depends on| IRepo
    Impl -.implements.-> IRepo

    style UC fill:#fff4e1
    style IRepo fill:#e8f5e9
    style Impl fill:#fce4ec
```

**Regra**: Use Cases (alto nível) dependem de abstração (interface), não de implementação (Supabase).

## 🧩 Dependency Injection

```mermaid
graph TB
    Container[DI Container]

    Container -->|creates| Repo[SupabaseAuthRepository]
    Container -->|injects repo into| SignUp[SignUpUseCase]
    Container -->|injects repo into| SignIn[SignInUseCase]
    Container -->|injects repo into| SignOut[SignOutUseCase]
    Container -->|injects repo into| GetUser[GetCurrentUserUseCase]

    Hook[useAuth Hook] -->|gets instances from| Container

    style Container fill:#fce4ec
    style Repo fill:#fce4ec
    style SignUp fill:#fff4e1
    style SignIn fill:#fff4e1
    style SignOut fill:#fff4e1
    style GetUser fill:#fff4e1
    style Hook fill:#e1f5ff
```

## 🔒 Row Level Security (RLS)

```mermaid
graph TB
    User[User Request]
    Supa[Supabase]
    RLS[RLS Engine]
    DB[(Database)]

    User -->|SELECT * FROM users| Supa
    Supa -->|Check JWT| RLS

    RLS -->|Policy Check| Policy{Policy: auth.uid() = id?}

    Policy -->|Yes| Allow[Return user's data]
    Policy -->|No| Deny[Return empty]

    Allow --> DB
    Deny -.x.-> DB

    DB --> User

    style User fill:#e1f5ff
    style Supa fill:#fce4ec
    style RLS fill:#fff4e1
    style Policy fill:#e8f5e9
    style Allow fill:#c8e6c9
    style Deny fill:#ffcdd2
```

## 📊 Estrutura de Dados

```mermaid
erDiagram
    AUTH_USERS ||--|| USERS : "has profile"

    AUTH_USERS {
        uuid id PK
        string email
        string encrypted_password
        timestamp created_at
    }

    USERS {
        uuid id PK,FK
        string email
        string nome
        string celular
        boolean accept_email_updates
        boolean accept_whatsapp_updates
        timestamp created_at
        timestamp updated_at
    }
```

## 🎨 Fluxo de Validação

```mermaid
graph TB
    Input[User Input]

    Input --> V1[Frontend Validation]
    V1 -->|Invalid| UI1[Show Error]
    V1 -->|Valid| V2[Domain Validation]

    V2 -->|Invalid| UI2[Show Error]
    V2 -->|Valid| V3[Database Constraints]

    V3 -->|Invalid| UI3[Show Error]
    V3 -->|Valid| Success[Success]

    style Input fill:#e1f5ff
    style V1 fill:#e1f5ff
    style V2 fill:#e8f5e9
    style V3 fill:#fce4ec
    style UI1 fill:#ffcdd2
    style UI2 fill:#ffcdd2
    style UI3 fill:#ffcdd2
    style Success fill:#c8e6c9
```

**3 Camadas de Validação:**

1. **Frontend**: UX imediata
2. **Domain**: Regras de negócio
3. **Database**: Integridade final

## 🔄 Estado da Aplicação

```mermaid
stateDiagram-v2
    [*] --> NotAuthenticated

    NotAuthenticated --> Authenticating : signIn() / signUp()
    Authenticating --> Authenticated : Success
    Authenticating --> NotAuthenticated : Error

    Authenticated --> Authenticating : Refresh Token
    Authenticated --> NotAuthenticated : signOut()
    Authenticated --> NotAuthenticated : Token Expired

    NotAuthenticated --> [*]
```

---

## 📖 Legenda

| Cor        | Camada               |
| ---------- | -------------------- |
| 🔵 Azul    | Presentation Layer   |
| 🟡 Amarelo | Application Layer    |
| 🟢 Verde   | Domain Layer         |
| 🔴 Rosa    | Infrastructure Layer |

---

Estes diagramas ajudam a visualizar:

-   ✅ Fluxo de dados entre camadas
-   ✅ Separação de responsabilidades
-   ✅ Princípios SOLID aplicados
-   ✅ Segurança RLS
-   ✅ Padrões de design

**Use estes diagramas para:**

-   Entender a arquitetura
-   Explicar para a equipe
-   Documentar decisões
-   Planejar extensões
