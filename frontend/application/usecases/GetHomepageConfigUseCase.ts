import type { HomepageConfig } from "@/domain/entities/HomepageConfig";
import type { SupabaseHomepageConfigRepository } from "@/infrastructure/repositories/SupabaseHomepageConfigRepository";

export class GetHomepageConfigUseCase {
    constructor(private readonly repo: SupabaseHomepageConfigRepository) {}

    async execute(): Promise<HomepageConfig> {
        return this.repo.get();
    }
}
