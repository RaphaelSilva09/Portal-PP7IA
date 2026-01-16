"use client";

export default function HeroTitle() {
    return (
        <div className="flex items-center justify-center gap-2 md:gap-4">
            {/* Container de Texto com a Fonte Configurada */}
            <h1 className="flex items-center text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter select-none font-sans">
                {/* Parte 1: PP7 (Azul com Glow) */}
                <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">PP</span>
                <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">7</span>

                {/* Separador: Pontos Pulsantes */}
                <div className="flex gap-2 md:gap-3 px-2 md:px-4 items-center h-full pt-2 md:pt-4">
                    <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-purple-400 animate-pulse shadow-[0_0_10px_rgba(192,132,252,0.8)]"></div>
                    <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_rgba(232,121,249,0.8)]"
                        style={{ animationDelay: "75ms" }}
                    ></div>
                </div>

                {/* Parte 2: + (Gradiente Purple-Pink + Glow) */}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    +
                </span>

                {/* Separador 2: Pontos Invertidos */}
                <div className="flex gap-2 md:gap-3 px-2 md:px-4 items-center h-full pt-2 md:pt-4">
                    <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_rgba(232,121,249,0.8)]"
                        style={{ animationDelay: "75ms" }}
                    ></div>
                    <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-pink-400 animate-pulse shadow-[0_0_10px_rgba(244,114,182,0.8)]"
                        style={{ animationDelay: "150ms" }}
                    ></div>
                </div>

                {/* Parte 3: IAS S maiúsculo em azul) */}
                <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">iAS</span>
            </h1>
        </div>
    );
}
