"use client";

/**
 * SearchModal Component (Presentation Layer)
 *
 * Modal de busca de conteÃºdo com filtro por tipo, debounce e
 * proteÃ§Ã£o contra race conditions via useSearch hook.
 *
 * PrincÃ­pios aplicados:
 * - SRP: ApresentaÃ§Ã£o pura â€” lÃ³gica de busca delegada ao hook
 * - Clean Code: Componentes extraÃ­dos, nomes reveladores
 * - UX: Estados explÃ­citos (loading, erro, vazio, min-chars, resultados)
 */

import {
    BookOpen,
    ChevronDown,
    ChevronUp,
    FileText,
    Globe,
    Library,
    Loader2,
    Search,
    Sparkles,
    Star,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import type { SearchFilter, SearchResultItem } from "../presentation/hooks/useSearch";
import { useSearch } from "../presentation/hooks/useSearch";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// â”€â”€â”€ ConfiguraÃ§Ã£o de tipos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TYPE_CONFIG: Record<
    SearchResultItem["type"],
    { bgColor: string; borderColor: string; textColor: string; label: string }
> = {
    newsletter: {
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        textColor: "text-blue-400",
        label: "Newsletter",
    },
    "mini-livro": {
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
        textColor: "text-green-400",
        label: "Mini-Livro",
    },
    biblioteca: {
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        textColor: "text-purple-400",
        label: "Biblioteca",
    },
    "especial-semana": {
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
        textColor: "text-yellow-400",
        label: "Especial da Semana",
    },
};

// â”€â”€â”€ SearchResultCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SearchResultCard({ item, onClose }: { item: SearchResultItem; onClose: () => void }) {
    const config = TYPE_CONFIG[item.type];

    return (
        <div
            className={`${config.bgColor} border ${config.borderColor} rounded-lg md:rounded-xl p-3 md:p-4 hover:bg-white/10 transition-all duration-200`}
        >
            <span
                className={`inline-block px-2 py-1 ${config.bgColor} ${config.textColor} text-xs font-medium rounded-md mb-2`}
            >
                {config.label}
            </span>
            <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{item.title}</h4>
            <p className="text-text-secondary text-xs mb-3">{item.date}</p>
            <div className="flex gap-2 flex-wrap">
                {item.htmlAvailable && item.viewUrl && (
                    <a
                        href={item.viewUrl}
                        onClick={onClose}
                        className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} hover:bg-white/10 border ${config.borderColor} rounded-lg text-white text-xs font-medium transition-all duration-200`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Ler</span>
                    </a>
                )}
                {item.pdfAvailable && !item.htmlAvailable && (
                    <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} border ${config.borderColor} rounded-lg ${config.textColor} text-xs font-medium`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                    </span>
                )}
                {!item.htmlAvailable && !item.pdfAvailable && (
                    <span className="text-xs text-text-secondary italic">IndisponÃ­vel</span>
                )}
            </div>
        </div>
    );
}

// â”€â”€â”€ Filtros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FILTERS: {
    id: SearchFilter;
    label: string;
    icon: React.ElementType;
    activeColor: string;
}[] = [
    { id: "all", label: "Todos", icon: Sparkles, activeColor: "text-blue-400" },
    { id: "newsletter", label: "Newsletter", icon: FileText, activeColor: "text-purple-400" },
    { id: "mini-livro", label: "Mini-Livros", icon: BookOpen, activeColor: "text-green-400" },
    { id: "especial-semana", label: "Especial da Semana", icon: Star, activeColor: "text-yellow-400" },
    { id: "biblioteca", label: "Biblioteca", icon: Library, activeColor: "text-pink-400" },
];

// â”€â”€â”€ SearchModal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useBodyScrollLock(isOpen);

    const { results, isLoading, error } = useSearch(searchQuery, activeFilter);

    // Reset ao fechar
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setActiveFilter("all");
            setIsFiltersOpen(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const showMinCharsHint = searchQuery.length > 0 && searchQuery.length < 2;
    const showEmpty = searchQuery.length >= 2 && !isLoading && results.length === 0 && !error;
    const showResults = searchQuery.length >= 2 && !isLoading && results.length > 0;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={onClose}
            style={{ touchAction: "none" }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" />

            {/* Modal */}
            <div
                className="relative w-full max-w-6xl max-h-[90vh] bg-bg-primary/95 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl animate-scale-in flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-end p-3 sm:p-4 md:p-6 pb-0 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-2 md:p-2.5 text-text-secondary hover:text-white bg-bg-primary/80 hover:bg-white/10 rounded-full transition-all duration-200 border border-white/10 cursor-pointer"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 flex flex-col min-h-0">
                    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 h-full">
                        {/* Campo de busca */}
                        <div className="relative shrink-0">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Pesquise pelo material desejado"
                                className="w-full px-4 sm:px-5 md:px-6 py-3 md:py-4 pr-12 md:pr-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:outline-none focus:ring-0 focus:border-white focus:bg-white/[0.07] transition-all duration-200"
                                autoFocus
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg md:rounded-xl">
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                )}
                            </div>
                        </div>

                        {/* Layout de 2 colunas */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 flex-1 min-h-0 overflow-hidden">
                            {/* Sidebar de filtros */}
                            <div className="lg:col-span-1 glass-card rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6">
                                <button
                                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                    className="lg:hidden w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-400 tracking-tight uppercase hover:text-white transition-colors"
                                >
                                    <span>Filtrar por tipo</span>
                                    {isFiltersOpen ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                <h3 className="hidden lg:block text-xs md:text-sm font-semibold text-gray-400 mb-3 md:mb-4 tracking-tight uppercase">
                                    Filtrar por tipo
                                </h3>

                                <div
                                    className={`space-y-2 max-h-60 sm:max-h-75 overflow-y-auto transition-all duration-300 ${
                                        isFiltersOpen
                                            ? "block mt-3 opacity-100"
                                            : "hidden opacity-0 lg:block lg:opacity-100"
                                    }`}
                                >
                                    {FILTERS.map(filter => {
                                        const Icon = filter.icon;
                                        const isActive = activeFilter === filter.id;
                                        return (
                                            <button
                                                key={filter.id}
                                                onClick={() => {
                                                    setActiveFilter(filter.id);
                                                    setIsFiltersOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-white/10 border border-white/20 text-white"
                                                        : "bg-white/5 border border-transparent text-text-secondary hover:bg-white/[0.07] hover:text-white"
                                                }`}
                                            >
                                                <Icon
                                                    className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? filter.activeColor : ""}`}
                                                />
                                                <span className="font-medium text-xs md:text-sm">{filter.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Painel de resultados */}
                            <div className="lg:col-span-3 glass-card rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col min-h-0">
                                {/* Estado: campo vazio */}
                                {searchQuery.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
                                        <div className="w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <Search className="w-8 h-8 md:w-10 md:h-10 text-brand-blue" />
                                        </div>
                                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3">
                                            Comece a pesquisar
                                        </h3>
                                        <p className="text-text-secondary text-sm md:text-base max-w-md px-4">
                                            Digite pelo menos 2 caracteres para encontrar newsletters, mini-livros,
                                            especiais e conteÃºdos da biblioteca.
                                        </p>
                                    </div>
                                )}

                                {/* Estado: menos de 2 chars */}
                                {showMinCharsHint && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
                                        <div className="w-14 h-14 md:w-16 md:h-16 mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                                            <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-yellow-400" />
                                        </div>
                                        <p className="text-text-secondary text-sm md:text-base px-4">
                                            Digite mais {2 - searchQuery.length}{" "}
                                            {2 - searchQuery.length === 1 ? "caractere" : "caracteres"} para iniciar a
                                            pesquisa
                                        </p>
                                    </div>
                                )}

                                {/* Estado: carregando */}
                                {isLoading && searchQuery.length >= 2 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
                                        <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                                        <p className="text-text-secondary text-sm">Buscando conteÃºdo...</p>
                                    </div>
                                )}

                                {/* Estado: erro */}
                                {error && !isLoading && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
                                        <div className="w-14 h-14 md:w-16 md:h-16 mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-red-500/20 flex items-center justify-center">
                                            <X className="w-7 h-7 md:w-8 md:h-8 text-red-400" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-white mb-2">
                                            Erro na busca
                                        </h3>
                                        <p className="text-text-secondary text-sm max-w-md px-4">{error}</p>
                                    </div>
                                )}

                                {/* Estado: sem resultados */}
                                {showEmpty && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12">
                                        <div className="w-14 h-14 md:w-16 md:h-16 mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-gray-500/20 flex items-center justify-center">
                                            <Search className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-white mb-2">
                                            Nenhum resultado
                                        </h3>
                                        <p className="text-text-secondary text-sm max-w-md mb-3 md:mb-4 px-4">
                                            NÃ£o encontramos resultados para &quot;{searchQuery}&quot;.
                                        </p>
                                        <p className="text-xs md:text-sm text-emerald-400">Mais conteÃºdo em breve!</p>
                                    </div>
                                )}

                                {/* Estado: resultados */}
                                {showResults && (
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                                            <h3 className="text-base md:text-lg font-bold text-white">
                                                Resultados para &quot;{searchQuery}&quot;
                                            </h3>
                                            <span className="text-xs md:text-sm text-text-secondary">
                                                {results.length} {results.length !== 1 ? "resultados" : "resultado"}
                                            </span>
                                        </div>

                                        <div
                                            className="flex-1 overflow-y-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8"
                                            style={{ WebkitOverflowScrolling: "touch" }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                                {results.map(item => (
                                                    <SearchResultCard
                                                        key={`${item.type}-${item.id}`}
                                                        item={item}
                                                        onClose={onClose}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
