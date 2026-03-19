"use client";

/**
 * BookCard Component
 *
 * Exibe o card do Livro principal, alimentado pela tabela `book` (singleton).
 * Busca o registro ativo diretamente via Supabase.
 */

import { supabase } from "@/infrastructure/config/supabase";
import { BookOpen, FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface BookRow {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_image_path: string | null;
    cover_pdf_path: string | null;
    intro_pdf_path: string | null;
    intro_html_path: string | null;
    badge_text: string | null;
    is_active: boolean;
}

/** Extrai o slug do nome do arquivo HTML para usar na rota /view/ebook/<slug> */
function htmlPathToRoute(rawUrl: string): string {
    const match = rawUrl.match(/\/([^/]+)\.html$/);
    if (!match) return rawUrl;
    return `/view/ebook/${match[1]}`;
}

export default function BookCard() {
    const [book, setBook] = useState<BookRow | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        supabase
            .from("book")
            .select("*")
            .eq("is_active", true)
            .limit(1)
            .then(({ data, error }) => {
                if (error) console.error("BookCard fetch error:", error);
                setBook(data?.[0] ?? null);
                setLoaded(true);
            });
    }, []);

    if (!loaded || !book) return null;

    const introHref = book.intro_html_path ? htmlPathToRoute(book.intro_html_path) : null;

    return (
        <div className="group relative overflow-hidden rounded-3xl min-h-80 transition-all duration-500 hover:scale-[1.01] mb-6">
            {/* Gradient Background — âmbar/dourado para o livro principal */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245, 158, 11, 0.25), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(180, 83, 9, 0.15), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                }}
            />
            <div className="absolute inset-0 rounded-3xl border border-amber-500/20" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute inset-0 shimmer" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
                {/* Capa — esquerda */}
                {book.cover_image_path && (
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-amber-500/20 shadow-2xl">
                            <img
                                src={book.cover_image_path}
                                alt={`Capa do livro ${book.title}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                {/* Informações — direita */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400 text-sm font-medium">
                            {book.badge_text || "Livro"}
                        </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
                        {book.title}
                    </h3>

                    {/* Subtítulo */}
                    {book.subtitle && (
                        <p className="text-xl sm:text-2xl text-amber-300/80 mb-6 font-medium">
                            {book.subtitle}
                        </p>
                    )}

                    {/* Descrição */}
                    {book.description && (
                        <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed max-w-2xl">
                            {book.description}
                        </p>
                    )}

                    {/* Botões */}
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                        {book.cover_pdf_path && (
                            <a
                                href={book.cover_pdf_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                            >
                                <FileText className="w-5 h-5" />
                                <span>Ver Capa</span>
                            </a>
                        )}
                        {introHref && (
                            <a
                                href={introHref}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 hover:border-orange-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                            >
                                <BookOpen className="w-5 h-5" />
                                <span>Ler Introdução</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
