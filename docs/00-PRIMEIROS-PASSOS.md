# 🚀 Primeiros Passos - Portal PP7+IA

> **[English Version](00-GETTING-STARTED.md)** | Versão em Português

Bem-vindo! Este guia te ajudará a começar com o projeto Portal PP7+IA.

## 📋 Índice

- [O que é o Portal PP7+IA?](#o-que-é-o-portal-pp7ia)
- [Pré-requisitos](#pré-requisitos)
- [Configuração Rápida](#configuração-rápida)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Próximos Passos](#próximos-passos)

## O que é o Portal PP7+IA?

Portal PP7+IA é uma plataforma web colaborativa para compartilhamento de conteúdo sobre Inteligência Artificial, incluindo:

- 📚 Biblioteca de conteúdos e mini-livros
- 📧 Newsletters semanais
- 👥 Perfis de autores e timelines
- 🎓 Materiais educacionais
- 🔐 Autenticação e gerenciamento de usuários

### Recursos Principais

- **Autenticação**: Autenticação segura de usuários com Supabase
- **Gerenciamento de Conteúdo**: Painel admin para gerenciar conteúdo
- **Design Responsivo**: Sistema de design glassmorphism com Tailwind CSS
- **Clean Architecture**: Seguindo princípios SOLID e DDD

## Pré-requisitos

Antes de começar, certifique-se de ter:

- **Node.js** 18.x ou superior ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Um editor de código** (VS Code recomendado)
- **Conta Supabase** (gratuita) - [Criar conta](https://supabase.com)

### Opcional

- **Supabase CLI** - Para executar migrations localmente
- **Conta Vercel** - Para deploy

## Configuração Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
cd Portal-PP7IA
```

### 2. Instale as Dependências

```bash
cd frontend
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie `.env.local` no diretório `frontend/`:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> **Precisa de ajuda?** Veja o [Guia de Setup do Supabase](setup/SUPABASE.md)

### 4. Execute o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### 5. Configure o Supabase (Banco de Dados)

1. Vá para o [Supabase Dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto
3. Vá para **SQL Editor** e execute as migrations de `supabase/migrations/`
4. Configure as definições de autenticação

> **Instruções detalhadas**: [Guia de Setup do Supabase](setup/SUPABASE.md)

## Estrutura do Projeto

```
Portal-PP7IA/
├── docs/                           # Documentação (você está aqui)
│   ├── setup/                     # Guias de configuração
│   ├── architecture/              # Docs de arquitetura
│   └── README.md                  # Índice da documentação
│
├── frontend/                       # Aplicação Next.js
│   ├── app/                       # Páginas e rotas da API
│   │   ├── layout.tsx            # Layout raiz
│   │   ├── page.tsx              # Página inicial
│   │   ├── api/                  # Rotas da API
│   │   └── [feature]/            # Páginas de features
│   │
│   ├── components/                # Componentes React
│   │   ├── ui/                   # Componentes UI (botões, cards, etc.)
│   │   └── [Feature]*.tsx        # Componentes de features
│   │
│   ├── domain/                    # Camada de domínio (Clean Architecture)
│   │   ├── entities/             # Entidades de negócio
│   │   ├── repositories/         # Interfaces de repositório
│   │   └── errors/               # Erros de domínio
│   │
│   ├── application/               # Camada de aplicação
│   │   └── usecases/             # Casos de uso (lógica de negócio)
│   │
│   ├── infrastructure/            # Camada de infraestrutura
│   │   ├── config/               # Configuração (Supabase, etc.)
│   │   ├── repositories/         # Implementações de repositório
│   │   └── di/                   # Injeção de dependência
│   │
│   ├── presentation/              # Camada de apresentação
│   │   └── hooks/                # Hooks React
│   │
│   ├── context/                   # Contextos React
│   ├── lib/                       # Utilitários
│   ├── public/                    # Assets estáticos
│   └── docs/                      # Docs específicos do frontend
│
└── supabase/                       # Configuração do Supabase
    ├── migrations/                # Migrations SQL
    └── config.toml                # Config do Supabase
```

## Visão Geral da Arquitetura

Este projeto segue os princípios de **Clean Architecture**:

```
┌─────────────────────────────────────┐
│        PRESENTATION                 │
│   (Componentes, Hooks, Context)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        APPLICATION                   │
│   (Casos de Uso, Lógica de Negócio) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          DOMAIN                      │
│   (Entidades, Interfaces, Erros)    │
└─────────────────────────────────────┘
               ▲
               │
┌──────────────┴──────────────────────┐
│      INFRASTRUCTURE                  │
│   (Supabase, Serviços Externos)     │
└─────────────────────────────────────┘
```

### Princípios Chave

- **Princípios SOLID** - Código manutenível e extensível
- **Domain-Driven Design (DDD)** - Lógica de negócio na camada de domínio
- **Inversão de Dependência** - Dependências apontam para dentro
- **Separação de Responsabilidades** - Cada camada tem uma única responsabilidade

> **Saiba mais**: [Arquitetura de Autenticação](architecture/AUTHENTICATION.pt-BR.md)

## Fluxo de Desenvolvimento

### 1. Crie uma Branch de Feature

```bash
git checkout -b feature/nome-da-sua-feature
```

### 2. Siga a Arquitetura

Ao adicionar novas features:

1. **Domínio Primeiro**: Defina entidades e regras de negócio
2. **Casos de Uso**: Implemente a lógica de aplicação
3. **Infraestrutura**: Crie adaptadores (repositórios)
4. **Apresentação**: Construa componentes UI e hooks

### 3. Siga o Design System

- Use variáveis CSS do Tailwind de `frontend/app/globals.css`
- Siga os padrões glassmorphism
- Reutilize componentes de `frontend/components/ui/`

> **Referência**: [Design System](../frontend/docs/development/DESIGN_SYSTEM.pt-BR.md)

### 4. Teste Suas Alterações

```bash
# Lint
npm run lint

# Build
npm run build

# Executar servidor dev
npm run dev
```

### 5. Faça Commit das Suas Alterações

Use commits atômicos com mensagens claras:

```bash
git add .
git commit -m "feat: adiciona nova feature"
git push origin feature/nome-da-sua-feature
```

**Prefixos de commit:**
- `feat:` - Nova feature
- `fix:` - Correção de bug
- `refactor:` - Refatoração de código
- `docs:` - Mudanças na documentação
- `style:` - Mudanças de estilo de código
- `test:` - Adição de testes

## Próximos Passos

Agora que você tem o projeto rodando, explore:

### Para Desenvolvedores

- [**Guia de Início Rápido**](setup/QUICKSTART.pt-BR.md) - Instruções detalhadas de setup
- [**Sistema de Autenticação**](architecture/AUTHENTICATION.pt-BR.md) - Entenda a arquitetura de auth
- [**Exemplos de Uso**](../frontend/docs/USAGE_EXAMPLES.md) - Exemplos de código e padrões
- [**Design System**](../frontend/docs/development/DESIGN_SYSTEM.pt-BR.md) - Guias de UI

### Para Admins

- [**Setup do Painel Admin**](setup/ADMIN_PANEL.md) - Configure acesso admin
- [**Setup do Supabase**](setup/SUPABASE.md) - Configuração do banco de dados

### Recursos

- [Índice Principal da Documentação](README.pt-BR.md)
- [Diagramas de Arquitetura](../frontend/docs/ARCHITECTURE_DIAGRAMS.md)
- [Repositório GitHub](https://github.com/RaphaelSilva09/Portal-PP7IA)

## Obtendo Ajuda

- **Problemas de instalação**: Veja [troubleshooting do Início Rápido](setup/QUICKSTART.pt-BR.md#solucionando-problemas)
- **Problemas de auth**: Veja [docs de Autenticação](architecture/AUTHENTICATION.pt-BR.md#solucionando-problemas)
- **Dúvidas gerais**: Abra uma [issue no GitHub](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)

---

**Pronto para mergulhar?** Comece com o [Guia de Início Rápido](setup/QUICKSTART.pt-BR.md)! 🚀
