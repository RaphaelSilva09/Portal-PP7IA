"use client";

import { Briefcase, Users } from "lucide-react";

export default function QuemSomosEquipe() {
    return (
        <section id="quemsomos" className="pt-12 pb-8 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
                {/* ============================================
                HERO - QUEM SOMOS
                ============================================ */}
                <div className="mb-8">
                    <div className="relative overflow-hidden rounded-3xl group">
                        {/* Background gradiente sutil */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/5 to-blue-500/8" />
                        
                        {/* Efeito de luz suave azul-roxo */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 blur-3xl rounded-full" />

                        {/* Border sutil */}
                        <div className="absolute inset-0 rounded-3xl border border-blue-500/15" />

                        {/* Content */}
                        <div className="relative z-10 p-8 lg:p-10">
                            <div className="flex flex-col items-center text-center gap-4">
                                {/* Títulos e Descrição */}
                                <div className="flex flex-col items-center gap-2">
                                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                                        Quem Somos{" "}
                                        <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                            Nós
                                        </span>
                                    </h3>
                                    <p className="text-gray-300 text-base sm:text-2xl max-w-3xl mx-auto tracking-tight px-4 leading-relaxed">
                                        Plataforma de curadoria que combina{" "}
                                        <span className="text-brand-blue font-semibold">40+ anos de liderança executiva</span> com{" "}
                                        <span className="text-brand-purple font-semibold">7 inteligências artificiais</span>
                                    </p>
                                    <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto tracking-tight px-4">
                                        Conteúdo organizado em 7 blocos principais, publicando só o que foi testado e funciona
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ============================================
                EQUIPE - GRID DE 3 COLUNAS
                ============================================ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card: Criador */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-300">
                        {/* Ícone */}
                        <div className="mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="w-7 h-7 text-purple-400" />
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div>
                            <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-2 block">
                                Criador
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Paulo Periquito
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Mentor, Investidor Anjo e Advisor. Mais de 40 anos de experiência em liderança executiva.
                            </p>
                        </div>
                    </div>

                    {/* Card: Assistente Técnico 1 */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300">
                        {/* Ícone */}
                        <div className="mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-7 h-7 text-blue-400" />
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div>
                            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2 block">
                                Assistência Técnica
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Raphael Silva
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Estudante de Ciências/Engenharia da Computação. Desenvolvimento e implementação técnica.
                            </p>
                        </div>
                    </div>

                    {/* Card: Assistente Técnico 2 */}
                    <div className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300">
                        {/* Ícone */}
                        <div className="mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Users className="w-7 h-7 text-blue-400" />
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div>
                            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2 block">
                                Assistência Técnica
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Lucas Periquito Costa
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Estudante de Ciências/Engenharia da Computação. Suporte técnico e desenvolvimento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
