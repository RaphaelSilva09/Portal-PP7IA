/**
 * IRadarOportunidadesRepository Interface (Domain Layer)
 *
 * Define o contrato para operações de Radar de Oportunidades.
 *
 * Princípios aplicados:
 * - DIP: Abstração para inversão de dependência
 * - ISP: Interface segregada para operações específicas
 */

import { RadarOportunidades } from "../entities/RadarOportunidades";

export interface IRadarOportunidadesRepository {
    getAll(): Promise<RadarOportunidades[]>;
    getById(id: number): Promise<RadarOportunidades | null>;
    getLatest(): Promise<RadarOportunidades | null>;
}
