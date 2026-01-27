import React from "react";

interface UpdateBadgeProps {
    date?: string;
    version?: string;
    href?: string;
}

export default function UpdateBadge({
    date = "21.01.2026",
    version = "001",
    href = "#newsletter",
}: UpdateBadgeProps) {
    return (
        <a
            href={href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full"
        >
            {/* Badge */}
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-500 text-sm font-medium">
                Última atualização: {date} • Versão Beta {version}
            </span>
        </a>
    );
}
