"use client";

import {
    Heart,
    Eye,
    AlertCircle,
    CheckCircle2,
    Users,
    ArrowRight,
} from "lucide-react";

export default function Declaracoes() {
    return (
        <section id="declaracoes" className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* ============================================
                DECLARAÇÕES / MANIFESTO - VERSÃO BALANCEADA
                Layout otimizado com cores suaves e espaçamento equilibrado
                ============================================ */}
                <div className="mb-18">
                    {/* ============================================
                    LINHA 1: PROPÓSITO (Full Width)
                    ============================================ */}
                    <div className="mb-8">
                        <div className="relative overflow-hidden rounded-3xl group">
                            {/* Background gradiente sutil */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-indigo-500/5 to-purple-500/8" />

                            {/* Efeito de luz suave azul-roxo */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 blur-3xl rounded-full" />

                            {/* Border sutil */}
                            <div className="absolute inset-0 rounded-3xl border border-blue-500/15" />

                            {/* Conteúdo */}
                            <div className="relative z-10 p-8 lg:p-10">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Ícone */}
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Heart className="w-7 h-7 lg:w-8 lg:h-8 text-blue-400" />
                                        </div>
                                    </div>

                                    {/* Conteúdo de texto */}
                                    <div className="flex-1">
                                        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2 block">
                                            Propósito
                                        </span>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">
                                            Curar conhecimento prático para filhos, netos e novas gerações
                                        </h2>
                                        <p className="text-sm sm:text-base text-gray-400">
                                            A tecnologia é ferramenta. O foco é{" "}
                                            <span className="text-blue-400 font-semibold">GENTE</span>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    LINHA 2: VISÃO + PROBLEMA + SOLUÇÃO (3 colunas)
                    ============================================ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                        {/* VISÃO */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">

                            {/* Ícone */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Eye className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">
                                    Visão
                                </h3>
                                <blockquote className="border-l-4 border-blue-400 pl-4 italic text-base text-gray-300 leading-relaxed">
                                    "Liderar é servir. Formar pessoas. Deixar legado."
                                </blockquote>
                            </div>
                        </div>

                        {/* O PROBLEMA */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">

                            {/* Ícone */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <AlertCircle className="w-6 h-6 text-red-400" />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">
                                    O Problema
                                </h3>
                                <p className="text-base text-gray-300 leading-relaxed">
                                    Excesso de informação, conhecimento disperso e difícil aplicação prática.
                                </p>
                            </div>
                        </div>

                        {/* A SOLUÇÃO */}
                        <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">

                            {/* Ícone */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">
                                    A Solução
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Um lugar só. O caminho claro:
                                </p>

                                {/* Fluxo de processo - mantém horizontal em todos os tamanhos */}
                                <div className="flex flex-row flex-wrap items-center gap-2">
                                    {['Aprendo', 'Faço', 'Documento', 'Compartilho'].map((step, i) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <span className={`${i === 3 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-gray-400 border-white/10'} border px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap`}>
                                                {step}
                                            </span>
                                            {i < 3 && (
                                                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    LINHA 3: PARA QUEM (Full Width)
                    ============================================ */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:p-8">

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Para Quem</h3>
                                <p className="text-sm text-gray-400">Conteúdo para pessoas que valorizam seu tempo</p>
                            </div>
                        </div>

                        {/* Lista em grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                "Família e amigos interessados",
                                "Quem quer aprender IA sem jargão",
                                "Líderes em formação ou transição",
                                "Quem valoriza clareza sobre volume"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
                                    <span className="text-amber-400 text-sm mt-0.5">•</span>
                                    <span className="text-gray-300 text-sm leading-snug">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Linha separadora com efeito de luz */}
                <div className="relative h-px my-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-700" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                </div>
            </div>
        </section>
    );
}
