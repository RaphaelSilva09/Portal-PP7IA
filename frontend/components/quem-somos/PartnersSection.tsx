import React from "react";
import Image from "next/image";
import { Bot } from "lucide-react";
import { Claude, OpenAI, Gemini, Grok, Perplexity, Manus } from "@lobehub/icons";
import type { ReactNode } from "react";

// As 7 IAs Parceiras
const iasData: { name: string; href: string; icon: ReactNode }[] = [
    { name: "Claude", href: "https://claude.ai", icon: <Claude.Color size={48} /> },
    { name: "ChatGPT", href: "https://chatgpt.com", icon: <OpenAI size={48} /> },
    { name: "Gemini", href: "https://gemini.google.com", icon: <Gemini.Color size={48} /> },
    { name: "Grok", href: "https://grok.x.ai", icon: <Grok size={48} /> },
    { name: "Perplexity", href: "https://perplexity.ai", icon: <Perplexity.Color size={48} /> },
    { name: "Manus", href: "https://manus.im", icon: <Manus size={48} /> },
    { name: "Adapta.org", href: "https://adapta.org", icon: <Image src="/IAs-logo/adapta.png" alt="Adapta.org" width={48} height={48} className="w-12 h-12 object-contain" /> },
];

export default function PartnersSection() {
    return (
        <div className="mb-8">
            <div className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300">
                {/* Main container: flex-row with space-between */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Left side: Icon + Title + Description */}
                    <div className="flex flex-col items-center md:items-start gap-4 md:gap-6">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                            <Bot className="w-8 h-8 text-cyan-400" />
                        </div>

                        {/* Title + Description */}
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">As 7 IAs parceiras</h2>
                            <p className="text-gray-400 text-base sm:text-lg tracking-tight mb-2">
                                A IA amplifica; o julgamento editorial é humano.
                            </p>
                            <a
                                href="/Resumo-7IAS-e -plataformas-que -usamos .pdf"
                                className="text-cyan-400 text-sm sm:text-base tracking-tight underline md:no-underline md:hover:underline hover:text-cyan-300 transition-colors duration-200"
                            >
                                Saiba mais sobre os modelos usados
                            </a>
                        </div>
                    </div>

                    {/* Right side: 2 rows of IAs */}
                    <div className="flex flex-col items-center gap-8 p-4 pr-5">
                        {/* Row 1: 4 IAs */}
                        <div className="flex flex-row items-center gap-6">
                            {iasData.slice(0, 4).map((ia) => (
                                <a
                                    key={ia.name}
                                    href={ia.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/ia p-2 transition-all duration-300"
                                >
                                    <div
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover/ia:scale-125 transition-transform duration-300 drop-shadow-[3px_4px_2px_rgba(255,255,255,0.25)] border-2 border-white/30"
                                    >
                                        {ia.icon}
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* Row 2: 3 IAs */}
                        <div className="flex flex-row items-center gap-6">
                            {iasData.slice(4, 7).map((ia) => (
                                <a
                                    key={ia.name}
                                    href={ia.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/ia p-2 transition-all duration-300"
                                >
                                    <div
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center group-hover/ia:scale-125 transition-transform duration-300 drop-shadow-[3px_4px_2px_rgba(255,255,255,0.25)] border-2 border-white/30"
                                    >
                                        {ia.icon}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
