/**
 * CreateContentWithUploadUseCase (Application Layer)
 *
 * Orquestra a criação de conteúdo com upload de arquivos.
 * Implementa rollback em caso de falha no upload.
 *
 * Fluxo:
 * 1. Cria registro no banco (obtém ID)
 * 2. Faz upload dos arquivos com nome baseado no ID
 * 3. Atualiza registro com paths dos arquivos
 * 4. Se falhar, faz rollback (deleta registro)
 *
 * Princípios aplicados:
 * - SRP: Responsável apenas pela criação com upload
 * - Transaction Script: Orquestra operações de forma transacional
 * - Fail Secure: Rollback em caso de erro
 */

import type { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";
import type { IStorageRepository } from "@/domain/repositories/IStorageRepository";

/** Mapeamento de tipo de conteúdo para nome do bucket no Supabase Storage */
const BUCKET_MAP: Record<ContentType, string> = {
    newsletter: "Newsletters",
    "mini-livro": "MiniLivros",
    biblioteca: "Biblioteca",
    "especial-semana": "especial-semana",
};

export interface CreateContentWithUploadInput {
    type: ContentType;
    title: string;
    readTime?: number;
    htmlFile?: File;
    pdfFile?: File;
}

export class CreateContentWithUploadUseCase {
    constructor(
        private readonly contentRepository: IContentRepository,
        private readonly storageRepository: IStorageRepository,
    ) {}

    async execute(input: CreateContentWithUploadInput): Promise<ContentItem | null> {
        const bucket = BUCKET_MAP[input.type];

        // 1. Criar registro no banco primeiro (para obter o ID)
        const content = await this.contentRepository.create(input.type, {
            title: input.title,
            readTime: input.readTime,
        });

        const contentId = content.id;
        const formattedId = contentId.toString().padStart(3, "0");

        try {
            let htmlPath: string | null = null;
            let pdfPath: string | null = null;

            // 2. Upload dos arquivos com nome baseado no ID
            if (input.htmlFile) {
                const htmlFileName = `${formattedId}.html`;
                await this.storageRepository.upload(bucket, htmlFileName, input.htmlFile);
                htmlPath = `/${bucket.toLowerCase()}/${htmlFileName}`;
            }

            if (input.pdfFile) {
                const pdfFileName = `${formattedId}.pdf`;
                await this.storageRepository.upload(bucket, pdfFileName, input.pdfFile);
                pdfPath = `/${bucket.toLowerCase()}/${pdfFileName}`;
            }

            // 3. Atualizar registro com os paths dos arquivos
            if (htmlPath || pdfPath) {
                await this.contentRepository.update(input.type, contentId, {
                    htmlPath,
                    pdfPath,
                });
            }

            return await this.contentRepository.getById(input.type, contentId);
        } catch (uploadError) {
            // ROLLBACK: Se upload falhar, deletar registro do banco
            console.error("Upload failed, rolling back:", uploadError);
            await this.contentRepository.delete(input.type, contentId);
            throw new Error(`Falha no upload. Operação revertida: ${uploadError}`);
        }
    }
}
