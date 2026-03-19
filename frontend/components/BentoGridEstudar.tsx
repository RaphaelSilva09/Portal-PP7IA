"use client";

import { Estudar } from "@/domain/entities/Estudar";
import { useEstudar } from "@/presentation/hooks/useEstudar";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";
import { FileText, Globe, Loader2, Sparkles } from "lucide-react";

/**
 * BentoGridEstudar Component
 * Exibe conteúdo de estudo mais recente em destaque e edições anteriores em grid 3x3
 * Dados carregados dinamicamente do Supabase
 */

export default function BentoGridEstudar() {
    const { latest, older, isLoading, error, lastUpdated } = useEstudar();
    useScrollToHash(!isLoading);

    if (isLoading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    <p className="text-text-secondary">Carregando conteúdo de estudo...</p>
                </div>
            </section>
        );
    }

    if (error || !latest) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <p className="text-text-secondary text-lg">
                            {error || "Nenhum conteúdo de estudo disponível no momento."}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução */}
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                <h3
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Estudar
                </h3>
                <p
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Materiais de estudo curados para aprofundar conhecimento em IA e liderança.
                </p>
            </div>

            {/* Linha divisória */}
            <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* MATERIAL MAIS RECENTE - DESTAQUE */}
                    <div id={`item-${latest.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-100 cursor-pointer transition-all duration-500 hover:scale-[1.01]">
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6, 182, 212, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(14, 116, 144, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />
                        <div className="absolute inset-0 rounded-3xl border border-white/10" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                                    </span>
                                    <span className="text-cyan-400 text-sm font-medium">Estudar</span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Gratuito</span>
                                </div>
                                {lastUpdated && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-full">
                                        <span className="text-gray-400 text-sm font-medium">
                                            Atualizado{" "}
                                            {lastUpdated.toLocaleDateString("pt-BR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-cyan-400 text-base sm:text-lg font-mono mb-2">
                                Material #{latest.formattedNumber}
                            </p>
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl">
                                {latest.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-text-secondary text-base sm:text-lg mb-8">
                                <p>Publicado em {latest.formattedDate}</p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {latest.htmlAvailable ? (
                                    <a
                                        href={latest.htmlPath!}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ver HTML</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-base sm:text-lg cursor-not-allowed w-full sm:w-auto min-w-[160px] opacity-50"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                                {latest.pdfAvailable ? (
                                    <a
                                        href={latest.pdfPath!}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 hover:border-teal-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Baixar PDF</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-base sm:text-lg cursor-not-allowed w-full sm:w-auto min-w-[160px] opacity-50"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MATERIAIS ANTERIORES */}
                    {older.map((item: Estudar) => (
                        <div
                            key={item.id}
                            id={`item-${item.id}`}
                            style={{ scrollMarginTop: "80px" }}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-80 bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                <span className="text-xs font-mono text-cyan-400/80 tracking-tight mb-2">
                                    Material #{item.formattedNumber}
                                </span>
                                <h4 className="text-3xl sm:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    {item.title}
                                </h4>
                                <div className="flex flex-col gap-1 text-text-secondary text-sm mb-4">
                                    <p>{item.formattedDate}</p>
                                </div>
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    {item.htmlAvailable ? (
                                        <a
                                            href={item.htmlPath!}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>HTML</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-500 text-sm font-medium cursor-not-allowed opacity-50"
                                        >
                                            <Globe className="w-4 h-4" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {item.pdfAvailable ? (
                                        <a
                                            href={item.pdfPath!}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-500 text-sm font-medium cursor-not-allowed opacity-50"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
