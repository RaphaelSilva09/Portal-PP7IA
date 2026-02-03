"use client";

import { BrainCircuit, Plus, Sparkles, User } from "lucide-react";

/**
 * WhyPP7IASSection Component
 * 
 * Seção que explica o significado do nome "PP7+IAS".
 * Layout: Título + 4 cards horizontais
 */

export default function WhyPP7IASSection() {
    return (
        <section
            id="why-pp7ias"
            className="py-12 sm:py-16 lg:pb-20 lg:pt-10 px-4 sm:px-6 lg:px-8 bg-bg-primary"
        >
            <div className="max-w-7xl mx-auto">
                {/* Linha Horizontal Superior */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8 sm:mb-12" />
                
                {/* Título da Seção */}
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 sm:mb-8">
                    Por Que "PP7+IAS"
                </h2>

                {/* Grid de 4 Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* PP Card */}
                    <div className="glass-card p-6 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                        <h3 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-3">
                            PP
                        </h3>
                        <p className="text-base font-semibold text-text-primary mb-1">
                            Paulo Periquito
                        </p>
                        <p className="text-xs text-text-secondary">
                            Criador
                        </p>
                    </div>

                    {/* 7 Card */}
                    <div className="glass-card p-6 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                        <h3 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-3">
                            7
                        </h3>
                        <p className="text-base font-semibold text-text-primary mb-1">
                            Número
                        </p>
                        <p className="text-xs text-text-secondary">
                            IAs, blocos, vida
                        </p>
                    </div>

                    {/* + Card */}
                    <div className="glass-card p-6 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                        <h3 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-3">
                            +
                        </h3>
                        <p className="text-base font-semibold text-text-primary mb-1">
                            União
                        </p>
                        <p className="text-xs text-text-secondary">
                            Humano + IA
                        </p>
                    </div>

                    {/* IAS Card */}
                    <div className="glass-card p-6 bg-white/[0.02] border-white/10 hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center">
                        <h3 className="text-4xl sm:text-5xl font-bold text-brand-blue mb-3">
                            IAS
                        </h3>
                        <p className="text-base font-semibold text-text-primary mb-1">
                            Inteligências
                        </p>
                        <p className="text-xs text-text-secondary">
                            Artificiais
                        </p>
                    </div>
                </div>
                
                {/* Linha Horizontal Inferior */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12" />
            </div>
        </section>
    );
}
