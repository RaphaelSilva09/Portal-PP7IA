/**
 * SupabaseStorageRepository (Infrastructure Layer)
 *
 * Implementação do repositório de storage usando Supabase Storage.
 * Gerencia upload e deleção de arquivos (HTML e PDF).
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Supabase Storage API para interface de domínio
 * - SRP: Responsável apenas por operações de storage
 * - Error Handling: Lança erros com mensagens claras
 */

import { supabase } from "../config/supabase";
import type {
    IStorageRepository,
    UploadResult,
} from "@/domain/repositories/IStorageRepository";

export class SupabaseStorageRepository implements IStorageRepository {
    async upload(
        bucket: string,
        fileName: string,
        file: File
    ): Promise<UploadResult> {

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: true, // Sobrescreve se já existir
            });

        if (error || !data) {
            throw new Error(`Falha no upload: ${error?.message}`);
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            path: data.path,
            publicUrl: urlData.publicUrl,
        };
    }

    async delete(bucket: string, filePath: string): Promise<void> {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            throw new Error(`Falha ao deletar arquivo: ${error.message}`);
        }
    }
}
