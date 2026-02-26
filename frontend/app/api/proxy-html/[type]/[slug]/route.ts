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

// Mapeamento de tipos de conteúdo para bucket e pastas do Supabase Storage
// Estrutura: Bucket único "materiais" com subpastas por tipo de conteúdo
const STORAGE_CONFIG: Record<string, { bucket: string; folder: string }> = {
    newsletter: { bucket: "materiais", folder: "newsletters" },
    "mini-livro": { bucket: "materiais", folder: "mini-livros/mini" },
    biblioteca: { bucket: "materiais", folder: "biblioteca" },
    "especial-semana": { bucket: "materiais", folder: "especial-da-semana" },
    radar_oportunidades: { bucket: "materiais", folder: "radar-de-oportunidades" },
    estudar: { bucket: "materiais", folder: "estudar" },
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
        const fileName = `${slug}.html`;
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

        // Retorna HTML com headers apropriados
        return new NextResponse(htmlContent, {
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
