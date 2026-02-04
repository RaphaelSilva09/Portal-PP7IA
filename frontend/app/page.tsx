import {
    Author,
    BentoGrid,
    Declaracoes,
    Footer,
    HeroSection,
    IASParceiras,
    Navbar,
    QuemSomosEquipe,
    WelcomeBanner,
    WhyPP7IASSection,
} from "@/components";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação */}
            <Navbar />

            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Quem Somos + Equipe Unificado */}
            <QuemSomosEquipe />

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12 pb-"></div>
            <div className="pb-8"></div>
            {/* 3. Welcome Banner - Primeira Edição Oficial */}
            <WelcomeBanner />
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12"></div>
            {/* 4. Declarações - Propósito, Visão, Problema, Solução, Para Quem */}
            <Declaracoes />

            {/* 5. Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* 6. Por Que "PP7+IAS" - Explicação do nome do portal */}
            <WhyPP7IASSection />

            {/* 7. Author Section */}
            <Author />

            {/* 8. As 7 IAs Parceiras */}
            <IASParceiras />

            {/* 9. Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
