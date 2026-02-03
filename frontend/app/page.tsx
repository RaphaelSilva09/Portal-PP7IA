import { Author, BentoGrid, Footer, HeroSection, Navbar, QuemSomosContent, WelcomeBanner } from "@/components";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação */}
            <Navbar />

            {/* Hero Section */}
            <HeroSection />

            {/* Welcome Banner - Primeira Edição Oficial */}
            <WelcomeBanner />

            {/* Author Section */}
            <Author />

            {/* Quem Somos */}
            <QuemSomosContent />

            {/* Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
