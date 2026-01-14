"use client";

import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";

// 7 itens de navegação seguindo a regra de negócio
const navItems = [
    { label: "Manifesto", href: "#manifesto" },
    { label: "Radar", href: "#radar" },
    { label: "Biblioteca", href: "#biblioteca" },
    { label: "Newsletter", href: "#newsletter" },
    { label: "Stack", href: "#stack" },
    { label: "Comunidade", href: "#comunidade" },
    { label: "Contato", href: "#contato" },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 left-0 right-0 z-50 glass-navbar safe-area-top">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <a
                        href="/"
                        className="flex items-center gap-2 text-white font-bold text-xl md:text-2xl tracking-tight"
                    >
                        <span className="inline-flex">
                            <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                PP7IA
                            </span>
                            <span className="text-white tracking-normal">.portal</span>
                        </span>
                    </a>

                    {/* Desktop Navigation - 7 Links (Centered) */}
                    <nav
                        className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
                        aria-label="Navegação principal"
                    >
                        {navItems.map(item => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="px-3 py-2 text-sm text-text-secondary hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/5"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* CTA Button */}
                    <div className="hidden md:flex items-center gap-4">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm rounded-full shadow-glow-green hover:scale-105 transition-transform duration-200 touch-target">
                            <Sparkles className="w-4 h-4" />
                            <span>Quero Fazer Parte</span>
                        </button>
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
                    {navItems.map((item, index) => (
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
                    ))}

                    {/* Mobile CTA */}
                    <div className="pt-4 px-4">
                        <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm rounded-full shadow-glow-green active:scale-95 transition-transform duration-200 touch-target">
                            <Sparkles className="w-4 h-4" />
                            <span>Quero Fazer Parte</span>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
}
