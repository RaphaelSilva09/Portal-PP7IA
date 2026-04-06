import BentoGrid from "@/components/BentoGridConteudo";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import IASParceiras from "@/components/IASParceiras";
import Navbar from "@/components/Header";

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <HeroSection />
            <BentoGrid />
            <IASParceiras />
            <Footer />
        </main>
    );
}
