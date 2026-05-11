/**
 * GET /api/admin/editorials
 *
 * Lists filenames present in the editorial storage folder. Admin-gated.
 * Used by AdminEditorial.tsx to know which slugs already have a file uploaded.
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { EDITORIAL_STORAGE_BUCKET, EDITORIAL_STORAGE_FOLDER } from "@/constants/editorials";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const dir = path.resolve(STORAGE_ROOT, EDITORIAL_STORAGE_BUCKET, EDITORIAL_STORAGE_FOLDER);
    try {
        const entries = await fs.readdir(dir);
        return NextResponse.json({ files: entries });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "ENOENT") {
            return NextResponse.json({ files: [] });
        }
        return NextResponse.json({ error: "Erro ao listar arquivos" }, { status: 500 });
    }
}
