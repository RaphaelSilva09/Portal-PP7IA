# 🚀 Setup do Painel Admin - Guia Rápido

## 📋 Pré-requisitos

1. **Supabase CLI** instalado
2. **Node.js** e **pnpm** instalados
3. Projeto Supabase configurado (`.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

---

## 🗄️ Passo 1: Aplicar Migrations

Execute as migrations na ordem para criar/atualizar schema:

```bash
# Navegar para pasta do projeto
cd c:\Users\rapha\OneDrive\Documentos\PP7IA\Portal-PP7IA

# Aplicar migrations via Supabase CLI
supabase db push
```

**OU via Supabase Dashboard:**

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Execute os arquivos na ordem:
    - `007_especial_semana_table.sql`
    - `008_add_read_time_column.sql`
    - `009_seed_data_dev.sql` (APENAS em dev)

---

## 🔑 Passo 2: Configurar Service Role Key

O painel admin precisa da **service_role key** para gerenciar usuários:

1. Acesse [Supabase Dashboard → Settings → API](https://app.supabase.com/project/_/settings/api)
2. Copie a chave **service_role** (secret)
3. Adicione no `.env.local`:

```env
# .env.local (NÃO commitar!)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ← ADICIONAR ESTA
```

---

## 👤 Passo 3: Criar Usuário Admin

### Opção A: Via Supabase Dashboard

1. Acesse **SQL Editor** no Supabase
2. Execute o script (substituindo o email):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'seu-email@exemplo.com';
```

3. Verifique se funcionou:

```sql
SELECT
    id,
    email,
    raw_app_meta_data->>'role' as role
FROM auth.users
WHERE email = 'seu-email@exemplo.com';
```

### Opção B: Via Arquivo SQL

1. Abra `supabase/migrations/999_promote_user_to_admin.sql`
2. Substitua `'SEU_EMAIL_AQUI'` pelo seu email
3. Execute no SQL Editor

---

## ✅ Passo 4: Validar Setup

### 4.1 Verificar Tabelas

```sql
-- Contar registros em cada tabela
SELECT 'newsletters' as tabela, COUNT(*) as total FROM public.newsletters
UNION ALL
SELECT 'mini-livros', COUNT(*) FROM public."mini-livros"
UNION ALL
SELECT 'biblioteca', COUNT(*) FROM public.biblioteca
UNION ALL
SELECT 'especial-semana', COUNT(*) FROM public."especial-semana";
```

**Resultado esperado:**

- newsletters: 3+
- mini-livros: 2+
- biblioteca: 2+
- especial-semana: 2+

### 4.2 Verificar Storage Buckets

```sql
SELECT id, name, public FROM storage.buckets;
```

**Resultado esperado:**

- Newsletters
- MiniLivros
- Biblioteca
- especial-semana ← NOVO

### 4.3 Testar RLS Policies

```sql
-- Como user comum (deve retornar dados)
SELECT * FROM public.newsletters LIMIT 1;

-- Como user comum (deve FALHAR)
INSERT INTO public.newsletters (title, read_time) VALUES ('Teste', 5);
-- Erro: new row violates row-level security policy
```

---

## 🖥️ Passo 5: Rodar Aplicação

```bash
cd frontend
pnpm run dev
```

Acesse: http://localhost:3000

---

## 🔐 Passo 6: Testar Acesso Admin

1. **Login**: Faça login com o email promovido a admin
2. **Acesse**: `http://localhost:3000/admin`
3. **Resultado esperado**:
    - ✅ Deve carregar o painel (não redirecionar)
    - ❌ Se redirecionar para `/`, JWT não tem role admin

### Troubleshooting

**Problema**: Redirecionado para home ao acessar `/admin`

**Solução**:

```sql
-- 1. Verificar se app_metadata tem role
SELECT id, email, raw_app_meta_data FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Se role não está presente, adicionar novamente
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'seu-email@exemplo.com';

-- 3. Fazer logout e login novamente para atualizar JWT
```

---

## 📊 Passo 7: Testar Funcionalidades Admin

### 7.1 Dashboard

- Acesse `/admin`
- Verifique estatísticas (totais de conteúdo, usuários)

### 7.2 Gerenciar Conteúdo

- `/admin/newsletters` - Listar, criar, editar, deletar
- `/admin/mini-livros` - Listar, criar, editar, deletar
- `/admin/biblioteca` - Listar, criar, editar, deletar
- `/admin/especial-semana` - Listar, criar, editar, deletar

### 7.3 Gerenciar Usuários

- `/admin/usuarios` - Listar usuários
- Promover/demover admin
- Deletar usuário

---

## 🧹 Cleanup (Remover Seed Data)

Se quiser remover os dados de exemplo:

```sql
-- Remover apenas os seed data (preservar dados reais)
DELETE FROM public.newsletters WHERE title LIKE 'PP-News #00%' AND id > 2;
DELETE FROM public."mini-livros" WHERE title LIKE 'Mini-livro #00%' AND id > 2;
DELETE FROM public.biblioteca WHERE title LIKE 'Guia de%' OR title LIKE 'Checklist:%';
DELETE FROM public."especial-semana" WHERE title IN ('Brasil no Radar da IA', 'Top 10 Apps IA para Produtividade');
```

---

## 🐛 Debug Checklist

- [ ] Migrations aplicadas (todas as 9)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada em `.env.local`
- [ ] Usuário cadastrado via signup
- [ ] Usuário promovido a admin (verificar `raw_app_meta_data`)
- [ ] Logout + Login após promoção (para atualizar JWT)
- [ ] Buckets de storage criados (4 total)
- [ ] RLS policies ativas em todas as tabelas
- [ ] Acesso a `/admin` não redireciona

---

## 📚 Próximos Passos

Após validar o setup:

1. Implementar UI do painel admin (layout, dashboard, forms)
2. Testar CRUD completo de conteúdos
3. Testar gerenciamento de usuários
4. Adicionar validações de upload (tipos de arquivo)
5. Implementar audit log (opcional)

---

## 🆘 Suporte

**Erros comuns:**

1. **"Not authorized"** ao acessar `/admin`
    - Verificar se JWT tem `app_metadata.role = 'admin'`
    - Fazer logout + login

2. **"Service role key not found"**
    - Adicionar `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
    - Reiniciar servidor Next.js

3. **"Table does not exist"**
    - Aplicar migrations via `supabase db push`

4. **"Storage bucket not found"**
    - Verificar se migration 007 foi executada
    - Criar bucket manualmente via Dashboard
