/** Referral (Domain Layer) — fundação de rastreamento de indicação (PDF 6.4). */

export type ReferralStatus = "sent" | "signed_up" | "engaged";

export interface ReferralProps {
    id: number;
    createdAt: Date;
    updatedAt?: Date | null;
    referrerUserId: string;
    invitedEmail: string;
    inviteToken: string;
    status: ReferralStatus;
    signedUpUserId: string | null;
    firstContentViewedAt: Date | null;
}

export class Referral {
    private constructor(private readonly props: ReferralProps) {}

    static create(props: ReferralProps): Referral {
        return new Referral(props);
    }

    get id(): number {
        return this.props.id;
    }

    get referrerUserId(): string {
        return this.props.referrerUserId;
    }

    get invitedEmail(): string {
        return this.props.invitedEmail;
    }

    get status(): ReferralStatus {
        return this.props.status;
    }

    get signedUpUserId(): string | null {
        return this.props.signedUpUserId;
    }

    get firstContentViewedAt(): Date | null {
        return this.props.firstContentViewedAt;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    toObject(): ReferralProps {
        return { ...this.props };
    }
}
