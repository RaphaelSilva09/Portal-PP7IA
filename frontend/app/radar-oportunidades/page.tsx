import BentoGridRadar from "@/components/BentoGridRadar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Header";

export default function RadarOportunidadesPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-orange-500/20 via-red-500/10 to-transparent dark:from-orange-500/15 dark:via-red-500/8" />
            <Navbar />
            <main>
                <BentoGridRadar />
            </main>
            <Footer />
        </div>
    );
}
