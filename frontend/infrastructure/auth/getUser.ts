// frontend/infrastructure/auth/getUser.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface CurrentUser {
    id: string;
    email: string | null;
    role: string | null;       // app_metadata.role
}

export async function getUser(): Promise<CurrentUser | null> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
        throw new Error("Supabase env vars missing for getUser()");
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {
                /* no-op in route handlers — middleware handles refresh */
            },
        },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    return {
        id: data.user.id,
        email: data.user.email ?? null,
        role: (data.user.app_metadata?.role as string | undefined) ?? null,
    };
}
