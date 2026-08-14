/** SavedContent (Domain Layer) — fila pessoal de "ler depois" (PP7I-260811-1800, item 3.1). */

import type { ContentType } from "./ContentItem";

/** Tipos de conteúdo elegíveis para salvar — mesmo conjunto de `ContentType` (blocos com página em /view). */
export const SAVABLE_CONTENT_TYPES: readonly ContentType[] = [
    "newsletter",
    "mini-livro",
    "biblioteca",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
    "ebook",
];

export function isSavableContentType(type: string): type is ContentType {
    return (SAVABLE_CONTENT_TYPES as readonly string[]).includes(type);
}

export interface SavedContentEntry {
    contentType: string;
    contentId: string;
    createdAt: Date;
}

/**
 * Item salvo já hidratado com os dados do conteúdo, para a página /salvos.
 * Carrega os mesmos campos usados pelo card de /explorar (`Item` em
 * components/explorar/ContentCards.tsx) para que o card renderize idêntico
 * nos dois lugares.
 */
export interface SavedContentView {
    contentType: string;
    contentId: string;
    title: string;
    href: string;
    createdAt: Date;
    id: number;
    formattedDate: string;
    formattedNumber: string;
    htmlAvailable: boolean;
    pdfAvailable: boolean;
    readTime: number;
}
