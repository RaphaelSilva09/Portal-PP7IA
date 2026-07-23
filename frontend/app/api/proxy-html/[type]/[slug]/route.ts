/**
 * API Route: Proxy de Arquivos HTML do storage de arquivos
 *
 * Serve arquivos HTML armazenados no storage de arquivos através do domínio
 * do portal, permitindo exibição em iframe sem problemas de X-Frame-Options.
 *
 * Fluxo:
 * 1. Recebe requisição: /api/proxy-html/{type}/{slug}
 * 2. Valida tipo e slug
 * 3. Busca arquivo no storage de arquivos
 * 4. Retorna HTML com headers apropriados
 *
 * Segurança:
 * - Validação rigorosa de tipo e slug
 * - Apenas tipos permitidos (newsletter, biblioteca, etc)
 * - Sanitização de entrada contra path traversal
 * - Headers de segurança adequados
 */
import { promises as fs } from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { resolveContentFilePath } from "@/lib/contentStorage";

/**
 * GET /api/proxy-html/[type]/[slug]
 *
 * Retorna o conteúdo HTML do arquivo solicitado do storage de arquivos
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
    try {
        const { type, slug } = await params;

        const resolved = await resolveContentFilePath(type, slug);
        if (!resolved.ok) {
            return NextResponse.json({ error: resolved.error }, { status: resolved.status });
        }

        let htmlContent: string;
        try {
            htmlContent = await fs.readFile(resolved.absolutePath, "utf8");
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
