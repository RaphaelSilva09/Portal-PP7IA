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
import { EBOOK_INTRO_HTML_FOLDER, STORAGE_BUCKET, STORAGE_PATHS } from "@/infrastructure/config/storage.config";

export interface UpdateContentWithFilesInput {
    type: ContentType;
    id: number;
    title?: string;
    readTime?: number;
    htmlFile?: File;
    pdfFile?: File;
    // MiniLivro-specific fields
    ebookId?: number | null;
    partOrder?: number | null;
    // Biblioteca-specific fields
    tema?: string;
    // Ebook-specific fields
    subtitle?: string;
    description?: string;
    badgeText?: string;
    order?: number | null;
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
                let introHtmlPath = existingContent.htmlPath;
                let introPdfPath = existingContent.pdfPath;
                let coverImagePath = existingContent.coverImagePath;
                let coverPdfPath = existingContent.coverPdfPath;

                // Intro HTML → mini-livros/intros/ (sobrescreve)
                if (input.htmlFile) {
                    const htmlKey = `${EBOOK_INTRO_HTML_FOLDER}/${formattedId}.html`;
                    await this.storageRepository.upload(STORAGE_BUCKET, htmlKey, input.htmlFile);
                    introHtmlPath = `/${STORAGE_BUCKET}/${htmlKey}`;
                }

                // Intro PDF → ebooks/ (sobrescreve)
                if (input.pdfFile) {
                    const pdfKey = `${folder}/${formattedId}-intro.pdf`;
                    await this.storageRepository.upload(STORAGE_BUCKET, pdfKey, input.pdfFile);
                    introPdfPath = `/${STORAGE_BUCKET}/${pdfKey}`;
                }

                // Capa imagem → ebooks/ (sobrescreve)
                if (input.coverImageFile) {
                    const ext = input.coverImageFile.name.split(".").pop() ?? "jpg";
                    const imgKey = `${folder}/${formattedId}-capa.${ext}`;
                    await this.storageRepository.upload(STORAGE_BUCKET, imgKey, input.coverImageFile);
                    coverImagePath = `/${STORAGE_BUCKET}/${imgKey}`;
                }

                // Capa PDF → ebooks/ (sobrescreve)
                if (input.coverPdfFile) {
                    const capaPdfKey = `${folder}/${formattedId}-capa.pdf`;
                    await this.storageRepository.upload(STORAGE_BUCKET, capaPdfKey, input.coverPdfFile);
                    coverPdfPath = `/${STORAGE_BUCKET}/${capaPdfKey}`;
                }

                return await this.contentRepository.update(input.type, input.id, {
                    title: input.title,
                    readTime: input.readTime,
                    subtitle: input.subtitle,
                    description: input.description,
                    badgeText: input.badgeText,
                    order: input.order,
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
                    ebookId: input.ebookId,
                    partOrder: input.partOrder,
                });
            }
        } catch (error) {
            console.error("Erro ao atualizar conteúdo com arquivos:", error);
            throw error;
        }
    }
}
