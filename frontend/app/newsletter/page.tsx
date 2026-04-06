import BentoGridNewsletter from "@/components/BentoGridNewsletter";
import Footer from "@/components/Footer";
import Navbar from "@/components/Header";

export default function Home() {
    return (
        <main className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-blue-500/20 via-purple-500/10 to-transparent dark:from-blue-500/15 dark:via-purple-500/8" />
            {/* Navbar com 7 links de navegação */}
            <Navbar />

            {/* Bento Grid com 7 blocos de conteúdo */}
            <BentoGridNewsletter />

            {/* Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
