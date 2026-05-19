// frontend/domain/chat/Chunk.ts
export interface ChunkMetadata {
    heading_path: string[];   // e.g., ["Capítulo 2", "Tipos de IA"]
    slug: string;
    title: string;
    char_start: number;
    char_end: number;
    // Optional: set on meta_summary chunks to reference the parent document
    parent_source_type?: string;
    parent_slug?: string;
    parent_title?: string;
}

export interface Chunk {
    source_type: string;      // e.g. 'mini_livro', 'newsletter', 'meta_summary'
    source_id: string;
    chunk_index: number;
    content: string;
    metadata: ChunkMetadata;
}

export interface EmbeddedChunk extends Chunk {
    embedding: number[];      // 3072 floats
}

export interface RetrievedChunk extends Chunk {
    similarity: number;       // 0..1, cosine
}
