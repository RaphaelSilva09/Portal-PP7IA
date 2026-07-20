"use client";

import capaP1 from "@/assets/capa-parte-1.jpeg";
import capaP2 from "@/assets/capa-parte-2.jpeg";
import capaP3 from "@/assets/capa-parte-3.jpeg";
import { portalContentClass } from "@/lib/layout";
import { BookOpen, FileText, Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

import { MiniLivro } from "@/domain/entities/MiniLivro";
import { MiniLivroSection } from "@/domain/entities/MiniLivroSection";
import { useMiniLivroSections } from "@/presentation/hooks/useMiniLivroSections";
import { useMiniLivroSectionMeta } from "@/presentation/hooks/useMiniLivroSectionMeta";
import { useMiniLivros } from "@/presentation/hooks/useMiniLivros";
import { useScrollToHash } from "@/presentation/hooks/useScrollToHash";
import BookCard from "./BookCard";

function SectionReadButton({ section, label, className }: { section: MiniLivroSection; label: string; className: string }) {
    if (section.htmlAvailable) {
        return (
            <a href={section.htmlPath!} className={className}>
                <BookOpen className="w-5 h-5 shrink-0" />
                <span>{label}</span>
            </a>
        );
    }

    return (
        <button
            disabled
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm cursor-not-allowed opacity-90 whitespace-nowrap"
        >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Indisponível</span>
        </button>
    );
}

function IntroducaoCard({ section, position, isLight, index }: { section: MiniLivroSection; position: number; isLight: boolean; index: number }) {
    return (
        <div
            className="group relative overflow-hidden rounded-3xl min-h-[220px] bg-card/80 backdrop-blur-sm border border-border transition duration-300 hover:bg-accent/40 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] animate-fade-in-up"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: isLight
                        ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.08), transparent), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(59, 130, 246, 0.06), transparent)"
                        : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16, 185, 129, 0.12), transparent), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(59, 130, 246, 0.08), transparent)",
                }}
            />
            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                <span
                    className="absolute top-3 right-3 text-2xl sm:text-3xl font-bold font-mono select-none"
                    style={{ color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)' }}
                >
                    #{position}
                </span>

                <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-foreground mt-1 mb-3 tracking-tight line-clamp-2">
                    {section.title}
                </h4>

                {section.description && (
                    <p className="text-text-secondary text-base sm:text-lg mb-8 leading-relaxed line-clamp-4">
                        {section.description}
                    </p>
                )}

                <div className="mt-auto">
                    <SectionReadButton
                        section={section}
                        label={`Ler ${section.title}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 rounded-full text-white font-medium text-sm transition-colors duration-300 whitespace-nowrap"
                    />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
        </div>
    );
}

function EncerramentoCard({ section, position, index }: { section: MiniLivroSection; position: number; index: number }) {
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";

    return (
        <div
            className="group relative overflow-hidden rounded-3xl min-h-[220px] bg-card/80 backdrop-blur-sm border border-border transition duration-300 hover:bg-accent/40 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.12)] animate-fade-in-up"
            style={{ animationDelay: `${0.1 + index * 0.08}s` }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: isLight
                        ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.08), transparent), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(168, 85, 247, 0.06), transparent)"
                        : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124, 58, 237, 0.12), transparent), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(168, 85, 247, 0.08), transparent)",
                }}
            />
            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                <span
                    className="absolute top-3 right-3 text-2xl sm:text-3xl font-bold font-mono select-none"
                    style={{ color: isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.35)' }}
                >
                    #{position}
                </span>

                <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-foreground mt-1 mb-3 tracking-tight line-clamp-2">
                    {section.title}
                </h4>

                {section.description && (
                    <p className="text-text-secondary text-base sm:text-lg mb-8 leading-relaxed line-clamp-4">
                        {section.description}
                    </p>
                )}

                <div className="mt-auto">
                    <SectionReadButton
                        section={section}
                        label={`Ler ${section.title}`}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-700 hover:bg-violet-800 border border-violet-800 rounded-full text-white font-medium text-sm transition-colors duration-300 whitespace-nowrap"
                    />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-purple-600 to-violet-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
        </div>
    );
}

function compareMiniLivrosForDisplay(left: MiniLivro, right: MiniLivro): number {
    if (left.partOrder !== right.partOrder) {
        return left.partOrder - right.partOrder;
    }

    const leftHasManualIndex = left.index > 0;
    const rightHasManualIndex = right.index > 0;

    if (leftHasManualIndex && rightHasManualIndex) {
        if (left.index !== right.index) {
            return left.index - right.index;
        }

        return left.id - right.id;
    }

    if (leftHasManualIndex !== rightHasManualIndex) {
        return leftHasManualIndex ? -1 : 1;
    }

    const createdAtDifference = right.createdAt.getTime() - left.createdAt.getTime();

    if (createdAtDifference !== 0) {
        return createdAtDifference;
    }

    return left.id - right.id;
}

/**
 * BentoGridMiniLivros Component
 * Exibe a hierarquia Ebooks → Mini-livros com abas por ebook
 * Dados carregados dinamicamente do Postgres
 */
export default function BentoGridMiniLivros() {
    const { all: allMiniLivros, isLoading, error } = useMiniLivros();
    const { introducoes, encerramentos, isLoading: sectionsLoading } = useMiniLivroSections();
    const { meta: sectionMeta } = useMiniLivroSectionMeta();
    const { resolvedTheme } = useTheme();
    const isLight = resolvedTheme === "light";
    useScrollToHash(!isLoading && !sectionsLoading);

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
            accent: "orange",
            lightBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(234, 88, 12, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #fff7ed 100%)",
            darkBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(234, 88, 12, 0.15), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
            title: "text-orange-800 dark:text-orange-300",
            subtitle: "text-orange-700 dark:text-orange-400",
            caption: "text-orange-900 dark:text-orange-300",
            badge: "text-orange-700 dark:text-orange-300",
            border: "border-orange-600/30 dark:border-orange-400/20",
            buttonPrimary: "bg-orange-600 hover:bg-orange-700 border-orange-700",
            buttonSecondary: "bg-orange-500 hover:bg-orange-600 border-orange-600",
            tabActive: "bg-orange-600 text-white border-orange-700",
            tabInactiveLight: "bg-orange-50 border-orange-300 text-orange-950 hover:bg-orange-100",
            tabInactive: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-300 hover:bg-orange-500/15",
            line: "from-orange-500 to-orange-600",
        },
        {
            accent: "red",
            lightBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(239, 68, 68, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(220, 38, 38, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #fff5f5 100%)",
            darkBg:
                "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(239, 68, 68, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(220, 38, 38, 0.15), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
            title: "text-red-700 dark:text-red-300",
            subtitle: "text-red-600 dark:text-red-400",
            caption: "text-red-700 dark:text-red-300",
            badge: "text-red-600 dark:text-red-300",
            border: "border-red-500/30 dark:border-red-400/20",
            buttonPrimary: "bg-red-500 hover:bg-red-600 border-red-600",
            buttonSecondary: "bg-red-400 hover:bg-red-500 border-red-500",
            tabActive: "bg-red-500 text-white border-red-600",
            tabInactiveLight: "bg-red-50 border-red-300 text-red-900 hover:bg-red-100",
            tabInactive: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/15",
            line: "from-red-400 to-red-500",
        },
    ] as const;

    const selectedTheme = ebookThemes[selectedEbookIndex] ?? ebookThemes[0];

    // Estado de carregamento
    if (isLoading || sectionsLoading) {
        return (
            <section className="py-12">
                <div className={portalContentClass}>
                    <div className="max-w-4xl mx-auto flex flex-col justify-center items-center min-h-100 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <p className="text-text-secondary">Carregando mini-livros...</p>
                    </div>
                </div>
            </section>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <section className="py-12">
                <div className={portalContentClass}>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-16">
                            <p className="text-text-secondary text-lg">{error}</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const orderedMiniLivros = [...allMiniLivros].sort(compareMiniLivrosForDisplay);
    const continuousMiniLivroNumberById = new Map(
        orderedMiniLivros.map((miniLivro, sequenceIndex) => [miniLivro.id, String(sequenceIndex + 1).padStart(2, "0")]),
    );
    const getContinuousMiniLivroNumber = (miniLivro: MiniLivro): string =>
        continuousMiniLivroNumberById.get(miniLivro.id) ?? miniLivro.formattedNumber;

    const ebookMiniLivros = orderedMiniLivros.filter(ml => ml.partOrder === selectedEbookIndex + 1);
    const featuredMiniLivro = ebookMiniLivros[0] ?? null;
    const gridMiniLivros = ebookMiniLivros.slice(1);

    const shouldShowEncerramento = selectedEbookIndex === 2 && encerramentos.length > 0;

    return (
        <section className="py-12">
            <div className={portalContentClass}>
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
            <div className="mx-auto mb-8 max-w-4xl text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 tracking-tight">
                    Mini-livros
                </h3>
                <p className="text-base sm:text-lg text-text-secondary max-w-4xl mx-auto mb-6 leading-relaxed">
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
            <div className="w-full">
                <BookCard />
            </div>

            {introducoes.length > 0 && (
                <div className="w-full mt-10 mb-6 space-y-6">
                    <div className="my-8 w-full">
                        <div className="border-t border-border"></div>
                    </div>
                    <div className="text-center mx-auto max-w-4xl">
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 tracking-tight">
                            {sectionMeta.introducao.title}
                        </h3>
                        <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                            {sectionMeta.introducao.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {introducoes.map((section, index) => (
                            <IntroducaoCard key={section.id} section={section} position={index + 1} isLight={isLight} index={index} />
                        ))}
                    </div>
                </div>
            )}

            {/* Linha cinza divisória */}
            <div className="my-8 w-full sm:my-10 md:my-12">
                <div className="border-t border-border"></div>
            </div>

            {/* Descrição das abas */}
            <p className="text-center text-base sm:text-lg text-text-secondary max-w-4xl mx-auto mb-6 sm:mb-7 md:mb-8 leading-relaxed">
                Cada aba abaixo corresponde a um e-book e seus respectivos sete mini-livros. Clique em qualquer aba para navegar entre os e-books e explorar os conteúdos disponíveis.
            </p>

            {/* Conteúdo principal */}
            <div className="w-full">

                {/* ============================================
                ABAS DE E-BOOKS — sempre 3 slots fixos
                ============================================ */}
                <div className="grid grid-cols-3 gap-3 mb-6 w-full items-stretch">
                    {[0, 1, 2].map(slotIndex => {
                        const fixedTitles = [
                            "Parte I — Liderança Híbrida",
                            "Parte II — A Coragem de Executar",
                            "Parte III — O Que Fica",
                        ];
                        const label = fixedTitles[slotIndex];
                        const isSelected = selectedEbookIndex === slotIndex;
                        const theme = ebookThemes[slotIndex] ?? ebookThemes[0];
                        return (
                            <button
                                key={slotIndex}
                                onClick={() => setSelectedEbookIndex(slotIndex)}
                                className={`flex items-center justify-center py-4 px-4 rounded-xl font-medium text-sm sm:text-base transition-colors duration-200 border text-center w-full h-full ${isSelected ? theme.tabActive : (isLight ? theme.tabInactiveLight : theme.tabInactive)}`}
                            >
                                <span className="break-words">{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Capa + Mini-livro destaque — flex side by side */}
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6">

                    {/* CAPA: aspect-[3/4] próprio, nunca cortada */}
                    <div className="w-full md:w-52 lg:w-60 flex-shrink-0">
                        <div className="aspect-[3/4] relative rounded-3xl overflow-hidden shadow-xl border border-border">
                            {([capaP1.src, capaP2.src, capaP3.src]).map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`Capa Parte ${i + 1}`}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${i === selectedEbookIndex ? "opacity-100" : "opacity-0"}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* MINI-LIVRO DESTAQUE — ocupa o espaço restante */}
                    {featuredMiniLivro && (
                        <div id={`item-${featuredMiniLivro.id}`} style={{ scrollMarginTop: "80px" }} className="flex-1 group relative overflow-hidden rounded-3xl min-h-[200px] transition-transform duration-500 hover:scale-[1.01]">
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: isLight
                                        ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(16, 185, 129, 0.08), transparent), linear-gradient(180deg, #f8fbff 0%, #ecfdf5 100%)"
                                        : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(16, 185, 129, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                                }}
                            />
                            <div className="absolute inset-0 rounded-3xl border border-border" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 shimmer" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6 sm:p-12">
                                <p className="text-green-700 text-base sm:text-lg font-mono mb-2">
                                    Mini-Livro #{getContinuousMiniLivroNumber(featuredMiniLivro)}
                                </p>
                                <h3 className="text-2xl sm:text-3xl md:text-3xl font-bold text-foreground mb-4 tracking-tight leading-tight max-w-3xl line-clamp-2">
                                    {featuredMiniLivro.title}
                                </h3>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">
                                    <p>Publicado em&nbsp;{featuredMiniLivro.formattedDate}</p>
                                </div>
                                <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-3 w-full">
                                    {featuredMiniLivro.htmlAvailable ? (
                                        <a href={featuredMiniLivro.htmlPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 border border-green-700 rounded-full text-white font-medium text-sm transition-colors duration-300 whitespace-nowrap">
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Ler agora</span>
                                        </a>
                                    ) : (
                                        <button disabled className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm cursor-not-allowed opacity-90 whitespace-nowrap">
                                            <Globe className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                    {featuredMiniLivro.pdfAvailable ? (
                                        <a href={featuredMiniLivro.pdfPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 rounded-full text-white font-medium text-sm transition-colors duration-300 whitespace-nowrap">
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Baixar PDF</span>
                                        </a>
                                    ) : (
                                        <button disabled className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 font-medium text-sm cursor-not-allowed opacity-90 whitespace-nowrap">
                                            <FileText className="w-5 h-5 shrink-0" />
                                            <span>Indisponível</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* GRID DE MINI-LIVROS — demais do ebook selecionado */}
                {gridMiniLivros.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                        {gridMiniLivros.map((miniLivro: MiniLivro) => (
                            <div
                                key={miniLivro.id}
                                id={`item-${miniLivro.id}`}
                                style={{ scrollMarginTop: "80px" }}
                                className="group relative overflow-hidden rounded-3xl min-h-[200px] bg-card/80 backdrop-blur-sm border border-border transition duration-300 hover:bg-accent/40 hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                            >
                                <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                    <p className="text-green-700 text-base sm:text-lg font-mono mb-2">
                                        Mini-Livro #{getContinuousMiniLivroNumber(miniLivro)}
                                    </p>
                                    <h4 className="text-2xl sm:text-3xl md:text-2xl font-bold text-foreground mt-1 mb-2 tracking-tight line-clamp-2">
                                        {miniLivro.title}
                                    </h4>
                                    <p className="text-text-secondary text-base sm:text-lg mb-8 md:mb-4 whitespace-nowrap">Publicado em&nbsp;{miniLivro.formattedDate}</p>
                                    <div className="flex flex-wrap md:flex-nowrap gap-3 mt-auto justify-center">
                                        {miniLivro.htmlAvailable ? (
                                            <a href={miniLivro.htmlPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 border border-green-700 rounded-full text-white text-sm font-medium transition-colors duration-300 whitespace-nowrap">
                                                <Globe className="w-5 h-5 shrink-0" />
                                                <span>Ler online</span>
                                            </a>
                                        ) : (
                                            <button disabled className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap">
                                                <Globe className="w-5 h-5 shrink-0" />
                                                <span>Indisponível</span>
                                            </button>
                                        )}
                                        {miniLivro.pdfAvailable ? (
                                            <a href={miniLivro.pdfPath!} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 rounded-full text-white text-sm font-medium transition-colors duration-300 whitespace-nowrap">
                                                <FileText className="w-5 h-5 shrink-0" />
                                                <span>Baixar PDF</span>
                                            </a>
                                        ) : (
                                            <button disabled className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 border border-slate-300 rounded-full text-slate-500 text-sm font-medium cursor-not-allowed opacity-90 whitespace-nowrap">
                                                <FileText className="w-5 h-5 shrink-0" />
                                                <span>Indisponível</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${selectedTheme.line} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {shouldShowEncerramento && (
                    <div className="w-full mt-10 mb-6 space-y-6">
                        <div className="my-8 w-full">
                            <div className="border-t border-border"></div>
                        </div>
                        <div className="text-center mx-auto max-w-4xl">
                            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 tracking-tight">
                                {sectionMeta.encerramento.title}
                            </h3>
                            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                                {sectionMeta.encerramento.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {encerramentos.map((section, index) => (
                                <EncerramentoCard key={section.id} section={section} position={index + 1} index={index} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            </div>
        </section>
    );
}
