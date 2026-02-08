"use client";

export default function QuemSomosTitulo() {
    return (
        <section id="quemsomos" className="pt-12 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
                {/* ============================================
                HERO - O QUE É
                ============================================ */}
                <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-40 mb-2">

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center text-center ">

                        {/* Títulos e Descrição */}
                        <div className="flex flex-col items-center gap-1">
                            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                                Quem Somos{" "}
                                <span className="bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                    Nós
                                </span>
                            </h3>
                            <p className="text-gray-400 text-base sm:text-2xl max-w-2xl mx-auto tracking-tight px-4">
                                Plataforma de curadoria que combina{" "}
                                <span className="text-brand-blue font-semibold">40+ anos de liderança executiva</span> com{" "}
                                <span className="text-brand-purple font-semibold">7 inteligências artificiais</span>
                            </p>
                            <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto tracking-tight px-4 mt-4">
                                Conteúdo organizado em 7 blocos principais, publicando só o que foi testado e funciona
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
