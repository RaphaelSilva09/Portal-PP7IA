import { pool } from "../../lib/db";
import type { AccessibilityPreference, DeviceCategory } from "../../domain/entities/AccessibilityPreference";
import type { IAccessibilityPreferenceRepository } from "../../domain/repositories/IAccessibilityPreferenceRepository";

interface PreferenceRow {
    user_id: string;
    device_category: DeviceCategory;
    preferences: Record<string, unknown>;
    updated_at: Date;
}

function toEntity(row: PreferenceRow): AccessibilityPreference {
    return {
        userId: row.user_id,
        deviceCategory: row.device_category,
        preferences: row.preferences,
        updatedAt: row.updated_at,
    };
}

export class PostgresAccessibilityPreferenceRepository implements IAccessibilityPreferenceRepository {
    async get(userId: string, deviceCategory: DeviceCategory): Promise<AccessibilityPreference | null> {
        const { rows } = await pool.query<PreferenceRow>(
            `SELECT user_id, device_category, preferences, updated_at
             FROM public.accessibility_preferences
             WHERE user_id = $1 AND device_category = $2`,
            [userId, deviceCategory],
        );
        return rows[0] ? toEntity(rows[0]) : null;
    }

    async upsert(userId: string, deviceCategory: DeviceCategory, preferences: Record<string, unknown>): Promise<void> {
        await pool.query(
            `INSERT INTO public.accessibility_preferences (user_id, device_category, preferences, updated_at)
             VALUES ($1, $2, $3::jsonb, now())
             ON CONFLICT (user_id, device_category) DO UPDATE SET
               preferences = EXCLUDED.preferences,
               updated_at = now()`,
            [userId, deviceCategory, JSON.stringify(preferences)],
        );
    }
}
