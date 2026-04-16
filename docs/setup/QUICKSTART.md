# ⚡ Quick Start Guide - Portal PP7+IA

Get the Portal PP7+IA project running locally in **5 minutes**!

## 📋 Prerequisites

- **Node.js** 18.x or higher installed
- **Git** installed
- **Supabase account** (free) - [Sign up here](https://supabase.com)

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install (1 minute)

```bash
# Clone the repository
git clone https://github.com/RaphaelSilva09/Portal-PP7IA.git
cd Portal-PP7IA/frontend

# Install dependencies
pnpm install
```

### Step 2: Create Supabase Project (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
    - **Name**: `Portal-PP7IA` (or your preference)
    - **Database Password**: Choose a strong password and save it!
    - **Region**: Choose closest to you (e.g., South America)
4. Click **"Create new project"**
5. Wait ~2 minutes for provisioning

### Step 3: Get API Credentials (30 seconds)

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
    - **Project URL**: `https://xxxxx.supabase.co`
    - **anon public key**: Long JWT token starting with `eyJ...`

### Step 4: Configure Environment Variables (30 seconds)

Create `.env.local` in the `frontend/` folder:

```bash
# In frontend/ directory
cp .env.example .env.local
```

Edit `.env.local` and paste your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important**: Never commit `.env.local` to Git!

### Step 5: Run Database Migrations (1 minute)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the content of `supabase/migrations/001_auth_schema.sql`
4. Paste and click **"Run"** ▶️
5. Repeat for all migration files in order (001, 002, 003, etc.)

> **Tip**: Look for "Success" message after each migration.

### Step 6: Start Development Server (30 seconds)

```bash
# In frontend/ directory
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## ✅ Verify Installation

### Test 1: Page Loads

- You should see the Portal PP7+IA homepage
- No error messages in the browser console

### Test 2: Authentication Works

1. Click **"Login"** or **"Sign Up"** button
2. Try creating an account
3. Check your email for confirmation

### Test 3: Database Connection

Run this query in Supabase SQL Editor:

```sql
-- Check if users table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see `users`, `newsletters`, `mini-livros`, `biblioteca` tables.

## 🎯 Quick Reference

### Common Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linter
pnpm run lint

# Run build test
pnpm run build && pnpm run start
```

### Important Files

| File                   | Purpose                               |
| ---------------------- | ------------------------------------- |
| `.env.local`           | Environment variables (don't commit!) |
| `frontend/app/`        | Pages and routes                      |
| `frontend/components/` | React components                      |
| `supabase/migrations/` | Database schema                       |

### Environment Variables

| Variable                        | Where to Find                                   | Purpose                                      |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API → Project URL         | API endpoint                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public         | Client auth key                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Settings → API → service_role secret | Admin operations (optional, for admin panel) |

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution**: Check that `.env.local` exists in `frontend/` directory with correct values.

```bash
# Verify file exists
ls frontend/.env.local

# Check content
cat frontend/.env.local
```

### Error: "Failed to fetch" or connection refused

**Solutions**:

1. Verify Supabase project is running (check dashboard)
2. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
3. Ensure you copied the **anon public** key, not the service role key

### Error: "relation public.users does not exist"

**Solution**: Run the database migrations (Step 5 above)

### Port 3000 already in use

**Solution**:

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
pnpm run dev -- -p 3001
```

### Page loads but styles look broken

**Solutions**:

1. Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
2. Delete `.next` folder and restart:
    ```bash
    rm -rf .next
    pnpm run dev
    ```

## 📚 Next Steps

Now that you have the project running:

### For Developers

- [**Authentication System**](../architecture/AUTHENTICATION.md) - Understand the auth architecture
- [**Usage Examples**](../../frontend/docs/USAGE_EXAMPLES.md) - Code examples and patterns
- [**Design System**](../../frontend/docs/development/DESIGN_SYSTEM.md) - UI guidelines

### For Admins

- [**Admin Panel Setup**](ADMIN_PANEL.md) - Configure admin access
- [**Supabase Setup**](SUPABASE.md) - Detailed database configuration

### Learn More

- [**Getting Started Guide**](../00-GETTING-STARTED.md) - Comprehensive introduction
- [**Architecture Diagrams**](../../frontend/docs/ARCHITECTURE_DIAGRAMS.md) - Visual documentation
- [**Documentation Index**](../README.md) - All available docs

## 🆘 Still Having Issues?

- Check [Supabase Setup Guide](SUPABASE.md) for detailed instructions
- See [Authentication Docs](../architecture/AUTHENTICATION.md) for auth-specific issues
- Open an issue on [GitHub](https://github.com/RaphaelSilva09/Portal-PP7IA/issues)

---

**⏱️ Setup Time**: ~5 minutes  
**✅ Success Rate**: 99%  
**🎯 Next**: [Configure Admin Panel](ADMIN_PANEL.md)
