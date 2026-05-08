export const MINI_LIVRO_SECTION_VIEW_TYPE = "mini-livro-section" as const;

export const MINI_LIVRO_SECTION_STORAGE_BUCKET = "materiais";
export const MINI_LIVRO_SECTION_STORAGE_FOLDER = "mini-livros/sections";
export const MINI_LIVRO_SECTION_SOURCE_PREFIX = `/${MINI_LIVRO_SECTION_STORAGE_BUCKET}/${MINI_LIVRO_SECTION_STORAGE_FOLDER}`;

export function getMiniLivroSectionStoragePath(kind: "prefacio" | "encerramento", id?: number): string {
    if (kind === "prefacio") {
        return `${MINI_LIVRO_SECTION_STORAGE_FOLDER}/prefacio.html`;
    }

    if (!id) {
        throw new Error("Encerramento requer um ID para montar o caminho do HTML.");
    }

    return `${MINI_LIVRO_SECTION_STORAGE_FOLDER}/encerramento/${id}.html`;
}

export function getMiniLivroSectionSourcePath(kind: "prefacio" | "encerramento", id?: number): string {
    return `/${MINI_LIVRO_SECTION_STORAGE_BUCKET}/${getMiniLivroSectionStoragePath(kind, id)}`;
}

export function extractStoragePathFromSourcePath(sourcePath: string | null): string | null {
    const normalizedPath = sourcePath?.trim();

    if (!normalizedPath) {
        return null;
    }

    const prefix = `/${MINI_LIVRO_SECTION_STORAGE_BUCKET}/`;

    if (!normalizedPath.startsWith(prefix)) {
        return null;
    }

    return normalizedPath.slice(prefix.length);
}
