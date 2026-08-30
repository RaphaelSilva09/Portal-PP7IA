import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import { resolveBaseUrl } from "@/lib/baseUrl";
import { resend, EMAIL_FROM } from "@/lib/email/resend";
import { renderInviteEmail } from "@/lib/email/templates/invite";

export async function POST(request: Request) {
    try {
        // 1. Autenticação — qualquer usuário logado pode convidar
        const session = await auth.api.getSession({ headers: await nextHeaders() });
        if (!session?.user) {
            return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
        }

        // 2. Validação de input
        const { email } = (await request.json().catch(() => ({}))) as { email?: unknown };

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Email inválido" }, { status: 400 });
        }

        // 3. Registrar o convite (fundação de rastreamento de indicação, PDF 6.4)
        //    e enviar email com link contendo o token — sem criar usuário no banco.
        const { token } = await DIContainer.getReferralRepository().createInvite(session.user.id, email);
        const platformUrl = `${resolveBaseUrl(request)}?ref=${token}`;
        const tpl = renderInviteEmail({ platformUrl });

        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: tpl.subject,
            html: tpl.html,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
