"use client";

import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSearchModal } from "@/context/SearchModalContext";
import { THEME_ICONS, THEME_LABEL, useThemeCycle } from "@/hooks/useThemeCycle";
import { usePortalFontScale } from "@/hooks/usePortalFontScale";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Bookmark, ChevronDown, LogOut, Menu, Plus, Search, Type, User, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AnnouncementBarWrapper from "./AnnouncementBarWrapper";
import ThemeToggle from "./ThemeToggle";

/**
 * Item de tema dentro do dropdown do perfil (mobile, logado) — versão
 * diferente do botão de header: linha de menu que cicla claro→sépia→escuro.
 * Não fecha o dropdown ao clicar, para permitir alternar mais de uma vez.
 */
function MobileThemeMenuItem() {
    const { current, cycleTheme } = useThemeCycle();
    const Icon = THEME_ICONS[current];

    return (
        <button
            type="button"
            role="menuitem"
            onClick={cycleTheme}
            className="flex w-full items-center justify-between gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
        >
            <span className="flex items-center gap-2.5">
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                Tema
            </span>
            <span className="text-xs text-muted-foreground">{THEME_LABEL[current]}</span>
        </button>
    );
}

const typographyStepButtonClass =
    "inline-flex size-6 items-center justify-center rounded-sm border border-border text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

/**
 * Item de tipografia dentro do dropdown do perfil (desktop e mobile) — A−/A+
 * aumentam/diminuem 5% por clique, com limites. A aplicação real no
 * documento é feita pelo PortalTypographyEffect (montado uma vez na raiz);
 * este item só lê/dispara.
 */
function PortalTypographyMenuItem() {
    const { scale, increase, decrease, canIncrease, canDecrease, mounted } = usePortalFontScale();

    return (
        <div role="group" aria-label="Tamanho da fonte do portal" className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm text-foreground">
            <span className="flex items-center gap-2.5">
                <Type className="size-4 text-muted-foreground" aria-hidden="true" />
                Tipografia
            </span>
            <span className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={decrease}
                    disabled={!canDecrease}
                    aria-label="Diminuir tamanho da fonte do portal"
                    className={typographyStepButtonClass}
                >
                    A−
                </button>
                <span className="min-w-9 text-center text-xs tabular-nums text-muted-foreground">
                    {mounted ? `${Math.round(scale * 100)}%` : ""}
                </span>
                <button
                    type="button"
                    onClick={increase}
                    disabled={!canIncrease}
                    aria-label="Aumentar tamanho da fonte do portal"
                    className={typographyStepButtonClass}
                >
                    A+
                </button>
            </span>
        </div>
    );
}

const AUTO_HIDE_TOP_REVEAL_THRESHOLD_PX = 24;
const AUTO_HIDE_MIN_SCROLL_TO_HIDE_PX = 140;
const AUTO_HIDE_DOWNWARD_TRIGGER_PX = 18;
const AUTO_HIDE_UPWARD_REVEAL_PX = 40;
const AUTO_HIDE_SCROLL_NOISE_THRESHOLD_PX = 2;

interface NavItem {
    label: string;
    href: string;
    isExternal?: boolean;
    isModal?: boolean;
    showWhen?: "always" | "loggedIn" | "loggedOut";
    onlyOnHome?: boolean;
}

interface NavbarProps {
    autoHideOnScroll?: boolean;
    /** Notificado a cada troca de `isAutoHidden` — permite que barras sticky externas (ex.: `ViewContentFrame`) acompanhem o header ao sumir/voltar. */
    onAutoHiddenChange?: (hidden: boolean) => void;
}

const navItems: NavItem[] = [
    { label: "7 IAs",      href: "/#ias"       },
    { label: "7 Blocos",   href: "/explorar"   },
    { label: "Quem somos", href: "/quem-somos" },
    { label: "O autor",    href: "/autor"      },
];

export default function Navbar({ autoHideOnScroll = false, onAutoHiddenChange }: NavbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [isDesktopProfileMenuOpen, setIsDesktopProfileMenuOpen] = useState(false);
    const desktopProfileMenuRef = useRef<HTMLDivElement>(null);
    const [isAutoHidden, setIsAutoHidden] = useState(false);
    const { openModal } = useSearchModal();
    const { openModal: openInviteModal } = useInviteModal();
    const { openModal: openAuthModal } = useAuthModal();
    const { user, signOut, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isHome = pathname === "/";
    const lastScrollYReference = useRef(0);

    const upwardDistanceReference = useRef(0);
    const downwardDistanceReference = useRef(0);

    // Esc fecha o menu mobile (mesma convenção dos diálogos)
    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsMenuOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isMenuOpen]);

    // Dropdown do perfil (mobile): clique fora ou Esc fecha
    useEffect(() => {
        if (!isProfileMenuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsProfileMenuOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [isProfileMenuOpen]);

    // Dropdown do perfil (desktop): clique fora ou Esc fecha
    useEffect(() => {
        if (!isDesktopProfileMenuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (desktopProfileMenuRef.current && !desktopProfileMenuRef.current.contains(e.target as Node)) {
                setIsDesktopProfileMenuOpen(false);
            }
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsDesktopProfileMenuOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [isDesktopProfileMenuOpen]);

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

            if (Math.abs(delta) < AUTO_HIDE_SCROLL_NOISE_THRESHOLD_PX) return;

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
                if (currentScrollY >= AUTO_HIDE_MIN_SCROLL_TO_HIDE_PX && downwardDistanceReference.current >= AUTO_HIDE_DOWNWARD_TRIGGER_PX) {
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
            if (animationFrameId !== null) return;
            animationFrameId = window.requestAnimationFrame(updateVisibility);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId);
        };
    }, [autoHideOnScroll]);

    useEffect(() => {
        onAutoHiddenChange?.(autoHideOnScroll && isAutoHidden);
    }, [autoHideOnScroll, isAutoHidden, onAutoHiddenChange]);

    const handleLogout = async () => {
        await signOut();
        setIsMenuOpen(false);
        router.push("/");
    };

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!href.startsWith("/#")) return;
        const element = document.getElementById(href.slice(2));
        if (element) {
            e.preventDefault();
            const headerHeight = document.querySelector("header")?.offsetHeight ?? 0;
            const announcementHeight = (document.querySelector('[role="alert"]') as HTMLElement | null)?.offsetHeight ?? 0;
            const offset = window.innerWidth < 768 ? 16 : 32;
            window.scrollTo({
                top: element.getBoundingClientRect().top + window.scrollY - headerHeight - announcementHeight - offset,
                behavior: "smooth",
            });
        }
    };

    const filteredNav = navItems.filter(item => {
        if (item.onlyOnHome && !isHome) return false;
        if (item.showWhen === "loggedIn") return !!user;
        if (item.showWhen === "loggedOut") return !user;
        return true;
    });

    const firstName = user?.nome.split(" ")[0] ?? "";
    const initial = user?.nome[0].toUpperCase() ?? "";

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 safe-area-top border-b border-border/60 bg-background/90 backdrop-blur-md transition-transform duration-300 ease-out will-change-transform",
                    autoHideOnScroll && (isAutoHidden ? "-translate-y-full" : "translate-y-0"),
                )}
            >
                <a
                    href="#conteudo"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
                >
                    Pular para o conteúdo
                </a>
                <div className={portalContentClass}>
                    <div className="flex h-16 items-center md:h-20 min-[960px]:grid min-[960px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[960px]:items-center min-[960px]:gap-6">

                        {/* Logo */}
                        <Link
                            href="/"
                            className="group flex flex-1 items-start gap-1 leading-none font-editorial min-[960px]:flex-none"
                        >
                            <div className="flex flex-col items-stretch gap-[3px]">
                                <span className="text-[1.72rem] sm:text-[2rem] lg:text-[2.8rem] font-semibold tracking-[-0.03em] text-ink">PP7</span>
                                <span className="h-[3px] w-full rounded-full bg-amber-600" />
                            </div>
                            <Plus className="mt-[6px] sm:mt-[7px] lg:mt-[9px] shrink-0 text-primary w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] lg:w-[26px] lg:h-[26px]" strokeWidth={2.0} />
                            <div className="flex flex-col items-start gap-[3px]">
                                <span className="text-[1.72rem] sm:text-[2rem] lg:text-[2.8rem] font-semibold tracking-[0.06em] text-ink">IAS</span>
                                <span className="h-[3px] w-[95%] rounded-full bg-primary" />
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav
                            className="nav-desktop-960 hidden items-center justify-center gap-6"
                            aria-label="Navegação principal"
                        >
                            {filteredNav.map(item =>
                                item.isModal ? (
                                    <button
                                        key={item.label}
                                        onClick={() => openModal()}
                                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {item.label}
                                        <Search className="size-3.5" />
                                    </button>
                                ) : item.href.startsWith("/#") ? (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={e => !item.isExternal && scrollToSection(e, item.href)}
                                        className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {item.label}
                                    </Link>
                                ),
                            )}
                        </nav>

                        {/* Desktop CTA / User */}
                        <div className="nav-desktop-960 hidden items-center justify-end gap-3">
                            <ThemeToggle />
                            {isLoading ? (
                                <div className="h-8 w-24 animate-pulse rounded-full bg-border" />
                            ) : user ? (
                                <div ref={desktopProfileMenuRef} className="relative">
                                    <button
                                        onClick={() => setIsDesktopProfileMenuOpen(v => !v)}
                                        className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
                                        aria-haspopup="menu"
                                        aria-expanded={isDesktopProfileMenuOpen}
                                        aria-label={`Abrir menu do perfil de ${firstName}`}
                                    >
                                        <span className="flex size-5 items-center justify-center rounded-md bg-ink font-serif text-[10px] text-background">
                                            {initial}
                                        </span>
                                        {firstName}
                                        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", isDesktopProfileMenuOpen && "rotate-180")} />
                                    </button>

                                    {isDesktopProfileMenuOpen && (
                                        <div
                                            role="menu"
                                            aria-label="Opções do perfil"
                                            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-background py-1.5 shadow-[var(--shadow-elevated)]"
                                        >
                                            <Link
                                                role="menuitem"
                                                href="/user"
                                                onClick={() => setIsDesktopProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                                            >
                                                <User className="size-4 text-muted-foreground" aria-hidden="true" />
                                                Meu Perfil
                                            </Link>
                                            <Link
                                                role="menuitem"
                                                href="/salvos"
                                                onClick={() => setIsDesktopProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                                            >
                                                <Bookmark className="size-4 text-muted-foreground" aria-hidden="true" />
                                                Salvos
                                            </Link>
                                            <button
                                                role="menuitem"
                                                onClick={() => { setIsDesktopProfileMenuOpen(false); openInviteModal(); }}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                                            >
                                                <UserPlus className="size-4 text-muted-foreground" aria-hidden="true" />
                                                Convidar
                                            </button>
                                            <button
                                                role="menuitem"
                                                onClick={() => { setIsDesktopProfileMenuOpen(false); handleLogout(); }}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                                            >
                                                <LogOut className="size-4" aria-hidden="true" />
                                                Sair
                                            </button>

                                            <div className="my-1.5 border-t border-border/60" role="separator" />

                                            <PortalTypographyMenuItem />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => openAuthModal({}, "login")}
                                        className="px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => openAuthModal({}, "signup")}
                                        className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition hover:bg-primary"
                                    >
                                        Quero fazer parte
                                        <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </button>

                                </>
                            )}
                        </div>

                        {/* Mobile right side */}
                        <div className="nav-mobile-960 flex flex-1 items-center justify-end gap-2">
                            {/* Logado: tema some da linha do header e vira item no dropdown do perfil */}
                            {!isLoading && !user && <ThemeToggle />}
                            {isLoading ? (
                                <div className="h-7 w-16 animate-pulse rounded-full bg-border" />
                            ) : user ? (
                                <div ref={profileMenuRef} className="relative">
                                    <button
                                        onClick={() => { setIsProfileMenuOpen(v => !v); setIsMenuOpen(false); }}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/30"
                                        aria-haspopup="menu"
                                        aria-expanded={isProfileMenuOpen}
                                        aria-label={`Abrir menu do perfil de ${firstName}`}
                                    >
                                        <span className="flex size-4 items-center justify-center rounded bg-ink font-serif text-[9px] text-background">
                                            {initial}
                                        </span>
                                        <span className="max-w-[60px] truncate">{firstName}</span>
                                        <ChevronDown className={cn("size-3 text-muted-foreground transition-transform", isProfileMenuOpen && "rotate-180")} />
                                    </button>

                                    {isProfileMenuOpen && (
                                        <div
                                            role="menu"
                                            aria-label="Opções do perfil"
                                            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-background py-1.5 shadow-[var(--shadow-elevated)]"
                                        >
                                            <Link
                                                role="menuitem"
                                                href="/user"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                                            >
                                                <User className="size-4 text-muted-foreground" aria-hidden="true" />
                                                Meu Perfil
                                            </Link>
                                            <Link
                                                role="menuitem"
                                                href="/salvos"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                                            >
                                                <Bookmark className="size-4 text-muted-foreground" aria-hidden="true" />
                                                Salvos
                                            </Link>
                                            <button
                                                role="menuitem"
                                                onClick={() => { setIsProfileMenuOpen(false); openInviteModal(); }}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent/50"
                                            >
                                                <UserPlus className="size-4 text-muted-foreground" aria-hidden="true" />
                                                Convidar
                                            </button>
                                            <button
                                                role="menuitem"
                                                onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }}
                                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                                            >
                                                <LogOut className="size-4" aria-hidden="true" />
                                                Sair
                                            </button>

                                            <div className="my-1.5 border-t border-border/60" role="separator" />

                                            <MobileThemeMenuItem />
                                            <PortalTypographyMenuItem />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => openAuthModal({}, "login")}
                                        className="btn-mobile-auth sm:hidden rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => openAuthModal({}, "login")}
                                        className="hidden sm:block px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => openAuthModal({}, "signup")}
                                        className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition hover:bg-primary"
                                    >
                                        Quero fazer parte
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => { setIsMenuOpen(!isMenuOpen); setIsProfileMenuOpen(false); }}
                                className="touch-target p-2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={cn(
                        "nav-mobile-960 overflow-hidden transition duration-300 ease-in-out",
                        isMenuOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0",
                    )}
                >
                    <div className="border-t border-border/60 bg-background/95">
                        <nav className={`${portalContentClass} space-y-0.5 py-4`} aria-label="Navegação mobile">
                            {filteredNav.map((item, index) =>
                                item.isModal ? (
                                    <button
                                        key={item.label}
                                        onClick={() => { setIsMenuOpen(false); openModal(); }}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                                    >
                                        <span className="w-5 font-serif text-xs text-primary">0{index + 1}</span>
                                        <span className="font-medium">{item.label}</span>
                                        <Search className="ml-auto size-3.5" />
                                    </button>
                                ) : item.href.startsWith("/#") ? (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={e => { setIsMenuOpen(false); if (!item.isExternal) scrollToSection(e, item.href); }}
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                                    >
                                        <span className="w-5 font-serif text-xs text-primary">0{index + 1}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </a>
                                ) : (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
                                    >
                                        <span className="w-5 font-serif text-xs text-primary">0{index + 1}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                ),
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Scrim do menu mobile: clique fora fecha; fica sob o header (z-40 < z-50) */}
            {isMenuOpen && (
                <div
                    className="nav-mobile-960 fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

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
