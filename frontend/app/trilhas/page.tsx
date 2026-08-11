import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import TrilhasClient from "@/components/TrilhasClient";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Trilhas de Leitura · PP7+IAS",
    description: "Roteiros editoriais guiados: sequências de leitura com um objetivo, do começo ao fim.",
};

export default function TrilhasPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className={`${portalContentClass} py-8`}>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Portal
                </Link>

                <div className="mt-8 mb-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        Percursos guiados
                    </p>
                    <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                        Trilhas de leitura.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Sequências curadas de conteúdos do portal, com um objetivo — do primeiro passo ao último.
                    </p>
                </div>

                <TrilhasClient />
            </main>

            <Footer />
        </div>
    );
}
