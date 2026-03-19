/**
 * IEditorialRepository (Domain Layer)
 *
 * Interface do repositório de editorial.
 * Define o contrato sem depender de infraestrutura.
 */

import { Editorial } from "../entities/Editorial";

export interface IEditorialRepository {
    get(): Promise<Editorial | null>;
    save(content: string): Promise<void>;
}
