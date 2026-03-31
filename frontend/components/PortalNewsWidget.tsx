"use client";

import { PortalNewsItem } from "@/domain/entities/PortalNewsItem";
import { usePortalNews } from "@/presentation/hooks/usePortalNews";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const CATEGORY_COLORS: Record<string, string> = {
    launch:     "#f97316",
    newsletter: "#22c55e",
    content:    "#ec4899",
    tool:       "#eab308",
};

const BELL_KEYFRAMES = `
@keyframes bell-ring {
    0%   { transform: rotate(0deg); }
    10%  { transform: rotate(15deg); }
    20%  { transform: rotate(-13deg); }
    30%  { transform: rotate(11deg); }
    40%  { transform: rotate(-9deg); }
    50%  { transform: rotate(7deg); }
    60%  { transform: rotate(-5deg); }
    70%  { transform: rotate(3deg); }
    80%  { transform: rotate(-2deg); }
    90%  { transform: rotate(1deg); }
    100% { transform: rotate(0deg); }
}
.bell-ringing {
    display: inline-block;
    animation: bell-ring 1.5s ease-in-out;
    transform-origin: top center;
}
`;

function SkeletonItem() {
    return (
        <div className="flex items-stretch gap-0 animate-pulse">
            <div className="w-1 min-h-[72px] rounded-l-sm bg-white/10 flex-shrink-0" />
            <div className="flex-1 px-4 py-3 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-1/4" />
            </div>
        </div>
    );
}

function NewsItemRow({ item, isLast }: { item: PortalNewsItem; isLast: boolean }) {
    const barColor = CATEGORY_COLORS[item.category] ?? "#b8860b";
    const linkUrl = item.linkUrl;
    const router = useRouter();

    return (
        <div
            className={`relative flex items-stretch gap-0 ${!isLast ? "border-b border-white/5" : ""} ${linkUrl ? "cursor-pointer hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors" : ""}`}
            role={linkUrl ? "button" : undefined}
            tabIndex={linkUrl ? 0 : undefined}
            onClick={linkUrl ? () => router.push(linkUrl) : undefined}
            onKeyDown={linkUrl ? (e) => { if (e.key === "Enter" || e.key === " ") router.push(linkUrl); } : undefined}
        >
            {/* Barra colorida lateral */}
            <div
                className="w-1 flex-shrink-0 rounded-l-sm"
                style={{ backgroundColor: barColor }}
            />
            {/* Conteúdo do item */}
            <div className={`flex-1 px-4 py-3 ${linkUrl ? "pr-10" : ""}`}>
                <div className="flex items-start gap-2">
                    <span className="text-base leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-semibold leading-snug">{item.title}</p>
                        {item.description && (
                            <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{item.description}</p>
                        )}
                        <p className="text-white/40 text-xs mt-1">
                            Publicado em {item.formattedDate}
                        </p>
                    </div>
                </div>
            </div>
            {/* Seta fixa à direita, centralizada verticalmente */}
            {linkUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ArrowRight className="w-4 h-4 text-white/40" />
                </div>
            )}
        </div>
    );
}

export default function PortalNewsWidget() {
    const { items, isLoading } = usePortalNews();
    const bellRef = useRef<HTMLSpanElement>(null);

    // Animação do sino no mount
    useEffect(() => {
        const bell = bellRef.current;
        if (!bell) return;

        bell.classList.add("bell-ringing");

        const handleAnimationEnd = () => {
            bell.classList.remove("bell-ringing");
        };

        bell.addEventListener("animationend", handleAnimationEnd);
        return () => {
            bell.removeEventListener("animationend", handleAnimationEnd);
        };
    }, []);

    return (
        <>
            {/* Keyframes do sino injetados inline */}
            <style dangerouslySetInnerHTML={{ __html: BELL_KEYFRAMES }} />

            <div id="novidades" className="bg-[#111111] border border-[#b8860b]/30 rounded-xl mx-2 mb-6 overflow-hidden text-left">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#b8860b]/20">
                    <span className="text-base">📢</span>
                    <span className="text-[#f0c950] font-bold font-sans text-sm uppercase tracking-wider flex-1">
                        Novidades do Portal
                    </span>
                    <span
                        className="text-xs font-bold uppercase tracking-wide text-white bg-teal-500 rounded-full px-2 py-0.5"
                    >
                        NOVO
                    </span>
                    <span ref={bellRef} className="text-base ml-1 cursor-default select-none">🔔</span>
                </div>

                {/* Lista de itens */}
                <div>
                    {isLoading ? (
                        <>
                            <SkeletonItem />
                            <SkeletonItem />
                            <SkeletonItem />
                        </>
                    ) : items.length === 0 ? (
                        <p className="text-white/40 text-xs text-center py-4 px-4">
                            Nenhuma novidade disponível no momento.
                        </p>
                    ) : (
                        items.map((item, index) => (
                            <NewsItemRow
                                key={item.id}
                                item={item}
                                isLast={index === items.length - 1}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
