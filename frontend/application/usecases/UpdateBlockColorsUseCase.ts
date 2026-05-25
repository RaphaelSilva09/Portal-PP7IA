import type { BlockColors } from "@/domain/entities/BlockColors";
import type { BlockColorsRepository } from "@/infrastructure/repositories/BlockColorsRepository";

export class UpdateBlockColorsUseCase {
    constructor(private readonly repo: BlockColorsRepository) {}

    async execute(colors: BlockColors): Promise<void> {
        return this.repo.upsert(colors);
    }
}
