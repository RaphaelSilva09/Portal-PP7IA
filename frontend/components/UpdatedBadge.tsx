"use client";

import { useEffect, useState } from "react";
import { hasUpdateSinceLastSeen } from "@/lib/seenContent";

interface UpdatedBadgeProps {
    href: string | null;
    updatedAt?: Date | null;
}

/**
 * Marcação discreta de conteúdo modificado desde a última leitura (PDF 5.5).
 * Só aparece para conteúdo que o leitor já abriu neste dispositivo.
 */
export default function UpdatedBadge({ href, updatedAt }: UpdatedBadgeProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(hasUpdateSinceLastSeen(href, updatedAt));
    }, [href, updatedAt]);

    if (!visible) return null;

    return (
        <span
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"
            title="Este conteúdo mudou desde a sua última leitura"
        >
            <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
            Atualizado
        </span>
    );
}
