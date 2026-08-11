"use client";

import { useQuery } from "@tanstack/react-query";
import { Route } from "lucide-react";
import Link from "next/link";

interface TrailSummary {
    slug: string;
    title: string;
    description: string;
    coverImagePath: string | null;
    itemCount: number;
}

export default function TrilhasClient() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["reading-trails"],
        queryFn: async () => {
            const res = await fetch("/api/reading-trails");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return json.trails as TrailSummary[];
        },
    });

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Carregando…</p>;
    }

    if (error) {
        return <p className="text-sm text-muted-foreground">Não foi possível carregar as trilhas. Tente novamente.</p>;
    }

    const trails = data ?? [];

    if (trails.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
                <Route className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Nenhuma trilha publicada ainda.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {trails.map(trail => (
                <Link
                    key={trail.slug}
                    href={`/trilhas/${trail.slug}`}
                    className="group flex flex-col gap-2 rounded-2xl border border-border bg-background p-5 transition-colors hover:border-foreground/40"
                >
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {trail.itemCount} {trail.itemCount === 1 ? "leitura" : "leituras"}
                    </p>
                    <h2 className="font-serif text-xl tracking-tight text-ink group-hover:underline">{trail.title}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{trail.description}</p>
                </Link>
            ))}
        </div>
    );
}
