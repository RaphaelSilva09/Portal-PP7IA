/**
 * Gera um id único para uso client-side (chaves de lista, ids locais).
 *
 * `crypto.randomUUID` só existe em contexto seguro (HTTPS/localhost) —
 * ao acessar o dev server pelo IP da rede (ex.: celular em http://192.168…),
 * a função não é exposta e o acesso direto quebra o app com TypeError.
 * `crypto.getRandomValues` está disponível também em contexto inseguro.
 */
export function generateLocalId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const bytes = crypto.getRandomValues(new Uint8Array(16));
        // Bits de versão (4) e variante (RFC 4122)
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0"));
        return [
            hex.slice(0, 4).join(""),
            hex.slice(4, 6).join(""),
            hex.slice(6, 8).join(""),
            hex.slice(8, 10).join(""),
            hex.slice(10).join(""),
        ].join("-");
    }

    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
