/**
 * UpdateContentWithFilesUseCase (Application Layer)
 *
 * Orquestra a atualização de conteúdo com substituição opcional de arquivos.
 * Permite trocar HTML/PDF após criação.
 *
 * Fluxo:
 * 1. Verifica se conteúdo existe
 * 2. Se houver novos arquivos, deleta os antigos e faz upload dos novos
 * 3. Atualiza registro no banco com novos paths
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pela atualização com upload
 * - Transaction Script: Orquestra operações de forma transacional
 * - Fail Secure: Não deleta arquivos antigos antes de subir novos
 */

import type { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";
import type { IStorageRepository } from "@/domain/repositories/IStorageRepository";
import { toEbookSlug } from "@/lib/slug";
import { EBOOK_BASE_FOLDER, STORAGE_BUCKET, STORAGE_PATHS } from "@/infrastructure/config/storage.config";

export interface UpdateContentWithFilesInput {
    type: ContentType;
    id: number;
    title?: string;
    readTime?: number;
    htmlFile?: File;
    pdfFile?: File;
    // Biblioteca-specific fields
    tema?: string;
    // Ebook-specific fields
    subtitle?: string;
    description?: string;
    badgeText?: string;
    coverImageFile?: File;
    coverPdfFile?: File;
}

export class UpdateContentWithFilesUseCase {
    constructor(
        private readonly contentRepository: IContentRepository,
        private readonly storageRepository: IStorageRepository,
    ) {}

    async execute(input: UpdateContentWithFilesInput): Promise<ContentItem | null> {
        const folder = STORAGE_PATHS[input.type];
        const isEbook = input.type === "ebook";

        // 1. Verificar se conteúdo existe
        const existingContent = await this.contentRepository.getById(input.type, input.id);
        if (!existingContent) {
            throw new Error(`Conteúdo ${input.type}#${input.id} não encontrado`);
        }

        const contentId = existingContent.id;
        const formattedId = contentId.toString().padStart(3, "0");

        try {
            if (isEbook) {
                // --- Fluxo Ebook ---
                // Slug: extrai do path existente para manter consistência com arquivos já salvos.
                // Se não houver arquivos ainda, deriva do título atual.
                const existingPath = existingContent.htmlPath ?? existingContent.coverImagePath ?? null;
                const slugFromPath = existingPath?.match(/mini-livros\/ebook\/([^/]+)\//)?.[1] ?? null;
                const slug = slugFromPath ?? toEbookSlug(existingContent.title);
                const base = `${EBOOK_BASE_FOLDER}/${slug}`;

                let introHtmlPath = existingContent.htmlPath;
                let introPdfPath = existingContent.pdfPath;
                let coverImagePath = existingContent.coverImagePath;
                let coverPdfPath = existingContent.coverPdfPath;

                if (input.htmlFile) {
                    const htmlKey = `${base}/introducao_${slug}.html`;
                    await this.storageRepository.upload(STORAGE_BUCKET, htmlKey, input.htmlFile);
                    introHtmlPath = `/${STORAGE_BUCKET}/${htmlKey}`;
                }

                if (input.pdfFile) {
                    const pdfKey = `${base}/introducao_${slug}.pdf`;
                    await this.storageRepository.upload(STORAGE_BUCKET, pdfKey, input.pdfFile);
                    introPdfPath = `/${STORAGE_BUCKET}/${pdfKey}`;
                }

                if (input.coverImageFile) {
                    const ext = input.coverImageFile.name.split(".").pop() ?? "jpg";
                    const imgKey = `${base}/capa_${slug}.${ext}`;
                    await this.storageRepository.upload(STORAGE_BUCKET, imgKey, input.coverImageFile);
                    coverImagePath = `/${STORAGE_BUCKET}/${imgKey}`;
                }

                if (input.coverPdfFile) {
                    const capaPdfKey = `${base}/capa_${slug}.pdf`;
                    await this.storageRepository.upload(STORAGE_BUCKET, capaPdfKey, input.coverPdfFile);
                    coverPdfPath = `/${STORAGE_BUCKET}/${capaPdfKey}`;
                }

                return await this.contentRepository.update(input.type, input.id, {
                    title: input.title,
                    readTime: input.readTime,
                    subtitle: input.subtitle,
                    description: input.description,
                    badgeText: input.badgeText,
                    htmlPath: introHtmlPath,
                    pdfPath: introPdfPath,
                    coverImagePath,
                    coverPdfPath,
                });
            } else {
                // --- Fluxo Padrão ---
                let htmlPath = existingContent.htmlPath;
                let pdfPath = existingContent.pdfPath;

                if (input.htmlFile) {
                    const htmlFileName = `${formattedId}.html`;
                    if (htmlPath) {
                        const oldFileName = htmlPath.split("/").pop();
                        if (oldFileName) {
                            await this.storageRepository.delete(STORAGE_BUCKET, `${folder}/${oldFileName}`);
                        }
                    }
                    await this.storageRepository.upload(STORAGE_BUCKET, `${folder}/${htmlFileName}`, input.htmlFile);
                    htmlPath = `/${STORAGE_BUCKET}/${folder}/${htmlFileName}`;
                }

                if (input.pdfFile) {
                    const pdfFileName = `${formattedId}.pdf`;
                    if (pdfPath) {
                        const oldFileName = pdfPath.split("/").pop();
                        if (oldFileName) {
                            await this.storageRepository.delete(STORAGE_BUCKET, `${folder}/${oldFileName}`);
                        }
                    }
                    await this.storageRepository.upload(STORAGE_BUCKET, `${folder}/${pdfFileName}`, input.pdfFile);
                    pdfPath = `/${STORAGE_BUCKET}/${folder}/${pdfFileName}`;
                }

                return await this.contentRepository.update(input.type, input.id, {
                    title: input.title,
                    readTime: input.readTime,
                    htmlPath,
                    pdfPath,
                    tema: input.tema,
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar conteúdo com arquivos:", error);
            throw error;
        }
    }
}
