/**
 * GET    /api/admin/content-access-rules/[type]/[slug] — regra salva para o conteúdo, se houver
 * PUT    /api/admin/content-access-rules/[type]/[slug] — cria ou substitui a regra de bloqueio do conteúdo
 * DELETE /api/admin/content-access-rules/[type]/[slug] — remove a regra de bloqueio do conteúdo
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ type: string; slug: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type, slug } = await params;
    const rule = await DIContainer.getContentAccessRuleRepository().getRule(type, slug);
    return NextResponse.json({
        rule: rule ? { ruleType: rule.ruleType, params: rule.params } : null,
    });
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; slug: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type, slug } = await params;
    const body = await request.json().catch(() => null);
    if (typeof body?.ruleType !== "string") {
        return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
    const params_: Record<string, unknown> =
        typeof body.params === "object" && body.params !== null ? body.params : {};

    try {
        await DIContainer.getUpsertContentAccessRuleUseCase().execute({
            contentType: type,
            slug,
            ruleType: body.ruleType,
            params: params_,
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao salvar regra de acesso" },
            { status: 400 },
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ type: string; slug: string }> },
) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { type, slug } = await params;

    try {
        await DIContainer.getRemoveContentAccessRuleUseCase().execute(type, slug);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao remover regra de acesso" },
            { status: 500 },
        );
    }
}
