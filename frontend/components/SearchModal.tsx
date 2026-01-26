"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useEffect } from "react";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * SearchModal Component
 * 
 * Modal de pesquisa centralizado com Portal para renderização no body.
 * Versão simplificada "Em breve" enquanto a funcionalidade completa está em desenvolvimento.
 * 
 * Princípios aplicados:
 * - SRP: Única responsabilidade de apresentar UI do modal
 * - Clean Code: Nomes reveladores, código autoexplicativo
 * - UX: Feedback claro ao usuário sobre funcionalidade futura
 */

/* ============================================
   CÓDIGO COMPLETO COMENTADO PARA FUTURA IMPLEMENTAÇÃO
   ============================================

import { BookOpen, ChevronDown, ChevronUp, FileText, Globe, Library } from "lucide-react";
import { useMemo, useState } from "react";
import { ContentItem, searchContent } from "../data/content";

type FilterType = "all" | "newsletter" | "mini-livro" | "biblioteca";

// Hook para debounce de valores
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

// Componente de card de resultado da busca
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
        <div className={`${config.bgColor} border ${config.borderColor} rounded-lg md:rounded-xl p-3 md:p-4 hover:bg-white/10 transition-all duration-200`}>
            <span className={`inline-block px-2 py-1 ${config.bgColor} ${config.textColor} text-xs font-medium rounded-md mb-2`}>
                {config.label}
            </span>
            <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2">{item.title}</h4>
            <p className="text-text-secondary text-xs mb-2 md:mb-3">{item.date}</p>
            <div className="flex gap-2">
                {item.htmlAvailable && item.htmlUrl && (
                    <a href={item.htmlUrl} onClick={onClose} className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} hover:bg-white/10 border ${config.borderColor} rounded-lg text-white text-xs font-medium transition-all duration-200 touch-target`}>
                        <Globe className="w-3.5 h-3.5" />
                        <span>HTML</span>
                    </a>
                )}
                {item.pdfAvailable && item.pdfUrl && (
                    <a href={item.pdfUrl} onClick={onClose} className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bgColor} hover:bg-white/10 border ${config.borderColor} rounded-lg text-white text-xs font-medium transition-all duration-200 touch-target`}>
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                    </a>
                )}
            </div>
        </div>
    );
}

   ============================================ */

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
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

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={onClose}
            style={{ touchAction: "none" }}
        >
            {/* Backdrop com overlay mais escuro */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" />

            {/* Modal Container - Centralizado e responsivo */}
            <div
                className="relative w-full max-w-2xl bg-bg-primary/95 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl animate-scale-in flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header com Close Button */}
                <div className="flex items-center justify-end p-4 md:p-6 pb-0 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-2 md:p-2.5 text-text-secondary hover:text-white bg-bg-primary/80 hover:bg-white/10 rounded-full transition-all duration-200 border border-white/10 touch-target cursor-pointer"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Content - "Em breve" */}
                <div className="flex-1 px-4 sm:px-6 md:px-8 pt-4 md:pt-6 pb-8 md:pb-12 flex flex-col items-center justify-center text-center">
                    {/* Ícone animado */}
                    <div className="relative mb-6 md:mb-8">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center animate-pulse-slow">
                            <Search className="w-10 h-10 md:w-12 md:h-12 text-brand-blue" />
                        </div>
                        <div className="absolute -top-2 -right-2">
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Título */}
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                        Busca Inteligente
                    </h2>

                    {/* Descrição */}
                    <p className="text-text-secondary text-sm md:text-base mb-6 md:mb-8 max-w-md leading-relaxed">
                        Estamos preparando uma experiência de busca poderosa para você encontrar newsletters, 
                        mini-livros e conteúdos da biblioteca de forma rápida e intuitiva.
                    </p>

                    {/* Badge "Em breve" */}
                    <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-blue-400 font-semibold text-sm md:text-base">
                            Em breve
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================
   LAYOUT COMPLETO COMENTADO PARA FUTURA IMPLEMENTAÇÃO
   ============================================

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const debouncedQuery = useDebounce(searchQuery, 300);

    const searchResults = useMemo(() => {
        if (debouncedQuery.length < 2) return [];
        return searchContent(debouncedQuery, activeFilter);
    }, [debouncedQuery, activeFilter]);

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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={onClose}
            style={{ touchAction: "none" }}
        >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" />

            <div
                className="relative w-full max-w-6xl max-h-[90vh] bg-bg-primary/95 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl animate-scale-in flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-end p-3 sm:p-4 md:p-6 pb-0 shrink-0">
                    <button
                        onClick={onClose}
                        className="p-2 md:p-2.5 text-text-secondary hover:text-white bg-bg-primary/80 hover:bg-white/10 rounded-full transition-all duration-200 border border-white/10 touch-target cursor-pointer"
                        aria-label="Fechar modal"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                <div className="flex-1 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 md:pb-6 flex flex-col min-h-0">
                    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 h-full">
                        <div className="relative shrink-0">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleInputChange}
                                placeholder="Pesquise pelo material desejado"
                                className="w-full px-4 sm:px-5 md:px-6 py-3 md:py-4 pr-12 md:pr-14 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base placeholder:text-gray-500 outline-none focus:outline-none focus:ring-0 focus:border-white focus:bg-white/[0.07] transition-all duration-200"
                                autoFocus
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg md:rounded-xl">
                                <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 flex-1 min-h-0 overflow-hidden">
                            <div className="lg:col-span-1 glass-card rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6">
                                <button
                                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                    className="lg:hidden w-full flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-400 tracking-tight uppercase hover:text-white transition-colors touch-target"
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
                                    className={`space-y-2 max-h-60 sm:max-h-75 hover-scroll overflow-y-auto transition-all duration-500 ${
                                        isFiltersOpen
                                            ? "block mt-3 opacity-100"
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
                                                className={`w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition-all duration-200 touch-target ${
                                                    isActive
                                                        ? "bg-white/10 border border-white/20 text-white"
                                                        : "bg-white/5 border border-transparent text-text-secondary hover:bg-white/[0.07] hover:text-white"
                                                }`}
                                            >
                                                <Icon
                                                    className={`w-4 h-4 md:w-5 md:h-5 ${
                                                        isActive ? "text-" + filter.color + "-400" : ""
                                                    }`}
                                                />
                                                <span className="font-medium text-xs md:text-sm">{filter.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="lg:col-span-3 glass-card rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col min-h-0">
                                {searchQuery.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12 overflow-hidden">
                                        <div className="w-16 h-16 md:w-20 md:h-20 mb-4 md:mb-6 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                            <Search className="w-8 h-8 md:w-10 md:h-10 text-brand-blue" />
                                        </div>
                                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2 md:mb-3">Comece a pesquisar</h3>
                                        <p className="text-text-secondary text-sm md:text-base max-w-md px-4">
                                            Digite pelo menos 2 caracteres para encontrar newsletters, mini-livros e
                                            conteúdos da biblioteca.
                                        </p>
                                    </div>
                                ) : searchQuery.length < 2 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12 overflow-hidden">
                                        <div className="w-14 h-14 md:w-16 md:h-16 mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                                            <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-yellow-400" />
                                        </div>
                                        <p className="text-text-secondary text-sm md:text-base px-4">
                                            Digite mais {2 - searchQuery.length} caractere(s) para iniciar a pesquisa
                                        </p>
                                    </div>
                                ) : searchResults.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 md:py-12 overflow-hidden">
                                        <div className="w-14 h-14 md:w-16 md:h-16 mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-gray-500/20 flex items-center justify-center">
                                            <Search className="w-7 h-7 md:w-8 md:h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-white mb-2">Nenhum resultado</h3>
                                        <p className="text-text-secondary text-sm md:text-base max-w-md mb-3 md:mb-4 px-4">
                                            Não encontramos resultados para "{searchQuery}".
                                        </p>
                                        <p className="text-xs md:text-sm text-emerald-400">
                                            Mais conteúdo em breve!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="flex items-center justify-between mb-4 md:mb-6 shrink-0">
                                            <h3 className="text-base md:text-lg font-bold text-white">
                                                Resultados para "{debouncedQuery}"
                                            </h3>
                                            <span className="text-xs md:text-sm text-text-secondary">
                                                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                                            </span>
                                        </div>

                                        <div
                                            className="flex-1 overflow-y-auto hover-scroll -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8"
                                            style={{ WebkitOverflowScrolling: "touch" }}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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

   ============================================ */
