import type { NextConfig } from "next";

type WebpackRule = {
    test?: {
        test?: (value: string) => boolean;
    };
    issuer?: unknown;
    resourceQuery?: {
        not?: RegExp[];
    };
    exclude?: RegExp;
    [key: string]: unknown;
};

function isWebpackRule(rule: unknown): rule is WebpackRule {
    return typeof rule === "object" && rule !== null;
}

// CSP em modo Report-Only (fase C do plano de correção de segurança).
// NÃO habilita enforcement — apenas coleta violações via console/relatório
// para validar a política antes de virar `Content-Security-Policy` real.
// Ver docs/quality/pp7ias/DECISIONS.md para o inventário de origens que
// sustenta cada diretiva e o runbook de rollout faseado (Report-Only →
// staging enforcement → produção, com aprovação em cada etapa).
//
// Diretivas por classe de rota:
// - Páginas do portal (default): next/font faz self-host em build-time (sem
//   fonts.googleapis/gstatic em runtime); @vercel/analytics injeta script e
//   beacon para domínios vercel-insights/vercel-scripts quando habilitado
//   (NEXT_PUBLIC_VERCEL_ANALYTICS=true); eruda (debug) só carrega com
//   NEXT_PUBLIC_AUTH_DEBUG=true via cdn.jsdelivr.net — não usado em produção,
//   mas mantido na política pois pode ser ligado via env em qualquer ambiente.
// - /api/proxy-html/*: serve HTML curado pelo admin (sem sanitização) para
//   ser embutido pelo próprio portal via <iframe sandbox=...>. `frame-ancestors`
//   aqui precisa permitir 'self' (o próprio portal embute), não 'none'.
const PORTAL_CSP_DIRECTIVES = [
    "default-src 'self'",
    // 'unsafe-inline' no script-src seria necessário apenas se Next injetar
    // scripts inline sem nonce/hash; hoje não observamos isso nas páginas
    // testadas localmente — mantido fora até prova em contrário durante a
    // fase Report-Only. cdn.jsdelivr.net é exclusivo do console de debug
    // eruda (atrás de NEXT_PUBLIC_AUTH_DEBUG).
    "script-src 'self' https://cdn.jsdelivr.net https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
    // O próprio portal embute /api/proxy-html/* em <iframe> nas páginas /view/*.
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
    // Empty turbopack config to acknowledge Turbopack and silence the error
    // while we continue using webpack for SVG handling
    turbopack: {},

    // Mark Node-only deps as external so Next leaves them as require() at runtime
    // instead of bundling. Required because `pg` (and friends) can't run in the
    // browser. Hooks still importing DIContainer client-side will break at runtime
    // until the API-route refactor lands — see Phase 5c.
    // puppeteer-core/@sparticuz/chromium (produção) e puppeteer (dev local, só
    // devDependency) usados por /api/export-pdf — precisam ficar fora do bundle
    // do webpack e ser resolvidos via require() normal em runtime, senão o
    // binário do Chromium referenciado internamente não é encontrado.
    serverExternalPackages: ["pg", "bcrypt", "@node-rs/argon2", "puppeteer-core", "@sparticuz/chromium", "puppeteer"],

    // Headers de segurança - sem Permissions-Policy para evitar warnings de features experimentais
    async headers() {
        return [
            // no-cache nas páginas: força revalidação com o servidor antes de usar cache
            // Garante que após deploys o browser busca o HTML atualizado (sem precisar de hard refresh)
            // Não afeta /_next/static/ (bundles com content-hash → cache imutável seguro)
            {
                source: "/((?!_next|api|favicon\\.ico).*)",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "no-cache",
                    },
                ],
            },
            // Permite iframes do mesmo domínio (necessário para /view pages com /api/proxy-html)
            // Bloqueia iframes de origens externas (protege contra clickjacking)
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN", // Alterado de DENY para permitir iframes internos
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    // Report-Only: apenas observa/loga violações, não bloqueia nada.
                    // Não substitui o item CSP do plano de correção — enforcement
                    // exige validação em staging e aprovação (ver DECISIONS.md).
                    {
                        key: "Content-Security-Policy-Report-Only",
                        value: PORTAL_CSP_DIRECTIVES,
                    },
                ],
            },
        ];
    },

    webpack(config, { isServer }) {
        // jsdom usa fs.readFileSync com __dirname para carregar default-stylesheet.css.
        // Quando webpack empacota jsdom, __dirname é substituído pelo diretório virtual do bundle
        // e o caminho do CSS quebra. Externalizar jsdom faz o Node resolver o módulo real em runtime,
        // preservando o __dirname correto.
        if (isServer) {
            config.externals = [...(Array.isArray(config.externals) ? config.externals : [config.externals]), 'jsdom'];
        }

        // pg + native deps reach into Node built-ins (fs, dns, net, tls). Stub them out
        // when targeting the browser bundle. lib/db is server-only; if it's reached
        // from a "use client" file, the call will throw at runtime — Phase 5c moves
        // those reads behind /api/* routes.
        if (!isServer) {
            config.resolve = config.resolve ?? {};
            config.resolve.fallback = {
                ...(config.resolve.fallback ?? {}),
                fs: false,
                dns: false,
                net: false,
                tls: false,
                child_process: false,
                "pg-native": false,
                pg: false,
                "pg-connection-string": false,
                "pg-pool": false,
                "pg-cloudflare": false,
                bcrypt: false,
                "@node-rs/argon2": false,
                "node:fs": false,
                "node:dns": false,
                "node:net": false,
                "node:tls": false,
                "node:crypto": false,
                "node:path": false,
                "node:os": false,
                "node:stream": false,
            };
        }
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find(
            (rule: unknown): rule is WebpackRule => isWebpackRule(rule) && rule.test?.test?.(".svg") === true,
        );

        if (!fileLoaderRule) {
            return config;
        }

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/, // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not ?? []), /url/] }, // exclude if *.svg?url
                use: ["@svgr/webpack"],
            },
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        return config;
    },
};

export default nextConfig;
