import { BentoGridNewsletter, Footer, Navbar } from "@/components";

export default function Home() {
    return (
        <main className="min-h-screen bg-bg-primary">
            {/* Navbar com 7 links de navegação */}
            <Navbar />

            {/* Bento Grid com 7 blocos de conteúdo */}
            <BentoGridNewsletter />

            {/* Footer com 7 links sociais e 7 links legais */}
            <Footer />
        </main>
    );
}
