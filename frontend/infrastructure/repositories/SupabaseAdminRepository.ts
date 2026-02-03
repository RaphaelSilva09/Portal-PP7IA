/**
 * SupabaseAdminRepository (Infrastructure Layer)
 *
 * Implementação do repositório de admin usando Supabase.
 * Traduz operações de domínio para chamadas ao Supabase.
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Supabase API para interface de domínio
 * - SRP: Responsável apenas por operações de admin no Supabase
 * - Graceful Degradation: Retorna false em caso de erro
 */

import { supabase } from "../config/supabase";
import type { IAdminRepository } from "@/domain/repositories/IAdminRepository";

export class SupabaseAdminRepository implements IAdminRepository {
    async isAdmin(userId: string): Promise<boolean> {
        try {

            const { data, error } = await supabase
                .from("admin")
                .select("id")
                .eq("id", userId)
                .single();

            if (error || !data) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }
}
