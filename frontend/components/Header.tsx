"use client";

import { useAuth } from "@/context/AuthContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSearchModal } from "@/context/SearchModalContext";
import { portalContentClass } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { ArrowUpRight, LogOut, Menu, Plus, Search, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AuthModal from "./AuthModal";
import AnnouncementBarWrapper from "./AnnouncementBarWrapper";

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
}

const navItems: NavItem[] = [
    { label: "7 IAs",      href: "/#ias"       },
    { label: "7 Blocos",   href: "/explorar"   },
    { label: "Quem somos", href: "/quem-somos" },
    { label: "O autor",    href: "/autor"      },
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
    const pathname = usePathname();
    const isHome = pathname === "/";
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
                <div className={portalContentClass}>
                    <div className="flex h-16 items-center md:h-20 min-[1108px]:grid min-[1108px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[1108px]:items-center min-[1108px]:gap-6">

                        {/* Logo */}
                        <Link
                            href="/"
                            className="group flex flex-1 items-start gap-1 leading-none font-editorial min-[1108px]:flex-none"
                        >
                            <div className="flex flex-col items-stretch gap-[3px]">
                                <span className="text-[2rem] lg:text-[2.8rem] font-semibold tracking-[-0.03em] text-ink">PP7</span>
                                <span className="h-[3px] w-full rounded-full bg-amber-600" />
                            </div>
                            <Plus className="mt-[7px] lg:mt-[9px] shrink-0 text-primary w-[18px] h-[18px] lg:w-[26px] lg:h-[26px]" strokeWidth={2.0} />
                            <div className="flex flex-col items-start gap-[3px]">
                                <span className="text-[2rem] lg:text-[2.8rem] font-semibold tracking-[0.06em] text-ink">IAS</span>
                                <span className="h-[3px] w-[95%] rounded-full bg-primary" />
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav
                            className="nav-desktop-1108 hidden items-center justify-center gap-6"
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
                        <div className="nav-desktop-1108 hidden items-center justify-end gap-3">
                            {isLoading ? (
                                <div className="h-8 w-24 animate-pulse rounded-full bg-border" />
                            ) : user ? (
                                <>
                                    <Link
                                        href="/user"
                                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30"
                                    >
                                        <span className="flex size-5 items-center justify-center rounded-md bg-ink font-serif text-[10px] text-background">
                                            {initial}
                                        </span>
                                        {firstName}
                                    </Link>
                                    <button
                                        onClick={openInviteModal}
                                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        <UserPlus className="size-3.5" />
                                        Convidar
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="text-sm text-muted-foreground transition-colors hover:text-red-500"
                                    >
                                        Sair
                                    </button>

                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setAuthInitialMode("login"); setIsAuthModalOpen(true); }}
                                        className="px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => { setAuthInitialMode("signup"); setIsAuthModalOpen(true); }}
                                        className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition-all hover:bg-primary"
                                    >
                                        Quero fazer parte
                                        <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </button>

                                </>
                            )}
                        </div>

                        {/* Mobile right side */}
                        <div className="nav-mobile-1108 flex flex-1 items-center justify-end gap-2">
                            {isLoading ? (
                                <div className="h-7 w-16 animate-pulse rounded-full bg-border" />
                            ) : user ? (
                                <>
                                    <Link
                                        href="/user"
                                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground/30"
                                    >
                                        <span className="flex size-4 items-center justify-center rounded bg-ink font-serif text-[9px] text-background">
                                            {initial}
                                        </span>
                                        <span className="max-w-[60px] truncate">{firstName}</span>
                                    </Link>
                                    <button
                                        onClick={openInviteModal}
                                        className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                                        aria-label="Convidar alguém"
                                    >
                                        <UserPlus className="size-3.5" />
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors hover:text-red-500"
                                        aria-label="Sair"
                                    >
                                        <LogOut className="size-3.5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => { setAuthInitialMode("login"); setIsAuthModalOpen(true); }}
                                        className="btn-mobile-auth sm:hidden rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => { setAuthInitialMode("login"); setIsAuthModalOpen(true); }}
                                        className="hidden sm:block px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
                                    >
                                        Entrar
                                    </button>
                                    <button
                                        onClick={() => { setAuthInitialMode("signup"); setIsAuthModalOpen(true); }}
                                        className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition-all hover:bg-primary"
                                    >
                                        Quero fazer parte
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="touch-target p-2 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                            >
                                {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={cn(
                        "nav-mobile-1108 overflow-hidden transition-all duration-300 ease-in-out",
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
