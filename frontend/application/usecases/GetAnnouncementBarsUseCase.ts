/**
 * GetAnnouncementBarsUseCase (Application Layer)
 *
 * Caso de uso para obter todas as barras de aviso, ordenadas por priority DESC.
 */

import { AnnouncementBar } from "../../domain/entities/AnnouncementBar";
import { IAnnouncementBarRepository } from "../../domain/repositories/IAnnouncementBarRepository";

export class GetAnnouncementBarsUseCase {
    constructor(private readonly repo: IAnnouncementBarRepository) {}

    async execute(): Promise<AnnouncementBar[]> {
        const bars = await this.repo.getAll();
        return bars.sort((a, b) => b.priority - a.priority);
    }
}
