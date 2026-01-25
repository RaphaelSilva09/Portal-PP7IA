"use client";

import { BookOpen, ChevronDown, ChevronUp, FileText, Globe, Library, Search, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ContentItem, searchContent } from "../data/content";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FilterType = "all" | "newsletter" | "mini-livro" | "biblioteca";

/**
 * Hook para debounce de valores
 */
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Componente de card de resultado da busca
 */
function SearchResultCard({ item, onClose }: { item: ContentItem; onClose: () => void }) {
    const typeConfig = {
        newsletter: {
            color: "blue",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            textColor: "text-blue-400",
            label: "Newsletter",
        },
        "mini-livro": {
            color: "green",
            bgColor: "bg-green-500/10",
            borderColor: "border-green-500/20",
            textColor: "text-green-400",
            label: "Mini-Livro",
        },
        biblioteca: {
            color: "purple",
            bgColor: "bg-purple-500/10",
            borderColor: "border-purple-500/20",
            textColor: "text-purple-400",
            label: "Biblioteca",
        },
    };

    const config = typeConfig[item.type];

    return (
        <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 hover:bg-white/10 transition-all duration-200`}>
            {/* Badge de tipo */}
            <span className={`inline-block px-2 py-1 ${config.bgColor} ${config.textColor} text-xs font-medium rounded-md mb-2`}>
                {config.label}
            </span>

            {/* Título */}
            <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{item.title}</h4>

            {/* Data */}
            <p className="text-text-secondary text-xs mb-3">{item.date}</p>

            {/* Botões de ação */}
            <div className="flex gap-2">
                {item.htmlAvailable && item.htmlUrl && (
                    <a
                        href={item.htmlUrl}
                        onClick={onClose}
                        className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} hover:bg-white/10 border ${config.borderColor} rounded-lg text-white text-xs font-medium transition-all duration-200`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>HTML</span>
                    </a>
                )}
                {item.pdfAvailable && item.pdfUrl && (
                    <a
                        href={item.pdfUrl}
                        onClick={onClose}
                        className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} hover:bg-white/10 border ${config.borderColor} rounded-lg text-white text-xs font-medium transition-all duration-200`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                    </a>
                )}
            </div>
        </div>
    );
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    // Debounce da query de busca (300ms)
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Resultados da busca usando useMemo para performance
    const searchResults = useMemo(() => {
        if (debouncedQuery.length < 2) return [];
        return searchContent(debouncedQuery, activeFilter);
    }, [debouncedQuery, activeFilter]);

    // Desabilitar scroll do body quando modal está aberto (iOS-friendly)
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";

            return () => {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                document.body.style.overflow = "";
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    // Limpar busca ao fechar modal
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setActiveFilter("all");
        }
    }, [isOpen]);

    const filters = [
        { id: "all" as FilterType, label: "Todos", icon: Sparkles, color: "blue" },
        { id: "newsletter" as FilterType, label: "Newsletter", icon: FileText, color: "purple" },
        { id: "mini-livro" as FilterType, label: "Mini-Livros", icon: BookOpen, color: "green" },
        { id: "biblioteca" as FilterType, label: "Biblioteca", icon: Library, color: "pink" },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-[2vh] sm:p-[2vw]"
            onClick={onClose}
            style={{ touchAction: "none" }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

            {/* Modal Container */}
            <div
                className="relative w-full h-full bg-bg-primary/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-scale-in flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header com Close Button */}
                <div className="flex items-center justify-end p-4 sm:p-6 pb-0 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-2 text-text-secondary hover:text-white bg-bg-primary/80 hover:bg-white/10 rounded-full transition-all duration-200 border border-white/10"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 flex flex-col min-h-0">
                    <div className="flex flex-col gap-4 sm:gap-6 h-full">
                        {/* Search Bar - Topo */}
                        <div className="relative shrink-0">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Pesquise pelo material desejado"
                                className="w-full px-6 py-4 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 outline-none focus:outline-none focus:ring-0 focus:border-white focus:bg-white/[0.07] transition-all duration-200"
                                autoFocus
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl">
                                <Search className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* Bento Box Layout - Filtros + Resultados */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 flex-1 min-h-0 overflow-hidden">
                            {/* Filtros - Esquerda (Desktop sempre visível / Mobile dropdown) */}
                            <div className="lg:col-span-1 glass-card rounded-2xl p-4 sm:p-6">
                                {/* Toggle para Mobile */}
                                <button
                                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                    className="lg:hidden w-full flex items-center justify-between text-sm font-semibold text-gray-400 tracking-tight uppercase hover:text-white transition-colors"
                                >
                                    <span>Filtrar por tipo</span>
                                    {isFiltersOpen ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                {/* Título para Desktop */}
                                <h3 className="hidden lg:block text-sm font-semibold text-gray-400 mb-4 tracking-tight uppercase">
                                    Filtrar por tipo
                                </h3>

                                {/* Lista de Filtros */}
                                <div
                                    className={`space-y-2 max-h-75 hover-scroll overflow-y-auto transition-all duration-500 ${
                                        isFiltersOpen
                                            ? "block mt-4 opacity-100"
                                            : "hidden opacity-0 lg:block lg:opacity-100"
                                    }`}
                                    style={{ WebkitOverflowScrolling: "touch" }}
                                >
                                    {filters.map(filter => {
                                        const Icon = filter.icon;
                                        const isActive = activeFilter === filter.id;

                                        return (
                                            <button
                                                key={filter.id}
                                                onClick={() => {
                                                    setActiveFilter(filter.id);
                                                    setIsFiltersOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                                    isActive
                                                        ? "bg-white/10 border border-white/20 text-white"
                                                        : "bg-white/5 border border-transparent text-text-secondary hover:bg-white/[0.07] hover:text-white"
                                                }`}
                                            >
                                                <Icon
                                                    className={`w-5 h-5 ${
                                                        isActive ? "text-" + filter.color + "-400" : ""
                                                    }`}
                                                />
                                                <span className="font-medium text-sm">{filter.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Resultados - Direita */}
                            <div className="lg:col-span-3 glass-card rounded-2xl p-4 sm:p-6 lg:p-8 flex flex-col min-h-0">
                                {searchQuery.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 overflow-hidden">
                                        <div className="w-20 h-20 mb-6 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <Search className="w-10 h-10 text-brand-blue" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">Comece a pesquisar</h3>
                                        <p className="text-text-secondary max-w-md">
                                            Digite pelo menos 2 caracteres para encontrar newsletters, mini-livros e
                                            conteúdos da biblioteca.
                                        </p>
                                    </div>
                                ) : searchQuery.length < 2 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 overflow-hidden">
                                        <div className="w-16 h-16 mb-4 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-yellow-400" />
                                        </div>
                                        <p className="text-text-secondary">
                                            Digite mais {2 - searchQuery.length} caractere(s) para iniciar a pesquisa
                                        </p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 overflow-hidden">
                                        <div className="w-16 h-16 mb-4 rounded-2xl bg-gray-500/20 flex items-center justify-center">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Nenhum resultado</h3>
                                        <p className="text-text-secondary max-w-md mb-4">
                                            Não encontramos resultados para "{searchQuery}".
                                        </p>
                                        <p className="text-sm text-emerald-400">
                                            Mais conteúdo em breve!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="flex items-center justify-between mb-6 shrink-0">
                                            <h3 className="text-lg font-bold text-white">
                                                Resultados para "{debouncedQuery}"
                                            </h3>
                                            <span className="text-sm text-text-secondary">
                                                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        {/* Grid de Resultados com Scroll Interno */}
                                        <div
                                            className="flex-1 overflow-y-auto hover-scroll -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
                                            style={{ WebkitOverflowScrolling: "touch" }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {searchResults.map(item => (
                                                    <SearchResultCard key={item.id} item={item} onClose={onClose} />
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
