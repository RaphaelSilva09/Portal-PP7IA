import { BentoGrid, Footer, HeroSection, Navbar, TechStack } from "@/components";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação */}
            <Navbar />

            {/* Hero Section */}
            <HeroSection />

            {/* Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* Tech Stack com 7 tecnologias */}
            <TechStack />

            {/* Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
