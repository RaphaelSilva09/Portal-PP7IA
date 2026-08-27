import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("unsubscribeToken", () => {
    const originalSecret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
    const originalPrevious = process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS;

    beforeEach(() => {
        process.env.UNSUBSCRIBE_TOKEN_SECRET = "current-secret";
        delete process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS;
    });

    afterEach(() => {
        if (originalSecret === undefined) delete process.env.UNSUBSCRIBE_TOKEN_SECRET;
        else process.env.UNSUBSCRIBE_TOKEN_SECRET = originalSecret;
        if (originalPrevious === undefined) delete process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS;
        else process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS = originalPrevious;
    });

    it("assina e verifica um token válido", async () => {
        const { signUnsubscribeToken, verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const token = signUnsubscribeToken("user-123", "weekly_news");
        const payload = verifyUnsubscribeToken(token);

        expect(payload).toEqual({ userId: "user-123", communicationType: "weekly_news" });
    });

    it("não expõe o e-mail nem qualquer texto legível no token", async () => {
        const { signUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const token = signUnsubscribeToken("user-123", "weekly_news");

        expect(token).not.toContain("@");
        expect(token.toLowerCase()).not.toContain("example.com");
    });

    it("rejeita um token adulterado sem alterar o payload identificado", async () => {
        const { signUnsubscribeToken, verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const token = signUnsubscribeToken("user-123", "weekly_news");
        const tampered = `${token.slice(0, -2)}zz`;

        expect(verifyUnsubscribeToken(tampered)).toBeNull();
    });

    it("rejeita token com userId trocado no payload (assinatura não bate)", async () => {
        const { signUnsubscribeToken, verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const token = signUnsubscribeToken("user-123", "weekly_news");
        const [, signature] = token.split(".");
        const forgedPayload = Buffer.from("1.user-999.weekly_news", "utf8").toString("base64url");

        expect(verifyUnsubscribeToken(`${forgedPayload}.${signature}`)).toBeNull();
    });

    it("rejeita entradas malformadas sem lançar exceção", async () => {
        const { verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");

        expect(verifyUnsubscribeToken("")).toBeNull();
        expect(verifyUnsubscribeToken("not-a-token")).toBeNull();
        expect(verifyUnsubscribeToken("a.b.c")).toBeNull();
    });

    it("não expira — token antigo continua válido enquanto o segredo não mudar", async () => {
        const { signUnsubscribeToken, verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const token = signUnsubscribeToken("user-123", "weekly_news");

        // Simula a passagem do tempo: nada no token carrega expiração.
        expect(verifyUnsubscribeToken(token)).not.toBeNull();
    });

    it("aceita tokens assinados com o segredo anterior durante rotação", async () => {
        process.env.UNSUBSCRIBE_TOKEN_SECRET = "old-secret";
        const { signUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const oldToken = signUnsubscribeToken("user-123", "weekly_news");

        process.env.UNSUBSCRIBE_TOKEN_SECRET = "new-secret";
        process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS = "old-secret";
        const { verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");

        expect(verifyUnsubscribeToken(oldToken)).toEqual({ userId: "user-123", communicationType: "weekly_news" });
    });

    it("rejeita tokens assinados com um segredo desconhecido (fora da rotação)", async () => {
        process.env.UNSUBSCRIBE_TOKEN_SECRET = "stale-secret";
        const { signUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");
        const staleToken = signUnsubscribeToken("user-123", "weekly_news");

        process.env.UNSUBSCRIBE_TOKEN_SECRET = "new-secret";
        process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS = "some-other-secret";
        const { verifyUnsubscribeToken } = await import("@/lib/email/unsubscribeToken");

        expect(verifyUnsubscribeToken(staleToken)).toBeNull();
    });
});
