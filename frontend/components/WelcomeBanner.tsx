export default function WelcomeBanner() {
    return (
        <section className="relative py-8 sm:py-12 md:pt-4 md:pb-0 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="glass-card p-6 sm:p-8 text-center bg-brand-green/5 border-brand-green/20 shadow-glow-green-sm">
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold md:mb-8 mb-4">
                        🎉 Bem-vindos à Versão Oficial do Portal!
                    </h2>

                    {/* Prominent Instructions CTA for 80+ audience */}
                    <div className="mt-4 flex justify-center">
                        <a
                            href="#instructions"
                            className="w-full max-w-xl inline-flex items-center justify-center gap-3 px-6 py-4 bg-yellow-400 text-black text-lg sm:text-xl font-semibold rounded-2xl shadow-2xl border-2 border-yellow-500 hover:scale-105 transform-gpu transition-all duration-200"
                            aria-label="Abrir instruções de uso"
                        >
                            <span className="text-2xl">📋</span>
                            <span>Instruções — Clique aqui</span>
                        </a>
                    </div>

                    {/* Message */}
                    <p className="mt-6 text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed text-left">
                        <span className="text-brand-green font-medium">Não mais em versão beta.</span> Você está
                        acessando um espaço criado para compartilhar conhecimento prático, testado e vivido. Aqui,{" "}
                        <span className="text-brand-blue font-medium">7 IAs colaboram</span>, mas{" "}
                        <span className="text-brand-blue font-medium">pessoas decidem</span>.
                    </p>

                    {/* Quote */}
                    <blockquote className="mt-4 pl-4 border-l-2 border-brand-green/50 text-text-primary italic text-sm sm:text-base text-left">
                        &ldquo;Menos ruído, mais clareza.&rdquo;
                    </blockquote>
                </div>
            </div>
        </section>
    );
}
