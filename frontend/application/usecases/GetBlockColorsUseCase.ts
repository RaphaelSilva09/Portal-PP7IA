import type { BlockColors } from "@/domain/entities/BlockColors";
import type { BlockColorsRepository } from "@/infrastructure/repositories/BlockColorsRepository";

export class GetBlockColorsUseCase {
    constructor(private readonly repo: BlockColorsRepository) {}

    async execute(): Promise<BlockColors> {
        return this.repo.get();
    }
}
