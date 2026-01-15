"use client";

interface NewsletterCTAProps {
    title?: string;
    description?: string;
}

export default function NewsletterCTA({
    title = "Receba nossa curadoria semanal",
    description = "7 insights essenciais toda semana, direto no seu email.",
}: NewsletterCTAProps) {
    return (
        <div className="glass-card rounded-2xl p-6 sm:p-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-text-secondary text-base sm:text-2xl">{description}</p>
                </div>
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        className="flex-1 sm:w-64 px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-brand-blue transition-colors touch-target"
                    />
                    <button className="px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 touch-target whitespace-nowrap">
                        Inscrever-se
                    </button>
                </div>
            </div>
        </div>
    );
}
