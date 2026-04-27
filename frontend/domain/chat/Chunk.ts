// frontend/domain/chat/Chunk.ts
export interface ChunkMetadata {
    heading_path: string[];   // e.g., ["Capítulo 2", "Tipos de IA"]
    slug: string;
    title: string;
    char_start: number;
    char_end: number;
}

export interface Chunk {
    source_type: string;      // 'mini_livro'
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
