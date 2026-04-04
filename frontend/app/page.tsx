"use client";

import {
    BentoGrid,
    Footer,
    HeroSection,
    IASParceiras,
    Navbar,
} from "@/components";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação (barra de aviso embutida abaixo) */}
            <Navbar />

            {/* 1. Hero Section */}
            <HeroSection />

            {/* 6. Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* 9. As 7 IAs Parceiras */}
            <IASParceiras />

            {/* 10. Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
