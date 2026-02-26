# 🚀 Getting Started - Portal PP7+IA

> **[Versão em Português](00-PRIMEIROS-PASSOS.md)** | English Version

Welcome! This guide will help you get started with the Portal PP7+IA project.

## 📋 Table of Contents

- [What is Portal PP7+IA?](#what-is-portal-pp7ia)
- [Prerequisites](#prerequisites)
- [Quick Setup](#quick-setup)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Next Steps](#next-steps)

## What is Portal PP7+IA?

Portal PP7+IA is a collaborative web platform for sharing content about Artificial Intelligence, including:

- 📚 Content library and mini-books
- 📧 Weekly newsletters
- 👥 Author profiles and timelines
- 🎓 Educational materials
- 🔐 User authentication and management

### Key Features

- **Authentication**: Secure user authentication with Supabase
- **Content Management**: Admin panel for managing content
- **Responsive Design**: Glassmorphism design system with Tailwind CSS
- **Clean Architecture**: Following SOLID principles and DDD

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **A code editor** (VS Code recommended)
- **Supabase Account** (free) - [Sign up](https://supabase.com)

### Optional

- **Supabase CLI** - For running migrations locally
- **Vercel Account** - For deployment

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
cd Portal-PP7IA
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create `.env.local` in the `frontend/` directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Need help?** See [Supabase Setup Guide](setup/SUPABASE.md)

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Set Up Supabase (Database)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to **SQL Editor** and run migrations from `supabase/migrations/`
4. Configure authentication settings

> **Detailed instructions**: [Supabase Setup Guide](setup/SUPABASE.md)

## Project Structure

```
Portal-PP7IA/
├── docs/                           # Documentation (you are here)
│   ├── setup/                     # Setup guides
│   ├── architecture/              # Architecture docs
│   └── README.md                  # Documentation index
│
├── frontend/                       # Next.js application
│   ├── app/                       # Pages and API routes
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   ├── api/                  # API routes
│   │   └── [feature]/            # Feature pages
│   │
│   ├── components/                # React components
│   │   ├── ui/                   # UI components (buttons, cards, etc.)
│   │   └── [Feature]*.tsx        # Feature components
│   │
│   ├── domain/                    # Domain layer (Clean Architecture)
│   │   ├── entities/             # Business entities
│   │   ├── repositories/         # Repository interfaces
│   │   └── errors/               # Domain errors
│   │
│   ├── application/               # Application layer
│   │   └── usecases/             # Use cases (business logic)
│   │
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── config/               # Configuration (Supabase, etc.)
│   │   ├── repositories/         # Repository implementations
│   │   └── di/                   # Dependency injection
│   │
│   ├── presentation/              # Presentation layer
│   │   └── hooks/                # React hooks
│   │
│   ├── context/                   # React contexts
│   ├── lib/                       # Utilities
│   ├── public/                    # Static assets
│   └── docs/                      # Frontend-specific docs
│
└── supabase/                       # Supabase configuration
    ├── migrations/                # SQL migrations
    └── config.toml                # Supabase config
```

## Architecture Overview

This project follows **Clean Architecture** principles:

```
┌─────────────────────────────────────┐
│        PRESENTATION                 │
│   (Components, Hooks, Context)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        APPLICATION                   │
│   (Use Cases, Business Logic)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          DOMAIN                      │
│   (Entities, Interfaces, Errors)    │
└─────────────────────────────────────┘
               ▲
               │
┌──────────────┴──────────────────────┐
│      INFRASTRUCTURE                  │
│   (Supabase, External Services)     │
└─────────────────────────────────────┘
```

### Key Principles

- **SOLID Principles** - Maintainable and extensible code
- **Domain-Driven Design (DDD)** - Business logic in domain layer
- **Dependency Inversion** - Dependencies point inward
- **Separation of Concerns** - Each layer has a single responsibility

> **Learn more**: [Authentication Architecture](architecture/AUTHENTICATION.md)

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Follow the Architecture

When adding new features:

1. **Domain First**: Define entities and business rules
2. **Use Cases**: Implement application logic
3. **Infrastructure**: Create adapters (repositories)
4. **Presentation**: Build UI components and hooks

### 3. Follow the Design System

- Use Tailwind CSS variables from `frontend/app/globals.css`
- Follow glassmorphism patterns
- Reuse components from `frontend/components/ui/`

> **Reference**: [Design System](../frontend/docs/development/DESIGN_SYSTEM.md)

### 4. Test Your Changes

```bash
# Lint
npm run lint

# Build
npm run build

# Run dev server
npm run dev
```

### 5. Commit Your Changes

Use atomic commits with clear messages:

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

**Commit prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `style:` - Code style changes
- `test:` - Adding tests

## Next Steps

Now that you have the project running, explore:

### For Developers

- [**Quick Start Guide**](setup/QUICKSTART.md) - Detailed setup instructions
- [**Authentication System**](architecture/AUTHENTICATION.md) - Understand the auth architecture
- [**Usage Examples**](../frontend/docs/USAGE_EXAMPLES.md) - Code examples and patterns
- [**Design System**](../frontend/docs/development/DESIGN_SYSTEM.md) - UI guidelines

### For Admins

- [**Admin Panel Setup**](setup/ADMIN_PANEL.md) - Configure admin access
- [**Supabase Setup**](setup/SUPABASE.md) - Database configuration

### Resources

- [Main Documentation Index](README.md)
- [Architecture Diagrams](../frontend/docs/ARCHITECTURE_DIAGRAMS.md)
- [GitHub Repository](https://github.com/RaphaelSilva09/Portal-PP7IA)

## Getting Help

- **Installation issues**: Check [Quick Start troubleshooting](setup/QUICKSTART.md#troubleshooting)
- **Auth issues**: See [Authentication docs](architecture/AUTHENTICATION.md#troubleshooting)
- **General questions**: Open an [issue on GitHub](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)

---

**Ready to dive in?** Start with the [Quick Start Guide](setup/QUICKSTART.md)! 🚀
