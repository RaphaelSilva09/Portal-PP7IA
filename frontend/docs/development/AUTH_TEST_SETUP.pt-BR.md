# Setup Completo - Testes de Auth

## Objetivo

Este guia fecha o setup necessario para rodar:

- Vitest
- Playwright desktop
- Playwright mobile Android-like e iPhone-like
- WebKit/Safari-like opcional
- Supabase local com confirmacao de email

## 1. Pre-requisitos

Voce precisa ter instalado:

- Node.js 20+
- npm
- Git
- Docker Engine + Docker Compose plugin

Para Linux, valide:

```bash
node -v
npm -v
git --version
docker --version
docker compose version
```

## 2. Instalar dependencias do frontend

No diretorio `frontend/`:

```bash
npm install
```

Isso instala:

- Vitest
- Playwright
- Testing Library
- dependencias do app

## 3. Instalar browsers do Playwright

Ainda em `frontend/`:

```bash
npx playwright install chromium
```

Para habilitar WebKit/Safari-like tambem:

```bash
npx playwright install webkit
```

## 4. Instalar dependencias nativas do Playwright

Para Linux, rode:

```bash
sudo npx playwright install-deps
```

Se quiser instalar manualmente apenas o minimo observado neste host:

```bash
sudo apt-get update
sudo apt-get install -y libicu74 libjpeg-turbo8 gstreamer1.0-libav
```

Sem isso:

- `chromium` costuma funcionar
- `webkit` pode falhar ao abrir

### Fedora 42

No Fedora, `sudo npx playwright install-deps` pode falhar porque o Playwright tenta usar `apt-get` como fallback para Ubuntu.

Use `dnf` manualmente:

```bash
sudo dnf install -y libicu74 libjpeg-turbo gstreamer1-plugin-libav
```

Depois, rode novamente:

```bash
npx playwright install webkit
```

Observacoes:

- o aviso `OS is not officially supported` e esperado no Fedora
- para `chromium`, esse aviso normalmente nao impede os testes
- o problema real no seu log foi o `install-deps` tentar usar `apt-get`
- no Fedora 42, mesmo apos instalar essas libs, o WebKit do Playwright fallback de Ubuntu ainda pode falhar ao abrir
- o motivo e que esse build espera ABIs de compatibilidade como `libjpeg.so.8` e `libjxl.so.0.8`, enquanto o Fedora 42 expoe versoes mais novas por padrao
- neste host, considere `ios-touch` como perfil iPhone-like estavel
- para `ios-safari`/WebKit real, prefira um ambiente Ubuntu suportado ou container oficial do Playwright

### Melhor opcao para WebKit no Fedora

Se voce realmente precisa executar `ios-safari`, use um ambiente suportado pelo Playwright:

1. Ubuntu local/VM
2. GitHub Actions `ubuntu-latest`
3. container oficial `mcr.microsoft.com/playwright`

Exemplo via Docker:

```bash
docker run --rm -it \
  -v "$PWD":/work \
  -w /work/frontend \
  mcr.microsoft.com/playwright:v1.59.1-noble \
  bash -lc "npm ci && npm run test:e2e:ios:safari"
```

## 5. Configurar variaveis de ambiente

Na raiz do repositorio:

```bash
cp .env.example .env.local
```

No `frontend/`, garanta tambem um `.env.local` valido. Se precisar copiar do exemplo da raiz, preencha ao menos:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
```

Observacoes:

- `SUPABASE_SERVICE_ROLE_KEY` e necessaria para fluxos admin/e2e mais avancados
- `NEXT_PUBLIC_SITE_URL` e `NEXT_PUBLIC_APP_URL` ajudam no redirect de confirmacao

## 6. Instalar Supabase CLI

Se ainda nao tiver o comando `supabase` no host, instale a CLI.

Opcao recomendada: seguir a instalacao oficial do Supabase CLI para o seu sistema.

Depois valide:

```bash
supabase --version
```

## 7. Subir o Supabase local

Na raiz do repositorio:

```bash
supabase start
```

Isso sobe localmente:

- Postgres
- Auth
- Studio
- Inbucket

O repositorio ja possui `supabase/config.toml` preparado para auth local.

## 8. Confirmar configuracao local de auth

No arquivo `supabase/config.toml`, o ambiente local deve estar com:

- `auth.email.enable_confirmations = true`
- `auth.site_url = "http://127.0.0.1:3000"`
- `additional_redirect_urls` contendo `http://127.0.0.1:3000/auth/confirm`

## 9. Obter credenciais locais do Supabase

Depois de subir o ambiente local:

```bash
supabase status -o env
```

Use a saida para preencher o `.env.local` do frontend com:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 10. Rodar a aplicacao localmente

No diretorio `frontend/`:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## 11. Rodar as suites de teste

Vitest:

```bash
npm test
```

Cobertura:

```bash
npm run test:coverage
```

Playwright desktop:

```bash
npm run test:e2e
```

Playwright mobile:

```bash
npm run test:e2e:mobile
```

Android-like apenas:

```bash
npm run test:e2e:android
```

iPhone-like em Chromium:

```bash
npm run test:e2e:ios
```

iOS Safari/WebKit-like:

```bash
npm run test:e2e:ios:safari
```

## 12. Como validar confirmacao de email localmente

Com `supabase start` rodando, abra o Inbucket local.

Normalmente ele fica disponivel na porta configurada em `supabase/config.toml`.

Fluxo:

1. rode a app local
2. faca um cadastro com email descartavel
3. abra o email recebido no Inbucket
4. clique no link de confirmacao
5. confirme o redirect para `/auth/confirm`
6. confirme a entrada em `/home` sem reload manual

## 13. Problemas comuns

### `supabase: command not found`

Instale a Supabase CLI e valide com `supabase --version`.

### WebKit nao abre

Rode:

```bash
sudo npx playwright install-deps
```

### E2E falha porque o modal de primeiro acesso aparece

Os testes de auth ja isolam esse comportamento quando necessario.

### Confirmacao de email nao chega

Verifique:

- `supabase start` realmente rodando
- `auth.email.enable_confirmations = true`
- `NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000`
- redirect para `/auth/confirm` permitido

## 14. Estado esperado ao final do setup

Quando tudo estiver configurado corretamente, estes comandos devem funcionar:

```bash
npm test
npm run test:e2e
npm run test:e2e:mobile
npm run build
```
