# 📚 Portal PP7+IA - Documentação

> **[English Version](README.md)** | Versão em Português

Bem-vindo à documentação do Portal PP7+IA! Este índice te ajudará a navegar por toda a documentação disponível.

## 🚀 Começando

**Novo no projeto?** Comece aqui:

- [**Guia de Primeiros Passos**](00-PRIMEIROS-PASSOS.md) - Guia completo para novos contribuidores
- [Configuração Rápida (5 minutos)](setup/QUICKSTART.pt-BR.md) - Caminho rápido para rodar o projeto localmente

## 📖 Seções da Documentação

### 🔧 Setup e Configuração

Guias essenciais para configurar seu ambiente de desenvolvimento:

- [**Início Rápido**](setup/QUICKSTART.pt-BR.md) - Guia de configuração de 5 minutos
- [**Configuração do Supabase**](setup/SUPABASE.md) - Configuração de banco de dados e autenticação
- [**Setup do Painel Admin**](setup/ADMIN_PANEL.md) - Configurar painel admin e permissões

### 🏛️ Arquitetura

Entenda a arquitetura e princípios de design do projeto:

- [**Sistema de Autenticação**](architecture/AUTHENTICATION.pt-BR.md) - Documentação completa de auth (Clean Architecture + DDD)

### 💻 Desenvolvimento Frontend

Documentação específica do frontend:

- [**Diagramas de Arquitetura**](../frontend/docs/ARCHITECTURE_DIAGRAMS.md) - Documentação visual da arquitetura
- [**Exemplos de Uso**](../frontend/docs/USAGE_EXAMPLES.md) - Exemplos de código e receitas
- [**Design System**](../frontend/docs/development/DESIGN_SYSTEM.pt-BR.md) - Cores, tipografia, componentes

## 📂 Estrutura do Projeto

```
Portal-PP7IA/
├── docs/                          # Documentação geral (você está aqui)
│   ├── setup/                    # Guias de configuração
│   ├── architecture/             # Documentação de arquitetura
│   └── README.md                 # Este arquivo
│
├── frontend/                      # Aplicação Next.js
│   ├── app/                      # Páginas e rotas
│   ├── components/               # Componentes React
│   ├── domain/                   # Entidades de domínio (DDD)
│   ├── application/              # Casos de uso
│   ├── infrastructure/           # Serviços externos
│   ├── presentation/             # Hooks e lógica de UI
│   └── docs/                     # Docs específicos do frontend
│
└── supabase/                      # Banco de dados e auth
    ├── migrations/               # Migrations SQL
    └── config.toml              # Configuração do Supabase
```

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Estilização**: Tailwind CSS v4
- **Autenticação**: Supabase Auth
- **Banco de Dados**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## 🎯 Princípios de Arquitetura

Este projeto segue as melhores práticas da indústria:

- **Clean Architecture** - Separação clara de responsabilidades entre camadas
- **Domain-Driven Design (DDD)** - Lógica de negócio na camada de domínio
- **Princípios SOLID** - Código manutenível e extensível
- **TypeScript Strict Mode** - Segurança de tipos em todo o código

## 🌐 Suporte de Idiomas

A documentação está disponível em:

- 🇺🇸 **Inglês** - Idioma principal
- 🇧🇷 **Português** - Português brasileiro (arquivos selecionados)

Procure por arquivos com extensão `.pt-BR.md` para versões em português.

## 🆘 Obtendo Ajuda

- **Issues**: Verifique as [Issues no GitHub](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)
- **Problemas de Instalação**: Veja [Início Rápido](setup/QUICKSTART.pt-BR.md#solucionando-problemas)
- **Problemas de Auth**: Veja [Docs de Autenticação](architecture/AUTHENTICATION.pt-BR.md#solucionando-problemas)

## 🤝 Contribuindo

Contribuições são bem-vindas! Ao contribuir:

1. Siga os princípios de arquitetura documentados aqui
2. Use o [Design System](../frontend/docs/development/DESIGN_SYSTEM.pt-BR.md)
3. Escreva mensagens de commit claras (commits atômicos preferidos)
4. Teste suas alterações antes de enviar

## 📝 Índice da Documentação

### Guias de Setup
- [Início Rápido](setup/QUICKSTART.pt-BR.md) - Setup de 5 minutos
- [Setup do Supabase](setup/SUPABASE.md) - Configuração do banco
- [Setup do Painel Admin](setup/ADMIN_PANEL.md) - Configuração admin

### Arquitetura
- [Sistema de Autenticação](architecture/AUTHENTICATION.pt-BR.md) - Docs completos de auth

### Frontend
- [Diagramas de Arquitetura](../frontend/docs/ARCHITECTURE_DIAGRAMS.md)
- [Exemplos de Uso](../frontend/docs/USAGE_EXAMPLES.md)
- [Design System](../frontend/docs/development/DESIGN_SYSTEM.pt-BR.md)

---

**Última Atualização**: Fevereiro de 2026  
**Repositório**: [Portal-PP7IA](https://github.com/RaphaelSilva09/Portal-PP7IA)
