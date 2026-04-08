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
 * Pasta base dos ebooks no bucket.
 * Cada ebook ocupa uma subpasta: mini-livros/ebook/{slug}/
 * Arquivos dentro: capa_{slug}.png, capa_{slug}.pdf,
 *                  introducao_{slug}.html, introducao_{slug}.pdf
 */
export const EBOOK_BASE_FOLDER = "mini-livros/ebook";

/**
 * Slugs fixos por parte do ebook.
 * São exatamente 3 ebooks, um por parte. O slug determina a pasta no bucket
 * e é imutável — não depende do título cadastrado pelo admin.
 */
export const EBOOK_PART_SLUGS: Record<number, string> = {
    1: "lideranca_hibrida",
    2: "coragem_de_executar",
    3: "o_que_fica",
};
