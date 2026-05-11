/**
 * GET /api/content/home-recomendacoes-paulo
 *
 * Public read for the "Recomendações do Paulo" home block. Combines a row
 * from `home_recomendacoes_paulo` with a check that the underlying HTML
 * file exists in storage.
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pool } from "@/lib/db";
import {
    RECOMENDACOES_PAULO_SLUG,
    RECOMENDACOES_PAULO_STORAGE_BUCKET,
    RECOMENDACOES_PAULO_STORAGE_FOLDER,
} from "@/constants/recomendacoesPaulo";

const STORAGE_ROOT = process.env.STORAGE_ROOT ?? "./data";

export async function GET() {
    const dir = path.resolve(
        STORAGE_ROOT,
        RECOMENDACOES_PAULO_STORAGE_BUCKET,
        RECOMENDACOES_PAULO_STORAGE_FOLDER,
    );
    const expectedFile = `${RECOMENDACOES_PAULO_SLUG}.html`;

    interface RecomendacoesRow {
        slug: string;
        title: string | null;
        description: string | null;
        html_path: string | null;
    }

    let row: RecomendacoesRow | null = null;

    try {
        const { rows } = await pool.query<RecomendacoesRow>(
            `SELECT slug, title, description, html_path
             FROM home_recomendacoes_paulo
             WHERE slug = $1
             LIMIT 1`,
            [RECOMENDACOES_PAULO_SLUG],
        );
        row = rows[0] ?? null;
    } catch (err) {
        console.error("home_recomendacoes_paulo query failed:", err);
    }

    let available = false;
    try {
        const entries = await fs.readdir(dir);
        available = entries.includes(expectedFile);
    } catch (err: unknown) {
        if ((err as { code?: string }).code !== "ENOENT") {
            console.error("home/recomendacoes readdir failed:", err);
        }
    }

    return NextResponse.json({ row, available });
}
