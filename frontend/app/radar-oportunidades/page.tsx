import { BentoGridRadar, Footer, Navbar } from "@/components";

export default function RadarOportunidadesPage() {
    return (
        <div className="min-h-screen bg-bg-primary text-white">
            <Navbar />
            <main className="pt-20">
                <BentoGridRadar />
            </main>
            <Footer />
        </div>
    );
}
