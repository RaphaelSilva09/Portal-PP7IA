/**
 * Resolução de caminho de arquivo de conteúdo no Railway Volume (STORAGE_ROOT).
 *
 * Extraído de /api/proxy-html para ser compartilhado com /api/export-pdf —
 * ambos precisam da mesma validação de tipo/slug e guarda contra path
 * traversal; duplicar essa lógica arriscaria as duas rotas divergirem em
 * segurança ao longo do tempo.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { extractStoragePathFromSourcePath } from "@/constants/miniLivroSections";
import DIContainer from "@/infrastructure/di/container";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

// Mapeamento de tipos de conteúdo para bucket e pastas do storage de arquivos
// Estrutura: bucket único "materiais" com subpastas por tipo de conteúdo
export const STORAGE_CONFIG: Record<string, { bucket: string; folder: string }> = {
    newsletter: { bucket: "materiais", folder: "newsletters" },
    "mini-livro": { bucket: "materiais", folder: "mini-livros/mini" },
    biblioteca: { bucket: "materiais", folder: "biblioteca" },
    "especial-semana": { bucket: "materiais", folder: "especial-da-semana" },
    editorial: { bucket: "materiais", folder: "editoriais" },
    radar_oportunidades: { bucket: "materiais", folder: "radar-de-oportunidades" },
    estudar: { bucket: "materiais", folder: "estudar" },
    "home-recomendacoes": { bucket: "materiais", folder: "home/recomendacoes" },
    // ebook usa subpasta por slug: mini-livros/ebook/{slug}/introducao_{slug}.html
    ebook: { bucket: "materiais", folder: "mini-livros/ebook" },
    book: { bucket: "materiais", folder: "mini-livros/livro" },
    "mini-livro-section": { bucket: "materiais", folder: "mini-livros/sections" },
};

export const VALID_CONTENT_TYPES = Object.keys(STORAGE_CONFIG);

/** Permite apenas letras, números, hífens e underscores — previne path traversal. */
export function isValidContentSlug(slug: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(slug);
}

export type ResolveContentFilePathResult =
    | { ok: true; absolutePath: string }
    | { ok: false; status: 400 | 404; error: string };

export async function resolveContentFilePath(type: string, slug: string): Promise<ResolveContentFilePathResult> {
    if (!VALID_CONTENT_TYPES.includes(type)) {
        return { ok: false, status: 400, error: "Tipo de conteúdo inválido" };
    }
    if (!isValidContentSlug(slug)) {
        return { ok: false, status: 400, error: "Slug inválido" };
    }

    const config = STORAGE_CONFIG[type];

    // Resolve filename. mini-livro-section needs a DB lookup because the
    // file path is stored on the section row (admin uploads with a UUID).
    let fileName: string;
    if (type === "mini-livro-section") {
        const sectionId = Number(slug);
        if (!Number.isInteger(sectionId) || sectionId <= 0) {
            return { ok: false, status: 400, error: "Slug inválido" };
        }
        const section = await DIContainer.getMiniLivroSectionRepository().getById(sectionId);
        const objectPath = extractStoragePathFromSourcePath(section?.sourceHtmlPath ?? null);
        if (!objectPath) {
            return { ok: false, status: 404, error: "Arquivo não encontrado" };
        }
        // objectPath comes back as `{folder}/{filename}` — trim folder to keep
        // the join below pointed at the right disk location.
        fileName = objectPath.startsWith(`${config.folder}/`)
            ? objectPath.slice(config.folder.length + 1)
            : objectPath;
    } else if (type === "ebook") {
        fileName = `${slug}/introducao_${slug}.html`;
    } else {
        fileName = `${slug}.html`;
    }

    // Read directly from Railway Volume (mounted at STORAGE_ROOT)
    // Path on disk: STORAGE_ROOT/{bucket}/{folder}/{filename}
    const root = path.resolve(STORAGE_ROOT);
    const target = path.resolve(root, config.bucket, config.folder, fileName);

    if (target !== root && !target.startsWith(root + path.sep)) {
        return { ok: false, status: 400, error: "Caminho inválido" };
    }

    try {
        await fs.access(target);
    } catch {
        return { ok: false, status: 404, error: "Arquivo não encontrado" };
    }

    return { ok: true, absolutePath: target };
}
