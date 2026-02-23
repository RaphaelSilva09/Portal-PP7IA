# Portal-PP7IA
> Portal colaborativo para divulgação de conteúdos sobre Inteligência Artificial, mini-livros, newsletters e materiais educativos.

## Objetivo

O Portal-PP7IA é uma plataforma web que centraliza conteúdos, artigos, newsletters e mini-livros relacionados à Inteligência Artificial, com foco em acessibilidade, colaboração e educação.

## Principais Funcionalidades

- Autenticação de usuários (Supabase)
- Biblioteca de conteúdos e mini-livros
- Newsletter semanal
- Área especial de conteúdos temáticos
- Perfis de autores e timeline de publicações
- Modais interativos para onboarding e busca

## Arquitetura

- **Frontend:** Next.js (TypeScript)
- **Backend/Autenticação:** Supabase
- **Estilização:** CSS, PostCSS
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

1. Clone o repositório:
    ```bash
    git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
    ```
2. Instale as dependências do frontend:
    ```bash
    cd frontend
    npm install
    ```
3. Configure o arquivo `.env.local` com as credenciais do Supabase.
4. Execute o projeto localmente:
    ```bash
    npm run dev
    ```
5. (Opcional) Configure e execute o Supabase localmente para autenticação e banco de dados.

## Contribuição

Contribuições são bem-vindas! Abra uma issue ou envie um pull request.

## Contato

Dúvidas ou sugestões: [RaphaelSilva09](https://github.com/RaphaelSilva09)

## Licença

Este projeto está sob a licença MIT.
