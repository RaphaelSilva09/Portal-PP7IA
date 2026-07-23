/**
 * Captura e atribuição do token de indicação (?ref=) — fundação de
 * rastreamento para benefícios por indicação (PDF 6.4).
 *
 * O token é lido da URL no primeiro acesso e guardado em localStorage até o
 * cadastro acontecer (ou expirar), quando é enviado ao servidor pra vincular
 * o indicado ao convite original.
 */

const STORAGE_KEY = "pp7ias.referral-token";
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

interface StoredReferral {
    token: string;
    capturedAt: number;
}

/** Chamar uma vez por carregamento de página (client-only). */
export function captureReferralTokenFromUrl(): void {
    if (typeof window === "undefined") return;
    try {
        const token = new URLSearchParams(window.location.search).get("ref");
        if (!token) return;
        const stored: StoredReferral = { token, capturedAt: Date.now() };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
        // localStorage indisponível (modo privado etc.) — indicação simplesmente não é atribuída
    }
}

function readStoredReferral(): StoredReferral | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<StoredReferral>;
        if (typeof parsed.token !== "string" || typeof parsed.capturedAt !== "number") return null;
        if (Date.now() - parsed.capturedAt > ATTRIBUTION_WINDOW_MS) return null;
        return parsed as StoredReferral;
    } catch {
        return null;
    }
}

export function clearStoredReferralToken(): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignora
    }
}

/** Chamar depois de um cadastro bem-sucedido — fire-and-forget, nunca bloqueia o fluxo de signup. */
export function attributeReferralIfPresent(): void {
    const stored = readStoredReferral();
    if (!stored) return;

    fetch("/api/referrals/attribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: stored.token }),
    })
        .catch(() => {})
        .finally(() => clearStoredReferralToken());
}
