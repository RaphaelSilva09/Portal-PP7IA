"use client";

import { BookOpen, FileText, Globe, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { MiniLivro } from "@/domain/entities/MiniLivro";
import { useEbook } from "@/presentation/hooks/useEbook";
import { useMiniLivros } from "@/presentation/hooks/useMiniLivros";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";
import BookCard from "./BookCard";

/**
 * BentoGridMiniLivros Component
 * Exibe a hierarquia Ebooks → Mini-livros com abas por ebook
 * Dados carregados dinamicamente do Supabase
 */
export default function BentoGridMiniLivros() {
    const { all: allMiniLivros, isLoading, error } = useMiniLivros();
    const { all: allEbooks, isLoading: ebooksLoading } = useEbook();
    useScrollToHash(!isLoading && !ebooksLoading);

    const [selectedEbookIndex, setSelectedEbookIndex] = useState(0);

    // Estado de carregamento
    if (isLoading || ebooksLoading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    <p className="text-text-secondary">Carregando mini-livros...</p>
                </div>
            </section>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-16">
                        <p className="text-text-secondary text-lg">{error}</p>
                    </div>
                </div>
            </section>
        );
    }

    const selectedEbook = allEbooks[selectedEbookIndex] ?? null;
    const ebookMiniLivros = selectedEbook
        ? allMiniLivros.filter(ml => ml.relativeEbook === selectedEbook.order)
        : [];
    const featuredMiniLivro = ebookMiniLivros[0] ?? null;
    const gridMiniLivros = ebookMiniLivros.slice(1);

    const ebookHasContent = Boolean(
        selectedEbook &&
        (selectedEbook.subtitle ||
            selectedEbook.description ||
            selectedEbook.coverImagePath ||
            selectedEbook.htmlAvailable ||
            selectedEbook.coverPdfAvailable),
    );
    const hasMiniLivros = ebookMiniLivros.length > 0;

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução Mini-livros — TEMPORARIAMENTE COMENTADO
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                <h3
                    id="titulo"
                    className="text-2xl sm:text-3xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto line-clamp-2 animate-fade-in-up line-clamp-2"
                    style={{ animationDelay: "0.3s" }}
                >
                    Livro
                </h3>
                <p
                    id="descricao"
                    className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Em vez de um livro tradicional, publicarei uma série de textos menores — denominados Mini-livros — aqui mesmo.
                    Eles funcionarão como os capítulos de um livro. A cada 7 "capítulos", eu os compilarei em e-books (versões menores do livro).
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
                    <a
                        href="/mini-livros/nota_do_autor_mini-livros.html"
                        className="text-gray-400 text-base sm:text-1xl leading-relaxed tracking-tight underline md:no-underline md:hover:underline hover:text-gray-300 transition-colors duration-200 animate-fade-in-up"
                        style={{ animationDelay: "0.5s" }}
                    >
                        Leia o Editorial aqui
                    </a>
                </div>
            </div>

            <div className="max-w-4xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>
            */}

            {/* Título e descrição da seção de e-books */}
            <div className="text-center mx-auto mb-8">
                <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto line-clamp-2">
                    Mini-livros - Ebook - Livros
                </h3>
                <p className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 leading-relaxed">
                    Em vez de um livro tradicional, publicarei uma série de textos menores — denominados Mini-livros — aqui mesmo.
                    Eles funcionarão como os capítulos de um livro. A cada 7 "capítulos", eu os compilarei em e-books (versões menores do livro).
                </p>
                {/*
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
                    <a
                        href="/mini-livros/nota_do_autor_mini-livros.html"
                        className="text-gray-400 text-base leading-relaxed tracking-tight underline md:no-underline md:hover:underline hover:text-gray-300 transition-colors duration-200"
                    >
                        Leia o Editorial aqui
                    </a>
                </div>
                */}
            </div>

            {/* Card do Livro principal — abaixo do "Leia aqui o Editorial", acima da linha cinza */}
            <div className="max-w-4xl mx-auto">
                <BookCard />
            </div>

            {/* Linha cinza divisória */}
            <div className="max-w-4xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>

            {/* Descrição das abas */}
            <p className="text-center text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-8 leading-relaxed">
                Cada aba abaixo corresponde a um e-book e seus respectivos sete mini-livros. Clique em qualquer aba para navegar entre os e-books e explorar os conteúdos disponíveis.
            </p>

            {/* Conteúdo principal */}
            <div className="max-w-4xl mx-auto">

                {/* ============================================
                ABAS DE E-BOOKS — sempre 3 slots fixos
                ============================================ */}
                <div className="grid grid-cols-3 gap-3 mb-6 w-full items-stretch">
                    {[0, 1, 2].map(slotIndex => {
                        const fixedTitles = [
                            "Parte I — Liderança Híbrida",
                            "Parte II — A Coragem de Executar",
                            "Parte III — O Que Fica"
                        ];
                        const label = fixedTitles[slotIndex];
                        const isSelected = selectedEbookIndex === slotIndex;
                        return (
                            <button
                                key={slotIndex}
                                onClick={() => setSelectedEbookIndex(slotIndex)}
                                className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 border text-center w-full h-full ${isSelected
                                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                                    : "bg-white/5 border-white/10 text-text-secondary hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                                    }`}
                            >
                                <span className="break-words">{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Bento Grid - 3 Columns Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                    {/* ============================================
                    E-BOOK EM DESTAQUE
                    1 Card - col-span-3 - min-h-80
                    ============================================ */}
                    {/* Placeholder quando ebook não tem conteúdo nem mini-livros */}
                    {!ebookHasContent && !hasMiniLivros && (
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-center py-20 rounded-3xl border border-white/10 bg-white/[0.02]">
                            <p className="text-text-secondary text-xl font-medium">Ainda estamos trabalhando por aqui. Volte em breve!</p>
                        </div>
                    )}

                    {selectedEbook && ebookHasContent && (
                        <div className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-3xl min-h-80 transition-all duration-500 hover:scale-[1.01]">
                            {/* Gradient Background - Azul/Roxo para E-book */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 129, 242, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99, 102, 241, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                                }}
                            />
                            <div className="absolute inset-0 rounded-3xl border border-white/10" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                                <div className="absolute inset-0 shimmer" />
                            </div>

                            {/* Content - Layout com Imagem + Texto */}
                            <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
                                {/* Imagem da Capa - Esquerda */}
                                {selectedEbook.coverImagePath && (
                                    <div className="w-full md:w-1/3 flex-shrink-0">
                                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                                            <img
                                                src={selectedEbook.coverImagePath}
                                                alt={`Capa do E-book ${selectedEbook.title}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Informações do E-book - Direita */}
                                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                    {/* Badge */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-400 text-sm font-medium">
                                            {selectedEbook.badgeText || `E-book #${selectedEbook.formattedNumber}`}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-tight line-clamp-2">
                                        {selectedEbook.title}
                                    </h3>

                                    {/* Subtítulo */}
                                    {selectedEbook.subtitle && (
                                        <p className="text-xl sm:text-2xl text-blue-300/80 mb-6 font-medium">
                                            {selectedEbook.subtitle}
                                        </p>
                                    )}

                                    {/* Descrição */}
                                    {selectedEbook.description && (
                                        <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed max-w-4xl">
                                            {selectedEbook.description}
                                        </p>
                                    )}

                                    {/* Botões de Ação */}
                                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                                        {selectedEbook.coverPdfAvailable && (
                                            <a
                                                href={selectedEbook.coverPdfPath!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                            >
                                                <FileText className="w-5 h-5" />
                                                <span>Ver Capa</span>
                                            </a>
                                        )}
                                        {selectedEbook.htmlAvailable && (
                                            <a
                                                href={selectedEbook.introHtmlPath!}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                            >
                                                <BookOpen className="w-5 h-5" />
                                                <span>Ler Introdução</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================
                    MINI-LIVRO DESTAQUE — 1º do ebook selecionado
                    1 Card - col-span-3 - min-h-80
                    ============================================ */}
                    {featuredMiniLivro && (
                        <div id={`item-${featuredMiniLivro.id}`} style={{ scrollMarginTop: "80px" }} className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-3xl min-h-[200px] transition-all duration-500 hover:scale-[1.01]">
                            {/* Gradient Background */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(16, 185, 129, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                                }}
                            />

                            {/* Subtle Border */}
                            <div className="absolute inset-0 rounded-3xl border border-white/10" />

                            {/* Shimmer on Hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 shimmer" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
                                {/* Mini-Livro Number */}
                                <p className="text-green-400 text-base sm:text-lg font-mono mb-2">
                                    Mini-Livro #{featuredMiniLivro.formattedNumber}
                                </p>

                                {/* Title */}
                                <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2">
                                    {featuredMiniLivro.title}
                                </h3>

                                {/* Date */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">
                                    <p>Publicado em&nbsp;{featuredMiniLivro.formattedDate}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 w-full">
                                    {featuredMiniLivro.htmlAvailable ? (
                                        <a
                                            href={featuredMiniLivro.htmlPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-full text-white font-medium text-sm transition-all duration-300 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Ler online</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-sm cursor-not-allowed opacity-50 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {featuredMiniLivro.pdfAvailable ? (
                                        <a
                                            href={featuredMiniLivro.pdfPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-full text-white font-medium text-sm transition-all duration-300 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Baixar PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 font-medium text-sm cursor-not-allowed opacity-50 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================
                    GRID DE MINI-LIVROS — demais do ebook selecionado
                    ============================================ */}
                    {gridMiniLivros.map((miniLivro: MiniLivro) => (
                        <div
                            key={miniLivro.id}
                            id={`item-${miniLivro.id}`}
                            style={{ scrollMarginTop: "80px" }}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[200px] bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/[0.07] hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Mini-Livro Number */}
                                <p className="text-green-400 text-base sm:text-lg font-mono mb-2">
                                    Mini-Livro #{miniLivro.formattedNumber}
                                </p>

                                {/* Title */}
                                <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-white mt-1 mb-2 tracking-tight line-clamp-2">
                                    {miniLivro.title}
                                </h4>

                                {/* Date */}
                                <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{miniLivro.formattedDate}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap md:flex-nowrap gap-3 mt-auto justify-center">
                                    {miniLivro.htmlAvailable ? (
                                        <a
                                            href={miniLivro.htmlPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-full text-white text-sm font-medium transition-all duration-300 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Ler online</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 text-sm font-medium cursor-not-allowed opacity-50 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {miniLivro.pdfAvailable ? (
                                        <a
                                            href={miniLivro.pdfPath!}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 rounded-full text-white text-sm font-medium transition-all duration-300 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Baixar PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-500/10 border border-gray-500/20 rounded-full text-gray-500 text-sm font-medium cursor-not-allowed opacity-50 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>

                                {/* Accent Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
