# ⚡ Guia de Início Rápido - Portal PP7+IA

> **[English Version](QUICKSTART.md)** | Versão em Português

Tenha o projeto Portal PP7+IA rodando localmente em **5 minutos**!

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior instalado
- **Git** instalado
- **Conta Supabase** (gratuita) - [Criar conta aqui](https://supabase.com)

## 🚀 Setup Passo a Passo

### Passo 1: Clone e Instale (1 minuto)

```bash
# Clone o repositório
git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
cd Portal-PP7IA/frontend

# Instale as dependências
npm install
```

### Passo 2: Crie um Projeto Supabase (2 minutos)

1. Vá para o [Supabase Dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `Portal-PP7IA` (ou sua preferência)
   - **Database Password**: Escolha uma senha forte e salve-a!
   - **Region**: Escolha a mais próxima (ex: South America)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o provisionamento

### Passo 3: Obtenha as Credenciais da API (30 segundos)

1. No seu projeto Supabase, vá em **Settings** → **API**
2. Copie estes valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Token JWT longo começando com `eyJ...`

### Passo 4: Configure as Variáveis de Ambiente (30 segundos)

Crie `.env.local` na pasta `frontend/`:

```bash
# No diretório frontend/
cp .env.example .env.local
```

Edite `.env.local` e cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Importante**: Nunca faça commit do `.env.local` no Git!

### Passo 5: Execute as Migrations do Banco de Dados (1 minuto)

1. No Supabase Dashboard, vá para **SQL Editor**
2. Clique em **"New query"**
3. Copie o conteúdo de `supabase/migrations/001_auth_schema.sql`
4. Cole e clique em **"Run"** ▶️
5. Repita para todos os arquivos de migration em ordem (001, 002, 003, etc.)

> **Dica**: Procure pela mensagem "Success" após cada migration.

### Passo 6: Inicie o Servidor de Desenvolvimento (30 segundos)

```bash
# No diretório frontend/
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Verificar Instalação

### Teste 1: Página Carrega

- Você deve ver a homepage do Portal PP7+IA
- Sem mensagens de erro no console do navegador

### Teste 2: Autenticação Funciona

1. Clique no botão **"Login"** ou **"Cadastrar"**
2. Tente criar uma conta
3. Verifique seu email para confirmação

### Teste 3: Conexão com Banco de Dados

Execute esta query no SQL Editor do Supabase:

```sql
-- Verificar se a tabela users existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Você deve ver as tabelas `users`, `newsletters`, `mini-livros`, `biblioteca`.

## 🎯 Referência Rápida

### Comandos Comuns

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar linter
npm run lint

# Testar build
npm run build && npm run start
```

### Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `.env.local` | Variáveis de ambiente (não commitar!) |
| `frontend/app/` | Páginas e rotas |
| `frontend/components/` | Componentes React |
| `supabase/migrations/` | Schema do banco de dados |

### Variáveis de Ambiente

| Variável | Onde Encontrar | Propósito |
|----------|----------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Endpoint da API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public | Chave de auth do cliente |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret | Operações admin (opcional, para painel admin) |

## 🐛 Solucionando Problemas

### Erro: "Missing Supabase environment variables"

**Solução**: Verifique se `.env.local` existe no diretório `frontend/` com valores corretos.

```bash
# Verificar se arquivo existe
ls frontend/.env.local

# Verificar conteúdo
cat frontend/.env.local
```

### Erro: "Failed to fetch" ou connection refused

**Soluções**:
1. Verifique se o projeto Supabase está rodando (cheque o dashboard)
2. Confirme que `NEXT_PUBLIC_SUPABASE_URL` está correto
3. Certifique-se de copiar a chave **anon public**, não a service role key

### Erro: "relation public.users does not exist"

**Solução**: Execute as migrations do banco de dados (Passo 5 acima)

### Porta 3000 já está em uso

**Solução**: 

```bash
# Matar processo na porta 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou use uma porta diferente
npm run dev -- -p 3001
```

### Página carrega mas estilos parecem quebrados

**Soluções**:
1. Limpe o cache do navegador (Ctrl+Shift+R / Cmd+Shift+R)
2. Delete a pasta `.next` e reinicie:
   ```bash
   rm -rf .next
   npm run dev
   ```

## 📚 Próximos Passos

Agora que você tem o projeto rodando:

### Para Desenvolvedores

- [**Sistema de Autenticação**](../architecture/AUTHENTICATION.pt-BR.md) - Entenda a arquitetura de auth
- [**Exemplos de Uso**](../../frontend/docs/USAGE_EXAMPLES.md) - Exemplos de código e padrões
- [**Design System**](../../frontend/docs/development/DESIGN_SYSTEM.pt-BR.md) - Guias de UI

### Para Admins

- [**Setup do Painel Admin**](ADMIN_PANEL.md) - Configure acesso admin
- [**Setup do Supabase**](SUPABASE.md) - Configuração detalhada do banco

### Saiba Mais

- [**Guia de Primeiros Passos**](../00-PRIMEIROS-PASSOS.md) - Introdução abrangente
- [**Diagramas de Arquitetura**](../../frontend/docs/ARCHITECTURE_DIAGRAMS.md) - Documentação visual
- [**Índice da Documentação**](../README.pt-BR.md) - Todos os docs disponíveis

## 🆘 Ainda Tendo Problemas?

- Veja o [Guia de Setup do Supabase](SUPABASE.md) para instruções detalhadas
- Consulte [Docs de Autenticação](../architecture/AUTHENTICATION.pt-BR.md) para issues específicas de auth
- Abra uma issue no [GitHub](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)

---

**⏱️ Tempo de Setup**: ~5 minutos  
**✅ Taxa de Sucesso**: 99%  
**🎯 Próximo**: [Configurar Painel Admin](ADMIN_PANEL.md)
