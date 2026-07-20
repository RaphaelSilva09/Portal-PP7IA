import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import { resolveBaseUrl } from "@/lib/baseUrl";
import { resend, EMAIL_FROM } from "@/lib/email/resend";

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

        const { error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: "Você foi convidado para o Portal PP7+IAS",
            html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Convite – Comunidade PP7+IAS</title>
</head>
<body style="margin:0; padding:0; background-color:#111111; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background-color:#1a1a1a; border-radius:10px; padding:28px;">

          <tr>
            <td style="color:#dadada; font-size:16px; line-height:1.6;">
              <p style="margin-top:0;">Olá!</p>
              <p>
                Você foi indicado por um amigo para fazer parte da
                <strong>Comunidade PP7+IAS</strong>, onde compartilhamos
                curadoria semanal de conteúdos relevantes.
              </p>
              <p>
                Para confirmar sua participação e escolher como deseja receber
                nossos conteúdos, clique no botão abaixo:
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 0;">
              <a href="${platformUrl}"
                 style="background-color:#3b9eff; color:#111111; text-decoration:none;
                        padding:14px 30px; border-radius:8px; font-size:16px;
                        font-weight:bold; display:inline-block;">
                QUERO PARTICIPAR
              </a>
            </td>
          </tr>

          <tr>
            <td style="color:#acacac; font-size:15px; line-height:1.6;">
              <p>
                Ao clicar, você será direcionado para nossa página onde poderá
                criar sua conta e definir suas preferências de recebimento.
              </p>
              <p style="margin-top:28px; color:#dadada;">
                Seja bem-vindo(a)!<br>
                <strong>— Equipe PP7+IAS</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}
