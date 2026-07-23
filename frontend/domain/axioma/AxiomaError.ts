/**
 * Axioma Domain Errors (Domain Layer)
 *
 * Erros específicos do domínio Axioma IA.
 *
 * Princípios aplicados:
 * - DDD: Erros de domínio expressam conceitos do negócio
 * - Clean Code: Nomes reveladores de intenção
 * - SRP: Cada erro tem uma responsabilidade específica
 */

export abstract class AxiomaError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export type AxiomaUsageAction = "avaliações" | "provas geradas";

export class AxiomaRateLimitExceededError extends AxiomaError {
    constructor(
        public readonly limit: number,
        public readonly action: AxiomaUsageAction,
    ) {
        super(`Limite diário de ${limit} ${action} atingido. Tente novamente amanhã.`);
    }
}

export class AxiomaAIResponseError extends AxiomaError {
    constructor(message = "Falha na resposta da IA") {
        super(message);
    }
}

export class AxiomaEmptyChallengeError extends AxiomaError {
    constructor() {
        super("Prova retornada sem questões");
    }
}
