# Portal-PP7IA
> Portal colaborativo para divulgação de conteúdos sobre Inteligência Artificial, mini-livros, newsletters e materiais educativos.

## 📚 Documentation

**New to the project?** → [**Getting Started Guide**](docs/00-GETTING-STARTED.md) | [**Primeiros Passos**](docs/00-PRIMEIROS-PASSOS.md)

**Quick setup?** → [**Quick Start (5 min)**](docs/setup/QUICKSTART.md) | [**Início Rápido**](docs/setup/QUICKSTART.pt-BR.md)

**Full documentation** → [**Documentation Index**](docs/README.md) | [**Índice de Documentação**](docs/README.pt-BR.md)

---

## Objetivo

O Portal-PP7IA é uma plataforma web que centraliza conteúdos, artigos, newsletters e mini-livros relacionados à Inteligência Artificial, com foco em acessibilidade, colaboração e educação

## Principais Funcionalidades

- 🔐 Autenticação de usuários (Supabase)
- 📚 Biblioteca de conteúdos e mini-livros
- 📧 Newsletter semanal
- ✨ Área especial de conteúdos temáticos
- 👥 Perfis de autores e timeline de publicações
- 🔍 Modais interativos para onboarding e busca

## Arquitetura

- **Frontend:** Next.js 16 + React 19 (TypeScript)
- **Backend/Autenticação:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **Estilização:** Tailwind CSS v4
- **Hospedagem:** Vercel

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
supabase/
  config.toml         # Configuração do Supabase
  migrations/         # Scripts de migração do banco
```

## Instalação e Execução

### Instalação Rápida (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
cd Portal-PP7IA/frontend

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Execute o servidor de desenvolvimento
npm run dev
```

> **📖 Guia detalhado**: [Quick Start](docs/setup/QUICKSTART.md) | [Início Rápido](docs/setup/QUICKSTART.pt-BR.md)  
> **🔧 Configuração do Supabase**: [Supabase Setup Guide](docs/setup/SUPABASE.md)  
> **👤 Painel Admin**: [Admin Panel Setup](docs/setup/ADMIN_PANEL.md)

## 📖 Documentação Completa

Este projeto possui documentação extensiva e organizada:

- **[📚 Documentation Index](docs/README.md)** - Complete documentation hub (English)
- **[📚 Índice de Documentação](docs/README.pt-BR.md)** - Central de documentação (Português)

### Documentação em Destaque

| Tópico | Link |
|--------|------|
| 🚀 Getting Started | [EN](docs/00-GETTING-STARTED.md) \| [PT](docs/00-PRIMEIROS-PASSOS.md) |
| ⚡ Quick Start (5 min) | [EN](docs/setup/QUICKSTART.md) \| [PT](docs/setup/QUICKSTART.pt-BR.md) |
| 🔐 Authentication | [EN](docs/architecture/AUTHENTICATION.md) \| [PT](docs/architecture/AUTHENTICATION.pt-BR.md) |
| 🎨 Design System | [EN](frontend/docs/development/DESIGN_SYSTEM.md) \| [PT](frontend/docs/development/DESIGN_SYSTEM.pt-BR.md) |
| 💻 Frontend Docs | [Frontend Documentation](frontend/docs/README.md) |

## Contribuição

Contribuições são bem-vindas! 

1. Siga os [princípios de arquitetura](docs/architecture/AUTHENTICATION.md#architecture-principles)
2. Use o [Design System](frontend/docs/development/DESIGN_SYSTEM.md)
3. Escreva commits atômicos e claros
4. Teste suas alterações antes de enviar

**Dúvidas?** Veja o [Guia de Contribuição](docs/00-GETTING-STARTED.md#development-workflow)

## Contato

Dúvidas ou sugestões: [RaphaelSilva09](https://github.com/RaphaelSilva09)

## Licença

Este projeto está sob a licença MIT.
