/**
 * SupabaseAdminRepository (Infrastructure Layer)
 *
 * Verifica se um usuário é admin através do JWT (app_metadata.role).
 * Usa o sistema de roles nativo do Supabase Auth.
 *
 * Princípios aplicados:
 * - Adapter Pattern: Adapta Supabase Auth para interface de domínio
 * - SRP: Responsável apenas por verificação de admin
 * - Graceful Degradation: Retorna false em caso de erro
 */

import { supabase } from "../config/supabase";
import type { IAdminRepository } from "@/domain/repositories/IAdminRepository";

export class SupabaseAdminRepository implements IAdminRepository {
    async isAdmin(userId: string): Promise<boolean> {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user || user.id !== userId) {
                return false;
            }

            return user.app_metadata?.role === "admin";
        } catch {
            return false;
        }
    }
}
