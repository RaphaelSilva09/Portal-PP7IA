/**
 * GetRadarOportunidadesUseCase (Application Layer)
 *
 * Obtém todos os itens do Radar de Oportunidades.
 * Retorna lista completa e o item mais recente.
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas por obter radar de oportunidades
 * - DIP: Depende de abstração (IRadarOportunidadesRepository)
 */

import type { RadarOportunidades } from "@/domain/entities/RadarOportunidades";
import type { IRadarOportunidadesRepository } from "@/domain/repositories/IRadarOportunidadesRepository";

export interface GetRadarOportunidadesResult {
    latest: RadarOportunidades | null;
    older: RadarOportunidades[];
}

export class GetRadarOportunidadesUseCase {
    constructor(private readonly repository: IRadarOportunidadesRepository) {}

    async execute(): Promise<GetRadarOportunidadesResult> {
        const all = await this.repository.getAll();
        const [latest, ...older] = all;
        return { latest: latest ?? null, older };
    }
}
