"use client";

import { useAuth } from "@/context/AuthContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSearchModal } from "@/context/SearchModalContext";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { LogOut, Menu, Search, User as UserIcon, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthModal from "./AuthModal";
import AnnouncementBarWrapper from "./AnnouncementBarWrapper";
import ThemeToggle from "./ThemeToggle";

const AUTO_HIDE_TOP_REVEAL_THRESHOLD_PX = 24;
const AUTO_HIDE_MIN_SCROLL_TO_HIDE_PX = 140;
const AUTO_HIDE_DOWNWARD_TRIGGER_PX = 18;
const AUTO_HIDE_UPWARD_REVEAL_PX = 40;
const AUTO_HIDE_SCROLL_NOISE_THRESHOLD_PX = 2;

// Tipo para os itens de navegação
interface NavItem {
    label: string;
    href: string;
    isExternal?: boolean;
    isModal?: boolean;
    showWhen?: "always" | "loggedIn" | "loggedOut";
}

interface NavbarProps {
    autoHideOnScroll?: boolean;
}

const navItems: NavItem[] = [
    { label: "Quem Somos",   href: "/quem-somos",       showWhen: "loggedOut" },
    { label: "O Autor",      href: "/autor",             showWhen: "loggedOut" },
    { label: "Por Que 7",    href: "/por-que-7",         showWhen: "loggedOut" },
    { label: "Novidades",    href: "/#novidades"                               },
    { label: "Os 7 blocos",  href: "/#indice"                                 },
    { label: "As 7 IAs",     href: "/#ias-parceiras"                          },
    { label: "Contato",      href: "/#footer"                                 },
    // { label: "Índice", href: "#", isModal: true },
];

export default function Navbar({ autoHideOnScroll = false }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAutoHidden, setIsAutoHidden] = useState(false);
    const { openModal } = useSearchModal();
    const { openModal: openInviteModal } = useInviteModal();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialMode, setAuthInitialMode] = useState<"login" | "signup">("login");
    const { user, signOut, isLoading } = useAuth();
    const router = useRouter();
    const lastScrollYReference = useRef(0);
    const upwardDistanceReference = useRef(0);
    const downwardDistanceReference = useRef(0);

    useEffect(() => {
        if (!autoHideOnScroll) {
            setIsAutoHidden(false);
            return;
        }

        lastScrollYReference.current = window.scrollY;
        upwardDistanceReference.current = 0;
        downwardDistanceReference.current = 0;
        setIsAutoHidden(false);

        let animationFrameId: number | null = null;

        const updateVisibility = () => {
            animationFrameId = null;

            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollYReference.current;

            if (Math.abs(delta) < AUTO_HIDE_SCROLL_NOISE_THRESHOLD_PX) {
                return;
            }

            if (currentScrollY <= AUTO_HIDE_TOP_REVEAL_THRESHOLD_PX) {
                upwardDistanceReference.current = 0;
                downwardDistanceReference.current = 0;
                setIsAutoHidden(false);
                lastScrollYReference.current = currentScrollY;
                return;
            }

            if (delta > 0) {
                downwardDistanceReference.current += delta;
                upwardDistanceReference.current = 0;

                if (
                    currentScrollY >= AUTO_HIDE_MIN_SCROLL_TO_HIDE_PX
                    && downwardDistanceReference.current >= AUTO_HIDE_DOWNWARD_TRIGGER_PX
                ) {
                    setIsAutoHidden(true);
                }
            } else {
                upwardDistanceReference.current += Math.abs(delta);
                downwardDistanceReference.current = 0;

                if (upwardDistanceReference.current >= AUTO_HIDE_UPWARD_REVEAL_PX) {
                    setIsAutoHidden(false);
                }
            }

            lastScrollYReference.current = currentScrollY;
        };

        const handleScroll = () => {
            if (animationFrameId !== null) {
                return;
            }

            animationFrameId = window.requestAnimationFrame(updateVisibility);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);

            if (animationFrameId !== null) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [autoHideOnScroll]);

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
            const announcementHeight = (document.querySelector('[role="alert"]') as HTMLElement | null)?.offsetHeight ?? 0;
            // Adiciona padding adequado: 16px para mobile, 32px para desktop
            const offset = window.innerWidth < 768 ? 16 : 32;

            window.scrollTo({
                top: element.getBoundingClientRect().top + window.scrollY - headerHeight - announcementHeight - offset,
                behavior: "smooth",
            });
        }
        // Se o elemento não existe, deixa o link navegar normalmente para "/#section"
    };

        return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 glass-navbar backdrop-blur-[20px] bg-background/90 safe-area-top transition-transform duration-300 ease-out will-change-transform",
                    autoHideOnScroll && (isAutoHidden ? "-translate-y-full" : "translate-y-0"),
                )}
            >
            <div className={portalContentClass}>
                <div className="flex h-16 items-center md:h-20 min-[1108px]:grid min-[1108px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[1108px]:items-center min-[1108px]:gap-6">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex-1 flex items-center gap-2 text-foreground font-bold text-xl md:text-2xl tracking-tight min-[1108px]:flex-none"
                    >
                        <span className="inline-flex">
                            <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                PP7+IAS
                            </span>
                        </span>
                    </Link>

                    {/* Desktop Navigation - 7 Links (Centered) */}
                    <nav
                        className="nav-desktop-1108 hidden items-center justify-center gap-5"
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
                                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors cursor-pointer duration-200 whitespace-nowrap"
                                >
                                    <span>{item.label}</span>
                                    <Search className="w-3.5 h-3.5" />
                                </button>
                            ) : item.href.startsWith("/#") ? (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={e => !item.isExternal && scrollToSection(e, item.href)}
                                    className="text-sm text-text-secondary hover:text-foreground transition-colors duration-200 whitespace-nowrap"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-sm text-text-secondary hover:text-foreground transition-colors duration-200 whitespace-nowrap"
                                >
                                    {item.label}
                                </Link>
                            ),
                        )}
                    </nav>

                    {/* CTA or User Section */}
                    <div className="nav-desktop-1108 hidden items-center justify-end gap-2">
                        {isLoading ? (
                            <div className="w-24 h-9 bg-white/5 rounded-full animate-pulse" />
                        ) : user ? (
                            <>
                                <Link
                                    href="/user"
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-foreground font-semibold text-sm rounded-full border border-border hover:border-border/80 hover:bg-accent/50 transition-all duration-200"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span>{user.nome.split(" ")[0]}</span>
                                </Link>
                                <button
                                    onClick={openInviteModal}
                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-text-secondary hover:text-foreground font-semibold text-sm rounded-full border border-border hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-200"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Convidar</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-400 font-semibold text-sm rounded-full border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sair</span>
                                </button>
                                <ThemeToggle />
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("login");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="px-4 py-2 text-text-secondary hover:text-foreground font-semibold text-sm rounded-full border border-border hover:border-border/80 hover:bg-accent/50 transition-all duration-200"
                                >
                                    Entrar
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("signup");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(29,78,216,0.35)] hover:shadow-[0_0_30px_rgba(29,78,216,0.5)] hover:scale-105 transition-all duration-200"
                                >
                                    <span>Quero Fazer Parte</span>
                                </button>
                                <ThemeToggle />
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
                                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-text-secondary hover:text-foreground font-semibold text-xs rounded-full border border-border hover:border-border/80 hover:bg-accent/50 transition-all duration-200"
                                >
                                    <UserIcon className="w-3.5 h-3.5" />
                                    <span className="max-w-[60px] truncate">{user.nome.split(" ")[0]}</span>
                                </Link>
                                <button
                                    onClick={openInviteModal}
                                    className="cursor-pointer p-1.5 text-text-secondary hover:text-foreground hover:bg-blue-500/10 rounded-full border border-border hover:border-blue-500/50 transition-all duration-200"
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
                                    className="btn-mobile-auth sm:hidden cursor-pointer bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold rounded-full shadow-[0_0_20px_rgba(29,78,216,0.35)] hover:shadow-[0_0_30px_rgba(29,78,216,0.5)] active:scale-95 transition-all duration-200"
                                >
                                    Entrar
                                </button>
                                {/* Tablet: both buttons */}
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("login");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="hidden sm:block px-4 py-2 text-text-secondary hover:text-foreground font-semibold text-sm rounded-full border border-border hover:border-border/80 hover:bg-accent/50 transition-all duration-200"
                                >
                                    Entrar
                                </button>
                                <button
                                    onClick={() => {
                                        setAuthInitialMode("signup");
                                        setIsAuthModalOpen(true);
                                    }}
                                    className="hidden sm:flex items-center gap-2 px-4 py-2 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(29,78,216,0.35)] hover:shadow-[0_0_30px_rgba(29,78,216,0.5)] hover:scale-105 transition-all duration-200"
                                >
                                    <span>Quero Fazer Parte</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-text-secondary hover:text-foreground transition-colors touch-target"
                            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            {/* Mobile Menu - 7 Links */}
            <div
                    className={`nav-mobile-1108 transition-all duration-300 ease-in-out overflow-hidden ${
                    isMenuOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="border-t border-border-glass bg-background/95">
                    <nav
                        className={`${portalContentClass} space-y-1 py-4`}
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
                                    className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-foreground hover:bg-accent/50 rounded-xl transition-all duration-200 touch-target w-full"
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
                                        if (!item.isExternal) scrollToSection(e, item.href);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-foreground hover:bg-accent/50 rounded-xl transition-all duration-200 touch-target"
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
                                    className="flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-foreground hover:bg-accent/50 rounded-xl transition-all duration-200 touch-target"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <span className="text-xs text-brand-blue font-mono">0{index + 1}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ),
                        )}
                    </nav>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authInitialMode}
            />
        </header>
            <div
                className={cn(
                    "transition-[height] duration-300 ease-out",
                    autoHideOnScroll && isAutoHidden ? "h-0" : "h-16 md:h-20",
                )}
                aria-hidden="true"
            />
        <AnnouncementBarWrapper />
        </>
    );
}
