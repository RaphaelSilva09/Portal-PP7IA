/** CommunicationPreference (Domain Layer) — opt-in/opt-out por tipo de comunicação, com trilha de auditoria. */

/** Tipos de comunicação com preferência própria. Hoje só o resumo semanal. */
export type CommunicationType = "weekly_news";

/** Origem da mudança de preferência — de onde veio a ação que alterou o estado. */
export type CommunicationPreferenceSource = "profile" | "email_body" | "email_header" | "legacy_signup_migration";

export interface CommunicationPreference {
    userId: string;
    communicationType: CommunicationType;
    enabled: boolean;
    subscribedAt: Date | null;
    unsubscribedAt: Date | null;
    lastChangedAt: Date;
    source: CommunicationPreferenceSource;
}
