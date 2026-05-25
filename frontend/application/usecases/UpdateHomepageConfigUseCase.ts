import type { HomepageConfig } from "@/domain/entities/HomepageConfig";
import type { SupabaseHomepageConfigRepository } from "@/infrastructure/repositories/SupabaseHomepageConfigRepository";

export class UpdateHomepageConfigUseCase {
    constructor(private readonly repo: SupabaseHomepageConfigRepository) {}

    async execute(config: HomepageConfig): Promise<void> {
        return this.repo.upsert(config);
    }
}
