import { describe, expect, it } from "vitest";
import { EMAIL_COLORS, renderCodeBox, renderEmailCta, renderTransactionalEmail } from "@/lib/email/emailTheme";
import { renderEmailVerificationLinkEmail } from "@/lib/email/templates/email-verification-link";
import { renderResetPasswordOtpEmail } from "@/lib/email/templates/reset-password-otp";
import { renderInviteEmail } from "@/lib/email/templates/invite";

describe("renderTransactionalEmail (shell compartilhado)", () => {
    it("usa a mesma paleta sépia do resumo semanal", () => {
        const html = renderTransactionalEmail({
            title: "x",
            preheader: "x",
            kicker: "x",
            heading: "x",
            bodyHtml: "<p>corpo</p>",
        });

        expect(html).toContain(EMAIL_COLORS.pageBg);
        expect(html).toContain(EMAIL_COLORS.panelBg);
        expect(html).toContain("PP7");
        expect(html).toContain("IAS");
        expect(html).toContain("<p>corpo</p>");
    });

    it("escapa o texto de título/kicker/heading (evita quebrar o HTML ou injetar markup)", () => {
        const html = renderTransactionalEmail({
            title: "x",
            preheader: "x",
            kicker: "<script>x</script>",
            heading: "x",
            bodyHtml: "<p>corpo</p>",
        });

        expect(html).not.toContain("<script>x</script>");
        expect(html).toContain("&lt;script&gt;");
    });

    it("CTA só aparece quando fornecido, e o href é escapado", () => {
        const semCta = renderTransactionalEmail({ title: "x", preheader: "x", kicker: "x", heading: "x", bodyHtml: "x" });
        expect(semCta).not.toContain("Clicar");

        const comCta = renderTransactionalEmail({
            title: "x",
            preheader: "x",
            kicker: "x",
            heading: "x",
            bodyHtml: "x",
            cta: { href: "https://example.com/?a=1&b=2", label: "Clicar" },
        });
        expect(comCta).toContain("Clicar");
        expect(comCta).toContain("https://example.com/?a=1&amp;b=2");
    });

    it("footnoteHtml e extraHtml só aparecem quando fornecidos", () => {
        const html = renderTransactionalEmail({
            title: "x",
            preheader: "x",
            kicker: "x",
            heading: "x",
            bodyHtml: "x",
            extraHtml: "<div>extra-marker</div>",
            footnoteHtml: "footnote-marker",
        });

        expect(html).toContain("extra-marker");
        expect(html).toContain("footnote-marker");
    });
});

describe("renderEmailCta", () => {
    it("monta um link com o label e o href escapado", () => {
        const html = renderEmailCta("https://example.com/?a=1&b=2", "Confirmar");
        expect(html).toContain("Confirmar");
        expect(html).toContain("https://example.com/?a=1&amp;b=2");
    });
});

describe("renderCodeBox", () => {
    it("mostra o código e o rótulo padrão", () => {
        const html = renderCodeBox("12345678");
        expect(html).toContain("12345678");
        expect(html).toContain("SEU CÓDIGO");
    });

    it("aceita um rótulo customizado", () => {
        const html = renderCodeBox("12345678", "CÓDIGO DE CONVITE");
        expect(html).toContain("CÓDIGO DE CONVITE");
    });
});

describe("renderEmailVerificationLinkEmail", () => {
    it("inclui o link de confirmação e usa a paleta compartilhada", () => {
        const tpl = renderEmailVerificationLinkEmail({ url: "https://pp7ias-portal.com.br/verify?token=abc" });

        expect(tpl.subject).toBe("Confirme seu e-mail – PP7+IAS");
        expect(tpl.html).toContain("https://pp7ias-portal.com.br/verify?token=abc");
        expect(tpl.html).toContain(EMAIL_COLORS.pageBg);
        expect(tpl.html).toContain("Confirmar e-mail");
    });
});

describe("renderResetPasswordOtpEmail", () => {
    it("mostra o código na caixa de destaque e usa a paleta compartilhada", () => {
        const tpl = renderResetPasswordOtpEmail({ otp: "87654321" });

        expect(tpl.subject).toBe("Código de recuperação – PP7+IAS");
        expect(tpl.html).toContain("87654321");
        expect(tpl.html).toContain(EMAIL_COLORS.pageBg);
    });
});

describe("renderInviteEmail", () => {
    it("inclui o link da plataforma e usa a paleta compartilhada", () => {
        const tpl = renderInviteEmail({ platformUrl: "https://pp7ias-portal.com.br/?ref=xyz" });

        expect(tpl.subject).toBe("Você foi convidado para o Portal PP7+IAS");
        expect(tpl.html).toContain("https://pp7ias-portal.com.br/?ref=xyz");
        expect(tpl.html).toContain(EMAIL_COLORS.pageBg);
        expect(tpl.html).toContain("Quero participar");
    });
});
