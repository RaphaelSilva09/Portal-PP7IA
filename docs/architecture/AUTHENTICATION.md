# 🔐 Authentication System - Portal PP7+IA

> **[Versão em Português](AUTHENTICATION.pt-BR.md)** | English Version

Complete documentation for the Portal PP7+IA authentication system built with **Clean Architecture**, **Domain-Driven Design (DDD)**, and **SOLID principles**.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Setup](#quick-setup)
- [Folder Structure](#folder-structure)
- [Core Concepts](#core-concepts)
- [Usage](#usage)
- [Security](#security)
- [Architecture Evolution](#architecture-evolution)
- [Troubleshooting](#troubleshooting)
- [References](#references)

## Overview

The authentication system provides:

- ✅ User registration and login
- ✅ Email verification
- ✅ Password recovery
- ✅ Session management
- ✅ User profile management
- ✅ Account deletion
- ✅ Row Level Security (RLS)
- ✅ Clean Architecture (4 layers)
- ✅ Type-safe with TypeScript

### Tech Stack

- **Frontend**: React 19 + Next.js 16
- **Auth Provider**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Language**: TypeScript

## Architecture

The system follows **Clean Architecture** with clear separation of concerns:

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

### Layer Responsibilities

| Layer | Responsibility | Examples |
|-------|----------------|----------|
| **Domain** | Business entities and rules | `User` entity, `IAuthRepository` interface |
| **Application** | Use cases and business logic | `SignUpUseCase`, `SignInUseCase` |
| **Infrastructure** | External services and implementations | `SupabaseAuthRepository`, DB client |
| **Presentation** | UI components and hooks | `AuthModal`, `useAuth` hook |

## Quick Setup

> **Detailed instructions**: [Supabase Setup Guide](../setup/SUPABASE.md) | [Quick Start](../setup/QUICKSTART.md)

### 1. Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2 Run Migrations

In Supabase Dashboard → SQL Editor, execute:

```bash
supabase/migrations/001_auth_schema.sql
supabase/migrations/002_auto_create_profile.sql
```

### 3. Start Application

```bash
cd frontend
npm run dev
```

## Folder Structure

```
frontend/
├── domain/                          # 🎯 DOMAIN LAYER
│   ├── entities/
│   │   └── User.ts                 # User entity (DDD)
│   ├── errors/
│   │   └── AuthError.ts            # Domain errors
│   ├── repositories/
│   │   └── IAuthRepository.ts      # Repository interface (DIP)
│   └── index.ts
│
├── application/                     # 🔄 APPLICATION LAYER
│   ├── usecases/
│   │   ├── SignUpUseCase.ts        # Registration use case
│   │   ├── SignInUseCase.ts        # Login use case
│   │   ├── SignOutUseCase.ts       # Logout use case
│   │   └── GetCurrentUserUseCase.ts # Get current user
│   └── index.ts
│
├── infrastructure/                  # 🔧 INFRASTRUCTURE LAYER
│   ├── config/
│   │   └── supabase.ts             # Supabase client
│   ├── repositories/
│   │   └── SupabaseAuthRepository.ts # Concrete implementation
│   ├── di/
│   │   └── container.ts            # Dependency Injection
│   └── index.ts
│
├── presentation/                    # 🎨 PRESENTATION LAYER
│   ├── hooks/
│   │   └── useAuth.ts              # React hook
│   └── index.ts
│
├── context/                         # React Contexts
│   ├── SessionContext.tsx          # Session state management
│   ├── UserActionsContext.tsx      # User actions (profile, password)
│   └── AuthContext.tsx             # Facade (backward compatibility)
│
├── components/
│   └── AuthModal.tsx               # UI component
│
└── hooks/
    └── usePasswordRecovery.ts      # Password recovery hook
```

## Core Concepts

### Clean Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| **Independence of Frameworks** | Core doesn't depend on React/Next.js |
| **Testability** | Each layer isolated and testable |
| **Independence of UI** | Business logic separate from presentation |
| **Independence of Database** | Repository pattern with interfaces |
| **Dependency Rule** | Dependencies always point inward |

### SOLID Principles

| Principle | Example |
|-----------|---------|
| **S**ingle Responsibility | `SignUpUseCase` - only handles registration |
| **O**pen-Closed | Extensible via new Use Cases |
| **L**iskov Substitution | `IAuthRepository` → implementations |
| **I**nterface Segregation | Specific interfaces per context |
| **D**ependency Inversion | Use Cases → Interface ← Repository |

### Domain-Driven Design

- **Entities**: `User` entity with business validations
- **Use Cases**: Orchestrate business rules
- **Repository Pattern**: Abstract persistence
- **Domain Errors**: Expressive business errors
- **Ubiquitous Language**: Consistent naming

## Usage

### Basic Authentication

```tsx
import { useAuth } from "@/presentation/hooks/useAuth";

function MyComponent() {
    const { signUp, signIn, signOut, user, isLoading, error } = useAuth();

    const handleSignUp = async () => {
        try {
            await signUp({
                email: "user@example.com",
                password: "SecurePass123!",
                nome: "John Doe",
                celular: "(11) 98765-4321",
                acceptEmailUpdates: true,
                acceptWhatsAppUpdates: false,
            });
            // Success! User created
        } catch (err) {
            // Error handled automatically
            console.error(error);
        }
    };

    if (isLoading) return <p>Loading...</p>;
    
    return user ? (
        <div>
            <p>Welcome, {user.nome}!</p>
            <button onClick={signOut}>Logout</button>
        </div>
    ) : (
        <button onClick={handleSignUp}>Sign Up</button>
    );
}
```

### Using Session Context (Optimized)

For components that only need session data:

```tsx
import { useSession } from "@/context/SessionContext";

function UserProfile() {
    const { user, isLoading } = useSession(); // Only re-renders on session changes
    
    if (isLoading) return <p>Loading...</p>;
    if (!user) return <p>Please login</p>;
    
    return <h1>Hello, {user.nome}!</h1>;
}
```

### Using User Actions Context

For components that need to update user data:

```tsx
import { useUserActions } from "@/context/UserActionsContext";

function ProfileSettings() {
    const { updateEmail, updatePassword, isLoading, error } = useUserActions();
    
    const handleUpdateEmail = async (newEmail: string) => {
        await updateEmail(newEmail);
    };
    
    return (
        <div>
            {error && <p>Error: {error}</p>}
            <button onClick={() => handleUpdateEmail("new@email.com")} disabled={isLoading}>
                Update Email
            </button>
        </div>
    );
}
```

### Password Recovery

```tsx
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";

function ResetPasswordPage() {
    const { resetPassword, recoveryStatus, isLoading, recoveryError } = usePasswordRecovery();
    
    const handleReset = async () => {
        const success = await resetPassword("NewSecurePass123!", "NewSecurePass123!");
        
        if (success) {
            // Redirect to login
            router.push("/");
        }
    };
    
    if (recoveryStatus === "loading") return <p>Validating token...</p>;
    if (recoveryStatus === "error") return <p>Invalid or expired token</p>;
    
    return <button onClick={handleReset} disabled={isLoading}>Reset Password</button>;
}
```

### Authentication Modal

```tsx
import AuthModal from "@/components/AuthModal";

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsModalOpen(true)}>Login</button>
            
            <AuthModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialMode="login"  // or "signup"
            />
        </>
    );
}
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

```sql
-- Users can only read their own data
CREATE POLICY "Users can read own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);
```

### Multi-Layer Validation

1. **Frontend** (UX): Immediate feedback
2. **Domain** (Business): Entity validations
3. **Database** (Integrity): Constraints and RLS

### Error Handling

```typescript
import { UserAlreadyExistsError, WeakPasswordError } from "@/domain/errors/AuthError";

try {
    await signUp(userData);
} catch (error) {
    if (error instanceof UserAlreadyExistsError) {
        // Handle duplicate email
    } else if (error instanceof WeakPasswordError) {
        // Handle weak password
    } else {
        // Generic error
    }
}
```

## Architecture Evolution

### From God Object to Modular Contexts

The authentication system was refactored from a single "God Object" (AuthContext with 9 responsibilities) to a modular architecture:

#### Before (Anti-pattern)

```typescript
// AuthContext - Single context with ALL responsibilities
interface AuthContextType {
    user, isLoading, error;                    // Session state
    emailConfirmationRequired;                 // Email confirmation
    isRecoveryReady;                           // Password recovery
    signUp, signIn, signOut;                   // Auth operations
    updateEmail, updatePassword, deleteAccount; // User operations
    sendPasswordReset, resetPasswordWithToken;  // Recovery operations
}
```

**Problems:**
- ❌ Violates SRP (Single Responsibility Principle)
- ❌ Forces all Page re-renders even if only one value changes
- ❌ Difficult to test (9 mocks needed)
- ❌ Hard to extend without breaking existing code

#### After (Modular)

```
┌─────────────────────────────────────┐
│      AuthContext (Facade)           │
│  Backward compatibility layer       │
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
   │  (Temporary UI state)     │
   └───────────────────────────┘
```

**Benefits:**
- ✅ Each context has a single responsibility
- ✅ Components only re-render when their specific data changes
- ✅ Easier to test (2-4 mocks per context)
- ✅ Extensible without modifying existing contexts
- ✅ Zero breaking changes (backward compatible)

### Key Lessons Learned

1. **Separation of Concerns**: Keep temporary UI state (like recovery flow) separate from global state
2. **Facade Pattern**: Maintain backward compatibility while refactoring
3. **INITIAL_SESSION Event**: Use Supabase's INITIAL_SESSION event instead of parallel checkInitialSession to avoid race conditions
4. **useEffect Dependencies**: Be careful with function dependencies in useEffect to avoid unnecessary re-renders

## Troubleshooting

### "useSession must be used within SessionProvider"

**Cause**: Component using `useSession()` is outside the provider tree

**Solution**: Wrap your app with providers in `layout.tsx`:

```tsx
// app/layout.tsx
<AuthProvider>
  <YourApp />  {/* ✅ Can use useAuth/useSession/useUserActions */}
</AuthProvider>
```

### isLoading always true

**Cause**: Using `useAuth().isLoading` which combines both contexts

**Solution**: Use specific hook

```tsx
// ❌ Avoid (combines loading from all contexts)
const { isLoading } = useAuth();

// ✅ Use specific
const { isLoading } = useSession(); // Only session loading
// or
const { isLoading } = useUserActions(); // Only actions loading
```

### Invalid or expired token in password recovery

**Cause**: Token in URL has expired or is invalid

**Solution**:
1. Request a new password reset email
2. Use the link within 1 hour
3. Don't reload the page after clicking the email link

### Email confirmation not working

**Solutions**:
1. Check spam folder
2. Verify email templates in Supabase Dashboard → Authentication → Email Templates
3. Ensure redirect URLs are configured in Supabase → Authentication → URL Configuration

### "new row violates row-level security policy"

**Cause**: RLS policies not properly configured

**Solution**: Verify policies in Supabase SQL Editor:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Re-run migrations if policies are missing.

## References

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

## Additional Documentation

- [**Usage Examples**](../../frontend/docs/USAGE_EXAMPLES.md) - Practical code examples
- [**Architecture Diagrams**](../../frontend/docs/ARCHITECTURE_DIAGRAMS.md) - Visual documentation
- [**Supabase Setup**](../setup/SUPABASE.md) - Detailed configuration guide
- [**Quick Start**](../setup/QUICKSTART.md) - 5-minute setup guide

---

**Built with wisdom. Refactored with courage. Tested with discipline.**
