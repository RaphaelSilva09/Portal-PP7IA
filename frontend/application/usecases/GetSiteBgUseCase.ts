import type { SiteBgRepository } from "@/infrastructure/repositories/SiteBgRepository";
import type { SiteBg } from "@/domain/entities/SiteBg";

export class GetSiteBgUseCase {
    constructor(private readonly repo: SiteBgRepository) {}
    execute(): Promise<SiteBg> {
        return this.repo.get();
    }
}
