/**
 * GET /api/content/mini-livro-section-meta
 *
 * Public read of mini_livro_section_meta rows (kind, title, description).
 */
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    try {
        const { rows } = await pool.query<{
            kind: string;
            title: string | null;
            description: string | null;
        }>(`SELECT kind, title, description FROM mini_livro_section_meta`);
        return NextResponse.json(rows);
    } catch (err) {
        console.error("mini_livro_section_meta query failed:", err);
        return NextResponse.json([]);
    }
}
