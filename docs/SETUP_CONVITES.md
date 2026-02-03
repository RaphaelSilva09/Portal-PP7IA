# Configuração do Sistema de Convites PP7+IAS

Este guia detalha os passos necessários para ativar o sistema de convites múltiplos.

---

## Pré-requisitos

- Supabase CLI instalado (`npm install -g supabase`)
- Conta Resend criada em [resend.com](https://resend.com)
- Domínio verificado no Resend para envio de emails

---

## Passo 1: Criar Conta Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. No dashboard, vá em **Domains** e adicione seu domínio (ex: `pp7ias.com.br`)
3. Configure os registros DNS conforme instruções do Resend:
   - SPF
   - DKIM (3 registros)
   - DMARC (opcional, recomendado)
4. Aguarde a verificação do domínio (pode levar até 48h)

### Gerar API Key

1. No dashboard Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome (ex: `pp7ias-production`)
4. Copie a chave gerada (formato: `re_xxxxxxxxxx`)

> **Limites Free Tier:**
> - 100 emails/dia
> - 3.000 emails/mês
> - Rate limit: 2 req/segundo

---

## Passo 2: Configurar Secrets no Supabase

### Via CLI

```bash
# Navegar para o diretório do projeto
cd /home/leah/Documents/PPIA7/portal

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_sua_api_key_aqui
supabase secrets set SITE_URL=https://pp7ias.com.br
supabase secrets set FROM_EMAIL="PP7+IAS <convites@pp7ias.com.br>"
```

### Via Dashboard

1. Acesse o [Dashboard Supabase](https://supabase.com/dashboard)
2. Selecione o projeto PP7+IAS
3. Vá em **Edge Functions** > **Manage Secrets**
4. Adicione as seguintes secrets:

| Nome | Valor |
|------|-------|
| `RESEND_API_KEY` | `re_sua_api_key_aqui` |
| `SITE_URL` | `https://pp7ias.com.br` |
| `FROM_EMAIL` | `PP7+IAS <convites@pp7ias.com.br>` |

---

## Passo 3: Aplicar Migration do Banco

```bash
# Aplicar migration para criar tabela 'invites'
supabase db push
```

### Verificar Criação da Tabela

No Dashboard Supabase > Table Editor, deve aparecer a tabela `invites` com as colunas:

- `id` (UUID, PK)
- `inviter_id` (UUID, FK para auth.users)
- `inviter_email` (TEXT)
- `invitee_email` (TEXT)
- `status` (TEXT: pending/sent/accepted/failed)
- `sent_at` (TIMESTAMPTZ)
- `accepted_at` (TIMESTAMPTZ)
- `error_message` (TEXT)
- `invite_token` (TEXT, UNIQUE)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## Passo 4: Deploy da Edge Function

```bash
# Deploy da função de envio de convites
supabase functions deploy send-invite-email
```

### Testar Localmente (Opcional)

```bash
# Iniciar funções localmente
supabase functions serve

# Testar com curl (em outro terminal)
curl -X POST http://localhost:54321/functions/v1/send-invite-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"emails": ["teste@exemplo.com"]}'
```

---

## Passo 5: Verificar Variáveis de Ambiente do Next.js

Confirme que o arquivo `.env.local` contém:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Estas variáveis já devem estar configuradas se o projeto estava funcionando antes.

---

## Passo 6: Testar o Sistema

### 6.1 Build do Frontend

```bash
cd frontend
npm run build
```

Se houver erros de TypeScript, corrija-os antes de prosseguir.

### 6.2 Teste Manual

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse a página que contém o `InviteCTA` (ex: `/biblioteca`)
3. Adicione um email de teste
4. Clique em "ENVIAR CONVITE"
5. Verifique:
   - Email recebido com o template correto
   - Link de convite funcionando
   - Registro criado na tabela `invites`

### 6.3 Verificar Logs

```bash
# Ver logs da Edge Function
supabase functions logs send-invite-email
```

---

## Troubleshooting

### Erro: "Serviço de email não configurado"

A secret `RESEND_API_KEY` não está definida. Execute:
```bash
supabase secrets set RESEND_API_KEY=re_sua_chave
```

### Erro: "Domínio de email não verificado"

O domínio do remetente (`FROM_EMAIL`) não está verificado no Resend. Verifique os registros DNS.

### Erro: "Limite de envios excedido"

Você atingiu o limite do Resend. Opções:
- Aguarde 24h (reset diário)
- Faça upgrade do plano Resend

### Email não chega

1. Verifique spam/lixeira
2. Confira se o domínio está verificado
3. Verifique logs: `supabase functions logs send-invite-email`

### Erro: "Este email já está cadastrado"

O email já possui uma conta no sistema. O convite não pode ser enviado para usuários existentes.

---

## Comandos Úteis

```bash
# Ver status das funções
supabase functions list

# Ver secrets configurados (nomes apenas)
supabase secrets list

# Remover secret
supabase secrets unset NOME_DA_SECRET

# Ver logs em tempo real
supabase functions logs send-invite-email --follow

# Resetar banco local (CUIDADO: apaga dados)
supabase db reset
```

---

## Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│    Frontend     │────▶│    API Route     │────▶│   Edge Function     │
│   InviteCTA     │     │  /invite-batch   │     │ send-invite-email   │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                                                          │
                        ┌─────────────────────────────────┼─────────────────────┐
                        │                                 │                     │
                        ▼                                 ▼                     ▼
                 ┌─────────────┐                 ┌──────────────┐       ┌─────────────┐
                 │  Supabase   │                 │   Tabela     │       │   Resend    │
                 │ Auth Admin  │                 │   invites    │       │    API      │
                 │ generateLink│                 └──────────────┘       └─────────────┘
                 └─────────────┘                                               │
                        │                                                      ▼
                        │                                            ┌─────────────────┐
                        └───────────────────────────────────────────▶│  Email enviado  │
                                   (link de confirmação)             │  ao convidado   │
                                                                     └─────────────────┘
```

---

## Próximos Passos (Futuros)

- [ ] Integração WhatsApp Business (quando disponível)
- [ ] Dashboard de métricas de convites
- [ ] Limite de convites por usuário
- [ ] Gamificação (ranking de indicações)
