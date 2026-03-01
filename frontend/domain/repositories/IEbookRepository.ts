/**
 * IEbookRepository Interface (Domain Layer)
 *
 * Define o contrato para operações de E-books.
 *
 * Princípios aplicados:
 * - DIP: Abstração para inversão de dependência
 * - ISP: Interface segregada para operações específicas
 */

import { Ebook } from "../entities/Ebook";

export interface IEbookRepository {
    getAll(): Promise<Ebook[]>;
    getById(id: number): Promise<Ebook | null>;
    getLatest(): Promise<Ebook | null>;
}
