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
import { extractStoragePathFromSourcePath } from "@/constants/miniLivroSections";
import DIContainer from "@/infrastructure/di/container";

// Mapeamento de tipos de conteúdo para bucket e pastas do Supabase Storage
// Estrutura: Bucket único "materiais" com subpastas por tipo de conteúdo
const STORAGE_CONFIG: Record<string, { bucket: string; folder: string }> = {
    newsletter: { bucket: "materiais", folder: "newsletters" },
    "mini-livro": { bucket: "materiais", folder: "mini-livros/mini" },
    biblioteca: { bucket: "materiais", folder: "biblioteca" },
    "especial-semana": { bucket: "materiais", folder: "especial-da-semana" },
    editorial: { bucket: "materiais", folder: "editoriais" },
    radar_oportunidades: { bucket: "materiais", folder: "radar-de-oportunidades" },
    estudar: { bucket: "materiais", folder: "estudar" },
    // ebook usa subpasta por slug: mini-livros/ebook/{slug}/introducao_{slug}.html
    ebook: { bucket: "materiais", folder: "mini-livros/ebook" },
    book: { bucket: "materiais", folder: "mini-livros/livro" },
    "mini-livro-section": { bucket: "materiais", folder: "mini-livros/sections" },
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

        // Constrói URL do Supabase Storage
        const config = STORAGE_CONFIG[type];
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
            console.error("NEXT_PUBLIC_SUPABASE_URL não configurado");
            return NextResponse.json({ error: "Configuração do servidor inválida" }, { status: 500 });
        }

        let objectPath: string | null;

        if (type === "mini-livro-section") {
            const sectionId = Number(slug);

            if (!Number.isInteger(sectionId) || sectionId <= 0) {
                return NextResponse.json({ error: "Slug inválido" }, { status: 400 });
            }

            const section = await DIContainer.getMiniLivroSectionRepository().getById(sectionId);
            objectPath = extractStoragePathFromSourcePath(section?.sourceHtmlPath ?? null);
        } else {
            const fileName = type === "ebook" ? `${slug}/introducao_${slug}.html` : `${slug}.html`;
            objectPath = `${config.folder}/${fileName}`;
        }

        if (!objectPath) {
            return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
        }

        // URL pública do arquivo no Supabase Storage
        // Estrutura: {supabase}/storage/v1/object/public/{bucket}/{objectPath}
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/${config.bucket}/${objectPath}`;

        // Busca o arquivo do Supabase (sem cache: conteúdo pode ser atualizado a qualquer momento)
        const response = await fetch(fileUrl, { cache: "no-store" });

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
                // Sem cache: conteúdo gerenciado pelo admin pode mudar a qualquer momento
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Erro no proxy de HTML:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
