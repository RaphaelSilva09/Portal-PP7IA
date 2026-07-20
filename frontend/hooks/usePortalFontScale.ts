"use client";

import { useEffect, useState } from "react";
import {
    applyPortalFontScale,
    DEFAULT_PORTAL_FONT_SCALE,
    loadPortalFontScale,
    PORTAL_FONT_SCALE_EVENT,
    PORTAL_FONT_SCALE_MAX,
    PORTAL_FONT_SCALE_MIN,
    PORTAL_FONT_SCALE_STEP,
    PORTAL_FONT_SCALE_STORAGE_KEY,
    sanitizePortalFontScale,
    savePortalFontScale,
} from "@/lib/portalTypography";

/**
 * Hook usado pelos itens de menu de tipografia (dropdown do perfil, desktop
 * e mobile) — expõe aumentar/diminuir 5% por vez, com limites.
 */
export function usePortalFontScale() {
    const [scale, setScale] = useState<number>(DEFAULT_PORTAL_FONT_SCALE);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const current = loadPortalFontScale();
        setScale(current);
        setMounted(true);
        // O item de menu só monta quando o dropdown abre (render condicional)
        // — garante que esse subtree recém-montado já reflita a escala atual,
        // sem esperar a próxima troca de rota ou mudança de escala.
        applyPortalFontScale(current);
    }, []);

    useEffect(() => {
        const onChange = (e: Event) => {
            setScale(sanitizePortalFontScale((e as CustomEvent).detail));
        };
        const onStorage = (e: StorageEvent) => {
            if (e.key === null || e.key === PORTAL_FONT_SCALE_STORAGE_KEY) {
                setScale(loadPortalFontScale());
            }
        };
        window.addEventListener(PORTAL_FONT_SCALE_EVENT, onChange);
        window.addEventListener("storage", onStorage);
        return () => {
            window.removeEventListener(PORTAL_FONT_SCALE_EVENT, onChange);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    const step = (delta: number) => {
        const next = sanitizePortalFontScale(scale + delta);
        savePortalFontScale(next);
        setScale(next);
    };

    return {
        scale,
        increase: () => step(PORTAL_FONT_SCALE_STEP),
        decrease: () => step(-PORTAL_FONT_SCALE_STEP),
        canIncrease: scale < PORTAL_FONT_SCALE_MAX,
        canDecrease: scale > PORTAL_FONT_SCALE_MIN,
        mounted,
    };
}
