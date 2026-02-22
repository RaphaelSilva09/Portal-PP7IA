/**
 * GetEspecialSemanaUseCase (Application Layer)
 *
 * Obtém todos os especiais da semana cadastrados.
 * Ordena por ID decrescente (mais recente primeiro).
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por obter especiais da semana
 * - DIP: Depende de abstração (IEspecialSemanaRepository)
 */

import type { EspecialSemana } from "@/domain/entities/EspecialSemana";
import type { IEspecialSemanaRepository } from "@/domain/repositories/IEspecialSemanaRepository";

export class GetEspecialSemanaUseCase {
    constructor(private readonly especialSemanaRepository: IEspecialSemanaRepository) {}

    async execute(): Promise<EspecialSemana[]> {
        return await this.especialSemanaRepository.getAll();
    }

    async getLatest(): Promise<EspecialSemana | null> {
        return await this.especialSemanaRepository.getLatest();
    }
}
