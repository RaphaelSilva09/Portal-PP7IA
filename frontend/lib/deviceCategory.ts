/**
 * Classificação de categoria de dispositivo — usada para diferenciar as
 * preferências de acessibilidade entre dispositivos móveis e não-móveis do
 * mesmo usuário (ver frontend/domain/entities/AccessibilityPreference.ts).
 *
 * Deliberadamente baseada em User-Agent, nunca em viewport/matchMedia: a
 * categoria é do dispositivo, não do breakpoint de layout atual — redimensionar
 * a janela do desktop não pode fazer o usuário "virar" mobile no meio da
 * sessão. Tablets saem como não-móveis, deliberadamente — tanto o iPad
 * moderno (UA de Macintosh) quanto o UA clássico com "iPad" literal, que não
 * é reconhecido pelo padrão abaixo de propósito, para as duas variantes do
 * mesmo dispositivo caírem sempre na mesma categoria. Ambiguidade inerente
 * ao pedido (tablet não é claramente móvel nem não-móvel), aceita e não
 * resolvida aqui.
 */

export type DeviceCategory = "mobile" | "non_mobile";

const MOBILE_UA_PATTERN = /android.+mobile|iphone|ipod|windows phone|blackberry|iemobile|opera mini/i;

export function classifyDeviceCategory(userAgent: string | null | undefined): DeviceCategory {
    if (!userAgent) return "non_mobile";
    return MOBILE_UA_PATTERN.test(userAgent) ? "mobile" : "non_mobile";
}
