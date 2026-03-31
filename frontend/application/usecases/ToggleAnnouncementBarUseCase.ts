/**
 * ToggleAnnouncementBarUseCase (Application Layer)
 *
 * Alterna o campo is_active de uma barra de aviso sem abrir o formulário.
 */

import { IAnnouncementBarRepository } from "../../domain/repositories/IAnnouncementBarRepository";

export class ToggleAnnouncementBarUseCase {
    constructor(private readonly repo: IAnnouncementBarRepository) {}

    async execute(id: string, isActive: boolean): Promise<void> {
        return this.repo.toggle(id, isActive);
    }
}
