"use client";

import {
    Author,
    BentoGrid,
    Declaracoes,
    Footer,
    HeroSection,
    IASParceiras,
    Navbar,
    QuemSomosEquipe,
    WhyPP7IASSection,
} from "@/components";
import { useSession } from "@/context/SessionContext";

export default function Home() {
    const { user } = useSession();

    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação (barra de aviso embutida abaixo) */}
            <Navbar />

            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Quem Somos + Equipe Unificado — apenas deslogado */}
            {!user && <QuemSomosEquipe />}

            {/* 3. Declarações - Propósito, Visão, Problema, Solução, Para Quem — apenas deslogado */}
            {!user && <Declaracoes />}

            {/* 6. Bento Grid com 7 blocos de conteúdo */}
            <BentoGrid />

            {/* 7. Por Que "PP7+IAS" - Explicação do nome do portal — apenas deslogado */}
            {!user && <WhyPP7IASSection />}

            {/* 8. Author Section — apenas deslogado */}
            {!user && <Author />}

            {/* 9. As 7 IAs Parceiras */}
            <IASParceiras />

            {/* 10. Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
