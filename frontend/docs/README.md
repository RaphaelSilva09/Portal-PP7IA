# 📚 Frontend Documentation - Portal PP7+IA

Welcome to the frontend documentation! This index helps you navigate through all frontend-specific documentation.

## 📖 Documentation Sections

### 🎨 Development

- [**Design System**](development/DESIGN_SYSTEM.md) - Colors, typography, animations, and UI components

### 🏗️ Architecture

- [**Architecture Diagrams**](ARCHITECTURE_DIAGRAMS.md) - Visual architecture documentation with Mermaid diagrams
- [**Authentication System**](../../docs/architecture/AUTHENTICATION.md) - Complete authentication documentation

### 💻 Code Examples

- [**Usage Examples**](USAGE_EXAMPLES.md) - Practical code examples and recipes

## 🛠️ Tech Stack

- **Framework**: Next.js 16 + React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State**: React Context API
- **Auth**: Supabase Auth
- **Forms**: Custom validation

## 📂 Frontend Structure

```
frontend/
├── app/                       # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles (Design System)
│   └── [feature]/            # Feature pages
│
├── components/                # React components
│   ├── ui/                   # UI primitives
│   └── [Feature]*.tsx        # Feature components
│
├── domain/                    # Domain layer (Clean Architecture)
│   ├── entities/             # Business entities
│   ├── repositories/         # Repository interfaces
│   └── errors/               # Domain errors
│
├── application/               # Application layer
│   └── usecases/             # Use cases
│
├── infrastructure/            # Infrastructure layer
│   ├── config/               # Configuration
│   ├── repositories/         # Repository implementations
│   └── di/                   # Dependency injection
│
├── presentation/              # Presentation layer
│   └── hooks/                # React hooks
│
├── context/                   # React contexts
├── hooks/                     # Custom hooks
├── lib/                       # Utilities
└── public/                    # Static assets
```

## 🎯 Architecture Principles

This frontend follows:

- **Clean Architecture** - 4 layers separation
- **SOLID Principles** - Maintainable code
- **Domain-Driven Design** - Business logic in domain
- **Component Composition** - Reusable components
- **TypeScript Strict** - Full type safety

## 🎨 Design System

The design system is centralized in `app/globals.css` using CSS variables:

- **Colors**: Brand colors, backgrounds, text colors
- **Typography**: Inter font family with multiple weights
- **Animations**: Predefined animations and transitions
- **Glassmorphism**: Translucent card styles
- **Gradients**: Brand gradients

> **Full documentation**: [Design System](development/DESIGN_SYSTEM.md)

## 🚀 Quick Start

### Development

```bash
cd frontend
pnpm install
pnpm run dev
```

### Build

```bash
pnpm run build
pnpm run start
```

### Lint

```bash
pnpm run lint
```

## 📝 Component Guidelines

### File Naming

- Components: `PascalCase.tsx` (e.g., `AuthModal.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `formatters.ts`)

### Component Structure

```tsx
// 1. Imports
import { useState } from "react";
import { useAuth } from "@/presentation/hooks/useAuth";

// 2. Types/Interfaces
interface MyComponentProps {
    title: string;
    onClose: () => void;
}

// 3. Component
export default function MyComponent({ title, onClose }: MyComponentProps) {
    // 4. Hooks
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // 5. Handlers
    const handleClick = () => {
        setIsOpen(true);
    };

    // 6. Render
    return (
        <div>
            <h1>{title}</h1>
            <button onClick={handleClick}>Open</button>
        </div>
    );
}
```

### Styling

Use Tailwind CSS classes:

```tsx
// ✅ Good: Use Tailwind utilities
<div className="bg-bg-primary text-text-primary p-4 rounded-lg">
    <h1 className="text-2xl font-bold">Title</h1>
</div>

// ❌ Avoid: Inline styles
<div style={{ background: '#111', padding: '16px' }}>
```

## 🔗 Related Documentation

### General

- [**Main Documentation Index**](../../docs/README.md)
- [**Getting Started**](../../docs/00-GETTING-STARTED.md)
- [**Quick Start**](../../docs/setup/QUICKSTART.md)

### Setup

- [**Supabase Setup**](../../docs/setup/SUPABASE.md)
- [**Admin Panel Setup**](../../docs/setup/ADMIN_PANEL.md)

## 🤝 Contributing

When contributing to the frontend:

1. Follow the architecture layers
2. Use the Design System variables
3. Write TypeScript with strict mode
4. Create reusable components
5. Test your changes (`pnpm run build`)

## 📖 Detailed Documentation

- [Architecture Diagrams](ARCHITECTURE_DIAGRAMS.md) - Visual architecture
- [Usage Examples](USAGE_EXAMPLES.md) - Code recipes
- [Design System](development/DESIGN_SYSTEM.md) - UI guidelines
- [Authentication](../../docs/architecture/AUTHENTICATION.md) - Auth system

---

**Last Updated**: February 2026  
**Repository**: [Portal-PP7IA](https://github.com/RaphaelSilva09/Portal-PP7IA)
