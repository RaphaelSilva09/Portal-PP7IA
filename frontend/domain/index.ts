/**
 * Domain Layer - Public API
 *
 * Centraliza exports da camada de domínio.
 * Facilita imports e mantém encapsulamento.
 */

// Entities
export { User } from "./entities/User";
export type { UserProps } from "./entities/User";

// Errors
export {
    AuthError,
    EmailNotConfirmedError,
    InvalidCredentialsError,
    NetworkError,
    UnknownAuthError,
    UserAlreadyExistsError,
    WeakPasswordError,
} from "./errors/AuthError";

// Repositories
export type { AuthResult, IAuthRepository, SignInParams, SignUpParams } from "./repositories/IAuthRepository";
