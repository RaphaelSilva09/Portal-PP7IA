import { BentoGrid, Footer, HeroSection, IASParceiras, Navbar } from "@/components";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-bg-primary">
            <Navbar />
            <HeroSection />
            <BentoGrid />
            <IASParceiras />
            <Footer />
        </main>
    );
}
