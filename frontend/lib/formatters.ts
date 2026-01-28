/**
 * Módulo de Formatação
 *
 * Centraliza todas as funções de formatação do projeto.
 * Seguindo princípios:
 * - DRY: Evita duplicação de lógica de formatação
 * - Single Responsibility: Cada função faz apenas uma formatação
 * - Pure Functions: Sem efeitos colaterais, mesma entrada = mesma saída
 */

/**
 * Formata número de celular brasileiro enquanto usuário digita
 * Suporta formatos de 10 dígitos (fixo) e 11 dígitos (celular)
 *
 * @param value - String com números ou telefone parcialmente formatado
 * @returns Telefone formatado: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 *
 * @example
 * formatPhone("11999887766") // "(11) 99988-7766"
 * formatPhone("1133445566")  // "(11) 3344-5566"
 */
export const formatPhone = (value: string): string => {
    if (!value || typeof value !== "string") return "";

    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    const truncated = numbers.slice(0, 11);

    // Aplica formatação progressiva
    if (truncated.length <= 2) {
        return truncated;
    }

    if (truncated.length <= 6) {
        return truncated.replace(/(\d{2})(\d{0,4})/, "($1) $2");
    }

    if (truncated.length <= 10) {
        return truncated.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }

    // 11 dígitos - celular
    return truncated.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

/**
 * Remove formatação de telefone, retornando apenas números
 *
 * @param phone - Telefone formatado ou não
 * @returns Apenas os dígitos do telefone
 *
 * @example
 * unformatPhone("(11) 99988-7766") // "11999887766"
 */
export const unformatPhone = (phone: string): string => {
    if (!phone || typeof phone !== "string") return "";
    return phone.replace(/\D/g, "");
};

/**
 * Formata valor monetário em Real brasileiro
 *
 * @param value - Valor numérico
 * @returns String formatada: "R$ X.XXX,XX"
 *
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 */
export const formatCurrency = (value: number): string => {
    if (typeof value !== "number" || isNaN(value)) return "R$ 0,00";

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
};

/**
 * Formata data no padrão brasileiro
 *
 * @param date - Data ou string de data
 * @returns String formatada: "DD/MM/YYYY"
 *
 * @example
 * formatDate(new Date()) // "28/01/2026"
 */
export const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;

    if (isNaN(d.getTime())) return "";

    return new Intl.DateTimeFormat("pt-BR").format(d);
};

/**
 * Capitaliza primeira letra de cada palavra
 *
 * @param text - Texto a capitalizar
 * @returns Texto com iniciais maiúsculas
 *
 * @example
 * capitalize("joão da silva") // "João Da Silva"
 */
export const capitalize = (text: string): string => {
    if (!text || typeof text !== "string") return "";

    return text
        .toLowerCase()
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

/**
 * Trunca texto com ellipsis
 *
 * @param text - Texto a truncar
 * @param maxLength - Tamanho máximo (padrão: 100)
 * @returns Texto truncado com "..." se necessário
 */
export const truncate = (text: string, maxLength: number = 100): string => {
    if (!text || typeof text !== "string") return "";
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - 3).trim() + "...";
};
