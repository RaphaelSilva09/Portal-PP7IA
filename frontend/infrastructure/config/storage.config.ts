/**
 * Storage Configuration (Infrastructure Layer)
 *
 * Configuração centralizada do Supabase Storage.
 * Único bucket "materiais" com subpastas por tipo de conteúdo.
 *
 * Princípios aplicados:
 * - DRY: Evita duplicação de config de storage
 * - SRP: Responsável apenas pela config de storage
 * - Single Source of Truth: Um único lugar para paths de storage
 */

import type { ContentType } from "@/domain/entities/ContentItem";

/** Nome do bucket único no Supabase Storage */
export const STORAGE_BUCKET = "materiais";

/**
 * Mapeamento de ContentType para pasta dentro do bucket "materiais"
 * Estrutura: materiais/{folder}/{formattedId}.{ext}
 */
export const STORAGE_PATHS: Record<ContentType, string> = {
    newsletter: "newsletters",
    "mini-livro": "mini-livros/mini",
    biblioteca: "biblioteca",
    "especial-semana": "especial-da-semana",
    radar_oportunidades: "radar-de-oportunidades",
    estudar: "estudar",
    ebook: "ebooks",
};

/**
 * Folder especial para HTML de introdução de ebooks.
 * O proxy-html lê deste folder ao renderizar /view/ebook/{slug}.
 * Separado de STORAGE_PATHS["ebook"] pois ebooks/ guarda imagens e PDFs de capa.
 */
export const EBOOK_INTRO_HTML_FOLDER = "mini-livros/intros";
