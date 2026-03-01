# 🔧 Guia de Configuração do Supabase

Este guia te ajudará a configurar o Supabase para o sistema de autenticação do Portal PP7IA.

## 📋 Pré-requisitos

-   Conta no [Supabase](https://supabase.com) (gratuita)
-   Node.js instalado
-   Git instalado

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clique em **"New Project"**
3. Preencha:
    - **Name**: `Portal PP7IA` (ou nome de sua preferência)
    - **Database Password**: Escolha uma senha forte (anote-a!)
    - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos para o projeto ser provisionado

### 2. Obter Credenciais da API

1. No dashboard do projeto, vá em **Settings** → **API**
2. Você verá duas informações importantes:

    **Project URL:**

    ```
    https://ckeasikrxqcosqsjsgxz.supabase.co
    ```

    **API Keys:**

    - `anon` `public` - Use este no frontend
    - `service_role` `secret` - Use apenas no backend (⚠️ nunca no frontend!)

3. Copie essas informações

### 3. Configurar Variáveis de Ambiente

1. No projeto, crie o arquivo `.env.local`:

```bash
cd portal/frontend
cp .env.example .env.local
```

2. Edite `.env.local` e cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ckeasikrxqcosqsjsgxz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Executar Migrations SQL

#### Opção A: Via Dashboard (Recomendado)

1. No Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo:
    ```
    portal/supabase/migrations/001_auth_schema.sql
    ```
4. Cole no editor SQL
5. Clique em **"Run"** (▶️)
6. Verifique que retornou "Success"

#### Opção B: Via Supabase CLI

```bash
# Instalar CLI do Supabase (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Linkar ao projeto
cd portal/supabase
supabase link --project-ref seu-project-id

# Executar migrations
supabase db push
```

### 5. Configurar Autenticação por Email

1. No Supabase, vá em **Authentication** → **Providers**
2. Ative **Email** (deve estar ativo por padrão)
3. Em **Email Templates**, você pode personalizar:
    - **Confirm signup**: Email de confirmação
    - **Reset password**: Email de recuperação de senha
    - **Magic Link**: Link mágico de login

#### Template Personalizado (Opcional)

```html
<h2>Bem-vindo ao Portal PP7IA!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```

### 6. Configurar Redirect URLs (Produção)

1. Vá em **Authentication** → **URL Configuration**
2. Adicione suas URLs permitidas:
    - **Site URL**: `https://seu-dominio.com`
    - **Redirect URLs**:
        - `https://seu-dominio.com`
        - `http://localhost:3000` (desenvolvimento)

### 7. Verificar Configuração

Execute este teste no SQL Editor:

```sql
-- Verificar se tabela foi criada
SELECT * FROM public.users LIMIT 1;

-- Verificar RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';
```

Deve retornar:

-   Primeira query: Tabela vazia (ok)
-   Segunda query: `rowsecurity = true`

### 8. Testar Localmente

```bash
cd portal/frontend
npm run dev
```

Acesse: http://localhost:3000

1. Clique em "Cadastrar" ou "Login"
2. Preencha o formulário
3. Se tudo estiver correto, você verá o usuário criado!

## ✅ Verificação Final

Execute no SQL Editor para ver usuários cadastrados:

```sql
SELECT
    id,
    email,
    nome,
    celular,
    created_at
FROM public.users
ORDER BY created_at DESC;
```

## 🔒 Segurança - Checklist

-   [ ] `.env.local` está no `.gitignore`
-   [ ] Nunca commite suas credenciais no Git
-   [ ] `service_role_key` nunca foi usado no frontend
-   [ ] RLS está habilitado na tabela `users`
-   [ ] Políticas de RLS foram criadas corretamente

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"

**Solução**: Verifique se `.env.local` existe e está no lugar correto:

```bash
portal/frontend/.env.local
```

### Erro: "relation public.users does not exist"

**Solução**: Execute a migration SQL novamente (Passo 4)

### Erro: "new row violates row-level security policy"

**Solução**: Verifique se as políticas RLS foram criadas:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Usuários não aparecem no dashboard

**Solução**: Vá em **Authentication** → **Users** para ver usuários autenticados.
Para ver dados da tabela `users`, use o SQL Editor.

## 📚 Recursos Adicionais

-   [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
-   [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
-   [Supabase CLI](https://supabase.com/docs/guides/cli)

## 💡 Próximos Passos

Depois de configurar o Supabase:

1. ✅ Teste cadastro e login localmente
2. ✅ Verifique emails de confirmação
3. ✅ Teste recuperação de senha
4. 🚀 Faça deploy para produção
5. 📊 Configure Analytics (opcional)

---

**Precisa de ajuda?** Veja a documentação completa em `docs/AUTHENTICATION.md`
