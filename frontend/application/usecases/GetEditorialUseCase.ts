/**
 * GetEditorialUseCase (Application Layer)
 *
 * Obtém o conteúdo editorial singleton.
 */

import { Editorial } from "../../domain/entities/Editorial";
import { IEditorialRepository } from "../../domain/repositories/IEditorialRepository";

export class GetEditorialUseCase {
    constructor(private readonly repo: IEditorialRepository) {}

    async execute(): Promise<Editorial | null> {
        return this.repo.get();
    }
}
