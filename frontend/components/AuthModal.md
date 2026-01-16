# AuthModal Component

## 📋 Descrição

Modal de autenticação que alterna entre telas de **Login** e **Cadastro**, seguindo os padrões de design do projeto PP7+IAS Portal.

## 🎯 Funcionalidades

### Modo Cadastro (Signup)
- **Nome Completo** - Campo de texto obrigatório
- **Email** - Campo de email com validação
- **Celular** - Campo com formatação automática (XX) XXXXX-XXXX
- **Senha** - Campo de senha com toggle show/hide (mínimo 6 caracteres)

### Modo Login
- **Email** - Campo de email com validação
- **Senha** - Campo de senha com toggle show/hide

### Recursos
- ✅ Alternância fluida entre Login e Cadastro
- ✅ Validação em tempo real dos campos
- ✅ Formatação automática de telefone
- ✅ Toggle de visibilidade de senha
- ✅ Mensagens de erro contextuais
- ✅ Bloqueio de scroll do body quando aberto
- ✅ Animações suaves (fade-in, scale-in)
- ✅ Design responsivo (mobile-first)
- ✅ Glassmorphism consistente com o projeto
- ✅ Botão de fechar modal

## 🏗️ Arquitetura

### Princípios Aplicados (Clean Code & SOLID)

#### Single Responsibility Principle (SRP)
- Componente focado exclusivamente em autenticação
- Funções pequenas com responsabilidade única
- Separação de validação e submissão

#### Open-Closed Principle (OCP)
- Aberto para extensão via props (`initialMode`)
- Fechado para modificação

#### Side-Effect-Free Functions
- `isValidEmail()` - Valida email sem alterar estado
- `isValidPhone()` - Valida telefone sem alterar estado
- `isValidPassword()` - Valida senha sem alterar estado
- `formatPhone()` - Pure function de formatação

#### Tell, Don't Ask
- `validateForm()` retorna resultado ao invés de modificar estado diretamente
- Componente gerencia seu próprio estado

#### Nomes Reveladores de Intenção
- Variáveis: `isLoginMode`, `showPassword`, `formData`, `errors`
- Funções: `handleInputChange`, `toggleMode`, `validateForm`
- Tipos: `AuthMode`, `FormData`, `FormErrors`

## 📦 Props

```typescript
interface AuthModalProps {
    isOpen: boolean;           // Controla visibilidade do modal
    onClose: () => void;       // Callback ao fechar modal
    initialMode?: "login" | "signup";  // Modo inicial (default: "signup")
}
```

## 🎨 Padrões de Design

### Cores
- **Login**: Gradiente azul-roxo (`from-blue-500 to-purple-600`)
- **Cadastro**: Gradiente verde-esmeralda (`from-green-500 to-emerald-600`)
- **Background**: `bg-bg-primary/95` com backdrop blur
- **Borders**: `border-white/10` com hover `border-white/30`

### Espaçamentos
- Padding modal: `p-6` (24px)
- Gap entre campos: `space-y-4` (16px)
- Border radius: `rounded-3xl` (24px) para modal, `rounded-xl` (12px) para inputs

### Ícones (Lucide React)
- Login: `LogIn`
- Cadastro: `UserPlus`
- Email: `Mail`
- Telefone: `Phone`
- Nome: `User`
- Senha visível: `Eye`
- Senha oculta: `EyeOff`
- Fechar: `X`

## 📱 Uso

### Exemplo Básico

```tsx
import { useState } from "react";
import { AuthModal } from "@/components";

export default function MyPage() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsAuthModalOpen(true)}>
                Entrar
            </button>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)}
                initialMode="signup"  // Opcional: "login" ou "signup"
            />
        </>
    );
}
```

### Exemplo no Header (Implementado)

```tsx
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Header() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <header>
            {/* Botão Desktop */}
            <button onClick={() => setIsAuthModalOpen(true)}>
                Entrar
            </button>

            {/* Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)}
            />
        </header>
    );
}
```

## 🔄 Validações

### Email
- Formato: `user@domain.com`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Celular
- Formato: `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX`
- Mínimo: 10 dígitos
- Máximo: 11 dígitos

### Senha
- Mínimo: 6 caracteres
- Sem requisitos de caracteres especiais (pode ser adicionado)

### Nome
- Obrigatório no modo cadastro
- Não pode ser vazio

## 🎭 Estados do Formulário

```typescript
interface FormData {
    nome: string;      // Apenas no modo cadastro
    email: string;     // Ambos os modos
    celular: string;   // Apenas no modo cadastro
    senha: string;     // Ambos os modos
}

interface FormErrors {
    nome?: string;
    email?: string;
    celular?: string;
    senha?: string;
}
```

## 🚀 Melhorias Futuras

- [ ] Integração com backend/API
- [ ] "Esqueci minha senha"
- [ ] Login social (Google, Facebook, etc.)
- [ ] Força da senha (indicador visual)
- [ ] Requisitos de senha configuráveis
- [ ] Debounce na validação de email
- [ ] Verificação de email duplicado
- [ ] Captcha/reCAPTCHA
- [ ] Confirmação de senha no cadastro
- [ ] Termos de uso e política de privacidade

## 🧪 Testes Sugeridos

```typescript
// Testes unitários sugeridos
describe('AuthModal', () => {
    test('deve abrir no modo cadastro por padrão');
    test('deve alternar entre login e cadastro');
    test('deve validar email corretamente');
    test('deve formatar telefone automaticamente');
    test('deve mostrar/ocultar senha');
    test('deve validar campos obrigatórios');
    test('deve limpar formulário ao trocar de modo');
    test('deve bloquear scroll do body quando aberto');
    test('deve fechar ao clicar no backdrop');
    test('deve fechar ao clicar no botão X');
});
```

## 📚 Referências

- [Clean Code - Robert C. Martin](https://www.amazon.com.br/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Best Practices](https://react.dev/learn)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Desenvolvido seguindo os princípios de Clean Architecture e Clean Code** 🏛️
