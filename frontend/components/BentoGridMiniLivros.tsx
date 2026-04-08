"use client";

import { BookOpen, FileText, Globe, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

import { MINI_LIVRO_PARTS, getMiniLivroPartLabel } from "@/constants/miniLivros";
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
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";
    useScrollToHash(!isLoading && !ebooksLoading);

    const [selectedEbookIndex, setSelectedEbookIndex] = useState(0);

    const ebookThemes = [
        {
            accent: "green",
            lightBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(22, 163, 74, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #ecfdf5 100%)",
            darkBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(22, 163, 74, 0.15), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
            title: "text-green-950 dark:text-green-300",
            subtitle: "text-green-800 dark:text-green-400",
            caption: "text-green-950 dark:text-green-300",
            badge: "text-green-700 dark:text-green-300",
            border: "border-green-600/30 dark:border-green-400/20",
            buttonPrimary: "bg-green-700 hover:bg-green-800 border-green-800",
            buttonSecondary: "bg-green-600 hover:bg-green-700 border-green-700",
            tabActive: "bg-green-700 text-white border-green-800",
            tabInactiveLight: "bg-green-50 border-green-300 text-green-950 hover:bg-green-100",
            tabInactive: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/15",
            line: "from-green-600 to-green-700",
        },
        {
            accent: "blue",
            lightBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(14, 165, 233, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #eff6ff 100%)",
            darkBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(14, 165, 233, 0.15), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
            title: "text-blue-800 dark:text-blue-300",
            subtitle: "text-blue-700 dark:text-blue-400",
            caption: "text-blue-900 dark:text-blue-300",
            badge: "text-blue-700 dark:text-blue-300",
            border: "border-blue-600/30 dark:border-blue-400/20",
            buttonPrimary: "bg-blue-700 hover:bg-blue-800 border-blue-800",
            buttonSecondary: "bg-sky-700 hover:bg-sky-800 border-sky-800",
            tabActive: "bg-blue-700 text-white border-blue-800",
            tabInactiveLight: "bg-blue-50 border-blue-300 text-blue-950 hover:bg-blue-100",
            tabInactive: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15",
            line: "from-blue-600 to-sky-700",
        },
        {
            accent: "purple",
            lightBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168, 85, 247, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #f5f3ff 100%)",
            darkBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(168, 85, 247, 0.15), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
            title: "text-purple-800 dark:text-purple-300",
            subtitle: "text-purple-700 dark:text-purple-400",
            caption: "text-purple-900 dark:text-purple-300",
            badge: "text-purple-700 dark:text-purple-300",
            border: "border-purple-600/30 dark:border-purple-400/20",
            buttonPrimary: "bg-purple-700 hover:bg-purple-800 border-purple-800",
            buttonSecondary: "bg-violet-700 hover:bg-violet-800 border-violet-800",
            tabActive: "bg-purple-700 text-white border-purple-800",
            tabInactiveLight: "bg-purple-50 border-purple-300 text-purple-950 hover:bg-purple-100",
            tabInactive: "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-500/15",
            line: "from-purple-600 to-violet-700",
        },
    ] as const;

    const selectedTheme = ebookThemes[selectedEbookIndex] ?? ebookThemes[0];
    const isFirstTheme = selectedEbookIndex === 0;

    // Estado de carregamento
    if (isLoading || ebooksLoading) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
        ? allMiniLivros.filter(ml => ml.ebookId === selectedEbook.id)
        : [];
    const featuredMiniLivro = ebookMiniLivros[0] ?? null;
    const gridMiniLivros = ebookMiniLivros.slice(1);

    const ebookHasContent = Boolean(selectedEbook);
    const hasMiniLivros = ebookMiniLivros.length > 0;

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução Mini-livros — TEMPORARIAMENTE COMENTADO
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                <h3
                    id="titulo"
                    className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto line-clamp-2 animate-fade-in-up line-clamp-2"
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
                    Eles funcionarão como os capítulos de um livro. A cada 7 &quot;capítulos&quot;, eu os compilarei em e-books (versões menores do livro).
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card/80 border border-border rounded-full w-fit">
                    <a
                        href="/mini-livros/nota_do_autor_mini-livros.html"
                        className="text-text-secondary text-base sm:text-1xl leading-relaxed tracking-tight underline md:no-underline md:hover:underline hover:text-foreground transition-colors duration-200 animate-fade-in-up"
                        style={{ animationDelay: "0.5s" }}
                    >
                        Leia o Editorial aqui
                    </a>
                </div>
            </div>

            <div className="max-w-4xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-border"></div>
            </div>
            */}

            {/* Título e descrição da seção de e-books */}
            <div className="text-center mx-auto mb-8">
                                <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2 mx-auto line-clamp-2">
                                    Mini-livros - Ebook - Livros
                                </h3>
                <p className="text-base sm:text-2xl text-text-secondary max-w-4xl mx-auto mb-6 leading-relaxed">
                    Em vez de um livro tradicional, publicarei uma série de textos menores — denominados Mini-livros — aqui mesmo.
                    Eles funcionarão como os capítulos de um livro. A cada 7 &quot;capítulos&quot;, eu os compilarei em e-books (versões menores do livro).
                </p>
                {/*
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card/80 border border-border rounded-full w-fit">
                    <a
                        href="/mini-livros/nota_do_autor_mini-livros.html"
                        className="text-text-secondary text-base leading-relaxed tracking-tight underline md:no-underline md:hover:underline hover:text-foreground transition-colors duration-200"
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
                <div className="border-t border-border"></div>
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
                    {MINI_LIVRO_PARTS.map((part, slotIndex) => {
                        const label = getMiniLivroPartLabel(
                            part,
                            allEbooks.find(ebook => ebook.order === part.order),
                        );
                        const isSelected = selectedEbookIndex === slotIndex;
                        const theme = ebookThemes[slotIndex] ?? ebookThemes[0];
                        return (
                            <button
                                key={part.order}
                                onClick={() => setSelectedEbookIndex(slotIndex)}
                                className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 border text-center w-full h-full ${isSelected ? theme.tabActive : (isLight ? theme.tabInactiveLight : theme.tabInactive)}`}
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
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center text-center py-20 rounded-3xl border border-border bg-card/80">
                            <p className="text-text-secondary text-xl font-medium">Ainda estamos trabalhando por aqui. Volte em breve!</p>
                        </div>
                    )}

                    {selectedEbook && ebookHasContent && (
                        <div className="col-span-1 md:col-span-2 group relative overflow-hidden rounded-3xl min-h-80 transition-all duration-500 hover:scale-[1.01]">
                            {/* Gradient Background - Azul/Roxo para E-book */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: isLight ? selectedTheme.lightBg : selectedTheme.darkBg,
                                }}
                            />
                            <div className={`absolute inset-0 rounded-3xl border ${selectedTheme.border}`} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                                <div className="absolute inset-0 shimmer" />
                            </div>

                            {/* Content - Layout com Imagem + Texto */}
                            <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
                                {/* Imagem da Capa - Esquerda */}
                                {selectedEbook.coverImagePath && (
                                    <div className="w-full md:w-1/3 flex-shrink-0">
                                        <div className={`relative aspect-[3/4] rounded-xl overflow-hidden border shadow-2xl ${selectedTheme.border}`}>
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
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${isLight ? "bg-white/70 border border-green-300" : "bg-white/10"} ${!isLight ? selectedTheme.border : ""}`}>
                                        <Sparkles className={`w-4 h-4 ${isLight ? "text-green-700" : selectedTheme.badge}`} />
                                        <span className={`text-sm font-semibold ${isLight ? "text-green-900" : selectedTheme.badge}`}>
                                            {selectedEbook.badgeText || `E-book #${selectedEbook.formattedNumber}`}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className={`text-2xl sm:text-3xl md:text-3xl font-bold mb-3 tracking-tight leading-tight line-clamp-2 ${isFirstTheme && isLight ? "text-green-950" : selectedTheme.title}`}> 
                                        {selectedEbook.title}
                                    </h3>

                                    {/* Subtítulo */}
                                    {selectedEbook.subtitle && (
                                    <p className={`text-xl sm:text-2xl mb-6 font-semibold ${isFirstTheme && isLight ? "text-green-950" : selectedTheme.caption}`}>
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
                                            className={`flex items-center justify-center gap-2 px-6 py-3 ${selectedTheme.buttonPrimary} rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 w-full sm:w-auto min-w-[160px]`}
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
                                            className={`flex items-center justify-center gap-2 px-6 py-3 ${selectedTheme.buttonSecondary} rounded-full text-white font-medium text-sm sm:text-base transition-all duration-300 w-full sm:w-auto min-w-[160px]`}
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
                                    background: isLight
                                        ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(16, 185, 129, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #ecfdf5 100%)"
                                        : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(16, 185, 129, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
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
                                {/* Mini-Livro Number */}
                                <p className="text-green-700 text-base sm:text-lg font-mono mb-2">
                                    Mini-Livro #{featuredMiniLivro.formattedNumber}
                                </p>

                                {/* Title */}
                                <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2">
                                    {featuredMiniLivro.title}
                                </h3>

                                {/* Date */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">
                                    <p>Publicado em&nbsp;{featuredMiniLivro.formattedDate}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 w-full">
                                    {featuredMiniLivro.htmlAvailable ? (
                                        <a href={featuredMiniLivro.htmlPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 border border-green-700 rounded-full text-white font-medium text-sm transition-all duration-300 whitespace-nowrap">
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Ler online</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm cursor-not-allowed opacity-90 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {featuredMiniLivro.pdfAvailable ? (
                                        <a href={featuredMiniLivro.pdfPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 rounded-full text-white font-medium text-sm transition-all duration-300 whitespace-nowrap">
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Baixar PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm cursor-not-allowed opacity-90 whitespace-nowrap"
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
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[200px] bg-card/80 backdrop-blur-sm border border-border transition-all duration-300 hover:bg-accent/40 hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Mini-Livro Number */}
                                <p className="text-green-700 text-base sm:text-lg font-mono mb-2">
                                    Mini-Livro #{miniLivro.formattedNumber}
                                </p>

                                {/* Title */}
                                <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-foreground mt-1 mb-2 tracking-tight line-clamp-2">
                                    {miniLivro.title}
                                </h4>

                                {/* Date */}
                                <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{miniLivro.formattedDate}</p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap md:flex-nowrap gap-3 mt-auto justify-center">
                                    {miniLivro.htmlAvailable ? (
                                        <a href={miniLivro.htmlPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 border border-green-700 rounded-full text-white text-sm font-medium transition-all duration-300 whitespace-nowrap">
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Ler online</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap"
                                        >
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {miniLivro.pdfAvailable ? (
                                        <a href={miniLivro.pdfPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 rounded-full text-white text-sm font-medium transition-all duration-300 whitespace-nowrap">
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Baixar PDF</span>
                                        </a>
                                    ) : (
                                        <button
                                            disabled
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap"
                                        >
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>

                                {/* Accent Line */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${selectedTheme.line} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
