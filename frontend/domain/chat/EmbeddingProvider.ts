// frontend/domain/chat/EmbeddingProvider.ts
export interface EmbeddingProvider {
    /** Embed a single text. Returns a vector of fixed dimension (3072 for Gemini). */
    embed(text: string): Promise<number[]>;

    /** Embed a batch. Implementations should call the provider's batch endpoint. */
    embedBatch(texts: string[]): Promise<number[][]>;
}
