import { BentoGridEstudar, Footer, Navbar } from "@/components";

export default function EstudarPage() {
    return (
        <div className="min-h-screen bg-bg-primary text-white">
            <Navbar />
            <main className="pt-20">
                <BentoGridEstudar />
            </main>
            <Footer />
        </div>
    );
}
