"use client";

import type { EditorialSlug } from "@/constants/editorials";
import Link from "next/link";
import { ArrowRight, Compass, RefreshCw, type LucideIcon } from "lucide-react";
import TopoSvg from "@/assets/topo.svg";
import { useAuthModal } from "@/context/AuthModalContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSession } from "@/context/SessionContext";
import { portalContentClass } from "@/lib/layout";
import { useEditorial } from "@/presentation/hooks/useEditorial";
import { useTheme } from "next-themes";
import HeroTitle from "./HeroTitle";
import PortalNewsWidget from "./PortalNewsWidget";

interface EditorialCardMeta {
    contextLabel: string;
    icon: LucideIcon;
    lightCardClass: string;
    darkCardClass: string;
    lightIconClass: string;
    darkIconClass: string;
    lightDividerClass: string;
    darkDividerClass: string;
    lightCtaClass: string;
    darkCtaClass: string;
}

const EDITORIAL_CARD_META: Record<EditorialSlug, EditorialCardMeta> = {
    "primeiros-usuarios": {
        contextLabel: "Para quem está chegando agora",
        icon: Compass,
        lightCardClass: "border-[#bfd6ff] bg-[#edf5ff] hover:border-[#93c5fd] hover:bg-[#e6f0ff]",
        darkCardClass: "border-cyan-400/20 bg-cyan-400/[0.04] hover:border-cyan-300/35 hover:bg-cyan-400/[0.06]",
        lightIconClass: "border-slate-300 bg-white text-slate-900",
        darkIconClass: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
        lightDividerClass: "bg-blue-700",
        darkDividerClass: "bg-cyan-400/80",
        lightCtaClass: "border-blue-300 bg-white text-slate-950 hover:bg-blue-50",
        darkCtaClass: "border-cyan-400/25 bg-cyan-400/10 text-cyan-50 hover:bg-cyan-400/15",
    },
    semanais: {
        contextLabel: "Para quem acompanha o portal",
        icon: RefreshCw,
        lightCardClass: "border-[#ddccff] bg-[#f5efff] hover:border-[#c4b5fd] hover:bg-[#f0e8ff]",
        darkCardClass: "border-fuchsia-400/20 bg-fuchsia-400/[0.04] hover:border-fuchsia-300/35 hover:bg-fuchsia-400/[0.06]",
        lightIconClass: "border-slate-300 bg-white text-slate-900",
        darkIconClass: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-100",
        lightDividerClass: "bg-violet-700",
        darkDividerClass: "bg-fuchsia-400/80",
        lightCtaClass: "border-violet-300 bg-white text-slate-950 hover:bg-violet-50",
        darkCtaClass: "border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-50 hover:bg-fuchsia-400/15",
    },
};

export default function HeroSection() {
    const { user } = useSession();
    const { openModal: openInviteModal } = useInviteModal();
    const { openModal: openAuthModal } = useAuthModal();
    const { resolvedTheme } = useTheme();
    const { editorials, isLoading: isLoadingEditorials } = useEditorial();
    const hasAvailableEditorial = editorials.some(editorial => editorial.available);
    const isLight = resolvedTheme === "light";

    const handleIndicacaoClick = () => {
        if (user) {
            openInviteModal();
        } else {
            openAuthModal();
        }
    };

    const handleEntrarClick = () => {
        openAuthModal({}, "login");
    };

    const handleCadastroClick = () => {
        openAuthModal({}, "signup");
    };

    return (
        <section
            id="hero"
            className="relative flex items-center justify-center overflow-hidden pt-6 pb-4 sm:pt-8 sm:pb-8 md:pt-12 md:pb-12 lg:pt-16"
        >
            <div
                className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.05]"
                style={{
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 10%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 40%, black 50%, transparent 100%)",
                }}
            >
                <TopoSvg className="h-full w-full" preserveAspectRatio="xMidYMax slice" />
            </div>

            <div
                className="inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "center center",
                }}
            />

            <div className={portalContentClass}>
                <div className="relative z-10 w-full text-center">
                    <div
                        id="manifesto"
                        className="mb-3 animate-fade-in-up sm:mb-4 md:mb-5"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <HeroTitle />
                    </div>

                    <p
                        className="mb-3 text-lg font-medium text-brand-blue animate-fade-in-up sm:mb-4 sm:text-xl md:mb-5 md:text-2xl"
                        style={{ animationDelay: "0.2s" }}
                    >
                        Para Líderes, inovadores, profissionais e iniciantes
                    </p>

                    <p
                        className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-text-secondary animate-fade-in-up sm:mb-7 sm:text-2xl md:mb-8"
                        style={{ animationDelay: "0.3s" }}
                    >
                        Menos ruído, mais clareza. Conhecimento e IA acessível para todos.
                    </p>

                    <div className="mb-5 flex flex-wrap justify-center gap-3">
                        {!user && (
                            <>
                                <button
                                    onClick={handleEntrarClick}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 px-7 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(29,78,216,0.35)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(29,78,216,0.5)]"
                                    aria-label="Fazer login"
                                >
                                    Entrar
                                </button>
                                <button
                                    onClick={handleCadastroClick}
                                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 px-7 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(29,78,216,0.35)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(29,78,216,0.5)]"
                                    aria-label="Cadastrar"
                                >
                                    Cadastrar
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleIndicacaoClick}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 px-7 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(29,78,216,0.35)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(29,78,216,0.5)]"
                            aria-label="Indicar alguém"
                        >
                            Indicar
                        </button>
                    </div>

                    <PortalNewsWidget />

                    {hasAvailableEditorial && (
                        <div
                            className={`mx-2 mb-6 rounded-3xl px-5 py-5 text-left shadow-sm backdrop-blur-sm sm:px-6 sm:py-6 ${
                                isLight
                                    ? "border border-[#d7e3f7] bg-[#f8fbff]"
                                    : "border border-white/10 bg-white/[0.03]"
                            }`}
                        >
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div>
                                    <h3 className={`text-lg font-semibold sm:text-xl ${isLight ? "text-black" : "text-white"}`}>Editorial</h3>
                                    <p className={`mt-1 text-sm leading-relaxed ${isLight ? "text-slate-800" : "text-slate-300"}`}>
                                        Escolha um dos dois editoriais disponíveis no portal para ler.
                                    </p>
                                </div>

                                {isLoadingEditorials && (
                                    <span className={`text-xs ${isLight ? "text-slate-600" : "text-slate-400"}`}>Atualizando...</span>
                                )}
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {editorials.map(editorial => {
                                    const meta = EDITORIAL_CARD_META[editorial.slug];
                                    const Icon = meta.icon;
                                    const cardClass = isLight ? meta.lightCardClass : meta.darkCardClass;
                                    const iconClass = isLight ? meta.lightIconClass : meta.darkIconClass;
                                    const dividerClass = isLight ? meta.lightDividerClass : meta.darkDividerClass;
                                    const actionClass = editorial.available
                                        ? `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${isLight ? meta.lightCtaClass : meta.darkCtaClass}`
                                        : `inline-flex cursor-not-allowed items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                                            isLight
                                                ? "border-slate-300 bg-slate-100 text-slate-600"
                                                : "border-white/10 bg-white/5 text-slate-500"
                                        }`;
                                    const cardContent = (
                                        <div className="flex h-full flex-col">
                                            <span className={`mb-4 h-1 w-12 rounded-full ${dividerClass}`} />

                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${iconClass}`}>
                                                    <Icon className="h-4.5 w-4.5" />
                                                </div>

                                                <div>
                                                    <h4 className={`text-lg font-semibold sm:text-xl ${isLight ? "text-black" : "text-white"}`}>{editorial.title}</h4>
                                                    <p className={`text-xs ${isLight ? "text-slate-700" : "text-slate-300"}`}>{meta.contextLabel}</p>
                                                </div>
                                            </div>

                                            <p className={`mt-4 text-sm leading-relaxed ${isLight ? "text-slate-800" : "text-slate-300"}`}>{editorial.description}</p>

                                            <div className="mt-auto pt-5">
                                                {editorial.available ? (
                                                    <div className={actionClass}>
                                                        {editorial.ctaLabel}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                ) : (
                                                    <button type="button" disabled className={actionClass}>
                                                        Indisponível no momento
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );

                                    if (editorial.available) {
                                        return (
                                            <Link
                                                key={editorial.slug}
                                                href={editorial.href}
                                                className={`group rounded-2xl border p-5 transition-colors duration-200 sm:p-6 ${cardClass}`}
                                            >
                                                {cardContent}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <article
                                            key={editorial.slug}
                                            className={`rounded-2xl border p-5 sm:p-6 ${cardClass}`}
                                        >
                                            {cardContent}
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
