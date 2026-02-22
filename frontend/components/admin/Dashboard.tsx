/**
 * Dashboard Component (Admin UI)
 *
 * Dashboard com estatísticas do painel admin.
 * Projetado para idosos 80+: números grandes, poucos itens.
 *
 * Princípios de UX:
 * - Números em font-size 48px+
 * - Máximo 4 cards
 * - Sem gráficos (confusos)
 * - Apenas números absolutos (sem porcentagens)
 */

"use client";

import { GlassCard } from "@/components/ui";
import DIContainer from "@/infrastructure/di/container";
import { BookOpen, Clock, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
    totalUsers: number;
    totalContent: number;
    totalAdmins: number;
    newUsersThisWeek: number;
}

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalContent: 0,
        totalAdmins: 0,
        newUsersThisWeek: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const useCase = DIContainer.getDashboardStatsUseCase();
            const data = await useCase.execute();

            setStats({
                totalUsers: data.users.totalUsers,
                totalContent: data.content.total,
                totalAdmins: data.users.totalAdmins,
                newUsersThisWeek: data.users.newUsersLast30Days,
            });
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const cards = [
        {
            label: "Leitores",
            value: stats.totalUsers,
            icon: Users,
            color: "text-[var(--brand-blue)]",
        },
        {
            label: "Conteúdos",
            value: stats.totalContent,
            icon: BookOpen,
            color: "text-[var(--brand-orange)]",
        },
        {
            label: "Admins",
            value: stats.totalAdmins,
            icon: Sparkles,
            color: "text-[var(--brand-green)]",
        },
        {
            label: "Últimos 30 Dias",
            value: stats.newUsersThisWeek,
            icon: Clock,
            color: "text-[var(--brand-purple)]",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-xl text-[var(--text-secondary)]">Carregando estatísticas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Visão Geral</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <GlassCard key={label} variant="bordered" padding="lg">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Icon className={`w-12 h-12 ${color}`} />
                            <div className="text-6xl font-bold text-[var(--text-primary)] tabular-nums">{value}</div>
                            <div className="text-lg text-[var(--text-secondary)] font-medium">{label}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
