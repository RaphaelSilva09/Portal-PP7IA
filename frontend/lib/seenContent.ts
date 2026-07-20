/**
 * Registro local de conteúdos já visualizados (PDF 5.5).
 *
 * Mapa pathname → ISO timestamp da última visita, em localStorage.
 * Usado para marcar "Atualizado" em cards de conteúdo modificado
 * depois da última leitura neste dispositivo.
 */

export const SEEN_CONTENT_STORAGE_KEY = "pp7ias.seen-content";

/** Limite de entradas para o mapa não crescer sem controle. */
const MAX_ENTRIES = 300;

type SeenMap = Record<string, string>;

function loadMap(): SeenMap {
    if (typeof window === "undefined") return {};
    try {
        const stored = window.localStorage.getItem(SEEN_CONTENT_STORAGE_KEY);
        if (!stored) return {};
        const parsed = JSON.parse(stored) as unknown;
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
        const map: SeenMap = {};
        for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "string") map[key] = value;
        }
        return map;
    } catch {
        return {};
    }
}

export function markSeen(pathname: string): void {
    if (typeof window === "undefined" || !pathname.startsWith("/")) return;
    try {
        const map = loadMap();
        map[pathname] = new Date().toISOString();

        const entries = Object.entries(map);
        const trimmed = entries.length > MAX_ENTRIES
            ? Object.fromEntries(
                  entries.sort((a, b) => b[1].localeCompare(a[1])).slice(0, MAX_ENTRIES),
              )
            : map;

        window.localStorage.setItem(SEEN_CONTENT_STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // storage indisponível — sem registro de leitura
    }
}

export function getSeenAt(pathname: string): Date | null {
    const value = loadMap()[pathname];
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
}

/** true quando o conteúdo foi lido antes e mudou desde a última leitura. */
export function hasUpdateSinceLastSeen(pathname: string | null, updatedAt: Date | null | undefined): boolean {
    if (!pathname || !updatedAt) return false;
    const seenAt = getSeenAt(pathname);
    if (!seenAt) return false;
    return updatedAt.getTime() > seenAt.getTime();
}
