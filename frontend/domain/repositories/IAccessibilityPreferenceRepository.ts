import type { AccessibilityPreference, DeviceCategory } from "../entities/AccessibilityPreference";

export interface IAccessibilityPreferenceRepository {
    /** Perfil salvo (null = usuário ainda sem preferência sincronizada nesta categoria). */
    get(userId: string, deviceCategory: DeviceCategory): Promise<AccessibilityPreference | null>;

    /** Grava (cria ou substitui) o perfil da categoria — idempotente. */
    upsert(userId: string, deviceCategory: DeviceCategory, preferences: Record<string, unknown>): Promise<void>;
}
