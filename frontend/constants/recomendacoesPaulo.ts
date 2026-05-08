export const RECOMENDACOES_PAULO_SLUG = "recomendacoes-paulo";
export const RECOMENDACOES_PAULO_STORAGE_BUCKET = "materiais";
export const RECOMENDACOES_PAULO_STORAGE_FOLDER = "home/recomendacoes";

export const RECOMENDACOES_PAULO_DEFAULT_TITLE = "Recomendacoes do Paulo";
export const RECOMENDACOES_PAULO_DEFAULT_DESCRIPTION =
    "Curadoria pessoal com leituras, links e reflexoes que aprofundam o tema da semana.";

export function getRecomendacoesPauloStoragePath(): string {
    return `${RECOMENDACOES_PAULO_STORAGE_FOLDER}/${RECOMENDACOES_PAULO_SLUG}.html`;
}

export function getRecomendacoesPauloSourcePath(): string {
    return `/${RECOMENDACOES_PAULO_STORAGE_BUCKET}/${getRecomendacoesPauloStoragePath()}`;
}

export function getRecomendacoesPauloViewPath(): string {
    return `/view/home-recomendacoes/${RECOMENDACOES_PAULO_SLUG}`;
}
