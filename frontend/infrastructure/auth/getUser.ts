import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";

export interface CurrentUser {
    id: string;
    email: string | null;
    role: string | null;
}

export async function getUser(): Promise<CurrentUser | null> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    if (!session?.user) return null;

    const u = session.user as { id: string; email: string | null; role?: string | null };
    return {
        id: u.id,
        email: u.email ?? null,
        role: u.role ?? null,
    };
}
