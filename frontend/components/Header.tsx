"use client";

import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useSearchModal } from "@/context/SearchModalContext";
import AuthModal from "./AuthModal";

// 7 itens de navegação seguindo a regra de negócio
const navItems = [
    { label: "Quem Somos", href: "/#quemsomos" },
    { label: "O Autor", href: "/#autor" },
    { label: "Propósito", href: "/#proposito" },
    { label: "Divulgação", href: "/PP7IAS_Disclosures_Legal_Compliance.pdf", isExternal: true },
    { label: "Instruções", href: "/PP7IAS_Instrucoes_Rapidas.pdf", isExternal: true },
    { label: "Ensinar", href: "/#ensinar" },
    { label: "Pesquisar", href: "#", isModal: true },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { openModal } = useSearchModal();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialMode, setAuthInitialMode] = useState<"login" | "signup">("login");

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!href.startsWith("/#")) return;

        e.preventDefault();
        const element = document.getElementById(href.slice(2));

        if (element) {
            const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
            // Adiciona padding adequado: 16px para mobile, 32px para desktop
            const offset = window.innerWidth < 768 ? 16 : 32;

            window.scrollTo({
                top: element.getBoundingClientRect().top + window.scrollY - headerHeight - offset,
                behavior: "smooth",
            });
        }
    };

    return (
        <header className="sticky top-0 left-0 right-0 z-50 glass-navbar backdrop-blur-[20px] bg-bg-primary/90 safe-area-top">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <a
                        href="/"
                        className="flex items-center gap-2 text-white font-bold text-xl md:text-2xl tracking-tight"
                    >
                        <span className="inline-flex">
                            <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                PP7+IAS
                            </span>
                            <span className="text-white tracking-normal">.portal</span>
                        </span>
                    </a>

                    {/* Desktop Navigation - 7 Links (Centered) */}
                    <nav
                        className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
                        aria-label="Navegação principal"
                    >
                        {navItems.map(item =>
                            item.isModal ? (
                                <button
                                    key={item.label}
                                    onClick={() => openModal()}
                                    className="px-3 py-2 text-sm text-text-secondary hover:text-white transition-colors cursor-pointer duration-200 rounded-lg hover:bg-white/5 whitespace-nowrap"
                                >
                                    {item.label}
                                </button>
                            ) : item.isExternal ? (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="px-3 py-2 text-sm text-text-secondary hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 whitespace-nowrap"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={e => scrollToSection(e, item.href)}
                                    className="px-3 py-2 text-sm text-text-secondary hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5 whitespace-nowrap"
                                >
                                    {item.label}
                                </a>
                            )
                        )}
                    </nav>

                    {/* CTA Button */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => {
                                setAuthInitialMode("login");
                                setIsAuthModalOpen(true);
                            }}
                            className="px-4 py-2 text-text-secondary hover:text-white font-semibold text-sm rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                        >
                            Entrar
                        </button>
                        <a
                            href="/#cta"
                            onClick={e => scrollToSection(e, "/#cta")}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200"
                        >
                            <span>Quero Fazer Parte</span>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-text-secondary hover:text-white transition-colors touch-target"
                        aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu - 7 Links */}
            <div
                className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
                    isMenuOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav
                    className="px-4 py-4 space-y-1 bg-bg-primary/95 border-t border-border-glass"
                    aria-label="Navegação mobile"
                >
                    {navItems.map((item, index) =>
                        item.isModal ? (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    openModal();
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 touch-target w-full"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-xs text-brand-blue font-mono">0{index + 1}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ) : item.isExternal ? (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 touch-target"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-xs text-brand-blue font-mono">0{index + 1}</span>
                                <span className="font-medium">{item.label}</span>
                            </a>
                        ) : (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={e => {
                                    setIsMenuOpen(false);
                                    scrollToSection(e, item.href);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 touch-target"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-xs text-brand-blue font-mono">0{index + 1}</span>
                                <span className="font-medium">{item.label}</span>
                            </a>
                        )
                    )}

                    {/* Mobile CTA */}
                    <div className="pt-4 px-4 space-y-3">
                        <button
                            onClick={() => {
                                setIsMenuOpen(false);
                                setAuthInitialMode("login");
                                setIsAuthModalOpen(true);
                            }}
                            className="w-full px-5 py-3 text-white font-semibold text-sm rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 active:scale-95 transition-all duration-200 touch-target"
                        >
                            Entrar
                        </button>
                        <a
                            href="/#cta"
                            onClick={e => {
                                setIsMenuOpen(false);
                                scrollToSection(e, "/#cta");
                            }}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 transition-all duration-200 touch-target"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Quero Fazer Parte</span>
                        </a>
                    </div>
                </nav>
            </div>

            {/* Auth Modal */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authInitialMode} />
        </header>
    );
}
