"use client";

import { FileText, Globe, Loader2, Sparkles } from "lucide-react";
import { useEffect } from "react";

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
    const { latest, activeLatest, filteredOlder, activeTema, setActiveTema, isLoading, error, lastUpdated } = useBiblioteca();
    useScrollToHash(!isLoading);

    useEffect(() => {
        if (window.location.hash) {
            setActiveTema(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Estado de carregamento
    if (isLoading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-text-secondary">Carregando biblioteca...</p>
                </div>
            </section>
        );
    }

    // Estado de erro ou sem dados globais
    if (error || !latest) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-16">
                        <p className="text-text-secondary text-lg">
                            {error || "Nenhum conteúdo disponível na biblioteca no momento."}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução Biblioteca */}
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                {/* Título da Introdução */}
                <h3
                    id="titulo"
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Biblioteca
                </h3>

                {/* Descrição Biblioteca */}
                <p
                    id="descricao"
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Materiais, livros, artigos e outras recomendações pessoais do PP7+IAS.
                </p>

                {/* Linha divisória cinza */}
                <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12">
                    <div className="border-t border-white/10"></div>
                </div>

                <p
                    id="descricao"
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Cada aba abaixo corresponde a um tipo de material.
                    Clique em qualquer aba para navegar entre as categorias e explorar os conteúdos disponíveis.
                </p>
            </div>


            <div className="max-w-7xl mx-auto">
                {/* ============================================
                TABS DE TEMAS
                ============================================ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8 w-full items-stretch">
                    <button
                        onClick={() => setActiveTema(null)}
                        className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 border text-center w-full h-full ${
                            activeTema === null
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                        }`}
                    >
                        <span className="break-words">Todos</span>
                    </button>
                    {BIBLIOTECA_TEMAS.map(({ slug, label }) => (
                        <button
                            key={slug}
                            onClick={() => setActiveTema(slug)}
                            className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 border text-center w-full h-full ${
                                activeTema === slug
                                    ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                    : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                            }`}
                        >
                            <span className="break-words">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Bento Grid - 3 Columns Layout */}
                <div id="last-biblioteca" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    BIBLIOTECA EM DESTAQUE (mais recente do tema ativo)
                    1 Card - col-span-3
                    ============================================ */}
                    {activeLatest ? (
                    <div id={`item-${activeLatest.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-100 cursor-pointer transition-all duration-500 hover:scale-[1.01]">
                        {/* Gradient Background */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168, 85, 247, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />

                        {/* Subtle Border */}
                        <div className="absolute inset-0 rounded-3xl border border-white/10" />

                        {/* Shimmer on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12">
                            {/* Badges */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                                    </span>
                                    <span className="text-purple-500 text-sm font-medium">
                                        Última Atualização
                                        {lastUpdated
                                            ? `: ${lastUpdated.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}`
                                            : ""}
                                    </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 text-sm font-medium">Gratuito</span>
                                </div>
                            </div>

                            {/* Biblioteca Number */}
                            <p className="text-purple-400 text-base sm:text-lg font-mono mb-2">
                                Biblioteca #{activeLatest.formattedNumber}
                            </p>

                            {/* Title */}
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl">
                                {activeLatest.title}
                            </h3>

                            {/* Date */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-text-secondary text-base sm:text-lg mb-8">
                                <p>Publicada em {activeLatest.formattedDate}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                {activeLatest.htmlAvailable ? (
                                    <a
                                        href={activeLatest.htmlPath!}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-40"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Ler online</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-base sm:text-lg cursor-not-allowed w-full sm:w-auto min-w-40 opacity-50"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Indisponível</span>
                                    </button>
                                )}
                                {activeLatest.pdfAvailable ? (
                                    <a
                                        href={activeLatest.pdfPath!}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 hover:border-pink-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-40"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Baixar PDF</span>
                                    </a>
                                ) : (
                                    <button
                                        disabled
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-base sm:text-lg cursor-not-allowed w-full sm:w-auto min-w-40 opacity-50"
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
                                className="col-span-1 group relative overflow-hidden rounded-3xl min-h-80 bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
                            >
                                <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                    {/* Biblioteca Number */}
                                    <span className="text-xs font-mono text-purple-400/80 tracking-tight mb-2">
                                        Biblioteca #{item.formattedNumber}
                                    </span>

                                    {/* Title */}
                                    <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                        {item.title}
                                    </h4>

                                    {/* Date */}
                                    <div className="flex flex-col gap-1 text-text-secondary text-sm mb-4">
                                        <p>{item.formattedDate}</p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col w-full gap-2 mt-auto">
                                        {item.htmlAvailable ? (
                                            <a
                                                href={item.htmlPath!}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
                                            >
                                                <Globe className="w-4 h-4" />
                                                <span>Ler online</span>
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
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
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

                                    {/* Accent Line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
