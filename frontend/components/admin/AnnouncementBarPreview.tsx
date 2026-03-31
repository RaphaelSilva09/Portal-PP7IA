"use client";

/**
 * AnnouncementBarPreview Component (Admin)
 *
 * Renderiza dois viewports read-only da barra de aviso:
 * 1. Desktop: largura 100%, altura 40px
 * 2. Mobile: max-width 375px, min-height 48px
 *
 * Sem lógica de fechar/navegar — apenas visual.
 */

interface AnnouncementBarPreviewProps {
    bar: Partial<{
        message: string;
        linkLabel: string;
        bgColor: string;
        textColor: string;
    }>;
}

export function AnnouncementBarPreview({ bar }: AnnouncementBarPreviewProps) {
    const bg   = bar.bgColor   || "#1a1a1a";
    const text = bar.textColor || "#ffffff";
    const msg  = bar.message   || "";
    const link = bar.linkLabel || "";

    return (
        <div className="space-y-3">
            {/* Desktop */}
            <div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">Desktop</p>
                <div
                    className="w-full h-10 rounded flex items-center justify-center px-4 overflow-hidden"
                    style={{ backgroundColor: bg, color: text }}
                >
                    <span className="truncate text-sm font-medium">
                        {msg || <span className="opacity-40 italic">Mensagem da barra...</span>}
                        {link && <span className="ml-2 underline underline-offset-2 font-semibold">{link}</span>}
                    </span>
                </div>
            </div>

            {/* Mobile */}
            <div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">Mobile (375px)</p>
                <div
                    className="max-w-[375px] min-h-12 rounded px-4 py-2 flex flex-col justify-center"
                    style={{ backgroundColor: bg, color: text }}
                >
                    <span className="text-sm font-medium leading-snug line-clamp-2">
                        {msg || <span className="opacity-40 italic">Mensagem da barra...</span>}
                        {link && <span className="ml-1 underline underline-offset-2 font-semibold">{link}</span>}
                    </span>
                </div>
            </div>
        </div>
    );
}
