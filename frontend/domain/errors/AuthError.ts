/**
 * Domain Errors (Domain Layer)
 *
 * Erros específicos do domínio de autenticação.
 *
 * Princípios aplicados:
 * - DDD: Erros de domínio expressam conceitos do negócio
 * - Clean Code: Nomes reveladores de intenção
 * - SRP: Cada erro tem uma responsabilidade específica
 */

export abstract class AuthError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor() {
        super("Email ou senha inválidos");
    }
}

export class UserAlreadyExistsError extends AuthError {
    constructor() {
        super("Já existe uma conta com este email");
    }
}

export class WeakPasswordError extends AuthError {
    constructor(details?: string) {
        super(details || "A senha não atende aos requisitos de segurança");
    }
}

export class NetworkError extends AuthError {
    constructor() {
        super("Erro de conexão. Verifique sua internet e tente novamente");
    }
}

export class UnknownAuthError extends AuthError {
    constructor(message?: string) {
        super(message || "Ocorreu um erro inesperado. Tente novamente");
    }
}

export class EmailNotConfirmedError extends AuthError {
    constructor() {
        super("Por favor, confirme seu email antes de fazer login");
    }
}
