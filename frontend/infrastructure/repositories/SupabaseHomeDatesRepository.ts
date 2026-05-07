/**
 * SupabaseHomeDatesRepository (Infrastructure Layer)
 *
 * Repository for accessing mv_home_latest_dates materialized view via Postgres direto (`pg` Pool).
 * Replaces 6 parallel queries (.getLatest() on each content table) with single MV query.
 *
 * Performance improvement:
 * - Before: 6 parallel queries (~500ms with network latency)
 * - After: 1 query to materialized view (~50ms)
 * - Reduction: 90% faster, 83% fewer queries
 *
 * Princípios aplicados:
 * - DIP: Could implement IHomeDatesRepository interface (optional for this use case)
 * - Adapter Pattern: Adapts MV structure to domain model
 * - Graceful Degradation: Returns null dates on error (never breaks UI)
 * - SRP: Responsible only for fetching home dates from MV
 */

import { pool } from "../../lib/db";

/**
 * Row structure from mv_home_latest_dates materialized view
 */
export interface HomeDateRecord {
    section_name: string;
    latest_created_at: string;
}

/**
 * Domain model for home page dates
 * Maps section names to their latest created_at Date objects
 */
export interface HomePageDates {
    newsletter: Date | null;
    especial: Date | null;
    radar: Date | null;
    miniLivros: Date | null;
    biblioteca: Date | null;
    estudar: Date | null;
}

/**
 * Repository for home dates materialized view
 */
export class SupabaseHomeDatesRepository {
    /**
     * Fetches latest created_at from all content sections via materialized view
     * Returns null for missing/invalid dates (graceful degradation)
     */
    async getLatestDates(): Promise<HomePageDates> {
        try {
            const { rows } = await pool.query<HomeDateRecord>(
                `SELECT section_name, latest_created_at FROM mv_home_latest_dates`,
            );

            if (!rows || rows.length === 0) {
                console.warn("[SupabaseHomeDatesRepository] No data returned from mv_home_latest_dates");
                return this.emptyDates();
            }

            // Convert array of records to Map for O(1) lookup
            const dateMap = new Map<string, Date>();
            for (const row of rows) {
                if (row.section_name && row.latest_created_at) {
                    const parsedDate = new Date(row.latest_created_at);
                    // Validate date is not Invalid Date
                    if (!isNaN(parsedDate.getTime())) {
                        dateMap.set(row.section_name, parsedDate);
                    }
                }
            }

            // Map MV section names to domain model
            // Handle missing sections gracefully (return null)
            return {
                newsletter: dateMap.get("newsletter") ?? null,
                especial: dateMap.get("especial_semana") ?? null,
                radar: dateMap.get("radar_oportunidades") ?? null,
                miniLivros: dateMap.get("mini_livros") ?? null,
                biblioteca: dateMap.get("biblioteca") ?? null,
                estudar: dateMap.get("estudar") ?? null,
            };
        } catch (err) {
            console.error("[SupabaseHomeDatesRepository] Unexpected error fetching home dates:", err);
            return this.emptyDates();
        }
    }

    /**
     * Returns empty dates object (all null)
     * Used as fallback in error scenarios
     */
    private emptyDates(): HomePageDates {
        return {
            newsletter: null,
            especial: null,
            radar: null,
            miniLivros: null,
            biblioteca: null,
            estudar: null,
        };
    }
}
