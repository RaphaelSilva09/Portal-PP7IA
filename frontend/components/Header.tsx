"use client";

import { useAuth } from "@/context/AuthContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSearchModal } from "@/context/SearchModalContext";
import { LogOut, Menu, Search, Sparkles, User as UserIcon, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "./AuthModal";
import AnnouncementBarWrapper from "./AnnouncementBarWrapper";

// Tipo para os itens de navegação
interface NavItem {
    label: string;
    href: string;
    isExternal?: boolean;
    isModal?: boolean;
    showWhen?: "always" | "loggedIn" | "loggedOut";
}

const navItems: NavItem[] = [
    { label: "Quem Somos",   href: "/#quemsomos",      showWhen: "loggedOut" },
    { label: "O Autor",      href: "/#autor",           showWhen: "loggedOut" },
    { label: "Novidades",    href: "/#novidades"                               },
    { label: "Os 7 blocos",  href: "/#indice"                                 },
    { label: "As 7 IAs",     href: "/#ias-parceiras"                          },
    { label: "Contato",      href: "/#footer"                                 },
    // { label: "Índice", href: "#", isModal: true },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { openModal } = useSearchModal();
    const { openModal: openInviteModal } = useInviteModal();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialMode, setAuthInitialMode] = useState<"login" | "signup">("login");
    const { user, signOut, isLoading } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        setIsMenuOpen(false);
        router.push("/");
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!href.startsWith("/#")) return;

        const element = document.getElementById(href.slice(2));

        if (element) {
            // Se o elemento existe na página atual, faz scroll suave
            e.preventDefault();
            const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
            // Adiciona padding adequado: 16px para mobile, 32px para desktop
            const offset = window.innerWidth < 768 ? 16 : 32;

            window.scrollTo({
                top: element.getBoundingClientRect().top + window.scrollY - headerHeight - offset,
                behavior: "smooth",
            });
        }
        // Se o elemento não existe, deixa o link navegar normalmente para "/#section"
    };

    return (
        <>
        <header className="sticky top-0 left-0 right-0 z-50 glass-navbar backdrop-blur-[20px] bg-bg-primary/90 safe-area-top">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16 md:h-20">
                    {/* Logo */}
                    <a
                        href="/"
                        className="flex-1 flex items-center gap-2 text-white font-bold text-xl md:text-2xl tracking-tight"
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
                        className="nav-desktop-1108 hidden items-center justify-center flex-1 gap-6"
                        aria-label="Navegação principal"
                    >
                        {navItems.filter(item => {
                            if (item.showWhen === "loggedIn") return !!user;
                            if (item.showWhen === "loggedOut") return !user;
                            return true;
                        }).map(item =>
                            item.isModal ? (
                                <button
                                    key={item.label}
                                    onClick={() => openModal()}
                                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors cursor-pointer duration-200 whitespace-nowrap"
                                >
                                    <span>{item.label}</span>
                                    <Search className="w-3.5 h-3.5" />
                                </button>
                            ) : item.href.startsWith("/#") ? (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={e => !item.isExternal && scrollToSection(e, item.href)}
                                    className="text-sm text-text-secondary hover:text-white transition-colors duration-200 whitespace-nowrap"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm text-text-secondary hover:text-white transition-colors duration-200 whitespace-nowrap"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </nav>

                    {/* CTA or User Section */}
                    <div className="nav-desktop-1108 hidden flex-1 items-center justify-end gap-2">
                        {isLoading ? (
                            <div className="w-24 h-9 bg-white/5 rounded-full animate-pulse" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/user"
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-white font-semibold text-sm rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span>{user.nome.split(" ")[0]}</span>
                                </Link>
                                <button
                                    onClick={openInviteModal}
                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-text-secondary hover:text-white font-semibold text-sm rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Convidar</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 font-semibold text-sm rounded-full border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sair</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("login");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="px-4 py-2 text-text-secondary hover:text-white font-semibold text-sm rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                >
                                    Entrar
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("signup");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200"
                                >
                                    <span>Quero Fazer Parte</span>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Auth Buttons + Menu Button */}
                    <div className="nav-mobile-1108 flex items-center justify-end gap-2 flex-1">
                        {isLoading ? (
                            <div className="w-16 h-7 bg-white/5 rounded-full animate-pulse" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/user"
                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:text-white font-semibold text-xs rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                >
                                    <UserIcon className="w-3.5 h-3.5" />
                                    <span className="max-w-[60px] truncate">{user.nome.split(" ")[0]}</span>
                                </Link>
                                <button
                                    onClick={openInviteModal}
                                    className="cursor-pointer p-1.5 text-text-secondary hover:text-white hover:bg-blue-500/10 rounded-full border border-white/10 hover:border-blue-500/50 transition-all duration-200"
                                    aria-label="Convidar alguém"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="cursor-pointer p-1.5 text-red-400 hover:text-red-300 rounded-full border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200"
                                    aria-label="Sair"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Mobile only: single button */}
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("login");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="btn-mobile-auth sm:hidden cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:scale-95 transition-all duration-200"
                                >
                                    Entrar
                                </button>
                                {/* Tablet: both buttons */}
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("login");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="hidden sm:block px-4 py-2 text-text-secondary hover:text-white font-semibold text-sm rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
                                >
                                    Entrar
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("signup");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200"
                                >
                                    <span>Quero Fazer Parte</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-text-secondary hover:text-white transition-colors touch-target"
                            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - 7 Links */}
            <div
                className={`nav-mobile-1108 transition-all duration-300 ease-in-out overflow-hidden ${
                    isMenuOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav
                    className="px-4 py-4 space-y-1 bg-bg-primary/95 border-t border-border-glass"
                    aria-label="Navegação mobile"
                >
                    {navItems.filter(item => {
                            if (item.showWhen === "loggedIn") return !!user;
                            if (item.showWhen === "loggedOut") return !user;
                            return true;
                        }).map((item, index) =>
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
                        ) : item.href.startsWith("/#") ? (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={e => {
                                    setIsMenuOpen(false);
                                    !item.isExternal && scrollToSection(e, item.href);
                                }}
                                className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 touch-target"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-xs text-brand-blue font-mono">0{index + 1}</span>
                                <span className="font-medium">{item.label}</span>
                            </a>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 touch-target"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-xs text-brand-blue font-mono">0{index + 1}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ),
                    )}
                </nav>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authInitialMode}
            />
        </header>
        <AnnouncementBarWrapper />
        </>
    );
}
