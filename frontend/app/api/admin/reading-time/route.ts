/**
 * POST /api/admin/reading-time?all=true|false
 *
 * Calcula tempo de leitura automaticamente a partir do HTML.
 * Compara content_hash para pular conteúdo não modificado.
 * Pass ?all=true para forçar recálculo em todos.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import { calculateFromFile } from "@/infrastructure/content/ReadingTimeCalculator";

interface SourceRow {
    id: number | string;
    html_path: string | null;
    read_time: number | null;
    content_hash: string | null;
}

interface SourceResult {
    source: string;
    items_processed: number;
    items_updated: number;
    items_skipped: number;
    errors: number;
    duration_ms: number;
}

const SOURCES: { table: string; htmlColumn: string; label: string }[] = [
    { table: "newsletters",          htmlColumn: "html_path",             label: "Newsletters" },
    { table: "mini_livros",          htmlColumn: "html_path",             label: "Mini-livros" },
    { table: "biblioteca",           htmlColumn: "html_path",             label: "Biblioteca" },
    { table: "especial_semana",      htmlColumn: "html_path",             label: "Inteligência Artificial" },
    { table: "radar_oportunidades",  htmlColumn: "html_path",             label: "Editoriais e Artigos" },
    { table: "estudar",              htmlColumn: "html_path",             label: "Estudar" },
    { table: "ebooks",               htmlColumn: "intro_html_path",       label: "E-books" },
];

async function isAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({ headers: await nextHeaders() });
    return (session?.user as { role?: string } | undefined)?.role === "admin";
}

async function processSource(
    source: { table: string; htmlColumn: string; label: string },
    forceAll: boolean,
): Promise<SourceResult> {
    const start = Date.now();
    const { rows } = await pool.query<SourceRow>(
        `SELECT id, ${source.htmlColumn} AS html_path, read_time, content_hash FROM ${source.table} WHERE ${source.htmlColumn} IS NOT NULL`,
    );

    let itemsUpdated = 0;
    let itemsSkipped = 0;
    let errors = 0;

    for (const row of rows) {
        if (!row.html_path) continue;
        try {
            const result = await calculateFromFile(row.html_path);

            if (!forceAll && row.content_hash && row.content_hash === result.contentHash) {
                itemsSkipped++;
                continue;
            }

            await pool.query(
                `UPDATE ${source.table} SET read_time = $1, content_hash = $2 WHERE id = $3`,
                [result.minutes, result.contentHash, row.id],
            );
            itemsUpdated++;
        } catch {
            errors++;
        }
    }

    return {
        source: source.label,
        items_processed: rows.length,
        items_updated: itemsUpdated,
        items_skipped: itemsSkipped,
        errors,
        duration_ms: Date.now() - start,
    };
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const forceAll = searchParams.get("all") === "true";

    const start = Date.now();
    const results: SourceResult[] = [];

    for (const source of SOURCES) {
        const result = await processSource(source, forceAll);
        results.push(result);
    }

    const totalUpdated = results.reduce((sum, r) => sum + r.items_updated, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.items_skipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

    return NextResponse.json({
        results,
        total_updated: totalUpdated,
        total_skipped: totalSkipped,
        total_errors: totalErrors,
        duration_ms: Date.now() - start,
    });
}
