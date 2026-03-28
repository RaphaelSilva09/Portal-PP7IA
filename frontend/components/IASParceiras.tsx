"use client";

import { ArrowUpRight, Bot } from "lucide-react";
import Link from "next/link";

const IAS = ["Claude", "ChatGPT", "Gemini", "Adapta", "Perplexity", "Grok", "Manus"];

export default function IASParceiras() {
    return (
        <section id="ias-parceiras" className="py-8 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="max-w-4xl mx-auto mb-8 mt-8">
                {/* ============================================
                AS 7 IAS PARCEIRAS — card unificado
                ============================================ */}
                <Link
                    href="/view/biblioteca/009"
                    className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 block"
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(99,102,241,0.08) 100%)",
                        }}
                    />
                    <div className="relative z-10 p-6">
                        {/* Arrow (top-right, fora do fluxo centralizado) */}
                        <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-cyan-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                        {/* Header row */}
                        <div className="flex flex-col items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    As 7 IAs parceiras
                                </h2>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <p className="text-sm text-gray-400 italic mb-4 text-center">
                            A IA amplifica; o julgamento editorial é humano.
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent mb-4" />

                        {/* IA chips */}
                        <div className="flex flex-wrap gap-2 justify-center">
                            {IAS.map((ia) => (
                                <span
                                    key={ia}
                                    className="bg-white/5 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300 text-center"
                                >
                                    {ia}
                                </span>
                            ))}
                        </div>
                    </div>
                    {/* Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-cyan-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Link>
            </div>
            
            {/* Citação */}
            <div className="max-w-4xl mx-auto flex justify-center mb-8">
                <span className="bg-white/5 px-4 py-2 rounded-full text-sm font-semibold text-gray-300 text-center">
                    &ldquo;Liderar é servir. Formar pessoas. Deixar legado.&rdquo;
                </span>
            </div>
        </section>
    );
}
