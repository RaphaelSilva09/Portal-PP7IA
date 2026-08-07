/**
 * MoveContentWithFilesUseCase (Application Layer)
 *
 * Move um item de conteúdo de um bloco para outro: cria a linha no destino,
 * copia os arquivos HTML/PDF para a pasta do tipo de destino, e só então
 * apaga a linha e os arquivos de origem. Qualquer falha antes da exclusão da
 * origem desfaz o que já foi criado no destino — a origem nunca é tocada até
 * o destino estar confirmado e completo.
 */

import type { ContentItem, ContentType } from "@/domain/entities/ContentItem";
import type { IContentRepository } from "@/domain/repositories/IContentRepository";
import type { IStorageRepository } from "@/domain/repositories/IStorageRepository";
import { STORAGE_BUCKET, STORAGE_PATHS } from "@/infrastructure/config/storage.config";

export const MOVABLE_CONTENT_TYPES: ReadonlySet<ContentType> = new Set([
    "newsletter",
    "mini-livro",
    "biblioteca",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
]);

export interface MoveContentInput {
    sourceType: ContentType;
    id: number;
    targetType: ContentType;
    // Obrigatório quando targetType === "biblioteca" e a origem não tem tema
    tema?: string;
    // Obrigatórios quando targetType === "mini-livro"
    ebookId?: number;
    partOrder?: number;
}

export class MoveContentWithFilesUseCase {
    constructor(
        private readonly contentRepository: IContentRepository,
        private readonly storageRepository: IStorageRepository,
    ) {}

    async execute(input: MoveContentInput): Promise<ContentItem> {
        if (!MOVABLE_CONTENT_TYPES.has(input.targetType)) {
            throw new Error(`Bloco de destino inválido: ${input.targetType}`);
        }
        if (input.targetType === input.sourceType) {
            throw new Error("O bloco de destino precisa ser diferente do bloco atual");
        }
        if (input.targetType === "biblioteca" && !input.tema) {
            throw new Error("Selecione o Tema para mover para Biblioteca");
        }
        if (input.targetType === "mini-livro" && (input.ebookId == null || input.partOrder == null)) {
            throw new Error("Selecione o E-book para mover para Mini-livro");
        }

        const source = await this.contentRepository.getById(input.sourceType, input.id);
        if (!source) {
            throw new Error(`Conteúdo ${input.sourceType}#${input.id} não encontrado`);
        }

        const targetFolder = STORAGE_PATHS[input.targetType];
        const sourceFolder = STORAGE_PATHS[input.sourceType];
        const sourceHtmlFileName = source.htmlPath?.split("/").pop() ?? null;
        const sourcePdfFileName = source.pdfPath?.split("/").pop() ?? null;

        const created = await this.contentRepository.create(input.targetType, {
            title: source.title,
            readTime: source.readTime,
            createdAt: source.createdAt,
            tema: input.targetType === "biblioteca" ? input.tema : undefined,
            ebookId: input.targetType === "mini-livro" ? input.ebookId : undefined,
            partOrder: input.targetType === "mini-livro" ? input.partOrder : undefined,
        });
        const newId = created.id;
        const formattedNewId = newId.toString().padStart(3, "0");

        // Efeito colateral não-crítico: nunca deve abortar um move que já criou a linha.
        await this.contentRepository.suppressDigestNotification(input.targetType, newId);

        const copiedPaths: string[] = [];
        try {
            let htmlPath: string | null = null;
            let pdfPath: string | null = null;

            if (sourceHtmlFileName) {
                const toPath = `${targetFolder}/${formattedNewId}.html`;
                await this.storageRepository.copy(STORAGE_BUCKET, `${sourceFolder}/${sourceHtmlFileName}`, toPath);
                copiedPaths.push(toPath);
                htmlPath = `/${STORAGE_BUCKET}/${toPath}`;
            }

            if (sourcePdfFileName) {
                const toPath = `${targetFolder}/${formattedNewId}.pdf`;
                await this.storageRepository.copy(STORAGE_BUCKET, `${sourceFolder}/${sourcePdfFileName}`, toPath);
                copiedPaths.push(toPath);
                pdfPath = `/${STORAGE_BUCKET}/${toPath}`;
            }

            if (htmlPath || pdfPath) {
                await this.contentRepository.update(input.targetType, newId, { htmlPath, pdfPath });
            }
        } catch (error) {
            for (const copiedPath of copiedPaths) {
                try {
                    await this.storageRepository.delete(STORAGE_BUCKET, copiedPath);
                } catch {
                    // best-effort cleanup: the original error below is what we surface
                }
            }
            try {
                await this.contentRepository.delete(input.targetType, newId);
            } catch {
                // best-effort cleanup: the original error below is what we surface
            }
            throw new Error(`Falha ao mover conteúdo. Operação revertida: ${String(error)}`);
        }

        if (sourceHtmlFileName) {
            await this.storageRepository.delete(STORAGE_BUCKET, `${sourceFolder}/${sourceHtmlFileName}`);
        }
        if (sourcePdfFileName) {
            await this.storageRepository.delete(STORAGE_BUCKET, `${sourceFolder}/${sourcePdfFileName}`);
        }
        await this.contentRepository.delete(input.sourceType, input.id);

        const result = await this.contentRepository.getById(input.targetType, newId);
        return result ?? created;
    }
}
