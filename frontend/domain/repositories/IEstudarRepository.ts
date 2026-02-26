/**
 * IEstudarRepository Interface (Domain Layer)
 *
 * Define o contrato para operações de conteúdo Estudar.
 *
 * Princípios aplicados:
 * - DIP: Abstração para inversão de dependência
 * - ISP: Interface segregada para operações específicas
 */

import { Estudar } from "../entities/Estudar";

export interface IEstudarRepository {
    getAll(): Promise<Estudar[]>;
    getById(id: number): Promise<Estudar | null>;
    getLatest(): Promise<Estudar | null>;
}
