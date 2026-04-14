"use client";

import {
    BookOpen,
    Bot,
    FileText,
    Folder,
    GraduationCap,
    Library,
    Loader2,
    Radio,
    Search,
    Star,
    X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { SectionType, Subsection } from "../constants/sections";
import { SECTIONS } from "../constants/sections";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import type { SearchFilter, SearchResultItem } from "../presentation/hooks/useSearch";
import { useSearch } from "../presentation/hooks/useSearch";
import { useSectionBrowse } from "../presentation/hooks/useSectionBrowse";

// ─── Mapa de ícones por seção ────────────────────────────────────────────────

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
    newsletter:      FileText,
    "especial-semana": Star,
    radar:           Radio,
    "mini-livro":    BookOpen,
    biblioteca:      Library,
    estudar:         GraduationCap,
    ias:             Bot,
};

// ─── Mapa de tipos de resultado para label + cor ─────────────────────────────

const TYPE_LABEL: Record<SearchResultItem["type"], string> = {
    newsletter:        "Newsletter",
    "mini-livro":      "Mini-livros",
    biblioteca:        "Biblioteca",
    "especial-semana": "Especial da Semana",
    radar:             "Radar",
    estudar:           "Estudar",
};

const TYPE_SECTION: Record<SearchResultItem["type"], SectionType> = {
    newsletter:        "newsletter",
    "mini-livro":      "mini-livro",
    biblioteca:        "biblioteca",
    "especial-semana": "especial-semana",
    radar:             "radar",
    estudar:           "estudar",
};

// ─── Utilitário: highlight do termo no título ─────────────────────────────────

function HighlightedTitle({ title, query }: { title: string; query: string }) {
    if (!query || query.length < 3) return <span>{title}</span>;

    const idx = title.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{title}</span>;

    return (
        <span>
            {title.slice(0, idx)}
            <mark className="bg-transparent text-blue-300 font-semibold not-italic">
                {title.slice(idx, idx + query.length)}
            </mark>
            {title.slice(idx + query.length)}
        </span>
    );
}

// ─── Estado A: preview de materiais ao clicar no chip ────────────────────────

function ChipPreview({
    sectionId,
    subsection,
    onClose,
}: {
    sectionId: SectionType;
    subsection: Subsection;
    onClose: () => void;
}) {
    const { items, isLoading } = useSectionBrowse(sectionId, subsection.id, subsection.tema);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 py-2 px-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white/30" />
                <span className="text-xs text-white/30">Carregando...</span>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <p className="text-xs text-white/30 italic py-2 px-1">Nenhum material disponível.</p>
        );
    }

    return (
        <ul className="space-y-1.5">
            {items.map((item, i) => (
                <li
                    key={item.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                >
                    {item.url ? (
                        <Link
                            href={item.url}
                            onClick={onClose}
                            className="flex items-center gap-2 text-xs text-white/70 hover:text-blue-300 transition-colors duration-150 group"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 group-hover:bg-blue-400 shrink-0 transition-colors" />
                            <span className="line-clamp-1">{item.title}</span>
                        </Link>
                    ) : (
                        <span className="flex items-center gap-2 text-xs text-white/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/15 shrink-0" />
                            <span className="line-clamp-1">{item.title}</span>
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

// ─── Estado A: conteúdo de uma aba ───────────────────────────────────────────

function TabContent({ section, onClose }: { section: (typeof SECTIONS)[0]; onClose: () => void }) {
    const [activeChip, setActiveChip] = useState<string | null>(null);

    const activeSubsection = section.subsections.find(s => s.id === activeChip) ?? null;

    return (
        <div className="p-5 flex flex-col gap-4" style={{ background: "#161623" }}>
            <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-3"
                   style={{ color: "rgba(59,130,246,0.6)" }}>
                    Subseções disponíveis
                </p>
                <div className="flex flex-wrap gap-2">
                    {section.subsections.map((sub, i) =>
                        sub.directUrl ? (
                            <Link
                                key={sub.id}
                                href={sub.directUrl}
                                onClick={onClose}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border animate-[chipIn_200ms_ease_both]"
                                style={{
                                    animationDelay: `${i * 50}ms`,
                                    background: "rgba(59,130,246,0.08)",
                                    borderColor: "rgba(59,130,246,0.3)",
                                    color: "#93c5fd",
                                }}
                            >
                                {sub.label}
                            </Link>
                        ) : (
                            <button
                                key={sub.id}
                                onClick={() => setActiveChip(activeChip === sub.id ? null : sub.id)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border animate-[chipIn_200ms_ease_both]"
                                style={{
                                    animationDelay: `${i * 50}ms`,
                                    background: activeChip === sub.id
                                        ? "rgba(59,130,246,0.18)"
                                        : "rgba(255,255,255,0.03)",
                                    borderColor: activeChip === sub.id
                                        ? "rgba(59,130,246,0.5)"
                                        : "rgba(255,255,255,0.08)",
                                    color: activeChip === sub.id ? "#bfdbfe" : "rgba(255,255,255,0.6)",
                                }}
                            >
                                {sub.label}
                            </button>
                        ),
                    )}
                </div>
            </div>

            {activeSubsection && !activeSubsection.directUrl && (
                <div className="animate-[fadeUp_200ms_ease_both]">
                    <div className="h-px mb-3" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-2.5"
                       style={{ color: "rgba(59,130,246,0.5)" }}>
                        Materiais em &ldquo;{activeSubsection.label}&rdquo;
                    </p>
                    <ChipPreview
                        sectionId={section.id}
                        subsection={activeSubsection}
                        onClose={onClose}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Estado B: sidebar accordion ─────────────────────────────────────────────

function SearchSidebar({
    activeFilter,
    onFilter,
}: {
    activeFilter: SearchFilter;
    onFilter: (f: SearchFilter) => void;
}) {
    const [expanded, setExpanded] = useState<SectionType | null>(null);

    const filterMap: Record<SectionType, SearchFilter> = {
        newsletter:        "newsletter",
        "especial-semana": "especial-semana",
        radar:             "radar",
        "mini-livro":      "mini-livro",
        biblioteca:        "biblioteca",
        estudar:           "estudar",
        ias:               "all",
    };

    return (
        <div
            className="shrink-0 overflow-y-auto py-3 px-2"
            style={{
                width: 180,
                borderRight: "1px solid rgba(255,255,255,0.06)",
                scrollbarWidth: "none",
            }}
        >
            <p className="text-[10px] uppercase tracking-widest font-semibold px-2 mb-2"
               style={{ color: "rgba(255,255,255,0.18)" }}>
                Seções
            </p>
            {SECTIONS.map(section => {
                const Icon = SECTION_ICONS[section.id];
                const sectionFilter = filterMap[section.id];
                const isActive = activeFilter === sectionFilter && sectionFilter !== "all";
                const isExpanded = expanded === section.id;

                return (
                    <div key={section.id}>
                        <button
                            onClick={() => {
                                setExpanded(isExpanded ? null : section.id);
                                if (sectionFilter !== "all") onFilter(sectionFilter);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[9px] text-left transition-all duration-150"
                            style={{
                                background: isActive
                                    ? "rgba(59,130,246,0.12)"
                                    : "transparent",
                                border: isActive
                                    ? "1px solid rgba(59,130,246,0.2)"
                                    : "1px solid transparent",
                                color: isActive
                                    ? "#93c5fd"
                                    : "rgba(255,255,255,0.35)",
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }
                            }}
                        >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs font-medium truncate">{section.label}</span>
                        </button>

                        {isExpanded && (
                            <div className="ml-4 mt-0.5 mb-1 space-y-0.5">
                                {section.subsections.map((sub, i) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => onFilter(sectionFilter)}
                                        className="w-full flex items-center gap-1.5 px-2 py-1 rounded-[7px] text-left transition-colors duration-150 animate-[slideIn_150ms_ease_both]"
                                        style={{
                                            animationDelay: `${i * 40}ms`,
                                            color: "rgba(255,255,255,0.4)",
                                            fontSize: "11.5px",
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#60a5fa"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
                                    >
                                        <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                                        <span className="truncate">{sub.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── SearchModal ─────────────────────────────────────────────────────────────

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState<SectionType>("newsletter");
    const [activeFilter, setActiveFilter] = useState<SearchFilter>("all");
    const inputRef = useRef<HTMLInputElement>(null);

    useBodyScrollLock(isOpen);

    const isSearchMode = query.length >= 3;
    const { results, isLoading, error } = useSearch(query, activeFilter);

    // Reset ao fechar
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setActiveTab("newsletter");
            setActiveFilter("all");
        }
    }, [isOpen]);

    // Auto-focus
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Ctrl+K / Cmd+K global
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                if (isOpen) onClose();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Escape fecha
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const activeSection = SECTIONS.find(s => s.id === activeTab)!;

    const showEmpty   = isSearchMode && !isLoading && results.length === 0 && !error;
    const showResults = isSearchMode && !isLoading && results.length > 0;

    return (
        <div
            className="fixed inset-0 z-[100] flex justify-center px-4"
            style={{ paddingTop: "7vh" }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Pesquisar materiais"
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 animate-fade-in"
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
            />

            {/* Modal */}
            <div
                className="relative w-full flex flex-col animate-scale-in"
                style={{
                    maxWidth: 780,
                    maxHeight: "78vh",
                    background: "#111118",
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(59,130,246,0.08)",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* TOP BAR */}
                <div
                    className="flex items-center gap-3 px-4 py-3.5 shrink-0"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    {/* Input pill */}
                    <div
                        className="flex-1 flex items-center gap-2 px-4 transition-all duration-200"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: 50,
                            height: 44,
                        }}
                        onFocus={e => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.borderColor = "rgba(59,130,246,0.45)";
                            el.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)";
                        }}
                        onBlur={e => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.borderColor = "rgba(255,255,255,0.09)";
                            el.style.boxShadow = "none";
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Comece a digitar para pesquisar por material"
                            aria-label="Campo de pesquisa"
                            aria-autocomplete="list"
                            className="flex-1 bg-transparent outline-none border-none text-sm"
                            style={{
                                color: "#e8eaf0",
                                caretColor: "#3b82f6",
                            }}
                        />
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: "rgba(59,130,246,0.8)" }} />
                        ) : (
                            <Search className="w-4 h-4 shrink-0 transition-colors" style={{ color: "rgba(255,255,255,0.3)" }} />
                        )}
                    </div>

                    {/* Botão fechar */}
                    <button
                        onClick={onClose}
                        title="Fechar (Esc)"
                        className="flex items-center justify-center shrink-0 transition-all duration-150 group"
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "transparent",
                            color: "rgba(255,255,255,0.4)",
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "rgba(239,68,68,0.15)";
                            el.style.borderColor = "rgba(239,68,68,0.3)";
                            el.style.color = "#ef4444";
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLButtonElement;
                            el.style.background = "transparent";
                            el.style.borderColor = "rgba(255,255,255,0.08)";
                            el.style.color = "rgba(255,255,255,0.4)";
                        }}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* ── ESTADO A: Tab Browser (< 3 chars) ── */}
                    {!isSearchMode && (
                        <div className="flex flex-col flex-1 min-h-0">
                            {/* Tabs row */}
                            <div
                                className="flex overflow-x-auto shrink-0"
                                style={{
                                    scrollbarWidth: "none",
                                    background: "#111118",
                                }}
                            >
                                {SECTIONS.map(section => {
                                    const Icon = SECTION_ICONS[section.id];
                                    const isActive = activeTab === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveTab(section.id)}
                                            className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0"
                                            style={{
                                                borderRadius: "10px 10px 0 0",
                                                background: isActive ? "#161623" : "transparent",
                                                borderTop: isActive ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                                                borderLeft: isActive ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                                                borderRight: isActive ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                                                borderBottom: isActive ? "1px solid #161623" : "1px solid transparent",
                                                color: isActive ? "#93c5fd" : "rgba(255,255,255,0.35)",
                                                marginBottom: isActive ? -1 : 0,
                                            }}
                                            onMouseEnter={e => {
                                                if (!isActive) {
                                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                                                }
                                            }}
                                            onMouseLeave={e => {
                                                if (!isActive) {
                                                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)";
                                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                                }
                                            }}
                                        >
                                            <Icon className="w-3.5 h-3.5 shrink-0" />
                                            <span>{section.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab content */}
                            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent" }}>
                                <TabContent
                                    key={activeTab}
                                    section={activeSection}
                                    onClose={onClose}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── ESTADO B: Search (>= 3 chars) ── */}
                    {isSearchMode && (
                        <div className="flex flex-1 min-h-0">
                            {/* Sidebar — oculta em telas pequenas */}
                            <div className="hidden sm:flex">
                                <SearchSidebar
                                    activeFilter={activeFilter}
                                    onFilter={f => setActiveFilter(f)}
                                />
                            </div>

                            {/* Results panel */}
                            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between px-4 py-2.5 shrink-0"
                                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                                >
                                    <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.2)" }}>
                                        Resultados
                                    </span>
                                    {results.length > 0 && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                background: "rgba(59,130,246,0.08)",
                                                border: "1px solid rgba(59,130,246,0.15)",
                                                color: "rgba(59,130,246,0.6)",
                                            }}
                                        >
                                            {results.length} encontrado{results.length !== 1 ? "s" : ""}
                                        </span>
                                    )}
                                </div>

                                {/* Scrollable results */}
                                <div
                                    className="flex-1 overflow-y-auto p-4 space-y-2"
                                    role="list"
                                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent" }}
                                >
                                    {/* Loading skeleton */}
                                    {isLoading && (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-14 rounded-[11px] animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Error */}
                                    {error && !isLoading && (
                                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                            <X className="w-8 h-8" style={{ color: "rgba(239,68,68,0.5)" }} />
                                            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{error}</p>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {showEmpty && (
                                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                            <Search className="w-8 h-8" style={{ color: "rgba(255,255,255,0.12)" }} />
                                            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                                                Nenhum material encontrado para &ldquo;{query}&rdquo;
                                            </p>
                                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                                                Tente outros termos ou navegue pelas seções ao lado
                                            </p>
                                        </div>
                                    )}

                                    {/* Results */}
                                    {showResults && (
                                        <div role="listbox">
                                            {results.map((item, i) => {
                                                const sectionLabel = TYPE_LABEL[item.type];
                                                const sectionObj = SECTIONS.find(s => s.id === TYPE_SECTION[item.type]);
                                                const subsectionLabel = sectionObj?.subsections[0]?.label ?? sectionLabel;
                                                const Icon = SECTION_ICONS[TYPE_SECTION[item.type]];

                                                return (
                                                    <div
                                                        key={`${item.type}-${item.id}`}
                                                        className="animate-[resultIn_200ms_ease_both]"
                                                        style={{ animationDelay: `${i * 30}ms` }}
                                                        role="option"
                                                    >
                                                        {item.viewUrl ? (
                                                            <Link
                                                                href={item.viewUrl}
                                                                onClick={onClose}
                                                                className="block p-3 rounded-[11px] transition-all duration-150 mb-2 group"
                                                                style={{
                                                                    background: "rgba(255,255,255,0.02)",
                                                                    border: "1px solid rgba(255,255,255,0.05)",
                                                                }}
                                                                onMouseEnter={e => {
                                                                    const el = e.currentTarget as HTMLAnchorElement;
                                                                    el.style.background = "rgba(59,130,246,0.07)";
                                                                    el.style.borderColor = "rgba(59,130,246,0.2)";
                                                                    el.style.transform = "translateX(2px)";
                                                                }}
                                                                onMouseLeave={e => {
                                                                    const el = e.currentTarget as HTMLAnchorElement;
                                                                    el.style.background = "rgba(255,255,255,0.02)";
                                                                    el.style.borderColor = "rgba(255,255,255,0.05)";
                                                                    el.style.transform = "translateX(0)";
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <Icon className="w-3 h-3 shrink-0" style={{ color: "rgba(59,130,246,0.55)" }} />
                                                                    <span className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                                                        <span style={{ color: "rgba(59,130,246,0.55)" }}>{sectionLabel}</span>
                                                                        {" › "}
                                                                        {subsectionLabel}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[13.5px] leading-snug" style={{ color: "rgba(255,255,255,0.8)" }}>
                                                                    <HighlightedTitle title={item.title} query={query} />
                                                                </p>
                                                            </Link>
                                                        ) : (
                                                            <div
                                                                className="block p-3 rounded-[11px] mb-2 opacity-50"
                                                                style={{
                                                                    background: "rgba(255,255,255,0.02)",
                                                                    border: "1px solid rgba(255,255,255,0.05)",
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-1.5 mb-1">
                                                                    <Folder className="w-3 h-3 shrink-0" style={{ color: "rgba(255,255,255,0.25)" }} />
                                                                    <span className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                                                                        {sectionLabel}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[13.5px] leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
                                                                    {item.title}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* HINT BAR */}
                <div
                    className="flex items-center gap-4 px-4 py-2.5 shrink-0"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                    {(["↵ selecionar", "↑↓ navegar", "Esc fechar"] as const).map(hint => {
                        const [key, desc] = hint.split(" ");
                        return (
                            <span key={hint} className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
                                <kbd
                                    className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                                    style={{
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                    }}
                                >
                                    {key}
                                </kbd>
                                <span>{desc}</span>
                            </span>
                        );
                    })}
                    {!isSearchMode && (
                        <span className="ml-auto text-[11px]" style={{ color: "rgba(59,130,246,0.5)" }}>
                            Digite 3+ letras para buscar
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
