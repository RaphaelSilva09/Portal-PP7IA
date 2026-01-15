import { Author, BentoGrid, Footer, HeroSection, Navbar } from "@/components";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação */}
            <Navbar />

            {/* Hero Section */}
            <HeroSection />

            {/* Author Section */}
            <Author />

            {/* Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
