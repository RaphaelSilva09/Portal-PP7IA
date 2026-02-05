"use client";

import { Award, Target, Lightbulb, BookOpen, Shield, Zap, Heart } from "lucide-react";

export default function AuthorProfile() {
    const mantras = [
        { text: "Sempre deixe uma alternativa (brecha) para tudo.", icon: Lightbulb },
        { text: "Visão sem ação não tem valor.", icon: Zap },
        { text: "Planeje no curto (3-6 meses): execute, corrija, execute.", icon: Target },
        { text: "Erros pequenos, correções rápidas.", icon: Award },
        { text: "Resiliência: erros são degraus. Desistir, nunca!", icon: Shield },
        { text: "Liderar é servir, evoluir e criar novos líderes que formem outros.", icon: BookOpen },
        { text: "Humildade, ética, respeito, honestidade e ouvir são valores inegociáveis.", icon: Heart },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="text-center">
                {/* Name and Title */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                    Paulo Periquito
                </h2>
                <p className="text-xl sm:text-2xl text-brand-blue font-medium">
                    Mentor, Investidor Anjo e Advisor
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trajectory Card */}
                <div className="glass-card p-8 h-full border-l-4 border-l-brand-blue/50 hover:border-l-brand-blue transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                            <Award className="w-5 h-5 text-brand-blue" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Trajetória</h3>
                    </div>
                    <div className="text-text-secondary leading-relaxed space-y-1">
                        <p>
                            Engenheiro, com formação em TI, e{" "}
                            <span className="text-white font-bold">4+ décadas</span> de carreira{" "}
                            <span className="text-white font-bold">C-Level</span> em RH, PE, CFO, operações, varejo e inovação.
                        </p>
                        <p>
                            <span className="text-brand-blue font-bold">Presidente</span> da{" "}
                            <span className="text-white italic">Alcoa</span> México e{" "}
                            <span className="text-brand-blue font-bold">COO</span> da empresa na América Latina.
                        </p>
                        <p>
                            <span className="text-brand-blue font-bold">Presidente</span> da{" "}
                            <span className="text-white italic">Whirlpool</span> na América Latina, e depois{" "}
                            <span className="text-brand-blue font-bold">Presidente Internacional</span> — LatAm, Ásia, Europa.
                        </p>
                    </div>
                </div>

                {/* Focus Card */}
                <div className="glass-card p-8 h-full border-l-4 border-l-brand-green/50 hover:border-l-brand-green transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-brand-green" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Foco Atual</h3>
                    </div>
                    <p className="text-2xl font-semibold text-white mb-4">
                        Família, Saúde e Legado
                    </p>
                    <p className="text-text-secondary leading-relaxed">
                        Formando <span className="text-brand-green font-medium">líderes</span> e{" "}
                        <span className="text-brand-green font-medium">profissionais</span> unindo gestão humana ao
                        potencial da <span className="text-white font-medium">IA</span>.
                    </p>
                </div>
            </div>

            {/* Mantras Section */}
            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-brand-purple" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Mantras</h3>
                </div>

                {/* Grid com linha divisória central */}
                <div className="relative">
                    {/* Linha divisória vertical - visível apenas em desktop */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />

                    <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-x-8">
                        {mantras.map((mantra, index) => {
                            const Icon = mantra.icon;
                            return (
                                <li
                                    key={index}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-purple/20 transition-colors duration-200">
                                        <Icon className="w-4 h-4 text-brand-purple" />
                                    </div>
                                    <p className="text-base text-text-secondary group-hover:text-white/90 transition-colors duration-200 leading-relaxed">
                                        {mantra.text}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
