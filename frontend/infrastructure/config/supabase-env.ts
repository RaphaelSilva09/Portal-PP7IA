const SUPABASE_ENV_ERROR =
    "Variáveis de ambiente do Supabase não configuradas. " +
    "Certifique-se de definir NEXT_PUBLIC_SUPABASE_URL e " +
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY";

export function getSupabaseUrl(): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        throw new Error(SUPABASE_ENV_ERROR);
    }

    return supabaseUrl;
}

export function getSupabaseClientKey(): string {
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const resolvedKey = publishableKey ?? anonKey;

    if (!resolvedKey) {
        throw new Error(SUPABASE_ENV_ERROR);
    }

    return resolvedKey;
}

