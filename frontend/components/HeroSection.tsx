"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import { useInviteModal } from "@/context/InviteModalContext";
import { useSession } from "@/context/SessionContext";
import { useHomePageDates } from "@/presentation/hooks/useHomePageDates";
import TopoSvg from "@/assets/topo.svg";
import HeroTitle from "./HeroTitle";
import PortalNewsWidget from "./PortalNewsWidget";

export default function HeroSection() {
    const { user } = useSession();
    const { openModal: openInviteModal } = useInviteModal();
    const { openModal: openAuthModal } = useAuthModal();
    const { mostRecentDate } = useHomePageDates();

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
                        Última atualização: {mostRecentDate || "—"}
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
                
                {/* Botões */}
<<<<<<< HEAD
                <div className="flex flex-wrap gap-3 justify-center mb-5">
=======
                <div className="flex flex-wrap gap-3 justify-center mb-5 pb-4 border-b border-[#b8860b]/20">
>>>>>>> 7521b8c (feat(hero): insert PortalNewsWidget and update buttons to header gradient style)
                    {!user && (
                        <>
                            <button
                                onClick={handleEntrarClick}
                                className="inline-flex items-center gap-2 px-7 py-2.5 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200"
                                aria-label="Fazer login"
                            >
                                Entrar
                            </button>
                            <button
                                onClick={handleCadastroClick}
                                className="inline-flex items-center gap-2 px-7 py-2.5 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200"
                                aria-label="Cadastrar"
                            >
                                Cadastrar
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleIndicacaoClick}
                        className="inline-flex items-center gap-2 px-7 py-2.5 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 transition-all duration-200"
                        aria-label="Indicar alguém"
                    >
                        Indicar
                    </button>
                </div>

                {/* Widget de Novidades do Portal */}
                <PortalNewsWidget />

                {/* Bloco Comece Aqui */}
                <div className="bg-[#f0c950]/6 border-2 border-[#b8860b]/40 rounded-2xl px-7 pt-7 pb-6 mb-6 mx-2 text-left">

                    {/* Título do bloco */}

                    <div className="font-bold font-sans text-[#f0c950] text-lg mb-4">Observações de Uso</div>

                    {/* Observações */}
                    <ul className="space-y-3.5 text-sm">
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 min-w-2 bg-[#f0c950] rounded-full mt-1.5" />
                            <div className="text-slate-200 leading-relaxed">
                                Se algo estiver errado, precisar de ajuda ou tiver sugestões, nos envie.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 min-w-2 bg-[#f0c950] rounded-full mt-1.5" />
                            <div className="text-slate-200 leading-relaxed">
                                Na entrada de cada bloco tem instruções específicas de uso. Acesse quando quiser. Leia
                                apenas o que fizer sentido para você.
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-2 h-2 min-w-2 bg-[#f0c950] rounded-full mt-1.5" />
                            <div className="text-slate-200 leading-relaxed">
                                Atualizações frequentes, avisadas por e-mail ou WhatsApp.
                            </div>
                        </li>
                    </ul>
                    <p className="text-[#f0c950] italic text-sm text-center mt-4">Muito obrigado e boa leitura!</p>
                </div>
            </div>
        </section>
    );
}
