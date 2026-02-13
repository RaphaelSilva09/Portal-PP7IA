"use client";

import { BookOpen, FileText, Globe, Sparkles } from "lucide-react";

/**
 * BentoGridMiniLivros Component
 * Exibe o e-book em destaque e mini-livros em grid 3x3
 */

// Dados dos mini-livros (mock - substituir por dados reais)
const miniLivros = [
    {
        id: 1,
        title: "Mini-livro #002-v2: Afinal, que talento é esse?",
        htmlUrl: "/mini-livros/002.html",
        pdfUrl: "/mini-livros/002.pdf",
        date: "13/10/2025",
        readTime: "14 min",
        htmlAvailable: false,
        pdfAvailable: true,
    },
    {
        id: 0,
        title: "Mini-livro #001-v2: A Resposta é o Problema",
        htmlUrl: "/mini-livros/001.html",
        pdfUrl: "/mini-livros/001.pdf",
        date: "13/09/2025",
        readTime: "14 min",
        htmlAvailable: true,
        pdfAvailable: false,
    },
];

export default function BentoGridMiniLivros() {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            {/* Introdução Mini-livros */}
            <div id="introducao" className="text-center mx-auto mb-6 sm:mb-7 md:mb-8">
                {/* Título da Introdução */}
                <h3
                    id="titulo"
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-3xl mx-auto animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Mini-livros
                </h3>

                {/* Descrição Mini-livros */}
                <p
                    id="descricao"
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-2 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}
                >
                    Em vez de um livro tradicional, publicarei uma série de textos curtos — MiniLivros — aqui mesmo,
                    para vocês. Sendo eles o equivalente a capítulos de um livro.
                </p>

                {/* Editorial sobre os Mini-livros */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
                    <a
                        href="/mini-livros/nota_do_autor_mini-livros.pdf"
                        className="text-gray-400 text-base sm:text-1xl leading-relaxed tracking-tight underline md:no-underline md:hover:underline hover:text-gray-300 transition-colors duration-200 animate-fade-in-up"
                        style={{ animationDelay: "0.5s" }}
                    >
                        Leia aqui o Editorial
                    </a>
                </div>
            </div>

            {/* Linha divisória cinza */}
            <div className="max-w-7xl mx-auto my-8 sm:my-10 md:my-12">
                <div className="border-t border-white/10"></div>
            </div>

            {/* Mini-livros */}
            <div className="max-w-7xl mx-auto">
                {/* Bento Grid - 3 Columns Layout */}
                <div id="last-mini-livro" className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* ============================================
                    E-BOOK EM DESTAQUE
                    1 Card - col-span-3 - min-h-80
                    ============================================ */}
                    <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-80 transition-all duration-500 hover:scale-[1.01]">
                        {/* Gradient Background - Azul/Roxo para E-book */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 129, 242, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99, 102, 241, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
                            }}
                        />

                        {/* Subtle Border */}
                        <div className="absolute inset-0 rounded-3xl border border-white/10" />

                        {/* Shimmer on Hover - Efeito muito sutil */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                            <div className="absolute inset-0 shimmer" />
                        </div>

                        {/* Content - Layout com Imagem + Texto */}
                        <div className="relative z-10 h-full flex flex-col md:flex-row items-center gap-8 p-8 sm:p-12">
                            {/* Imagem da Capa - Esquerda */}
                            <div className="w-full md:w-1/3 flex-shrink-0">
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                                    <img
                                        src="/ebooks/capa_lideranca_hibrida.png"
                                        alt="Capa do E-book Liderança Híbrida"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Informações do E-book - Direita */}
                            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                                    <Sparkles className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400 text-sm font-medium">E-book #001</span>
                                </div>

                                {/* Título */}
                                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight leading-tight">
                                    Liderança Híbrida
                                </h3>

                                {/* Subtítulo */}
                                <p className="text-xl sm:text-2xl text-blue-300/80 mb-6 font-medium">
                                    O código-fonte da Inteligência em Alta Frequência
                                </p>

                                {/* Descrição */}
                                <p className="text-base sm:text-lg text-text-secondary mb-8 leading-relaxed max-w-2xl">
                                    O que a velha guarda precisa atualizar e a nova geração precisa descobrir. 7
                                    MiniLivros que formam um eBook sobre liderança, decisões e IA. Escritos por quem
                                    liderou por mais de 4 décadas e agora testa IA todos os dias.
                                </p>

                                {/* Botões de Ação */}
                                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                                    <a
                                        href="/ebooks/capa_lideranca_hibrida.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Ver Capa</span>
                                    </a>
                                    <a
                                        href="/ebooks/introducao_lideranca_hibrida.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-full text-white font-medium text-base sm:text-lg transition-all duration-300 w-full sm:w-auto min-w-[160px]"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        <span>Ler Introdução</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================
                    MINI-LIVROS - GRID 3x3
                    ============================================ */}
                    {miniLivros.map(miniLivro => (
                        <div
                            key={miniLivro.id}
                            className="col-span-1 group relative overflow-hidden rounded-3xl min-h-80 bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/[0.07] hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                        >
                            <div className="relative z-10 h-full flex flex-col items-center text-center p-6 sm:p-8">
                                {/* Mini-Livro Number */}
                                <span className="text-xs font-mono text-green-400/80 tracking-tight mb-2">
                                    Mini-Livro #{(miniLivro.id + 1).toString().padStart(3, "0")}
                                </span>

                                {/* Title */}
                                <h4 className="text-3xl sm:text-4xl md:text-4xl font-bold text-white mt-1 mb-2 tracking-tight">
                                    {miniLivro.title}
                                </h4>

                                {/* Date and Read Time */}
                                <div className="flex flex-col gap-1 text-text-secondary text-sm mb-4">
                                    <p>{miniLivro.date}</p>
                                    <p className="text-green-400/70">{miniLivro.readTime} de leitura</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    {miniLivro.htmlAvailable ? (
                                        <a
                                            href={miniLivro.htmlUrl}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
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
                                    {miniLivro.pdfAvailable ? (
                                        <a
                                            href={miniLivro.pdfUrl}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-white text-sm font-medium transition-all duration-200"
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
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
