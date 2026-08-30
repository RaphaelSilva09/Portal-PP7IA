/**
 * Extrai o slug de um caminho cru de storage (ex.:
 * "newsletters/pp-news-42.html") — mesma regex que cada entidade pública
 * (Newsletter, MiniLivro, BibliotecaItem, EspecialSemana,
 * RadarOportunidades, Estudar) já usa no próprio getter `htmlPath` para
 * montar "/view/{tipo}/{slug}".
 *
 * Existe porque o admin usa a entidade genérica `ContentItem`, cujo getter
 * `htmlPath` devolve a URL pública de storage crua (com ".html" no fim) —
 * formato diferente do que as entidades públicas expõem. Extrair o slug do
 * jeito errado no admin (ex. reaproveitando `slugFromHref`, que assume o
 * formato "/view/{tipo}/{slug}") salvaria uma regra de acesso com uma chave
 * que a checagem pública nunca encontra: bloqueio configurado que não
 * bloqueia nada. Use esta função sobre o valor cru
 * (`ContentItem.toObject().htmlPath`, não o getter `htmlPath`).
 */
export function extractSlugFromStoragePath(rawPath: string | null | undefined): string | null {
    const trimmed = rawPath?.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/\/([^/]+)\.html$/) ?? trimmed.match(/^([^/]+)\.html$/);
    return match ? match[1] : null;
}
