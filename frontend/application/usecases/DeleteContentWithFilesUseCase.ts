/**
 * DeleteContentWithFilesUseCase (Application Layer)
 *
 * Orquestra a deleção de conteúdo e seus arquivos associados.
 * Deleta arquivos do storage antes de remover o registro do banco.
 *
 * Fluxo:
 * 1. Busca item para identificar arquivos
 * 2. Deleta arquivos do storage (ignora se não existirem)
 * 3. Deleta registro do banco
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pela deleção completa
 * - Graceful Degradation: Continua mesmo se arquivos não existirem
 */

import type { ContentType } from "@/domain/entities/ContentItem";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";
import type { IStorageRepository } from "@/domain/repositories/IStorageRepository";
import { EBOOK_INTRO_HTML_FOLDER, STORAGE_BUCKET, STORAGE_PATHS } from "@/infrastructure/config/storage.config";

export class DeleteContentWithFilesUseCase {
    constructor(
        private readonly contentRepository: IContentRepository,
        private readonly storageRepository: IStorageRepository,
    ) {}

    async execute(type: ContentType, id: number): Promise<void> {
        const folder = STORAGE_PATHS[type];
        const formattedId = id.toString().padStart(3, "0");

        // 1. Buscar item para saber quais arquivos deletar
        const content = await this.contentRepository.getById(type, id);

        if (!content) {
            throw new Error("Conteúdo não encontrado");
        }

        // 2. Deletar arquivos do storage (ignora erros se não existirem)
        if (type === "ebook") {
            // Ebook: múltiplos arquivos em caminhos distintos
            const filesToDelete = [
                `${EBOOK_INTRO_HTML_FOLDER}/${formattedId}.html`,
                `${folder}/${formattedId}-intro.pdf`,
                `${folder}/${formattedId}-capa.pdf`,
                `${folder}/${formattedId}-capa.jpg`,
                `${folder}/${formattedId}-capa.png`,
                `${folder}/${formattedId}-capa.webp`,
            ];
            for (const filePath of filesToDelete) {
                try {
                    await this.storageRepository.delete(STORAGE_BUCKET, filePath);
                } catch {
                    // Ignora arquivos que não existem
                }
            }
        } else {
            try {
                if (content.htmlPath) {
                    await this.storageRepository.delete(STORAGE_BUCKET, `${folder}/${formattedId}.html`);
                }
            } catch {
                console.warn("HTML file not found, continuing...");
            }

            try {
                if (content.pdfPath) {
                    await this.storageRepository.delete(STORAGE_BUCKET, `${folder}/${formattedId}.pdf`);
                }
            } catch {
                console.warn("PDF file not found, continuing...");
            }
        }

        // 3. Deletar registro do banco
        await this.contentRepository.delete(type, id);
    }
}
