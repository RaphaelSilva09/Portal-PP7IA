/**
 * DeleteAnnouncementBarUseCase (Application Layer)
 */

import { IAnnouncementBarRepository } from "../../domain/repositories/IAnnouncementBarRepository";

export class DeleteAnnouncementBarUseCase {
    constructor(private readonly repo: IAnnouncementBarRepository) {}

    async execute(id: string): Promise<void> {
        return this.repo.delete(id);
    }
}
