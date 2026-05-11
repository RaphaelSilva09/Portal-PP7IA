/**
 * Infrastructure Layer - Public API
 *
 * Centraliza exports da camada de infraestrutura.
 * ⚠️ Nunca importe diretamente em componentes UI!
 * Use sempre através dos casos de uso.
 */

// Repositories
export { BetterAuthRepository } from "./repositories/BetterAuthRepository";

// Dependency Injection
export { default as DIContainer } from "./di/container";
