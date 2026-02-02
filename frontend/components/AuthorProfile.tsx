export default function AuthorProfile() {
    return (
        <div className="flex flex-col justify-center">

            {/* Name and Title */}
            <div className="mb-6">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                    <span className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-green bg-clip-text text-transparent">
                        Paulo Periquito
                    </span>
                </h2>
                <p className="text-xl text-brand-blue font-medium">Liderança, Gestão e Inovação</p>
            </div>

            {/* Description */}
            <div className="space-y-4 text-text-secondary">
                <p className="text-base leading-relaxed">
                    Executivo com mais de quatro décadas de experiência em grandes corporações. Hoje, aos{" "}
                    <span className="text-white font-semibold">79 anos</span>, atua como mentor e investidor, unindo a
                    sabedoria da gestão tradicional com o potencial da Inteligência Artificial.
                </p>
            </div>
        </div>
    );
}
