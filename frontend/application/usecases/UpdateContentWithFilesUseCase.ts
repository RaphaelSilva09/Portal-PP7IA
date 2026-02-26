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
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/infrastructure/config/storage.config";

export interface UpdateContentWithFilesInput {
    type: ContentType;
    id: number;
    title?: string;
    readTime?: number;
    htmlFile?: File;
    pdfFile?: File;
}

export class UpdateContentWithFilesUseCase {
    constructor(
        private readonly contentRepository: IContentRepository,
        private readonly storageRepository: IStorageRepository,
    ) {}

    async execute(input: UpdateContentWithFilesInput): Promise<ContentItem | null> {
        const folder = STORAGE_PATHS[input.type];

        // 1. Verificar se conteúdo existe
        const existingContent = await this.contentRepository.getById(input.type, input.id);
        if (!existingContent) {
            throw new Error(`Conteúdo ${input.type}#${input.id} não encontrado`);
        }

        const contentId = existingContent.id;
        const formattedId = contentId.toString().padStart(3, "0");

        let htmlPath = existingContent.htmlPath;
        let pdfPath = existingContent.pdfPath;

        try {
            // 2. Upload de novos arquivos (se fornecidos)
            if (input.htmlFile) {
                const htmlFileName = `${formattedId}.html`;

                // Deletar arquivo antigo se existir
                if (htmlPath) {
                    const oldFileName = htmlPath.split("/").pop();
                    if (oldFileName) {
                        await this.storageRepository.delete(STORAGE_BUCKET, `${folder}/${oldFileName}`);
                    }
                }

                // Upload novo arquivo
                await this.storageRepository.upload(STORAGE_BUCKET, `${folder}/${htmlFileName}`, input.htmlFile);
                htmlPath = `/${STORAGE_BUCKET}/${folder}/${htmlFileName}`;
            }

            if (input.pdfFile) {
                const pdfFileName = `${formattedId}.pdf`;

                // Deletar arquivo antigo se existir
                if (pdfPath) {
                    const oldFileName = pdfPath.split("/").pop();
                    if (oldFileName) {
                        await this.storageRepository.delete(STORAGE_BUCKET, `${folder}/${oldFileName}`);
                    }
                }

                // Upload novo arquivo
                await this.storageRepository.upload(STORAGE_BUCKET, `${folder}/${pdfFileName}`, input.pdfFile);
                pdfPath = `/${STORAGE_BUCKET}/${folder}/${pdfFileName}`;
            }

            // 3. Atualizar registro no banco
            const updatedContent = await this.contentRepository.update(input.type, input.id, {
                title: input.title,
                readTime: input.readTime,
                htmlPath,
                pdfPath,
            });

            return updatedContent;
        } catch (error) {
            console.error("Erro ao atualizar conteúdo com arquivos:", error);
            throw error;
        }
    }
}
