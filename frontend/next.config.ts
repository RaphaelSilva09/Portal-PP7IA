import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Empty turbopack config to acknowledge Turbopack and silence the error
    // while we continue using webpack for SVG handling
    turbopack: {},

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

    webpack(config) {
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
