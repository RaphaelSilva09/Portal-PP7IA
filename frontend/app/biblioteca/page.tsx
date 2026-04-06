import BentoGridBiblioteca from "@/components/BentoGridBiblioteca";
import Footer from "@/components/Footer";
import Navbar from "@/components/Header";

export default function BibliotecaPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-purple-500/20 via-violet-500/10 to-transparent dark:from-purple-500/15 dark:via-violet-500/8" />
            <Navbar />
            <main>
                <BentoGridBiblioteca />
            </main>
            <Footer />
        </div>
    );
}
