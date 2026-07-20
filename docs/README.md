# 📚 Portal PP7+IA - Documentation

Welcome to the Portal PP7+IA documentation! This index will help you navigate through all available documentation.

## 🚀 Getting Started

**New to the project?** Start here:

- [**Getting Started Guide**](00-GETTING-STARTED.md) - Complete guide for new contributors
- [Weekly Digest](setup/WEEKLY_EMAIL_DIGEST.md) - Operational guide for the email digest

## 📖 Documentation Sections

### 🔧 Setup & Configuration

Essential guides to configure your development environment:

- [**Weekly Digest**](setup/WEEKLY_EMAIL_DIGEST.md) - Railway cron and digest execution

### 🏛️ Architecture

Understand the project's architecture and design principles:

- Authentication uses BetterAuth backed by PostgreSQL on Railway.

### 📰 Newsletter

- [**Fontes da Newsletter (70 fontes)**](newsletter/FONTES.md) - Lista curada de fontes para as edições de segunda (7 IAs) e quarta (startups)

### 📋 Planejamento (SDD)

- [**Plano de execução PP7+IAS — julho/2026**](sdd/00-overview.md) - Specs das tarefas do plano de julho

### 💻 Frontend Development

Frontend-specific documentation:

- [**Design System**](../frontend/docs/development/DESIGN_SYSTEM.md) - Colors, typography, components

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
└── frontend/db/migrations/        # SQL migrations
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: BetterAuth
- **Database**: PostgreSQL on Railway
- **Deployment**: Railway

## 🎯 Architecture Principles

This project follows industry best practices:

- **Clean Architecture** - Clear separation of concerns across layers
- **Domain-Driven Design (DDD)** - Business logic in the domain layer
- **SOLID Principles** - Maintainable and extensible code
- **TypeScript Strict Mode** - Type safety throughout

## Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)
- **Installation Problems**: See [Getting Started](00-GETTING-STARTED.md)

## 🤝 Contributing

Contributions are welcome! When contributing:

1. Follow the architecture principles documented here
2. Use the [Design System](../frontend/docs/development/DESIGN_SYSTEM.md)
3. Write clear commit messages (atomic commits preferred)
4. Test your changes before submitting

## 📝 Documentation Index

### Setup Guides

- [Weekly Digest](setup/WEEKLY_EMAIL_DIGEST.md)

### Architecture

- BetterAuth + Railway PostgreSQL

### Frontend

- [Design System](../frontend/docs/development/DESIGN_SYSTEM.md)

---

**Last Updated**: February 2026  
**Repository**: [Portal-PP7IA](https://github.com/RaphaelSilva09/Portal-PP7IA)
