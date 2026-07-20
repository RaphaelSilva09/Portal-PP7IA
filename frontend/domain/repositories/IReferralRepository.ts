import { Referral } from "../entities/Referral";

export interface IReferralRepository {
    createInvite(referrerUserId: string, invitedEmail: string): Promise<{ token: string }>;
    /** Vincula o cadastro ao convite; idempotente (não sobrescreve se já atribuído). */
    attributeSignup(token: string, signedUpUserId: string): Promise<boolean>;
    /** Marca a primeira visualização de conteúdo do indicado, se ainda não registrada. */
    markFirstContentView(signedUpUserId: string): Promise<void>;
    getByReferrer(referrerUserId: string): Promise<Referral[]>;
}
