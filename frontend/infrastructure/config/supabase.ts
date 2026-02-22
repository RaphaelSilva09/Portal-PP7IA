/**
 * Supabase Client Factory (Infrastructure Layer)
 *
 * Factory para criação do cliente Supabase.
 *
 * Princípios aplicados:
 * - Factory Pattern: Centraliza criação de cliente
 * - SRP: Responsável apenas por configurar Supabase
 * - Fail Fast: Valida variáveis de ambiente no boot
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cria e configura cliente Supabase
 * Singleton Pattern (implícito via ES modules)
 */
function createSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Variáveis de ambiente do Supabase não configuradas. " +
                "Certifique-se de definir NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY",
        );
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();
