import type { HomepageConfig } from "@/domain/entities/HomepageConfig";
import type { PostgresHomepageConfigRepository } from "@/infrastructure/repositories/PostgresHomepageConfigRepository";

export class GetHomepageConfigUseCase {
    constructor(private readonly repo: PostgresHomepageConfigRepository) {}

    async execute(): Promise<HomepageConfig> {
        return this.repo.get();
    }
}
