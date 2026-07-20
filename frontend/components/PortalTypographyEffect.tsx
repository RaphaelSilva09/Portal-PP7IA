"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    applyPortalFontScale,
    loadPortalFontScale,
    PORTAL_FONT_SCALE_EVENT,
} from "@/lib/portalTypography";

/**
 * Aplica a escala de tipografia do portal no documento — montado uma única
 * vez perto da raiz (não em cada item de menu) para não duplicar trabalho.
 * Sem UI própria.
 */
export default function PortalTypographyEffect() {
    const pathname = usePathname();

    // Roda no mount e em toda troca de rota client-side: a navegação remonta
    // o conteúdo da página (Header/Footer inclusive) com nós DOM novos, que
    // precisam de uma passagem nova (applyPortalFontScale não depende de
    // cache entre chamadas — cada chamada mede e aplica do zero).
    useEffect(() => {
        applyPortalFontScale(loadPortalFontScale());
    }, [pathname]);

    useEffect(() => {
        const onChange = (e: Event) => {
            applyPortalFontScale((e as CustomEvent).detail);
        };
        window.addEventListener(PORTAL_FONT_SCALE_EVENT, onChange);
        return () => window.removeEventListener(PORTAL_FONT_SCALE_EVENT, onChange);
    }, []);

    return null;
}
