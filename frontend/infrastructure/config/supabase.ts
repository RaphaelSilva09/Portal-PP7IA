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

import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Cria e configura cliente Supabase
 * Singleton Pattern (implícito via ES modules)
 */
function createSupabaseClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Nova variável de ambiente para chave publishable (caso necessário no futuro)
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Variáveis de ambiente do Supabase não configuradas. " +
                "Certifique-se de definir NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY",
        );
    }

    // Utilize supabasePublishableKey conforme necessário na aplicação

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    });
}

export const supabase = createSupabaseClient();
