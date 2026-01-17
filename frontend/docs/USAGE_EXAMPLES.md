# 💡 Exemplos Práticos de Uso

Este documento contém exemplos práticos de como usar o sistema de autenticação em diferentes cenários.

## 📋 Índice

-   [Cadastro de Usuário](#cadastro-de-usuário)
-   [Login de Usuário](#login-de-usuário)
-   [Verificar Usuário Autenticado](#verificar-usuário-autenticado)
-   [Logout](#logout)
-   [Proteção de Rotas](#proteção-de-rotas)
-   [Exibir Dados do Usuário](#exibir-dados-do-usuário)
-   [Tratamento de Erros](#tratamento-de-erros)

---

## Cadastro de Usuário

### Exemplo 1: Componente Simples

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useState } from "react";

export function SignUpForm() {
    const { signUp, isLoading, error } = useAuth();
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        celular: "",
        senha: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await signUp({
                nome: formData.nome,
                email: formData.email,
                celular: formData.celular,
                password: formData.senha,
                acceptEmailUpdates: true,
                acceptWhatsAppUpdates: false,
            });

            alert("Cadastro realizado com sucesso!");
        } catch (err) {
            // Erro já está disponível em 'error'
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nome"
                value={formData.nome}
                onChange={e => setFormData({ ...formData, nome: e.target.value })}
            />
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <input
                type="tel"
                placeholder="Celular"
                value={formData.celular}
                onChange={e => setFormData({ ...formData, celular: e.target.value })}
            />
            <input
                type="password"
                placeholder="Senha"
                value={formData.senha}
                onChange={e => setFormData({ ...formData, senha: e.target.value })}
            />

            {error && <p className="text-red-500">{error}</p>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar"}
            </button>
        </form>
    );
}
```

### Exemplo 2: Com Validação Personalizada

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { UserAlreadyExistsError, WeakPasswordError } from "@/domain";

export function SignUpFormAdvanced() {
    const { signUp, isLoading, error, clearError } = useAuth();

    const handleSubmit = async (data: FormData) => {
        clearError();

        try {
            await signUp({
                nome: data.nome,
                email: data.email,
                celular: data.celular,
                password: data.senha,
                acceptEmailUpdates: data.acceptEmail,
                acceptWhatsAppUpdates: data.acceptWhatsApp,
            });

            // Redirecionar ou mostrar sucesso
            window.location.href = "/dashboard";
        } catch (err) {
            if (err instanceof UserAlreadyExistsError) {
                alert("Este email já está cadastrado. Tente fazer login.");
            } else if (err instanceof WeakPasswordError) {
                alert("Escolha uma senha mais forte (mínimo 6 caracteres).");
            } else {
                alert("Erro ao cadastrar. Tente novamente.");
            }
        }
    };

    // ... resto do componente
}
```

---

## Login de Usuário

### Exemplo 1: Login Básico

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";

export function LoginForm() {
    const { signIn, isLoading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await signIn({ email, password: senha });
            window.location.href = "/dashboard";
        } catch (err) {
            // Erro exibido automaticamente via 'error'
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha" />

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
            </button>
        </form>
    );
}
```

### Exemplo 2: Login com Redirecionamento

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useRouter } from "next/navigation";

export function LoginPage() {
    const { signIn, isLoading } = useAuth();
    const router = useRouter();

    const handleLogin = async (email: string, password: string) => {
        try {
            await signIn({ email, password });
            router.push("/dashboard");
        } catch (error) {
            // Tratado pelo hook
        }
    };

    // ... resto do componente
}
```

---

## Verificar Usuário Autenticado

### Exemplo 1: Componente de Perfil

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useEffect } from "react";

export function UserProfile() {
    const { user, getCurrentUser, isLoading } = useAuth();

    useEffect(() => {
        getCurrentUser();
    }, []);

    if (isLoading) {
        return <div>Carregando...</div>;
    }

    if (!user) {
        return <div>Você não está autenticado.</div>;
    }

    return (
        <div>
            <h1>Bem-vindo, {user.nome}!</h1>
            <p>Email: {user.email}</p>
            <p>Celular: {user.celular}</p>
            <p>Membro desde: {user.createdAt.toLocaleDateString()}</p>
        </div>
    );
}
```

### Exemplo 2: Server Component (Next.js)

```tsx
import { cookies } from "next/headers";
import { createClient } from "@/infrastructure/config/supabase";

export default async function ProfilePage() {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Buscar dados completos
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();

    return (
        <div>
            <h1>Olá, {profile.nome}</h1>
        </div>
    );
}
```

---

## Logout

### Exemplo 1: Botão de Logout

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const { signOut, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            alert("Erro ao sair");
        }
    };

    return (
        <button onClick={handleLogout} disabled={isLoading}>
            {isLoading ? "Saindo..." : "Sair"}
        </button>
    );
}
```

---

## Proteção de Rotas

### Exemplo 1: HOC para Proteção

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
    return function ProtectedComponent(props: P) {
        const { user, getCurrentUser, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            getCurrentUser();
        }, []);

        useEffect(() => {
            if (!isLoading && !user) {
                router.push("/login");
            }
        }, [user, isLoading, router]);

        if (isLoading) {
            return <div>Carregando...</div>;
        }

        if (!user) {
            return null;
        }

        return <Component {...props} />;
    };
}

// Uso:
const ProtectedDashboard = withAuth(Dashboard);
```

### Exemplo 2: Middleware (Next.js)

```typescript
// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Proteger rotas /dashboard/*
    if (req.nextUrl.pathname.startsWith("/dashboard") && !session) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return res;
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
```

---

## Exibir Dados do Usuário

### Exemplo 1: Avatar e Nome

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";

export function UserAvatar() {
    const { user } = useAuth();

    if (!user) return null;

    const initials = user.nome
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                {initials}
            </div>
            <span>{user.nome}</span>
        </div>
    );
}
```

### Exemplo 2: Menu Dropdown

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useState } from "react";

export function UserMenu() {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)}>{user.nome}</button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded">
                    <div className="p-4 border-b">
                        <p className="font-bold">{user.nome}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button onClick={() => signOut()} className="w-full text-left p-4 hover:bg-gray-100">
                        Sair
                    </button>
                </div>
            )}
        </div>
    );
}
```

---

## Tratamento de Erros

### Exemplo 1: Toast de Erro

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export function AuthComponent() {
    const { signIn, error, clearError } = useAuth();

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    // ... resto do componente
}
```

### Exemplo 2: Tratamento Específico

```tsx
"use client";

import { useAuth } from "@/presentation/hooks/useAuth";
import { InvalidCredentialsError, UserAlreadyExistsError, NetworkError } from "@/domain";

export function SmartAuthForm() {
    const { signUp, signIn } = useAuth();

    const handleAuth = async (mode: "login" | "signup", data: any) => {
        try {
            if (mode === "login") {
                await signIn(data);
            } else {
                await signUp(data);
            }
        } catch (err) {
            if (err instanceof InvalidCredentialsError) {
                showError("Email ou senha incorretos");
            } else if (err instanceof UserAlreadyExistsError) {
                showError("Este email já está cadastrado");
                suggestLogin();
            } else if (err instanceof NetworkError) {
                showError("Sem conexão. Verifique sua internet");
                retryAfterDelay();
            } else {
                showError("Erro inesperado. Tente novamente");
            }
        }
    };
}
```

---

## 🎯 Dicas e Boas Práticas

### ✅ DO (Faça)

```tsx
// ✅ Use o hook useAuth
const { signIn, user } = useAuth();

// ✅ Verifique loading antes de acessar user
if (isLoading) return <Loading />;
if (!user) return <Login />;

// ✅ Trate erros específicos
catch (err) {
    if (err instanceof UserAlreadyExistsError) {
        // ...
    }
}

// ✅ Limpe erros quando necessário
clearError();
```

### ❌ DON'T (Não faça)

```tsx
// ❌ Não importe diretamente do repositório
import { SupabaseAuthRepository } from "@/infrastructure";

// ❌ Não ignore erros
try {
    await signIn(data);
} catch (err) {
    // 🔴 Vazio - ruim!
}

// ❌ Não armazene senha em estado
const [password, setPassword] = useState("");
localStorage.setItem("password", password); // 🔴 NUNCA!

// ❌ Não exponha service_role_key no frontend
const supabase = createClient(url, SERVICE_ROLE_KEY); // 🔴 PERIGO!
```

---

## 📚 Mais Recursos

-   [Documentação Completa](./AUTHENTICATION.md)
-   [Guia de Setup](./SUPABASE_SETUP.md)
-   [Diagramas de Arquitetura](./ARCHITECTURE_DIAGRAMS.md)

---

**💡 Dica**: Use estes exemplos como ponto de partida e adapte conforme suas necessidades!
