import { BentoGridEspecialSemana, Footer, Navbar } from "@/components";

export default function EspecialSemanaPage() {
    return (
        <div className="min-h-screen bg-bg-primary text-white">
            <Navbar />
            <main className="pt-20">
                <BentoGridEspecialSemana />
            </main>
            <Footer />
        </div>
    );
}
