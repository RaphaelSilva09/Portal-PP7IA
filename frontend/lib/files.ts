/**
 * Storage path → public URL helper.
 *
 * Storage column values are normalized to "<bucket>/<rest>" (see migration
 * 0004_normalize_storage_paths.sql). Browser <img src> and <a href> need
 * "/api/files/<bucket>/<rest>" so the request hits our route handler that
 * reads from STORAGE_ROOT on the Railway Volume.
 *
 * Pre-migration values were full Supabase URLs (https://...) and a few
 * legacy rows still ship with leading slashes — both pass through.
 */
const FILES_BASE = "/api/files";

export function publicFileUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//.test(trimmed)) return trimmed;
    if (trimmed.startsWith(FILES_BASE)) return trimmed;
    if (trimmed.startsWith("/api/")) return trimmed;
    if (trimmed.startsWith("/view/")) return trimmed;
    const clean = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    return `${FILES_BASE}/${clean}`;
}
