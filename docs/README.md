# 📚 Portal PP7+IA - Documentation

Welcome to the Portal PP7+IA documentation! This index will help you navigate through all available documentation.

## 🚀 Getting Started

**New to the project?** Start here:

- [**Getting Started Guide**](00-GETTING-STARTED.md) - Complete guide for new contributors
- [Quick Setup (5 minutes)](setup/QUICKSTART.md) - Fast track to run the project locally

## 📖 Documentation Sections

### 🔧 Setup & Configuration

Essential guides to configure your development environment:

- [**Quick Start**](setup/QUICKSTART.md) - 5-minute setup guide
- [**Supabase Configuration**](setup/SUPABASE.md) - Database and authentication setup
- [**Admin Panel Setup**](setup/ADMIN_PANEL.md) - Configure admin panel and permissions

### 🏛️ Architecture

Understand the project's architecture and design principles:

- [**Authentication System**](architecture/AUTHENTICATION.md) - Complete auth documentation (Clean Architecture + DDD)

### 💻 Frontend Development

Frontend-specific documentation:

- [**Architecture Diagrams**](../frontend/docs/ARCHITECTURE_DIAGRAMS.md) - Visual architecture documentation
- [**Usage Examples**](../frontend/docs/USAGE_EXAMPLES.md) - Code examples and recipes
- [**Design System**](../frontend/docs/development/DESIGN_SYSTEM.md) - Colors, typographys, components

## 📂 Project Structure

```
Portal-PP7IA/
├── docs/                          # General documentation (you are here)
│   ├── setup/                    # Setup guides
│   ├── architecture/             # Architecture documentation
│   └── README.md                 # This file
│
├── frontend/                      # Next.js application
│   ├── app/                      # Pages and routes
│   ├── components/               # React components
│   ├── domain/                   # Domain entities (DDD)
│   ├── application/              # Use cases
│   ├── infrastructure/           # External services
│   ├── presentation/             # Hooks and UI logic
│   └── docs/                     # Frontend-specific docs
│
└── supabase/                      # Database and auth
    ├── migrations/               # SQL migrations
    └── config.toml              # Supabase configuration
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 🎯 Architecture Principles

This project follows industry best practices:

- **Clean Architecture** - Clear separation of concerns across layers
- **Domain-Driven Design (DDD)** - Business logic in the domain layer
- **SOLID Principles** - Maintainable and extensible code
- **TypeScript Strict Mode** - Type safety throughout

## Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)
- **Installation Problems**: See [Quick Start](setup/QUICKSTART.md#troubleshooting)
- **Auth Issues**: See [Authentication Docs](architecture/AUTHENTICATION.md#troubleshooting)

## 🤝 Contributing

Contributions are welcome! When contributing:

1. Follow the architecture principles documented here
2. Use the [Design System](../frontend/docs/development/DESIGN_SYSTEM.md)
3. Write clear commit messages (atomic commits preferred)
4. Test your changes before submitting

## 📝 Documentation Index

### Setup Guides

- [Quick Start](setup/QUICKSTART.md) - 5-minute setup
- [Supabase Setup](setup/SUPABASE.md) - Database configuration
- [Admin Panel Setup](setup/ADMIN_PANEL.md) - Admin configuration

### Architecture

- [Authentication System](architecture/AUTHENTICATION.md) - Complete auth docs

### Frontend

- [Architecture Diagrams](../frontend/docs/ARCHITECTURE_DIAGRAMS.md)
- [Usage Examples](../frontend/docs/USAGE_EXAMPLES.md)
- [Design System](../frontend/docs/development/DESIGN_SYSTEM.md)

---

**Last Updated**: February 2026  
**Repository**: [Portal-PP7IA](https://github.com/RaphaelSilva09/Portal-PP7IA)
