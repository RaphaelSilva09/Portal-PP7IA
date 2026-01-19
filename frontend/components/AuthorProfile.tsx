export default function AuthorProfile() {
    return (
        <div className="max-w-lg mx-auto lg:mx-0">
            {/* Image */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto lg:mx-0 mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-blue/30 via-brand-purple/30 to-brand-green/30 blur-xl" />
                <div className="relative w-full h-full rounded-4xl overflow-hidden border-2 border-white/10">
                    {/* Placeholder SVG */}
                    <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full bg-gradient-to-br from-brand-purple/20 to-brand-blue/20"
                    >
                        <circle cx="100" cy="80" r="30" fill="rgba(255, 255, 255, 0.1)" />
                        <path d="M 50 150 Q 100 120 150 150 L 150 200 L 50 200 Z" fill="rgba(255, 255, 255, 0.1)" />
                    </svg>
                </div>
            </div>

            {/* Name and Title */}
            <div className="text-center lg:text-left mb-6">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                    <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">
                        Paulo Periquito
                    </span>
                </h2>
                <p className="text-xl text-brand-blue font-medium">Liderança, Gestão e Inovação</p>
            </div>

            {/* Description */}
            <div className="space-y-4 text-text-secondary text-center lg:text-left">
                <p className="text-base leading-relaxed">
                    Executivo com mais de quatro décadas de experiência em grandes corporações. Hoje, aos{" "}
                    <span className="text-white font-semibold">79 anos</span>, atua como mentor e investidor, unindo a
                    sabedoria da gestão tradicional com o potencial da Inteligência Artificial.
                </p>
            </div>
        </div>
    );
}
