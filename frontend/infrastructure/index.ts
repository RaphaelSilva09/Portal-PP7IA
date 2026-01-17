/**
 * Infrastructure Layer - Public API
 *
 * Centraliza exports da camada de infraestrutura.
 * ⚠️ Nunca importe diretamente em componentes UI!
 * Use sempre através dos casos de uso.
 */

// Config
export { supabase } from "./config/supabase";

// Repositories
export { SupabaseAuthRepository } from "./repositories/SupabaseAuthRepository";

// Dependency Injection
export { default as DIContainer } from "./di/container";
