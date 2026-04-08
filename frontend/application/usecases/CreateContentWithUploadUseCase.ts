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
import { EBOOK_BASE_FOLDER, EBOOK_PART_SLUGS, STORAGE_BUCKET, STORAGE_PATHS } from "@/infrastructure/config/storage.config";

export interface CreateContentWithUploadInput {
    type: ContentType;
    title: string;
    readTime?: number;
    htmlFile?: File;
    pdfFile?: File;
    // MiniLivro-specific fields
    /** ID do ebook ao qual este mini-livro pertence (FK para ebooks.id) */
    ebookId?: number | null;
    /** Parte à qual o mini-livro pertence (1=Parte I, 2=Parte II, 3=Parte III) */
    partOrder?: number;
    // Biblioteca-specific fields
    tema?: string;
    // Ebook-specific fields
    /** Ordem do ebook nas abas (1=Parte I, 2=Parte II, 3=Parte III) */
    order?: number;
    subtitle?: string;
    description?: string;
    badgeText?: string;
    coverImageFile?: File;
    coverPdfFile?: File;
}

export class CreateContentWithUploadUseCase {
    constructor(
        private readonly contentRepository: IContentRepository,
        private readonly storageRepository: IStorageRepository,
    ) {}

    async execute(input: CreateContentWithUploadInput): Promise<ContentItem | null> {
        const folder = STORAGE_PATHS[input.type];
        const isEbook = input.type === "ebook";

        // 1. Criar registro no banco primeiro (para obter o ID)
        const content = await this.contentRepository.create(input.type, {
            title: input.title,
            readTime: input.readTime,
            ebookId: input.ebookId,
            partOrder: input.partOrder,
            tema: input.tema,
            order: input.order,
            subtitle: input.subtitle,
            description: input.description,
            badgeText: input.badgeText,
        });

        const contentId = content.id;
        const formattedId = contentId.toString().padStart(3, "0");

        try {
            if (isEbook) {
                // --- Fluxo Ebook ---
                // Estrutura: materiais/mini-livros/ebook/{slug}/
                //   introducao_{slug}.html
                //   introducao_{slug}.pdf
                //   capa_{slug}.{ext}
                //   capa_{slug}.pdf
                const slug = EBOOK_PART_SLUGS[input.order!];
                if (!slug) throw new Error(`Parte inválida para ebook: ${input.order}`);
                const base = `${EBOOK_BASE_FOLDER}/${slug}`;

                let introHtmlPath: string | null = null;
                let introPdfPath: string | null = null;
                let coverImagePath: string | null = null;
                let coverPdfPath: string | null = null;

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

                await this.contentRepository.update(input.type, contentId, {
                    htmlPath: introHtmlPath,
                    pdfPath: introPdfPath,
                    coverImagePath,
                    coverPdfPath,
                });
            } else {
                // --- Fluxo Padrão ---
                let htmlPath: string | null = null;
                let pdfPath: string | null = null;

                if (input.htmlFile) {
                    const htmlFileName = `${formattedId}.html`;
                    await this.storageRepository.upload(STORAGE_BUCKET, `${folder}/${htmlFileName}`, input.htmlFile);
                    htmlPath = `/${STORAGE_BUCKET}/${folder}/${htmlFileName}`;
                }

                if (input.pdfFile) {
                    const pdfFileName = `${formattedId}.pdf`;
                    await this.storageRepository.upload(STORAGE_BUCKET, `${folder}/${pdfFileName}`, input.pdfFile);
                    pdfPath = `/${STORAGE_BUCKET}/${folder}/${pdfFileName}`;
                }

                if (htmlPath || pdfPath) {
                    await this.contentRepository.update(input.type, contentId, { htmlPath, pdfPath });
                }
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
