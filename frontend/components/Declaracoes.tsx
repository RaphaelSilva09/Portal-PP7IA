"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Eye, Heart, Users } from "lucide-react";

export default function Declaracoes() {
    return (
        <section id="declaracoes" className="py-8 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-4xl mx-auto">
                {/* ============================================
                DECLARAÇÕES / MANIFESTO - VERSÃO BALANCEADA
                Layout otimizado com cores suaves e espaçamento equilibrado
                ============================================ */}
                <div className="mb-18">
                    {/* ============================================
                    LINHA 1: PROPÓSITO (Full Width)
                    ============================================ */}
                    <div className="mb-8">
                        <div className="relative overflow-hidden rounded-3xl group bg-card/70 border border-border">
                            {/* Background gradiente sutil */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/8 to-purple-500/10" />

                            {/* Border sutil */}
                            <div className="absolute inset-0 rounded-3xl border border-border" />

                            {/* Conteúdo */}
                            <div className="relative z-10 p-8 lg:p-10">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                    {/* Ícone */}
                                    <div className="flex-shrink-0">
                                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Heart className="w-7 h-7 lg:w-8 lg:h-8 text-blue-600" />
                                        </div>
                                    </div>

                                    {/* Conteúdo de texto */}
                                    <div className="flex-1">
                                        <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2 block">
                                            Propósito
                                        </span>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">
                                            Curar conhecimento prático para netos, família, amigos, novas gerações e
                                            quem mais tiver interesse em temas de IAs, liderança e outros conhecimentos
                                        </h2>
                                        <p className="text-sm sm:text-base text-text-secondary">
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
                        <div className="group relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-sm border border-border p-6 hover:bg-accent/60 hover:border-blue-500/30 transition-all duration-300">
                            {/* Ícone */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Eye className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-3">Visão</h3>
                                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-base text-text-secondary leading-relaxed">
                                    "Liderar é servir. Formar pessoas. Deixar legado."
                                </blockquote>
                            </div>
                        </div>

                        {/* O PROBLEMA */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-sm border border-border p-6 hover:bg-accent/60 hover:border-red-500/30 transition-all duration-300">
                            {/* Ícone */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-3">O Problema</h3>
                                <p className="text-base text-text-secondary leading-relaxed">
                                    Excesso de informação, conhecimento disperso e difícil aplicação prática.
                                </p>
                            </div>
                        </div>

                        {/* A SOLUÇÃO */}
                        <div className="group relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-sm border border-border p-6 hover:bg-accent/60 hover:border-emerald-500/30 transition-all duration-300">
                            {/* Ícone */}
                            <div className="mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div>
                                <h3 className="text-lg font-bold text-foreground mb-3">A Solução</h3>
                                <p className="text-sm text-text-secondary mb-4">Um lugar só. O caminho claro:</p>

                                {/* Fluxo de processo - mantém horizontal em todos os tamanhos */}
                                <div className="flex flex-row flex-wrap items-center gap-2">
                                    {["Aprendo", "Faço", "Documento", "Compartilho"].map((step, i) => (
                                        <div key={step} className="flex items-center gap-2">
                                            <span
                                    className={`${i === 3 ? "bg-emerald-600/15 text-emerald-800 border-emerald-500/30" : "bg-card/70 text-text-secondary border-border"} border px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap`}
                                            >
                                                {step}
                                            </span>
                                            {i < 3 && <ArrowRight className="w-4 h-4 text-text-secondary flex-shrink-0" />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    LINHA 3: PARA QUEM (Full Width)
                    ============================================ */}
                    <div className="relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-sm border border-border p-6 lg:p-8">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <Users className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Para Quem</h3>
                                <p className="text-sm text-text-secondary">Conteúdo para pessoas que valorizam seu tempo</p>
                            </div>
                        </div>

                        {/* Lista em grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                "Família e amigos interessados",
                                "Quem quer aprender IA sem jargão",
                                "Líderes em formação ou transição",
                                "Quem valoriza clareza sobre volume",
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-2 p-3 rounded-xl bg-card/70 hover:bg-accent/40 transition-colors"
                                >
                                    <span className="text-amber-600 text-sm mt-0.5">•</span>
                                    <span className="text-text-secondary text-sm leading-snug">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Linha separadora com efeito de luz */}
                <div className="relative h-px my-8 overflow-hidden">
                    <div className="absolute inset-0 bg-border" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-border/70 to-transparent animate-shimmer" />
                </div>
            </div>
        </section>
    );
}
