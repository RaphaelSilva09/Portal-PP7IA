"use client";

import { useEffect, useState } from "react";
import { Activity, BookOpen, CalendarDays, CircleDot, Newspaper, Radar, Star, UserCheck, Users } from "lucide-react";

interface AnalyticsData {
    content: {
        newsletters: number;
        miniLivros: number;
        biblioteca: number;
        especialSemana: number;
        ebooks: number;
        radarOportunidades: number;
        estudar: number;
        total: number;
    };
    users: {
        totalUsers: number;
        newUsersLast30Days: number;
        totalAdmins: number;
    };
    activity: {
        activeToday: number;
        activeLast7Days: number;
        activeLast15Days: number;
        activeLast30Days: number;
    };
}

const CONTENT_BREAKDOWN: { key: keyof AnalyticsData["content"]; label: string; icon: typeof Newspaper }[] = [
    { key: "newsletters",       label: "Newsletters",              icon: Newspaper },
    { key: "miniLivros",        label: "Enquanto é Tempo",          icon: BookOpen  },
    { key: "biblioteca",        label: "Biblioteca",                icon: Star      },
    { key: "radarOportunidades", label: "Editoriais e Artigos",     icon: Radar     },
    { key: "estudar",           label: "Estudar",                   icon: CircleDot },
    { key: "especialSemana",    label: "Inteligência Artificial",   icon: Star      },
    { key: "ebooks",            label: "E-books",                   icon: BookOpen  },
];

/**
 * Painel de Analytics do portal — atividade de leitores (não só cadastro) e
 * composição do conteúdo. "Ativo" combina `last_seen_at` (beacon best-effort
 * de UserActivityTracker.tsx) com `session.updatedAt` do better-auth (sinal
 * server-side, confiável mesmo se o beacon falhar) — ver getActivityStats em
 * PostgresAnalyticsRepository.ts.
 */
export function AdminAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/admin/stats")
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((json: AnalyticsData) => {
                if (!cancelled) setData(json);
            })
            .catch(err => console.error("Erro ao carregar analytics:", err))
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                <p className="text-sm text-muted-foreground">Carregando…</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                <p className="text-sm text-muted-foreground">Não foi possível carregar as estatísticas.</p>
            </div>
        );
    }

    const activityCards = [
        { label: "Ativos hoje",         value: data.activity.activeToday,      icon: Activity  },
        { label: "Últimos 7 dias",      value: data.activity.activeLast7Days,  icon: UserCheck },
        { label: "Últimos 15 dias",     value: data.activity.activeLast15Days, icon: UserCheck },
        { label: "Últimos 30 dias",     value: data.activity.activeLast30Days, icon: CalendarDays },
    ];

    const maxContentCount = Math.max(1, ...CONTENT_BREAKDOWN.map(({ key }) => data.content[key]));

    return (
        <div className="space-y-8">
            {/* Atividade de leitores */}
            <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Leitores que abriram o portal
                </p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {activityCards.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                            <Icon className="mb-3 size-5 text-muted-foreground" />
                            <div className="font-serif text-4xl tracking-tight text-ink tabular-nums">{value}</div>
                            <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    Considera qualquer visita ao portal já autenticado — não apenas o momento do login.
                </p>
            </div>

            {/* Cadastro geral */}
            <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Cadastro
                </p>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                        <Users className="mb-3 size-5 text-muted-foreground" />
                        <div className="font-serif text-4xl tracking-tight text-ink tabular-nums">{data.users.totalUsers}</div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">Total de leitores</p>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                        <CalendarDays className="mb-3 size-5 text-muted-foreground" />
                        <div className="font-serif text-4xl tracking-tight text-ink tabular-nums">{data.users.newUsersLast30Days}</div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">Novos (30 dias)</p>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                        <UserCheck className="mb-3 size-5 text-muted-foreground" />
                        <div className="font-serif text-4xl tracking-tight text-ink tabular-nums">{data.users.totalAdmins}</div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">Administradores</p>
                    </div>
                </div>
            </div>

            {/* Composição do conteúdo */}
            <div>
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Conteúdo por bloco
                </p>
                <div className="space-y-2 rounded-2xl border border-border bg-card p-5">
                    {CONTENT_BREAKDOWN.map(({ key, label, icon: Icon }) => {
                        const count = data.content[key];
                        const widthPct = Math.max(4, Math.round((count / maxContentCount) * 100));
                        return (
                            <div key={key} className="flex items-center gap-3">
                                <Icon className="size-4 shrink-0 text-muted-foreground" />
                                <span className="w-40 shrink-0 truncate text-sm text-foreground">{label}</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-accent">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
