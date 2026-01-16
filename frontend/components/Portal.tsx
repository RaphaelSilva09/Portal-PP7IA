"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: React.ReactNode;
}

/**
 * Portal Component
 * 
 * Renderiza children diretamente no body, fora da hierarquia DOM do componente pai.
 * Essencial para modals, tooltips e elementos que precisam escapar do contexto de stacking (z-index).
 * 
 * @example
 * <Portal>
 *   <Modal />
 * </Portal>
 */
export default function Portal({ children }: PortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(children, document.body);
}
