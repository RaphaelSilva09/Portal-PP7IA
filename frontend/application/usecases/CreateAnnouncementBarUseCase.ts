/**
 * CreateAnnouncementBarUseCase (Application Layer)
 */

import { AnnouncementBar } from "../../domain/entities/AnnouncementBar";
import { CreateAnnouncementBarInput, IAnnouncementBarRepository } from "../../domain/repositories/IAnnouncementBarRepository";

export class CreateAnnouncementBarUseCase {
    constructor(private readonly repo: IAnnouncementBarRepository) {}

    async execute(input: CreateAnnouncementBarInput): Promise<AnnouncementBar> {
        return this.repo.create(input);
    }
}
