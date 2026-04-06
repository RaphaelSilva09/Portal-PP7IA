import BentoGridEstudar from "@/components/BentoGridEstudar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Header";

export default function EstudarPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-cyan-500/20 via-blue-500/10 to-transparent dark:from-cyan-500/15 dark:via-blue-500/8" />
            <Navbar />
            <main>
                <BentoGridEstudar />
            </main>
            <Footer />
        </div>
    );
}
