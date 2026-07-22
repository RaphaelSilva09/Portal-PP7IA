"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Sinaliza ao servidor que o portal foi aberto por um usuário já autenticado
 * (distinto de login — ver /api/user/activity). Montado uma única vez na
 * raiz do app (layout.tsx); dispara no máximo uma vez por carregamento de
 * aba, não a cada navegação client-side, seguindo o mesmo padrão de
 * ContentViewTracker.tsx.
 */
export default function UserActivityTracker() {
    const { user, isLoading } = useAuth();
    const hasReported = useRef(false);

    useEffect(() => {
        if (isLoading || !user || hasReported.current) return;
        hasReported.current = true;
        fetch("/api/user/activity", { method: "POST" }).catch(() => {});
    }, [user, isLoading]);

    return null;
}
