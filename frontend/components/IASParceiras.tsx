"use client";

import { ArrowUpRight, Bot } from "lucide-react";
import Link from "next/link";


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
                            href="/view/biblioteca/009"
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
                </div>
            </div>
            <div className="w-full h-px bg-linear-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12"></div>
        </section>
    );
}
