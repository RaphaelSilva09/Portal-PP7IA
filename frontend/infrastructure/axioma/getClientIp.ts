/**
 * Extrai o IP do cliente a partir dos headers de um Request HTTP.
 * Usa x-forwarded-for (primeiro IP da lista) com fallback para x-real-ip.
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return request.headers.get("x-real-ip") ?? "unknown";
}
