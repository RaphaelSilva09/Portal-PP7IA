/**
 * DELETE /api/admin/home-recomendacoes-paulo/file
 *
 * Removes the recomendações HTML from storage. Row in the table is left
 * intact (the html_path may still be populated; useEditorial-style availability
 * checks rely on file existence, not the column value).
 */
import { NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import DIContainer from "@/infrastructure/di/container";
import {
    RECOMENDACOES_PAULO_STORAGE_BUCKET,
    getRecomendacoesPauloStoragePath,
} from "@/constants/recomendacoesPaulo";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function DELETE() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    try {
        const storage = DIContainer.getStorageRepository();
        await storage.delete(
            RECOMENDACOES_PAULO_STORAGE_BUCKET,
            getRecomendacoesPauloStoragePath(),
        );
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("admin recomendacoes file delete failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Falha ao deletar arquivo" },
            { status: 500 },
        );
    }
}
