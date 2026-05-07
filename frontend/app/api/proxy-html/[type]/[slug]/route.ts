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
import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

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
export async function GET(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
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

        const config = STORAGE_CONFIG[type];
        // Ebook usa subpasta por slug: mini-livros/ebook/{slug}/introducao_{slug}.html
        const fileName = type === "ebook" ? `${slug}/introducao_${slug}.html` : `${slug}.html`;

        // Read directly from Railway Volume (mounted at STORAGE_ROOT)
        // Path on disk: STORAGE_ROOT/{bucket}/{folder}/{filename}
        const root = path.resolve(STORAGE_ROOT);
        const target = path.resolve(root, config.bucket, config.folder, fileName);

        if (target !== root && !target.startsWith(root + path.sep)) {
            return NextResponse.json({ error: "Caminho inválido" }, { status: 400 });
        }

        let htmlContent: string;
        try {
            htmlContent = await fs.readFile(target, "utf8");
        } catch (err: unknown) {
            const code = (err as { code?: string }).code;
            if (code === "ENOENT") {
                return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
            }
            throw err;
        }

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
                // Sem cache: conteúdo gerenciado pelo admin pode mudar a qualquer momento
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Erro no proxy de HTML:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
