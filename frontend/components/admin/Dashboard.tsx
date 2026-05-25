"use client";

import { BookOpen, Clock, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { TodayRegistrations } from "./TodayRegistrations";

interface DashboardStats {
    totalUsers: number;
    totalContent: number;
    totalAdmins: number;
    newUsersLast30Days: number;
}

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalContent: 0,
        totalAdmins: 0,
        newUsersLast30Days: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? `HTTP ${res.status}`);
            }
            const data = await res.json();
            setStats({
                totalUsers: data.users.totalUsers,
                totalContent: data.content.total,
                totalAdmins: data.users.totalAdmins,
                newUsersLast30Days: data.users.newUsersLast30Days,
            });
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const cards = [
        { label: "Total de Leitores",        value: stats.totalUsers,         icon: Users    },
        { label: "Total de Conteúdos",       value: stats.totalContent,       icon: BookOpen },
        { label: "Administradores",          value: stats.totalAdmins,        icon: Sparkles },
        { label: "Novos Leitores (30 dias)", value: stats.newUsersLast30Days, icon: Clock    },
    ];

    if (isLoading) {
        return (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                <p className="text-sm text-muted-foreground">Carregando…</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {cards.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center">
                        <Icon className="mb-3 size-5 text-muted-foreground" />
                        <div className="font-serif text-4xl tracking-tight text-ink tabular-nums">{value}</div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>
            <TodayRegistrations />
        </div>
    );
}
