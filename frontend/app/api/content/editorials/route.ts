/**
 * GET /api/content/editorials
 *
 * Public list of filenames in the editorial storage folder. Used by the
 * useEditorial hook to determine which fixed editorials are available.
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { EDITORIAL_STORAGE_BUCKET, EDITORIAL_STORAGE_FOLDER } from "@/constants/editorials";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

export async function GET() {
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
