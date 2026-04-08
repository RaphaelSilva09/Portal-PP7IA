/**
 * Converte o título de um ebook para slug snake_case sem acentos.
 *
 * Exemplos:
 *   "Liderança Híbrida"       → "lideranca_hibrida"
 *   "A Coragem de Executar"   → "a_coragem_de_executar"
 *   "O Que Fica"              → "o_que_fica"
 */
export function toEbookSlug(title: string): string {
    return title
        .normalize("NFD")                        // decompõe acentos: "ã" → "a" + combining ~
        .replace(/[\u0300-\u036f]/g, "")          // remove combining diacritics
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")             // remove pontuação e especiais
        .trim()
        .replace(/\s+/g, "_");                   // espaços → underscores
}
