"use client";

import { Claude, Gemini, Grok, Manus, OpenAI, Perplexity } from "@lobehub/icons";
import { ArrowUpRight, Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
        icon: (
            <Image
                src="/IAs-logo/adapta.png"
                alt="Adapta.org"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
            />
        ),
        features: [
            <span key="1">
                <strong>Reúne os melhores modelos de IA</strong>
            </span>,
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
            <span key="1">
                <strong>Excelente em matemática e ciência</strong>
            </span>,
            "Raciocínio lógico avançado",
            <span key="3">
                <strong>Integração com dados do X em tempo real</strong>
            </span>,
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
            <span key="1">
                <strong>Contexto ampliado de 1 milhão de tokens</strong>
            </span>,
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
            <span key="1">
                <strong>Modelo mais avançado para trabalho profissional</strong>
            </span>,
            "Superior em planilhas e apresentações",
            "Ideal para projetos complexos",
            <span key="4">
                <strong>Estado da arte em benchmarks</strong>
            </span>,
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
            <span key="1">
                <strong>Melhor IA para codificação e agentes autônomos</strong>
            </span>,
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
            <span key="1">
                <strong>Primeiro agente de IA autônomo do mundo</strong>
            </span>,
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
            <span key="1">
                <strong>Especializada em pesquisas na internet</strong>
            </span>,
            "Respostas com citações verificáveis",
            <span key="3">
                <strong>780 milhões de consultas/mês</strong>
            </span>,
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
                <div
                    className={`w-16 h-16 rounded-2xl ${ia.iconBgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                    {ia.icon}
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
                    <ArrowUpRight className="w-6 h-6 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">{ia.name}</h4>
                    <p className="text-sm text-gray-500 mb-4 tracking-tight">{ia.subtitle}</p>

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
            <div
                className={`absolute bottom-0 left-0 right-0 h-1.5 bg-linear-to-r ${ia.accentGradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
            />
        </a>
    );
}

export default function IASParceiras() {
    return (
        <section id="ias-parceiras" className="py-8 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
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
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
                                As 7 IAs parceiras
                            </h2>
                            <p className="text-gray-400 text-base sm:text-lg tracking-tight mb-4 max-w-md">
                                A IA amplifica; o julgamento editorial é humano.
                            </p>
                        </div>

                        {/* Divider (Desktop Only) */}
                        <div className="hidden lg:block w-px h-32 bg-linear-to-b from-transparent via-white/10 to-transparent" />

                        {/* Right: CTA "Conheça as 7 IAs" */}
                        <Link
                            href="/biblioteca"
                            className="flex-1 group relative overflow-hidden rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 block"
                        >
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(99,102,241,0.08) 100%)",
                                }}
                            />
                            <div className="relative z-10 flex items-center gap-4 p-6">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-cyan-400/80 tracking-widest uppercase mb-1">
                                        Novo
                                    </p>
                                    <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
                                        Conheça as 7 IAs
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Descubra como cada IA pode transformar seu trabalho e aprendizado.
                                    </p>
                                </div>
                                <ArrowUpRight className="w-6 h-6 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0" />
                            </div>
                            {/* Accent Line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </Link>
                    </div>

                    {/* Cards Grid: 4 + 3 layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* First row: 4 cards */}
                        {iasData.slice(0, 4).map(ia => (
                            <AICard key={ia.name} ia={ia} />
                        ))}
                    </div>

                    {/* Second row: 3 cards centered */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 max-w-5xl mx-auto">
                        {iasData.slice(4).map(ia => (
                            <AICard key={ia.name} ia={ia} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12"></div>
        </section>
    );
}
