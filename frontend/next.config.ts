import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Empty turbopack config to acknowledge Turbopack and silence the error
    // while we continue using webpack for SVG handling
    turbopack: {},

    // Mark Node-only deps as external so Next leaves them as require() at runtime
    // instead of bundling. Required because `pg` (and friends) can't run in the
    // browser. Hooks still importing DIContainer client-side will break at runtime
    // until the API-route refactor lands — see Phase 5c.
    serverExternalPackages: ["pg", "bcrypt", "@node-rs/argon2"],

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
                "pg-native": false,
                child_process: false,
            };
        }
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule: any) => rule.test?.test?.(".svg"));

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
                resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
                use: ["@svgr/webpack"],
            },
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        return config;
    },
};

export default nextConfig;
