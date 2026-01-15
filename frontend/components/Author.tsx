"use client";

import { ArrowRight, FileText } from "lucide-react";

// Lista de ferramentas do ecossistema de IA
const AI_TOOLS = ["Perplexity", "ChatGPT", "Gemini", "Claude", "Grok", "Manus", "Adapta.org"];

export default function Author() {
    return (
        <section
            id="autor"
            className="relative py-8 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-136 md:scroll-mt-24"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
                        <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                            Paulo Periquito
                        </span>{" "}
                        (PP)
                    </h2>
                    <p className="text-lg sm:text-xl text-brand-blue font-medium">Liderança, Gestão e Inovação</p>
                </div>

                {/* Bio Content */}
                <div className="space-y-8 sm:space-y-10 text-text-secondary">
                    {/* Introdução */}
                    <div className="glass-card p-6 sm:p-8">
                        <p className="text-base sm:text-lg leading-relaxed">
                            Executivo com mais de quatro décadas de experiência em grandes corporações. Hoje, aos{" "}
                            <span className="text-white font-semibold">79 anos</span>, atua como mentor e investidor,
                            unindo a sabedoria da gestão tradicional com o potencial da Inteligência Artificial.
                        </p>
                    </div>

                    {/* Formação e Início */}
                    <div className="space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Formação e Início</h3>
                        <div className="glass-card p-6 sm:p-8 space-y-3">
                            <p className="text-base sm:text-lg leading-relaxed">
                                <span className="text-white font-semibold">Origem:</span> Recife (1946). Base em
                                disciplina e esforço.
                            </p>
                            <p className="text-base sm:text-lg leading-relaxed">
                                <span className="text-white font-semibold">Base:</span> Engenheiro Mecânico (UFPE).
                                Pioneiro em tecnologia desde os cartões perfurados.
                            </p>
                        </div>
                    </div>

                    {/* Trajetória Executiva */}
                    <div className="space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Trajetória Executiva</h3>
                        <div className="space-y-4">
                            {/* ASA / ALCOA */}
                            <div className="glass-card p-6 sm:p-8 border-l-4 border-brand-orange">
                                <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">
                                    ASA / ALCOA (1972–1996)
                                </h4>
                                <p className="text-base sm:text-lg leading-relaxed">
                                    Evoluiu de analista a COO da América Latina. Liderou 11 unidades de negócios e
                                    presidiu a operação no México.
                                </p>
                            </div>

                            {/* Whirlpool */}
                            <div className="glass-card p-6 sm:p-8 border-l-4 border-brand-blue">
                                <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">
                                    Whirlpool (1996–2010)
                                </h4>
                                <p className="text-base sm:text-lg leading-relaxed">
                                    Presidente da Whirlpool América Latina e, posteriormente, Presidente da Whirlpool
                                    International, comandando operações na América Latina, Ásia e Europa.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fase Atual */}
                    <div className="space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Fase Atual: Portal PP+IAs</h3>
                        <div className="glass-card p-6 sm:p-8 border-l-4 border-brand-green">
                            <p className="text-base sm:text-lg leading-relaxed mb-4">
                                Focado em compartilhar conhecimento através da newsletter PP-NEWS e do portal PP+IAs. O
                                objetivo vai além da tecnologia:
                            </p>
                            <ul className="space-y-2 text-base sm:text-lg">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-green mt-1">•</span>
                                    <span>
                                        <span className="text-white font-semibold">Transmissão de Saberes:</span>{" "}
                                        Divulgação de aprendizados em Liderança, Talento e Gestão.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-green mt-1">•</span>
                                    <span>
                                        <span className="text-white font-semibold">Mentoria:</span> Apoio direto a novas
                                        gerações de empreendedores e executivos.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Filosofia e Valores */}
                    <div className="space-y-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white">Filosofia e Valores</h3>
                        <div className="glass-card p-6 sm:p-8 space-y-4">
                            <blockquote className="text-lg sm:text-xl text-white font-semibold italic border-l-4 border-brand-purple pl-4">
                                "A tecnologia é apenas ferramenta. O foco é, e sempre será, GENTE."
                            </blockquote>
                            <ul className="space-y-3 text-base sm:text-lg">
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-blue mt-1">•</span>
                                    <span>
                                        <span className="text-white font-semibold">Liderar é servir:</span> Foco em
                                        desenvolver pessoas e formar novos líderes.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-blue mt-1">•</span>
                                    <span>
                                        <span className="text-white font-semibold">Resiliência:</span> Ver erros como
                                        degraus para o acerto. Desistir, nunca!
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-brand-blue mt-1">•</span>
                                    <span>
                                        <span className="text-white font-semibold">Propósito:</span> Deixar um legado de
                                        conhecimento para filhos, netos e novos talentos.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Document Buttons */}
                <div className="mt-10 sm:mt-12 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    {/* Carta ao Leitor */}
                    <a
                        href="/CARTA-AO-LEITOR-COMPLETA.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-auto sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 hover:border-brand-purple/50 rounded-2xl transition-all duration-300 touch-target hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                    >
                        {/* Pulse ring effect */}
                        <span className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-brand-purple/40" />

                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-brand-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="relative w-5 h-5 md:w-6 md:h-6 text-brand-purple" />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm sm:text-base font-bold text-white">Carta ao Leitor</span>
                            <span className="block text-xs text-brand-purple/80">A nossa proposta</span>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple group-hover:translate-x-1 transition-all" />
                    </a>

                    {/* Por que o 7? */}
                    <a
                        href="/Pp7ia-pq 7.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative w-auto sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 hover:border-brand-purple/50 rounded-2xl transition-all duration-300 touch-target hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                    >
                        {/* Pulse ring effect */}
                        <span
                            className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-brand-purple/40"
                            style={{ animationDelay: "0.5s" }}
                        />

                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-brand-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="relative w-5 h-5 md:w-6 md:h-6 text-brand-purple" />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm sm:text-base font-bold text-white">Por que o 7?</span>
                            <span className="block text-xs text-brand-purple/80">A filosofia por trás</span>
                        </div>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple group-hover:translate-x-1 transition-all" />
                    </a>
                </div>
            </div>
        </section>
    );
}
