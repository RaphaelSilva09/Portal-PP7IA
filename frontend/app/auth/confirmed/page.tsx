import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { portalContentClass } from "@/lib/layout";
import Link from "next/link";
import { getSupabaseClientKey, getSupabaseUrl } from "@/infrastructure/config/supabase-env";

export default async function ConfirmedPage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        getSupabaseUrl(),
        getSupabaseClientKey(),
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() {},
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) redirect("/home");

    return (
        <main className="flex min-h-screen flex-col justify-center bg-background text-center">
            <div className={portalContentClass}>
                <div className="mx-auto flex max-w-md flex-col items-center gap-6">
                    <h1 className="text-2xl font-bold text-foreground">Email confirmado!</h1>
                    <p className="text-muted-foreground">
                        Sua conta foi verificada. Faça login para continuar.
                    </p>
                    <Link
                        href="/?authModal=login"
                        className="rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        Fazer login
                    </Link>
                </div>
            </div>
        </main>
    );
}
