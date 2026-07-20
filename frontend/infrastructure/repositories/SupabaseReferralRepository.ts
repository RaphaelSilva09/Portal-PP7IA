import { pool } from "../../lib/db";
import { Referral, ReferralProps, ReferralStatus } from "../../domain/entities/Referral";
import { IReferralRepository } from "../../domain/repositories/IReferralRepository";

interface ReferralRow {
    id: number;
    created_at: string;
    updated_at?: string | null;
    referrer_user_id: string;
    invited_email: string;
    invite_token: string;
    status: ReferralStatus;
    signed_up_user_id: string | null;
    first_content_viewed_at: string | null;
}

/**
 * Web Crypto API (global `crypto`, sem import de "node:crypto") — evita um
 * UnhandledSchemeError do webpack quando este arquivo acaba alcançável pelo
 * grafo do bundle de cliente (container.ts é importado por hooks client-side).
 */
function generateInviteToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    return Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

export class SupabaseReferralRepository implements IReferralRepository {
    async createInvite(referrerUserId: string, invitedEmail: string): Promise<{ token: string }> {
        const token = generateInviteToken();
        await pool.query(
            `INSERT INTO referrals (referrer_user_id, invited_email, invite_token) VALUES ($1, $2, $3)`,
            [referrerUserId, invitedEmail, token],
        );
        return { token };
    }

    async attributeSignup(token: string, signedUpUserId: string): Promise<boolean> {
        const result = await pool.query(
            `UPDATE referrals
             SET signed_up_user_id = $1, status = 'signed_up'
             WHERE invite_token = $2 AND signed_up_user_id IS NULL`,
            [signedUpUserId, token],
        );
        return (result.rowCount ?? 0) > 0;
    }

    async markFirstContentView(signedUpUserId: string): Promise<void> {
        await pool.query(
            `UPDATE referrals
             SET first_content_viewed_at = NOW(), status = 'engaged'
             WHERE signed_up_user_id = $1 AND first_content_viewed_at IS NULL`,
            [signedUpUserId],
        );
    }

    async getByReferrer(referrerUserId: string): Promise<Referral[]> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM referrals WHERE referrer_user_id = $1 ORDER BY created_at DESC`,
                [referrerUserId],
            );
            return (rows as ReferralRow[]).map(row => this.mapToEntity(row));
        } catch (err) {
            console.error(`Erro ao buscar indicações de ${referrerUserId}:`, err);
            return [];
        }
    }

    private mapToEntity(row: ReferralRow): Referral {
        const props: ReferralProps = {
            id: row.id,
            createdAt: new Date(row.created_at),
            updatedAt: row.updated_at ? new Date(row.updated_at) : null,
            referrerUserId: row.referrer_user_id,
            invitedEmail: row.invited_email,
            inviteToken: row.invite_token,
            status: row.status,
            signedUpUserId: row.signed_up_user_id,
            firstContentViewedAt: row.first_content_viewed_at ? new Date(row.first_content_viewed_at) : null,
        };
        return Referral.create(props);
    }
}
