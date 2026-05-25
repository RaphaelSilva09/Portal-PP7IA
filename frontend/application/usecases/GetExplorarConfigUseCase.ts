import type { ExplorarConfig } from "@/domain/entities/ExplorarConfig";
import type { ExplorarConfigRepository } from "@/infrastructure/repositories/ExplorarConfigRepository";

export class GetExplorarConfigUseCase {
    constructor(private readonly repo: ExplorarConfigRepository) {}

    async execute(): Promise<ExplorarConfig> {
        return this.repo.get();
    }
}
