import type { SiteBgRepository } from "@/infrastructure/repositories/SiteBgRepository";
import type { SiteBg } from "@/domain/entities/SiteBg";

export class UpdateSiteBgUseCase {
    constructor(private readonly repo: SiteBgRepository) {}
    execute(bg: SiteBg): Promise<void> {
        return this.repo.upsert(bg);
    }
}
