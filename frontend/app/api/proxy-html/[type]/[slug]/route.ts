/**
 * API Route: Proxy de Arquivos HTML do Supabase Storage
 *
 * Serve arquivos HTML armazenados no Supabase Storage através do domínio
 * do portal, permitindo exibição em iframe sem problemas de X-Frame-Options.
 *
 * Fluxo:
 * 1. Recebe requisição: /api/proxy-html/{type}/{slug}
 * 2. Valida tipo e slug
 * 3. Busca arquivo no Supabase Storage
 * 4. Retorna HTML com headers apropriados
 *
 * Segurança:
 * - Validação rigorosa de tipo e slug
 * - Apenas tipos permitidos (newsletter, biblioteca, etc)
 * - Sanitização de entrada contra path traversal
 * - Headers de segurança adequados
 */


import { NextRequest, NextResponse } from "next/server";

const LIGHT_THEME_PATCH = `
<style>
  :root { color-scheme: light; }
  html, body { background: #eef4ff !important; color: #162338 !important; }
  body { font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif !important; }
  body :is(.text-white, .text-white\/90, .text-white\/80) { color: #162338 !important; }
  body :is(.text-white\/70, .text-white\/60, .text-white\/50, .text-white\/40, .text-white\/30, .text-white\/20) { color: #475569 !important; }
  body :is(.text-gray-200, .text-slate-200, .text-zinc-200) { color: #1e293b !important; }
  body :is(.text-gray-300, .text-slate-300, .text-zinc-300) { color: #334155 !important; }
  body :is(.text-gray-400, .text-slate-400, .text-zinc-400) { color: #475569 !important; }
  body :is(.text-blue-400, .text-blue-500, .text-blue-600, .text-brand-blue) { color: #1d4ed8 !important; }
  body :is(.text-green-400, .text-green-500, .text-green-600, .text-brand-green, .text-brand-emerald) { color: #166534 !important; }
  body :is(.text-yellow-400, .text-yellow-500, .text-yellow-600, .text-brand-yellow) { color: #a16207 !important; }
  body :is(.text-orange-400, .text-orange-500, .text-orange-600, .text-brand-orange) { color: #c2410c !important; }
  body :is(.text-purple-400, .text-purple-500, .text-purple-600, .text-brand-purple) { color: #6d28d9 !important; }
  body :is(.text-red-400, .text-red-500, .text-red-600) { color: #b91c1c !important; }
  body :is(.text-cyan-400, .text-cyan-500, .text-cyan-600) { color: #0e7490 !important; }
  body :is(.bg-black, .bg-black\/80, .bg-black\/75, .bg-black\/70, .bg-black\/60) {
    background-color: rgba(255, 255, 255, 0.86) !important;
    background-image: none !important;
  }
  body [class*="bg-[#111111]"],
  body [class*="bg-[#0a0a0f]"],
  body [class*="bg-[#111118]"],
  body [class*="bg-[#1a1a2e]"],
  body [class*="bg-[#161616]"] {
    background-color: rgba(255, 255, 255, 0.86) !important;
    background-image: none !important;
  }
  body :is(.bg-white\/5, .bg-white\/10, .bg-white\/15, .bg-white\/20) {
    background-color: rgba(255, 255, 255, 0.82) !important;
  }
  body :is(.border-white\/10, .border-white\/20, .border-white\/5) { border-color: rgba(99, 132, 181, 0.18) !important; }
  body :is(.border-gray-500\/20, .border-slate-500\/20, .border-zinc-500\/20) { border-color: rgba(99, 132, 181, 0.2) !important; }
  body a { color: inherit; }
</style>`;

function injectLightThemePatch(html: string): string {
    if (!html.includes("</head>")) {
        return LIGHT_THEME_PATCH + html;
    }

    return html.replace("</head>", `${LIGHT_THEME_PATCH}</head>`);
}

// Mapeamento de tipos de conteúdo para bucket e pastas do Supabase Storage
// Estrutura: Bucket único "materiais" com subpastas por tipo de conteúdo
const STORAGE_CONFIG: Record<string, { bucket: string; folder: string }> = {
    newsletter: { bucket: "materiais", folder: "newsletters" },
    "mini-livro": { bucket: "materiais", folder: "mini-livros/mini" },
    biblioteca: { bucket: "materiais", folder: "biblioteca" },
    "especial-semana": { bucket: "materiais", folder: "especial-da-semana" },
    radar_oportunidades: { bucket: "materiais", folder: "radar-de-oportunidades" },
    estudar: { bucket: "materiais", folder: "estudar" },
    // ebook usa subpasta por slug: mini-livros/ebook/{slug}/introducao_{slug}.html
    ebook: { bucket: "materiais", folder: "mini-livros/ebook" },
    book: { bucket: "materiais", folder: "mini-livros/livro" },
};

// Tipos válidos de conteúdo
const VALID_TYPES = Object.keys(STORAGE_CONFIG);

/**
 * Valida slug para prevenir path traversal attacks
 * Permite apenas: letras, números, hífens, underscores
 */
function isValidSlug(slug: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(slug);
}

/**
 * GET /api/proxy-html/[type]/[slug]
 *
 * Retorna o conteúdo HTML do arquivo solicitado do Supabase Storage
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
    try {
        const { type, slug } = await params;
        const theme = request.nextUrl.searchParams.get("theme") ?? "dark";

        // Validação 1: Tipo válido
        if (!VALID_TYPES.includes(type)) {
            return NextResponse.json({ error: "Tipo de conteúdo inválido" }, { status: 400 });
        }

        // Validação 2: Slug seguro (previne path traversal)
        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
        }

        // Constrói URL do Supabase Storage
        const config = STORAGE_CONFIG[type];
        // Ebook usa subpasta por slug: mini-livros/ebook/{slug}/introducao_{slug}.html
        const fileName = type === "ebook" ? `${slug}/introducao_${slug}.html` : `${slug}.html`;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
            console.error("NEXT_PUBLIC_SUPABASE_URL não configurado");
            return NextResponse.json({ error: "Configuração do servidor inválida" }, { status: 500 });
        }

        // URL pública do arquivo no Supabase Storage
        // Estrutura: {supabase}/storage/v1/object/public/{bucket}/{folder}/{filename}
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/${config.bucket}/${config.folder}/${fileName}`;

        // Busca o arquivo do Supabase
        const response = await fetch(fileUrl);

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
            }
            console.error(`Erro ao buscar arquivo do Supabase: ${response.status} ${response.statusText}`);
            return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: response.status });
        }

        // Obtém conteúdo HTML
        const htmlContent = await response.text();
        const themedContent = theme === "light" ? injectLightThemePatch(htmlContent) : htmlContent;

        // Retorna HTML com headers apropriados
        return new NextResponse(themedContent, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                // Permite iframe apenas do mesmo domínio (necessário para /view/[type]/[slug])
                "X-Frame-Options": "SAMEORIGIN",
                // Headers de segurança
                "X-Content-Type-Options": "nosniff",
                "X-XSS-Protection": "1; mode=block",
                // Cache: 1 hora (arquivos raramente mudam)
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Erro no proxy de HTML:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
