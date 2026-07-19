import type { HomepageConfig } from "@/domain/entities/HomepageConfig";
import type { PostgresHomepageConfigRepository } from "@/infrastructure/repositories/PostgresHomepageConfigRepository";

export class UpdateHomepageConfigUseCase {
    constructor(private readonly repo: PostgresHomepageConfigRepository) {}

    async execute(config: HomepageConfig): Promise<void> {
        return this.repo.upsert(config);
    }
}
