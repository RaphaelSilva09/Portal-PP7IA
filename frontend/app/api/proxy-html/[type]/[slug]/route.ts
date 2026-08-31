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
import { getUser } from "@/infrastructure/auth/getUser";
import DIContainer from "@/infrastructure/di/container";
import type { ContentAccessResult } from "@/application/usecases/EvaluateContentAccessUseCase";

/**
 * Checa a regra de acesso do conteúdo ANTES de qualquer leitura de arquivo —
 * este é o ponto de verdade da segurança: a página `/view` também checa,
 * mas só aqui o HTML de fato sai do storage. Bloqueado = 403 (não 404, para
 * não confundir com "arquivo não existe").
 */
async function checkAccess(type: string, slug: string): Promise<ContentAccessResult> {
    const user = await getUser();
    return DIContainer.getEvaluateContentAccessUseCase().execute({
        contentType: type,
        slug,
        userId: user?.id ?? null,
        role: user?.role ?? null,
    });
}

/** Serializa o DTO de bloqueio num header — sobrevive a respostas HEAD, que não têm corpo. */
function accessDeniedHeaders(access: Extract<ContentAccessResult, { allowed: false }>): HeadersInit {
    return { "X-Access-Rule": encodeURIComponent(JSON.stringify(access.view)) };
}

/**
 * GET /api/proxy-html/[type]/[slug]
 *
 * Retorna o conteúdo HTML do arquivo solicitado do storage de arquivos
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
    try {
        const { type, slug } = await params;

        const access = await checkAccess(type, slug);
        if (!access.allowed) {
            return NextResponse.json(
                { error: "Acesso restrito", accessRule: access.view },
                { status: 403, headers: accessDeniedHeaders(access) },
            );
        }

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

export async function HEAD(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
    try {
        const { type, slug } = await params;

        const access = await checkAccess(type, slug);
        if (!access.allowed) {
            return new Response(null, { status: 403, headers: accessDeniedHeaders(access) });
        }

        const resolved = await resolveContentFilePath(type, slug);
        if (!resolved.ok) {
            return new Response(null, { status: resolved.status });
        }

        return new Response(null, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "X-Frame-Options": "SAMEORIGIN",
                "X-Content-Type-Options": "nosniff",
                "X-XSS-Protection": "1; mode=block",
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Erro no HEAD do proxy de HTML:", error);
        return new Response(null, { status: 500 });
    }
}
