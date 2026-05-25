"use client";

import { useContentStats } from "@/presentation/hooks/useContentStats";

export default function HeroStats() {
    const { total, miniLivros, isLoading } = useContentStats();

    const fmt = (n: number) => (isLoading ? "—" : String(n));

    return (
        <div className="grid grid-cols-3 gap-6 border-t border-border pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <div className="text-center">
                <div className="font-serif text-4xl text-ink">{fmt(total)}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Edições</div>
            </div>
            <div className="text-center">
                <div className="font-serif text-4xl text-ink">{fmt(miniLivros)}/21</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mini-livros</div>
            </div>
            <div className="text-center">
                <div className="font-serif text-4xl text-ink">7+7</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Blocos &amp; IAs</div>
            </div>
        </div>
    );
}
