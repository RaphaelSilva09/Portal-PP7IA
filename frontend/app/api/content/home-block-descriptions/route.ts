/**
 * GET /api/content/home-block-descriptions
 *
 * Public list of homepage block descriptions overrides.
 */
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
    try {
        const { rows } = await pool.query<{ slug: string; description: string | null }>(
            `SELECT slug, description FROM home_block_descriptions`,
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error("home-block-descriptions query failed:", err);
        return NextResponse.json([]);
    }
}
