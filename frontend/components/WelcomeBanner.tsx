export default function WelcomeBanner() {
    return (
        <section className="relative py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="glass-card p-6 sm:p-8 text-center bg-brand-green/5 border-brand-green/20 shadow-glow-green-sm">
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold md:mb-8 mb-4">
                        🎉 Bem-vindos à Primeira Edição Oficial do Novo Portal!
                    </h2>

                    {/* Message */}
                    <p className="text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed text-left">
                        <span className="text-brand-green font-medium">Não mais em versão beta.</span>{" "}
                        Você está acessando um espaço criado para compartilhar conhecimento prático, testado e vivido.{" "}
                        Aqui, <span className="text-brand-purple font-medium">7 IAs colaboram</span>, mas{" "}
                        <span className="text-brand-blue font-medium">pessoas decidem</span>.
                    </p>

                    {/* Quote */}
                    <blockquote className="mt-4 pl-4 border-l-2 border-brand-green/50 text-text-primary italic text-sm sm:text-base text-left">
                        "Menos ruído, mais clareza."
                    </blockquote>
                </div>
            </div>
        </section>
    );
}
