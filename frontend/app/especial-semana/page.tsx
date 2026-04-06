import BentoGridEspecialSemana from "@/components/BentoGridEspecialSemana";
import Footer from "@/components/Footer";
import Navbar from "@/components/Header";

export default function EspecialSemanaPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-amber-500/20 via-yellow-500/10 to-transparent dark:from-amber-500/15 dark:via-yellow-500/8" />
            <Navbar />
            <main>
                <BentoGridEspecialSemana />
            </main>
            <Footer />
        </div>
    );
}
