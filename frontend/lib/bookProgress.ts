/**
 * Progresso de leitura do livro "Enquanto é Tempo" (PDF 5.4).
 *
 * Guarda o último capítulo/seção acessado por dispositivo (localStorage).
 * Sincronização com o perfil do usuário fica para a v2, junto com as
 * preferências de tipografia (ver docs/sdd/05 e 06).
 */

export const BOOK_PROGRESS_STORAGE_KEY = "pp7ias.book-progress";

/** Tipos de conteúdo que pertencem ao universo do livro. */
export const BOOK_CONTENT_TYPES = new Set(["book", "mini-livro", "ebook", "mini-livro-section"]);

export interface BookProgress {
    href: string;
    title: string;
    type: string;
    savedAt: string;
}

export function saveBookProgress(progress: Omit<BookProgress, "savedAt">): void {
    if (typeof window === "undefined") return;
    if (!progress.href.startsWith("/")) return;
    try {
        const record: BookProgress = { ...progress, savedAt: new Date().toISOString() };
        window.localStorage.setItem(BOOK_PROGRESS_STORAGE_KEY, JSON.stringify(record));
    } catch {
        // storage indisponível — sem progresso persistido
    }
}

export function loadBookProgress(): BookProgress | null {
    if (typeof window === "undefined") return null;
    try {
        const stored = window.localStorage.getItem(BOOK_PROGRESS_STORAGE_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored) as Partial<BookProgress>;
        if (
            typeof parsed?.href !== "string" ||
            !parsed.href.startsWith("/") ||
            typeof parsed.title !== "string" ||
            typeof parsed.type !== "string"
        ) {
            return null;
        }
        return {
            href: parsed.href,
            title: parsed.title,
            type: parsed.type,
            savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
        };
    } catch {
        return null;
    }
}
