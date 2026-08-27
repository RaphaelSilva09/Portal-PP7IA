import { pool } from "../../lib/db";
import type { CommunicationPreference, CommunicationPreferenceSource, CommunicationType } from "../../domain/entities/CommunicationPreference";
import type { ICommunicationPreferenceRepository } from "../../domain/repositories/ICommunicationPreferenceRepository";

interface PreferenceRow {
    user_id: string;
    communication_type: CommunicationType;
    enabled: boolean;
    subscribed_at: Date | null;
    unsubscribed_at: Date | null;
    last_changed_at: Date;
    source: CommunicationPreferenceSource;
}

function toEntity(row: PreferenceRow): CommunicationPreference {
    return {
        userId: row.user_id,
        communicationType: row.communication_type,
        enabled: row.enabled,
        subscribedAt: row.subscribed_at,
        unsubscribedAt: row.unsubscribed_at,
        lastChangedAt: row.last_changed_at,
        source: row.source,
    };
}

export class PostgresCommunicationPreferenceRepository implements ICommunicationPreferenceRepository {
    async get(userId: string, type: CommunicationType): Promise<CommunicationPreference | null> {
        const { rows } = await pool.query<PreferenceRow>(
            `SELECT user_id, communication_type, enabled, subscribed_at, unsubscribed_at, last_changed_at, source
             FROM public.communication_preferences
             WHERE user_id = $1 AND communication_type = $2`,
            [userId, type],
        );
        return rows[0] ? toEntity(rows[0]) : null;
    }

    async subscribe(userId: string, type: CommunicationType, source: CommunicationPreferenceSource): Promise<void> {
        await pool.query(
            `INSERT INTO public.communication_preferences
               (user_id, communication_type, enabled, subscribed_at, unsubscribed_at, last_changed_at, source)
             VALUES ($1, $2, true, now(), NULL, now(), $3)
             ON CONFLICT (user_id, communication_type) DO UPDATE SET
               enabled = true,
               subscribed_at = CASE
                 WHEN public.communication_preferences.enabled THEN public.communication_preferences.subscribed_at
                 ELSE now()
               END,
               last_changed_at = now(),
               source = $3`,
            [userId, type, source],
        );
    }

    async unsubscribe(userId: string, type: CommunicationType, source: CommunicationPreferenceSource): Promise<void> {
        await pool.query(
            `INSERT INTO public.communication_preferences
               (user_id, communication_type, enabled, subscribed_at, unsubscribed_at, last_changed_at, source)
             VALUES ($1, $2, false, NULL, now(), now(), $3)
             ON CONFLICT (user_id, communication_type) DO UPDATE SET
               enabled = false,
               unsubscribed_at = CASE
                 WHEN public.communication_preferences.enabled THEN now()
                 ELSE public.communication_preferences.unsubscribed_at
               END,
               last_changed_at = now(),
               source = $3`,
            [userId, type, source],
        );
    }
}
