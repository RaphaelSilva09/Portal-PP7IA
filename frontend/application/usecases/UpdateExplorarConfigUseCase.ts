import type { ExplorarConfig } from "@/domain/entities/ExplorarConfig";
import type { ExplorarConfigRepository } from "@/infrastructure/repositories/ExplorarConfigRepository";

export class UpdateExplorarConfigUseCase {
    constructor(private readonly repo: ExplorarConfigRepository) {}

    async execute(config: ExplorarConfig): Promise<void> {
        return this.repo.upsert(config);
    }
}
