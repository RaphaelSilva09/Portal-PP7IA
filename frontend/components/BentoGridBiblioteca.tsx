"use client";

import { FileText, Globe, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "next-themes";

import { portalContentClass } from "@/lib/layout";
import { BIBLIOTECA_TEMAS, BibliotecaItem } from "@/domain/entities/BibliotecaItem";
import { useBiblioteca } from "@/presentation/hooks/useBiblioteca";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";

/**
 * BentoGridBiblioteca Component
 * Exibe a última edição da biblioteca em destaque e edições anteriores em grid 3x3
 * Suporta filtragem por tema via tabs horizontais
 * Dados carregados dinamicamente do Supabase
 */
export default function BentoGridBiblioteca() {
    const { latest, activeLatest, filteredOlder, activeTema, setActiveTema, isLoading, error } = useBiblioteca();
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";
    useScrollToHash(!isLoading);

    useEffect(() => {
        if (window.location.hash) {
            setActiveTema(BIBLIOTECA_TEMAS[0].slug);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Estado de carregamento
    if (isLoading) {
        return (
            <section className="py-12">
                <div className={portalContentClass}>
                    <div className="max-w-4xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-text-secondary">Carregando biblioteca...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Estado de erro ou sem dados globais
    if (error || !latest) {
        return (
            <section className="py-12">
                <div className={portalContentClass}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16">
                            <p className="text-text-secondary text-lg">
                                {error || "Nenhum conteúdo disponível na biblioteca no momento."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className={portalContentClass}>
                {/* Introdução Biblioteca */}
                <div id="introducao" className="mx-auto mb-6 max-w-4xl text-center sm:mb-7 md:mb-8">
                    {/* Título da Introdução */}
                    <h3 id="titulo" className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                        Biblioteca
                    </h3>

                    {/* Descrição Biblioteca */}
                    <p
                        id="descricao"
                        className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                        style={{ animationDelay: "0.4s" }}
                    >
                        Materiais, livros, artigos e outras recomendações pessoais do PP7+IAS.
                    </p>

                    {/* Linha divisória cinza */}
                    <div className="my-8 w-full sm:my-10 md:my-12">
                        <div className="border-t border-border"></div>
                    </div>

                    <p id="descricao" className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                        Cada aba abaixo corresponde a um tipo de material.
                        Clique em qualquer aba para navegar entre as categorias e explorar os conteúdos disponíveis.
                    </p>
                </div>

                <div className="w-full">
                {/* ============================================
                TABS DE TEMAS
                ============================================ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8 w-full items-stretch">
                    {BIBLIOTECA_TEMAS.map(({ slug, label }) => (
                        <button
                            key={slug}
                            onClick={() => setActiveTema(slug)}
                            className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 border text-center w-full h-full ${
                                activeTema === slug
                                ? "bg-purple-700 text-white border-purple-800"
                                : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20 hover:bg-accent/50 hover:text-foreground"
                            }`}
                        >
                            <span className="break-words">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Bento Grid - 3 Columns Layout */}
                <div id="last-biblioteca" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* ============================================
                    BIBLIOTECA EM DESTAQUE (mais recente do tema ativo)
                    1 Card - col-span-3
                    ============================================ */}
                    {activeLatest ? (
                        <div id={`item-${activeLatest.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-3xl min-h-[200px] cursor-pointer transition-all duration-500 hover:scale-[1.01]">
                        {/* Gradient Background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isLight
                                    ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168, 85, 247, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #f5f3ff 100%)"
                                    : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168, 85, 247, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />

                        {/* Subtle Border */}
                        <div className="absolute inset-0 rounded-3xl border border-border" />

                        {/* Shimmer on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
                            {/* Biblioteca Number */}
                            <p className="text-purple-700 text-base sm:text-lg font-mono mb-2">
                                Biblioteca #{activeLatest.formattedNumber}
                            </p>

                            {/* Title */}
                            <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2">
                                {activeLatest.title}
                            </h3>

                            {/* Date */}
                            <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicada em&nbsp;{activeLatest.formattedDate}</p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3">
                                {activeLatest.htmlAvailable ? (
                                    <a
                                        href={activeLatest.htmlPath!}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 border border-purple-800 rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 whitespace-nowrap"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ler online</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm sm:text-base cursor-not-allowed opacity-90 whitespace-nowrap"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                                {activeLatest.pdfAvailable ? (
                                    <a
                                        href={activeLatest.pdfPath!}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-800 hover:bg-purple-900 border border-purple-900 rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 whitespace-nowrap"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Baixar PDF</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm sm:text-base cursor-not-allowed opacity-90 whitespace-nowrap"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    ) : (
                        <div className="col-span-1 md:col-span-3 text-center py-16">
                            <p className="text-text-secondary text-lg">Nenhum item neste tema ainda.</p>
                        </div>
                    )}

                    {/* ============================================
                    EDIÇÕES ANTERIORES - GRID 3x3 (filtrado por tema)
                    ============================================ */}
                    {activeLatest && filteredOlder.length > 0 && (
                        filteredOlder.map((item: BibliotecaItem) => (
                            <div
                                key={item.id}
                                id={`item-${item.id}`}
                                style={{ scrollMarginTop: "80px" }}
                                className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[200px] bg-card/80 backdrop-blur-sm border border-border cursor-pointer transition-all duration-300 hover:bg-accent/40 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                            >
                                <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                    {/* Biblioteca Number */}
                                    <p className="text-purple-700 text-base sm:text-lg font-mono mb-2">
                                        Biblioteca #{item.formattedNumber}
                                    </p>

                                    {/* Title */}
                                    <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-foreground mt-1 mb-2 tracking-tight line-clamp-2">
                                        {item.title}
                                    </h4>

                                    {/* Date */}
                                    <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicada em&nbsp;{item.formattedDate}</p>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap md:flex-nowrap gap-3 mt-auto justify-center">
                                        {item.htmlAvailable ? (
                                            <a
                                                href={item.htmlPath!}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 border border-purple-800 rounded-full text-white text-sm font-medium transition-all duration-200 whitespace-nowrap"
                                            >
                                                <Globe className="w-5 h-5" />
                                                <span>Ler online</span>
                                            </a>
                                        ) : (
                                            <button
                                                disabled
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap"
                                            >
                                                <Globe className="w-5 h-5" />
                                                <span>Indisponível</span>
                                            </button>
                                        )}
                                        {item.pdfAvailable ? (
                                            <a
                                                href={item.pdfPath!}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-800 hover:bg-purple-900 border border-purple-900 rounded-full text-white text-sm font-medium transition-all duration-200 whitespace-nowrap"
                                            >
                                                <FileText className="w-5 h-5" />
                                                <span>PDF</span>
                                            </a>
                                        ) : (
                                            <button
                                                disabled
                                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap"
                                            >
                                                <FileText className="w-5 h-5" />
                                                <span>Indisponível</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Accent Line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </div>
            </div>
        </section>
    );
}
