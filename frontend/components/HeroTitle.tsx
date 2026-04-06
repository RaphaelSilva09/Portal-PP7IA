"use client";

export default function HeroTitle() {
    return (
        <div className="flex items-center justify-center gap-2 md:gap-4">
            {/* Container de Texto com a Fonte Configurada */}
            <h1 className="flex items-center text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter select-none font-sans">
                {/* Parte 1: PP7 (Azul com Glow) */}
                <span className="text-brand-blue">PP</span>
                <span className="text-brand-blue">7</span>

                {/* Separador: Pontos Pulsantes */}
                <div className="flex gap-2 md:gap-3 px-2 md:px-4 items-center h-full pt-2 md:pt-4">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-purple-500 animate-pulse"></div>
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-fuchsia-500 animate-pulse" style={{ animationDelay: "75ms" }}></div>
                </div>

                {/* Parte 2: + (Gradiente Purple-Pink + Glow) */}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-500 to-pink-500">
                    +
                </span>

                {/* Separador 2: Pontos Invertidos */}
                <div className="flex gap-2 md:gap-3 px-2 md:px-4 items-center h-full pt-2 md:pt-4">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-fuchsia-500 animate-pulse" style={{ animationDelay: "75ms" }}></div>
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: "150ms" }}></div>
                </div>

                {/* Parte 3: IAS) */}
                <span className="text-brand-blue">IAS</span>
            </h1>
        </div>
    );
}
