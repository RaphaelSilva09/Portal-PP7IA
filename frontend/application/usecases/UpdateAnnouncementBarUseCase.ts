/**
 * UpdateAnnouncementBarUseCase (Application Layer)
 */

import { AnnouncementBar } from "../../domain/entities/AnnouncementBar";
import { IAnnouncementBarRepository, UpdateAnnouncementBarInput } from "../../domain/repositories/IAnnouncementBarRepository";

export class UpdateAnnouncementBarUseCase {
    constructor(private readonly repo: IAnnouncementBarRepository) {}

    async execute(id: string, input: UpdateAnnouncementBarInput): Promise<AnnouncementBar> {
        return this.repo.update(id, input);
    }
}
