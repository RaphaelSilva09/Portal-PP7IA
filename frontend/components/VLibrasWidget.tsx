"use client";

import Script from "next/script";

/**
 * VLibras (Libras/Brazilian Sign Language) widget — official government tool.
 * The 7.0 script self-initializes; it must not be paired with a manual
 * `new window.VLibras.Widget()` call, which would create a duplicate instance.
 * Failure to load must never affect the rest of the page.
 */
export default function VLibrasWidget() {
    return (
        <Script
            src="https://vlibras.gov.br/app/vlibras-plugin.js"
            strategy="afterInteractive"
            onError={() => {
                console.warn("VLibras: falha ao carregar o widget de Libras.");
            }}
        />
    );
}
