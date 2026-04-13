/**
 * GetTodayRegistrationsUseCase (Application Layer)
 *
 * Retorna a lista de usuários que se cadastraram no dia vigente.
 */

import { IUserManagementRepository, UserListItem } from "../../domain/repositories/IUserManagementRepository";

export class GetTodayRegistrationsUseCase {
    constructor(private readonly repo: IUserManagementRepository) {}

    async execute(): Promise<UserListItem[]> {
        return this.repo.getUsersByDate(new Date());
    }
}
