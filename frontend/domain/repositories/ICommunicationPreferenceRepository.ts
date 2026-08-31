import type { CommunicationPreference, CommunicationPreferenceSource, CommunicationType } from "../entities/CommunicationPreference";

export interface ICommunicationPreferenceRepository {
    /** Estado atual da preferência (null = nunca inscrito). */
    get(userId: string, type: CommunicationType): Promise<CommunicationPreference | null>;

    /**
     * Inscreve o usuário. Idempotente: reaplicar com o mesmo usuário/tipo não
     * duplica nem falha; subscribedAt só avança quando a transição é
     * false→true (ou primeira inscrição).
     */
    subscribe(userId: string, type: CommunicationType, source: CommunicationPreferenceSource): Promise<void>;

    /**
     * Cancela a inscrição. Idempotente: cancelar de novo (já cancelado, ou
     * nunca inscrito) não falha e não altera unsubscribedAt de uma vez já
     * registrada. Nunca reativa — é a única operação que este método faz.
     */
    unsubscribe(userId: string, type: CommunicationType, source: CommunicationPreferenceSource): Promise<void>;
}
