interface MetaGenerationState {
    failed: boolean;
    entityIndexReady: boolean;
}

export function assertCompleteMetaGeneration(state: MetaGenerationState): void {
    if (state.failed) {
        throw new Error("Meta-chunk generation completed with errors. No meta chunks were stored.");
    }
    if (!state.entityIndexReady) {
        throw new Error("Meta-chunk generation completed without an entity index. No meta chunks were stored.");
    }
}
