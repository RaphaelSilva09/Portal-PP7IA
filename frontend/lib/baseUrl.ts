/** Resolve a origem pública do app a partir de env vars, com fallback pra origem da própria requisição. */
export function resolveBaseUrl(request: Request): string {
    const candidates = [
        process.env.NEXT_PUBLIC_SITE_URL?.trim(),
        process.env.NEXT_PUBLIC_APP_URL?.trim(),
    ];
    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return new URL(candidate).origin;
        } catch {
            continue;
        }
    }
    return new URL(request.url).origin;
}
