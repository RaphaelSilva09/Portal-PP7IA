/**
 * Supabase Client Factory (Infrastructure Layer)
 *
 * Factory para criação do cliente Supabase com timeout global.
 *
 * Princípios aplicados:
 * - Factory Pattern: Centraliza criação de cliente
 * - SRP: Responsável apenas por configurar Supabase
 * - Fail Fast: Valida variáveis de ambiente no boot
 * - Timeout Protection: AbortController wrapper para todas as requisições
 */

import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates fetch wrapper with timeout support using AbortController
 * Prevents hanging requests that never resolve/reject
 *
 * @param timeoutMs - Timeout in milliseconds (default: 10000ms = 10s)
 * @returns Fetch function with timeout protection
 */
function createFetchWithTimeout(timeoutMs: number = 10000): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(input, {
                ...init,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);

            // Convert AbortError to user-friendly timeout error
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error(`Request timeout after ${timeoutMs}ms`);
            }

            throw error;
        }
    };
}

/**
 * Cria e configura cliente Supabase com timeout global
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

    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
        global: {
            fetch: createFetchWithTimeout(10000), // 10-second timeout for all requests
        },
    });
}

/**
 * Cria cliente Supabase sem gerenciamento de sessão, para queries de conteúdo público.
 * Não compartilha o lock interno de token refresh com o client principal,
 * evitando que queries de conteúdo sejam bloqueadas durante o auto-refresh de auth.
 */
function createSupabaseAnonClient(): SupabaseClient {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Variáveis de ambiente do Supabase não configuradas. " +
                "Certifique-se de definir NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY",
        );
    }

    const noopStorage = {
        getItem: (_key: string) => null,
        setItem: (_key: string, _value: string) => {},
        removeItem: (_key: string) => {},
    };

    // createClient (não createBrowserClient): sem singleton cache, sem Web Lock,
    // sem interferência com o token refresh do client principal
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            storage: noopStorage,
            storageKey: 'sb-anon-no-auth',
        },
        global: {
            fetch: createFetchWithTimeout(10000),
        },
    });
}

// Client principal — com sessão, para auth e operações de admin
export const supabase = createSupabaseClient();

// Client anônimo — sem sessão, para queries de conteúdo público
export const supabaseAnon = createSupabaseAnonClient();
