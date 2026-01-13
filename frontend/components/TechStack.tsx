"use client";

import { Code, Cpu, Globe, Shield, Sparkles, Wand2, Zap } from "lucide-react";

// 7 itens de stack seguindo a regra de negócio
const techItems = [
    {
        id: 1,
        name: "Gemini & GPT",
        role: "Seleção Primária",
        description: "Análise inicial e categorização de conteúdo.",
        icon: Sparkles,
        color: "text-brand-blue",
        bgColor: "bg-brand-blue/10",
        borderColor: "border-brand-blue/20",
    },
    {
        id: 2,
        name: "Claude",
        role: "Refinamento",
        description: "Processamento profundo e contextualização.",
        icon: Wand2,
        color: "text-brand-purple",
        bgColor: "bg-brand-purple/10",
        borderColor: "border-brand-purple/20",
    },
    {
        id: 3,
        name: "Perplexity",
        role: "Pesquisa",
        description: "Busca e validação de informações.",
        icon: Globe,
        color: "text-brand-orange",
        bgColor: "bg-brand-orange/10",
        borderColor: "border-brand-orange/20",
    },
    {
        id: 4,
        name: "Automação",
        role: "Workflows",
        description: "Pipelines de processamento contínuo.",
        icon: Cpu,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        borderColor: "border-emerald-400/20",
    },
    {
        id: 5,
        name: "Verificação",
        role: "Quality Assurance",
        description: "Checagem humana de precisão.",
        icon: Shield,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        borderColor: "border-yellow-400/20",
    },
    {
        id: 6,
        name: "Curadoria",
        role: "Seleção Final",
        description: "Escolha editorial e priorização.",
        icon: Zap,
        color: "text-pink-400",
        bgColor: "bg-pink-400/10",
        borderColor: "border-pink-400/20",
    },
    {
        id: 7,
        name: "Entrega",
        role: "Distribuição",
        description: "Multi-canal automatizado.",
        icon: Code,
        color: "text-cyan-400",
        bgColor: "bg-cyan-400/10",
        borderColor: "border-cyan-400/20",
    },
];

export default function TechStack() {
    return (
        <section id="stack" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-bg-secondary/50">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-orange bg-brand-orange/10 rounded-full mb-4">
                        TECNOLOGIA
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                        Stack de{" "}
                        <span className="bg-gradient-to-r from-brand-orange to-brand-yellow bg-clip-text text-transparent">
                            Inteligência
                        </span>
                    </h2>
                    <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
                        7 camadas de processamento para garantir qualidade e relevância.
                    </p>
                </div>

                {/* Tech Grid - 7 Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* Featured Items (1 & 2) */}
                    {techItems.slice(0, 2).map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className={`
                  group relative p-6 sm:p-8 rounded-3xl glass-card
                  border ${item.borderColor}
                  hover-lift cursor-pointer
                  lg:col-span-2
                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${item.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-xs font-semibold ${item.color}`}>{item.role}</span>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{item.name}</h3>
                                        <p className="text-text-secondary text-sm sm:text-base mt-2">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Regular Items (3-7) */}
                    {techItems.slice(2).map(item => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className={`
                  group relative p-5 sm:p-6 rounded-2xl glass-card
                  border ${item.borderColor}
                  hover-lift cursor-pointer
                `}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                                    </div>
                                    <div>
                                        <span className={`text-xs font-semibold ${item.color}`}>{item.role}</span>
                                        <h3 className="text-base sm:text-lg font-bold text-white">{item.name}</h3>
                                    </div>
                                </div>
                                <p className="text-text-secondary text-sm">{item.description}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Process Flow */}
                <div className="mt-12 sm:mt-16 p-6 sm:p-8 glass-card rounded-3xl">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-6 text-center">Fluxo de Processamento</h3>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                        {techItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.id} className="flex items-center gap-2 sm:gap-4">
                                    <div
                                        className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full ${item.bgColor} border ${item.borderColor}`}
                                    >
                                        <Icon className={`w-4 h-4 ${item.color}`} />
                                        <span className={`text-xs sm:text-sm font-medium ${item.color}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    {index < techItems.length - 1 && (
                                        <span className="text-text-secondary text-lg hidden sm:block">→</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
