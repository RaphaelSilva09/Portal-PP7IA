/**
 * Domain Layer - Public API
 *
 * Centraliza exports da camada de domínio.
 * Facilita imports e mantém encapsulamento.
 */

// Entities
export { User } from "./entities/User";
export type { UserProps } from "./entities/User";

export { Newsletter } from "./entities/Newsletter";
export type { NewsletterProps } from "./entities/Newsletter";

export { MiniLivro } from "./entities/MiniLivro";
export type { MiniLivroProps } from "./entities/MiniLivro";

export { BibliotecaItem } from "./entities/BibliotecaItem";
export type { BibliotecaItemProps } from "./entities/BibliotecaItem";

export { EspecialSemana } from "./entities/EspecialSemana";
export type { EspecialSemanaProps } from "./entities/EspecialSemana";

export { RadarOportunidades } from "./entities/RadarOportunidades";
export type { RadarOportunidadesProps } from "./entities/RadarOportunidades";

export { Estudar } from "./entities/Estudar";
export type { EstudarProps } from "./entities/Estudar";

export { Ebook } from "./entities/Ebook";
export type { EbookProps } from "./entities/Ebook";

export { ContentItem } from "./entities/ContentItem";
export type { ContentItemProps, ContentType } from "./entities/ContentItem";

// Errors
export {
    AuthError,
    EmailNotConfirmedError,
    InvalidCredentialsError,
    InvalidResetTokenError,
    NetworkError,
    PasswordResetRequestError,
    UnknownAuthError,
    UserAlreadyExistsError,
    WeakPasswordError,
} from "./errors/AuthError";

// Repositories
export type { AuthResult, IAuthRepository, SignInParams, SignUpParams } from "./repositories/IAuthRepository";
