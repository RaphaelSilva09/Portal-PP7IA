// frontend/domain/chat/ContentSource.ts
export interface SourceItem {
    source_id: string;
    title: string;
    slug: string;
    html: string;
}

export interface ContentSource {
    sourceType: string;          // 'mini_livro'
    fetchAll(): Promise<SourceItem[]>;
}
