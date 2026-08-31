/** AccessibilityPreference (Domain Layer) — perfil de preferências de acessibilidade por usuário e categoria de dispositivo. */

export type DeviceCategory = "mobile" | "non_mobile";

export interface AccessibilityPreference {
    userId: string;
    deviceCategory: DeviceCategory;
    /**
     * Estrutura opaca ao domínio — validada e tipada em `frontend/lib`
     * (readingPrefs.ts, portalTypography.ts) antes de chegar aqui, para não
     * acoplar esta camada a módulos com código de DOM.
     */
    preferences: Record<string, unknown>;
    updatedAt: Date;
}
