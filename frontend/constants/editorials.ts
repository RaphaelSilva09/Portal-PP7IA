export type EditorialSlug = "primeiros-usuarios" | "semanais";

export interface EditorialDefinition {
    slug: EditorialSlug;
    title: string;
    description: string;
    audienceLabel: string;
    ctaLabel: string;
}

export const EDITORIAL_STORAGE_BUCKET = "materiais";
export const EDITORIAL_STORAGE_FOLDER = "editoriais";

export const EDITORIAL_ITEMS: readonly EditorialDefinition[] = [
    {
        slug: "primeiros-usuarios",
        title: "Primeiros usuários",
        description: "Um editorial de entrada para quem está chegando agora ao portal e quer começar com contexto e direção.",
        audienceLabel: "Para começar",
        ctaLabel: "Abrir editorial",
    },
    {
        slug: "semanais",
        title: "Semanais",
        description: "O editorial pensado para quem acompanha o portal com frequência e quer seguir no ritmo das publicações semanais.",
        audienceLabel: "Ritmo semanal",
        ctaLabel: "Abrir editorial",
    },
] as const;

export function getEditorialStoragePath(slug: EditorialSlug): string {
    return `${EDITORIAL_STORAGE_FOLDER}/${slug}.html`;
}

export function getEditorialFileName(slug: EditorialSlug): string {
    return `${slug}.html`;
}

export function getEditorialPdfFileName(slug: EditorialSlug): string {
    return `${slug}.pdf`;
}

export function getEditorialPdfStoragePath(slug: EditorialSlug): string {
    return `${EDITORIAL_STORAGE_FOLDER}/${getEditorialPdfFileName(slug)}`;
}

/** URL pública servida por /api/files — mesma convenção do pdfPath dos outros tipos de conteúdo. */
export function getEditorialPdfPublicUrl(slug: EditorialSlug): string {
    return `/api/files/${EDITORIAL_STORAGE_BUCKET}/${getEditorialPdfStoragePath(slug)}`;
}

export function getEditorialViewPath(slug: EditorialSlug): string {
    return `/view/editorial/${slug}`;
}
