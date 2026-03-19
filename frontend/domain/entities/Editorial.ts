/**
 * Editorial Entity (Domain Layer)
 *
 * Entidade singleton que representa o conteúdo editorial
 * exibido na seção hero da página principal.
 */

export interface Editorial {
    id: number;
    content: string;
    updatedAt: Date;
}
