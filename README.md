# Portal-PP7IA

Portal colaborativo para divulgação de conteúdos sobre Inteligência Artificial, mini-livros, newsletters e materiais educativos.

## 📚 Documentation

**New to the project?** → [**Getting Started Guide**](docs/00-GETTING-STARTED.md)

**Full documentation** → [**Documentation Index**](docs/README.md)

---

## Objetivo

O Portal-PP7IA é uma plataforma web que centraliza conteúdos, artigos, newsletters e mini-livros relacionados à Inteligência Artificial, com foco em acessibilidade, colaboração e educação

## Principais Funcionalidades

- 🔐 Autenticação de usuários com BetterAuth
- 📚 Biblioteca de conteúdos e mini-livros
- 📧 Newsletter semanal
- ✨ Área especial de conteúdos temáticos
- 👥 Perfis de autores e timeline de publicações
- 🔍 Modais interativos para onboarding e busca

## Arquitetura

- **Frontend:** Next.js 16 + React 19 (TypeScript)
- **Backend/Autenticação:** BetterAuth
- **Database:** PostgreSQL no Railway
- **Estilização:** Tailwind CSS v4
- **Hospedagem:** Railway

## Estrutura de Pastas

```
frontend/
  app/                # Páginas e rotas principais
  components/         # Componentes React reutilizáveis
  context/            # Contextos globais (modais, autenticação)
  data/               # Dados estáticos
  domain/             # Entidades e interfaces de domínio
  infrastructure/     # Configurações e repositórios
  lib/                # Utilitários
  presentation/       # Hooks e lógica de apresentação
  public/             # Arquivos estáticos e HTMLs
  db/migrations/      # Scripts de migração do banco
```

## Instalação e Execução

### Instalação Rápida (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
cd Portal-PP7IA/frontend

# 2. Instale as dependências
pnpm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Configure DATABASE_URL, BETTER_AUTH_SECRET e variáveis do Railway/Resend

# 4. Execute o servidor de desenvolvimento
pnpm run dev
```

> **📖 Detailed Guide**: [Getting Started](docs/00-GETTING-STARTED.md)

## 📖 Documentation

This project has comprehensive documentation:

- **[📚 Documentation Index](docs/README.md)** - Complete documentation hub

### Featured Documentation

| Topic                  | Link                                                        |
| ---------------------- | ----------------------------------------------------------- |
| 🚀 Getting Started     | [Getting Started Guide](docs/00-GETTING-STARTED.md)         |
| 🎨 Design System       | [Design System](frontend/docs/development/DESIGN_SYSTEM.md) |
| 💻 Frontend Docs       | [Frontend Documentation](frontend/docs/README.md)           |

## Contribuição

Contribuições são bem-vindas!

1. Siga os princípios de arquitetura documentados em [docs/README.md](docs/README.md)
2. Use o [Design System](frontend/docs/development/DESIGN_SYSTEM.md)
3. Escreva commits atômicos e claros
4. Teste suas alterações antes de enviar

**Dúvidas?** Veja o [Guia de Contribuição](docs/00-GETTING-STARTED.md#development-workflow)

## Contato

Dúvidas ou sugestões: [RaphaelSilva09](https://github.com/RaphaelSilva09)

## Licença

Este projeto está sob a licença MIT.
