"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSession } from "@/context/SessionContext";
import TopoSvg from "@/public/topo.svg";
import HeroTitle from "./HeroTitle";

export default function HeroSection() {
    const { session } = useSession();
    const { openInviteModal } = useInviteModal();
    const { openAuthModal } = useAuthModal();

    const handleIndicacaoClick = () => {
        if (session) {
            openInviteModal();
        } else {
            openAuthModal();
        }
    };

    const handleEntrarClick = () => {
        openAuthModal();
    };

    return (
        <section
            id="hero"
            className="relative flex items-center justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-4 sm:pb-8 md:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
            {/* SVG Background with Fade Effect */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]"
                style={{
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 40%, black 10%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, black 40%, black 50%, transparent 100%)",
                }}
            >
                <TopoSvg className="w-full h-full" preserveAspectRatio="xMidYMax slice" />
            </div>
            {/* Grid Pattern Overlay */}
            <div
                className="inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "center center",
                }}
            />
            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center px-2 sm:px-4">
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 w-full px-2">
                    {/* Botão Instruções */}
                    <a
                        href="#instructions"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-black text-base sm:text-lg font-semibold rounded-2xl shadow-2xl border-2 border-yellow-500 hover:scale-105 transform-gpu transition-all duration-200"
                        aria-label="Abrir instruções de uso"
                    >
                        <span className="text-xl">📋</span>
                        <span>Instruções</span>
                    </a>

                    {/* Botão Indicação */}
                    <button
                        onClick={handleIndicacaoClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-black text-base sm:text-lg font-semibold rounded-2xl shadow-2xl border-2 border-yellow-500 hover:scale-105 transform-gpu transition-all duration-200"
                        aria-label="Convidar alguém para o portal"
                    >
                        <span className="text-xl">✉️</span>
                        <span>Indicação</span>
                    </button>

                    {/* Botão Entrar - apenas quando não logado */}
                    {!session && (
                        <button
                            onClick={handleEntrarClick}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-black text-base sm:text-lg font-semibold rounded-2xl shadow-2xl border-2 border-yellow-500 hover:scale-105 transform-gpu transition-all duration-200"
                            aria-label="Fazer login ou cadastro"
                        >
                            <span className="text-xl">🔑</span>
                            <span>Entrar</span>
                        </button>
                    )}
                </div>

                {/* Badge - Última Atualização */}
                <a
                    href="#newsletter"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6"
                >
                    {/* Badge */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-green-500 text-sm font-medium">
                        Última atualização: 15.02.2026 • Versão Oficial
                    </span>
                </a>

                {/* Main Title */}
                <div
                    id="manifesto"
                    className="mb-3 sm:mb-4 md:mb-5 animate-fade-in-up"
                    style={{ animationDelay: "0.1s" }}
                >
                    <HeroTitle />
                </div>

                {/* Subtitle */}
                <p
                    className="text-lg sm:text-xl md:text-2xl text-brand-blue font-medium mb-3 sm:mb-4 md:mb-5 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    Para Líderes, inovadores, profissionais e iniciantes
                </p>

                {/* Description */}
                <p
                    className="text-base sm:text-2xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-7 md:mb-8 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Menos ruído, mais clareza. Conhecimento e IA acessível para todos.
                </p>
            </div>
        </section>
    );
}
