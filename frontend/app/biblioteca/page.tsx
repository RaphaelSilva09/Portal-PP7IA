import { BentoGridBiblioteca, Footer, Navbar } from "@/components";

export default function BibliotecaPage() {
    return (
        <div className="min-h-screen bg-bg-primary text-white">
            <Navbar />
            <main className="pt-20">
                <BentoGridBiblioteca />
            </main>
            <Footer />
        </div>
    );
}
