/**
 * Módulo de Validação
 *
 * Centraliza todas as funções de validação do projeto.
 * Seguindo princípios:
 * - DRY: Evita duplicação de lógica de validação
 * - Single Responsibility: Cada função faz apenas uma validação
 * - Side-Effect-Free: Funções puras sem efeitos colaterais
 */

/**
 * Valida email usando regex padrão RFC 5322 simplificado
 * @param email - String do email a validar
 * @returns true se email é válido
 */
export const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Valida celular brasileiro
 * Aceita formatos: (XX) XXXXX-XXXX, (XX) XXXX-XXXX, ou apenas números
 * @param phone - String do telefone a validar
 * @returns true se telefone é válido (10 ou 11 dígitos)
 */
export const isValidPhone = (phone: string): boolean => {
    if (!phone || typeof phone !== "string") return false;
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

/**
 * Valida senha com tamanho mínimo
 * @param password - String da senha a validar
 * @param minLength - Tamanho mínimo (padrão: 6)
 * @returns true se senha atende ao requisito mínimo
 */
export const isValidPassword = (password: string, minLength: number = 6): boolean => {
    if (!password || typeof password !== "string") return false;
    return password.length >= minLength;
};

/**
 * Valida se uma string não está vazia
 * @param value - String a validar
 * @returns true se string tem conteúdo
 */
export const isNotEmpty = (value: string): boolean => {
    if (!value || typeof value !== "string") return false;
    return value.trim().length > 0;
};

/**
 * Tipos de erro de validação
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Resultado de validação
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Valida campos de email e telefone juntos
 * Útil para formulários de newsletter/contato
 */
export const validateContactFields = (
    email: string,
    phone: string
): ValidationResult => {
    const errors: ValidationError[] = [];

    if (!isNotEmpty(email)) {
        errors.push({ field: "email", message: "Email é obrigatório" });
    } else if (!isValidEmail(email)) {
        errors.push({ field: "email", message: "Email inválido" });
    }

    if (!isNotEmpty(phone)) {
        errors.push({ field: "celular", message: "Celular é obrigatório" });
    } else if (!isValidPhone(phone)) {
        errors.push({ field: "celular", message: "Celular inválido" });
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
