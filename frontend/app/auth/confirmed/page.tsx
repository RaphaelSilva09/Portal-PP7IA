import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

export default async function ConfirmedPage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
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
        </main>
    );
}
