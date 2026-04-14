# Playwright - Auth E2E

## Objetivo

Adicionar uma camada browser-level para capturar regressoes que unit/integration tests nao enxergam tao bem:

- redirect SSR de rotas protegidas
- abertura de modais a partir de query params e redirects
- resiliencia a `localStorage` e cookies de sessao corrompidos
- regressao de loading infinito na entrada da aplicacao

## O que a suite cobre hoje

- redirect de `/user` para `/` com modal de login aberto
- `?authModal=login` abrindo modal e limpando URL
- validacao client-side do cadastro
- abertura do fluxo de recuperacao de senha
- UX mobile base iOS-like e Android-like
- `localStorage` de sessao corrompido sem travar a landing page
- sessao antiga parseavel no `localStorage` apos reload
- payload legado parseavel sem formato esperado
- cookie de sessao invalido em `/home` sem prender a aplicacao
- cookie invalido combinado com storage antigo
- fallback do callback `/auth/confirm` sem parametros validos

## Como rodar

Instale as dependencias do frontend e os browsers do Playwright:

```bash
pnpm install
npx playwright install chromium
```

Depois rode:

```bash
pnpm run test:e2e
```

Para rodar focado em mobile:

```bash
pnpm run test:e2e:mobile
pnpm run test:e2e:ios
pnpm run test:e2e:android
```

Para rodar o perfil iOS com engine WebKit/Safari-like quando o host tiver as dependencias necessarias:

```bash
pnpm run test:e2e:ios:safari
```

Modos adicionais:

```bash
pnpm run test:e2e:headed
pnpm run test:e2e:ui
```

## Observacoes

- a suite sobe o app via `next dev` em `http://127.0.0.1:3000`
- ela nao depende de login real para validar resiliencia de sessao
- `ios-touch` usa emulacao de iPhone em Chromium para validar viewport, touch targets e fluxo mobile de forma estavel no host atual
- `ios-safari` usa WebKit + emulacao de iPhone e fica disponivel quando o host tiver as dependencias nativas do WebKit instaladas
- em Fedora 42, o WebKit do Playwright pode continuar falhando mesmo apos instalar dependencias basicas, porque o build fallback de Ubuntu espera bibliotecas de compatibilidade que nao existem por padrao no sistema
- nesse caso, use `ios-touch` localmente e rode `ios-safari` em Ubuntu ou no container oficial do Playwright
- `android-chrome` usa Chromium + device emulation de Pixel, o que e uma boa aproximacao de Android Chrome, mas nao substitui um device Android real
- para E2E de confirmacao de email com clique no link real, ainda e recomendado um Supabase local/dedicado com confirmacao habilitada
