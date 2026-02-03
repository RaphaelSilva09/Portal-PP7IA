"use client";

import Image from "next/image";
import {
    Bot,
    Briefcase,
    ArrowUpRight,
    Lightbulb,
} from "lucide-react";
import { Claude, OpenAI, Gemini, Grok, Perplexity, Manus } from "@lobehub/icons";
import type { ReactNode } from "react";

// Dados detalhados das 7 IAs Parceiras
interface IAData {
    name: string;
    subtitle: string;
    href: string;
    icon: ReactNode;
    features: ReactNode[];
    hoverBorderColor: string;
    hoverShadowColor: string;
    accentGradient: string;
    iconBgColor: string;
}

const iasData: IAData[] = [
    {
        name: "Adapta.org",
        subtitle: "Plataforma brasileira multimodal",
        href: "https://adapta.org",
        icon: <Image src="/IAs-logo/adapta.png" alt="Adapta.org" width={32} height={32} className="w-8 h-8 object-contain" />,
        features: [
            <span><strong>Reúne os melhores modelos de IA</strong></span>,
            "Seleciona automaticamente o modelo ideal",
            "Cursos, tutoriais e suporte em português",
            "Combina múltiplas IAs para respostas otimizadas",
        ],
        hoverBorderColor: "hover:border-green-500/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
        accentGradient: "from-green-500 to-emerald-500",
        iconBgColor: "bg-gray-700/40",
    },
    {
        name: "Grok 4",
        subtitle: "xAI (Elon Musk)",
        href: "https://grok.x.ai",
        icon: <Grok size={32} />,
        features: [
            <span><strong>Excelente em matemática e ciência</strong></span>,
            "Raciocínio lógico avançado",
            <span><strong>Integração com dados do X em tempo real</strong></span>,
            "Treinada em 200.000 GPUs",
        ],
        hoverBorderColor: "hover:border-gray-400/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(156,163,175,0.15)]",
        accentGradient: "from-gray-500 to-slate-400",
        iconBgColor: "bg-gray-500/20",
    },
    {
        name: "Gemini 3 Pro",
        subtitle: "Google",
        href: "https://gemini.google.com",
        icon: <Gemini.Color size={32} />,
        features: [
            <span><strong>Contexto ampliado de 1 milhão de tokens</strong></span>,
            "Líder em compreensão multimodal",
            "Excelente para textos longos",
            "Integração com Google Workspace",
        ],
        hoverBorderColor: "hover:border-blue-500/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
        accentGradient: "from-blue-500 to-cyan-500",
        iconBgColor: "bg-blue-500/20",
    },
    {
        name: "GPT-5.2",
        subtitle: "OpenAI",
        href: "https://chatgpt.com",
        icon: <OpenAI size={32} />,
        features: [
            <span><strong>Modelo mais avançado para trabalho profissional</strong></span>,
            "Superior em planilhas e apresentações",
            "Ideal para projetos complexos",
            <span><strong>Estado da arte em benchmarks</strong></span>,
        ],
        hoverBorderColor: "hover:border-emerald-500/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
        accentGradient: "from-emerald-500 to-teal-500",
        iconBgColor: "bg-emerald-500/20",
    },
    {
        name: "Claude 4.5 Sonnet/Opus",
        subtitle: "Anthropic",
        href: "https://claude.ai",
        icon: <Claude.Color size={32} />,
        features: [
            <span><strong>Melhor IA para codificação e agentes autônomos</strong></span>,
            "Foco em segurança e precisão",
            "Excelente em análise de dados e documentos",
            "Contexto de 200K tokens",
        ],
        hoverBorderColor: "hover:border-orange-500/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
        accentGradient: "from-orange-500 to-amber-500",
        iconBgColor: "bg-orange-500/20",
    },
    {
        name: "Manus",
        subtitle: "Meta",
        href: "https://manus.im",
        icon: <Manus size={32} />,
        features: [
            <span><strong>Primeiro agente de IA autônomo do mundo</strong></span>,
            "Executa tarefas sem supervisão humana",
            "Transforma pensamentos em ações",
            "Ideal para pesquisa e automação",
        ],
        hoverBorderColor: "hover:border-purple-500/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
        accentGradient: "from-purple-500 to-violet-500",
        iconBgColor: "bg-purple-500/20",
    },
    {
        name: "Perplexity",
        subtitle: "Pesquisa em tempo real",
        href: "https://perplexity.ai",
        icon: <Perplexity.Color size={32} />,
        features: [
            <span><strong>Especializada em pesquisas na internet</strong></span>,
            "Respostas com citações verificáveis",
            <span><strong>780 milhões de consultas/mês</strong></span>,
            "Perfeita para pesquisas acadêmicas",
        ],
        hoverBorderColor: "hover:border-cyan-500/30",
        hoverShadowColor: "hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
        accentGradient: "from-cyan-500 to-sky-500",
        iconBgColor: "bg-cyan-500/20",
    },
];

// Componente de Card para cada IA - seguindo estilo BentoGrid
function AICard({ ia }: { ia: IAData }) {
    return (
        <a
            href={ia.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/[0.07] ${ia.hoverBorderColor} ${ia.hoverShadowColor} block`}
        >
            <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-4">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${ia.iconBgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {ia.icon}
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                    <ArrowUpRight className="w-6 h-6 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
                        {ia.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 tracking-tight">
                        {ia.subtitle}
                    </p>

                    {/* Features list - sem ícones */}
                    <ul className="space-y-1.5">
                        {ia.features.map((feature, index) => (
                            <li key={index} className="text-sm text-gray-400 tracking-tight">
                                • {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Accent Line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-linear-to-r ${ia.accentGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </a>
    );
}

export default function QuemSomosContent() {
    return (
        <section id="quemsomos" className="py-12 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
                {/* ============================================
                HERO - O QUE É
                ============================================ */}
                <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-40 mb-2">

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">

                        {/* Títulos e Descrição */}
                        <div className="flex flex-col items-center gap-1 pb-16 sm:pb-20 md:pb-24">
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                                Quem Somos{" "}
                                <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                    Nós
                                </span>
                            </h3>
                            <p className="text-gray-400 text-base sm:text-2xl max-w-2xl mx-auto tracking-tight px-4">
                                Plataforma de curadoria que combina{" "}
                                <span className="text-brand-blue font-semibold">40+ anos de liderança executiva</span> com{" "}
                                <span className="text-brand-purple font-semibold">7 inteligências artificiais</span>
                            </p>
                            <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto tracking-tight px-4 mt-4">
                                Conteúdo organizado em 7 blocos principais, publicando só o que foi testado e funciona
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================
                EQUIPE
                ============================================ */}
                <div className="mb-8">
                    <div className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300">
                        {/* Main container: flex-row with space-between */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Left side: Icon + Title + Description */}
                            <div className="flex flex-col items-center md:items-start gap-4 md:gap-6">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-purple-400" />
                                </div>

                                {/* Title + Description */}
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Equipe</h2>
                                    <p className="text-gray-400 text-base sm:text-lg tracking-tight">
                                        Criado por <span className="text-white font-medium">Paulo Periquito</span>, com
                                        assistência técnica de{" "}
                                        <span className="text-white font-medium">Raphael Silva</span> e{" "}
                                        <span className="text-white font-medium">Lucas Periquito Costa</span> (estudantes
                                        de Ciências/Engenharia da Computação).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linha separadora com efeito de luz */}
                <div className="relative h-px my-8 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-700" />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                </div>

                {/* ============================================
                AS 7 IAS PARCEIRAS
                ============================================ */}
                <div className="mb-8">
                    {/* Header + Banner Split Layout */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 lg:items-center">
                        {/* Left: Title Section */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6">
                                <Bot className="w-8 h-8 text-cyan-400" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">As 7 IAs parceiras</h2>
                            <p className="text-gray-400 text-base sm:text-lg tracking-tight mb-4 max-w-md">
                                A IA amplifica; o julgamento editorial é humano.
                            </p>
                            <a
                                href="/Resumo-7IAS-e -plataformas-que -usamos .pdf"
                                className="inline-flex items-center gap-2 text-cyan-400 text-sm sm:text-base tracking-tight font-medium hover:text-cyan-300 transition-colors duration-200 group"
                            >
                                <span>Saiba mais sobre os modelos usados</span>
                                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                            </a>
                        </div>

                        {/* Divider (Desktop Only) */}
                        <div className="hidden lg:block w-px h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                        {/* Right: Minha Visão (Minimalist) */}
                        <div className="flex-1 relative">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-4 h-4 text-yellow-500/90" />
                                <h3 className="text-xs font-bold text-yellow-500/90 tracking-widest uppercase">
                                    Minha visão sobre IA
                                </h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Dominar a IA hoje é tão vital quanto foi adotar a internet. Ela redefine como empresas lucram e pessoas aprendem. Quem usa ganha tempo e relevância; quem rejeita perde espaço.
                            </p>
                            <p className="mt-2 text-sm font-medium text-gray-300">
                                O futuro já está acontecendo. <span className="text-white">E você, vai ficar de fora?</span>
                            </p>
                        </div>
                    </div>

                    {/* Cards Grid: 4 + 3 layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* First row: 4 cards */}
                        {iasData.slice(0, 4).map((ia) => (
                            <AICard key={ia.name} ia={ia} />
                        ))}
                    </div>

                    {/* Second row: 3 cards centered */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 max-w-5xl mx-auto">
                        {iasData.slice(4).map((ia) => (
                            <AICard key={ia.name} ia={ia} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
