import type { SavedContentEntry, SavedContentView } from "@/domain/entities/SavedContent";

export interface HydratableContentItem {
    id: number;
    title: string;
    formattedDate: string;
    formattedNumber: string;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    readTime: number;
}

/**
 * Hidrata entradas de "salvos" com os dados do conteúdo real, preservando a
 * ordem (mais recentes primeiro). Itens cujo conteúdo original foi removido
 * (lookup retorna null) são descartados silenciosamente — degradação graciosa,
 * o mesmo padrão usado para outros dados agregados no projeto.
 */
export async function hydrateSavedContent(
    entries: SavedContentEntry[],
    lookup: (contentType: string, contentId: string) => Promise<HydratableContentItem | null>,
): Promise<SavedContentView[]> {
    const hydrated = await Promise.all(entries.map(async entry => {
        const item = await lookup(entry.contentType, entry.contentId).catch(() => null);
        if (!item) return null;
        return {
            contentType: entry.contentType,
            contentId: entry.contentId,
            title: item.title,
            href: `/view/${entry.contentType}/${entry.contentId}`,
            createdAt: entry.createdAt,
            id: item.id,
            formattedDate: item.formattedDate,
            formattedNumber: item.formattedNumber,
            htmlAvailable: item.htmlAvailable,
            pdfAvailable: item.pdfAvailable,
            readTime: item.readTime,
        } satisfies SavedContentView;
    }));
    return hydrated.filter((v): v is SavedContentView => v !== null);
}
