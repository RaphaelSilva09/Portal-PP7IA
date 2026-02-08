import {
    Author,
    BentoGrid,
    Declaracoes,
    Footer,
    HeroSection,
    IASParceiras,
    InstructionsBanner,
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
            <div className="pb-8"></div>
            {/* 4. Instructions Banner - Como usar o portal */}
            <InstructionsBanner />
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12"></div>
            {/* 5. Declarações - Propósito, Visão, Problema, Solução, Para Quem */}
            <Declaracoes />

            {/* 6. Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* 7. Por Que "PP7+IAS" - Explicação do nome do portal */}
            <WhyPP7IASSection />

            {/* 8. Author Section */}
            <Author />

            {/* 9. As 7 IAs Parceiras */}
            <IASParceiras />

            {/* 10. Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
